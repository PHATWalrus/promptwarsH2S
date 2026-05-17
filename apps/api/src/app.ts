import { env } from "./env";
import { createOpenApiApp, mountOpenApi } from "./lib/openapi";
import { corsMiddleware, securityHeaders } from "./middleware/cors";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/logger";
import { rateLimit } from "./middleware/rateLimit";
import { routes } from "./routes";

export function createApp() {
  const app = createOpenApiApp();
  app.onError(errorHandler);
  app.use("*", requestLogger);
  app.use("*", securityHeaders);
  app.use("*", corsMiddleware);
  app.use("*", rateLimit(100, 60, "global"));
  app.route(`/api/${env.API_VERSION}`, routes);
  mountOpenApi(app);
  return app;
}
