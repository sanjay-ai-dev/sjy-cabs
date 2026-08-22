'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CarFront, PlusCircle, Search, Ticket, User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

/**
 * Four items, deliberately. The convention every Indian mobility app follows
 * (Uber, Ola, Rapido, sRide) caps the bottom bar at five, and a fifth item here
 * would only duplicate something already one tap away.
 */
const NAV_ITEMS = [
  { href: '/pool', label: 'Plan', icon: Search },
  { href: '/pool/offer', label: 'Offer', icon: PlusCircle },
  { href: '/pool/rides', label: 'My Rides', icon: Ticket },
  { href: '/pool/profile', label: 'Profile', icon: User },
] as const;

function isActive(pathname: string, href: string): boolean {
  // A plain startsWith would light up every tab on every child route. Matches
  // is the second step of the Plan flow rather than a destination of its own,
  // so it keeps Plan lit instead of leaving the whole bar dark.
  if (href === '/pool') return pathname === '/pool' || pathname.startsWith('/pool/matches');
  return pathname.startsWith(href);
}

export const PoolShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname() ?? '/pool';

  return (
    <div className="min-h-screen bg-canvas text-content">
      <header className="sticky top-0 z-30 border-b border-hairline bg-canvas/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/pool"
            className="flex min-h-tap items-center gap-2"
            aria-label="DailyCab Pool home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <CarFront className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-base font-extrabold tracking-tight">
              DailyCab <span className="text-brand">Pool</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="hidden min-h-tap items-center rounded-xl px-3 text-meta font-semibold text-content-muted transition-colors hover:text-content sm:inline-flex"
            >
              Shuttle service
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Bottom padding clears the fixed nav plus the iOS home indicator. */}
      <main className="mx-auto max-w-2xl pb-28">{children}</main>

      <nav
        aria-label="Carpool sections"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface/95 pb-safe backdrop-blur-xl"
      >
        <ul className="mx-auto flex max-w-2xl items-stretch">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-tap flex-col items-center justify-center gap-1 py-2 transition-colors ${
                    active ? 'text-brand' : 'text-content-muted hover:text-content'
                  }`}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={active ? 2.4 : 1.9}
                    aria-hidden="true"
                  />
                  <span className={`text-micro ${active ? 'font-bold' : 'font-medium'}`}>
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
