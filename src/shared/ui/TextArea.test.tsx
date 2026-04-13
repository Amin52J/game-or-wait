import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, resetAllMocks } from "@/__tests__/test-utils";
import { TextArea } from "./TextArea";

beforeEach(resetAllMocks);

describe("TextArea", () => {
  it("renders with label", () => {
    renderWithProviders(<TextArea label="Notes" id="notes" />);
    expect(screen.getByLabelText("Notes")).toBeInTheDocument();
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<TextArea label="Notes" id="notes" onChange={onChange} />);
    await user.type(screen.getByLabelText("Notes"), "hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("displays error message", () => {
    renderWithProviders(<TextArea label="Notes" id="notes" error="Required" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
  });

  it("sets aria-invalid when error is present", () => {
    renderWithProviders(<TextArea label="Notes" id="notes" error="Required" />);
    expect(screen.getByLabelText("Notes")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows character count when maxLength is set", () => {
    renderWithProviders(<TextArea label="Bio" id="bio" maxLength={100} />);
    expect(screen.getByText("0 / 100")).toBeInTheDocument();
  });

  it("updates character count on input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TextArea label="Bio" id="bio" maxLength={100} />);
    await user.type(screen.getByLabelText("Bio"), "Hello");
    expect(screen.getByText("5 / 100")).toBeInTheDocument();
  });

  it("renders with controlled value", () => {
    renderWithProviders(<TextArea label="Bio" id="bio" value="Test" onChange={() => {}} maxLength={50} />);
    expect(screen.getByText("4 / 50")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is set", () => {
    renderWithProviders(<TextArea label="Notes" id="notes" disabled />);
    expect(screen.getByLabelText("Notes")).toBeDisabled();
  });

  it("shows count without maxLength when showCount is set", () => {
    renderWithProviders(<TextArea label="Notes" id="notes" showCount />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
