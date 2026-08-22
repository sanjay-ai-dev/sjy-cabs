'use client';

import React from 'react';
import { useTheme } from './theme-provider';

/**
 * Theme switch.
 *
 * Notes on the previous version this replaces:
 *  - it returned `null` until mounted, so the header reflowed on every load;
 *  - each instance held its own useState, so two toggles on one page desynced;
 *  - it had no aria-pressed / aria-label, no focus ring, and a ~26px target.
 */
export const ThemeToggle: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const nextLabel = isDark ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      // aria-pressed communicates the binary state; the label says what the
      // press will do, which is what screen reader users need to hear.
      aria-pressed={isDark}
      aria-label={`Switch to ${nextLabel} theme`}
      title={`Switch to ${nextLabel} theme`}
      className={`min-h-tap min-w-tap inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface-2 px-3 text-micro font-bold text-content-secondary transition-colors hover:bg-surface-3 ${className}`}
    >
      {/* aria-hidden: the icon repeats what the label already says. */}
      <span aria-hidden="true" className="text-base leading-none">
        {isDark ? '☀️' : '🌙'}
      </span>
      <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
};
