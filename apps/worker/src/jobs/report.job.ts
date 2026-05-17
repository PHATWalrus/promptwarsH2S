import { analysisJobs, contracts } from "@lexguard/db";
import type { Job } from "bullmq";
import { eq } from "drizzle-orm";
import { db } from "../lib";
import type { AnalysisJobData } from "../pipelines/analysis.pipeline";

export async function reportJob(job: Job<AnalysisJobData>) {
  await job.updateProgress(100);
  await db
    .update(analysisJobs)
    .set({
      status: "done",
      summary: "LEXGUARD analysis completed with explainable clause-level risk findings.",
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(analysisJobs.id, job.data.analysisJobId));
  await db
    .update(contracts)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(contracts.id, job.data.contractId));
  return { stage: "report", done: true };
}
