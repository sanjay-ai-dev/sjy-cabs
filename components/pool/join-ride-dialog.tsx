'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '@/components/modal';
import { useToast } from '@/components/toast-provider';
import { POOL_MODES, type PoolTripDraft } from '@/lib/pool-config';
import type { PoolMatch } from '@/lib/pool-matching';
import { isValidPhone, usePoolProfile, usePoolRides } from '@/lib/pool-profile';

interface JoinRideDialogProps {
  match: PoolMatch | null;
  trip: PoolTripDraft;
  onClose: () => void;
  /** Called after a successful join so the list can refresh its seat counts. */
  onJoined: () => void;
}

/**
 * Confirmation step for taking a seat in someone's car.
 *
 * Name and phone are required by `/api/carpool`, and are the only two things a
 * ride partner actually needs to find you at the pickup point. Both prefill
 * from the saved profile, so a returning commuter just confirms.
 */
export const JoinRideDialog: React.FC<JoinRideDialogProps> = ({
  match,
  trip,
  onClose,
  onJoined,
}) => {
  const { toast } = useToast();
  const { profile, saveProfile } = usePoolProfile();
  const { addRide } = usePoolRides();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [remember, setRemember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-seed each time the dialog opens for a different ride, and pick up a
  // profile that may have hydrated after the first render.
  useEffect(() => {
    if (!match) return;
    setName(profile.name);
    setPhone(profile.phone);
    setError(null);
  }, [match, profile.name, profile.phone]);

  if (!match) return null;

  const { post } = match;
  const willWaitlist = post.availableSeats <= 0;

  const submit = async () => {
    if (name.trim().length < 2) {
      setError('Enter the name your ride partner should look for.');
      return;
    }
    if (!isValidPhone(phone)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/carpool', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          action: 'BOOK_SEAT',
          userName: name.trim(),
          userPhone: phone.replace(/\D/g, ''),
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error ?? 'Could not join this ride. Try again.');
        return;
      }

      if (remember) saveProfile({ name: name.trim(), phone: phone.replace(/\D/g, '') });

      addRide({
        kind: 'BOOKED',
        postId: post.id,
        bookingId: data.post?.bookings?.at(-1)?.id,
        role: trip.role,
        mode: match.mode,
        from: post.routeFrom,
        to: post.routeTo,
        date: post.departureDate,
        time: post.departureTime,
        seats: 1,
        farePerSeat: match.farePerSeat,
        waitlistNumber: data.isWaitlist ? data.waitlistNumber : undefined,
        counterpartName: post.driverName,
        counterpartPhone: post.phone,
      });

      toast({
        tone: data.isWaitlist ? 'info' : 'success',
        title: data.isWaitlist
          ? `You are number ${data.waitlistNumber} on the waitlist`
          : `Seat confirmed with ${post.driverName}`,
        detail: data.isWaitlist
          ? 'We will move you up automatically if someone cancels.'
          : `Call ${post.phone} to agree on the exact pickup point.`,
      });

      onJoined();
      onClose();
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={willWaitlist ? 'Join the waitlist' : 'Request this seat'}
      subtitle={`${post.routeFrom} → ${post.routeTo}`}
      size="md"
    >
      <div className="space-y-4">
        <dl className="space-y-2 rounded-2xl border border-hairline bg-surface-2 px-4 py-3 text-meta">
          <div className="flex justify-between gap-4">
            <dt className="text-content-muted">Driver</dt>
            <dd className="text-right font-semibold text-content">{post.driverName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-content-muted">Leaves</dt>
            <dd className="text-right font-semibold text-content">
              {post.departureTime} · {post.departureDate}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-content-muted">{POOL_MODES[match.mode].label} share</dt>
            <dd className="text-right font-semibold text-content">
              ₹{match.farePerSeat}
              {!match.fareIsQuoted && (
                <span className="font-normal text-content-muted"> (estimated)</span>
              )}
            </dd>
          </div>
        </dl>

        {willWaitlist && (
          <p className="rounded-2xl border border-hairline bg-warning/10 px-4 py-3 text-meta text-content-secondary">
            This ride is full right now. Joining the waitlist means you get the
            seat automatically if someone cancels — nothing is charged either way.
          </p>
        )}

        <div className="space-y-3">
          <div>
            <label
              htmlFor="join-name"
              className="mb-1 block text-micro font-semibold uppercase tracking-wide text-content-muted"
            >
              Your name
            </label>
            <input
              id="join-name"
              type="text"
              value={name}
              autoComplete="name"
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
              placeholder="Name at the pickup point"
              className="w-full rounded-xl px-3"
            />
          </div>

          <div>
            <label
              htmlFor="join-phone"
              className="mb-1 block text-micro font-semibold uppercase tracking-wide text-content-muted"
            >
              Mobile number
            </label>
            <input
              id="join-phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              autoComplete="tel"
              onChange={(event) => {
                setPhone(event.target.value);
                setError(null);
              }}
              placeholder="10-digit number"
              className="w-full rounded-xl px-3"
            />
            <p className="mt-1 text-micro text-content-muted">
              Shared only with {post.driverName} so they can reach you.
            </p>
          </div>

          <label
            htmlFor="join-remember"
            className="flex min-h-tap cursor-pointer items-center gap-3 text-meta text-content-secondary"
          >
            <input
              id="join-remember"
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="rounded"
            />
            Remember these details on this device
          </label>
        </div>

        {error && (
          <p role="alert" className="text-meta font-semibold text-danger">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-tap rounded-xl border border-hairline bg-surface px-5 text-sm font-semibold text-content-secondary transition-colors hover:bg-surface-2 hover:text-content"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isSubmitting}
            className="flex min-h-tap items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-70"
          >
            {isSubmitting && (
              <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
            )}
            {willWaitlist ? 'Join waitlist' : 'Confirm seat'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
