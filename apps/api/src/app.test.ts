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

  test("applies security headers and only echoes configured CORS origins", async () => {
    Object.assign(process.env, {
      NODE_ENV: "test",
      PORT: "3999",
      API_VERSION: "v1",
      API_BASE_URL: "http://localhost:3999",
      ALLOWED_ORIGINS: "https://lexguard.example",
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
    const app = createApp();

    const allowed = await app.request("/api/v1/health", {
      headers: { Origin: "http://localhost:3000" },
    });
    const blocked = await app.request("/api/v1/health", {
      headers: { Origin: "https://evil.example" },
    });

    expect(allowed.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");
    expect(blocked.headers.get("access-control-allow-origin")).toBeNull();
    expect(allowed.headers.get("x-content-type-options")).toBe("nosniff");
    expect(allowed.headers.get("x-frame-options")).toBe("DENY");
    expect(allowed.headers.get("strict-transport-security")).toContain("max-age=63072000");

    await closeAnalysisQueue();
    redis.disconnect();
  });

  test("logout revokes the refresh cookie without requiring a valid access token", async () => {
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

    const response = await createApp().request("/api/v1/auth/logout", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "lexguard_refresh=invalid-but-present-refresh-token",
      },
      body: "{}",
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("lexguard_refresh=");

    await closeAnalysisQueue();
    redis.disconnect();
  });

  test("protected feature routes reject anonymous requests before reaching tenant data", async () => {
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
    const app = createApp();

    const routes = [
      ["/api/v1/contracts", "GET"],
      ["/api/v1/analysis/00000000-0000-4000-8000-000000000001/status", "GET"],
      ["/api/v1/clauses/search?query=liability", "GET"],
      ["/api/v1/chat/00000000-0000-4000-8000-000000000001/history", "GET"],
      ["/api/v1/reports/00000000-0000-4000-8000-000000000001", "GET"],
      ["/api/v1/compare", "POST"],
    ] as const;

    for (const [path, method] of routes) {
      const response = await app.request(path, {
        method,
        headers: method === "POST" ? { "content-type": "application/json" } : undefined,
        body:
          method === "POST"
            ? JSON.stringify({
                contractIds: [
                  "00000000-0000-4000-8000-000000000001",
                  "00000000-0000-4000-8000-000000000002",
                ],
              })
            : undefined,
      });
      expect(response.status).toBe(401);
    }

    await closeAnalysisQueue();
    redis.disconnect();
  });
});
