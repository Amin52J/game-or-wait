// REMOVE ME — this file is unused dead code
"use client";

import React, { useMemo } from "react";
import { AnalysisMarkdown, ThemedStructuredResult } from "../ResultCard";
import { parseResponseSections } from "@/features/analyze-game/lib/response-parser";
import type { EnrichedResult } from "./types";
import { formatPrice, formatDateShort } from "./constants";
import {
  ListItemWrapper,
  ListRow,
  ListGameCell,
  ListGameTopRow,
  ListGameName,
  ListMobileMeta,
  ListMeta,
  ListDeleteBtn,
  ListExpandedSection,
  ListExpandedToolbar,
  ReanalyzeBtn,
  MiniScore,
  RiskBadge,
  EarlyAccessTag,
  ListRowActionsCell,
} from "./styles";

function ExpandedContent({
  response,
  fullPrice,
  currencyCode,
}: {
  response: string;
  fullPrice?: number;
  currencyCode?: string;
}) {
  const sections = useMemo(() => parseResponseSections(response), [response]);
  const hasStructure = sections.filter((s) => s.key !== "preamble").length >= 3;

  if (hasStructure) {
    return (
      <ThemedStructuredResult
        sections={sections}
        isStreaming={false}
        fullPrice={fullPrice}
        currencyCode={currencyCode}
      />
    );
  }
  return <AnalysisMarkdown source={response} />;
}

interface HistoryListItemProps {
  entry: EnrichedResult;
  expanded: boolean;
  confirmDelete: boolean;
  currency: string | undefined;
  onToggle: (id: string) => void;
  onListDelete: (id: string) => void;
  onReanalyze: (e: React.MouseEvent, gameName: string, price: number) => void;
  onBlurDelete: () => void;
}

export function HistoryListItem({
  entry,
  expanded,
  confirmDelete,
  currency,
  onToggle,
  onListDelete,
  onReanalyze,
  onBlurDelete,
}: HistoryListItemProps) {
  const { item, metrics } = entry;

  return (
    <ListItemWrapper>
      <ListRow onClick={() => onToggle(item.id)}>
        <div>
          <MiniScore $score={metrics.score}>
            {metrics.score !== null ? metrics.score : "—"}
          </MiniScore>
        </div>
        <ListGameCell>
          <ListGameTopRow>
            <ListGameName title={item.gameName}>{item.gameName}</ListGameName>
            {metrics.earlyAccess && <EarlyAccessTag>EA</EarlyAccessTag>}
          </ListGameTopRow>
          <ListMobileMeta>
            {formatPrice(item.price, currency)} · {formatDateShort(item.timestamp)}
            {metrics.riskLevel !== "unknown" && ` · ${metrics.riskLevel} risk`}
          </ListMobileMeta>
        </ListGameCell>
        <ListMeta>{formatPrice(item.price, currency)}</ListMeta>
        <ListMeta>{formatDateShort(item.timestamp)}</ListMeta>
        <div>
          <RiskBadge $level={metrics.riskLevel}>
            {metrics.riskLevel === "unknown" ? "—" : metrics.riskLevel}
          </RiskBadge>
        </div>
        <ListRowActionsCell>
          <ListDeleteBtn
            type="button"
            $confirm={confirmDelete}
            onClick={(e) => {
              e.stopPropagation();
              onListDelete(item.id);
            }}
            onBlur={onBlurDelete}
            aria-label={`Delete analysis for ${item.gameName}`}
          >
            {confirmDelete ? "Sure?" : "Delete"}
          </ListDeleteBtn>
        </ListRowActionsCell>
      </ListRow>
      {expanded && (
        <ListExpandedSection>
          <ListExpandedToolbar>
            <ReanalyzeBtn
              type="button"
              onClick={(e) => onReanalyze(e, item.gameName, item.price)}
              aria-label={`Analyze ${item.gameName} again`}
            >
              Analyze Again
            </ReanalyzeBtn>
          </ListExpandedToolbar>
          <ExpandedContent
            response={item.response}
            fullPrice={item.price}
            currencyCode={currency}
          />
        </ListExpandedSection>
      )}
    </ListItemWrapper>
  );
}
