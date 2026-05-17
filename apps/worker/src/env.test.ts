import { describe, expect, test } from "bun:test";

const validProductionEnv = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://lexguard:strong-password@postgres:5432/lexguard",
  REDIS_URL: "redis://redis:6379",
  WORKER_CONCURRENCY: "5",
  ANALYSIS_TIMEOUT_MS: "120000",
  GEMINI_API_KEY: "gemini-api-key",
  GEMINI_SEARCH_GROUNDING: "true",
  DEFAULT_LLM_MODEL: "gemini-2.5-flash",
  GEMINI_EMBEDDING_MODEL: "gemini-embedding-001",
  STORAGE_ENDPOINT: "https://account-id.r2.cloudflarestorage.com",
  STORAGE_ACCESS_KEY: "r2-access-key",
  STORAGE_SECRET_KEY: "r2-secret-key",
  STORAGE_BUCKET: "lexguard-contracts",
  STORAGE_REGION: "auto",
  STORAGE_FORCE_PATH_STYLE: "false",
  OCR_SERVICE_URL: "https://ocr.lexguard.example/extract",
};

Object.assign(process.env, validProductionEnv);

const { loadEnv } = await import("./env");

describe("worker production env validation", () => {
  test("accepts Gemini search grounding configuration", () => {
    expect(loadEnv(validProductionEnv).GEMINI_SEARCH_GROUNDING).toBe(true);
  });

  test("rejects placeholder Gemini API keys in production", () => {
    expect(() =>
      loadEnv({
        ...validProductionEnv,
        GEMINI_API_KEY: "AIza...",
      }),
    ).toThrow(/GEMINI_API_KEY/);
  });

  test("rejects insecure production storage endpoints", () => {
    expect(() =>
      loadEnv({
        ...validProductionEnv,
        STORAGE_ENDPOINT: "http://account-id.r2.cloudflarestorage.com",
      }),
    ).toThrow(/STORAGE_ENDPOINT/);
  });
});
