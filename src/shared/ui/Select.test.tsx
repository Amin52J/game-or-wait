import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, resetAllMocks } from "@/__tests__/test-utils";
import { Select } from "./Select";

beforeEach(resetAllMocks);

describe("Select", () => {
  it("renders with label and options", () => {
    renderWithProviders(
      <Select label="Provider" id="provider">
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </Select>,
    );
    expect(screen.getByLabelText("Provider")).toBeInTheDocument();
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("calls onChange when selection changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      <Select label="Color" id="color" onChange={onChange}>
        <option value="red">Red</option>
        <option value="blue">Blue</option>
      </Select>,
    );
    await user.selectOptions(screen.getByLabelText("Color"), "blue");
    expect(onChange).toHaveBeenCalled();
  });

  it("displays error message", () => {
    renderWithProviders(
      <Select label="Color" id="color" error="Pick one">
        <option value="">--</option>
      </Select>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Pick one");
  });

  it("is disabled when disabled prop is set", () => {
    renderWithProviders(
      <Select label="Color" id="color" disabled>
        <option value="x">X</option>
      </Select>,
    );
    expect(screen.getByLabelText("Color")).toBeDisabled();
  });
});
