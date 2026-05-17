import { explainPrompt } from "@lexguard/ai";
import { analysisJobs, clauses } from "@lexguard/db";
import type { Job } from "bullmq";
import { eq } from "drizzle-orm";
import { env } from "../env";
import { aiClient, db } from "../lib";
import type { AnalysisJobData } from "../pipelines/analysis.pipeline";
import { parseExplanations } from "./ai-output";

export async function explainJob(job: Job<AnalysisJobData>) {
  await job.updateProgress(88);
  await db
    .update(analysisJobs)
    .set({ status: "explaining", updatedAt: new Date() })
    .where(eq(analysisJobs.id, job.data.analysisJobId));
  const rows = await db
    .select()
    .from(clauses)
    .where(eq(clauses.analysisJobId, job.data.analysisJobId));
  const result =
    rows.length > 0
      ? await aiClient.complete({
          model: env.DEFAULT_LLM_MODEL,
          systemPrompt: explainPrompt,
          userPrompt: JSON.stringify({
            clauses: rows.map((clause) => ({
              rawText: clause.rawText,
              category: clause.category,
              riskLevel: clause.riskLevel,
              riskRationale: clause.riskRationale,
            })),
          }),
          responseFormat: "json",
        })
      : null;
  const explanations = result ? parseExplanations(result.content).clauses : [];
  for (const clause of rows) {
    const explanation = explanations.find((item) => item.rawText === clause.rawText);
    await db
      .update(clauses)
      .set({
        plainExplanation:
          explanation?.plainExplanation ??
          clause.plainExplanation ??
          "This clause may affect your rights or obligations and should be reviewed before signing.",
        scenarioIllustration:
          explanation?.scenarioIllustration ??
          clause.scenarioIllustration ??
          "In a real dispute, this clause could shift leverage away from you.",
        negotiationTips: explanation?.negotiationTips ??
          clause.negotiationTips ?? [
            "Ask for narrower wording.",
            "Request a balanced remedy or carve-out.",
          ],
      })
      .where(eq(clauses.id, clause.id));
  }
  return { stage: "explain" };
}
