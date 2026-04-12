import { AnalyzePage } from "@/features/analyze-game";
import { HistoryPage } from "@/features/analyze-game";
import { GameLibrary } from "@/features/manage-library";
import { ScoreCalculatorPage } from "@/features/score-calculator";
import { SettingsPage } from "@/features/manage-settings";
import { HelpPage } from "@/features/help-guide";

export interface PageEntry {
  path: string;
  Component: React.ComponentType;
}

export const PAGES: PageEntry[] = [
  { path: "/analyze", Component: AnalyzePage },
  { path: "/library", Component: GameLibrary },
  { path: "/score", Component: ScoreCalculatorPage },
  { path: "/history", Component: HistoryPage },
  { path: "/settings", Component: SettingsPage },
  { path: "/help", Component: HelpPage },
];

export function matchRoute(pathname: string, route: string): boolean {
  if (route === "/analyze") return pathname === "/analyze" || pathname === "/";
  return pathname === route || pathname.startsWith(`${route}/`);
}
