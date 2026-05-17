import { zValidator } from "@hono/zod-validator";
import { compareContractsSchema } from "@lexguard/types";
import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { tenantIsolation } from "../middleware/tenantIsolation";
import { compareContracts } from "../services/compare.service";

export const compareRoutes = new Hono();

compareRoutes.use("*", authMiddleware, tenantIsolation);

compareRoutes.post("/", zValidator("json", compareContractsSchema), async (c) => {
  return c.json(await compareContracts(c.req.valid("json").contractIds, c.var.user));
});
