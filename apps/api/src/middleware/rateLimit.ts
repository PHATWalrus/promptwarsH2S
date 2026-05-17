import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { redis } from "../lib/redis";
import { createMemoryRateLimitStore } from "./rateLimitStore";

const fallbackStore = createMemoryRateLimitStore();

export function rateLimit(
  limit: number,
  windowSeconds: number,
  keyPrefix: string,
): MiddlewareHandler {
  return async (c, next) => {
    const user = c.var.user as { id?: string } | undefined;
    const forwardedFor = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
    const identity = user?.id ?? forwardedFor ?? "unknown";
    const bucket = Math.floor(Date.now() / 1000 / windowSeconds);
    const key = `rate:${keyPrefix}:${identity}:${bucket}`;
    const count = await incrementRateLimitBucket(key, windowSeconds);
    c.header("X-RateLimit-Limit", String(limit));
    c.header("X-RateLimit-Remaining", String(Math.max(0, limit - count)));
    if (count > limit) {
      throw new HTTPException(429, { message: "Rate limit exceeded" });
    }
    await next();
  };
}

async function incrementRateLimitBucket(key: string, windowSeconds: number) {
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    return count;
  } catch (error) {
    fallbackStore.sweep();
    const reason = error instanceof Error ? error.message : "unknown Redis error";
    console.warn(`Redis rate limit unavailable for ${key}; using in-memory fallback: ${reason}`);
    return fallbackStore.increment(key, windowSeconds);
  }
}
