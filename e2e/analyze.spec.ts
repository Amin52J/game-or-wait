import { test, expect } from "./fixtures";

test.describe("Analyze Game", () => {
  test("renders analyze page with form", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");

    await expect(page.getByText("Analyze Game")).toBeVisible();
    await expect(page.locator("#analyze-game-name")).toBeVisible();
    await expect(page.locator("#analyze-price")).toBeVisible();
    await expect(page.getByRole("button", { name: "Analyze" })).toBeVisible();
  });

  test("shows validation errors for empty submit", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");

    await page.getByRole("button", { name: "Analyze" }).click();
    await expect(page.getByText("Enter a game name.")).toBeVisible();
  });

  test("can fill game name and price", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");

    await page.locator("#analyze-game-name").fill("Elden Ring");
    await page.locator("#analyze-price").fill("59.99");

    await expect(page.locator("#analyze-game-name")).toHaveValue("Elden Ring");
    await expect(page.locator("#analyze-price")).toHaveValue("59.99");
  });

  test("shows currency prefix in price field", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await expect(page.getByText("$")).toBeVisible();
  });

  test("shows help links", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");

    await expect(page.getByRole("link", { name: "How it works" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Reading your results" })).toBeVisible();
  });

  test("filled form can be submitted without validation errors", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");

    await page.locator("#analyze-game-name").fill("Hades");
    await page.locator("#analyze-price").fill("24.99");
    await page.getByRole("button", { name: "Analyze" }).click();

    await expect(page.getByText("Enter a game name.")).not.toBeVisible();
    await expect(page.getByText("Enter a valid price")).not.toBeVisible();
  });

  test("game name field is auto-focused", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await expect(page.locator("#analyze-game-name")).toBeFocused();
  });
});
