import { test, expect } from "./fixtures";

test.describe("Game Library", () => {
  test("renders library page with title and game count", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Library").click();

    await expect(page.getByText("Game Library")).toBeVisible();
    await expect(page.getByText(/games in your library/)).toBeVisible();
  });

  test("shows action buttons", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Library").click();

    await expect(page.getByRole("button", { name: /Import Games/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Export CSV/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Add Game/ })).toBeVisible();
  });

  test("opens add game modal", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Library").click();

    await page.getByRole("button", { name: /Add Game/ }).click();
    await expect(page.getByRole("heading", { name: "Add Game" })).toBeVisible();
  });

  test("toggles import section", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Library").click();

    await page.getByRole("button", { name: /Import Games/ }).click();
    await expect(page.getByRole("button", { name: /Hide Import/ })).toBeVisible();

    await page.getByRole("button", { name: /Hide Import/ }).click();
    await expect(page.getByRole("button", { name: /Import Games/ })).toBeVisible();
  });

  test("displays games from state", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Library").click();

    await expect(page.getByText("Elden Ring")).toBeVisible();
    await expect(page.getByText("Hollow Knight")).toBeVisible();
    await expect(page.getByText("Hades")).toBeVisible();
  });

  test("shows learn more and scoring links", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Library").click();

    await expect(page.getByRole("link", { name: "Learn more" })).toBeVisible();
    await expect(page.getByRole("link", { name: "How scoring works" })).toBeVisible();
  });

  test("clear library shows confirmation", async ({ authenticatedPage: page }) => {
    await page.goto("/analyze");
    await page.getByLabel("Main navigation").getByText("Library").click();

    await page.getByRole("button", { name: "Clear Library" }).click();
    await expect(page.getByRole("button", { name: "Are you sure?" })).toBeVisible();
  });
});
