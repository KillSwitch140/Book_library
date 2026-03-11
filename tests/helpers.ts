import { type Page, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Environment — test accounts
// ---------------------------------------------------------------------------

/** Admin/staff account (must exist in Supabase with role = admin or librarian) */
export const STAFF = {
  email: process.env.TEST_STAFF_EMAIL || "alice@example.com",
  password: process.env.TEST_STAFF_PASSWORD || "TestPass123!",
};

/** Regular member account */
export const MEMBER = {
  email: process.env.TEST_MEMBER_EMAIL || "bob@example.com",
  password: process.env.TEST_MEMBER_PASSWORD || "TestPass123!",
};

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

/**
 * Clear any existing Supabase session so we start from a clean slate.
 */
export async function signOut(page: Page) {
  await page.evaluate(() => {
    // Supabase stores its session under keys starting with "sb-"
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("sb-")) localStorage.removeItem(key);
    }
  });
}

/**
 * Sign in via the login page with email & password.
 * Clears any existing session first to avoid redirect loops.
 */
export async function signIn(
  page: Page,
  credentials: { email: string; password: string },
) {
  // Visit the app first so we have access to localStorage on the correct origin
  await page.goto("/");
  await signOut(page);

  await page.goto("/login");
  await page.locator("#login-email").fill(credentials.email);
  await page.locator("#login-password").fill(credentials.password);
  await page.getByRole("button", { name: "Sign In" }).click();

  // Wait for redirect away from /login
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
}

/**
 * Assert that the sidebar footer shows the signed-in user info.
 */
export async function expectSignedIn(page: Page, email: string) {
  await expect(page.getByText(email)).toBeVisible({ timeout: 10_000 });
}

/**
 * Assert the sidebar shows "Sign In" link (signed-out state).
 */
export async function expectSignedOut(page: Page) {
  await expect(
    page.locator("aside").getByText("Sign In"),
  ).toBeVisible({ timeout: 10_000 });
}

// ---------------------------------------------------------------------------
// Navigation helpers
// ---------------------------------------------------------------------------

/** Navigate to /catalog and wait for books to load */
export async function goToCatalog(page: Page) {
  await page.goto("/catalog");
  // Wait for at least one book title to appear (grid loaded)
  await expect(page.locator("h1", { hasText: "Catalog" })).toBeVisible();
}

/** Click the first book in the catalog grid and wait for detail page */
export async function clickFirstBook(page: Page) {
  // The catalog grid items are divs with .group.cursor-pointer
  const firstBook = page.locator("[class*='cursor-pointer']").first();
  await firstBook.click();
  // Wait for book detail page — has the back button and a book title (h1)
  await expect(page.getByText("Back")).toBeVisible({ timeout: 10_000 });
}
