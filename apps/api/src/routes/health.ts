import { sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../lib/db";
import { getAnalysisQueue } from "../lib/queue";
import { redis } from "../lib/redis";
import { storageService } from "../services/storage.service";

export const healthRoutes = new Hono();

healthRoutes.get("/", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

healthRoutes.get("/deep", async (c) => {
  const [database, redisHealth, queue, storage] = await Promise.allSettled([
    db.execute(sql`select 1`),
    redis.ping(),
    getAnalysisQueue().getJobCounts(),
    storageService.healthCheck(),
  ]);
  const ok =
    database.status === "fulfilled" &&
    redisHealth.status === "fulfilled" &&
    queue.status === "fulfilled" &&
    storage.status === "fulfilled";

  return c.json(
    {
      status: ok ? "ok" : "degraded",
      services: {
        database: database.status === "fulfilled" ? "ok" : "degraded",
        redis:
          redisHealth.status === "fulfilled" && redisHealth.value === "PONG" ? "ok" : "degraded",
        queue: queue.status === "fulfilled" ? queue.value : "degraded",
        storage: storage.status === "fulfilled" ? storage.value : "degraded",
      },
    },
    ok ? 200 : 503,
  );
});
