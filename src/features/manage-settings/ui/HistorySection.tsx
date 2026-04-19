"use client";

import React, { useState } from "react";
import { Button, SectionCard, SectionTitle, SectionDesc } from "@/shared/ui";
import { useApp } from "@/app/providers/AppProvider";
import { MarginedButtonRow } from "./SettingsPage.styles";

export function HistorySection() {
  const { state, clearHistory } = useApp();
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearHistory = () => {
    if (confirmClear) {
      clearHistory();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };

  return (
    <SectionCard>
      <SectionTitle>History</SectionTitle>
      <SectionDesc>Clear all past analyses from your history.</SectionDesc>
      <MarginedButtonRow>
        {state.analysisHistory.length > 0 && (
          <Button
            variant="danger"
            onClick={handleClearHistory}
            onBlur={() => setConfirmClear(false)}
          >
            {confirmClear ? "Are you sure?" : "Clear History"}
          </Button>
        )}
      </MarginedButtonRow>
    </SectionCard>
  );
}
