import { privacyAnalysisPrompt } from "@lexguard/ai";
import { analysisJobs, clauses } from "@lexguard/db";
import type { Job } from "bullmq";
import { eq } from "drizzle-orm";
import { env } from "../env";
import { aiClient, db } from "../lib";
import type { AnalysisJobData } from "../pipelines/analysis.pipeline";
import { parsePrivacyAnalysis } from "./ai-output";

export async function privacyJob(job: Job<AnalysisJobData>) {
  await job.updateProgress(72);
  const rows = await db
    .select()
    .from(clauses)
    .where(eq(clauses.analysisJobId, job.data.analysisJobId));
  const flags = rows
    .filter((clause) => ["data_sharing", "confidentiality"].includes(clause.category))
    .map(
      (clause) =>
        `Review ${clause.category} clause for cross-border transfers, retention, and consent.`,
    );
  if (rows.length > 0) {
    const result = await aiClient.complete({
      model: env.DEFAULT_LLM_MODEL,
      systemPrompt: privacyAnalysisPrompt,
      userPrompt: JSON.stringify({
        clauses: rows.map((clause) => ({ category: clause.category, rawText: clause.rawText })),
      }),
      responseFormat: "json",
    });
    flags.push(...parsePrivacyAnalysis(result.content).flags);
  }
  await db
    .update(analysisJobs)
    .set({ privacyFlags: JSON.stringify(flags), updatedAt: new Date() })
    .where(eq(analysisJobs.id, job.data.analysisJobId));
  return { stage: "privacy", flags };
}
