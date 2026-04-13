import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, resetAllMocks } from "@/__tests__/test-utils";
import { AddGameModal } from "./AddGameModal";

beforeEach(resetAllMocks);

describe("AddGameModal", () => {
  const defaultProps = {
    addName: "",
    setAddName: vi.fn(),
    addScore: "",
    setAddScore: vi.fn(),
    onAdd: vi.fn(),
    onClose: vi.fn(),
  };

  it("renders modal with title and inputs", () => {
    renderWithProviders(<AddGameModal {...defaultProps} />);
    expect(screen.getByText("Add Game")).toBeInTheDocument();
    expect(screen.getByLabelText("Game name")).toBeInTheDocument();
    expect(screen.getByLabelText("Score (optional)")).toBeInTheDocument();
  });

  it("has disabled Add button when name is empty", () => {
    renderWithProviders(<AddGameModal {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("has enabled Add button when name is provided", () => {
    renderWithProviders(<AddGameModal {...defaultProps} addName="Elden Ring" />);
    expect(screen.getByRole("button", { name: "Add" })).not.toBeDisabled();
  });

  it("calls onAdd when Add button is clicked", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    renderWithProviders(<AddGameModal {...defaultProps} addName="Test Game" onAdd={onAdd} />);
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<AddGameModal {...defaultProps} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = renderWithProviders(<AddGameModal {...defaultProps} onClose={onClose} />);
    const backdrop = container.firstChild as HTMLElement;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls setAddName on name input change", async () => {
    const user = userEvent.setup();
    const setAddName = vi.fn();
    renderWithProviders(<AddGameModal {...defaultProps} setAddName={setAddName} />);
    await user.type(screen.getByLabelText("Game name"), "A");
    expect(setAddName).toHaveBeenCalled();
  });

  it("calls setAddScore on score input change", async () => {
    const user = userEvent.setup();
    const setAddScore = vi.fn();
    renderWithProviders(<AddGameModal {...defaultProps} setAddScore={setAddScore} />);
    await user.type(screen.getByLabelText("Score (optional)"), "8");
    expect(setAddScore).toHaveBeenCalled();
  });
});
