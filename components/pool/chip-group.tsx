'use client';

import React, { useRef } from 'react';

interface ChipGroupProps {
  /** Accessible name for the group. */
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  /** Token classes for the selected chip. Defaults to the brand accent. */
  accentText?: string;
  accentBorder?: string;
  accentSoft?: string;
}

/**
 * Single-select chip row. Radio semantics with a roving tabindex, so the whole
 * group is one Tab stop and arrow keys move within it — the behaviour a
 * segmented control is expected to have.
 */
export const ChipGroup: React.FC<ChipGroupProps> = ({
  label,
  options,
  value,
  onChange,
  accentText = 'text-brand',
  accentBorder = 'border-brand',
  accentSoft = 'bg-brand/10',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const delta =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (delta === 0) return;

    event.preventDefault();
    const current = options.indexOf(value);
    const next = options[(current + delta + options.length) % options.length];
    onChange(next);
    containerRef.current?.querySelector<HTMLButtonElement>(`[data-value="${next}"]`)?.focus();
  };

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="flex flex-wrap gap-2"
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            data-value={option}
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option)}
            className={`min-h-tap rounded-full border px-4 text-meta font-semibold transition-colors ${
              selected
                ? `${accentBorder} ${accentSoft} ${accentText}`
                : 'border-hairline bg-surface text-content-secondary hover:bg-surface-2 hover:text-content'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};
