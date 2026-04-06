import { describe, it, expect } from "vitest";
import {
  INITIAL_STATE,
  DEALBREAKER_OPTIONS,
  DEFAULT_MODELS,
  type AppState,
  type Game,
  type AIProviderConfig,
  type AnalysisResult,
  type SetupAnswers,
} from "./index";

describe("shared/types", () => {
  it("INITIAL_STATE has correct defaults", () => {
    expect(INITIAL_STATE.isSetupComplete).toBe(false);
    expect(INITIAL_STATE.aiProvider).toBeNull();
    expect(INITIAL_STATE.games).toEqual([]);
    expect(INITIAL_STATE.instructions).toBe("");
    expect(INITIAL_STATE.setupAnswers).toBeNull();
    expect(INITIAL_STATE.analysisHistory).toEqual([]);
  });

  it("DEALBREAKER_OPTIONS contains expected entries", () => {
    expect(DEALBREAKER_OPTIONS.length).toBeGreaterThan(0);
    const ids = DEALBREAKER_OPTIONS.map((o) => o.id);
    expect(ids).toContain("grind");
    expect(ids).toContain("always_online");
    expect(ids).toContain("gaas");
    for (const opt of DEALBREAKER_OPTIONS) {
      expect(opt.id).toBeTruthy();
      expect(opt.label).toBeTruthy();
    }
  });

  it("DEFAULT_MODELS has entries for all provider types", () => {
    expect(DEFAULT_MODELS.anthropic.length).toBeGreaterThan(0);
    expect(DEFAULT_MODELS.openai.length).toBeGreaterThan(0);
    expect(DEFAULT_MODELS.custom).toEqual([]);
  });

  it("AppState type allows valid state objects", () => {
    const state: AppState = {
      ...INITIAL_STATE,
      isSetupComplete: true,
      games: [{ id: "1", name: "Test Game", score: 85 }],
    };
    expect(state.isSetupComplete).toBe(true);
    expect(state.games).toHaveLength(1);
  });
});
