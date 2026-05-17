import { auditLog } from "@lexguard/db";
import { db } from "../lib/db";

export async function writeAuditLog(input: {
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  await db.insert(auditLog).values({
    userId: input.userId,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
}
