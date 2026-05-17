import { serve } from "bun";
import { createApp } from "./app";
import { env } from "./env";
import { logger } from "./middleware/logger";

const app = createApp();

serve({
  port: env.PORT,
  fetch: app.fetch,
});

logger.info({ port: env.PORT }, "LEXGUARD API listening");
