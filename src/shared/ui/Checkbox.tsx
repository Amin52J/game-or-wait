"use client";

import React, { forwardRef, useId } from "react";
import styled from "styled-components";

const Root = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  user-select: none;

  &[aria-disabled="true"] {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

const Box = styled.span<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid
    ${({ theme, $checked }) =>
      $checked ? theme.colors.accent : theme.colors.border};
  background: ${({ theme, $checked }) =>
    $checked ? theme.colors.accent : theme.colors.surface};
  transition:
    background ${({ theme }) => theme.transition.fast},
    border-color ${({ theme }) => theme.transition.fast};

  svg {
    opacity: ${({ $checked }) => ($checked ? 1 : 0)};
    transition: opacity ${({ theme }) => theme.transition.fast};
  }
`;

const LabelText = styled.span`
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.text};
`;

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, checked = false, disabled, className, id, ...rest }, ref) {
    const genId = useId();
    const inputId = id ?? genId;

    return (
      <Root className={className} htmlFor={inputId} aria-disabled={disabled || undefined}>
        <HiddenInput
          ref={ref}
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          {...rest}
        />
        <Box $checked={!!checked}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </Box>
        {label != null ? <LabelText>{label}</LabelText> : null}
      </Root>
    );
  },
);
