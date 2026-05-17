import { Queue, Worker } from "bullmq";
import { env } from "./env";
import {
  type AnalysisJobData,
  type AnalysisStage,
  getNextStage,
  runAnalysisStage,
} from "./pipelines/analysis.pipeline";

const connection = { url: env.REDIS_URL };
const queue = new Queue<AnalysisJobData>("analysis", { connection });
const deadLetterQueue = new Queue<AnalysisJobData>("analysis-dead-letter", { connection });

const worker = new Worker<AnalysisJobData>(
  "analysis",
  async (job) => {
    const stage = (job.data.stage ?? job.name) as AnalysisStage;
    const result = await runAnalysisStage(job);
    const next = getNextStage(stage);
    if (next) {
      await queue.add(
        next,
        { ...job.data, stage: next },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
        },
      );
    }
    return result;
  },
  {
    connection,
    concurrency: env.WORKER_CONCURRENCY,
    lockDuration: env.ANALYSIS_TIMEOUT_MS,
  },
);

worker.on("failed", async (job, error) => {
  if (job && job.attemptsMade >= 3) {
    await deadLetterQueue.add("failed-analysis-stage", job.data, { removeOnComplete: false });
  }
  console.error({ jobId: job?.id, error }, "analysis job failed");
});

async function shutdown() {
  await worker.close();
  await queue.close();
  await deadLetterQueue.close();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

console.info({ concurrency: env.WORKER_CONCURRENCY }, "LEXGUARD worker started");
