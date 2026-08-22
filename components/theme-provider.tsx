'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'sjy_cabs_theme';

/**
 * Injected into <head> and executed synchronously before first paint so the
 * correct theme is on <html> by the time anything renders. Without this the
 * app paints light, hydrates, then snaps to dark.
 *
 * Kept dependency-free and defensive: a throwing localStorage (Safari private
 * mode, embedded webviews) must not take the page down.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var k='${STORAGE_KEY}';var s=localStorage.getItem(k);
var t=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
document.documentElement.setAttribute('data-theme',t);
}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

interface ThemeContextValue {
  /** What the user chose, including 'system'. */
  preference: ThemePreference;
  /** What is actually applied right now. Never 'system'. */
  theme: ResolvedTheme;
  setPreference: (next: ThemePreference) => void;
  /** Flips between light and dark, leaving 'system' behind. */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function readStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialised from the DOM attribute the init script already set, so the
  // first client render agrees with what the user is looking at.
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [theme, setTheme] = useState<ResolvedTheme>('light');

  useEffect(() => {
    const stored = readStoredPreference();
    setPreferenceState(stored);
    setTheme(stored === 'system' ? systemTheme() : stored);
  }, []);

  // Track OS changes, but only while the user is on 'system'.
  useEffect(() => {
    if (preference !== 'system' || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setTheme(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preference]);

  // Single place that writes the DOM attribute every consumer reads.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Notifies non-React consumers (the Leaflet map swaps its tile layer).
    window.dispatchEvent(new CustomEvent('sjy-theme-change', { detail: theme }));
  }, [theme]);

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = readStoredPreference();
      setPreferenceState(next);
      setTheme(next === 'system' ? systemTheme() : next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    setTheme(next === 'system' ? systemTheme() : next);
    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — the in-memory state still applies */
    }
  }, []);

  const toggle = useCallback(() => {
    setPreference(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setPreference]);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, theme, setPreference, toggle }),
    [preference, theme, setPreference, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}
