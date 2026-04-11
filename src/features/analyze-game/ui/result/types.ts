// REMOVE ME — this file is unused dead code
import type { RiskLevel } from "@/features/analyze-game/lib/response-parser";

export type SectionAccent =
  | "default"
  | "positive"
  | "negative"
  | "warning"
  | "risk-none"
  | "risk-medium"
  | "risk-high";

export interface AnalysisMarkdownProps {
  source: string;
  showStreamCursor?: boolean;
  thinkingText?: string;
}

export interface ResultCardProps {
  response: string;
  gameName: string;
  price: number;
  isStreaming: boolean;
  thinkingText?: string;
}

/* ——— Color / accent helpers ——— */

export function riskAccent(level: RiskLevel): SectionAccent {
  if (level === "high") return "risk-high";
  if (level === "medium") return "risk-medium";
  if (level === "none") return "risk-none";
  return "default";
}

export function riskColor(level: RiskLevel, theme: { colors: Record<string, string> }): string {
  if (level === "high") return theme.colors.error;
  if (level === "medium") return theme.colors.warning;
  if (level === "none") return theme.colors.success;
  return theme.colors.textSecondary;
}

export function confidenceColor(level: string, theme: { colors: Record<string, string> }): string {
  const lower = level.toLowerCase();
  if (lower === "very high" || lower === "high") return theme.colors.success;
  if (lower === "medium") return theme.colors.warning;
  return theme.colors.error;
}

export function scoreColor(score: number, theme: { colors: Record<string, string> }): string {
  if (score >= 80) return theme.colors.success;
  if (score >= 60) return theme.colors.accent;
  if (score >= 40) return theme.colors.warning;
  return theme.colors.error;
}

export function priceColor(text: string, theme: { colors: Record<string, string> }): string {
  const lower = text.toLowerCase();
  if (lower.includes("don't buy") || lower.includes("don\u2019t buy")) return theme.colors.error;
  return theme.colors.success;
}

/* ——— Formatters ——— */

export function formatCurrencyValue(price: number, currencyCode: string | undefined): string {
  const code = currencyCode || "USD";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${code} ${price}`;
  }
}

export function formatPrice(price: number, currencyCode: string | undefined): string {
  const code = currencyCode || "USD";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(price);
  } catch {
    return `${code} ${price.toFixed(2)}`;
  }
}

/* ——— Shared static fallback theme (used by ThemedStructuredResult / HistoryPreview) ——— */

export const STATIC_THEME = {
  colors: {
    success: "#22c55e",
    accent: "#7c8aff",
    warning: "#f59e0b",
    error: "#ef4444",
    text: "#e4e4f0",
    textSecondary: "#8888a8",
    textMuted: "#555570",
  },
} as const;
