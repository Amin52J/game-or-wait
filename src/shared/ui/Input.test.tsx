import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, resetAllMocks } from "@/__tests__/test-utils";
import { Input } from "./Input";

beforeEach(resetAllMocks);

describe("Input", () => {
  it("renders with label", () => {
    renderWithProviders(<Input label="Email" id="email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<Input label="Name" id="name" onChange={onChange} />);
    const input = screen.getByLabelText("Name");
    await user.type(input, "hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("displays error message", () => {
    renderWithProviders(<Input label="Email" id="email" error="Required" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
  });

  it("sets aria-invalid when error is present", () => {
    renderWithProviders(<Input label="Email" id="email" error="Required" />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });

  it("displays hint text", () => {
    renderWithProviders(<Input label="Email" id="email" hint="Enter your email" />);
    expect(screen.getByText("Enter your email")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is set", () => {
    renderWithProviders(<Input label="Email" id="email" disabled />);
    expect(screen.getByLabelText("Email")).toBeDisabled();
  });

  it("renders placeholder text", () => {
    renderWithProviders(<Input label="Name" id="name" placeholder="Type here" />);
    expect(screen.getByPlaceholderText("Type here")).toBeInTheDocument();
  });
});
