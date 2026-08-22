'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Clock, Hourglass, MapPin, Phone, Ticket, Trash2 } from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { POOL_MODES, POOL_ROLES } from '@/lib/pool-config';
import { usePoolRides, type PoolMyRide } from '@/lib/pool-profile';

const RideCard: React.FC<{
  ride: PoolMyRide;
  onRemove: (ride: PoolMyRide) => void;
  isBusy: boolean;
}> = ({ ride, onRemove, isBusy }) => {
  const mode = POOL_MODES[ride.mode];
  const role = POOL_ROLES[ride.role];
  const isBooked = ride.kind === 'BOOKED';

  return (
    <li className="rounded-3xl border border-hairline bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-micro font-bold ${mode.soft} ${mode.text}`}
            >
              {mode.label}
            </span>
            <span className="rounded-full bg-surface-3 px-2.5 py-1 text-micro font-bold text-content-secondary">
              {isBooked ? 'Seat booked' : 'You posted this'}
            </span>
            {ride.waitlistNumber !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-micro font-bold text-warning">
                <Hourglass className="h-3 w-3" aria-hidden="true" />
                Waitlist #{ride.waitlistNumber}
              </span>
            )}
          </div>

          <p className="mt-2 flex items-start gap-2 text-sm">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-content-muted"
              aria-hidden="true"
            />
            <span className="min-w-0 font-bold text-content">
              {ride.from}
              <span className="mx-1.5 font-normal text-content-muted">→</span>
              {ride.to}
            </span>
          </p>

          <p className="mt-1 flex items-center gap-2 text-meta text-content-secondary">
            <Clock className="h-3.5 w-3.5 shrink-0 text-content-muted" aria-hidden="true" />
            <span className="font-semibold text-content">{ride.time}</span>
            <span className="text-content-muted">·</span>
            <span>{ride.date}</span>
          </p>
        </div>

        <div className="shrink-0 text-right">
          <div className={`text-base font-black ${mode.text}`}>₹{ride.farePerSeat}</div>
          <div className="text-micro text-content-muted">
            {ride.seats} {role.seatNoun.toLowerCase()}
            {ride.seats === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-hairline pt-3">
        {isBooked && (
          <a
            href={`tel:${ride.counterpartPhone}`}
            className="flex min-h-tap items-center gap-2 rounded-xl border border-hairline bg-surface-2 px-4 text-meta font-semibold text-content-secondary transition-colors hover:bg-surface-3 hover:text-content"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            Call {ride.counterpartName.split(' ')[0]}
          </a>
        )}

        <button
          type="button"
          onClick={() => onRemove(ride)}
          disabled={isBusy}
          className="flex min-h-tap items-center gap-2 rounded-xl border border-hairline bg-surface-2 px-4 text-meta font-semibold text-content-secondary transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-60"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          {isBooked ? 'Cancel seat' : 'Remove from my list'}
        </button>
      </div>
    </li>
  );
};

export const RidesView: React.FC = () => {
  const { toast } = useToast();
  const { rides, removeRide } = usePoolRides();
  const [busyId, setBusyId] = useState<string | null>(null);

  const { booked, offered } = useMemo(
    () => ({
      booked: rides.filter((ride) => ride.kind === 'BOOKED'),
      offered: rides.filter((ride) => ride.kind === 'OFFERED'),
    }),
    [rides]
  );

  const handleRemove = async (ride: PoolMyRide) => {
    setBusyId(ride.id);
    try {
      // Only a booked seat needs releasing server-side; a post the user
      // published stays in the feed for others until they delete it there.
      if (ride.kind === 'BOOKED' && ride.bookingId) {
        const response = await fetch('/api/carpool', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: ride.postId,
            action: 'CANCEL_BOOKING',
            bookingId: ride.bookingId,
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          toast({
            tone: 'error',
            title: 'Could not release the seat',
            detail: 'It is still held for you. Try again in a moment.',
          });
          return;
        }
      }

      removeRide(ride.id);
      toast({
        tone: 'success',
        title: ride.kind === 'BOOKED' ? 'Seat released' : 'Removed from your list',
        detail:
          ride.kind === 'BOOKED'
            ? 'Anyone on the waitlist moves up automatically.'
            : 'Your post is no longer tracked on this device.',
      });
    } catch {
      toast({
        tone: 'error',
        title: 'Network error',
        detail: 'Check your connection and try again.',
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 px-4 py-5">
      <header className="space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight text-content">My rides</h1>
        <p className="text-meta text-content-muted">
          Seats you have taken and rides you have published, saved on this device.
        </p>
      </header>

      {rides.length === 0 && (
        <div className="space-y-4 rounded-3xl border border-hairline bg-surface px-4 py-10 text-center">
          <Ticket className="mx-auto h-8 w-8 text-content-muted" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-content">Nothing here yet</p>
            <p className="mx-auto max-w-sm text-meta leading-relaxed text-content-muted">
              Plan a trip to find commuters going your way, or publish your own
              route so they can find you.
            </p>
          </div>
          <Link
            href="/pool"
            className="inline-block min-h-tap rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
          >
            Plan a trip
          </Link>
        </div>
      )}

      {booked.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-micro font-bold uppercase tracking-wide text-content-muted">
            Seats you have taken
          </h2>
          <ul className="space-y-3">
            {booked.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onRemove={handleRemove}
                isBusy={busyId === ride.id}
              />
            ))}
          </ul>
        </section>
      )}

      {offered.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-micro font-bold uppercase tracking-wide text-content-muted">
            Rides you have published
          </h2>
          <ul className="space-y-3">
            {offered.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onRemove={handleRemove}
                isBusy={busyId === ride.id}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
