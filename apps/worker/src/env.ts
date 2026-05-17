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
    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().min(1),
    WORKER_CONCURRENCY: z.coerce.number().int().min(1).default(5),
    ANALYSIS_TIMEOUT_MS: z.coerce.number().int().min(1000).default(120000),
    GEMINI_API_KEY: z.string().min(1),
    GEMINI_SEARCH_GROUNDING: stringBoolean.default(true),
    DEFAULT_LLM_MODEL: z
      .enum([
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.5-flash-lite",
        "gemini-3-flash-preview",
        "gemini-3.1-flash-lite",
      ])
      .default("gemini-2.5-flash"),
    GEMINI_EMBEDDING_MODEL: z.string().default("gemini-embedding-001"),
    STORAGE_ENDPOINT: z.string().min(1),
    STORAGE_ACCESS_KEY: z.string().min(1),
    STORAGE_SECRET_KEY: z.string().min(1),
    STORAGE_BUCKET: z.string().min(1),
    STORAGE_REGION: z.string().default("us-east-1"),
    STORAGE_FORCE_PATH_STYLE: stringBoolean.default(true),
    OCR_SERVICE_URL: z.url().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV !== "production") {
      return;
    }

    if (new URL(value.STORAGE_ENDPOINT).protocol !== "https:") {
      ctx.addIssue({
        code: "custom",
        path: ["STORAGE_ENDPOINT"],
        message: "STORAGE_ENDPOINT must use https in production",
      });
    }

    for (const field of ["GEMINI_API_KEY", "STORAGE_ACCESS_KEY", "STORAGE_SECRET_KEY"] as const) {
      if (isPlaceholderSecret(value[field])) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: `${field} must be a real production secret`,
        });
      }
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
