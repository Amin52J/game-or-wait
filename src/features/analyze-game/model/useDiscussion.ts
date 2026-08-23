"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AIClient } from "@/entities/ai-provider/api/client";
import type { ChatTurn, DiscussionContext } from "@/entities/ai-provider/api/client";
import { useApp } from "@/app/providers/AppProvider";
import type { DiscussionMessage } from "@/shared/types";
import {
  loadDiscussion,
  insertDiscussionMessage,
  deleteDiscussionMessage,
} from "@/shared/api/db";
import { buildRevisionSummary } from "../lib/revision-summary";

function newId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function resolveCurrencySymbol(code: string | undefined): string {
  if (!code) return "€";
  try {
    const parts = new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? code;
  } catch {
    return code;
  }
}

/** Revision markers are app events, not model output, so they stay out of the transcript. */
function toChatTurns(messages: DiscussionMessage[]): ChatTurn[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

function isAbort(err: unknown): boolean {
  return err instanceof Error && (err.name === "AbortError" || /abort/i.test(err.message));
}

export interface UseDiscussionArgs {
  analysisId: string;
  gameName: string;
  price: number;
  /** The analysis as currently displayed — this is what the AI is asked about. */
  response: string;
}

export function useDiscussion({ analysisId, gameName, price, response }: UseDiscussionArgs) {
  const { state, reviseAnalysis: commitRevision } = useApp();
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [streamedReply, setStreamedReply] = useState("");
  const [revisionDraft, setRevisionDraft] = useState("");
  const [thinkingText, setThinkingText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const hasOwnKey = Boolean(state.aiProvider?.apiKey?.trim());
  const currency = state.setupAnswers?.currency;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    loadDiscussion(analysisId).then((loaded) => {
      if (cancelled) return;
      setMessages(loaded);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, [analysisId]);

  const context: DiscussionContext = useMemo(
    () => ({
      gameName,
      price,
      currencySymbol: resolveCurrencySymbol(currency),
      analysis: response,
      instructions: state.instructions,
    }),
    [gameName, price, currency, response, state.instructions],
  );

  const send = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (!text || !state.aiProvider || isSending || isRevising) return;

      const userMessage: DiscussionMessage = {
        id: newId(),
        analysisId,
        role: "user",
        content: text,
        timestamp: Date.now(),
      };
      const history = toChatTurns(messages);

      setError(null);
      setStreamedReply("");
      setThinkingText("");
      setMessages((prev) => [...prev, userMessage]);
      setIsSending(true);
      void insertDiscussionMessage(userMessage);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const client = new AIClient(state.aiProvider);
        const reply = await client.discuss(
          context,
          history,
          text,
          (chunk) => setStreamedReply((prev) => prev + chunk),
          controller.signal,
          setThinkingText,
        );
        if (!reply.trim()) throw new Error("The AI returned an empty reply.");

        const assistantMessage: DiscussionMessage = {
          id: newId(),
          analysisId,
          role: "assistant",
          content: reply,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        void insertDiscussionMessage(assistantMessage);
      } catch (err) {
        // Drop the orphaned question so the thread stays a clean user/assistant transcript.
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        void deleteDiscussionMessage(userMessage.id);
        if (!isAbort(err)) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
        throw err;
      } finally {
        setStreamedReply("");
        setThinkingText("");
        setIsSending(false);
        abortRef.current = null;
      }
    },
    [analysisId, context, isRevising, isSending, messages, state.aiProvider],
  );

  const revise = useCallback(async () => {
    if (!state.aiProvider || isSending || isRevising) return;

    const previousResponse = response;
    setError(null);
    setRevisionDraft("");
    setThinkingText("");
    setIsRevising(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const client = new AIClient(state.aiProvider);
      const revised = await client.reviseAnalysis(
        context,
        toChatTurns(messages),
        (chunk) => setRevisionDraft((prev) => prev + chunk),
        controller.signal,
        setThinkingText,
      );
      if (!revised.trim()) throw new Error("The AI returned an empty analysis.");

      commitRevision(analysisId, revised, previousResponse);

      const marker: DiscussionMessage = {
        id: newId(),
        analysisId,
        role: "revision",
        content: buildRevisionSummary(previousResponse, revised, price, currency),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, marker]);
      void insertDiscussionMessage(marker);
    } catch (err) {
      if (!isAbort(err)) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      setRevisionDraft("");
      setThinkingText("");
      setIsRevising(false);
      abortRef.current = null;
    }
  }, [
    analysisId,
    commitRevision,
    context,
    currency,
    isRevising,
    isSending,
    messages,
    price,
    response,
    state.aiProvider,
  ]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  return {
    messages,
    isLoading,
    isSending,
    isRevising,
    isBusy: isSending || isRevising,
    streamedReply,
    revisionDraft,
    thinkingText,
    error,
    send,
    revise,
    stop,
    hasOwnKey,
    /** A re-run only makes sense once the AI has actually replied to something. */
    canRevise: messages.some((m) => m.role === "assistant"),
  };
}
