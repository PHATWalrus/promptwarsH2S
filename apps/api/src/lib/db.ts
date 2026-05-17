import { createDatabase, type TenantScope } from "@lexguard/db";
import { env } from "../env";

export const db = createDatabase(env.DATABASE_URL, env.DATABASE_MAX_CONNECTIONS);

export function tenantScope(user: {
  id: string;
  orgId: string | null;
  role: "user" | "admin";
}): TenantScope {
  if (!user.orgId) {
    throw new Error("Authenticated user is missing an organization");
  }
  return {
    userId: user.id,
    orgId: user.orgId,
    role: user.role,
  };
}
