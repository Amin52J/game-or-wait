"use client";

import styled from "styled-components";

export const HelpRoot = styled.div`
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.md}`};

  @media (min-width: ${({ theme }) => theme.breakpoint.tablet}) {
    padding: ${({ theme }) => theme.spacing.md};
  }

  @media (min-width: ${({ theme }) => theme.breakpoint.desktop}) {
    padding: ${({ theme }) => theme.spacing.md} 0;
  }
`;

export const HelpHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

export const HelpTitle = styled.h1`
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 1.6rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

export const HelpSubtitle = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

export const TOC = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

export const TOCLink = styled.a`
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.accent};
  text-decoration: none;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radius.sm};
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.accentMuted};
    text-decoration: underline;
  }
`;

export const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};

  @media (min-width: ${({ theme }) => theme.breakpoint.tablet}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

export const SectionAnchor = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 1.15rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  scroll-margin-top: ${({ theme }) => theme.spacing.xl};
`;

export const P = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.875rem;
  line-height: 1.65;
  color: ${({ theme }) => theme.colors.textSecondary};

  &:last-child {
    margin-bottom: 0;
  }

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
  }

  code {
    font-family: ${({ theme }) => theme.font.mono};
    font-size: 0.8em;
    padding: 2px 6px;
    border-radius: ${({ theme }) => theme.radius.sm};
    background: ${({ theme }) => theme.colors.surfaceElevated};
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const OL = styled.ol`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  padding-left: 1.3rem;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.875rem;
  line-height: 1.65;
  color: ${({ theme }) => theme.colors.textSecondary};

  li {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  li::marker {
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 600;
  }

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
  }
`;

export const UL = styled.ul`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  padding-left: 1.3rem;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.875rem;
  line-height: 1.65;
  color: ${({ theme }) => theme.colors.textSecondary};

  li {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  li::marker {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
  }
`;

export const Callout = styled.div<{ $variant?: "info" | "tip" | "warning" }>`
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radius.md};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.8125rem;
  line-height: 1.6;

  ${({ theme, $variant = "info" }) =>
    $variant === "warning"
      ? `
    background: ${theme.colors.warningMuted};
    border: 1px solid ${theme.colors.warning};
    color: ${theme.colors.warning};
  `
      : $variant === "tip"
        ? `
    background: ${theme.colors.successMuted};
    border: 1px solid ${theme.colors.success};
    color: ${theme.colors.success};
  `
        : `
    background: ${theme.colors.accentMuted};
    border: 1px solid ${theme.colors.accent};
    color: ${theme.colors.accent};
  `}

  strong {
    font-weight: 700;
  }
`;

export const SubHeading = styled.h3`
  margin: ${({ theme }) => theme.spacing.lg} 0 ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};

  &:first-child {
    margin-top: 0;
  }
`;
