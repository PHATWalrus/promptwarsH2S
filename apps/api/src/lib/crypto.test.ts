import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import type { Redis } from "ioredis";

loadRootEnv();

for (const [key, value] of Object.entries({
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
})) {
  process.env[key] ??= value;
}

const { issueTokenPair, revokeRefreshToken, rotateRefreshToken } = await import("./crypto");

const unavailableRedis = {
  set: async () => {
    throw new Error("Redis unavailable");
  },
  get: async () => {
    throw new Error("Redis unavailable");
  },
  del: async () => {
    throw new Error("Redis unavailable");
  },
} as unknown as Redis;

describe("refresh token storage", () => {
  test("uses an in-memory fallback outside production when Redis is unavailable", async () => {
    const issued = await issueTokenPair(unavailableRedis, {
      userId: "00000000-0000-4000-8000-000000000001",
      orgId: "00000000-0000-4000-8000-000000000002",
      role: "user",
    });

    const rotated = await rotateRefreshToken(unavailableRedis, issued.refreshToken);

    expect(rotated.userId).toBe("00000000-0000-4000-8000-000000000001");
    expect(rotated.orgId).toBe("00000000-0000-4000-8000-000000000002");

    await revokeRefreshToken(unavailableRedis, rotated.refreshToken);
    await expect(rotateRefreshToken(unavailableRedis, rotated.refreshToken)).rejects.toThrow(
      "Refresh token has been revoked",
    );
  });
});

function loadRootEnv() {
  if (!existsSync(".env")) {
    return;
  }

  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }
    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
}
