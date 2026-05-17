import { zValidator } from "@hono/zod-validator";
import { loginSchema, optionalRefreshSchema, registerSchema } from "@lexguard/types";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { env } from "../env";
import { authMiddleware } from "../middleware/auth";
import { rateLimit } from "../middleware/rateLimit";
import { authService, betterAuthInstance } from "../services/auth.service";

export const authRoutes = new Hono();

authRoutes.on(["GET", "POST"], "/better-auth/*", (c) => betterAuthInstance.handler(c.req.raw));

authRoutes.post(
  "/register",
  rateLimit(3, 60 * 60, "auth:register"),
  zValidator("json", registerSchema),
  async (c) => {
    const result = await authService.register(c.req.valid("json"));
    setRefreshCookie(c, result.refreshToken);
    return c.json(result, 201);
  },
);

authRoutes.post(
  "/login",
  rateLimit(5, 15 * 60, "auth:login"),
  zValidator("json", loginSchema),
  async (c) => {
    const result = await authService.login(c.req.valid("json"));
    setRefreshCookie(c, result.refreshToken);
    return c.json(result);
  },
);

authRoutes.post("/refresh", zValidator("json", optionalRefreshSchema), async (c) => {
  const refreshToken = c.req.valid("json").refreshToken ?? getCookie(c, "lexguard_refresh");
  if (!refreshToken) {
    throw new HTTPException(401, { message: "Missing refresh token" });
  }
  const result = await authService.refresh(refreshToken);
  setRefreshCookie(c, result.refreshToken);
  return c.json(result);
});

authRoutes.post(
  "/logout",
  authMiddleware,
  zValidator("json", optionalRefreshSchema.optional()),
  async (c) => {
    await authService.logout(c.req.valid("json")?.refreshToken ?? getCookie(c, "lexguard_refresh"));
    deleteCookie(c, "lexguard_refresh", { path: "/" });
    return c.json({ ok: true });
  },
);

authRoutes.get("/me", authMiddleware, async (c) => {
  return c.json({ user: c.var.user });
});

function setRefreshCookie(c: Parameters<typeof setCookie>[0], refreshToken: string) {
  setCookie(c, "lexguard_refresh", refreshToken, {
    httpOnly: true,
    sameSite: "Lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}
