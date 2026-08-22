'use client';

import React from 'react';
import { Clock, MapPin, Navigation, Phone, ShieldCheck, Users } from 'lucide-react';
import { POOL_MODES } from '@/lib/pool-config';
import type { MatchIntent, PoolMatch } from '@/lib/pool-matching';

interface MatchCardProps {
  match: PoolMatch;
  intent: MatchIntent;
  onJoin: () => void;
}

function initials(name: string): string {
  return name
    .replace(/\(.*?\)/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, intent, onJoin }) => {
  const { post, mode } = match;
  const modeMeta = POOL_MODES[mode];
  const seatsLeft = post.availableSeats;
  const isFull = seatsLeft <= 0;

  return (
    <li className="rounded-3xl border border-hairline bg-surface p-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${modeMeta.soft} ${modeMeta.text}`}
        >
          {initials(post.driverName)}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-content">{post.driverName}</h3>
          <p className="truncate text-micro text-content-muted">
            {post.vehicleModel || modeMeta.label}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <div className={`text-base font-black ${modeMeta.text}`}>₹{match.farePerSeat}</div>
          <div className="text-micro text-content-muted">
            {match.fareIsQuoted ? 'per seat' : 'est. / seat'}
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 border-t border-hairline pt-3">
        <p className="flex items-start gap-2 text-meta text-content-secondary">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-content-muted" aria-hidden="true" />
          <span className="min-w-0">
            <span className="font-semibold text-content">{post.routeFrom}</span>
            <span className="mx-1.5 text-content-muted">→</span>
            <span className="font-semibold text-content">{post.routeTo}</span>
          </span>
        </p>

        <p className="flex items-center gap-2 text-meta text-content-secondary">
          <Clock className="h-3.5 w-3.5 shrink-0 text-content-muted" aria-hidden="true" />
          <span className="font-semibold text-content">{post.departureTime}</span>
          <span className="text-content-muted">·</span>
          <span>{post.departureDate}</span>
          {post.returnTime && (
            <>
              <span className="text-content-muted">·</span>
              <span>returns {post.returnTime}</span>
            </>
          )}
        </p>

        {intent === 'RIDES' && (
          <p className="flex items-center gap-2 text-meta">
            <Users className="h-3.5 w-3.5 shrink-0 text-content-muted" aria-hidden="true" />
            <span className={isFull ? 'font-semibold text-warning' : 'font-semibold text-success'}>
              {isFull
                ? `Full · ${post.bookings.filter((b) => b.isWaitlist).length} on waitlist`
                : `${seatsLeft} of ${post.totalSeats} seats open`}
            </span>
          </p>
        )}
      </div>

      {(post.isFemaleOnly || post.liveGpsEnabled || match.deviationKm > 0) && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {post.isFemaleOnly && (
            <li className="inline-flex items-center gap-1 rounded-full bg-female/10 px-2.5 py-1 text-micro font-bold text-female">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              Female only
            </li>
          )}
          {post.liveGpsEnabled && (
            <li className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-micro font-bold text-success">
              <Navigation className="h-3 w-3" aria-hidden="true" />
              Live GPS
            </li>
          )}
          {match.deviationKm > 0 && (
            <li className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2.5 py-1 text-micro font-semibold text-content-secondary">
              {match.deviationKm} km off your points
            </li>
          )}
          {match.timeDeltaMins !== null && match.timeDeltaMins > 0 && (
            <li className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2.5 py-1 text-micro font-semibold text-content-secondary">
              {match.timeDeltaMins} min from your time
            </li>
          )}
        </ul>
      )}

      {post.notes && (
        <p className="mt-3 text-meta leading-relaxed text-content-muted">{post.notes}</p>
      )}

      <div className="mt-4">
        {intent === 'RIDES' ? (
          <button
            type="button"
            onClick={onJoin}
            className={`min-h-tap w-full rounded-xl px-5 text-sm font-bold text-white transition-colors ${
              isFull ? 'bg-amber-700 hover:bg-amber-800' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isFull ? 'Join waitlist' : 'Request seat'}
          </button>
        ) : (
          // A car owner browsing riders is not booking anything — they just
          // need to reach the person.
          <a
            href={`tel:${post.phone}`}
            className="flex min-h-tap w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition-colors hover:bg-emerald-800"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call {post.driverName.split(' ')[0]}
          </a>
        )}
      </div>
    </li>
  );
};
