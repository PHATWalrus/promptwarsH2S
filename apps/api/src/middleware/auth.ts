import { users } from "@lexguard/db";
import { eq } from "drizzle-orm";
import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { verifyAccessToken } from "../lib/crypto";
import { db } from "../lib/db";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: "user" | "admin";
  orgId: string;
};

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const header = c.req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) {
    throw new HTTPException(401, { message: "Missing bearer token" });
  }
  const subject = await verifyAccessToken(token);
  const [user] = await db.select().from(users).where(eq(users.id, subject.userId)).limit(1);
  if (!user?.orgId || user.orgId !== subject.orgId) {
    throw new HTTPException(401, { message: "Invalid authenticated user" });
  }
  c.set("user", {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    orgId: user.orgId,
  } satisfies AuthUser);
  await next();
};
