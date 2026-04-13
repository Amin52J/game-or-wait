import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, resetAllMocks } from "@/__tests__/test-utils";
import { FilterChip } from "./FilterChip";

beforeEach(resetAllMocks);

describe("FilterChip", () => {
  it("renders children text", () => {
    renderWithProviders(<FilterChip $active={false}>Active</FilterChip>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithProviders(<FilterChip $active={false} onClick={onClick}>Filter</FilterChip>);
    await user.click(screen.getByText("Filter"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders in active state", () => {
    renderWithProviders(<FilterChip $active={true}>Selected</FilterChip>);
    expect(screen.getByText("Selected")).toBeInTheDocument();
  });

  it("renders as a button", () => {
    renderWithProviders(<FilterChip $active={false}>Chip</FilterChip>);
    expect(screen.getByRole("button", { name: "Chip" })).toBeInTheDocument();
  });
});
