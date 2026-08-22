/**
 * Ranks community carpool posts against a commuter's plan.
 *
 * This is intentionally geometric rather than exact-string: on this corridor
 * "Dhar Bus Stand", "Ahilya Fort" and "Mohan Talkies Square" are a five-minute
 * walk apart, so an exact-match search would report "no rides found" while three
 * usable ones sat in the feed. We resolve both ends to coordinates and accept a
 * post whose endpoints are within walking-or-short-auto range of the plan.
 */

import { calculateHaversineDistance } from './ais140-telematics-engine';
import type { CarpoolPost, PoolVehicleType } from './carpool-store';
import {
  POOL_MODES,
  estimateFare,
  estimateRoadKm,
  parseClockToMinutes,
  resolvePlace,
  type PoolMode,
  type PoolTripDraft,
} from './pool-config';

const MODE_BY_VEHICLE: Record<PoolVehicleType, PoolMode> = {
  CAR: 'CARPOOL',
  BIKE: 'BIKEPOOL',
  TAXI: 'TAXIPOOL',
};

/** Posts predating the `vehicleType` field are all cars. */
export function modeForPost(post: CarpoolPost): PoolMode {
  return MODE_BY_VEHICLE[post.vehicleType ?? 'CAR'];
}

/**
 * How far either endpoint may sit from the plan's. 22 km is wide enough to
 * cover "anywhere in Dhar town" or "anywhere in central Indore" while still
 * being far short of the 64 km corridor, so a match can never be a ride going
 * the other way.
 */
const MAX_DEVIATION_KM = 22;

/** Two and a half hours. Beyond that it is a different commute, not a match. */
const MAX_TIME_DELTA_MINS = 150;

export interface PoolMatch {
  post: CarpoolPost;
  mode: PoolMode;
  /** Combined straight-line deviation of both endpoints, in km. */
  deviationKm: number;
  /** Minutes between the plan's departure and the post's. Null if unparseable. */
  timeDeltaMins: number | null;
  /** What a seat costs — the poster's own figure where they gave one. */
  farePerSeat: number;
  /** True when the poster quoted this, false when we estimated it. */
  fareIsQuoted: boolean;
  /** Lower is better. */
  score: number;
}

/** What the viewer is looking for. */
export type MatchIntent = 'RIDES' | 'RIDERS';

/**
 * Who is searching. Both fields are optional because the profile is a local
 * convenience with no signup step — a first-time visitor has neither, and gets
 * the unfiltered list rather than an error.
 */
export interface MatchViewer {
  /** Used to keep the viewer's own posts out of their own results. */
  phone?: string;
  /** Gates female-only rides. `unspecified` sees them, badged. */
  gender?: 'female' | 'male' | 'unspecified';
}

function deviationKm(planned: string, posted: string): number | null {
  const a = resolvePlace(planned);
  const b = resolvePlace(posted);
  if (!a || !b) return null;
  return calculateHaversineDistance(a.lat, a.lng, b.lat, b.lng);
}

/**
 * Pulls a rupee figure out of free text like "₹150 / seat (Fuel Split)".
 * Returns null for "Split Fuel" or "Free", where there is no number to trust.
 */
export function parseQuotedFare(fuelShare: string | undefined): number | null {
  if (!fuelShare) return null;
  const match = fuelShare.match(/₹\s*(\d[\d,]*)/);
  if (!match) return null;
  const value = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** Seats a joiner could still take without going on the waitlist. */
export function openSeats(post: CarpoolPost): number {
  return Math.max(0, post.availableSeats);
}

export function buildMatches(
  posts: CarpoolPost[],
  trip: PoolTripDraft,
  intent: MatchIntent,
  viewer: MatchViewer = {}
): PoolMatch[] {
  const plannedMinutes = parseClockToMinutes(trip.time);
  const ownPhone = viewer.phone?.replace(/\D/g, '') || null;

  const wanted: Array<CarpoolPost['type']> =
    intent === 'RIDES' ? ['OFFER', 'CAB_POOL'] : ['SEEK'];

  const matches: PoolMatch[] = [];

  for (const post of posts) {
    if (!wanted.includes(post.type)) continue;
    if (trip.femaleOnly && !post.isFemaleOnly) continue;
    if (ownPhone && post.phone.replace(/\D/g, '') === ownPhone) continue;

    // Never surface a female-only ride to a viewer who has told us they are
    // male. Listing one is worse than useless: it is a seat they cannot take,
    // and if it is the cheapest it also poisons the "from ₹X" headline with a
    // price nobody can actually get.
    if (post.isFemaleOnly && viewer.gender === 'male') continue;

    const originDev = deviationKm(trip.from, post.routeFrom);
    const destDev = deviationKm(trip.to, post.routeTo);

    // An endpoint we could not geocode is not evidence of a mismatch, so treat
    // it as neutral rather than dropping an otherwise plausible ride.
    if (originDev !== null && originDev > MAX_DEVIATION_KM) continue;
    if (destDev !== null && destDev > MAX_DEVIATION_KM) continue;

    const postedMinutes = parseClockToMinutes(post.departureTime);
    const timeDeltaMins =
      plannedMinutes !== null && postedMinutes !== null
        ? Math.abs(plannedMinutes - postedMinutes)
        : null;
    if (timeDeltaMins !== null && timeDeltaMins > MAX_TIME_DELTA_MINS) continue;

    const mode = modeForPost(post);
    const quoted = parseQuotedFare(post.fuelShare);
    const roadKm = estimateRoadKm(post.routeFrom, post.routeTo);

    const deviation = (originDev ?? 0) + (destDev ?? 0);

    matches.push({
      post,
      mode,
      deviationKm: Math.round(deviation * 10) / 10,
      timeDeltaMins,
      farePerSeat: quoted ?? estimateFare(mode, roadKm),
      fareIsQuoted: quoted !== null,
      // Closeness of pickup dominates; a 10-minute time gap is worth about the
      // same as one kilometre of extra walking.
      score:
        deviation +
        (timeDeltaMins ?? MAX_TIME_DELTA_MINS / 2) / 10 +
        // Rides with a free seat outrank ones that would put you on a waitlist.
        (openSeats(post) > 0 ? 0 : 8),
    });
  }

  return matches.sort((a, b) => a.score - b.score);
}

export function groupMatchesByMode(matches: PoolMatch[]): Record<PoolMode, PoolMatch[]> {
  const grouped: Record<PoolMode, PoolMatch[]> = {
    CARPOOL: [],
    BIKEPOOL: [],
    TAXIPOOL: [],
  };
  for (const match of matches) grouped[match.mode].push(match);
  return grouped;
}

/** Headline estimate for a mode when nothing in the feed matched yet. */
export function modeEstimate(mode: PoolMode, trip: PoolTripDraft): number {
  return estimateFare(mode, estimateRoadKm(trip.from, trip.to));
}

/**
 * The lowest per-seat price in a group — what a "from ₹X" label promises.
 * Deliberately not `group[0].farePerSeat`: the list is sorted by match quality,
 * so the closest ride is often not the cheapest one.
 */
export function cheapestFare(matches: PoolMatch[]): number | null {
  if (matches.length === 0) return null;
  return matches.reduce((low, m) => Math.min(low, m.farePerSeat), Infinity);
}

export function modeLabel(mode: PoolMode): string {
  return POOL_MODES[mode].label;
}
