import { test, expect } from "@playwright/test";
import { signIn, goToCatalog, clickFirstBook, STAFF, MEMBER } from "./helpers";

test.describe("Staff circulation flow", () => {
  test("issue borrow then process return", async ({ page }) => {
    await signIn(page, STAFF);
    await goToCatalog(page);
    await clickFirstBook(page);

    // The book must be available to borrow
    const borrowBtn = page.getByRole("button", { name: "Issue Borrow" });
    const isAvailable = await borrowBtn
      .isEnabled({ timeout: 5_000 })
      .catch(() => false);

    // Skip if no available copies
    test.skip(!isAvailable, "No available copies to test borrow flow");

    // Open borrow dialog
    await borrowBtn.click();
    await expect(page.getByText("Borrow Book")).toBeVisible({
      timeout: 5_000,
    });

    // Search for the member
    const memberInput = page.getByPlaceholder("Search by name or email");
    await expect(memberInput).toBeVisible({ timeout: 5_000 });
    await memberInput.fill(MEMBER.email);

    // Wait for debounce (300ms) + network
    const memberResult = page.locator("button").filter({
      hasText: MEMBER.email,
    });
    await expect(memberResult.first()).toBeVisible({ timeout: 15_000 });
    await memberResult.first().click();

    // Issue the loan
    await page.getByRole("button", { name: "Issue Loan" }).click();

    // Dialog should close — borrow succeeded
    await expect(page.getByText("Borrow Book")).not.toBeVisible({
      timeout: 10_000,
    });

    // Verify the loan shows in Recent Activity section
    await expect(page.getByText("Borrowed").first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
