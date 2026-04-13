import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, resetAllMocks } from "@/__tests__/test-utils";
import { DangerSection } from "./DangerSection";

beforeEach(resetAllMocks);

describe("DangerSection", () => {
  it("renders danger zone title", () => {
    renderWithProviders(<DangerSection onReset={vi.fn()} />);
    expect(screen.getByText("Danger Zone")).toBeInTheDocument();
  });

  it("renders description text", () => {
    renderWithProviders(<DangerSection onReset={vi.fn()} />);
    expect(screen.getByText(/permanently delete/i)).toBeInTheDocument();
  });

  it("renders reset button", () => {
    renderWithProviders(<DangerSection onReset={vi.fn()} />);
    expect(screen.getByRole("button", { name: /reset everything/i })).toBeInTheDocument();
  });

  it("calls onReset when button is clicked", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    renderWithProviders(<DangerSection onReset={onReset} />);
    await user.click(screen.getByRole("button", { name: /reset everything/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
