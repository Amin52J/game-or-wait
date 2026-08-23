"use client";

import React, { useMemo } from "react";
import { AnalysisMarkdown, ThemedStructuredResult } from "../ResultCard";
import { parseResponseSections } from "@/features/analyze-game/lib/response-parser";
import { DiscussionPanel } from "../discussion/DiscussionPanel";

export function ExpandedContent({
  analysisId,
  response,
  originalResponse,
  gameName,
  fullPrice,
  currencyCode,
}: {
  analysisId: string;
  response: string;
  originalResponse?: string;
  gameName?: string;
  fullPrice?: number;
  currencyCode?: string;
}) {
  const sections = useMemo(() => parseResponseSections(response), [response]);
  const hasStructure = sections.filter((s) => s.key !== "preamble").length >= 3;

  return (
    <>
      {hasStructure ? (
        <ThemedStructuredResult
          sections={sections}
          isStreaming={false}
          fullPrice={fullPrice}
          currencyCode={currencyCode}
          coverName={gameName}
        />
      ) : (
        <AnalysisMarkdown source={response} />
      )}
      <DiscussionPanel
        analysisId={analysisId}
        gameName={gameName ?? ""}
        price={fullPrice ?? 0}
        response={response}
        originalResponse={originalResponse}
      />
    </>
  );
}
