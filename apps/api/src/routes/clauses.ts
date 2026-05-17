import { zValidator } from "@hono/zod-validator";
import {
  clauseFeedbackSchema,
  clauseIdParamSchema,
  clauseListQuerySchema,
  clauseSearchQuerySchema,
  uuidParamSchema,
} from "@lexguard/types";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authMiddleware } from "../middleware/auth";
import { tenantIsolation } from "../middleware/tenantIsolation";
import { writeAuditLog } from "../services/audit.service";
import { clauseService } from "../services/clause.service";

export const clausesRoutes = new Hono();

clausesRoutes.use("*", authMiddleware, tenantIsolation);

clausesRoutes.get(
  "/contracts/:id/clauses",
  zValidator("param", uuidParamSchema),
  zValidator("query", clauseListQuerySchema),
  async (c) => {
    const rows = await clauseService.list(
      c.req.valid("param").id,
      c.var.user,
      c.req.valid("query"),
    );
    return c.json({ clauses: rows.map((row) => row.clause) });
  },
);

clausesRoutes.get("/search", zValidator("query", clauseSearchQuerySchema), async (c) => {
  const query = c.req.valid("query");
  return c.json({ clauses: await clauseService.search(query.query, c.var.user, query) });
});

clausesRoutes.get("/:clauseId", zValidator("param", clauseIdParamSchema), async (c) => {
  const clause = await clauseService.get(c.req.valid("param").clauseId, c.var.user);
  if (!clause) throw new HTTPException(404, { message: "Clause not found" });
  return c.json({ clause });
});

clausesRoutes.patch(
  "/:clauseId/feedback",
  zValidator("param", clauseIdParamSchema),
  zValidator("json", clauseFeedbackSchema),
  async (c) => {
    const feedback = await clauseService.feedback(
      c.req.valid("param").clauseId,
      c.var.user,
      c.req.valid("json"),
    );
    if (!feedback) throw new HTTPException(404, { message: "Clause not found" });
    await writeAuditLog({
      userId: c.var.user.id,
      action: "CLAUSE_FEEDBACK_RECORDED",
      resourceType: "clause",
      resourceId: c.req.valid("param").clauseId,
    });
    return c.json({ feedback });
  },
);
