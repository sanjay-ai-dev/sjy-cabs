'use client';

/**
 * Local identity and ride history for the /pool carpool surface.
 *
 * There is no auth in this app yet, but `/api/carpool` needs a name and phone
 * on every booking. Rather than ask for both in every dialog, we collect them
 * once and keep them in localStorage — so a returning commuter books a seat in
 * one tap. Nothing here is a security boundary: it is a convenience cache the
 * user can clear from the profile screen, and the API still validates its own
 * input.
 */

import { useCallback, useEffect, useState } from 'react';
import type { PoolMode, PoolRole } from './pool-config';

const PROFILE_KEY = 'sjy_pool_profile';
const RIDES_KEY = 'sjy_pool_rides';

/** Fired on the window so every mounted hook re-reads after a write. */
const SYNC_EVENT = 'sjy-pool-storage';

export interface PoolProfile {
  name: string;
  phone: string;
  gender: 'female' | 'male' | 'unspecified';
  /** Only show, and only join, rides flagged female-only. */
  femaleOnlyPreference: boolean;
  /** Share live GPS with co-passengers for the duration of a trip. */
  shareLiveLocation: boolean;
}

export const EMPTY_PROFILE: PoolProfile = {
  name: '',
  phone: '',
  gender: 'unspecified',
  femaleOnlyPreference: false,
  shareLiveLocation: true,
};

/** A 10-digit Indian mobile number, the only format the corridor uses. */
export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));
}

export function isProfileComplete(profile: PoolProfile): boolean {
  return profile.name.trim().length >= 2 && isValidPhone(profile.phone);
}

export type PoolRideKind = 'BOOKED' | 'OFFERED';

export interface PoolMyRide {
  /** Local record id. */
  id: string;
  kind: PoolRideKind;
  /** The `/api/carpool` post this refers to. */
  postId: string;
  /** Booking id from the API — needed to cancel a seat. */
  bookingId?: string;
  role: PoolRole;
  mode: PoolMode;
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  farePerSeat: number;
  /** Set when the seat went to the waitlist instead of being confirmed. */
  waitlistNumber?: number;
  counterpartName: string;
  counterpartPhone: string;
  createdAt: string;
}

/* ------------------------------------------------------------ internals -- */

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as object) } as T;
  } catch {
    // Corrupt or quota-blocked storage should degrade to defaults, never throw
    // into a render.
    return fallback;
  }
}

function readArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(SYNC_EVENT));
  } catch {
    // Private-mode Safari throws on every write. Losing the cache is
    // acceptable; breaking the booking flow is not.
  }
}

/**
 * Re-runs `read` on mount, on cross-tab `storage`, and on same-tab writes.
 *
 * State starts at `initial`, never at `read()`: reading localStorage during the
 * first client render would produce different HTML than the server emitted and
 * trip a hydration mismatch. The effect below picks up the stored value one
 * paint later.
 */
function useStoredValue<T>(read: () => T, initial: T): [T, () => void] {
  const [value, setValue] = useState<T>(initial);
  const refresh = useCallback(() => setValue(read()), [read]);

  useEffect(() => {
    refresh();
    window.addEventListener(SYNC_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(SYNC_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  return [value, refresh];
}

/* ---------------------------------------------------------------- hooks -- */

export function usePoolProfile() {
  const read = useCallback(() => readJson<PoolProfile>(PROFILE_KEY, EMPTY_PROFILE), []);
  const [profile] = useStoredValue(read, EMPTY_PROFILE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => setIsHydrated(true), []);

  const saveProfile = useCallback((next: Partial<PoolProfile>) => {
    write(PROFILE_KEY, { ...readJson<PoolProfile>(PROFILE_KEY, EMPTY_PROFILE), ...next });
  }, []);

  const clearProfile = useCallback(() => {
    write(PROFILE_KEY, EMPTY_PROFILE);
  }, []);

  return {
    profile,
    saveProfile,
    clearProfile,
    /** False until the effect has read localStorage — gate CTAs on this. */
    isHydrated,
    isComplete: isProfileComplete(profile),
  };
}

const NO_RIDES: PoolMyRide[] = [];

export function usePoolRides() {
  const read = useCallback(() => readArray<PoolMyRide>(RIDES_KEY), []);
  const [rides] = useStoredValue(read, NO_RIDES);

  const addRide = useCallback((ride: Omit<PoolMyRide, 'id' | 'createdAt'>) => {
    const record: PoolMyRide = {
      ...ride,
      id: `ride-${Date.now()}-${Math.round(Math.random() * 1e4)}`,
      createdAt: new Date().toISOString(),
    };
    write(RIDES_KEY, [record, ...readArray<PoolMyRide>(RIDES_KEY)]);
    return record;
  }, []);

  const removeRide = useCallback((id: string) => {
    write(
      RIDES_KEY,
      readArray<PoolMyRide>(RIDES_KEY).filter((r) => r.id !== id)
    );
  }, []);

  return { rides, addRide, removeRide };
}
