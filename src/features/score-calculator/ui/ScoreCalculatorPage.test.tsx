import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, resetAllMocks, mockAppContext } from "@/__tests__/test-utils";
import { ScoreCalculatorPage } from "./ScoreCalculatorPage";

beforeEach(() => {
  resetAllMocks();
  mockAppContext.state = {
    ...mockAppContext.state,
    isSetupComplete: true,
  };
});

describe("ScoreCalculatorPage", () => {
  it("renders the page with title and form", () => {
    renderWithProviders(<ScoreCalculatorPage />);
    expect(screen.getByText("Score Calculator")).toBeInTheDocument();
    expect(screen.getByLabelText("Time Played")).toBeInTheDocument();
    expect(screen.getByText("Game was completed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Calculate Score" })).toBeInTheDocument();
  });

  it("shows error for empty time input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ScoreCalculatorPage />);
    await user.click(screen.getByRole("button", { name: "Calculate Score" }));
    expect(screen.getByText("Please enter a time value")).toBeInTheDocument();
  });

  it("shows error for invalid time format", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ScoreCalculatorPage />);
    await user.type(screen.getByLabelText("Time Played"), "abc");
    await user.click(screen.getByRole("button", { name: "Calculate Score" }));
    expect(screen.getByText(/Invalid time format/i)).toBeInTheDocument();
  });

  it("calculates and displays score for valid input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ScoreCalculatorPage />);
    await user.type(screen.getByLabelText("Time Played"), "1:30");
    await user.click(screen.getByRole("button", { name: "Calculate Score" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
    });
  });

  it("toggles finished checkbox", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ScoreCalculatorPage />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    await user.click(screen.getByText("Game was completed"));
    expect(checkbox).toBeChecked();
  });

  it("shows reset button after calculating", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ScoreCalculatorPage />);
    await user.type(screen.getByLabelText("Time Played"), "2:00");
    await user.click(screen.getByRole("button", { name: "Calculate Score" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
    });
  });

  it("resets form when reset is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ScoreCalculatorPage />);
    await user.type(screen.getByLabelText("Time Played"), "2:00");
    await user.click(screen.getByRole("button", { name: "Calculate Score" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByLabelText("Time Played")).toHaveValue("");
    expect(screen.queryByRole("button", { name: "Reset" })).not.toBeInTheDocument();
  });
});
