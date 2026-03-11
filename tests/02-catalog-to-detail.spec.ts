import { test, expect } from "@playwright/test";
import { goToCatalog, clickFirstBook } from "./helpers";

test.describe("Catalog to book detail", () => {
  test("can browse catalog, click a book, and see detail page", async ({
    page,
  }) => {
    await goToCatalog(page);

    // Wait for at least one book card to render
    const bookCards = page.locator("[class*='cursor-pointer']");
    await expect(bookCards.first()).toBeVisible({ timeout: 15_000 });

    // Grab the title text before clicking
    const titleEl = bookCards.first().locator("h3");
    const bookTitle = await titleEl.textContent();

    // Click through to detail
    await clickFirstBook(page);

    // Book detail page should show the same title in the hero h1
    await expect(page.locator("h1").first()).toContainText(bookTitle!, {
      timeout: 10_000,
    });

    // Key detail sections should render
    await expect(page.getByRole("heading", { name: "AI Insights" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Availability & History" })).toBeVisible();
  });

  test("book detail page survives reload", async ({ page }) => {
    await goToCatalog(page);
    await clickFirstBook(page);

    // Grab the URL and title
    const url = page.url();
    const title = await page.locator("h1").first().textContent();

    // Reload
    await page.reload();

    // Same URL, same content — not stuck on skeleton
    expect(page.url()).toBe(url);
    await expect(page.locator("h1").first()).toContainText(title!, {
      timeout: 15_000,
    });
  });
});
