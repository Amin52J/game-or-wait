import { AppState, INITIAL_STATE } from "@/shared/types";

const STORAGE_KEY = "gameorwait_state";

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI__" in window;
}

export function loadState(): AppState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    return { ...INITIAL_STATE, ...JSON.parse(raw) };
  } catch {
    return INITIAL_STATE;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state:", e);
  }
}

export function exportData(): string {
  const state = loadState();
  return JSON.stringify(state, null, 2);
}

export function importData(json: string): AppState {
  const parsed = JSON.parse(json);
  const state: AppState = { ...INITIAL_STATE, ...parsed };
  saveState(state);
  return state;
}

export function clearData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export async function pickFileContent(): Promise<string | null> {
  if (isTauri()) {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const { readTextFile } = await import("@tauri-apps/plugin-fs");
      const path = await open({
        filters: [{ name: "Data files", extensions: ["csv", "json", "txt"] }],
      });
      if (typeof path === "string") {
        return await readTextFile(path);
      }
    } catch {
      // fall through to web method
    }
  }
  return null;
}
