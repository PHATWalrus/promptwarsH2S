import { describe, expect, test } from "bun:test";

describe("api app robustness", () => {
  test("basic health stays available when Redis is unavailable", async () => {
    Object.assign(process.env, {
      NODE_ENV: "test",
      PORT: "3999",
      API_VERSION: "v1",
      API_BASE_URL: "http://localhost:3999",
      ALLOWED_ORIGINS: "http://localhost:3000",
      DATABASE_URL: "postgresql://lexguard:password@localhost:5432/lexguard",
      REDIS_URL: "redis://127.0.0.1:6390",
      STORAGE_ENDPOINT: "http://localhost:9000",
      STORAGE_ACCESS_KEY: "minioadmin",
      STORAGE_SECRET_KEY: "minioadmin",
      STORAGE_BUCKET: "lexguard-contracts",
      STORAGE_REGION: "us-east-1",
      BETTER_AUTH_SECRET: "change-this-better-auth-secret-min-32-chars",
      JWT_ACCESS_SECRET: "change-this-in-production-min-32-chars",
      JWT_REFRESH_SECRET: "change-this-too-different-from-access",
      GEMINI_API_KEY: "test-key",
    });
    const [{ createApp }, { redis }, { closeAnalysisQueue }] = await Promise.all([
      import("./app"),
      import("./lib/redis"),
      import("./lib/queue"),
    ]);

    const response = await createApp().request("/api/v1/health");

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: "ok" });

    await closeAnalysisQueue();
    redis.disconnect();
  });
});
