import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders, resetAllMocks } from "@/__tests__/test-utils";
import { Slider } from "./Slider";

beforeEach(resetAllMocks);

describe("Slider", () => {
  it("renders with label", () => {
    renderWithProviders(<Slider label="Volume" id="volume" />);
    expect(screen.getByLabelText("Volume")).toBeInTheDocument();
  });

  it("renders range input", () => {
    renderWithProviders(<Slider label="Volume" id="volume" />);
    const input = screen.getByRole("slider");
    expect(input).toBeInTheDocument();
  });

  it("displays min and max bounds", () => {
    renderWithProviders(<Slider label="Score" id="score" min={10} max={100} />);
    expect(screen.getAllByText("10").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("100").length).toBeGreaterThanOrEqual(1);
  });

  it("shows default value display", () => {
    renderWithProviders(<Slider label="Score" id="score" min={0} max={100} defaultValue={50} />);
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  it("calls onChange when value changes", () => {
    const onChange = vi.fn();
    renderWithProviders(<Slider label="Score" id="score" onChange={onChange} />);
    const input = screen.getByRole("slider");
    fireEvent.change(input, { target: { value: "75" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("uses formatValue to customize display", () => {
    renderWithProviders(
      <Slider label="Score" id="score" value={42} formatValue={(v) => `${v}%`} onChange={() => {}} />,
    );
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("works as controlled component", () => {
    const onChange = vi.fn();
    renderWithProviders(<Slider label="Score" id="score" value={30} onChange={onChange} />);
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("renders without label", () => {
    renderWithProviders(<Slider id="anon" />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });
});
