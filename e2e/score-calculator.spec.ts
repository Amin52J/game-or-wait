import { test, expect } from "./fixtures";

test.describe("Score Calculator", () => {
  test("renders page with title and form", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Score").click();

    await expect(page.getByText("Score Calculator")).toBeVisible();
    await expect(page.locator("#timeInput")).toBeVisible();
    await expect(page.getByText("Game was completed")).toBeVisible();
    await expect(page.getByRole("button", { name: "Calculate Score" })).toBeVisible();
  });

  test("shows error for empty time input", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Score").click();

    await page.getByRole("button", { name: "Calculate Score" }).click();
    await expect(page.getByText("Please enter a time value")).toBeVisible();
  });

  test("shows error for invalid time format", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Score").click();

    await page.locator("#timeInput").fill("abc");
    await page.getByRole("button", { name: "Calculate Score" }).click();
    await expect(page.getByText(/Invalid time format/)).toBeVisible();
  });

  test("calculates score for valid time input", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Score").click();

    await page.locator("#timeInput").fill("2:30");
    await page.getByRole("button", { name: "Calculate Score" }).click();

    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
  });

  test("calculates score with completed checkbox", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Score").click();

    await page.locator("#timeInput").fill("10");
    await page.getByText("Game was completed").click();
    await page.getByRole("button", { name: "Calculate Score" }).click();

    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
  });

  test("reset clears form and result", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Score").click();

    await page.locator("#timeInput").fill("5");
    await page.getByRole("button", { name: "Calculate Score" }).click();
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByRole("button", { name: "Reset" })).not.toBeVisible();
    await expect(page.locator("#timeInput")).toHaveValue("");
  });

  test("shows guidance banner about 0-75 scoring", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Score").click();

    await expect(page.getByText(/This calculator handles games scored 0–75/)).toBeVisible();
  });

  test("supports short time format :30 (30 minutes)", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Score").click();

    await page.locator("#timeInput").fill(":30");
    await page.getByRole("button", { name: "Calculate Score" }).click();
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
  });
});
