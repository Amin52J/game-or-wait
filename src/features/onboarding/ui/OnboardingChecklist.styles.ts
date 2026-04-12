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
  transition: color ${({ theme }) => theme.transition.fast},
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

export const StepRow = styled.a<{ $done: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: ${({ theme, $done }) => $done ? "transparent" : theme.colors.surfaceElevated};
  border: 1px solid ${({ theme, $done }) => $done ? theme.colors.border : theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radius.md};
  text-decoration: none;
  cursor: ${({ $done }) => $done ? "default" : "pointer"};
  opacity: ${({ $done }) => $done ? 0.6 : 1};
  transition: background ${({ theme }) => theme.transition.fast},
    border-color ${({ theme }) => theme.transition.fast};

  &:hover {
    ${({ $done, theme }) => !$done && `
      background: ${theme.colors.surfaceHover};
      border-color: ${theme.colors.accent};
    `}
  }
`;

export const StepCheck = styled.span<{ $done: boolean }>`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ theme, $done }) => $done ? theme.colors.success : theme.colors.border};
  background: ${({ theme, $done }) => $done ? theme.colors.successMuted : "transparent"};
  color: ${({ theme }) => theme.colors.success};
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
  color: ${({ theme, $done }) => $done ? theme.colors.textMuted : theme.colors.text};
  text-decoration: ${({ $done }) => $done ? "line-through" : "none"};
`;

export const StepDesc = styled.div`
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.4;
`;
