"use client";

import React from "react";
import styled from "styled-components";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
`;

const TopRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Label = styled.label`
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ValueDisplay = styled.output`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accent};
`;

const RangeWrap = styled.div`
  position: relative;
  padding: ${({ theme }) => `${theme.spacing.xs} 0`};
`;

const StyledRange = styled.input.attrs({ type: "range" })`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  margin: 0;
  background: transparent;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 4px;
    border-radius: ${({ theme }) => theme.radius.sm};
  }

  &::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: ${({ theme }) => theme.radius.sm};
    background: ${({ theme }) => theme.colors.border};
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    margin-top: -6px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accent};
    border: 2px solid ${({ theme }) => theme.colors.surfaceElevated};
    box-shadow: ${({ theme }) => theme.shadow.sm};
    transition:
      background ${({ theme }) => theme.transition.fast},
      transform ${({ theme }) => theme.transition.fast};
  }

  &:hover::-webkit-slider-thumb {
    background: ${({ theme }) => theme.colors.accentHover};
  }

  &:active::-webkit-slider-thumb {
    transform: scale(1.06);
  }

  &::-moz-range-track {
    height: 6px;
    border-radius: ${({ theme }) => theme.radius.sm};
    background: ${({ theme }) => theme.colors.border};
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accent};
    border: 2px solid ${({ theme }) => theme.colors.surfaceElevated};
    box-shadow: ${({ theme }) => theme.shadow.sm};
    transition:
      background ${({ theme }) => theme.transition.fast},
      transform ${({ theme }) => theme.transition.fast};
  }

  &:hover::-moz-range-thumb {
    background: ${({ theme }) => theme.colors.accentHover};
  }

  &:active::-moz-range-thumb {
    transform: scale(1.06);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const BoundsRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: -${({ theme }) => theme.spacing.xs};
`;

export interface SliderProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> {
  label?: string;
  min?: number;
  max?: number;
  /** Shown next to label; falls back to numeric value */
  formatValue?: (value: number) => string;
}

export function Slider({
  label,
  min = 0,
  max = 100,
  value,
  defaultValue,
  formatValue,
  id,
  className,
  onChange,
  ...rest
}: SliderProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(() => Number(defaultValue ?? min) || min);

  React.useEffect(() => {
    if (!isControlled && defaultValue !== undefined) {
      setInternal(Number(defaultValue) || min);
    }
  }, [isControlled, defaultValue, min]);

  const numericValue = isControlled ? Number(value) : internal;

  const display = formatValue != null ? formatValue(numericValue) : String(numericValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    if (!isControlled) setInternal(next);
    onChange?.(e);
  };

  const inputId = id ?? rest.name;

  return (
    <Root className={className}>
      <TopRow>
        {label ? <Label htmlFor={inputId}>{label}</Label> : <span />}
        <ValueDisplay htmlFor={inputId}>{display}</ValueDisplay>
      </TopRow>
      <RangeWrap>
        <StyledRange
          id={inputId}
          min={min}
          max={max}
          value={isControlled ? value : internal}
          defaultValue={isControlled ? undefined : defaultValue}
          onChange={handleChange}
          {...rest}
        />
      </RangeWrap>
      <BoundsRow aria-hidden>
        <span>{min}</span>
        <span>{max}</span>
      </BoundsRow>
    </Root>
  );
}
