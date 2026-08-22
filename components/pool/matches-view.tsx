'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, Pencil, RefreshCw, SearchX } from 'lucide-react';
import { MatchCard } from '@/components/pool/match-card';
import { JoinRideDialog } from '@/components/pool/join-ride-dialog';
import type { CarpoolPost } from '@/lib/carpool-store';
import {
  POOL_MODES,
  POOL_MODE_ORDER,
  POOL_ROLES,
  formatDateLabel,
  formatTimeLabel,
  tripFromSearchParams,
  tripToSearchParams,
  type PoolMode,
} from '@/lib/pool-config';
import {
  buildMatches,
  cheapestFare,
  groupMatchesByMode,
  modeEstimate,
  type MatchIntent,
  type PoolMatch,
} from '@/lib/pool-matching';
import { usePoolProfile } from '@/lib/pool-profile';

export const MatchesView: React.FC = () => {
  const searchParams = useSearchParams();
  const trip = useMemo(() => tripFromSearchParams(searchParams), [searchParams]);
  const role = POOL_ROLES[trip.role];
  const { profile } = usePoolProfile();

  // A rider is shopping for seats; a biker or car owner is looking at who needs
  // one. Same screen, mirrored intent.
  const intent: MatchIntent = role.offersRide ? 'RIDERS' : 'RIDES';

  const [posts, setPosts] = useState<CarpoolPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<PoolMode>(role.mode);
  const [joinTarget, setJoinTarget] = useState<PoolMatch | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch('/api/carpool', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error('bad response');
      setPosts(data.posts as CarpoolPost[]);
    } catch {
      setLoadError('Could not load community rides. Check your connection and retry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const matches = useMemo(
    () => buildMatches(posts, trip, intent, { phone: profile.phone, gender: profile.gender }),
    [posts, trip, intent, profile.phone, profile.gender]
  );
  const grouped = useMemo(() => groupMatchesByMode(matches), [matches]);

  const editHref = `/pool?${tripToSearchParams(trip).toString()}`;
  const postHref = `/pool/offer?${tripToSearchParams(trip).toString()}`;
  const showModes = intent === 'RIDES';
  const visible = showModes ? grouped[selectedMode] : matches;

  return (
    <div className="space-y-6 px-4 py-5">
      {/* ---- What we searched for, and how to change it ------------------ */}
      <section className="rounded-3xl border border-hairline bg-surface p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold text-content">
              {trip.from || 'Anywhere'}
              <span className="mx-2 font-normal text-content-muted">→</span>
              {trip.to || 'Anywhere'}
            </h1>
            <p className="mt-1 text-meta text-content-muted">
              {formatDateLabel(trip.date)} · {formatTimeLabel(trip.time)} ·{' '}
              {trip.seats} {role.seatNoun.toLowerCase()}
              {trip.seats === 1 ? '' : 's'}
              {trip.femaleOnly && ' · female only'}
            </p>
          </div>

          <Link
            href={editHref}
            className="flex min-h-tap shrink-0 items-center gap-1.5 rounded-xl border border-hairline bg-surface-2 px-3 text-meta font-semibold text-content-secondary transition-colors hover:bg-surface-3 hover:text-content"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </Link>
        </div>
      </section>

      {/* ---- Mode picker ------------------------------------------------- */}
      {showModes && (
        <section className="space-y-2">
          <h2 className="text-micro font-bold uppercase tracking-wide text-content-muted">
            How you want to travel
          </h2>
          <div role="radiogroup" aria-label="Pooling mode" className="space-y-2">
            {POOL_MODE_ORDER.map((modeId) => {
              const meta = POOL_MODES[modeId];
              const count = grouped[modeId].length;
              const selected = modeId === selectedMode;
              const cheapest = cheapestFare(grouped[modeId]) ?? modeEstimate(modeId, trip);

              return (
                <button
                  key={modeId}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setSelectedMode(modeId)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                    selected
                      ? 'border-brand bg-brand/5'
                      : 'border-hairline bg-surface hover:bg-surface-2'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-10 w-1.5 shrink-0 rounded-full ${
                      count > 0 ? meta.text : 'text-content-muted'
                    }`}
                    style={{ backgroundColor: 'currentColor' }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-content">{meta.label}</span>
                    <span className="block text-micro text-content-muted">
                      {isLoading
                        ? 'Searching…'
                        : count > 0
                          ? `${count} match${count === 1 ? '' : 'es'} · ${meta.blurb}`
                          : `No matches yet · ${meta.blurb}`}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className={`block text-sm font-black ${meta.text}`}>₹{cheapest}</span>
                    <span className="block text-micro text-content-muted">
                      {count > 0 ? 'from' : 'est.'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ---- Results ----------------------------------------------------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-micro font-bold uppercase tracking-wide text-content-muted">
            {intent === 'RIDES'
              ? `${POOL_MODES[selectedMode].label} rides`
              : 'Commuters looking for a seat'}
          </h2>
          <button
            type="button"
            onClick={() => void load()}
            disabled={isLoading}
            className="flex min-h-tap items-center gap-1.5 rounded-xl px-2 text-meta font-semibold text-content-muted transition-colors hover:text-content disabled:opacity-60"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? 'motion-safe:animate-spin' : ''}`}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>

        {isLoading && (
          <p className="flex items-center gap-2 rounded-2xl border border-hairline bg-surface px-4 py-6 text-meta text-content-muted">
            <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
            Finding rides along your route…
          </p>
        )}

        {!isLoading && loadError && (
          <div
            role="alert"
            className="space-y-3 rounded-2xl border border-hairline bg-danger/10 px-4 py-4"
          >
            <p className="text-meta font-semibold text-danger">{loadError}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="min-h-tap rounded-xl border border-hairline bg-surface px-4 text-meta font-semibold text-content-secondary hover:text-content"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !loadError && visible.length === 0 && (
          <div className="space-y-4 rounded-3xl border border-hairline bg-surface px-4 py-8 text-center">
            <SearchX className="mx-auto h-8 w-8 text-content-muted" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-content">
                {intent === 'RIDES'
                  ? `No ${POOL_MODES[selectedMode].label.toLowerCase()} rides on this route yet`
                  : 'Nobody is asking for a seat on this route yet'}
              </p>
              <p className="mx-auto max-w-sm text-meta leading-relaxed text-content-muted">
                {intent === 'RIDES'
                  ? 'Post what you need and the community will see it. Most matches on this corridor come from a request, not a search.'
                  : 'Post your empty seats so commuters can find you when they search.'}
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Link
                href={postHref}
                className={`min-h-tap w-full max-w-xs rounded-xl px-5 py-3 text-sm font-bold text-white transition-colors ${role.fill}`}
              >
                {intent === 'RIDES' ? 'Post a ride request' : 'Post your empty seats'}
              </Link>
              <Link
                href="/community"
                className="text-meta font-semibold text-content-muted underline underline-offset-4 hover:text-content"
              >
                Browse the whole community feed
              </Link>
            </div>
          </div>
        )}

        {!isLoading && visible.length > 0 && (
          <ul className="space-y-3">
            {visible.map((match) => (
              <MatchCard
                key={match.post.id}
                match={match}
                intent={intent}
                onJoin={() => setJoinTarget(match)}
              />
            ))}
          </ul>
        )}
      </section>

      <JoinRideDialog
        match={joinTarget}
        trip={trip}
        onClose={() => setJoinTarget(null)}
        onJoined={() => void load()}
      />
    </div>
  );
};
