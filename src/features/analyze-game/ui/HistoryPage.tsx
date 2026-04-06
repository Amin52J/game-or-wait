"use client";

import React, { useCallback, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useApp } from "@/app/providers/AppProvider";
import type { AnalysisResult } from "@/shared/types";
import { AnalysisMarkdown } from "./ResultCard";
import { Button } from "@/shared/ui/Button";

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Page = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.lg}`};
`;

const HeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const HistoryCard = styled.li<{ $expanded: boolean }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  overflow: hidden;
  animation: ${fadeUp} ${({ theme }) => theme.transition.normal};
  transition:
    border-color ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast};

  ${({ $expanded, theme }) =>
    $expanded
      ? `
    border-color: ${theme.colors.borderLight};
    box-shadow: ${theme.shadow.md};
  `
      : ""}
`;

const CardMain = styled.button`
  display: block;
  width: 100%;
  padding: 0;
  margin: 0;
  text-align: left;
  cursor: pointer;
  font: inherit;
  color: inherit;
  background: transparent;
  border: none;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: -2px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const CardTitleBlock = styled.div`
  min-width: 0;
  flex: 1;
`;

const CardTitle = styled.span`
  display: block;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 1.05rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.35;
`;

const CardMeta = styled.span`
  display: block;
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DeleteBtn = styled.button`
  flex-shrink: 0;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.error};
  background: ${({ theme }) => theme.colors.errorMuted};
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.radius.sm};
  cursor: pointer;
  transition:
    background ${({ theme }) => theme.transition.fast},
    color ${({ theme }) => theme.transition.fast};

  &:hover {
    filter: brightness(1.08);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const PreviewBody = styled.div`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
`;

const PreviewText = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.875rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: pre-wrap;
  word-break: break-word;
`;

const ExpandHint = styled.span`
  display: block;
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ExpandedSection = styled.div`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg} ${theme.spacing.lg}`};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const PREVIEW_MAX = 220;

function formatPrice(price: number, currencyCode: string | undefined): string {
  const code = currencyCode || "USD";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
    }).format(price);
  } catch {
    return `${code} ${price.toFixed(2)}`;
  }
}

function formatDate(ts: number): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

function truncatePreview(text: string): string {
  const t = text.trim();
  if (t.length <= PREVIEW_MAX) return t;
  return `${t.slice(0, PREVIEW_MAX).trim()}…`;
}

export function HistoryPage() {
  const { state, deleteAnalysis, clearHistory } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...state.analysisHistory].sort((a, b) => b.timestamp - a.timestamp),
    [state.analysisHistory],
  );

  const toggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      deleteAnalysis(id);
      setExpandedId((prev) => (prev === id ? null : prev));
    },
    [deleteAnalysis],
  );

  const handleClearAll = useCallback(() => {
    clearHistory();
    setExpandedId(null);
  }, [clearHistory]);

  const currency = state.setupAnswers?.currency;

  if (sorted.length === 0) {
    return (
      <Page>
        <HeaderRow>
          <Title>Analysis history</Title>
        </HeaderRow>
        <EmptyState>No analyses yet</EmptyState>
      </Page>
    );
  }

  return (
    <Page>
      <HeaderRow>
        <Title>Analysis history</Title>
        <Actions>
          <Button type="button" variant="danger" size="md" onClick={handleClearAll}>
            Clear all
          </Button>
        </Actions>
      </HeaderRow>

      <List>
        {sorted.map((item: AnalysisResult) => {
          const expanded = expandedId === item.id;
          return (
            <HistoryCard key={item.id} $expanded={expanded}>
              <CardHeader>
                <CardMain type="button" onClick={() => toggle(item.id)} aria-expanded={expanded}>
                  <CardTitleBlock>
                    <CardTitle>{item.gameName}</CardTitle>
                    <CardMeta>
                      {formatPrice(item.price, currency)} · {formatDate(item.timestamp)}
                    </CardMeta>
                  </CardTitleBlock>
                </CardMain>
                <DeleteBtn
                  type="button"
                  onClick={(e) => handleDelete(e, item.id)}
                  aria-label={`Delete analysis for ${item.gameName}`}
                >
                  Delete
                </DeleteBtn>
              </CardHeader>

              {!expanded ? (
                <CardMain type="button" onClick={() => toggle(item.id)}>
                  <PreviewBody>
                    <PreviewText>{truncatePreview(item.response)}</PreviewText>
                    <ExpandHint>
                      Click to {item.response.length > PREVIEW_MAX ? "expand" : "view"} full
                      analysis
                    </ExpandHint>
                  </PreviewBody>
                </CardMain>
              ) : (
                <ExpandedSection>
                  <AnalysisMarkdown source={item.response} />
                </ExpandedSection>
              )}
            </HistoryCard>
          );
        })}
      </List>
    </Page>
  );
}
