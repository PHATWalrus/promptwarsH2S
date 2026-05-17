import { Queue } from "bullmq";
import { env } from "../env";

export const ANALYSIS_QUEUE = "analysis";

let analysisQueue: Queue | undefined;

export function getAnalysisQueue() {
  analysisQueue ??= new Queue(ANALYSIS_QUEUE, {
    connection: {
      url: env.REDIS_URL,
      connectTimeout: 500,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 2,
      retryStrategy: () => null,
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: { age: 60 * 60 * 24, count: 1000 },
      removeOnFail: false,
    },
  });
  return analysisQueue;
}

export async function closeAnalysisQueue() {
  await analysisQueue?.close();
  analysisQueue = undefined;
}
