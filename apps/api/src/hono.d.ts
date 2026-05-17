import type { TenantScope } from "@lexguard/db";
import type { Logger } from "pino";
import type { AuthUser } from "./middleware/auth";

declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser;
    tenant: TenantScope;
    logger: Logger;
  }
}
