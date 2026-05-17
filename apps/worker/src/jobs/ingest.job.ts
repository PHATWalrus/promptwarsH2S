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
    ...assessExtractionQuality({ mimeType: null, extractedText: null }),
    note: "Document parsing and OCR fallback are tracked for downstream analysis.",
  };
}

export function assessExtractionQuality(input: {
  mimeType: string | null;
  extractedText: string | null;
}) {
  const text = input.extractedText?.trim() ?? "";
  const textDensity = text.length === 0 ? "empty" : text.length < 24 ? "sparse" : "readable";
  const ocrNeeded = input.mimeType === "application/pdf" && textDensity === "empty";
  return { ocrNeeded, ocrUsed: false, textDensity };
}
