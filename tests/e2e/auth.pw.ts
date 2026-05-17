import { expect, test } from "@playwright/test";

test("anonymous product routes redirect to login with the intended destination", async ({
  page,
}) => {
  await page.goto("/contracts/upload");

  await expect(page).toHaveURL(/\/login\?redirect=%2Fcontracts%2Fupload/);
  await expect(page.getByRole("button", { exact: true, name: "Sign In" })).toBeVisible();
});

test("public landing and signup stay accessible without a session", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();

  await page.goto("/signup");
  await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
});
