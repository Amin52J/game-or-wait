import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import {
  renderWithProviders,
  mockAppContext,
  resetAllMocks,
  type AnalysisResult,
} from "@/__tests__/test-utils";
import { HistorySection } from "./HistorySection";

beforeEach(resetAllMocks);

describe("HistorySection", () => {
  it("hides clear when history is empty", () => {
    mockAppContext.state.analysisHistory = [];
    renderWithProviders(<HistorySection />);
    expect(screen.queryByRole("button", { name: /clear history/i })).not.toBeInTheDocument();
  });

  it("confirms then clears history", async () => {
    const user = userEvent.setup();
    mockAppContext.state.analysisHistory = [
      {
        id: "a",
        gameName: "G",
        price: 0,
        response: "",
        timestamp: 0,
      } satisfies AnalysisResult,
    ];
    renderWithProviders(<HistorySection />);

    await user.click(screen.getByRole("button", { name: /clear history/i }));
    await user.click(screen.getByRole("button", { name: /are you sure/i }));
    expect(mockAppContext.clearHistory).toHaveBeenCalledTimes(1);
  });
});
