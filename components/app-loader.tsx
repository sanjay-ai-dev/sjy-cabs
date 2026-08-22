'use client';

import React, { useEffect, useState } from 'react';
import { DailyCabLogo } from './logo';

interface AppLoaderProps {
  onComplete?: () => void;
  title?: string;
}

const SESSION_KEY = 'sjy_cabs_splash_shown';

const STEPS = [
  { at: 250, progress: 35, status: 'Connecting AIS-140 live GPS telematics…' },
  { at: 600, progress: 75, status: 'Synchronising 6 daily Ertiga schedules…' },
  { at: 950, progress: 100, status: 'Ready' },
];

/**
 * Cold-start splash.
 *
 * Previously this blocked the viewport for 1.2s on *every* navigation to `/`
 * and `/user`, which was the app's single largest self-inflicted interaction
 * cost. Mobility apps show a splash once per launch, so this now:
 *   - renders at most once per browser session (sessionStorage);
 *   - skips entirely for users who prefer reduced motion;
 *   - is skippable by click or Escape;
 *   - actually renders the `title` it is given (the prop was previously dead).
 */
export const AppLoader: React.FC<AppLoaderProps> = ({
  onComplete,
  title = 'DailyCab Network',
}) => {
  // `null` = undecided (first client render, before sessionStorage is readable).
  const [visible, setVisible] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Starting DailyCab…');

  useEffect(() => {
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      /* storage unavailable — fall through and show once */
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (alreadyShown || prefersReducedMotion) {
      setVisible(false);
      onComplete?.();
      return;
    }

    setVisible(true);
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* ignore */
    }

    const timers = STEPS.map((step) =>
      window.setTimeout(() => {
        setProgress(step.progress);
        setStatusText(step.status);
      }, step.at)
    );

    const done = window.setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1200);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(done);
    };
  }, [onComplete]);

  // Let people out early.
  useEffect(() => {
    if (!visible) return;
    const skip = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false);
    };
    document.addEventListener('keydown', skip);
    return () => document.removeEventListener('keydown', skip);
  }, [visible]);

  if (visible !== true) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`${title} — loading`}
      onClick={() => setVisible(false)}
      className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center gap-8 bg-canvas p-6 text-content animate-fadeIn"
    >
      <div className="relative flex flex-col items-center">
        <div className="absolute -top-8 h-48 w-48 rounded-full border-2 border-emerald-500/20 opacity-30 motion-safe:animate-ping" />
        <div className="relative z-10 rounded-3xl border border-hairline bg-surface p-6 shadow-lg">
          <DailyCabLogo size="lg" showSubtitle animate />
        </div>
      </div>

      <div className="w-64 max-w-xs space-y-2 text-center">
        <div className="flex items-center justify-between gap-3 text-micro font-mono">
          <span className="font-semibold text-content-muted">{statusText}</span>
          <span className="font-bold tabular-nums text-success">{progress}%</span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-orange-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="pt-1 text-micro uppercase tracking-widest text-content-muted">
          {title}
        </div>
        <div className="text-micro text-content-muted/70">
          Tap or press Esc to skip
        </div>
      </div>
    </div>
  );
};
