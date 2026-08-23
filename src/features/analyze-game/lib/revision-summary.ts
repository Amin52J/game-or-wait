import { parseResponseSections, extractMetrics, computeTargetPrice } from "./response-parser";
import type { ExtractedMetrics } from "./response-parser";

function formatCurrency(price: number, currencyCode: string | undefined): string {
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

function targetPriceLabel(
  metrics: ExtractedMetrics,
  fullPrice: number,
  currencyCode: string | undefined,
): string | null {
  if (metrics.score === null) return null;
  const { value, label } = computeTargetPrice(
    metrics.score,
    metrics.riskLevel,
    metrics.confidence,
    fullPrice,
    metrics.refundRecommended,
  );
  return value === null ? label : formatCurrency(value, currencyCode);
}

const RISK_LABELS: Record<string, string> = {
  none: "none",
  medium: "medium",
  high: "high",
  unknown: "unknown",
};

/**
 * Describes what a re-run changed, so the discussion thread keeps a readable
 * record of why the score on the card is no longer the original one.
 */
export function buildRevisionSummary(
  before: string,
  after: string,
  fullPrice: number,
  currencyCode: string | undefined,
): string {
  const prev = extractMetrics(parseResponseSections(before));
  const next = extractMetrics(parseResponseSections(after));
  const changes: string[] = [];

  if (prev.score !== null && next.score !== null && prev.score !== next.score) {
    changes.push(`Enjoyment score **${prev.score} → ${next.score}**`);
  }

  const prevPrice = targetPriceLabel(prev, fullPrice, currencyCode);
  const nextPrice = targetPriceLabel(next, fullPrice, currencyCode);
  if (prevPrice && nextPrice && prevPrice !== nextPrice) {
    changes.push(`Target price **${prevPrice} → ${nextPrice}**`);
  }

  if (prev.riskLevel !== next.riskLevel && next.riskLevel !== "unknown") {
    changes.push(`Red-line risk **${RISK_LABELS[prev.riskLevel]} → ${RISK_LABELS[next.riskLevel]}**`);
  }

  if (prev.refundRecommended !== next.refundRecommended) {
    changes.push(
      next.refundRecommended
        ? "Refund guard is now **recommended**"
        : "Refund guard is **no longer recommended**",
    );
  }

  if (changes.length === 0) {
    return "Analysis re-run from this discussion — the score and target price came out the same.";
  }
  return `Analysis re-run from this discussion. ${changes.join(" · ")}`;
}
