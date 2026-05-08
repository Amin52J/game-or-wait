"use client";

import Link from "next/link";
import styled from "styled-components";

export const ShowcaseRoot = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: ${({ theme }) => theme.spacing.md};
  padding-bottom: calc(${({ theme }) => theme.spacing.xl} + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
`;

export const ShowcaseHeaderSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const ShowcaseHeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: 0;
  width: 100%;
  min-width: 0;
`;

export const ShowcaseTitleBlock = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

export const ShowcaseHeading = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: clamp(0.98rem, 3.6vw, 1.22rem);
  font-weight: 700;
  line-height: 1.25;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ShowcaseIconLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  padding: 0;
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: none;
  cursor: pointer;
  transition:
    color ${({ theme }) => theme.transition.fast},
    background ${({ theme }) => theme.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

export const ShowcaseIconActions = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 0;
`;

export const ShowcaseIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  transition:
    color ${({ theme }) => theme.transition.fast},
    background ${({ theme }) => theme.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

export const ShowcaseEmpty = styled.p`
  margin: ${({ theme }) => theme.spacing.lg} 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.95rem;
`;

export const ShowcaseError = styled.div`
  margin: ${({ theme }) => theme.spacing.lg} 0;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.warningMuted};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.9rem;
`;

export const ShowcaseScrollSentinel = styled.div`
  height: 1px;
  width: 100%;
`;

export const ShowcaseLoadingMore = styled.p`
  margin: ${({ theme }) => theme.spacing.md} 0 ${({ theme }) => theme.spacing.xl};
  text-align: center;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const ShowcaseGridMeasure = styled.div`
  width: 100%;
  min-width: 0;
`;
