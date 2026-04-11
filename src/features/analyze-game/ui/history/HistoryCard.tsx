// REMOVE ME — this file is unused dead code
"use client";

import React, { useMemo } from "react";
import { AnalysisMarkdown, ThemedStructuredResult, HistoryPreview } from "../ResultCard";
import { parseResponseSections } from "@/features/analyze-game/lib/response-parser";
import type { EnrichedResult } from "./types";
import { formatPrice, formatDate } from "./constants";
import {
  HistoryCardWrapper,
  CardMain,
  CardHeader,
  CardTitleBlock,
  CardTitle,
  CardMeta,
  CardActions,
  ReanalyzeBtn,
  DeleteBtn,
  PreviewContent,
  PreviewBody,
  ExpandHint,
  ExpandedSection,
  InlineMiniScore,
  EarlyAccessTag,
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

interface HistoryCardProps {
  entry: EnrichedResult;
  expanded: boolean;
  confirmDelete: boolean;
  currency: string | undefined;
  onToggle: (id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onReanalyze: (e: React.MouseEvent, gameName: string, price: number) => void;
  onBlurDelete: () => void;
}

export function HistoryCard({
  entry,
  expanded,
  confirmDelete,
  currency,
  onToggle,
  onDelete,
  onReanalyze,
  onBlurDelete,
}: HistoryCardProps) {
  const { item, metrics } = entry;

  return (
    <HistoryCardWrapper $expanded={expanded}>
      <CardHeader>
        <CardMain
          type="button"
          onClick={() => onToggle(item.id)}
          aria-expanded={expanded}
        >
          <CardTitleBlock>
            <CardTitle>
              {item.gameName}
              {metrics.earlyAccess && <EarlyAccessTag>Early Access</EarlyAccessTag>}
            </CardTitle>
            <CardMeta>
              {metrics.score !== null && (
                <InlineMiniScore as="span" $score={metrics.score}>
                  {metrics.score}
                </InlineMiniScore>
              )}
              {formatPrice(item.price, currency)} · {formatDate(item.timestamp)}
            </CardMeta>
          </CardTitleBlock>
        </CardMain>
        <CardActions>
          <ReanalyzeBtn
            type="button"
            onClick={(e) => onReanalyze(e, item.gameName, item.price)}
            aria-label={`Analyze ${item.gameName} again`}
          >
            Analyze Again
          </ReanalyzeBtn>
          <DeleteBtn
            type="button"
            onClick={(e) => onDelete(e, item.id)}
            onBlur={onBlurDelete}
            aria-label={`Delete analysis for ${item.gameName}`}
          >
            {confirmDelete ? "Sure?" : "Delete"}
          </DeleteBtn>
        </CardActions>
      </CardHeader>

      {!expanded ? (
        <CardMain type="button" onClick={() => onToggle(item.id)}>
          <PreviewContent>
            <HistoryPreview
              response={item.response}
              fullPrice={item.price}
              currencyCode={currency}
            />
          </PreviewContent>
          <PreviewBody>
            <ExpandHint>Click to view full analysis</ExpandHint>
          </PreviewBody>
        </CardMain>
      ) : (
        <ExpandedSection>
          <ExpandedContent
            response={item.response}
            fullPrice={item.price}
            currencyCode={currency}
          />
        </ExpandedSection>
      )}
    </HistoryCardWrapper>
  );
}
