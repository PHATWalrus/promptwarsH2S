import { randomUUID } from "node:crypto";
import type { Redis } from "ioredis";
import { jwtVerify, SignJWT } from "jose";
import { env } from "../env";

const encoder = new TextEncoder();

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

  await redis.set(`refresh:${refreshJti}`, subject.userId, "EX", 60 * 60 * 24 * 7);
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
  const stored = await redis.get(`refresh:${payload.jti}`);
  if (stored !== payload.sub) {
    throw new Error("Refresh token has been revoked");
  }
  await redis.del(`refresh:${payload.jti}`);
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
    await redis.del(`refresh:${payload.jti}`);
  }
}
