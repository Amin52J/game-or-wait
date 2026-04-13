import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, resetAllMocks } from "@/__tests__/test-utils";
import { Button } from "./Button";

beforeEach(resetAllMocks);

describe("Button", () => {
  it("renders children text", () => {
    renderWithProviders(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("defaults to type=button", () => {
    renderWithProviders(<Button>Test</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithProviders(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithProviders(<Button disabled onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("shows loading state", () => {
    renderWithProviders(<Button isLoading>Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it("is disabled when loading", () => {
    renderWithProviders(<Button isLoading>Submit</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("supports type=submit", () => {
    renderWithProviders(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("applies fullWidth", () => {
    renderWithProviders(<Button fullWidth>Wide</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
