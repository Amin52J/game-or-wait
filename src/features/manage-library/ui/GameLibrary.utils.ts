import { theme } from "@/shared/config/theme";

export const PAGE_SIZE = 50;

/** Must match `Grid` cover min widths in GameLibrary.styles */
export const GRID_COVER_MIN_COL_PX = 160;
export const GRID_COVER_MIN_COL_PX_WIDE = 240;

/** Infinite scroll: each batch adds this many rows of grid items. */
export const SHOWCASE_SCROLL_ROWS_PER_BATCH = 5;

function pxFromTheme(token: string): number {
  return Number.parseFloat(token);
}

export function getGameGridCoverMinColPx(viewportWidthPx: number): number {
  const desktopMin = pxFromTheme(theme.breakpoint.desktop);
  return viewportWidthPx >= desktopMin ? GRID_COVER_MIN_COL_PX_WIDE : GRID_COVER_MIN_COL_PX;
}

export function getGameGridGapPx(viewportWidthPx: number): number {
  const tabletMin = pxFromTheme(theme.breakpoint.tablet);
  return viewportWidthPx >= tabletMin
    ? pxFromTheme(theme.spacing.lg)
    : pxFromTheme(theme.spacing.md);
}

/** Estimates column count for `repeat(auto-fill, minmax(min(100%, M), 1fr))` at a measured width. */
export function countGameGridColumns(gridWidthPx: number, viewportWidthPx: number): number {
  if (gridWidthPx <= 0) return 1;
  const minCol = getGameGridCoverMinColPx(viewportWidthPx);
  const gap = getGameGridGapPx(viewportWidthPx);
  return Math.max(1, Math.floor((gridWidthPx + gap) / (minCol + gap)));
}

export function showcaseInfiniteScrollChunkSize(columns: number): number {
  return SHOWCASE_SCROLL_ROWS_PER_BATCH * Math.max(columns, 1);
}

export const SCORE_RANGES = [
  { key: "90-100", label: "90–100", min: 90, max: 100 },
  { key: "75-89", label: "75–89", min: 75, max: 89 },
  { key: "50-74", label: "50–74", min: 50, max: 74 },
  { key: "25-49", label: "25–49", min: 25, max: 49 },
  { key: "0-24", label: "0–24", min: 0, max: 24 },
  { key: "unscored", label: "Unscored", min: -1, max: -1 },
] as const;
