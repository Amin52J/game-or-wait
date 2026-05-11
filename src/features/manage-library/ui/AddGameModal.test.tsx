import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, resetAllMocks } from "@/__tests__/test-utils";
import { AddGameModal } from "./AddGameModal";

beforeEach(resetAllMocks);

describe("AddGameModal", () => {
  const defaultProps = {
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

  it("has enabled Add button when name is provided", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddGameModal {...defaultProps} />);
    await user.type(screen.getByLabelText("Game name"), "Elden Ring");
    expect(screen.getByRole("button", { name: "Add" })).not.toBeDisabled();
  });

  it("calls onAdd when Add button is clicked", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    renderWithProviders(<AddGameModal {...defaultProps} onAdd={onAdd} />);
    await user.type(screen.getByLabelText("Game name"), "Test Game");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith("Test Game", "");
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

  it("updates game name field when user types", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddGameModal {...defaultProps} />);
    await user.type(screen.getByLabelText("Game name"), "Portal");
    expect(screen.getByLabelText("Game name")).toHaveValue("Portal");
  });

  it("updates score field when user types", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddGameModal {...defaultProps} />);
    await user.type(screen.getByLabelText("Score (optional)"), "8");
    expect(screen.getByLabelText("Score (optional)")).toHaveValue(8);
  });

  it("calls onAdd when Enter is pressed in name input", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    renderWithProviders(<AddGameModal {...defaultProps} onAdd={onAdd} />);
    const nameInput = screen.getByLabelText("Game name");
    await user.type(nameInput, "Test");
    await user.keyboard("{Enter}");
    expect(onAdd).toHaveBeenCalledWith("Test", "");
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
    renderWithProviders(<AddGameModal {...defaultProps} onAdd={onAdd} />);
    await user.type(screen.getByLabelText("Game name"), "Test");
    screen.getByLabelText("Score (optional)").focus();
    await user.keyboard("{Enter}");
    expect(onAdd).toHaveBeenCalledWith("Test", "");
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
    renderWithProviders(<AddGameModal {...defaultProps} />);
    const scoreInput = screen.getByLabelText("Score (optional)");
    await user.type(scoreInput, "101");
    expect(scoreInput).toHaveValue(10);
  });

  it("allows clearing score value", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddGameModal {...defaultProps} />);
    const scoreInput = screen.getByLabelText("Score (optional)");
    await user.type(scoreInput, "5");
    await user.clear(scoreInput);
    expect(scoreInput).toHaveValue(null);
  });
});
