"use client";

import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
`;

export const Panel = styled.section`
  margin-top: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: none;
  border-right: none;
  border-radius: 0;
  overflow: hidden;

  @media (min-width: ${({ theme }) => theme.breakpoint.tablet}) {
    border-left: 1px solid ${({ theme }) => theme.colors.border};
    border-right: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.lg};
  }
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const HeaderToggle = styled.button`
  display: flex;
  flex: 1;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  text-align: left;

  svg {
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.accent};
  }
`;

export const PanelTitle = styled.span`
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const MessageCount = styled.span`
  padding: 1px 7px;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => theme.colors.accentMuted};
  border-radius: 999px;
`;

export const Chevron = styled.span`
  margin-left: auto;
  display: inline-flex;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const OriginalToggle = styled.button`
  flex-shrink: 0;
  padding: 0;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

export const PanelBody = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const OriginalBox = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.bg};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  max-height: 320px;
  overflow-y: auto;
`;

export const OriginalLabel = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Thread = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const UserBubble = styled.div`
  align-self: flex-end;
  max-width: 85%;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.8125rem;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.accentMuted};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radius.md};
  animation: ${fadeIn} ${({ theme }) => theme.transition.fast};
`;

export const AssistantBubble = styled.div`
  max-width: 100%;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  animation: ${fadeIn} ${({ theme }) => theme.transition.fast};
  overflow-wrap: anywhere;
`;

export const RevisionMarker = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => theme.colors.accentMuted};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radius.md};

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }

  strong {
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const RevisionProgress = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.bg};
  border: 1px dashed ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radius.md};
`;

export const RevisionProgressLabel = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accent};
`;

export const RevisionPreview = styled.div`
  max-height: 200px;
  overflow: hidden;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.6875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.textSecondary};
  mask-image: linear-gradient(to bottom, #000 55%, transparent 100%);
`;

export const Suggestions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const SuggestionChip = styled.button`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

export const Composer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const ComposerActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

export const ComposerHint = styled.span`
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-left: auto;
`;

export const ReviseBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ReviseHint = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.6875rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
`;

export const Note = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.8125rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};

  a {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

export const ErrorNote = styled.p`
  margin: 0;
  padding: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.75rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.error};
  background: ${({ theme }) => theme.colors.errorMuted};
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.radius.md};
`;
