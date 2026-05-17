import { afterAll, describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { accounts, organizations, users } from "@lexguard/db";
import { eq } from "drizzle-orm";

loadRootEnv();

for (const [key, value] of Object.entries({
  NODE_ENV: "test",
  PORT: "3999",
  API_VERSION: "v1",
  API_BASE_URL: "http://localhost:3999",
  ALLOWED_ORIGINS: "http://localhost:3000",
  DATABASE_URL: "postgresql://lexguard:password@localhost:5432/lexguard",
  DATABASE_MAX_CONNECTIONS: "2",
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

const [{ authService, betterAuthInstance }, { db }, { redis }] = await Promise.all([
  import("./auth.service"),
  import("../lib/db"),
  import("../lib/redis"),
]);

describe("Better Auth integration", () => {
  test("email signup can use the Drizzle auth schema", async () => {
    const email = `better-auth-${Date.now()}@example.com`;

    try {
      const result = await betterAuthInstance.api.signUpEmail({
        body: {
          email,
          password: "SuperStrongPassword123!",
          name: "Better Auth Test",
        },
      });

      expect(result.user.email).toBe(email);
    } finally {
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (user) {
        await db.delete(accounts).where(eq(accounts.userId, user.id));
        await db.delete(users).where(eq(users.id, user.id));
      }
    }
  });

  test(
    "custom register and login complete after Better Auth creates the user",
    async () => {
      const email = `lexguard-register-${Date.now()}@example.com`;
      const orgName = `LexGuard Register Test ${Date.now()}`;

      try {
        const result = await authService.register({
          email,
          password: "SuperStrongPassword123!",
          name: "LexGuard Register Test",
          orgName,
        });

        expect(result.user.email).toBe(email);
        expect(result.user.orgId).toBeTruthy();
        expect(result.accessToken).toBeTruthy();
        expect(result.refreshToken).toBeTruthy();

        const login = await authService.login({
          email,
          password: "SuperStrongPassword123!",
        });

        expect(login.user.email).toBe(email);
        expect(login.accessToken).toBeTruthy();
        expect(login.refreshToken).toBeTruthy();
      } finally {
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (user) {
          await db.delete(accounts).where(eq(accounts.userId, user.id));
          await db.delete(users).where(eq(users.id, user.id));
        }
        await db.delete(organizations).where(eq(organizations.name, orgName));
      }
    },
    15_000,
  );
});

afterAll(() => {
  redis.disconnect();
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
