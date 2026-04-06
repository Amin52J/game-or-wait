import { describe, it, expect, beforeEach } from "vitest";
import { loadState, saveState, exportData, importData, clearData } from "./storage";
import { INITIAL_STATE } from "@/shared/types";

beforeEach(() => {
  localStorage.clear();
});

describe("storage", () => {
  it("loadState returns INITIAL_STATE when nothing is saved", () => {
    const state = loadState();
    expect(state).toEqual(INITIAL_STATE);
  });

  it("saveState + loadState round-trips correctly", () => {
    const state = {
      ...INITIAL_STATE,
      isSetupComplete: true,
      instructions: "test instructions",
      games: [{ id: "1", name: "Test", score: 80 }],
    };
    saveState(state);
    const loaded = loadState();
    expect(loaded.isSetupComplete).toBe(true);
    expect(loaded.instructions).toBe("test instructions");
    expect(loaded.games).toHaveLength(1);
    expect(loaded.games[0].name).toBe("Test");
  });

  it("clearData removes saved state", () => {
    saveState({ ...INITIAL_STATE, isSetupComplete: true });
    clearData();
    const loaded = loadState();
    expect(loaded).toEqual(INITIAL_STATE);
  });

  it("exportData returns JSON string", () => {
    saveState({ ...INITIAL_STATE, instructions: "hello" });
    const data = exportData();
    const parsed = JSON.parse(data);
    expect(parsed.instructions).toBe("hello");
  });

  it("importData restores state from JSON", () => {
    const json = JSON.stringify({ ...INITIAL_STATE, isSetupComplete: true });
    const state = importData(json);
    expect(state.isSetupComplete).toBe(true);
    const loaded = loadState();
    expect(loaded.isSetupComplete).toBe(true);
  });

  it("loadState handles corrupted localStorage gracefully", () => {
    localStorage.setItem("gamefit_state", "not json");
    const state = loadState();
    expect(state).toEqual(INITIAL_STATE);
  });

  it("loadState merges with INITIAL_STATE for missing fields", () => {
    localStorage.setItem("gamefit_state", JSON.stringify({ isSetupComplete: true }));
    const state = loadState();
    expect(state.isSetupComplete).toBe(true);
    expect(state.games).toEqual([]);
    expect(state.instructions).toBe("");
  });
});
