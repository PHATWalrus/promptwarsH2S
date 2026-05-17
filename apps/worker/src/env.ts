import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  WORKER_CONCURRENCY: z.coerce.number().int().min(1).default(5),
  ANALYSIS_TIMEOUT_MS: z.coerce.number().int().min(1000).default(120000),
  GEMINI_API_KEY: z.string().min(1),
  DEFAULT_LLM_MODEL: z
    .enum(["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-lite", "gemini-3.1-flash-lite"])
    .default("gemini-2.5-flash"),
  GEMINI_EMBEDDING_MODEL: z.string().default("gemini-embedding-001"),
  STORAGE_ENDPOINT: z.string().min(1),
  STORAGE_ACCESS_KEY: z.string().min(1),
  STORAGE_SECRET_KEY: z.string().min(1),
  STORAGE_BUCKET: z.string().min(1),
  STORAGE_REGION: z.string().default("us-east-1"),
  STORAGE_FORCE_PATH_STYLE: z.coerce.boolean().default(true),
});

export const env = envSchema.parse(process.env);
