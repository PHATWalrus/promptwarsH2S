import { zValidator } from "@hono/zod-validator";
import { contractIdParamSchema } from "@lexguard/types";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authMiddleware } from "../middleware/auth";
import { tenantIsolation } from "../middleware/tenantIsolation";
import { analysisService } from "../services/analysis.service";
import { writeAuditLog } from "../services/audit.service";

export const analysisRoutes = new Hono();

analysisRoutes.use("*", authMiddleware, tenantIsolation);

analysisRoutes.post(
  "/:contractId/trigger",
  zValidator("param", contractIdParamSchema),
  async (c) => {
    const result = await analysisService.trigger(c.req.valid("param").contractId, c.var.user);
    if (!result) throw new HTTPException(404, { message: "Contract not found" });
    await writeAuditLog({
      userId: c.var.user.id,
      action: "ANALYSIS_TRIGGERED",
      resourceType: "contract",
      resourceId: c.req.valid("param").contractId,
    });
    return c.json(result, 202);
  },
);

analysisRoutes.get("/:contractId/status", zValidator("param", contractIdParamSchema), async (c) => {
  return c.json(await analysisService.status(c.req.valid("param").contractId, c.var.user));
});

analysisRoutes.get("/:contractId/result", zValidator("param", contractIdParamSchema), async (c) => {
  return c.json(await analysisService.result(c.req.valid("param").contractId, c.var.user));
});
