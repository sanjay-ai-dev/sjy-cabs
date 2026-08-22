'use client';

import React, { useCallback, useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Accessible name. Rendered as the visible title unless `hideTitle`. */
  title: string;
  hideTitle?: boolean;
  /** Optional line under the title. */
  subtitle?: string;
  children: React.ReactNode;
  /** Max width of the panel. */
  size?: 'sm' | 'md' | 'lg';
  /** Set false for flows the user must explicitly resolve. */
  dismissible?: boolean;
  className?: string;
}

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
} as const;

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog. The modals this replaces had no role, no Escape handler,
 * no focus trap, no backdrop dismiss, and left the page scrollable behind them.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  hideTitle = false,
  subtitle,
  children,
  size = 'md',
  dismissible = true,
  className = '',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    if (dismissible) onClose();
  }, [dismissible, onClose]);

  // Move focus into the dialog on open, and back to the trigger on close.
  useEffect(() => {
    if (!isOpen) return;
    restoreFocusTo.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    return () => restoreFocusTo.current?.focus?.();
  }, [isOpen]);

  // Escape to dismiss + Tab cycling confined to the dialog.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== 'Tab') return;

      const nodes = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
      ).filter((el) => el.offsetParent !== null);
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen, close]);

  // Stop the page behind the dialog from scrolling.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const titleId = `modal-title-${title.replace(/\W+/g, '-').toLowerCase()}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/70 backdrop-blur-sm animate-fadeIn"
      // Backdrop dismiss, but only when the backdrop itself is the target —
      // otherwise a drag ending outside the panel would close the dialog.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`glass-card w-full ${SIZES[size]} max-h-[90vh] overflow-y-auto p-6 space-y-4 text-content shadow-2xl outline-none ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className={hideTitle ? 'sr-only' : ''}>
            <h2 id={titleId} className="text-lg font-extrabold font-display">
              {title}
            </h2>
            {subtitle && (
              <p className="text-micro text-content-muted mt-0.5">{subtitle}</p>
            )}
          </div>

          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="min-h-tap min-w-tap -mr-2 -mt-2 shrink-0 grid place-items-center rounded-full text-content-muted transition-colors hover:bg-surface-3 hover:text-content"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ✕
              </span>
            </button>
          )}
        </div>

        {children}
      </div>
    </div>
  );
};
