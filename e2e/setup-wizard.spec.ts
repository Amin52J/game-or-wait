import { test, expect } from "./fixtures";

test.describe("Setup Wizard", () => {
  test("shows welcome screen with title", async ({ freshSetupPage: page }) => {
    await page.goto("/");

    await expect(page.getByText("Welcome to GameOrWait")).toBeVisible();
    await expect(
      page.getByText("Let's set up your personalized game analysis assistant"),
    ).toBeVisible();
  });

  test("step 1 shows AI provider configuration", async ({ freshSetupPage: page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "AI provider" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next", exact: true })).toBeVisible();
  });

  test("step 1 validates API key before advancing", async ({ freshSetupPage: page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await expect(page.getByText("Please enter an API key.")).toBeVisible();
  });

  test("can navigate forward and back through steps", async ({ freshSetupPage: page }) => {
    await page.goto("/?dev=true");

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByRole("button", { name: "Back" })).toBeVisible();

    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByRole("button", { name: "Next", exact: true })).toBeVisible();
  });

  test("step 3 (Import Library) has skip option", async ({ freshSetupPage: page }) => {
    await page.goto("/?dev=true");

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await expect(page.getByRole("button", { name: /Skip import/i })).toBeVisible();
  });

  test("step 4 (Review) shows Finish Setup button", async ({ freshSetupPage: page }) => {
    await page.goto("/?dev=true");

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await expect(page.getByRole("button", { name: "Finish Setup" })).toBeVisible();
  });

  test("skip import jumps to review", async ({ freshSetupPage: page }) => {
    await page.goto("/?dev=true");

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("button", { name: /Skip import/i }).click();

    await expect(page.getByRole("button", { name: "Finish Setup" })).toBeVisible();
  });
});
