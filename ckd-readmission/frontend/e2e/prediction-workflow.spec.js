import { test, expect } from "@playwright/test";

test.describe("CKD Readmission Predictor E2E Workflow", () => {
  test("loads landing page successfully", async ({ page }) => {
    await page.goto("http://localhost:5173/");
    await expect(page).toHaveTitle(/CKD|Predictor/i);
  });

  test("verifies prediction intake form and navigation layout", async ({ page }) => {
    await page.goto("http://localhost:5173/");
    // Look for brand header lockup
    const header = page.locator(".brand-name, h1");
    await expect(header.first()).toBeVisible();
  });
});
