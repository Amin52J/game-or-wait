export interface Game {
  id: string;
  name: string;
  sortingName?: string;
  score: number | null;
}

export type AIProviderType = "anthropic" | "openai" | "custom";

export interface AIProviderConfig {
  type: AIProviderType;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export const DEFAULT_MODELS: Record<AIProviderType, string[]> = {
  anthropic: ["claude-sonnet-4-20250514", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1", "o3-mini"],
  custom: [],
};

export interface SetupAnswers {
  playStyle: "singleplayer" | "multiplayer" | "both";
  storyImportance: number;
  gameplayImportance: number;
  explorationImportance: number;
  combatImportance: number;
  puzzleImportance: number;
  strategyImportance: number;
  dealbreakers: string[];
  voiceActingPreference: "essential" | "preferred" | "indifferent" | "fine_with_text";
  difficultyPreference: "easy" | "moderate" | "challenging" | "soulslike";
  idealLength: "short" | "medium" | "long" | "any";
  currency: string;
  region: string;
  additionalNotes: string;
}

export const DEALBREAKER_OPTIONS = [
  { id: "grind", label: "Repetitive grind / busywork" },
  { id: "always_online", label: "Always-online requirement for SP" },
  { id: "heavy_reading", label: "Heavy reading / text-only dialogue" },
  { id: "bad_controls", label: "Clunky controls / movement" },
  { id: "religious_themes", label: "Heavy religious themes" },
  { id: "slow_start", label: "Slow starts / long tutorials" },
  { id: "microtransactions", label: "Aggressive microtransactions" },
  { id: "shallow_crafting", label: "Shallow collecting / crafting" },
  { id: "bad_story", label: "Weak or absent story" },
  { id: "wayfinding", label: "Poor navigation / getting lost" },
  { id: "short_campaign", label: "Very short campaigns at full price" },
  { id: "gaas", label: "Games-as-a-service / live-service focus" },
] as const;

export interface AnalysisRequest {
  gameName: string;
  price: number;
}

export interface AnalysisResult {
  id: string;
  gameName: string;
  price: number;
  response: string;
  timestamp: number;
}

export interface AppState {
  isSetupComplete: boolean;
  aiProvider: AIProviderConfig | null;
  games: Game[];
  instructions: string;
  setupAnswers: SetupAnswers | null;
  analysisHistory: AnalysisResult[];
}

export const INITIAL_STATE: AppState = {
  isSetupComplete: false,
  aiProvider: null,
  games: [],
  instructions: "",
  setupAnswers: null,
  analysisHistory: [],
};
