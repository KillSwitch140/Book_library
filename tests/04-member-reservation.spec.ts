import { test, expect } from "@playwright/test";
import { signIn, goToCatalog, clickFirstBook, MEMBER } from "./helpers";

test.describe("Member reservation flow", () => {
  test("reserve a book, verify on reservations page, then cancel", async ({
    page,
  }) => {
    await signIn(page, MEMBER);
    await goToCatalog(page);
    await clickFirstBook(page);

    // Grab book title for later verification
    const bookTitle = await page.locator("h1").first().textContent();

    // Click Reserve button on book detail page
    const reserveBtn = page.getByRole("button", { name: "Reserve" });
    await expect(reserveBtn).toBeVisible({ timeout: 10_000 });
    await reserveBtn.click();

    // Reserve dialog should open
    await expect(page.getByText("Reserve Book")).toBeVisible({
      timeout: 5_000,
    });

    // Confirm reservation
    await page
      .getByRole("button", { name: "Confirm Reservation" })
      .click();

    // Dialog should close
    await expect(page.getByText("Reserve Book")).not.toBeVisible({
      timeout: 10_000,
    });

    // Navigate to reservations page
    await page.goto("/reservations");
    await expect(
      page.locator("h1", { hasText: "Reservations" }),
    ).toBeVisible({ timeout: 10_000 });

    // The reserved book should appear in the list
    await expect(page.getByText(bookTitle!)).toBeVisible({ timeout: 10_000 });

    // Cancel the reservation (X button next to the reservation card)
    const cancelBtn = page
      .locator("button")
      .filter({ has: page.locator("svg.lucide-x") })
      .first();
    await cancelBtn.click();

    // Reservation should disappear or show cancelled status
    await expect(page.getByText(bookTitle!)).not.toBeVisible({
      timeout: 10_000,
    });
  });
});
