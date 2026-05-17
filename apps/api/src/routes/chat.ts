import { zValidator } from "@hono/zod-validator";
import { chatMessageSchema, contractIdParamSchema } from "@lexguard/types";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { authMiddleware } from "../middleware/auth";
import { rateLimit } from "../middleware/rateLimit";
import { tenantIsolation } from "../middleware/tenantIsolation";
import { writeAuditLog } from "../services/audit.service";
import { chatService } from "../services/chat.service";

export const chatRoutes = new Hono();

chatRoutes.use("*", authMiddleware, tenantIsolation);

chatRoutes.post(
  "/:contractId/message",
  rateLimit(30, 60 * 60, "chat:message"),
  zValidator("param", contractIdParamSchema),
  zValidator("json", chatMessageSchema),
  async (c) => {
    const params = c.req.valid("param");
    const body = c.req.valid("json");
    const result = await chatService.answer(params.contractId, body.message, c.var.user);
    await writeAuditLog({
      userId: c.var.user.id,
      action: "CHAT_MESSAGE_SENT",
      resourceType: "contract",
      resourceId: params.contractId,
    });
    return streamSSE(c, async (stream) => {
      await stream.writeSSE({ event: "message", data: JSON.stringify(result) });
      await stream.writeSSE({ event: "done", data: "{}" });
    });
  },
);

chatRoutes.get("/:contractId/history", zValidator("param", contractIdParamSchema), async (c) => {
  return c.json({
    messages: await chatService.history(c.req.valid("param").contractId, c.var.user),
  });
});

chatRoutes.delete("/:contractId/history", zValidator("param", contractIdParamSchema), async (c) => {
  return c.json(await chatService.clear(c.req.valid("param").contractId, c.var.user));
});
