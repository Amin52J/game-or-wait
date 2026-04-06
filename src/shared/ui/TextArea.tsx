"use client";

import React, { forwardRef, useCallback, useEffect, useId, useRef, useState } from "react";
import styled from "styled-components";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`;

const Label = styled.label`
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FieldWrap = styled.div<{ $hasError: boolean }>`
  position: relative;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid
    ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.border)};
  transition:
    border-color ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast};

  &:focus-within {
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.accent};
    box-shadow: 0 0 0 3px
      ${({ theme, $hasError }) => ($hasError ? theme.colors.errorMuted : theme.colors.accentMuted)};
  }
`;

const StyledTextArea = styled.textarea`
  display: block;
  width: 100%;
  min-height: 96px;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.875rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border: none;
  outline: none;
  resize: vertical;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Footer = styled.div<{ $hasError: boolean }>`
  display: flex;
  justify-content: ${({ $hasError }) => ($hasError ? "space-between" : "flex-end")};
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const ErrorText = styled.span`
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.error};
  flex: 1;
  min-width: 0;
`;

const CountText = styled.span<{ $over?: boolean }>`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.6875rem;
  color: ${({ theme, $over }) => ($over ? theme.colors.error : theme.colors.textMuted)};
  flex-shrink: 0;
  padding-bottom: ${({ theme }) => theme.spacing.xs};
`;

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  id?: string;
  /** When true, height follows content up to maxHeight if set. */
  autoGrow?: boolean;
  /** Shown when maxLength is set; displays current / max. */
  showCount?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    label,
    error,
    id,
    className,
    disabled,
    autoGrow = false,
    showCount,
    maxLength,
    value,
    defaultValue,
    onChange,
    style,
    rows = 3,
    ...rest
  },
  ref,
) {
  const genId = useId();
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const areaId = id ?? (typeof rest.name === "string" ? rest.name : undefined) ?? genId;
  const hasError = Boolean(error);
  const showCharCount = showCount ?? typeof maxLength === "number";
  const isControlled = value !== undefined;
  const [uncontrolledLen, setUncontrolledLen] = useState(() =>
    typeof defaultValue === "string" ? defaultValue.length : 0,
  );

  const setRefs = useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const adjustHeight = useCallback(() => {
    const el = innerRef.current;
    if (!el || !autoGrow) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [autoGrow]);

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight, value, defaultValue]);

  const len = isControlled && typeof value === "string" ? value.length : uncontrolledLen;

  const overMax = typeof maxLength === "number" && len > maxLength;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) setUncontrolledLen(e.target.value.length);
    onChange?.(e);
    requestAnimationFrame(adjustHeight);
  };

  return (
    <Root className={className}>
      {label ? <Label htmlFor={areaId}>{label}</Label> : null}
      <FieldWrap $hasError={hasError}>
        <StyledTextArea
          ref={setRefs}
          id={areaId}
          rows={rows}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={hasError || undefined}
          aria-describedby={
            [error ? `${areaId}-error` : null, showCharCount ? `${areaId}-count` : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
          style={{
            ...style,
            ...(autoGrow ? { resize: "none", overflow: "hidden" } : {}),
          }}
          {...rest}
        />
      </FieldWrap>
      <Footer $hasError={hasError}>
        {error ? (
          <ErrorText id={`${areaId}-error`} role="alert">
            {error}
          </ErrorText>
        ) : null}
        {showCharCount && typeof maxLength === "number" ? (
          <CountText id={`${areaId}-count`} $over={overMax} aria-live="polite">
            {len} / {maxLength}
          </CountText>
        ) : showCharCount ? (
          <CountText id={`${areaId}-count`} aria-live="polite">
            {len}
          </CountText>
        ) : null}
      </Footer>
    </Root>
  );
});
