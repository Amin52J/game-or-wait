"use client";
import { Suspense } from "react";
import { ScoreCalculatorPage } from "@/features/score-calculator";

export default function Score() {
  return (
    <Suspense>
      <ScoreCalculatorPage />
    </Suspense>
  );
}
