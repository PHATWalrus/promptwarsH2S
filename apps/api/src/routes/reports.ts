import { zValidator } from "@hono/zod-validator";
import { contractIdParamSchema } from "@lexguard/types";
import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { tenantIsolation } from "../middleware/tenantIsolation";
import { writeAuditLog } from "../services/audit.service";
import { reportService } from "../services/report.service";

export const reportsRoutes = new Hono();

reportsRoutes.use("*", authMiddleware, tenantIsolation);

reportsRoutes.get("/:contractId", zValidator("param", contractIdParamSchema), async (c) => {
  const contractId = c.req.valid("param").contractId;
  if (c.req.header("accept")?.includes("application/pdf")) {
    return reportService.pdf(contractId, c.var.user);
  }
  return c.json(await reportService.json(contractId, c.var.user));
});

reportsRoutes.post(
  "/:contractId/regenerate",
  zValidator("param", contractIdParamSchema),
  async (c) => {
    await writeAuditLog({
      userId: c.var.user.id,
      action: "REPORT_REGENERATED",
      resourceType: "contract",
      resourceId: c.req.valid("param").contractId,
    });
    return c.json(await reportService.json(c.req.valid("param").contractId, c.var.user));
  },
);
