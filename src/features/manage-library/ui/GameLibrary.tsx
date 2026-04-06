"use client";
import React, { useState, useMemo, useCallback } from "react";
import styled from "styled-components";
import { useApp } from "@/app/providers/AppProvider";
import { parseAnyFormat, gamesToCSV } from "@/entities/game/lib/csv-parser";
import type { Game } from "@/shared/types";
import { useDropzone } from "react-dropzone";

const Page = styled.div`
  max-width: 1100px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-top: 4px;
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const Btn = styled.button<{ $variant?: "primary" | "secondary" | "danger" }>`
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid
    ${({ theme, $variant }) =>
      $variant === "primary"
        ? theme.colors.accent
        : $variant === "danger"
          ? theme.colors.error
          : theme.colors.border};
  background: ${({ theme, $variant }) =>
    $variant === "primary"
      ? theme.colors.accent
      : $variant === "danger"
        ? theme.colors.errorMuted
        : theme.colors.surface};
  color: ${({ theme, $variant }) =>
    $variant === "danger" ? theme.colors.error : theme.colors.text};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};

  &:hover {
    opacity: 0.85;
    transform: translateY(-1px);
  }
`;

const SearchBar = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 10px 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  outline: none;
  transition: border-color ${({ theme }) => theme.transition.fast};

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Toolbar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Stats = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing.md};
  flex: 1;
  min-width: 120px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent};
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
`;

const Table = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 80px;
  padding: 12px 20px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Row = styled.div<{ $editing?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 100px 80px;
  padding: 10px 20px;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: background ${({ theme }) => theme.transition.fast};
  background: ${({ theme, $editing }) => ($editing ? theme.colors.accentMuted : "transparent")};

  &:hover {
    background: ${({ theme, $editing }) =>
      $editing ? theme.colors.accentMuted : theme.colors.surfaceHover};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const GameName = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
`;

const ScoreBadge = styled.span<{ $score: number | null }>`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ theme, $score }) => {
    if ($score === null) return theme.colors.surfaceElevated;
    if ($score >= 80) return theme.colors.successMuted;
    if ($score >= 60) return theme.colors.warningMuted;
    return theme.colors.errorMuted;
  }};
  color: ${({ theme, $score }) => {
    if ($score === null) return theme.colors.textMuted;
    if ($score >= 80) return theme.colors.success;
    if ($score >= 60) return theme.colors.warning;
    return theme.colors.error;
  }};
`;

const InlineInput = styled.input`
  width: 60px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.85rem;
  text-align: center;
  outline: none;
`;

const RowActions = styled.div`
  display: flex;
  gap: 6px;
  justify-content: flex-end;
`;

const IconBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  padding: 4px;
  font-size: 1rem;
  transition: color ${({ theme }) => theme.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const DropZone = styled.div<{ $active: boolean }>`
  border: 2px dashed
    ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.textSecondary)};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.normal};
  background: ${({ theme, $active }) => ($active ? theme.colors.accentMuted : "transparent")};
`;

const Empty = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.85rem;
`;

const PAGE_SIZE = 50;

export function GameLibrary() {
  const { state, setGames, updateGame, deleteGame } = useApp();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState("");
  const [showImport, setShowImport] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return state.games.filter(
      (g) => g.name.toLowerCase().includes(q) || g.sortingName?.toLowerCase().includes(q),
    );
  }, [state.games, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageGames = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const scored = state.games.filter((g) => g.score !== null);
  const avgScore =
    scored.length > 0
      ? Math.round(scored.reduce((s, g) => s + (g.score || 0), 0) / scored.length)
      : 0;

  const startEdit = (game: Game) => {
    setEditingId(game.id);
    setEditScore(game.score !== null ? String(game.score) : "");
  };

  const saveEdit = (game: Game) => {
    const val = editScore.trim();
    const score = val === "" ? null : parseInt(val, 10);
    updateGame({ ...game, score: isNaN(score as number) ? null : score });
    setEditingId(null);
  };

  const handleImport = useCallback(
    (text: string) => {
      const parsed = parseAnyFormat(text);
      if (parsed.length > 0) {
        const existing = new Map(state.games.map((g) => [g.name.toLowerCase(), g]));
        const merged = [...state.games];
        for (const g of parsed) {
          const key = g.name.toLowerCase();
          if (!existing.has(key)) {
            merged.push(g);
            existing.set(key, g);
          }
        }
        setGames(merged);
        setShowImport(false);
      }
    },
    [state.games, setGames],
  );

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "text/*": [".csv", ".json", ".txt"] },
    onDrop: (files) => {
      if (files[0]) {
        const reader = new FileReader();
        reader.onload = () => handleImport(reader.result as string);
        reader.readAsText(files[0]);
      }
    },
    noClick: false,
  });

  return (
    <Page>
      <Header>
        <div>
          <Title>Game Library</Title>
          <Subtitle>{state.games.length} games in your library</Subtitle>
        </div>
        <Actions>
          <Btn $variant="secondary" onClick={() => setShowImport(!showImport)}>
            {showImport ? "Hide Import" : "Import Games"}
          </Btn>
          <Btn $variant="secondary" onClick={handleExport}>
            Export CSV
          </Btn>
          <Btn
            $variant="secondary"
            onClick={() => {
              const name = prompt("Game name:");
              if (name) {
                const scoreStr = prompt("Score (0-100, leave empty for none):");
                const score = scoreStr && !isNaN(parseInt(scoreStr)) ? parseInt(scoreStr) : null;
                const newGame: Game = {
                  id: Math.random().toString(36).slice(2, 11),
                  name,
                  score,
                };
                setGames([...state.games, newGame]);
              }
            }}
          >
            + Add Game
          </Btn>
        </Actions>
      </Header>

      {showImport && (
        <DropZone {...getRootProps()} $active={isDragActive}>
          <input {...getInputProps()} />
          <p style={{ fontSize: "1.1rem", marginBottom: 8 }}>
            {isDragActive ? "Drop your file here..." : "Drag & drop a CSV, JSON, or text file here"}
          </p>
          <p style={{ fontSize: "0.8rem" }}>
            or click to browse — games will be merged with your existing library
          </p>
        </DropZone>
      )}

      <Stats>
        <StatCard>
          <StatValue>{state.games.length}</StatValue>
          <StatLabel>Total games</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{scored.length}</StatValue>
          <StatLabel>Scored</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{avgScore}</StatValue>
          <StatLabel>Average score</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{state.games.filter((g) => (g.score || 0) >= 85).length}</StatValue>
          <StatLabel>Top rated (85+)</StatLabel>
        </StatCard>
      </Stats>

      <Toolbar>
        <SearchBar
          placeholder="Search games..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </Toolbar>

      <Table>
        <TableHeader>
          <span>Game</span>
          <span>Score</span>
          <span style={{ textAlign: "right" }}>Actions</span>
        </TableHeader>
        {pageGames.length === 0 ? (
          <Empty>
            {state.games.length === 0
              ? "No games yet — import your library to get started"
              : "No games match your search"}
          </Empty>
        ) : (
          pageGames.map((game) => (
            <Row key={game.id} $editing={editingId === game.id}>
              <GameName>{game.name}</GameName>
              <div>
                {editingId === game.id ? (
                  <InlineInput
                    value={editScore}
                    onChange={(e) => setEditScore(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(game);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                    placeholder="—"
                  />
                ) : (
                  <ScoreBadge $score={game.score}>
                    {game.score !== null ? game.score : "—"}
                  </ScoreBadge>
                )}
              </div>
              <RowActions>
                {editingId === game.id ? (
                  <>
                    <IconBtn onClick={() => saveEdit(game)} title="Save">
                      ✓
                    </IconBtn>
                    <IconBtn onClick={() => setEditingId(null)} title="Cancel">
                      ✕
                    </IconBtn>
                  </>
                ) : (
                  <>
                    <IconBtn onClick={() => startEdit(game)} title="Edit score">
                      ✎
                    </IconBtn>
                    <IconBtn
                      onClick={() => {
                        if (confirm(`Remove "${game.name}"?`)) deleteGame(game.id);
                      }}
                      title="Delete"
                    >
                      🗑
                    </IconBtn>
                  </>
                )}
              </RowActions>
            </Row>
          ))
        )}
      </Table>

      {totalPages > 1 && (
        <Pagination>
          <Btn
            $variant="secondary"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            ← Prev
          </Btn>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <Btn
            $variant="secondary"
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
          >
            Next →
          </Btn>
        </Pagination>
      )}
    </Page>
  );
}
