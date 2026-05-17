import { z } from "zod";

const stringBoolean = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }
  if (normalized === "false") {
    return false;
  }
  return value;
}, z.boolean());

const envSchema = z
  .object({
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
    STORAGE_FORCE_PATH_STYLE: stringBoolean.default(true),
    BETTER_AUTH_SECRET: z.string().min(32),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES: z.string().default("15m"),
    JWT_REFRESH_EXPIRES: z.string().default("7d"),
    GEMINI_API_KEY: z.string().min(1),
    GEMINI_SEARCH_GROUNDING: stringBoolean.default(true),
    DEFAULT_LLM_MODEL: z
      .enum([
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.5-flash-lite",
        "gemini-3.1-flash-lite",
      ])
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
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV !== "production") {
      return;
    }

    const origins = value.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());
    if (origins.includes("*")) {
      ctx.addIssue({
        code: "custom",
        path: ["ALLOWED_ORIGINS"],
        message: "ALLOWED_ORIGINS cannot include * in production",
      });
    }

    for (const field of [
      "BETTER_AUTH_SECRET",
      "JWT_ACCESS_SECRET",
      "JWT_REFRESH_SECRET",
      "GEMINI_API_KEY",
      "STORAGE_ACCESS_KEY",
      "STORAGE_SECRET_KEY",
    ] as const) {
      if (isPlaceholderSecret(value[field])) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: `${field} must be a real production secret`,
        });
      }
    }

    if (value.JWT_ACCESS_SECRET === value.JWT_REFRESH_SECRET) {
      ctx.addIssue({
        code: "custom",
        path: ["JWT_REFRESH_SECRET"],
        message: "JWT_REFRESH_SECRET must be different from JWT_ACCESS_SECRET",
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  return envSchema.parse(source);
}

export const env = loadEnv();

function isPlaceholderSecret(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.includes("change-this") ||
    normalized.includes("placeholder") ||
    normalized === "aiza..." ||
    normalized.endsWith("...")
  );
}
