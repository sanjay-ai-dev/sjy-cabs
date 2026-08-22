'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Route as RouteIcon, ShieldCheck, Timer } from 'lucide-react';
import { RoleSwitcher } from '@/components/pool/role-switcher';
import { RouteCard } from '@/components/pool/route-card';
import { WhenFields } from '@/components/pool/when-fields';
import { SeatStepper } from '@/components/pool/seat-stepper';
import { ChipGroup } from '@/components/pool/chip-group';
import { PoolMap } from '@/components/pool/pool-map';
import {
  POOL_MODES,
  POOL_ROLES,
  RIDE_PURPOSES,
  clampSeats,
  estimateFare,
  estimateMinutes,
  estimateRoadKm,
  tripFromSearchParams,
  tripToSearchParams,
  type PoolRole,
  type PoolTripDraft,
  type RidePurpose,
} from '@/lib/pool-config';
import { usePoolProfile } from '@/lib/pool-profile';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

export const PlannerView: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { profile, isHydrated } = usePoolProfile();

  // Seeded from the URL so "Edit" on the results screen comes back with
  // everything still filled in, and so a plan can be shared as a link.
  const [trip, setTrip] = useState<PoolTripDraft>(() => tripFromSearchParams(searchParams));
  const [error, setError] = useState<string | null>(null);

  // Apply the saved female-only preference — but never over an explicit value
  // in the URL, which is the user's decision for *this* search.
  const femaleOnlyCameFromUrl = searchParams?.get('femaleOnly') != null;
  useEffect(() => {
    if (!isHydrated || femaleOnlyCameFromUrl || !profile.femaleOnlyPreference) return;
    setTrip((current) => (current.femaleOnly ? current : { ...current, femaleOnly: true }));
  }, [isHydrated, femaleOnlyCameFromUrl, profile.femaleOnlyPreference]);

  const role = POOL_ROLES[trip.role];
  const mode = POOL_MODES[role.mode];

  const patch = (next: Partial<PoolTripDraft>) => {
    setTrip((current) => ({ ...current, ...next }));
    setError(null);
  };

  const changeRole = (nextRole: PoolRole) => {
    setTrip((current) => ({
      ...current,
      role: nextRole,
      // A rider asking for 3 seats and an owner offering 3 are different
      // numbers with different ceilings, so re-seat on every role change.
      seats: POOL_ROLES[nextRole].defaultSeats,
    }));
    setError(null);
  };

  const { roadKm, minutes, farePerSeat } = useMemo(() => {
    const km = estimateRoadKm(trip.from, trip.to);
    return {
      roadKm: km,
      minutes: estimateMinutes(km),
      farePerSeat: estimateFare(role.mode, km),
    };
  }, [trip.from, trip.to, role.mode]);

  const hasRoute = trip.from.trim().length > 0 && trip.to.trim().length > 0;

  const validate = (): string | null => {
    if (!trip.from.trim()) return 'Add a pickup point to continue.';
    if (!trip.to.trim()) return 'Add a drop point to continue.';
    if (trip.from.trim().toLowerCase() === trip.to.trim().toLowerCase()) {
      return 'Pickup and drop cannot be the same place.';
    }
    return null;
  };

  const submit = () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    const query = tripToSearchParams(trip).toString();
    // Riders go looking for seats; bikers and car owners go and post theirs.
    router.push(role.offersRide ? `/pool/offer?${query}` : `/pool/matches?${query}`);
  };

  const secondary = role.offersRide
    ? { href: `/pool/matches?${tripToSearchParams(trip).toString()}`, label: 'Browse who needs a seat' }
    : { href: `/pool/offer?${tripToSearchParams(trip).toString()}`, label: 'Offering a ride instead?' };

  return (
    <div>
      <PoolMap
        from={trip.from}
        to={trip.to}
        accent={role.mapAccent}
        className="h-[32vh] min-h-[190px] w-full"
      />

      {/* The sheet lifts over the map, which is the cue that the map is
          context and the controls below are the actual task. */}
      <div className="relative -mt-6 rounded-t-[28px] border-t border-hairline bg-canvas px-4 pb-2 pt-1">
        <RoleSwitcher value={trip.role} onChange={changeRole} />

        <p className="pt-3 text-meta text-content-muted">{role.blurb}</p>

        <div className="space-y-6 pt-4">
          <RouteCard
            from={trip.from}
            to={trip.to}
            onFromChange={(value) => patch({ from: value })}
            onToChange={(value) => patch({ to: value })}
            onSwap={() => patch({ from: trip.to, to: trip.from })}
            accentText={role.text}
          />

          <WhenFields
            date={trip.date}
            time={trip.time}
            onDateChange={(value) => patch({ date: value })}
            onTimeChange={(value) => patch({ time: value })}
            idPrefix="pool-plan"
          />

          <div className="space-y-2">
            <h2 className="text-micro font-bold uppercase tracking-wide text-content-muted">
              Travelling for
            </h2>
            <ChipGroup
              label="Trip purpose"
              options={RIDE_PURPOSES}
              value={trip.purpose}
              onChange={(value) => patch({ purpose: value as RidePurpose })}
              accentText={role.text}
              accentBorder={role.border}
              accentSoft={role.soft}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-content">
                {role.offersRide ? 'Seats you can offer' : 'Seats you need'}
              </h2>
              <p className="text-micro text-content-muted">
                {role.offersRide
                  ? 'How many co-passengers can come along'
                  : 'Including yourself'}
              </p>
            </div>
            <SeatStepper
              value={trip.seats}
              min={role.minSeats}
              max={role.maxSeats}
              noun={role.seatNoun}
              label={role.offersRide ? 'Seats offered' : 'Seats needed'}
              onChange={(value) => patch({ seats: clampSeats(value, trip.role) })}
            />
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={trip.femaleOnly}
            onClick={() => patch({ femaleOnly: !trip.femaleOnly })}
            className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
              trip.femaleOnly
                ? 'border-female bg-female/10'
                : 'border-hairline bg-surface hover:bg-surface-2'
            }`}
          >
            <ShieldCheck
              className={`h-5 w-5 shrink-0 ${trip.femaleOnly ? 'text-female' : 'text-content-muted'}`}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-content">
                {role.offersRide ? 'Female passengers only' : 'Female-only rides only'}
              </span>
              <span className="block text-micro text-content-muted">
                {role.offersRide
                  ? 'Your post will only be joinable by women'
                  : 'Hide every ride that is not marked female-only'}
              </span>
            </span>
            {/* Track and knob. The knob colour is inherited from the track so
                the two can never drift apart. */}
            <span
              aria-hidden="true"
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                trip.femaleOnly ? 'bg-female' : 'bg-surface-3'
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-surface transition-all ${
                  trip.femaleOnly ? 'left-6' : 'left-1'
                }`}
              />
            </span>
          </button>

          {hasRoute && roadKm > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-2xl border border-hairline bg-surface-2 px-4 py-3">
              <div className="flex items-center gap-4 text-meta font-semibold text-content-secondary">
                <span className="flex items-center gap-1.5">
                  <RouteIcon className="h-4 w-4 text-content-muted" aria-hidden="true" />
                  {roadKm} km
                </span>
                <span className="flex items-center gap-1.5">
                  <Timer className="h-4 w-4 text-content-muted" aria-hidden="true" />
                  {formatDuration(minutes)}
                </span>
              </div>
              <div className="text-right">
                <div className={`text-base font-black ${mode.text}`}>
                  ₹{farePerSeat}
                  <span className="text-meta font-semibold text-content-muted">
                    {' '}
                    / {role.seatNoun.toLowerCase()}
                  </span>
                </div>
                <div className="text-micro text-content-muted">
                  {mode.label} fuel-share estimate
                </div>
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="text-meta font-semibold text-danger">
              {error}
            </p>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={submit}
              className={`flex min-h-tap w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold text-white transition-colors ${role.fill}`}
            >
              {role.offersRide ? 'Offer this ride' : 'Find matching rides'}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>

            <Link
              href={secondary.href}
              className="block text-center text-meta font-semibold text-content-muted underline decoration-hairline underline-offset-4 transition-colors hover:text-content"
            >
              {secondary.label}
            </Link>
          </div>

          <p className="pb-2 text-micro leading-relaxed text-content-muted">
            Amounts shown are suggested fuel-share splits between commuters, not
            a fare we collect. Settle directly with your ride partner.{' '}
            <Link href="/" className="font-semibold text-brand underline underline-offset-2">
              Need a booked seat instead?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
