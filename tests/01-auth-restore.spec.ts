import { test, expect } from "@playwright/test";
import { signIn, expectSignedIn, STAFF } from "./helpers";

test.describe("Auth restore after reload", () => {
  test("session persists across page reload", async ({ page }) => {
    // 1. Sign in
    await signIn(page, STAFF);
    await expectSignedIn(page, STAFF.email);

    // 2. Hard reload
    await page.reload();

    // 3. Still signed in — sidebar shows email, not "Sign In" link
    await expectSignedIn(page, STAFF.email);
  });

  test("protected page still accessible after reload", async ({ page }) => {
    await signIn(page, STAFF);

    // Navigate to a staff-only route
    await page.goto("/admin");
    await expect(page.locator("h1")).toContainText(/dashboard/i, {
      timeout: 15_000,
    });

    // Reload and verify it doesn't redirect to /login
    await page.reload();
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator("h1")).toContainText(/dashboard/i, {
      timeout: 15_000,
    });
  });
});
