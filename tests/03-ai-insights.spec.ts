import { test, expect } from "@playwright/test";
import { signIn, goToCatalog, clickFirstBook, STAFF } from "./helpers";

test.describe("AI Insights", () => {
  test("generate insights and verify they persist on reload", async ({
    page,
  }) => {
    await signIn(page, STAFF);
    await goToCatalog(page);
    await clickFirstBook(page);

    // Scroll to AI Insights section
    const insightsHeading = page.getByRole("heading", { name: "AI Insights" });
    await expect(insightsHeading).toBeVisible({ timeout: 10_000 });

    const summaryLabel = page.getByText("Summary", { exact: true });

    // Check if insights are already cached
    const alreadyCached = await summaryLabel
      .isVisible({ timeout: 3_000 })
      .catch(() => false);

    if (!alreadyCached) {
      // Try to generate — this requires the /api/ serverless function
      const generateBtn = page.getByRole("button", {
        name: "Generate Insights",
      });
      const canGenerate = await generateBtn
        .isVisible({ timeout: 3_000 })
        .catch(() => false);

      if (!canGenerate) {
        // No cached insights and no generate button (not signed in, or missing metadata)
        test.skip(true, "No cached insights and generate button not available");
        return;
      }

      await generateBtn.click();

      // Wait for generation — this calls the /api/ serverless function (Vercel only)
      const generated = await summaryLabel
        .isVisible({ timeout: 30_000 })
        .catch(() => false);

      if (!generated) {
        test.skip(true, "AI insights generation unavailable (requires Vercel /api/ endpoint)");
        return;
      }
    }

    // Insights should now be visible
    await expect(summaryLabel).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Best For")).toBeVisible();
    await expect(page.getByText("Why Read It")).toBeVisible();

    // Reload — cached insights should persist
    await page.reload();
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
    await expect(summaryLabel).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Best For")).toBeVisible();
  });
});
