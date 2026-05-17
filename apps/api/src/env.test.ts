import { describe, expect, test } from "bun:test";

const validProductionEnv = {
  NODE_ENV: "production",
  PORT: "3001",
  API_VERSION: "v1",
  API_BASE_URL: "https://api.lexguard.example",
  ALLOWED_ORIGINS: "https://lexguard.example",
  DATABASE_URL: "postgresql://lexguard:strong-password@postgres:5432/lexguard",
  DATABASE_MAX_CONNECTIONS: "20",
  REDIS_URL: "redis://redis:6379",
  REDIS_KEY_PREFIX: "lexguard:",
  STORAGE_ENDPOINT: "https://account-id.r2.cloudflarestorage.com",
  STORAGE_ACCESS_KEY: "r2-access-key",
  STORAGE_SECRET_KEY: "r2-secret-key",
  STORAGE_BUCKET: "lexguard-contracts",
  STORAGE_REGION: "auto",
  STORAGE_FORCE_PATH_STYLE: "false",
  BETTER_AUTH_SECRET: "better-auth-secret-with-at-least-32-chars",
  JWT_ACCESS_SECRET: "jwt-access-secret-with-at-least-32-chars",
  JWT_REFRESH_SECRET: "jwt-refresh-secret-with-at-least-32-chars",
  JWT_ACCESS_EXPIRES: "15m",
  JWT_REFRESH_EXPIRES: "7d",
  GEMINI_API_KEY: "gemini-api-key",
  GEMINI_SEARCH_GROUNDING: "true",
  DEFAULT_LLM_MODEL: "gemini-2.5-flash",
  GEMINI_EMBEDDING_MODEL: "gemini-embedding-001",
  CRAWL_PROVIDER: "manual",
  RATE_LIMIT_UPLOAD_PER_HOUR: "10",
  RATE_LIMIT_CHAT_PER_HOUR: "30",
  WORKER_CONCURRENCY: "5",
  ANALYSIS_TIMEOUT_MS: "120000",
};

Object.assign(process.env, validProductionEnv);

const { loadEnv } = await import("./env");

describe("api production env validation", () => {
  test("accepts a production-ready environment", () => {
    expect(loadEnv(validProductionEnv).GEMINI_SEARCH_GROUNDING).toBe(true);
  });

  test("rejects wildcard CORS in production", () => {
    expect(() => loadEnv({ ...validProductionEnv, ALLOWED_ORIGINS: "*" })).toThrow(
      /ALLOWED_ORIGINS/,
    );
  });

  test("rejects placeholder production secrets", () => {
    expect(() =>
      loadEnv({
        ...validProductionEnv,
        JWT_ACCESS_SECRET: "change-this-in-production-min-32-chars",
      }),
    ).toThrow(/JWT_ACCESS_SECRET/);
  });

  test("rejects identical JWT access and refresh secrets", () => {
    expect(() =>
      loadEnv({
        ...validProductionEnv,
        JWT_REFRESH_SECRET: validProductionEnv.JWT_ACCESS_SECRET,
      }),
    ).toThrow(/JWT_REFRESH_SECRET/);
  });
});
