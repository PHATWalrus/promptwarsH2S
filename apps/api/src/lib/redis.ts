import Redis from "ioredis";
import { env } from "../env";

export const redis = new Redis(env.REDIS_URL, {
  connectTimeout: 500,
  enableOfflineQueue: false,
  keyPrefix: env.REDIS_KEY_PREFIX,
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  retryStrategy: () => null,
});

redis.on("error", () => {
  // Redis-backed features fail open at call sites; avoid noisy unhandled client errors.
});
