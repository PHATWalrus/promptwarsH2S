import type { Job } from "bullmq";

export const ANALYSIS_PIPELINE_STAGES = [
  "ingest",
  "extract",
  "risk",
  "privacy",
  "explain",
  "report",
] as const;

export type AnalysisStage = (typeof ANALYSIS_PIPELINE_STAGES)[number];

export type AnalysisJobData = {
  contractId: string;
  analysisJobId: string;
  stage?: AnalysisStage;
};

export function getNextStage(stage: AnalysisStage) {
  const index = ANALYSIS_PIPELINE_STAGES.indexOf(stage);
  return ANALYSIS_PIPELINE_STAGES[index + 1] ?? null;
}

export async function runAnalysisStage(job: Job<AnalysisJobData>) {
  const stage = (job.data.stage ?? job.name) as AnalysisStage;
  switch (stage) {
    case "ingest": {
      const { ingestJob } = await import("../jobs/ingest.job");
      return ingestJob(job);
    }
    case "extract": {
      const { extractJob } = await import("../jobs/extract.job");
      return extractJob(job);
    }
    case "risk": {
      const { riskJob } = await import("../jobs/risk.job");
      return riskJob(job);
    }
    case "privacy": {
      const { privacyJob } = await import("../jobs/privacy.job");
      return privacyJob(job);
    }
    case "explain": {
      const { explainJob } = await import("../jobs/explain.job");
      return explainJob(job);
    }
    case "report": {
      const { reportJob } = await import("../jobs/report.job");
      return reportJob(job);
    }
  }
}
