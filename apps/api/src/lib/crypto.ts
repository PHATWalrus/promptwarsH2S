import { randomUUID } from "node:crypto";
import type { Redis } from "ioredis";
import { jwtVerify, SignJWT } from "jose";
import { env } from "../env";

const encoder = new TextEncoder();
const fallbackRefreshTokens = new Map<string, { userId: string; expiresAt: number }>();

export interface TokenSubject {
  userId: string;
  orgId: string;
  role: "user" | "admin";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function secret(value: string) {
  return encoder.encode(value);
}

export async function issueTokenPair(redis: Redis, subject: TokenSubject): Promise<TokenPair> {
  const refreshJti = randomUUID();
  const accessToken = await new SignJWT({ orgId: subject.orgId, role: subject.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(subject.userId)
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_EXPIRES)
    .sign(secret(env.JWT_ACCESS_SECRET));
  const refreshToken = await new SignJWT({
    orgId: subject.orgId,
    role: subject.role,
    kind: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(subject.userId)
    .setJti(refreshJti)
    .setIssuedAt()
    .setExpirationTime(env.JWT_REFRESH_EXPIRES)
    .sign(secret(env.JWT_REFRESH_SECRET));

  await storeRefreshToken(redis, refreshJti, subject.userId);
  return { accessToken, refreshToken };
}

export async function rotateRefreshToken(
  redis: Redis,
  refreshToken: string,
): Promise<TokenPair & TokenSubject> {
  const { payload } = await jwtVerify(refreshToken, secret(env.JWT_REFRESH_SECRET));
  if (payload.kind !== "refresh" || !payload.sub || !payload.jti) {
    throw new Error("Invalid refresh token");
  }
  const stored = await getRefreshToken(redis, payload.jti);
  if (stored !== payload.sub) {
    throw new Error("Refresh token has been revoked");
  }
  await deleteRefreshToken(redis, payload.jti);
  const subject = {
    userId: payload.sub,
    orgId: String(payload.orgId),
    role: payload.role === "admin" ? "admin" : "user",
  } satisfies TokenSubject;
  const pair = await issueTokenPair(redis, subject);
  return { ...pair, ...subject };
}

export async function verifyAccessToken(accessToken: string): Promise<TokenSubject> {
  const { payload } = await jwtVerify(accessToken, secret(env.JWT_ACCESS_SECRET));
  if (!payload.sub || typeof payload.orgId !== "string") {
    throw new Error("Invalid access token");
  }
  return {
    userId: payload.sub,
    orgId: payload.orgId,
    role: payload.role === "admin" ? "admin" : "user",
  };
}

export async function revokeRefreshToken(redis: Redis, refreshToken: string) {
  const { payload } = await jwtVerify(refreshToken, secret(env.JWT_REFRESH_SECRET));
  if (payload.jti) {
    await deleteRefreshToken(redis, payload.jti);
  }
}

async function storeRefreshToken(redis: Redis, jti: string, userId: string) {
  try {
    await redis.set(`refresh:${jti}`, userId, "EX", 60 * 60 * 24 * 7);
  } catch (error) {
    if (env.NODE_ENV === "production") {
      throw error;
    }
    fallbackRefreshTokens.set(jti, {
      userId,
      expiresAt: Date.now() + 60 * 60 * 24 * 7 * 1000,
    });
  }
}

async function getRefreshToken(redis: Redis, jti: string) {
  try {
    return await redis.get(`refresh:${jti}`);
  } catch (error) {
    if (env.NODE_ENV === "production") {
      throw error;
    }
    const fallback = fallbackRefreshTokens.get(jti);
    if (!fallback) {
      return null;
    }
    if (fallback.expiresAt <= Date.now()) {
      fallbackRefreshTokens.delete(jti);
      return null;
    }
    return fallback.userId;
  }
}

async function deleteRefreshToken(redis: Redis, jti: string) {
  try {
    await redis.del(`refresh:${jti}`);
  } catch (error) {
    if (env.NODE_ENV === "production") {
      throw error;
    }
  } finally {
    fallbackRefreshTokens.delete(jti);
  }
}
