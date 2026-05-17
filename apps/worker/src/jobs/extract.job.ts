import { clauseExtractPrompt } from "@lexguard/ai";
import { analysisJobs, clauses, contracts } from "@lexguard/db";
import type { Job } from "bullmq";
import { eq } from "drizzle-orm";
import { env } from "../env";
import { aiClient, db } from "../lib";
import type { AnalysisJobData } from "../pipelines/analysis.pipeline";
import { loadContractDocument } from "../storage";
import { normalizeEmbedding } from "../vector";
import { parseClauseExtraction } from "./ai-output";

export async function extractJob(job: Job<AnalysisJobData>) {
  await job.updateProgress(40);
  await db
    .update(analysisJobs)
    .set({ status: "extracting", updatedAt: new Date() })
    .where(eq(analysisJobs.id, job.data.analysisJobId));
  const existing = await db
    .select()
    .from(clauses)
    .where(eq(clauses.analysisJobId, job.data.analysisJobId))
    .limit(1);
  if (existing.length === 0) {
    const [contract] = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, job.data.contractId))
      .limit(1);
    if (!contract) {
      throw new Error(`Contract ${job.data.contractId} was not found`);
    }
    const document = await loadContractDocument({
      storageKey: contract.storageKey,
      mimeType: contract.mimeType,
    });
    await db
      .update(analysisJobs)
      .set({
        analysisMetadata: JSON.stringify({
          ocrNeeded: document.ocrNeeded,
          ocrUsed: document.ocrUsed,
          textDensity: document.textDensity,
        }),
      })
      .where(eq(analysisJobs.id, job.data.analysisJobId));
    const documentText = document.text;
    if (!documentText) {
      throw new Error("Contract text extraction produced no text");
    }
    const result = await aiClient.complete({
      model: env.DEFAULT_LLM_MODEL,
      systemPrompt: clauseExtractPrompt,
      userPrompt: `Contract title: ${contract.title}\nContract type: ${contract.contractType}\nJurisdiction: ${contract.jurisdiction ?? "unknown"}\n\nDocument text:\n${documentText.slice(0, 120_000)}`,
      responseFormat: "json",
    });
    const parsed = parseClauseExtraction(result.content);
    if (parsed.clauses.length > 0) {
      await db.insert(clauses).values(
        await Promise.all(
          parsed.clauses.map(async (clause) => ({
            contractId: job.data.contractId,
            analysisJobId: job.data.analysisJobId,
            category: clause.category,
            rawText: clause.rawText,
            pageNumber: clause.pageNumber,
            spanStart: clause.spanStart,
            spanEnd: clause.spanEnd,
            isAmbiguous: clause.isAmbiguous,
            isOnesSided: clause.isOnesSided,
            riskLevel: "medium" as const,
            riskScore: 50,
            confidenceScore: clause.confidenceScore,
            embedding: normalizeEmbedding(await aiClient.embed(clause.rawText)),
          })),
        ),
      );
    }
  }
  return { stage: "extract" };
}
