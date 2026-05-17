import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  API_VERSION: z.string().default("v1"),
  API_BASE_URL: z.url().default("http://localhost:3001"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  DATABASE_MAX_CONNECTIONS: z.coerce.number().int().min(1).default(20),
  REDIS_URL: z.string().min(1),
  REDIS_KEY_PREFIX: z.string().default("lexguard:"),
  STORAGE_ENDPOINT: z.string().min(1),
  STORAGE_ACCESS_KEY: z.string().min(1),
  STORAGE_SECRET_KEY: z.string().min(1),
  STORAGE_BUCKET: z.string().min(1),
  STORAGE_REGION: z.string().default("us-east-1"),
  STORAGE_FORCE_PATH_STYLE: z.coerce.boolean().default(true),
  BETTER_AUTH_SECRET: z.string().min(32),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),
  GEMINI_API_KEY: z.string().min(1),
  DEFAULT_LLM_MODEL: z
    .enum(["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-lite", "gemini-3.1-flash-lite"])
    .default("gemini-2.5-flash"),
  GEMINI_EMBEDDING_MODEL: z.string().default("gemini-embedding-001"),
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  FIRECRAWL_API_KEY: z.string().optional(),
  CRAWL_PROVIDER: z.enum(["cloudflare", "firecrawl", "manual"]).default("cloudflare"),
  RATE_LIMIT_UPLOAD_PER_HOUR: z.coerce.number().int().min(1).default(10),
  RATE_LIMIT_CHAT_PER_HOUR: z.coerce.number().int().min(1).default(30),
  WORKER_CONCURRENCY: z.coerce.number().int().min(1).default(5),
  ANALYSIS_TIMEOUT_MS: z.coerce.number().int().min(1000).default(120000),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  return envSchema.parse(source);
}

export const env = loadEnv();
