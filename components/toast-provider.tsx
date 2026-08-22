'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

type ToastTone = 'success' | 'info' | 'warning' | 'error';

interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  /** Optional detail lines, rendered under the title. */
  detail?: string;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE: Record<ToastTone, { icon: string; ring: string; text: string }> = {
  success: { icon: '✅', ring: 'border-emerald-500/50', text: 'text-success' },
  info: { icon: 'ℹ️', ring: 'border-indigo-500/50', text: 'text-brand' },
  warning: { icon: '⚠️', ring: 'border-amber-500/50', text: 'text-warning' },
  error: { icon: '🚨', ring: 'border-rose-500/60', text: 'text-danger' },
};

/**
 * In-app toasts, replacing the 11 native `alert()` calls the app used for
 * booking confirmations. `alert()` blocks the main thread, cannot be styled or
 * themed, is unreadable on mobile, and reads as a browser error to users.
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { ...t, id }]);
      // Long enough to read a two-line confirmation without trapping the user.
      window.setTimeout(() => dismiss(id), 6000);
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* aria-live so screen readers announce confirmations without stealing
          focus — the behaviour alert() could never provide. */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="fixed left-1/2 z-[100] flex w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2 pointer-events-none"
        style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))' }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`glass-card pointer-events-auto flex items-start gap-3 border p-3.5 shadow-xl animate-fadeIn ${TONE[t.tone].ring}`}
          >
            <span aria-hidden="true" className="text-base leading-none pt-0.5">
              {TONE[t.tone].icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className={`text-meta font-extrabold ${TONE[t.tone].text}`}>
                {t.title}
              </div>
              {t.detail && (
                <div className="mt-0.5 whitespace-pre-line text-micro text-content-secondary">
                  {t.detail}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="min-h-tap min-w-tap -my-2 -mr-2 shrink-0 grid place-items-center rounded-full text-content-muted transition-colors hover:bg-surface-3 hover:text-content"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
