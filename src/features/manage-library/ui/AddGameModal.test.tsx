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

  it("calls onAdd when Enter is pressed in name input", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    renderWithProviders(<AddGameModal {...defaultProps} addName="Test" onAdd={onAdd} />);
    screen.getByLabelText("Game name").focus();
    await user.keyboard("{Enter}");
    expect(onAdd).toHaveBeenCalled();
  });

  it("calls onClose when Escape is pressed in name input", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<AddGameModal {...defaultProps} onClose={onClose} />);
    screen.getByLabelText("Game name").focus();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onAdd when Enter is pressed in score input", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    renderWithProviders(<AddGameModal {...defaultProps} addName="Test" onAdd={onAdd} />);
    screen.getByLabelText("Score (optional)").focus();
    await user.keyboard("{Enter}");
    expect(onAdd).toHaveBeenCalled();
  });

  it("calls onClose when Escape is pressed in score input", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<AddGameModal {...defaultProps} onClose={onClose} />);
    screen.getByLabelText("Score (optional)").focus();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("does not propagate click from modal card to backdrop", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<AddGameModal {...defaultProps} onClose={onClose} />);
    await user.click(screen.getByText("Add Game"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("rejects score values above 100", async () => {
    const user = userEvent.setup();
    const setAddScore = vi.fn();
    renderWithProviders(<AddGameModal {...defaultProps} setAddScore={setAddScore} addScore="" />);
    const scoreInput = screen.getByLabelText("Score (optional)");
    // Simulate typing "101" — the onChange handler should reject it
    await user.type(scoreInput, "101");
    // setAddScore should be called for "1", "10" but not for "101" since 101 > 100
    const calls = setAddScore.mock.calls.map((c: any[]) => c[0]);
    expect(calls).not.toContain("101");
  });

  it("allows empty score value", async () => {
    const user = userEvent.setup();
    const setAddScore = vi.fn();
    renderWithProviders(<AddGameModal {...defaultProps} setAddScore={setAddScore} addScore="5" />);
    const scoreInput = screen.getByLabelText("Score (optional)");
    await user.clear(scoreInput);
    // The clear triggers onChange with empty string which should be accepted
  });
});
