"use client";

import React, { useState } from "react";
import { Button, SectionCard, SectionTitle, SectionDesc } from "@/shared/ui";
import { useApp } from "@/app/providers/AppProvider";
import { gamesToCSV } from "@/entities/game/lib/csv-parser";
import { MarginedButtonRow } from "./SettingsPage.styles";

export function LibrarySection() {
  const { state, setGames } = useApp();
  const [confirmClear, setConfirmClear] = useState(false);

  const handleExport = () => {
    const csv = gamesToCSV(state.games);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GameLibrary.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearLibrary = () => {
    if (confirmClear) {
      setGames([]);
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };

  return (
    <SectionCard>
      <SectionTitle>Library</SectionTitle>
      <SectionDesc>Export your game library as CSV or clear all games.</SectionDesc>
      <MarginedButtonRow>
        <Button variant="secondary" onClick={handleExport}>
          Export CSV
        </Button>
        {state.games.length > 0 && (
          <Button
            variant="danger"
            onClick={handleClearLibrary}
            onBlur={() => setConfirmClear(false)}
          >
            {confirmClear ? "Are you sure?" : "Clear Library"}
          </Button>
        )}
      </MarginedButtonRow>
    </SectionCard>
  );
}
