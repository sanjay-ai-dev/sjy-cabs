'use client';

import React from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import { formatDateLabel, isoDate } from '@/lib/pool-config';

interface WhenFieldsProps {
  date: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  /** Namespaces the input ids so two of these can coexist on a page. */
  idPrefix: string;
}

/** The departure times the six-slot corridor actually runs on. */
const TIME_PRESETS = ['07:00', '08:00', '09:30', '17:00', '18:30'] as const;

/**
 * Native date and time inputs on purpose. They bring the OS picker on mobile,
 * correct locale formatting, and full keyboard support at no cost — a custom
 * calendar would be more chrome and less capability.
 */
export const WhenFields: React.FC<WhenFieldsProps> = ({
  date,
  time,
  onDateChange,
  onTimeChange,
  idPrefix,
}) => {
  const dateId = `${idPrefix}-date`;
  const timeId = `${idPrefix}-time`;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-hairline bg-surface px-4 py-3">
          <label
            htmlFor={dateId}
            className="flex items-center gap-2 text-micro font-semibold uppercase tracking-wide text-content-muted"
          >
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Date
            <span className="ml-auto normal-case tracking-normal text-content-secondary">
              {formatDateLabel(date)}
            </span>
          </label>
          <input
            id={dateId}
            type="date"
            value={date}
            min={isoDate(0)}
            onChange={(event) => onDateChange(event.target.value)}
            className="mt-1 w-full border-0 bg-transparent p-0 font-semibold text-content"
          />
        </div>

        <div className="rounded-2xl border border-hairline bg-surface px-4 py-3">
          <label
            htmlFor={timeId}
            className="flex items-center gap-2 text-micro font-semibold uppercase tracking-wide text-content-muted"
          >
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            Leaving at
          </label>
          <input
            id={timeId}
            type="time"
            value={time}
            onChange={(event) => onTimeChange(event.target.value)}
            className="mt-1 w-full border-0 bg-transparent p-0 font-semibold text-content"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Today', value: isoDate(0) },
          { label: 'Tomorrow', value: isoDate(1) },
        ].map((option) => (
          <button
            key={option.label}
            type="button"
            aria-pressed={date === option.value}
            onClick={() => onDateChange(option.value)}
            className={`min-h-tap rounded-full border px-4 text-meta font-semibold transition-colors ${
              date === option.value
                ? 'border-brand bg-brand/10 text-brand'
                : 'border-hairline bg-surface text-content-secondary hover:bg-surface-2 hover:text-content'
            }`}
          >
            {option.label}
          </button>
        ))}

        <span className="mx-1 my-auto h-5 w-px bg-hairline" aria-hidden="true" />

        {TIME_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            aria-pressed={time === preset}
            onClick={() => onTimeChange(preset)}
            className={`min-h-tap rounded-full border px-4 text-meta font-semibold transition-colors ${
              time === preset
                ? 'border-brand bg-brand/10 text-brand'
                : 'border-hairline bg-surface text-content-secondary hover:bg-surface-2 hover:text-content'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
};
