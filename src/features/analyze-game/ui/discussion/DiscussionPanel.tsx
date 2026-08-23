"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button, HashLink, Icon, TextArea } from "@/shared/ui";
import { useDiscussion } from "@/features/analyze-game/model/useDiscussion";
import { AnalysisMarkdown, MarkdownBody } from "../ResultCard";
import {
  Panel,
  PanelHeader,
  HeaderToggle,
  PanelTitle,
  MessageCount,
  Chevron,
  OriginalToggle,
  PanelBody,
  OriginalBox,
  OriginalLabel,
  Thread,
  UserBubble,
  AssistantBubble,
  RevisionMarker,
  RevisionProgress,
  RevisionProgressLabel,
  RevisionPreview,
  Suggestions,
  SuggestionChip,
  Composer,
  ComposerActions,
  ComposerHint,
  ButtonGroup,
  ReviseBar,
  ReviseHint,
  Note,
  ErrorNote,
} from "./DiscussionPanel.styles";

const SUGGESTIONS = [
  "Explain how you arrived at this score.",
  "You misread one of my taste points: ",
  "What would change your mind about this?",
];

export interface DiscussionPanelProps {
  analysisId: string;
  gameName: string;
  price: number;
  response: string;
  originalResponse?: string;
  defaultOpen?: boolean;
}

export function DiscussionPanel({
  analysisId,
  gameName,
  price,
  response,
  originalResponse,
  defaultOpen = false,
}: DiscussionPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [showOriginal, setShowOriginal] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(false);

  const {
    messages,
    isLoading,
    isSending,
    isRevising,
    isBusy,
    streamedReply,
    revisionDraft,
    thinkingText,
    error,
    send,
    revise,
    stop,
    hasOwnKey,
    canRevise,
  } = useDiscussion({ analysisId, gameName, price, response });

  useEffect(() => {
    if (!open) return;
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [open, messages.length, isSending, isRevising]);

  const submit = useCallback(async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    try {
      await send(text);
    } catch {
      setDraft(text);
    }
  }, [draft, send]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void submit();
      }
    },
    [submit],
  );

  const applySuggestion = useCallback((text: string) => {
    setDraft(text);
    inputRef.current?.focus();
  }, []);

  const visibleCount = messages.filter((m) => m.role !== "revision").length;

  return (
    <Panel>
      <PanelHeader>
        <HeaderToggle
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`discussion-${analysisId}`}
        >
          <Icon name="message-circle" size={16} />
          <PanelTitle>Discuss this analysis</PanelTitle>
          {visibleCount > 0 && <MessageCount>{visibleCount}</MessageCount>}
        </HeaderToggle>
        {originalResponse && open ? (
          <OriginalToggle type="button" onClick={() => setShowOriginal((v) => !v)}>
            {showOriginal ? "Hide original" : "View original"}
          </OriginalToggle>
        ) : null}
        <Chevron>
          <Icon name={open ? "chevron-up" : "chevron-down"} size={16} />
        </Chevron>
      </PanelHeader>

      {open ? (
        <PanelBody id={`discussion-${analysisId}`}>
          {!hasOwnKey ? (
            <Note>
              Discussing an analysis runs extra AI requests, so it needs your own API key.{" "}
              <HashLink href="/settings">Add a key in Settings</HashLink> to ask follow-up
              questions and correct mistakes.
            </Note>
          ) : (
            <>
              {showOriginal && originalResponse ? (
                <OriginalBox>
                  <OriginalLabel>Original analysis, before any re-run</OriginalLabel>
                  <AnalysisMarkdown source={originalResponse} />
                </OriginalBox>
              ) : null}

              {isLoading ? (
                <Note>Loading discussion…</Note>
              ) : (
                <Thread>
                  {messages.map((message) => {
                    if (message.role === "user") {
                      return <UserBubble key={message.id}>{message.content}</UserBubble>;
                    }
                    if (message.role === "revision") {
                      return (
                        <RevisionMarker key={message.id}>
                          <Icon name="history" size={14} />
                          <MarkdownBody>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </MarkdownBody>
                        </RevisionMarker>
                      );
                    }
                    return (
                      <AssistantBubble key={message.id}>
                        <AnalysisMarkdown source={message.content} />
                      </AssistantBubble>
                    );
                  })}

                  {isSending ? (
                    <AssistantBubble>
                      <AnalysisMarkdown
                        source={streamedReply}
                        showStreamCursor
                        thinkingText={thinkingText}
                      />
                    </AssistantBubble>
                  ) : null}

                  {isRevising ? (
                    <RevisionProgress>
                      <RevisionProgressLabel>
                        Re-running the analysis with this discussion…
                      </RevisionProgressLabel>
                      <RevisionPreview>{revisionDraft || thinkingText || "Thinking…"}</RevisionPreview>
                    </RevisionProgress>
                  ) : null}

                  <div ref={bottomRef} />
                </Thread>
              )}

              {error ? <ErrorNote role="alert">{error.message}</ErrorNote> : null}

              {messages.length === 0 && !isBusy && !isLoading ? (
                <Suggestions>
                  {SUGGESTIONS.map((s) => (
                    <SuggestionChip key={s} type="button" onClick={() => applySuggestion(s)}>
                      {s.replace(/:\s*$/, "…")}
                    </SuggestionChip>
                  ))}
                </Suggestions>
              ) : null}

              <Composer>
                <TextArea
                  ref={inputRef}
                  rows={2}
                  autoGrow
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isBusy}
                  placeholder={`Ask about the ${gameName} analysis, or correct something it got wrong…`}
                  aria-label="Your question about this analysis"
                />
                <ComposerActions>
                  <ComposerHint>Enter to send · Shift+Enter for a new line</ComposerHint>
                  <ButtonGroup>
                    {isBusy ? (
                      <Button type="button" variant="secondary" size="sm" onClick={stop}>
                        Stop
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={submit}
                      disabled={!draft.trim() || isBusy}
                    >
                      Ask
                    </Button>
                  </ButtonGroup>
                </ComposerActions>
              </Composer>

              {canRevise ? (
                <ReviseBar>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    fullWidth
                    onClick={revise}
                    disabled={isBusy}
                  >
                    {isRevising ? "Re-running analysis…" : "Re-run score & price"}
                  </Button>
                  <ReviseHint>
                    Regenerates the full analysis using this discussion. Only needed when something
                    here should change the score — questions alone don&apos;t require it.
                  </ReviseHint>
                </ReviseBar>
              ) : null}
            </>
          )}
        </PanelBody>
      ) : null}
    </Panel>
  );
}
