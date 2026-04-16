import { test, expect } from "./fixtures";

test.describe("Auth flow — Landing page", () => {
  test("shows landing page when unauthenticated", async ({ unauthenticatedPage: page }) => {
    await page.goto("/");
    await expect(
      page.getByText("Find out if a game is right for you before you buy"),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Get Started", exact: true })).toBeVisible();
  });

  test("landing page has Log In and Sign Up nav buttons", async ({ unauthenticatedPage: page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Log In" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible();
  });

  test("clicking Log In shows auth form", async ({ unauthenticatedPage: page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Log In" }).click();

    await expect(page.locator("#auth-email")).toBeVisible();
    await expect(page.locator("#auth-password")).toBeVisible();
  });

  test("clicking Sign Up shows signup form", async ({ unauthenticatedPage: page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Sign Up" }).click();

    await expect(page.locator("#auth-name")).toBeVisible();
    await expect(page.locator("#auth-email")).toBeVisible();
    await expect(page.locator("#auth-password")).toBeVisible();
  });
});

test.describe("Auth flow — Auth form", () => {
  test("can switch between login and signup tabs", async ({ unauthenticatedPage: page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Log In" }).click();

    await expect(page.locator("#auth-name")).not.toBeVisible();

    await page.getByRole("button", { name: "Sign Up" }).click();
    await expect(page.locator("#auth-name")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
  });

  test("can fill login form with email and password", async ({ unauthenticatedPage: page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Log In" }).click();

    await page.locator("#auth-email").fill("test@example.com");
    await page.locator("#auth-password").fill("password123");

    await expect(page.locator("#auth-email")).toHaveValue("test@example.com");
    await expect(page.locator("#auth-password")).toHaveValue("password123");
  });

  test("can fill signup form with name, email, password", async ({ unauthenticatedPage: page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Sign Up" }).click();

    await page.locator("#auth-name").fill("Test User");
    await page.locator("#auth-email").fill("newuser@example.com");
    await page.locator("#auth-password").fill("securepass123");

    await expect(page.locator("#auth-name")).toHaveValue("Test User");
  });

  test("shows forgot password flow", async ({ unauthenticatedPage: page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Log In" }).click();

    await page.getByRole("button", { name: "Forgot password?" }).click();
    await expect(page.locator("#auth-reset-email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send Reset Link" })).toBeVisible();
  });

  test("can return from forgot password to login", async ({ unauthenticatedPage: page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Log In" }).click();
    await page.getByRole("button", { name: "Forgot password?" }).click();

    await page.getByRole("button", { name: /Back to Log In/i }).click();
    await expect(page.locator("#auth-email")).toBeVisible();
    await expect(page.locator("#auth-password")).toBeVisible();
  });

  test("auth form has Back button to return to landing", async ({ unauthenticatedPage: page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Log In" }).click();
    await expect(page.locator("#auth-email")).toBeVisible();

    await page.getByRole("button", { name: "Back" }).click();
    await expect(
      page.getByText("Find out if a game is right for you before you buy"),
    ).toBeVisible();
  });

  test("shows social login buttons (GitHub, Steam)", async ({ unauthenticatedPage: page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Log In" }).click();

    await expect(page.getByRole("button", { name: /GitHub/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Steam/i })).toBeVisible();
  });

  test("shows 'or continue with' divider", async ({ unauthenticatedPage: page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Log In" }).click();

    await expect(page.getByText("or continue with")).toBeVisible();
  });
});
