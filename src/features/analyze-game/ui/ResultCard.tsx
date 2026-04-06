"use client";

import React from "react";
import styled, { keyframes } from "styled-components";
import ReactMarkdown from "react-markdown";
import { useApp } from "@/app/providers/AppProvider";

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
`;

const Card = styled.article`
  margin-top: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.md};
  overflow: hidden;
  animation: ${fadeUp} ${({ theme }) => theme.transition.normal};
`;

const Header = styled.header`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.3;
`;

const Meta = styled.p`
  margin: ${({ theme }) => theme.spacing.xs} 0 0;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Body = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  position: relative;
`;

export const MarkdownBody = styled.div`
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.9375rem;
  line-height: 1.65;
  color: ${({ theme }) => theme.colors.text};

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: ${({ theme }) => theme.font.sans};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin: 1.25em 0 0.5em;
    line-height: 1.35;
  }

  h1:first-child,
  h2:first-child,
  h3:first-child {
    margin-top: 0;
  }

  h1 {
    font-size: 1.375rem;
  }
  h2 {
    font-size: 1.2rem;
  }
  h3 {
    font-size: 1.05rem;
  }

  p {
    margin: 0.65em 0;
  }

  ul,
  ol {
    margin: 0.65em 0;
    padding-left: 1.35rem;
  }

  li {
    margin: 0.3em 0;
  }

  li::marker {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  strong {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }

  em {
    font-style: italic;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  a {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transition.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.accentHover};
      text-decoration: underline;
    }
  }

  code {
    font-family: ${({ theme }) => theme.font.mono};
    font-size: 0.84em;
    padding: 0.15em 0.4em;
    border-radius: ${({ theme }) => theme.radius.sm};
    background: ${({ theme }) => theme.colors.surfaceElevated};
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }

  pre {
    margin: 0.85em 0;
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.bg};
    border: 1px solid ${({ theme }) => theme.colors.border};
    overflow-x: auto;

    code {
      padding: 0;
      border: none;
      background: transparent;
      font-size: 0.8125rem;
    }
  }

  blockquote {
    margin: 0.85em 0;
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
    border-left: 3px solid ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accentMuted};
    border-radius: 0 ${({ theme }) => theme.radius.sm} ${({ theme }) => theme.radius.sm} 0;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  hr {
    border: none;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    margin: 1.25em 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0.85em 0;
    font-size: 0.875rem;
  }

  th,
  td {
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    text-align: left;
  }

  th {
    background: ${({ theme }) => theme.colors.surfaceElevated};
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
  }
`;

const StreamRow = styled.span`
  display: inline-flex;
  align-items: center;
  vertical-align: baseline;
`;

const StreamCursor = styled.span`
  display: inline-block;
  width: 0.55em;
  height: 1.1em;
  margin-left: 2px;
  background: ${({ theme }) => theme.colors.accent};
  border-radius: 2px;
  animation: ${pulse} 1s ease-in-out infinite;
  vertical-align: text-bottom;
`;

export interface AnalysisMarkdownProps {
  source: string;
  showStreamCursor?: boolean;
}

export function AnalysisMarkdown({ source, showStreamCursor }: AnalysisMarkdownProps) {
  return (
    <MarkdownBody>
      <ReactMarkdown>{source}</ReactMarkdown>
      {showStreamCursor ? (
        <StreamRow aria-hidden>
          <StreamCursor />
        </StreamRow>
      ) : null}
    </MarkdownBody>
  );
}

export interface ResultCardProps {
  response: string;
  gameName: string;
  price: number;
  isStreaming: boolean;
}

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

export function ResultCard({ response, gameName, price, isStreaming }: ResultCardProps) {
  const { state } = useApp();
  const priceLabel = formatPrice(price, state.setupAnswers?.currency);

  return (
    <Card>
      <Header>
        <Title>{gameName}</Title>
        <Meta>{priceLabel}</Meta>
      </Header>
      <Body>
        <AnalysisMarkdown source={response} showStreamCursor={isStreaming} />
      </Body>
    </Card>
  );
}
