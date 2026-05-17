import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

export const errorHandler: ErrorHandler = (error, c) => {
  const status = error instanceof HTTPException ? error.status : 500;
  const title = status >= 500 ? "Internal Server Error" : "Request Error";
  const detail = status >= 500 ? "An unexpected error occurred." : error.message;
  c.var.logger?.error({ error }, "request failed");
  return c.json(
    {
      type: `https://lexguard.dev/problems/${status}`,
      title,
      status,
      detail,
      instance: c.req.path,
    },
    status,
  );
};
