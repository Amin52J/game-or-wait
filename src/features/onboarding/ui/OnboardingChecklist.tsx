"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useApp } from "@/app/providers/AppProvider";
import { useNavigation } from "@/app/providers/NavigationProvider";
import { Icon } from "@/shared/ui";
import {
  ChecklistRoot,
  ChecklistHeader,
  ChecklistTitle,
  DismissBtn,
  ProgressBarTrack,
  ProgressBarFill,
  StepList,
  StepRow,
  StepCheck,
  StepInfo,
  StepLabel,
  StepDesc,
} from "./OnboardingChecklist.styles";

const DISMISS_KEY = "gf_onboarding_dismissed";

function wasDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(DISMISS_KEY) === "1"; } catch { return false; }
}

interface Step {
  id: string;
  label: string;
  desc: string;
  href: string;
  done: boolean;
}

export function OnboardingChecklist() {
  const { state } = useApp();
  const { setIntent } = useNavigation();
  const [dismissed, setDismissed] = useState(wasDismissed);

  const scoredCount = useMemo(
    () => state.games.filter((g) => g.score !== null).length,
    [state.games],
  );

  const steps: Step[] = useMemo(() => [
    {
      id: "library",
      label: "Import your game library",
      desc: state.games.length > 0
        ? `${state.games.length} games imported`
        : "Add games so the AI can learn your taste",
      href: "/library",
      done: state.games.length >= 1,
    },
    {
      id: "score",
      label: "Score at least 10 games",
      desc: scoredCount > 0
        ? `${scoredCount} game${scoredCount === 1 ? "" : "s"} scored — aim for 10+`
        : "Scored games are the AI's reference for your taste",
      href: scoredCount > 0 && scoredCount < 10 ? "/library" : "/score",
      done: scoredCount >= 10,
    },
    {
      id: "analyze",
      label: "Run your first analysis",
      desc: state.analysisHistory.length > 0
        ? "Done! Check your History for past analyses"
        : "Enter a game name and price to get started",
      href: "/analyze",
      done: state.analysisHistory.length >= 1,
    },
  ], [state.games.length, scoredCount, state.analysisHistory.length]);

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  const handleDismiss = useCallback(() => {
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* noop */ }
    setDismissed(true);
  }, []);

  if (dismissed || !state.isSetupComplete) return null;
  if (allDone) return null;

  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <ChecklistRoot>
      <ChecklistHeader>
        <ChecklistTitle>Getting started</ChecklistTitle>
        <DismissBtn type="button" onClick={handleDismiss}>
          Dismiss
        </DismissBtn>
      </ChecklistHeader>

      <ProgressBarTrack>
        <ProgressBarFill $pct={pct} />
      </ProgressBarTrack>

      <StepList>
        {steps.map((step) => (
          <StepRow
            key={step.id}
            href={step.href}
            $done={step.done}
            onClick={(e) => {
              if (step.done) { e.preventDefault(); return; }
              e.preventDefault();
              setIntent(step.href);
            }}
          >
            <StepCheck $done={step.done}>
              {step.done && <Icon name="check" size={12} />}
            </StepCheck>
            <StepInfo>
              <StepLabel $done={step.done}>{step.label}</StepLabel>
              <StepDesc>{step.desc}</StepDesc>
            </StepInfo>
          </StepRow>
        ))}
      </StepList>
    </ChecklistRoot>
  );
}
