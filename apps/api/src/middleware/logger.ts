import type { MiddlewareHandler } from "hono";
import pino from "pino";

export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  redact: [
    "req.headers.authorization",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "GEMINI_API_KEY",
  ],
});

export const requestLogger: MiddlewareHandler = async (c, next) => {
  const start = performance.now();
  c.set("logger", logger);
  await next();
  logger.info(
    {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: Math.round(performance.now() - start),
    },
    "request completed",
  );
};
