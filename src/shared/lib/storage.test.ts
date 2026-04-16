import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadState,
  saveState,
  exportData,
  importData,
  clearData,
  pickFileContent,
} from "./storage";
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

  it("saveState handles localStorage errors gracefully", () => {
    const origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    expect(() => saveState(INITIAL_STATE)).not.toThrow();
    localStorage.setItem = origSetItem;
  });

  it("importData merges with INITIAL_STATE", () => {
    const json = JSON.stringify({ instructions: "custom" });
    const state = importData(json);
    expect(state.instructions).toBe("custom");
    expect(state.games).toEqual([]);
  });

  it("importData throws on invalid JSON", () => {
    expect(() => importData("not valid json")).toThrow();
  });

  it("exportData returns prettified JSON", () => {
    saveState({ ...INITIAL_STATE, instructions: "test" });
    const data = exportData();
    expect(data).toContain("\n");
    expect(data).toContain("  ");
  });

  it("clearData is idempotent", () => {
    clearData();
    clearData();
    expect(loadState()).toEqual(INITIAL_STATE);
  });

  describe("pickFileContent", () => {
    it("returns null in non-Tauri environment", async () => {
      const result = await pickFileContent();
      expect(result).toBeNull();
    });

    it("attempts Tauri dialog when __TAURI__ is present", async () => {
      Object.defineProperty(window, "__TAURI__", { value: {}, configurable: true });
      const result = await pickFileContent();
      // Falls through to null since Tauri modules aren't available
      expect(result).toBeNull();
      delete (window as any).__TAURI__;
    });
  });
});
