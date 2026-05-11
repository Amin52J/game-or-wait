"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Game } from "@/shared/types";
import { publishLibraryShowcase } from "@/shared/api/db";
import {
  Button,
  PageWrapper,
  PageHeader,
  PageTitle,
  PageSubtitle,
  HashLink,
  GuidanceBanner,
} from "@/shared/ui";
import { AddGameModal } from "./AddGameModal";
import { useGameLibrary } from "./GameLibrary.hooks";
import { AddGameButtonRow, ShowcaseShareSection } from "./GameLibrary.styles";
import { GameTable } from "./GameTable";
import { ImportSection } from "./ImportSection";
import { LibraryPagination } from "./LibraryPagination";
import { LibraryStats } from "./LibraryStats";
import { LibraryToolbar } from "./LibraryToolbar";
import { ScoreCalcModal } from "./ScoreCalcModal";

function LibraryBanners({ games, scored }: { games: Game[]; scored: number }) {
  const unscoredCount = useMemo(() => games.length - scored, [games.length, scored]);

  if (games.length > 0 && unscoredCount > 0 && scored >= 10) {
    return (
      <GuidanceBanner
        variant="info"
        linkText="Learn about scoring"
        linkHref="/help#scoring"
        dismissKey="library_scoring_banner"
      >
        <strong>
          {scored} of {games.length} games scored.
        </strong>{" "}
        {unscoredCount} game{unscoredCount === 1 ? " is" : "s are"} unscored and invisible to the
        AI.
      </GuidanceBanner>
    );
  }

  return null;
}

export function GameLibrary() {
  const router = useRouter();
  const tableRef = useRef<HTMLDivElement>(null);
  const lib = useGameLibrary();
  const [calcGame, setCalcGame] = useState<{ id: string; name: string } | null>(null);
  const [showcaseBusy, setShowcaseBusy] = useState(false);
  const [showcaseHint, setShowcaseHint] = useState<string | null>(null);
  const showcaseHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (showcaseHintTimerRef.current) clearTimeout(showcaseHintTimerRef.current);
    };
  }, []);

  const totalGames = lib.games.length;
  const scoredCount = lib.scored.length;
  const needsMoreGames = totalGames < 10;
  const needsMoreScoring = totalGames >= 10 && scoredCount < 10;

  const openAddModal = () => {
    lib.setShowAddModal(true);
  };

  const startScoring = () => {
    tableRef.current?.scrollIntoView({ behavior: "smooth" });
    const firstGame = lib.pageGames[0];
    if (firstGame) {
      setTimeout(() => lib.startEdit(firstGame), 400);
    }
  };

  const shareShowcase = async () => {
    setShowcaseHint(null);
    setShowcaseBusy(true);
    try {
      const publicId = await publishLibraryShowcase(lib.games);
      const showcasePath = `/showcase?id=${encodeURIComponent(publicId)}`;
      router.push(showcasePath);
      setShowcaseHint("Showcase opened. Copy your link from the page.");
    } catch (e) {
      setShowcaseHint(e instanceof Error ? e.message : "Could not publish showcase.");
    } finally {
      setShowcaseBusy(false);
    }
    if (showcaseHintTimerRef.current) clearTimeout(showcaseHintTimerRef.current);
    showcaseHintTimerRef.current = setTimeout(() => {
      setShowcaseHint(null);
      showcaseHintTimerRef.current = null;
    }, 8000);
  };

  return (
    <PageWrapper>
      <PageHeader>
        <PageHeader>
          <PageTitle>Game Library</PageTitle>
          <PageSubtitle>
            <HashLink
              href="/help#library"
              style={{ color: "inherit", textDecoration: "underline" }}
            >
              Learn more
            </HashLink>{" "}
            ·{" "}
            <HashLink
              href="/help#scoring"
              style={{ color: "inherit", textDecoration: "underline" }}
            >
              How scoring works
            </HashLink>
          </PageSubtitle>
        </PageHeader>

        <LibraryBanners games={lib.games} scored={scoredCount} />

        {needsMoreScoring ? (
          <GuidanceBanner variant="warning" linkText="How scoring works" linkHref="/help#scoring">
            You have {totalGames} games but only {scoredCount} scored. Click any game row below to
            score it. You need at least 10 scored games to run an analysis.
          </GuidanceBanner>
        ) : null}

        {needsMoreGames ? (
          <AddGameButtonRow>
            <Button variant="primary" onClick={openAddModal} style={{ width: "100%" }}>
              + Add Game
            </Button>
          </AddGameButtonRow>
        ) : needsMoreScoring ? (
          <AddGameButtonRow style={{ display: "flex", gap: "0.5rem" }}>
            <Button variant="secondary" onClick={openAddModal} style={{ flex: 1 }}>
              + Add Game
            </Button>
            <Button variant="primary" onClick={startScoring} style={{ flex: 1 }}>
              Start Scoring
            </Button>
          </AddGameButtonRow>
        ) : (
          <AddGameButtonRow>
            <Button variant="primary" onClick={openAddModal} style={{ width: "100%" }}>
              + Add Game
            </Button>
          </AddGameButtonRow>
        )}

        {totalGames > 0 ? (
          <ShowcaseShareSection>
            <AddGameButtonRow>
              <Button
                variant="secondary"
                onClick={() => void shareShowcase()}
                disabled={showcaseBusy}
                style={{ width: "100%" }}
              >
                {showcaseBusy ? "Creating link…" : "Showcase your library"}
              </Button>
            </AddGameButtonRow>
          </ShowcaseShareSection>
        ) : null}
      </PageHeader>

      <ImportSection handleImport={lib.handleImport} />

      <LibraryStats games={lib.games} scored={lib.scored} />

      <LibraryToolbar
        inputValue={lib.inputValue}
        setSearch={lib.setSearch}
        activeRanges={lib.activeRanges}
        toggleRange={lib.toggleRange}
      />

      <GameTable
        tableRef={tableRef}
        pageGames={lib.pageGames}
        totalGames={lib.games.length}
        sortField={lib.sortField}
        sortDir={lib.sortDir}
        toggleSort={lib.toggleSort}
        editingId={lib.editingId}
        editName={lib.editName}
        setEditName={lib.setEditName}
        editScore={lib.editScore}
        setEditScore={lib.setEditScore}
        confirmDeleteId={lib.confirmDeleteId}
        saveEdit={lib.saveEdit}
        setEditingId={lib.setEditingId}
        startEdit={lib.startEdit}
        handleDeleteGame={lib.handleDeleteGame}
        setConfirmDeleteId={lib.setConfirmDeleteId}
        onCalcScore={(g) => setCalcGame({ id: g.id, name: g.name })}
      />

      <LibraryPagination
        clampedPage={lib.clampedPage}
        totalPages={lib.totalPages}
        setPage={lib.setPage}
        tableRef={tableRef}
      />

      {lib.showAddModal && (
        <AddGameModal
          onAdd={lib.handleAddGame}
          onClose={() => lib.setShowAddModal(false)}
        />
      )}

      {calcGame && (
        <ScoreCalcModal
          gameName={calcGame.name}
          onApply={(score) => {
            const game = lib.games.find((g) => g.id === calcGame.id);
            if (game) lib.updateGame({ ...game, score });
            setCalcGame(null);
          }}
          onClose={() => setCalcGame(null)}
        />
      )}
    </PageWrapper>
  );
}
