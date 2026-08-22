'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Navigation, Send, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { RoleSwitcher } from '@/components/pool/role-switcher';
import { RouteCard } from '@/components/pool/route-card';
import { WhenFields } from '@/components/pool/when-fields';
import { SeatStepper } from '@/components/pool/seat-stepper';
import { ChipGroup } from '@/components/pool/chip-group';
import {
  POOL_MODES,
  POOL_ROLES,
  clampSeats,
  estimateFare,
  estimateRoadKm,
  formatTimeLabel,
  tripFromSearchParams,
  type PoolRole,
  type PoolTripDraft,
} from '@/lib/pool-config';
import { isValidPhone, usePoolProfile, usePoolRides } from '@/lib/pool-profile';

const REPEAT_OPTIONS = ['Daily (Mon-Sat)', 'Daily (Mon-Fri)', 'One-time trip'] as const;
type RepeatOption = (typeof REPEAT_OPTIONS)[number];

const GENDER_OPTIONS = ['Female', 'Male', 'Prefer not to say'] as const;

/**
 * One form for putting something into the community feed.
 *
 * Which *kind* of post it creates follows from the role: a car owner or biker
 * publishes an offer of seats, a rider publishes a request for one. Splitting
 * this into two screens would duplicate the route, timing and identity fields
 * for no gain — the only real difference is a handful of vehicle fields.
 */
export const OfferView: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { profile, saveProfile } = usePoolProfile();
  const { addRide } = usePoolRides();

  const [trip, setTrip] = useState<PoolTripDraft>(() => tripFromSearchParams(searchParams));
  const [repeat, setRepeat] = useState<RepeatOption>('Daily (Mon-Sat)');
  const [returnTime, setReturnTime] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [shareAmount, setShareAmount] = useState('');
  const [liveGps, setLiveGps] = useState(true);
  const [notes, setNotes] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<string>('Prefer not to say');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const role = POOL_ROLES[trip.role];
  const mode = POOL_MODES[role.mode];

  // Prefill identity once the profile has hydrated from localStorage.
  useEffect(() => {
    setName((current) => current || profile.name);
    setPhone((current) => current || profile.phone);
    if (profile.gender === 'female') setGender('Female');
    else if (profile.gender === 'male') setGender('Male');
  }, [profile.name, profile.phone, profile.gender]);

  const suggestedShare = useMemo(
    () => estimateFare(role.mode, estimateRoadKm(trip.from, trip.to)),
    [role.mode, trip.from, trip.to]
  );

  const patch = (next: Partial<PoolTripDraft>) => {
    setTrip((current) => ({ ...current, ...next }));
    setError(null);
  };

  const changeRole = (nextRole: PoolRole) => {
    setTrip((current) => ({
      ...current,
      role: nextRole,
      seats: POOL_ROLES[nextRole].defaultSeats,
    }));
    setError(null);
  };

  const validate = (): string | null => {
    if (!trip.from.trim()) return 'Add the pickup point people should look for.';
    if (!trip.to.trim()) return 'Add where this trip ends.';
    if (trip.from.trim().toLowerCase() === trip.to.trim().toLowerCase()) {
      return 'Pickup and drop cannot be the same place.';
    }
    if (name.trim().length < 2) return 'Add the name commuters will see.';
    if (!isValidPhone(phone)) return 'Enter a valid 10-digit mobile number.';
    if (trip.femaleOnly && gender !== 'Female') {
      // A female-only ride driven by a man is the exact failure this flag
      // exists to prevent, so it is a hard stop rather than a warning.
      return 'A female-only ride can only be posted by a female driver or passenger.';
    }
    return null;
  };

  const submit = async () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const amount = Number(shareAmount) > 0 ? Number(shareAmount) : suggestedShare;
    const cleanPhone = phone.replace(/\D/g, '');

    try {
      const response = await fetch('/api/carpool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: role.offersRide ? 'OFFER' : 'SEEK',
          posterRole: role.offersRide ? 'CAR_OWNER' : 'PASSENGER',
          vehicleType: trip.role === 'BIKER' ? 'BIKE' : 'CAR',
          driverName: name.trim(),
          driverGender: gender === 'Female' ? 'female' : 'male',
          phone: cleanPhone,
          routeFrom: trip.from.trim(),
          routeTo: trip.to.trim(),
          departureDate: repeat === 'One-time trip' ? trip.date : repeat,
          departureTime: formatTimeLabel(trip.time),
          returnTime: returnTime ? formatTimeLabel(returnTime) : '',
          totalSeats: trip.seats,
          vehicleModel: vehicleModel.trim(),
          vehicleNumber: vehicleNumber.trim(),
          fuelShare: `₹${amount} / ${role.seatNoun.toLowerCase()}`,
          isFemaleOnly: trip.femaleOnly,
          liveGpsEnabled: role.offersRide ? liveGps : false,
          notes: notes.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error ?? 'Could not publish your post. Try again.');
        return;
      }

      saveProfile({
        name: name.trim(),
        phone: cleanPhone,
        gender:
          gender === 'Female' ? 'female' : gender === 'Male' ? 'male' : 'unspecified',
      });

      addRide({
        kind: 'OFFERED',
        postId: data.post.id,
        role: trip.role,
        mode: role.mode,
        from: trip.from.trim(),
        to: trip.to.trim(),
        date: repeat === 'One-time trip' ? trip.date : repeat,
        time: formatTimeLabel(trip.time),
        seats: trip.seats,
        farePerSeat: amount,
        counterpartName: name.trim(),
        counterpartPhone: cleanPhone,
      });

      toast({
        tone: 'success',
        title: role.offersRide ? 'Your ride is live' : 'Your request is live',
        detail: 'Commuters searching this route will see it right away.',
      });
      router.push('/pool/rides');
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 px-4 py-5">
      <header className="space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight text-content">
          {role.offersRide ? 'Offer a ride' : 'Ask for a ride'}
        </h1>
        <p className="text-meta text-content-muted">
          {role.offersRide
            ? 'Publish your route once. Commuters going the same way will find it.'
            : 'Tell the community what you need. Car owners on your route will see it.'}
        </p>
      </header>

      <RoleSwitcher value={trip.role} onChange={changeRole} />

      <RouteCard
        from={trip.from}
        to={trip.to}
        onFromChange={(value) => patch({ from: value })}
        onToChange={(value) => patch({ to: value })}
        onSwap={() => patch({ from: trip.to, to: trip.from })}
        accentText={role.text}
      />

      <div className="space-y-2">
        <h2 className="text-micro font-bold uppercase tracking-wide text-content-muted">
          How often
        </h2>
        <ChipGroup
          label="Trip frequency"
          options={REPEAT_OPTIONS}
          value={repeat}
          onChange={(value) => setRepeat(value as RepeatOption)}
          accentText={role.text}
          accentBorder={role.border}
          accentSoft={role.soft}
        />
      </div>

      <WhenFields
        date={trip.date}
        time={trip.time}
        onDateChange={(value) => patch({ date: value })}
        onTimeChange={(value) => patch({ time: value })}
        idPrefix="pool-offer"
      />

      <div className="rounded-2xl border border-hairline bg-surface px-4 py-3">
        <label
          htmlFor="offer-return"
          className="mb-1 block text-micro font-semibold uppercase tracking-wide text-content-muted"
        >
          Return trip (optional)
        </label>
        <input
          id="offer-return"
          type="time"
          value={returnTime}
          onChange={(event) => setReturnTime(event.target.value)}
          className="w-full border-0 bg-transparent p-0 font-semibold text-content"
        />
        <p className="mt-1 text-micro text-content-muted">
          Most daily commuters on this corridor need both legs.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3">
        <div>
          <h2 className="text-sm font-bold text-content">
            {role.offersRide ? 'Seats you are offering' : 'Seats you need'}
          </h2>
          <p className="text-micro text-content-muted">
            {role.offersRide ? `${mode.label} capacity` : 'Including yourself'}
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

      {role.offersRide && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-hairline bg-surface px-4 py-3">
            <label
              htmlFor="offer-vehicle"
              className="mb-1 block text-micro font-semibold uppercase tracking-wide text-content-muted"
            >
              Vehicle
            </label>
            <input
              id="offer-vehicle"
              type="text"
              value={vehicleModel}
              onChange={(event) => setVehicleModel(event.target.value)}
              placeholder={trip.role === 'BIKER' ? 'Honda Activa 6G' : 'Swift Dzire AC'}
              className="w-full border-0 bg-transparent p-0 font-semibold text-content"
            />
          </div>
          <div className="rounded-2xl border border-hairline bg-surface px-4 py-3">
            <label
              htmlFor="offer-number"
              className="mb-1 block text-micro font-semibold uppercase tracking-wide text-content-muted"
            >
              Number plate (optional)
            </label>
            <input
              id="offer-number"
              type="text"
              value={vehicleNumber}
              onChange={(event) => setVehicleNumber(event.target.value.toUpperCase())}
              placeholder="MP-11-ZC-4512"
              className="w-full border-0 bg-transparent p-0 font-semibold uppercase text-content"
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-hairline bg-surface px-4 py-3">
        <label
          htmlFor="offer-share"
          className="mb-1 block text-micro font-semibold uppercase tracking-wide text-content-muted"
        >
          Fuel share per {role.seatNoun.toLowerCase()}
        </label>
        <div className="flex items-baseline gap-1">
          <span className="text-base font-black text-content">₹</span>
          <input
            id="offer-share"
            type="number"
            inputMode="numeric"
            min={0}
            value={shareAmount}
            onChange={(event) => setShareAmount(event.target.value)}
            placeholder={String(suggestedShare)}
            className="w-full border-0 bg-transparent p-0 font-semibold text-content"
          />
        </div>
        <p className="mt-1 text-micro text-content-muted">
          Leave blank to use the suggested ₹{suggestedShare} split for this
          distance. This is a share between commuters, not a fare.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-micro font-bold uppercase tracking-wide text-content-muted">
          You are
        </h2>
        <ChipGroup
          label="Your gender"
          options={GENDER_OPTIONS}
          value={gender}
          onChange={(value) => {
            setGender(value);
            setError(null);
          }}
          accentText={role.text}
          accentBorder={role.border}
          accentSoft={role.soft}
        />
      </div>

      <div className="space-y-2">
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
            <span className="block text-sm font-bold text-content">Female only</span>
            <span className="block text-micro text-content-muted">
              {role.offersRide
                ? 'Only women can join this ride'
                : 'Only female drivers will be shown your request'}
            </span>
          </span>
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

        {role.offersRide && (
          <button
            type="button"
            role="switch"
            aria-checked={liveGps}
            onClick={() => setLiveGps((value) => !value)}
            className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
              liveGps ? 'border-success bg-success/10' : 'border-hairline bg-surface hover:bg-surface-2'
            }`}
          >
            <Navigation
              className={`h-5 w-5 shrink-0 ${liveGps ? 'text-success' : 'text-content-muted'}`}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-content">Share live location</span>
              <span className="block text-micro text-content-muted">
                Co-passengers can track the vehicle during the trip
              </span>
            </span>
            <span
              aria-hidden="true"
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                liveGps ? 'bg-success' : 'bg-surface-3'
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-surface transition-all ${
                  liveGps ? 'left-6' : 'left-1'
                }`}
              />
            </span>
          </button>
        )}
      </div>

      <div className="space-y-3 rounded-2xl border border-hairline bg-surface px-4 py-3">
        <h2 className="text-micro font-bold uppercase tracking-wide text-content-muted">
          How commuters reach you
        </h2>
        <div>
          <label
            htmlFor="offer-name"
            className="mb-1 block text-micro font-semibold text-content-muted"
          >
            Name
          </label>
          <input
            id="offer-name"
            type="text"
            value={name}
            autoComplete="name"
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
            placeholder="Name shown on your post"
            className="w-full rounded-xl px-3"
          />
        </div>
        <div>
          <label
            htmlFor="offer-phone"
            className="mb-1 block text-micro font-semibold text-content-muted"
          >
            Mobile number
          </label>
          <input
            id="offer-phone"
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
        </div>
      </div>

      <div>
        <label
          htmlFor="offer-notes"
          className="mb-1 block text-micro font-bold uppercase tracking-wide text-content-muted"
        >
          Anything else (optional)
        </label>
        <textarea
          id="offer-notes"
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Non-smoker, spare helmet, luggage space, exact pickup lane…"
          className="w-full rounded-2xl px-3 py-2"
        />
      </div>

      {error && (
        <p role="alert" className="text-meta font-semibold text-danger">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={isSubmitting}
        className={`flex min-h-tap w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold text-white transition-colors disabled:opacity-70 ${role.fill}`}
      >
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 motion-safe:animate-spin" aria-hidden="true" />
        ) : (
          <Send className="h-5 w-5" aria-hidden="true" />
        )}
        {role.offersRide ? 'Publish this ride' : 'Publish my request'}
      </button>
    </div>
  );
};
