/**
 * Configuration for the community carpool surface (`/pool`).
 *
 * Deliberately separate from ROUTES_CONFIG in `routes-config.ts`. That file
 * describes the *operated* Ertiga shuttle — company vehicles, fixed departure
 * slots, published fares. Carpooling is peer-to-peer: arbitrary origin and
 * destination pairs along the corridor, and a fuel-share *estimate* rather
 * than a fare we charge. Mixing the two configs would let a change to the
 * shuttle's pricing silently move what we tell a car owner to ask for petrol.
 *
 * NOTE: the Tailwind class maps below are why `./lib/**` is in the `content`
 * globs of tailwind.config.js. Without that glob these strings are invisible
 * to the JIT compiler and every accent in /pool renders unstyled.
 */

import { calculateHaversineDistance } from './ais140-telematics-engine';

/* -------------------------------------------------------------- modes ---- */

export type PoolMode = 'CARPOOL' | 'BIKEPOOL' | 'TAXIPOOL';

export interface PoolModeMeta {
  id: PoolMode;
  label: string;
  /** One line, shown under the label on a match card. */
  blurb: string;
  /** Per-seat estimate = base + perKm × roadKm. */
  base: number;
  perKm: number;
  /** Seats a vehicle of this kind typically shares. */
  capacity: number;
  /** Token-based text colour — already contrast-corrected per theme. */
  text: string;
  /** Low-opacity wash for chips and icon tiles. */
  soft: string;
}

/**
 * Rates are tuned to land near what commuters on this corridor already pay to
 * split: on the 62 km Dhar–Indore run these give ₹279 for a car seat and ₹193
 * for a pillion, against the ₹288 / ₹198 that comparable apps quote. Taxipool
 * is higher because the group is paying a driver, not sharing petrol.
 */
export const POOL_MODES: Record<PoolMode, PoolModeMeta> = {
  CARPOOL: {
    id: 'CARPOOL',
    label: 'Carpool',
    blurb: 'Share a car seat, split the petrol',
    base: 15,
    perKm: 4.25,
    capacity: 3,
    text: 'text-brand',
    soft: 'bg-indigo-500/10',
  },
  BIKEPOOL: {
    id: 'BIKEPOOL',
    label: 'Bikepool',
    blurb: 'Pillion seat on a two-wheeler',
    base: 10,
    perKm: 2.95,
    capacity: 1,
    text: 'text-info',
    soft: 'bg-sky-500/10',
  },
  TAXIPOOL: {
    id: 'TAXIPOOL',
    label: 'Taxipool',
    blurb: 'Group a taxi, split the meter',
    base: 30,
    perKm: 6,
    capacity: 4,
    text: 'text-warning',
    soft: 'bg-amber-500/10',
  },
};

export const POOL_MODE_ORDER: PoolMode[] = ['CARPOOL', 'BIKEPOOL', 'TAXIPOOL'];

/* -------------------------------------------------------------- roles ---- */

export type PoolRole = 'RIDER' | 'BIKER' | 'CAR_OWNER';

export interface PoolRoleMeta {
  id: PoolRole;
  /** Tab label while inactive. */
  label: string;
  /** First-person label once selected — "I'm a Rider". */
  activeLabel: string;
  /** Explains what this role does, in one line. */
  blurb: string;
  /** True when this role supplies the vehicle. */
  offersRide: boolean;
  /** Seat stepper bounds. A rider asks for seats; an owner offers them. */
  minSeats: number;
  maxSeats: number;
  defaultSeats: number;
  /** What this role transacts in. */
  mode: PoolMode;
  /** Noun for the seat stepper label. */
  seatNoun: string;
  text: string;
  soft: string;
  border: string;
  /**
   * Saturated fill for the primary CTA. Every value here clears 4.5:1 against
   * white, and the hover step goes *darker* — a lighter hover is how the old
   * shuttle CTA ended up at 2.26:1.
   */
  fill: string;
  /**
   * Route-line colour for the map, per theme, as raw hex. Leaflet draws the
   * polyline into an SVG overlay it owns, where Tailwind classes and CSS
   * variables cannot reach — so the light/dark pair the accent tokens get for
   * free has to be spelled out here. Same 600/700-in-light, 400-in-dark split.
   */
  mapAccent: { light: string; dark: string };
}

export const POOL_ROLES: Record<PoolRole, PoolRoleMeta> = {
  RIDER: {
    id: 'RIDER',
    label: 'Rider',
    activeLabel: "I'm a Rider",
    blurb: 'Looking for a seat going your way',
    offersRide: false,
    minSeats: 1,
    maxSeats: 3,
    defaultSeats: 1,
    mode: 'CARPOOL',
    seatNoun: 'Seat',
    text: 'text-brand',
    soft: 'bg-indigo-500/10',
    border: 'border-indigo-500',
    fill: 'bg-indigo-600 hover:bg-indigo-700',
    mapAccent: { light: '#4f46e5', dark: '#818cf8' },
  },
  BIKER: {
    id: 'BIKER',
    label: 'Biker',
    activeLabel: "I'm a Biker",
    blurb: 'Offering your pillion seat on the way',
    offersRide: true,
    minSeats: 1,
    maxSeats: 1,
    defaultSeats: 1,
    mode: 'BIKEPOOL',
    seatNoun: 'Pillion',
    text: 'text-info',
    soft: 'bg-sky-500/10',
    border: 'border-sky-500',
    fill: 'bg-sky-700 hover:bg-sky-800',
    mapAccent: { light: '#0369a1', dark: '#38bdf8' },
  },
  CAR_OWNER: {
    id: 'CAR_OWNER',
    label: 'Car Owner',
    activeLabel: "I'm a Car Owner",
    blurb: 'Offering empty seats in your car',
    offersRide: true,
    minSeats: 1,
    maxSeats: 4,
    defaultSeats: 3,
    mode: 'CARPOOL',
    seatNoun: 'Seat',
    text: 'text-success',
    soft: 'bg-emerald-500/10',
    border: 'border-emerald-500',
    fill: 'bg-emerald-700 hover:bg-emerald-800',
    mapAccent: { light: '#047857', dark: '#34d399' },
  },
};

export const POOL_ROLE_ORDER: PoolRole[] = ['RIDER', 'BIKER', 'CAR_OWNER'];

export function isPoolRole(value: string | null | undefined): value is PoolRole {
  return value === 'RIDER' || value === 'BIKER' || value === 'CAR_OWNER';
}

/* ------------------------------------------------------------ purposes --- */

export const RIDE_PURPOSES = [
  'Office',
  'College',
  'Airport',
  'Hospital',
  'Family visit',
  'Other',
] as const;

export type RidePurpose = (typeof RIDE_PURPOSES)[number];

export function isRidePurpose(value: string | null | undefined): value is RidePurpose {
  return RIDE_PURPOSES.includes(value as RidePurpose);
}

/* -------------------------------------------------------------- places --- */

export interface PoolPlace {
  id: string;
  /** Landmark, as a local would say it. */
  name: string;
  city: string;
  lat: number;
  lng: number;
}

/**
 * Pickup and drop landmarks along the Dhar ↔ Indore corridor. Carpooling is
 * doorstep-to-doorstep in practice, so this list exists to make the common
 * case one tap — free text is always allowed.
 */
export const POOL_PLACES: PoolPlace[] = [
  // --- Dhar
  { id: 'dhr-busstand', name: 'Dhar Bus Stand', city: 'Dhar', lat: 22.6009, lng: 75.3025 },
  { id: 'dhr-ahilya', name: 'Ahilya Fort', city: 'Dhar', lat: 22.5989, lng: 75.2996 },
  { id: 'dhr-mohan', name: 'Mohan Talkies Square', city: 'Dhar', lat: 22.5961, lng: 75.3061 },
  { id: 'dhr-lig', name: 'LIG Colony', city: 'Dhar', lat: 22.6055, lng: 75.3122 },
  { id: 'dhr-trimurti', name: 'Trimurti Nagar', city: 'Dhar', lat: 22.6088, lng: 75.3168 },
  { id: 'dhr-rajgarh', name: 'Rajgarh Naka', city: 'Dhar', lat: 22.6041, lng: 75.3210 },
  { id: 'dhr-mandav', name: 'Mandav Road', city: 'Dhar', lat: 22.5872, lng: 75.3044 },

  // --- On the corridor
  { id: 'cor-ghatabillod', name: 'Ghatabillod', city: 'Corridor', lat: 22.6503, lng: 75.5163 },
  { id: 'cor-betma', name: 'Betma', city: 'Corridor', lat: 22.6867, lng: 75.6222 },
  { id: 'cor-pithampur', name: 'Pithampur Sector 1', city: 'Corridor', lat: 22.6019, lng: 75.6903 },
  { id: 'cor-rau', name: 'Rau Circle', city: 'Corridor', lat: 22.6469, lng: 75.8003 },

  // --- Indore
  { id: 'ind-vijaynagar', name: 'Vijay Nagar (IT Park)', city: 'Indore', lat: 22.7533, lng: 75.8937 },
  { id: 'ind-c21', name: 'C21 Business Park', city: 'Indore', lat: 22.7255, lng: 75.8862 },
  { id: 'ind-rajwada', name: 'Rajwada', city: 'Indore', lat: 22.7177, lng: 75.8545 },
  { id: 'ind-palasia', name: 'Palasia Square', city: 'Indore', lat: 22.7244, lng: 75.8839 },
  { id: 'ind-mgroad', name: 'MG Road', city: 'Indore', lat: 22.7196, lng: 75.8663 },
  { id: 'ind-bhawarkua', name: 'Bhawarkua Square', city: 'Indore', lat: 22.6893, lng: 75.8656 },
  { id: 'ind-geeta', name: 'Geeta Bhawan', city: 'Indore', lat: 22.7047, lng: 75.8785 },
  { id: 'ind-sapna', name: 'Sapna Sangeeta', city: 'Indore', lat: 22.7005, lng: 75.8681 },
  { id: 'ind-airport', name: 'Devi Ahilyabai Airport', city: 'Indore', lat: 22.7218, lng: 75.8011 },
  { id: 'ind-railway', name: 'Indore Railway Station', city: 'Indore', lat: 22.7160, lng: 75.8640 },
  { id: 'ind-scheme78', name: 'Scheme 78', city: 'Indore', lat: 22.7472, lng: 75.8896 },
  { id: 'ind-bhicholi', name: 'Bhicholi Mardana', city: 'Indore', lat: 22.6739, lng: 75.9081 },

  // --- Expansion corridors
  { id: 'ujj-mahakal', name: 'Mahakal Lok', city: 'Ujjain', lat: 23.1828, lng: 75.7681 },
  { id: 'ujj-tower', name: 'Tower Chowk', city: 'Ujjain', lat: 23.1793, lng: 75.7849 },
  { id: 'dew-busstand', name: 'Dewas Bus Stand', city: 'Dewas', lat: 22.9676, lng: 76.0534 },
];

/**
 * Ordered west-to-east waypoints for the Dhar → Indore highway. Used to draw a
 * road-shaped polyline instead of a straight line between two pins.
 */
export const CORRIDOR_PATH: Array<[number, number]> = [
  [22.6009, 75.3025], // Dhar
  [22.6089, 75.3556],
  [22.6203, 75.4144],
  [22.6503, 75.5163], // Ghatabillod
  [22.6689, 75.5744],
  [22.6867, 75.6222], // Betma
  [22.6961, 75.6889],
  [22.7078, 75.7511],
  [22.7196, 75.8100],
  [22.7177, 75.8545], // Indore Rajwada
];

/** Fallback distance when neither endpoint resolves to a known landmark. */
export const CORRIDOR_DEFAULT_KM = 62;

/**
 * Straight-line distance understates a real drive, and this corridor is a
 * near-straight state highway so the correction is small.
 *
 * Calibrated against the one distance this project already asserts: the haversine
 * from Dhar Bus Stand to Rajwada is 58.11 km and `ROUTES_CONFIG['DHR-IND']`
 * puts the road distance at 62 km, giving 62 / 58.11 = 1.067. Re-derive it from
 * those two numbers if either changes rather than guessing — an earlier 1.28
 * here (from a mis-remembered haversine) inflated every quote by about 12%.
 */
const ROAD_WINDING_FACTOR = 1.07;

/* ------------------------------------------------------------- helpers --- */

/** Case- and punctuation-insensitive key for matching free text to a place. */
function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Best-effort resolution of a typed location to a known landmark. Returns
 * `null` rather than a bad guess — callers fall back to the corridor default,
 * which is safer than quoting a fare derived from the wrong coordinates.
 */
export function resolvePlace(value: string): PoolPlace | null {
  const query = normalise(value);
  if (!query) return null;

  const exact = POOL_PLACES.find(
    (p) => normalise(p.name) === query || normalise(`${p.name}${p.city}`) === query
  );
  if (exact) return exact;

  const partial = POOL_PLACES.find(
    (p) => normalise(p.name).includes(query) || query.includes(normalise(p.name))
  );
  if (partial) return partial;

  // Nothing landmark-level matched; fall back to the city centroid so a bare
  // "Indore" still puts a pin somewhere sensible.
  return POOL_PLACES.find((p) => query.includes(normalise(p.city))) ?? null;
}

/** Suggestions for the location combobox, ranked name-match before city-match. */
export function searchPlaces(query: string, limit = 6): PoolPlace[] {
  const q = normalise(query);
  if (!q) return POOL_PLACES.slice(0, limit);

  const scored = POOL_PLACES.map((place) => {
    const name = normalise(place.name);
    const city = normalise(place.city);
    let score = -1;
    if (name.startsWith(q)) score = 0;
    else if (name.includes(q)) score = 1;
    else if (city.startsWith(q)) score = 2;
    else if (city.includes(q)) score = 3;
    return { place, score };
  }).filter((entry) => entry.score >= 0);

  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, limit).map((entry) => entry.place);
}

/** Nearest landmark to a device GPS fix, used by the "use my location" button. */
export function nearestPlace(lat: number, lng: number): PoolPlace {
  let best = POOL_PLACES[0];
  let bestKm = Number.POSITIVE_INFINITY;
  for (const place of POOL_PLACES) {
    const km = calculateHaversineDistance(lat, lng, place.lat, place.lng);
    if (km < bestKm) {
      bestKm = km;
      best = place;
    }
  }
  return best;
}

/** Estimated road distance in km between two typed locations. */
export function estimateRoadKm(from: string, to: string): number {
  const a = resolvePlace(from);
  const b = resolvePlace(to);
  if (!a || !b) return CORRIDOR_DEFAULT_KM;

  const straight = calculateHaversineDistance(a.lat, a.lng, b.lat, b.lng);
  if (straight < 0.5) return 0;
  return Math.round(straight * ROAD_WINDING_FACTOR);
}

/** Per-seat fuel-share estimate. Rounded to rupees — nobody splits paise. */
export function estimateFare(mode: PoolMode, roadKm: number): number {
  const { base, perKm } = POOL_MODES[mode];
  if (roadKm <= 0) return 0;
  return Math.round(base + perKm * roadKm);
}

/** Rough door-to-door time. 42 km/h is the realistic corridor average. */
export function estimateMinutes(roadKm: number): number {
  if (roadKm <= 0) return 0;
  return Math.max(5, Math.round((roadKm / 42) * 60));
}

/**
 * The stretch of highway between two endpoints, as a polyline. Corridor
 * waypoints strictly between the two are spliced in so the line follows the
 * road rather than cutting across the countryside.
 */
export function buildRoutePath(
  from: PoolPlace | null,
  to: PoolPlace | null
): Array<[number, number]> {
  if (!from || !to) return CORRIDOR_PATH;

  const west = Math.min(from.lng, to.lng);
  const east = Math.max(from.lng, to.lng);
  const between = CORRIDOR_PATH.filter(([, lng]) => lng > west && lng < east);

  const path: Array<[number, number]> = [
    [from.lat, from.lng],
    ...(from.lng <= to.lng ? between : [...between].reverse()),
    [to.lat, to.lng],
  ];
  return path;
}

/* ---------------------------------------------------------- date/time ---- */

/** `YYYY-MM-DD` for a date `offset` days from today, in local time. */
export function isoDate(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** "Today" / "Tomorrow" / "Sat, 23 Aug" — whichever a commuter would say. */
export function formatDateLabel(iso: string): string {
  if (iso === isoDate(0)) return 'Today';
  if (iso === isoDate(1)) return 'Tomorrow';

  const parsed = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** `HH:MM` (24h, from an `<input type="time">`) → `08:00 AM`. */
export function formatTimeLabel(value: string): string {
  const [rawHour, rawMinute] = value.split(':');
  const hour = Number(rawHour);
  if (!Number.isFinite(hour)) return value;
  const suffix = hour < 12 ? 'AM' : 'PM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${`${display}`.padStart(2, '0')}:${rawMinute ?? '00'} ${suffix}`;
}

/** `08:30 AM` → minutes past midnight, for match sorting. Null if unparseable. */
export function parseClockToMinutes(value: string): number | null {
  const match = value.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const suffix = match[3]?.toUpperCase();
  if (suffix === 'PM' && hour < 12) hour += 12;
  if (suffix === 'AM' && hour === 12) hour = 0;
  return hour * 60 + minute;
}

/* ------------------------------------------------------------- trip ------ */

/** The planner's whole state. Serialised into the URL so a plan is shareable. */
export interface PoolTripDraft {
  role: PoolRole;
  from: string;
  to: string;
  date: string;
  time: string;
  purpose: RidePurpose;
  seats: number;
  femaleOnly: boolean;
}

export function defaultTripDraft(): PoolTripDraft {
  return {
    role: 'RIDER',
    from: '',
    to: '',
    date: isoDate(1),
    time: '08:00',
    purpose: 'Office',
    seats: POOL_ROLES.RIDER.defaultSeats,
    femaleOnly: false,
  };
}

export function tripToSearchParams(trip: PoolTripDraft): URLSearchParams {
  const params = new URLSearchParams({
    role: trip.role,
    from: trip.from,
    to: trip.to,
    date: trip.date,
    time: trip.time,
    purpose: trip.purpose,
    seats: String(trip.seats),
  });
  if (trip.femaleOnly) params.set('femaleOnly', '1');
  return params;
}

/**
 * Structural type rather than `URLSearchParams`: Next's `useSearchParams()`
 * returns a `ReadonlyURLSearchParams`, which is not assignable to the mutable
 * class even though `get` behaves identically.
 */
export interface ReadonlyParams {
  get(name: string): string | null;
}

export function tripFromSearchParams(params: ReadonlyParams | null): PoolTripDraft {
  const base = defaultTripDraft();
  if (!params) return base;

  const role = params.get('role');
  const purpose = params.get('purpose');
  const seats = Number(params.get('seats'));
  const resolvedRole = isPoolRole(role) ? role : base.role;

  return {
    role: resolvedRole,
    from: params.get('from') ?? base.from,
    to: params.get('to') ?? base.to,
    date: params.get('date') ?? base.date,
    time: params.get('time') ?? base.time,
    purpose: isRidePurpose(purpose) ? purpose : base.purpose,
    seats: clampSeats(
      Number.isFinite(seats) && seats > 0 ? seats : POOL_ROLES[resolvedRole].defaultSeats,
      resolvedRole
    ),
    femaleOnly: params.get('femaleOnly') === '1',
  };
}

export function clampSeats(seats: number, role: PoolRole): number {
  const { minSeats, maxSeats } = POOL_ROLES[role];
  return Math.min(maxSeats, Math.max(minSeats, Math.round(seats)));
}
