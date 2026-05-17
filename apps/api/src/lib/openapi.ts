import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { Env } from "hono";
import { env } from "../env";

export function createOpenApiApp<E extends Env = Env>() {
  return new OpenAPIHono<E>({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          {
            type: "https://lexguard.dev/problems/validation-error",
            title: "Validation Error",
            status: 400,
            detail: result.error.message,
            instance: c.req.path,
          },
          400,
        );
      }
    },
  });
}

export function mountOpenApi(app: OpenAPIHono) {
  app.doc("/openapi.json", {
    openapi: "3.1.0",
    info: {
      title: "LEXGUARD API",
      version: "0.1.0",
      description: "AI rights and contract intelligence backend API.",
    },
  });

  if (env.NODE_ENV === "development") {
    app.get("/docs", swaggerUI({ url: "/openapi.json" }));
  }
}
