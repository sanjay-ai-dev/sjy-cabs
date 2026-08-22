'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface SeatStepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** "Seat" or "Pillion" — pluralised automatically. */
  noun: string;
  /** Accessible group name, e.g. "Seats offered". */
  label: string;
}

export const SeatStepper: React.FC<SeatStepperProps> = ({
  value,
  min,
  max,
  onChange,
  noun,
  label,
}) => {
  const atMin = value <= min;
  const atMax = value >= max;
  const display = `${value} ${noun}${value === 1 ? '' : 's'}`;

  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={atMin}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className="flex min-h-tap min-w-tap items-center justify-center rounded-full border border-hairline bg-surface text-content-secondary transition-colors hover:bg-surface-2 hover:text-content disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Announced on change so a screen-reader user hears the new count
          without having to hunt for it after pressing the button. */}
      <span
        aria-live="polite"
        className="min-w-[5.5rem] text-center text-sm font-bold text-content"
      >
        {display}
      </span>

      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={atMax}
        aria-label={`Increase ${label.toLowerCase()}`}
        className="flex min-h-tap min-w-tap items-center justify-center rounded-full border border-hairline bg-surface text-content-secondary transition-colors hover:bg-surface-2 hover:text-content disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};
