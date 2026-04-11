"use client";

import React, { useMemo } from "react";
import { AnalysisMarkdown, ThemedStructuredResult } from "../ResultCard";
import { parseResponseSections } from "@/features/analyze-game/lib/response-parser";

export function ExpandedContent({
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
    return <ThemedStructuredResult sections={sections} isStreaming={false} fullPrice={fullPrice} currencyCode={currencyCode} />;
  }
  return <AnalysisMarkdown source={response} />;
}
