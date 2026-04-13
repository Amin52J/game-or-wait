import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, resetAllMocks } from "@/__tests__/test-utils";
import { Checkbox } from "./Checkbox";

beforeEach(resetAllMocks);

describe("Checkbox", () => {
  it("renders with label", () => {
    renderWithProviders(<Checkbox label="Accept terms" />);
    expect(screen.getByText("Accept terms")).toBeInTheDocument();
  });

  it("renders as unchecked by default", () => {
    renderWithProviders(<Checkbox label="Accept" />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("renders as checked when checked prop is true", () => {
    renderWithProviders(<Checkbox label="Accept" checked onChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("calls onChange when clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<Checkbox label="Accept" onChange={onChange} />);
    await user.click(screen.getByText("Accept"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is set", () => {
    renderWithProviders(<Checkbox label="Accept" disabled />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });
});
