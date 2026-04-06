"use client";
import { useApp } from "@/app/providers/AppProvider";
import { SetupWizard } from "@/features/setup-wizard";
import { AnalyzePage } from "@/features/analyze-game";

export default function Home() {
  const { state } = useApp();

  if (!state.isSetupComplete) {
    return <SetupWizard />;
  }

  return <AnalyzePage />;
}
