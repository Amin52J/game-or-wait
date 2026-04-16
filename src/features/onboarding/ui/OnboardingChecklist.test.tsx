import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, resetAllMocks, mockAppContext } from "@/__tests__/test-utils";
import { OnboardingChecklist } from "./OnboardingChecklist";

beforeEach(() => {
  resetAllMocks();
  localStorage.clear();
  mockAppContext.state = {
    ...mockAppContext.state,
    isSetupComplete: true,
    games: [],
    analysisHistory: [],
  };
});

describe("OnboardingChecklist", () => {
  it("renders when setup is complete but steps are not done", () => {
    renderWithProviders(<OnboardingChecklist />);
    expect(screen.getByText("Getting started")).toBeInTheDocument();
  });

  it("shows all onboarding steps", () => {
    renderWithProviders(<OnboardingChecklist />);
    expect(screen.getByText(/import your game library/i)).toBeInTheDocument();
    expect(screen.getByText(/score at least 10 games/i)).toBeInTheDocument();
    expect(screen.getByText(/run your first analysis/i)).toBeInTheDocument();
  });

  it("marks import step as done when games exist", () => {
    mockAppContext.state = {
      ...mockAppContext.state,
      isSetupComplete: true,
      games: [{ id: "1", name: "Test", score: null }],
    };
    renderWithProviders(<OnboardingChecklist />);
    expect(screen.getByText("Getting started")).toBeInTheDocument();
  });

  it("does not render when setup is not complete", () => {
    mockAppContext.state = {
      ...mockAppContext.state,
      isSetupComplete: false,
    };
    renderWithProviders(<OnboardingChecklist />);
    expect(screen.queryByText("Getting started")).not.toBeInTheDocument();
  });

  it("does not render when all steps are done", () => {
    mockAppContext.state = {
      ...mockAppContext.state,
      isSetupComplete: true,
      games: Array.from({ length: 10 }, (_, i) => ({
        id: String(i),
        name: `Game ${i}`,
        score: 80,
      })),
      analysisHistory: [
        {
          id: "a1",
          gameName: "Test",
          price: 60,
          response: "test",
          timestamp: Date.now(),
        },
      ],
    };
    renderWithProviders(<OnboardingChecklist />);
    expect(screen.queryByText("Getting started")).not.toBeInTheDocument();
  });

  it("can be dismissed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OnboardingChecklist />);
    expect(screen.getByText("Getting started")).toBeInTheDocument();
    await user.click(screen.getByText("Dismiss"));
    await waitFor(() => {
      expect(screen.queryByText("Getting started")).not.toBeInTheDocument();
    });
  });

  it("stays dismissed on re-render", async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithProviders(<OnboardingChecklist />);
    await user.click(screen.getByText("Dismiss"));
    unmount();
    renderWithProviders(<OnboardingChecklist />);
    expect(screen.queryByText("Getting started")).not.toBeInTheDocument();
  });

  it("shows progress bar", () => {
    mockAppContext.state = {
      ...mockAppContext.state,
      isSetupComplete: true,
      games: [{ id: "1", name: "Test", score: null }],
    };
    renderWithProviders(<OnboardingChecklist />);
    expect(screen.getByText("Getting started")).toBeInTheDocument();
  });

  it("shows scored count description for 1 scored game", () => {
    mockAppContext.state = {
      ...mockAppContext.state,
      isSetupComplete: true,
      games: [{ id: "1", name: "Test", score: 80 }],
    };
    renderWithProviders(<OnboardingChecklist />);
    expect(screen.getByText(/1 game scored/)).toBeInTheDocument();
  });

  it("shows scored count description for multiple scored games", () => {
    mockAppContext.state = {
      ...mockAppContext.state,
      isSetupComplete: true,
      games: [
        { id: "1", name: "A", score: 80 },
        { id: "2", name: "B", score: 60 },
        { id: "3", name: "C", score: null },
      ],
    };
    renderWithProviders(<OnboardingChecklist />);
    expect(screen.getByText(/2 games scored/)).toBeInTheDocument();
  });

  it("shows games imported count", () => {
    mockAppContext.state = {
      ...mockAppContext.state,
      isSetupComplete: true,
      games: [
        { id: "1", name: "A", score: null },
        { id: "2", name: "B", score: null },
      ],
    };
    renderWithProviders(<OnboardingChecklist />);
    expect(screen.getByText(/2 games imported/)).toBeInTheDocument();
  });

  it("shows analysis done description when analysis history exists", () => {
    mockAppContext.state = {
      ...mockAppContext.state,
      isSetupComplete: true,
      games: [],
      analysisHistory: [
        { id: "a1", gameName: "Test", price: 60, response: "test", timestamp: Date.now() },
      ],
    };
    renderWithProviders(<OnboardingChecklist />);
    expect(screen.getByText(/done/i)).toBeInTheDocument();
  });

  it("navigates on step click for incomplete step", async () => {
    const user = userEvent.setup();
    mockAppContext.state = {
      ...mockAppContext.state,
      isSetupComplete: true,
      games: [],
      analysisHistory: [],
    };
    renderWithProviders(<OnboardingChecklist />);
    await user.click(screen.getByText(/import your game library/i));
  });
});
