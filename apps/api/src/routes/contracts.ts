import { zValidator } from "@hono/zod-validator";
import {
  contractUploadSchema,
  importUrlSchema,
  listContractsQuerySchema,
  uuidParamSchema,
} from "@lexguard/types";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authMiddleware } from "../middleware/auth";
import { rateLimit } from "../middleware/rateLimit";
import { tenantIsolation } from "../middleware/tenantIsolation";
import { validateUploadFile } from "../middleware/uploadGuard";
import { writeAuditLog } from "../services/audit.service";
import { contractService } from "../services/contract.service";

export const contractsRoutes = new Hono();

contractsRoutes.use("*", authMiddleware, tenantIsolation);

contractsRoutes.post("/upload", rateLimit(10, 60 * 60, "contracts:upload"), async (c) => {
  const body = await c.req.parseBody();
  const file = body.file;
  if (!(file instanceof File)) {
    throw new HTTPException(400, { message: "file is required" });
  }
  await validateUploadFile(file);
  const parsed = contractUploadSchema.parse({
    title: typeof body.title === "string" ? body.title : file.name,
    contractType: typeof body.contractType === "string" ? body.contractType : undefined,
    jurisdiction: typeof body.jurisdiction === "string" ? body.jurisdiction : undefined,
  });
  const result = await contractService.upload(file, parsed, c.var.user);
  await writeAuditLog({
    userId: c.var.user.id,
    action: "CONTRACT_UPLOADED",
    resourceType: "contract",
    resourceId: result.contractId,
    ipAddress: c.req.header("x-forwarded-for"),
    userAgent: c.req.header("user-agent"),
  });
  return c.json(result, 201);
});

contractsRoutes.post(
  "/import-url",
  rateLimit(10, 60 * 60, "contracts:import-url"),
  zValidator("json", importUrlSchema),
  async (c) => {
    const result = await contractService.importUrl(c.req.valid("json"), c.var.user);
    await writeAuditLog({
      userId: c.var.user.id,
      action: "CONTRACT_URL_IMPORTED",
      resourceType: "contract",
      resourceId: result.contractId,
    });
    return c.json(result, 201);
  },
);

contractsRoutes.get("/", zValidator("query", listContractsQuerySchema), async (c) => {
  return c.json({ contracts: await contractService.list(c.var.user, c.req.valid("query")) });
});

contractsRoutes.get("/:id", zValidator("param", uuidParamSchema), async (c) => {
  const contract = await contractService.get(c.req.valid("param").id, c.var.user);
  if (!contract) throw new HTTPException(404, { message: "Contract not found" });
  return c.json({ contract });
});

contractsRoutes.delete("/:id", zValidator("param", uuidParamSchema), async (c) => {
  const contract = await contractService.softDelete(c.req.valid("param").id, c.var.user);
  if (!contract) throw new HTTPException(404, { message: "Contract not found" });
  await writeAuditLog({
    userId: c.var.user.id,
    action: "CONTRACT_DELETED",
    resourceType: "contract",
    resourceId: contract.id,
  });
  return c.json({ ok: true });
});
