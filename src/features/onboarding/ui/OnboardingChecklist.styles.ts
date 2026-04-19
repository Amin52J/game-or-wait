"use client";

import styled, { keyframes } from "styled-components";

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const ChecklistRoot = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  animation: ${slideIn} 300ms ease;

  @media (min-width: ${({ theme }) => theme.breakpoint.tablet}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

export const ChecklistHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const ChecklistTitle = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

export const DismissBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.75rem;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radius.sm};
  transition:
    color ${({ theme }) => theme.transition.fast},
    background ${({ theme }) => theme.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

export const ProgressBarTrack = styled.div`
  height: 4px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 2px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
`;

export const ProgressBarFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: ${({ theme }) => theme.colors.accent};
  border-radius: 2px;
  transition: width 400ms ease;
`;

export const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StepRow = styled.a<{ $done: boolean; $current?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: ${({ theme, $done, $current }) =>
    $done ? "transparent" : $current ? theme.colors.accentMuted : theme.colors.surfaceElevated};
  border: 1px solid
    ${({ theme, $done, $current }) =>
      $done ? theme.colors.border : $current ? theme.colors.accent : theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radius.md};
  text-decoration: none;
  cursor: ${({ $done }) => ($done ? "default" : "pointer")};
  opacity: ${({ $done }) => ($done ? 0.55 : 1)};
  transition:
    background ${({ theme }) => theme.transition.fast},
    border-color ${({ theme }) => theme.transition.fast};

  &:hover {
    ${({ $done, theme }) =>
      !$done &&
      `
      background: ${theme.colors.surfaceHover};
      border-color: ${theme.colors.accent};
    `}
  }
`;

export const StepCheck = styled.span<{ $done: boolean; $current?: boolean }>`
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  font-family: ${({ theme }) => theme.font.sans};
  border: 2px solid
    ${({ theme, $done, $current }) =>
      $done ? theme.colors.success : $current ? theme.colors.accent : theme.colors.border};
  background: ${({ theme, $done, $current }) =>
    $done ? theme.colors.successMuted : $current ? theme.colors.accentMuted : "transparent"};
  color: ${({ theme, $done, $current }) =>
    $done ? theme.colors.success : $current ? theme.colors.accent : theme.colors.textMuted};
  transition: all ${({ theme }) => theme.transition.fast};
`;

export const StepInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const StepLabel = styled.div<{ $done: boolean }>`
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ theme, $done }) => ($done ? theme.colors.textMuted : theme.colors.text)};
  text-decoration: ${({ $done }) => ($done ? "line-through" : "none")};
`;

export const StepDesc = styled.div`
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.4;
`;
