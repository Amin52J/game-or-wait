// REMOVE ME — this file is unused dead code
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MarkdownBody, StreamRow, StreamCursor } from "./styles";
import { ThinkingDisplay } from "./StreamingSkeleton";
import type { AnalysisMarkdownProps } from "./types";

export function SectionMarkdown({ content }: { content: string }) {
  return (
    <MarkdownBody>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </MarkdownBody>
  );
}

export function AnalysisMarkdown({ source, showStreamCursor, thinkingText }: AnalysisMarkdownProps) {
  const waitingForFirst = showStreamCursor && !source;

  return (
    <MarkdownBody>
      {waitingForFirst ? (
        <ThinkingDisplay text={thinkingText ?? ""} />
      ) : (
        <>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
          {showStreamCursor ? (
            <StreamRow aria-hidden><StreamCursor /></StreamRow>
          ) : null}
        </>
      )}
    </MarkdownBody>
  );
}
