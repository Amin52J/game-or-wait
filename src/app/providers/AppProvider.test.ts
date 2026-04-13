import { describe, it, expect } from "vitest";
import { INITIAL_STATE } from "@/shared/types";
import type { AppState, AIProviderConfig, Game, SetupAnswers, AnalysisResult } from "@/shared/types";

type Action =
  | { type: "INIT"; payload: AppState; hydrated: boolean }
  | { type: "LOADING" }
  | { type: "SET_AI_PROVIDER"; payload: AIProviderConfig }
  | { type: "SET_GAMES"; payload: Game[] }
  | { type: "ADD_GAME"; payload: Game }
  | { type: "UPDATE_GAME"; payload: Game }
  | { type: "DELETE_GAME"; payload: string }
  | { type: "SET_INSTRUCTIONS"; payload: string }
  | { type: "SET_SETUP_ANSWERS"; payload: SetupAnswers }
  | { type: "COMPLETE_SETUP" }
  | { type: "ADD_ANALYSIS"; payload: AnalysisResult }
  | { type: "UPDATE_ANALYSIS"; payload: { id: string; response: string } }
  | { type: "DELETE_ANALYSIS"; payload: string }
  | { type: "CLEAR_HISTORY" }
  | { type: "RESET" };

interface ReducerState extends AppState {
  hydrated: boolean;
}

function reducer(state: ReducerState, action: Action): ReducerState {
  switch (action.type) {
    case "INIT":
      return { ...action.payload, hydrated: action.hydrated };
    case "LOADING":
      return { ...state, hydrated: false };
    case "SET_AI_PROVIDER":
      return { ...state, aiProvider: action.payload };
    case "SET_GAMES":
      return { ...state, games: action.payload };
    case "ADD_GAME":
      return { ...state, games: [...state.games, action.payload] };
    case "UPDATE_GAME":
      return {
        ...state,
        games: state.games.map((g) => (g.id === action.payload.id ? action.payload : g)),
      };
    case "DELETE_GAME":
      return { ...state, games: state.games.filter((g) => g.id !== action.payload) };
    case "SET_INSTRUCTIONS":
      return { ...state, instructions: action.payload };
    case "SET_SETUP_ANSWERS":
      return { ...state, setupAnswers: action.payload };
    case "COMPLETE_SETUP":
      return { ...state, isSetupComplete: true };
    case "ADD_ANALYSIS":
      return { ...state, analysisHistory: [action.payload, ...state.analysisHistory] };
    case "UPDATE_ANALYSIS":
      return {
        ...state,
        analysisHistory: state.analysisHistory.map((a) =>
          a.id === action.payload.id ? { ...a, response: action.payload.response } : a,
        ),
      };
    case "DELETE_ANALYSIS":
      return {
        ...state,
        analysisHistory: state.analysisHistory.filter((a) => a.id !== action.payload),
      };
    case "CLEAR_HISTORY":
      return { ...state, analysisHistory: [] };
    case "RESET":
      return { ...INITIAL_STATE, hydrated: false };
    default:
      return state;
  }
}

function makeState(overrides: Partial<ReducerState> = {}): ReducerState {
  return { ...INITIAL_STATE, hydrated: true, ...overrides };
}

const sampleProvider: AIProviderConfig = {
  type: "anthropic",
  apiKey: "test-key",
  model: "claude-sonnet-4-6",
};

const sampleGame: Game = { id: "g1", name: "Test Game", score: 80 };

const sampleAnalysis: AnalysisResult = {
  id: "a1",
  gameName: "Test Game",
  price: 60,
  response: "## Public Sentiment\nPositive",
  timestamp: Date.now(),
};

describe("AppProvider reducer", () => {
  describe("INIT", () => {
    it("sets state and hydrated flag", () => {
      const initial = makeState();
      const next = reducer(initial, {
        type: "INIT",
        payload: { ...INITIAL_STATE, isSetupComplete: true },
        hydrated: true,
      });
      expect(next.isSetupComplete).toBe(true);
      expect(next.hydrated).toBe(true);
    });
  });

  describe("LOADING", () => {
    it("sets hydrated to false", () => {
      const state = makeState({ hydrated: true });
      const next = reducer(state, { type: "LOADING" });
      expect(next.hydrated).toBe(false);
    });
  });

  describe("SET_AI_PROVIDER", () => {
    it("sets the AI provider", () => {
      const state = makeState();
      const next = reducer(state, { type: "SET_AI_PROVIDER", payload: sampleProvider });
      expect(next.aiProvider).toEqual(sampleProvider);
    });
  });

  describe("SET_GAMES", () => {
    it("replaces the games list", () => {
      const state = makeState({ games: [sampleGame] });
      const newGames = [{ id: "g2", name: "New Game", score: 90 }];
      const next = reducer(state, { type: "SET_GAMES", payload: newGames });
      expect(next.games).toEqual(newGames);
    });
  });

  describe("ADD_GAME", () => {
    it("appends a game to the list", () => {
      const state = makeState({ games: [sampleGame] });
      const newGame = { id: "g2", name: "Game 2", score: 70 };
      const next = reducer(state, { type: "ADD_GAME", payload: newGame });
      expect(next.games).toHaveLength(2);
      expect(next.games[1]).toEqual(newGame);
    });
  });

  describe("UPDATE_GAME", () => {
    it("updates an existing game by id", () => {
      const state = makeState({ games: [sampleGame] });
      const updated = { ...sampleGame, score: 95 };
      const next = reducer(state, { type: "UPDATE_GAME", payload: updated });
      expect(next.games[0].score).toBe(95);
    });

    it("does not modify other games", () => {
      const game2 = { id: "g2", name: "Other Game", score: 50 };
      const state = makeState({ games: [sampleGame, game2] });
      const updated = { ...sampleGame, score: 95 };
      const next = reducer(state, { type: "UPDATE_GAME", payload: updated });
      expect(next.games[1]).toEqual(game2);
    });
  });

  describe("DELETE_GAME", () => {
    it("removes a game by id", () => {
      const state = makeState({ games: [sampleGame] });
      const next = reducer(state, { type: "DELETE_GAME", payload: "g1" });
      expect(next.games).toHaveLength(0);
    });

    it("does nothing for non-existent id", () => {
      const state = makeState({ games: [sampleGame] });
      const next = reducer(state, { type: "DELETE_GAME", payload: "nonexistent" });
      expect(next.games).toHaveLength(1);
    });
  });

  describe("SET_INSTRUCTIONS", () => {
    it("sets the instructions", () => {
      const state = makeState();
      const next = reducer(state, { type: "SET_INSTRUCTIONS", payload: "New instructions" });
      expect(next.instructions).toBe("New instructions");
    });
  });

  describe("SET_SETUP_ANSWERS", () => {
    it("sets setup answers", () => {
      const state = makeState();
      const answers: SetupAnswers = {
        playStyle: "singleplayer",
        storyImportance: 5,
        gameplayImportance: 4,
        explorationImportance: 3,
        combatImportance: 3,
        puzzleImportance: 2,
        strategyImportance: 2,
        dealbreakers: ["grind"],
        customDealbreakers: [],
        voiceActingPreference: "preferred",
        difficultyPreference: "moderate",
        idealLength: "medium",
        currency: "USD",
        region: "US",
        additionalNotes: "",
      };
      const next = reducer(state, { type: "SET_SETUP_ANSWERS", payload: answers });
      expect(next.setupAnswers).toEqual(answers);
    });
  });

  describe("COMPLETE_SETUP", () => {
    it("sets isSetupComplete to true", () => {
      const state = makeState({ isSetupComplete: false });
      const next = reducer(state, { type: "COMPLETE_SETUP" });
      expect(next.isSetupComplete).toBe(true);
    });
  });

  describe("ADD_ANALYSIS", () => {
    it("prepends analysis to history", () => {
      const existing: AnalysisResult = { ...sampleAnalysis, id: "a0", timestamp: 1000 };
      const state = makeState({ analysisHistory: [existing] });
      const next = reducer(state, { type: "ADD_ANALYSIS", payload: sampleAnalysis });
      expect(next.analysisHistory).toHaveLength(2);
      expect(next.analysisHistory[0]).toEqual(sampleAnalysis);
      expect(next.analysisHistory[1]).toEqual(existing);
    });
  });

  describe("UPDATE_ANALYSIS", () => {
    it("updates the response of an existing analysis", () => {
      const state = makeState({ analysisHistory: [sampleAnalysis] });
      const next = reducer(state, {
        type: "UPDATE_ANALYSIS",
        payload: { id: "a1", response: "Updated response" },
      });
      expect(next.analysisHistory[0].response).toBe("Updated response");
      expect(next.analysisHistory[0].gameName).toBe("Test Game");
    });
  });

  describe("DELETE_ANALYSIS", () => {
    it("removes analysis by id", () => {
      const state = makeState({ analysisHistory: [sampleAnalysis] });
      const next = reducer(state, { type: "DELETE_ANALYSIS", payload: "a1" });
      expect(next.analysisHistory).toHaveLength(0);
    });
  });

  describe("CLEAR_HISTORY", () => {
    it("removes all analysis history", () => {
      const state = makeState({ analysisHistory: [sampleAnalysis] });
      const next = reducer(state, { type: "CLEAR_HISTORY" });
      expect(next.analysisHistory).toEqual([]);
    });
  });

  describe("RESET", () => {
    it("resets to initial state with hydrated false", () => {
      const state = makeState({
        isSetupComplete: true,
        aiProvider: sampleProvider,
        games: [sampleGame],
        analysisHistory: [sampleAnalysis],
      });
      const next = reducer(state, { type: "RESET" });
      expect(next.isSetupComplete).toBe(false);
      expect(next.aiProvider).toBeNull();
      expect(next.games).toEqual([]);
      expect(next.analysisHistory).toEqual([]);
      expect(next.hydrated).toBe(false);
    });
  });

  describe("unknown action", () => {
    it("returns state unchanged", () => {
      const state = makeState();
      const next = reducer(state, { type: "UNKNOWN" } as unknown as Action);
      expect(next).toBe(state);
    });
  });
});
