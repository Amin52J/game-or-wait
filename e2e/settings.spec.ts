import { test, expect } from "./fixtures";

test.describe("Settings", () => {
  test("renders settings page with sections", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Settings").click();

    await expect(page.getByText("Settings").first()).toBeVisible();
    await expect(page.getByText("AI Provider")).toBeVisible();
    await expect(page.getByText("Danger Zone")).toBeVisible();
  });

  test("shows provider configuration form", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Settings").click();

    await expect(page.getByLabel("Provider")).toBeVisible();
    await expect(page.getByLabel("API Key")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save Provider" })).toBeVisible();
  });

  test("can change provider type", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Settings").click();

    const providerSelect = page.getByLabel("Provider");
    await providerSelect.selectOption("openai");
    await expect(providerSelect).toHaveValue("openai");
  });

  test("shows custom endpoint fields when custom provider selected", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Settings").click();

    await page.getByLabel("Provider").selectOption("custom");
    await expect(page.getByText("Base URL")).toBeVisible();
  });

  test("can toggle API key visibility", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Settings").click();

    const showBtn = page.getByRole("button", { name: "Show" });
    await showBtn.click();
    await expect(page.getByRole("button", { name: "Hide" })).toBeVisible();
  });

  test("save provider shows toast", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Settings").click();

    await page.getByRole("button", { name: "Save Provider" }).click();
    await expect(page.getByText("AI provider saved")).toBeVisible();
  });

  test("danger zone has reset button", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Settings").click();

    await expect(page.getByRole("button", { name: "Reset Everything" })).toBeVisible();
    await expect(page.getByText(/Permanently delete all your data/)).toBeVisible();
  });
});
