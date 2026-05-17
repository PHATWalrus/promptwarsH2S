import { analysisJobs } from "@lexguard/db";
import type { Job } from "bullmq";
import { eq } from "drizzle-orm";
import { db } from "../lib";
import type { AnalysisJobData } from "../pipelines/analysis.pipeline";

export async function ingestJob(job: Job<AnalysisJobData>) {
  await job.updateProgress(15);
  await db
    .update(analysisJobs)
    .set({ status: "extracting", updatedAt: new Date() })
    .where(eq(analysisJobs.id, job.data.analysisJobId));
  await job.updateProgress(25);
  return {
    stage: "ingest",
    textDensity: "unknown",
    ocrNeeded: false,
    note: "Document parsing hooks are ready for pdf-parse, pdfjs-dist, mammoth, and OCR fallback.",
  };
}
