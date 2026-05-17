import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

export const tenantIsolation: MiddlewareHandler = async (c, next) => {
  const user = c.var.user as { orgId?: string } | undefined;
  if (!user?.orgId) {
    throw new HTTPException(403, { message: "Tenant scope is required" });
  }
  c.set("tenant", { orgId: user.orgId, userId: c.var.user.id, role: c.var.user.role });
  await next();
};
