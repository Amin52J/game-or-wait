import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, resetAllMocks } from "@/__tests__/test-utils";
import { Modal } from "./Modal";

beforeEach(resetAllMocks);

describe("Modal", () => {
  it("does not render when closed", () => {
    renderWithProviders(
      <Modal open={false} onClose={() => {}}>
        Hidden content
      </Modal>,
    );
    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
  });

  it("renders when open", () => {
    renderWithProviders(
      <Modal open={true} onClose={() => {}} title="Test Modal">
        Modal content
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("has correct aria attributes", () => {
    renderWithProviders(
      <Modal open={true} onClose={() => {}} title="Accessible Modal">
        Content
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <Modal open={true} onClose={onClose} title="Test">
        Content
      </Modal>,
    );
    await user.click(screen.getByLabelText("Close dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();
    renderWithProviders(
      <Modal open={true} onClose={onClose}>
        Content
      </Modal>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking backdrop", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <Modal open={true} onClose={onClose}>
        Content
      </Modal>,
    );
    const backdrop = screen.getByRole("presentation");
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });
});
