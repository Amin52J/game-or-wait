"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Checkbox,
  PageWrapper,
  PageHeader,
  PageTitle,
  PageSubtitle,
  ButtonRow,
  GuidanceBanner,
} from "@/shared/ui";
import { calculateGameScore, parseTimeInput, type GameScore } from "../lib/gameScorer";
import { FormCard } from "./ScoreCalculatorPage.styles";
import { ScoreResult } from "./ScoreResult";

export function ScoreCalculatorPage() {
  const [timeInput, setTimeInput] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<GameScore | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!timeInput.trim()) {
      setError("Please enter a time value");
      return;
    }

    const timeInMinutes = parseTimeInput(timeInput);
    if (timeInMinutes === null) {
      setError('Invalid time format. Use formats like "1:30", ":30", "2", or "1:"');
      return;
    }

    setResult(calculateGameScore(timeInMinutes, isFinished));
  };

  const handleReset = () => {
    setTimeInput("");
    setIsFinished(false);
    setResult(null);
    setError("");
  };

  return (
    <PageWrapper>
      <PageHeader>
        <PageTitle>Score Calculator</PageTitle>
        <PageSubtitle>
          If a game is worth scoring 76 and up, you should prioritize it yourself. If not, put in
          the time played and whether you completed the game or not and get the score.
        </PageSubtitle>
      </PageHeader>

      <GuidanceBanner variant="info" dismissKey="score_calc_guide" linkText="Full scoring guide" linkHref="/help#scoring">
        <strong>This calculator handles games scored 0–75</strong> (games you thought were
        okay, mediocre, or bad). If you truly loved a game, score it <strong>76–100
        manually</strong> in your library instead — only you know the difference between a
        game you loved and one you merely liked.
      </GuidanceBanner>

      <FormCard onSubmit={handleSubmit}>
        <Input
          id="timeInput"
          label="Time Played"
          hint='Formats: "1:30" (1h 30m), ":30" (30m), "2" (2h)'
          error={error || undefined}
          type="text"
          value={timeInput}
          onChange={(e) => setTimeInput(e.target.value)}
          placeholder="e.g. 1:30, :45, 2"
          autoComplete="off"
        />

        <Checkbox
          label="Game was completed"
          checked={isFinished}
          onChange={(e) => setIsFinished(e.target.checked)}
        />

        <ButtonRow>
          <Button type="submit">Calculate Score</Button>
          {result && (
            <Button variant="secondary" onClick={handleReset}>
              Reset
            </Button>
          )}
        </ButtonRow>
      </FormCard>

      {result && <ScoreResult result={result} />}
    </PageWrapper>
  );
}
