'use client';

import { useState } from 'react';

interface AdminNumberInputProps {
  value?: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  placeholder?: string;
  className?: string;
  parser?: 'int' | 'float';
  fallbackValue?: number;
}

function clampValue(value: number, min?: number, max?: number) {
  let next = value;
  if (typeof min === 'number') next = Math.max(min, next);
  if (typeof max === 'number') next = Math.min(max, next);
  return next;
}

export default function AdminNumberInput({
  value,
  onValueChange,
  min,
  max,
  step,
  required,
  placeholder,
  className,
  parser = 'int',
  fallbackValue,
}: AdminNumberInputProps) {
  const resolvedFallback = fallbackValue ?? min ?? 0;
  const [displayValue, setDisplayValue] = useState<string>(value ?? value === 0 ? String(value) : '');

  const parseValue = (raw: string) => {
    const parsed = parser === 'float' ? Number.parseFloat(raw) : Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return null;
    return clampValue(parsed, min, max);
  };

  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      required={required}
      placeholder={placeholder}
      value={displayValue}
      onChange={(event) => {
        const raw = event.target.value;
        setDisplayValue(raw);
        if (raw.trim() === '') return;

        const parsed = parseValue(raw);
        if (parsed === null) return;
        onValueChange(parsed);
      }}
      onBlur={() => {
        if (displayValue.trim() === '') {
          onValueChange(resolvedFallback);
          setDisplayValue(String(resolvedFallback));
          return;
        }

        const parsed = parseValue(displayValue);
        if (parsed === null) {
          onValueChange(resolvedFallback);
          setDisplayValue(String(resolvedFallback));
          return;
        }

        onValueChange(parsed);
        setDisplayValue(String(parsed));
      }}
      className={className}
    />
  );
}
