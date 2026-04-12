"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Button,
  PageWrapper,
  PageHeader,
  PageTitle,
  PageSubtitle,
  ButtonRow,
  HashLink,
  GuidanceBanner,
} from "@/shared/ui";
import { useGameLibrary } from "./GameLibrary.hooks";
import { ImportSection } from "./ImportSection";
import { LibraryStats } from "./LibraryStats";
import { LibraryToolbar } from "./LibraryToolbar";
import { GameTable } from "./GameTable";
import { AddGameModal } from "./AddGameModal";
import { ScoreCalcModal } from "./ScoreCalcModal";
import { LibraryPagination } from "./LibraryPagination";

import type { Game } from "@/shared/types";

function LibraryBanners({ games, scored }: { games: Game[]; scored: number }) {
  const unscoredCount = useMemo(() => games.length - scored, [games.length, scored]);

  if (games.length > 0 && scored === 0) {
    return (
      <GuidanceBanner variant="warning" linkText="How scoring works" linkHref="/help#scoring">
        <strong>None of your {games.length} games have a score yet.</strong> The AI only sees scored
        games during analysis. Use the score calculator (click the calculator icon on any row) or
        enter scores manually.
      </GuidanceBanner>
    );
  }

  if (games.length > 0 && unscoredCount > 0 && scored < 10) {
    return (
      <GuidanceBanner variant="info" linkText="Learn about scoring" linkHref="/help#scoring">
        <strong>
          {scored} of {games.length} games scored.
        </strong>{" "}
        {unscoredCount} game{unscoredCount === 1 ? " is" : "s are"} unscored and invisible to the
        AI. Aim for at least 10 scored games for accurate analyses.
      </GuidanceBanner>
    );
  }

  return null;
}

export function GameLibrary() {
  const tableRef = useRef<HTMLDivElement>(null);
  const lib = useGameLibrary();
  const [showImport, setShowImport] = useState(false);
  const [calcGame, setCalcGame] = useState<{ id: string; name: string } | null>(null);

  return (
    <PageWrapper>
      <PageHeader>
        <PageHeader>
          <PageTitle>Game Library</PageTitle>
          <PageSubtitle>
            {lib.games.length} games in your library ·{" "}
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
        <ButtonRow>
          <Button variant="secondary" onClick={() => setShowImport(!showImport)}>
            {showImport ? "Hide Import" : "Import Games"}
          </Button>
          <Button variant="secondary" onClick={lib.handleExport}>
            Export CSV
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              lib.setAddName("");
              lib.setAddScore("");
              lib.setShowAddModal(true);
            }}
          >
            + Add Game
          </Button>
          {lib.games.length > 0 && (
            <Button
              variant="danger"
              onClick={lib.handleClearLibrary}
              onBlur={() => lib.setConfirmClear(false)}
            >
              {lib.confirmClear ? "Are you sure?" : "Clear Library"}
            </Button>
          )}
        </ButtonRow>
      </PageHeader>

      <LibraryBanners games={lib.games} scored={lib.scored.length} />

      {showImport && (
        <ImportSection handleImport={lib.handleImport} onHide={() => setShowImport(false)} />
      )}

      <LibraryStats games={lib.games} scored={lib.scored} avgScore={lib.avgScore} />

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
          addName={lib.addName}
          setAddName={lib.setAddName}
          addScore={lib.addScore}
          setAddScore={lib.setAddScore}
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
