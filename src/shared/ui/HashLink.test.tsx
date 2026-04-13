import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, resetAllMocks } from "@/__tests__/test-utils";

vi.mock("./HashLink", async (importOriginal) => {
  return importOriginal();
});

beforeEach(resetAllMocks);

describe("HashLink", () => {
  let HashLink: any;

  beforeEach(async () => {
    const mod = await import("./HashLink");
    HashLink = mod.HashLink;
  });

  it("renders link with text", () => {
    renderWithProviders(<HashLink href="/help#scoring">Learn more</HashLink>);
    expect(screen.getByText("Learn more")).toBeInTheDocument();
  });

  it("renders with correct href", () => {
    renderWithProviders(<HashLink href="/help#scoring">Learn more</HashLink>);
    const link = screen.getByText("Learn more").closest("a");
    expect(link).toHaveAttribute("href", "/help#scoring");
  });

  it("handles click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HashLink href="/help#scoring">Click me</HashLink>);
    await user.click(screen.getByText("Click me"));
  });
});
