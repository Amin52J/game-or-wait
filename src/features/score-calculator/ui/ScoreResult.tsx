"use client";

import React from "react";
import { formatTime, type GameScore } from "../lib/gameScorer";
import {
  ResultCardWrap,
  ScoreValue,
  ScoreMax,
  DetailGrid,
  DetailItem,
  DetailLabel,
  DetailValue,
  CompletionNote,
} from "./ScoreCalculatorPage.styles";

export function ScoreResult({ result }: { result: GameScore }) {
  return (
    <>
      <ResultCardWrap>
        <ScoreValue>{result.calculatedScore}</ScoreValue>
      </ResultCardWrap>
    </>
  );
}
