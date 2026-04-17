import { test, expect } from "./fixtures";

test.describe("Help Page", () => {
  test("renders help page with title", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Help").click();

    await expect(page.getByText("Help & Guide")).toBeVisible();
  });

  test("shows table of contents", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Help").click();

    const toc = page.getByLabel("Table of contents");
    await expect(toc).toBeVisible();

    const sections = [
      "What is GameOrWait?",
      "API keys explained",
      "Your game library",
      "How scoring works",
      "Importing from apps",
      "Running an analysis",
      "Reading your results",
      "FAQ",
    ];

    for (const section of sections) {
      await expect(toc.getByText(section)).toBeVisible();
    }
  });

  test("TOC links navigate to sections", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Help").click();

    const toc = page.getByLabel("Table of contents");
    await toc.getByText("How scoring works").click();

    await expect(page).toHaveURL(/.*#scoring/);
  });

  test("section anchors exist on the page", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Help").click();

    const anchors = ["what-is-GameOrWait", "api-key", "library", "scoring", "importing", "analyzing", "results", "faq"];
    for (const id of anchors) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });
});
