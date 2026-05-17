import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { accounts, organizations, sessions, users, verifications } from "@lexguard/db";
import { authResponseSchema, type LoginInput, type RegisterInput } from "@lexguard/types";
import { betterAuth } from "better-auth";
import { bearer, jwt } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { env } from "../env";
import { issueTokenPair, revokeRefreshToken, rotateRefreshToken } from "../lib/crypto";
import { db } from "../lib/db";
import { redis } from "../lib/redis";

export const betterAuthInstance = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.API_BASE_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { users, sessions, accounts, verifications },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  plugins: [bearer(), jwt()],
});

export class AuthService {
  async register(input: RegisterInput) {
    const [organization] = await db
      .insert(organizations)
      .values({ name: input.orgName ?? `${input.email.split("@")[0]}'s organization` })
      .returning();
    if (!organization) {
      throw new Error("Unable to create organization");
    }
    const result = await betterAuthInstance.api.signUpEmail({
      body: { email: input.email, password: input.password, name: input.name ?? input.email },
    });
    const id = result.user.id;
    const [user] = await db
      .update(users)
      .set({ orgId: organization.id, name: input.name ?? result.user.name, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!user?.orgId) {
      throw new Error("Unable to create user organization membership");
    }
    const tokens = await issueTokenPair(redis, {
      userId: user.id,
      orgId: user.orgId ?? organization.id,
      role: user.role,
    });
    return authResponseSchema.parse({ user: toUserResponse(user), ...tokens });
  }

  async login(input: LoginInput) {
    const result = await betterAuthInstance.api.signInEmail({
      body: { email: input.email, password: input.password },
    });
    const [user] = await db.select().from(users).where(eq(users.id, result.user.id)).limit(1);
    if (!user?.orgId) {
      throw new Error("User is missing organization membership");
    }
    const tokens = await issueTokenPair(redis, {
      userId: user.id,
      orgId: user.orgId,
      role: user.role,
    });
    return authResponseSchema.parse({ user: toUserResponse(user), ...tokens });
  }

  async refresh(refreshToken: string) {
    const rotated = await rotateRefreshToken(redis, refreshToken);
    const [user] = await db.select().from(users).where(eq(users.id, rotated.userId)).limit(1);
    if (!user?.orgId) {
      throw new Error("User is missing organization membership");
    }
    return authResponseSchema.parse({
      user: toUserResponse(user),
      accessToken: rotated.accessToken,
      refreshToken: rotated.refreshToken,
    });
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      try {
        await revokeRefreshToken(redis, refreshToken);
      } catch {
        // Logout is intentionally idempotent so expired or malformed refresh tokens still clear the client cookie.
      }
    }
    return { ok: true };
  }
}

function toUserResponse(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    orgId: user.orgId,
  };
}

export const authService = new AuthService();
