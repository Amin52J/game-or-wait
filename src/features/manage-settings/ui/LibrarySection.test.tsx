import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { renderWithProviders, mockAppContext, resetAllMocks, type Game } from "@/__tests__/test-utils";
import { LibrarySection } from "./LibrarySection";

beforeEach(resetAllMocks);

describe("LibrarySection", () => {
  it("renders export action", () => {
    renderWithProviders(<LibrarySection />);
    expect(screen.getByRole("button", { name: /export csv/i })).toBeInTheDocument();
  });

  it("does not show clear when library is empty", () => {
    mockAppContext.state.games = [];
    renderWithProviders(<LibrarySection />);
    expect(screen.queryByRole("button", { name: /clear library/i })).not.toBeInTheDocument();
  });

  it("confirms then clears library when games exist", async () => {
    const user = userEvent.setup();
    mockAppContext.state.games = [{ id: "1", name: "Test", score: null } satisfies Game];
    renderWithProviders(<LibrarySection />);

    await user.click(screen.getByRole("button", { name: /clear library/i }));
    expect(screen.getByRole("button", { name: /are you sure/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /are you sure/i }));
    expect(mockAppContext.setGames).toHaveBeenCalledWith([]);
  });
});
