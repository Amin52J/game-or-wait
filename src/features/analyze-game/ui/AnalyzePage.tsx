"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/app/providers/AppProvider";
import { useAnalysis } from "@/features/analyze-game/model/useAnalysis";
import { sessionCache } from "@/features/analyze-game/model/session-cache";
import { OnboardingChecklist } from "@/features/onboarding";
import { AnalyzeForm } from "./AnalyzeForm";
import { ResultCard } from "./ResultCard";
import { Button, GuidanceBanner } from "@/shared/ui";
import { Page, Toolbar, ExpandBar, ExpandHint, ErrorBox } from "./AnalyzePage.styles";
import { errorMessage } from "./AnalyzePage.utils";

export function AnalyzePage() {
  const {
    analyze,
    isLoading,
    isStreaming,
    isExpanding,
    expanded,
    expand,
    streamedText,
    thinkingText,
    result,
    error,
    reset,
    stop,
  } = useAnalysis();
  const cached = sessionCache.get();
  const [session, setSession] = useState<{ gameName: string; price: number } | null>(
    cached.result ? { gameName: cached.result.gameName, price: cached.result.price } : null,
  );
  const [formKey, setFormKey] = useState(0);
  const [lastPrefillId, setLastPrefillId] = useState(0);
  const currentPrefillId = sessionCache.get().prefillId;
  if (currentPrefillId > lastPrefillId) {
    setLastPrefillId(currentPrefillId);
    setSession(null);
    setFormKey((k) => k + 1);
  }

  const bottomRef = useRef<HTMLDivElement>(null);
  const wasStreamingRef = useRef(false);
  const userScrolledRef = useRef(false);

  useEffect(() => {
    const active = isStreaming || isExpanding;
    if (!active) return;

    userScrolledRef.current = false;
    const onUserScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      userScrolledRef.current = !nearBottom;
    };
    window.addEventListener("wheel", onUserScroll, { passive: true });
    window.addEventListener("touchmove", onUserScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onUserScroll);
      window.removeEventListener("touchmove", onUserScroll);
    };
  }, [isStreaming, isExpanding]);

  useEffect(() => {
    const active = isStreaming || isExpanding;
    if (active) {
      wasStreamingRef.current = true;
      if (!userScrolledRef.current) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    } else if (wasStreamingRef.current) {
      wasStreamingRef.current = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isStreaming, isExpanding, streamedText]);

  const handleSubmit = useCallback(
    (gameName: string, price: number) => {
      setSession({ gameName, price });
      sessionCache.set({ gameName, priceRaw: String(price) });
      analyze({ gameName, price });
    },
    [analyze],
  );

  const handleNewAnalysis = useCallback(() => {
    reset();
    setSession(null);
    setFormKey((k) => k + 1);
  }, [reset]);

  const showResult = Boolean(session);
  const isDone = !isStreaming && !isLoading && !isExpanding && (session || result);
  const canExpand = isDone && result && !expanded;

  const displayResponse = streamedText || result?.response || "";
  const displayName = result?.gameName ?? session?.gameName ?? "";
  const displayPrice = result?.price ?? session?.price ?? 0;

  const { state } = useApp();
  const scoredCount = useMemo(
    () => state.games.filter((g) => g.score !== null).length,
    [state.games],
  );
  const hasLibrary = state.games.length > 0;
  const hasEnoughScored = scoredCount >= 10;
  const showBanners = !showResult && !isLoading && !isStreaming;

  return (
    <Page>
      <OnboardingChecklist />

      {showBanners && (
        <GuidanceBanner
          variant="tip"
          dismissKey="analyze_intro"
          linkText="Learn more"
          linkHref="/help#analyzing"
        >
          <strong>Enter a game you&apos;re thinking of buying</strong> and its current price. The AI
          will search for reviews, compare them against your taste profile and scored library, and
          tell you how much you&apos;ll likely enjoy it — plus a target price that reflects its
          value <em>to you</em>.
        </GuidanceBanner>
      )}

      {showBanners && !hasLibrary && (
        <GuidanceBanner variant="warning" linkText="Go to Library" linkHref="/library">
          <strong>Your game library is empty.</strong> Import or add games and score them so the AI
          can use your taste as a reference. Without a library, analyses will be generic and less
          accurate.
        </GuidanceBanner>
      )}

      {showBanners && hasLibrary && scoredCount === 0 && (
        <GuidanceBanner variant="warning" linkText="Score your games" linkHref="/library">
          <strong>None of your {state.games.length} games have a score.</strong> Only scored games
          are sent to the AI. Head to your library and score them — even rough scores make a big
          difference.
        </GuidanceBanner>
      )}

      {showBanners && hasLibrary && scoredCount > 0 && !hasEnoughScored && (
        <GuidanceBanner variant="info" linkText="Learn about scoring" linkHref="/help#scoring">
          <strong>
            You have {scoredCount} scored game{scoredCount === 1 ? "" : "s"}.
          </strong>{" "}
          Aim for at least 10 scored games across different genres for the best analysis accuracy.
        </GuidanceBanner>
      )}

      {showBanners && state.setupAnswers && (
        <GuidanceBanner
          variant="info"
          dismissKey="prefs_active"
          linkText="Update preferences"
          linkHref="/settings"
        >
          <strong>Your taste preferences are shaping every analysis.</strong> The sliders,
          dealbreakers, and play style you set during setup are actively used. If results feel off,
          reviewing your preferences in Settings can help.
        </GuidanceBanner>
      )}

      <AnalyzeForm key={formKey} onSubmit={handleSubmit} isLoading={isLoading} />

      {isStreaming || isLoading || isExpanding ? (
        <Toolbar>
          <Button type="button" variant="secondary" size="md" onClick={stop}>
            {isExpanding ? "Stop Expanding" : "Stop Analysis"}
          </Button>
        </Toolbar>
      ) : isDone ? (
        <Toolbar>
          <Button type="button" variant="secondary" size="md" onClick={handleNewAnalysis}>
            New Analysis
          </Button>
        </Toolbar>
      ) : null}

      {showResult ? (
        <>
          <ResultCard
            response={displayResponse}
            gameName={displayName}
            price={displayPrice}
            isStreaming={isStreaming || isExpanding}
            thinkingText={thinkingText}
          />
          {canExpand && (
            <ExpandBar>
              <Button type="button" variant="primary" size="lg" fullWidth onClick={expand}>
                More Details
              </Button>
              <ExpandHint>
                Get an expanded breakdown with deeper sections tailored to your preferences
              </ExpandHint>
            </ExpandBar>
          )}
        </>
      ) : null}

      {error ? <ErrorBox role="alert">{errorMessage(error)}</ErrorBox> : null}

      <div ref={bottomRef} />
    </Page>
  );
}
