import { describe, expect, test } from "bun:test";
import { getLoginRedirect, isProtectedPath } from "./authGuards";

describe("web auth route guards", () => {
  test("treats product routes as protected and public routes as anonymous", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/contracts/upload")).toBe(true);
    expect(isProtectedPath("/contracts/00000000-0000-4000-8000-000000000001")).toBe(true);
    expect(isProtectedPath("/compare")).toBe(true);
    expect(isProtectedPath("/settings")).toBe(true);
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/login")).toBe(false);
    expect(isProtectedPath("/signup")).toBe(false);
  });

  test("builds a login redirect that preserves the intended destination", () => {
    expect(getLoginRedirect("/contracts/upload")).toBe("/login?redirect=%2Fcontracts%2Fupload");
  });
});
