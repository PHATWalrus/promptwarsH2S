import { GeminiLLMClient, type LLMModel } from "@lexguard/ai";
import { aiUsageLog } from "@lexguard/db";
import { env } from "../env";
import { db } from "../lib/db";

export const aiClient = new GeminiLLMClient(env.GEMINI_API_KEY, env.GEMINI_EMBEDDING_MODEL);

export async function recordAiUsage(input: {
  userId?: string;
  orgId?: string;
  contractId?: string;
  jobType: string;
  model: string;
  tokensUsed: number;
  cost: number;
}) {
  await db.insert(aiUsageLog).values({
    userId: input.userId,
    orgId: input.orgId,
    contractId: input.contractId,
    jobType: input.jobType,
    model: input.model,
    totalTokens: input.tokensUsed,
    costUsdCents: Math.round(input.cost * 100),
  });
}

export function defaultModel(): LLMModel {
  return env.DEFAULT_LLM_MODEL;
}
