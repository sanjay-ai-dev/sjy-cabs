# DailyCab / SJY Mobility — Project Knowledge Base

> Handoff document for anyone (human or AI agent) picking up this codebase.
> Last updated: 2026-08-20

---

## 1. What this is

An intercity **6-seat Maruti Ertiga shuttle network** for the Malwa region of
Madhya Pradesh (Indore ↔ Dhar, expanding to Ujjain and Dewas).

Two revenue lines:

| Line | Model |
|---|---|
| Commuter passes | ₹9,999 for 50 rides (₹200/ride vs ₹350 single) |
| B2B express cargo | ₹200 per 1×1 ft slot in the rear bay, Aadhaar-KYC gated |

There is also a **non-revenue community carpooling surface** at `/pool`, where
commuters share their own cars and bikes rather than book ours. It is a distinct
product with its own app shell — see **§9**.

Differentiators baked into the product: fixed **doorstep** pickup/drop (not
bus stops), 6 fixed daily departures, **Row 1 Seat 1A reserved for female
passengers**, and AIS-140 GPS telematics with an SOS panic path.

### ⚠️ Brand naming is currently split

The logo component and `<title>` say **"DailyCab"**. Company/legal references
in the investor deck and footer say **"SJY Mobility Engine"**. Product-facing
copy has been normalised to *DailyCab*; corporate references were left as
*SJY Mobility* on the assumption that product-brand vs legal-entity is
intentional. **Confirm this with the owner** — if it's not intentional it's a
find-and-replace either way. Repo folder is `Sjy Cabs`, npm package is
`sjy-mobility`.

---

## 2. Stack

### Frontend (this is what deploys to production)
- **Next.js 14.2.15** App Router, React 18, TypeScript 5.6
- **Tailwind CSS 3.4** with a custom semantic token layer (see §4 — read this before touching any styling)
- **Leaflet 1.9** for live maps (CARTO basemap tiles, theme-swapped)
- **Chart.js 4 / react-chartjs-2** (declared; analytics surfaces)
- **@supabase/supabase-js** + `@supabase/ssr` (client scaffolded, largely placeholder)
- Font: **Plus Jakarta Sans** via `next/font/google`

### Backend (Python — **not** currently deployed anywhere I can verify)
- FastAPI + `uvicorn`, PostgreSQL + **PostGIS**, Redis, OSRM, Ollama (`llama3.1:8b`)
- Four phase packages: `phase1_ingestion`, `phase2_dispatch`, `phase3_optimization`, `phase4_tracking`
- Orchestrated by `docker-compose.yml`; `Dockerfile` builds the Python app

> **Important:** the Vercel deployment only ships the Next.js app. The Python
> stack has Docker config but no verified hosting target. Treat "where does the
> backend run in production" as an **open question**.

---

## 3. Directory map

```
app/                          Next.js App Router
├── layout.tsx                Root layout — theme init script, providers
├── globals.css               ★ Theme tokens + component primitives
├── page.tsx                  Marketing landing page
├── user/page.tsx             Passenger portal (largest file, ~700 lines)
├── driver/page.tsx           Driver cockpit
├── admin/page.tsx            Fleet admin dashboard
├── investor/page.tsx         Pitch deck + interactive DPR calculator
├── simulator/page.tsx        AIS-140 telematics simulator
├── track/[bookingCode]/      Public shareable trip tracking
├── community/page.tsx        Carpool community landing + full feed
├── card/, qr/                Printable visiting card and QR poster
├── admin/survey/page.tsx     Survey response dashboard
├── pool/                     ★ Community carpool app (see §9)
│   ├── layout.tsx            Own shell: header + 4-item bottom nav
│   ├── page.tsx              Trip planner (map, role, route, when, seats)
│   ├── matches/page.tsx      Carpool / Bikepool / Taxipool results
│   ├── offer/page.tsx        Publish an offer, or a ride request
│   ├── rides/page.tsx        My rides (booked + published)
│   └── profile/page.tsx      Local identity + safety preferences
└── api/
    ├── telematics/route.ts   ⚠️ In-memory telemetry store (see §7)
    ├── carpool/route.ts      ⚠️ In-memory carpool feed (see §7)
    └── survey/route.ts       Survey submissions

components/pool/              ★ Everything the /pool surface renders
├── pool-shell.tsx            Header + bottom nav
├── planner-view.tsx          The plan screen
├── matches-view.tsx          The results screen
├── offer-view.tsx            The publish form (role-shaped)
├── rides-view.tsx, profile-view.tsx
├── pool-map.tsx              Read-only corridor map (theme-reactive)
├── role-switcher.tsx         Rider / Biker / Car Owner radiogroup
├── route-card.tsx            Pickup + drop, swap, GPS, presets
├── location-combobox.tsx     Landmark autosuggest (free text allowed)
├── when-fields.tsx, seat-stepper.tsx, chip-group.tsx
├── match-card.tsx, join-ride-dialog.tsx
└── pool-skeleton.tsx         Suspense fallback

components/
├── theme-provider.tsx        ★ Theme context + pre-paint init script
├── theme-toggle.tsx          Accessible light/dark switch
├── modal.tsx                 ★ Accessible dialog primitive
├── toast-provider.tsx        ★ In-app toasts (replaced native alert())
├── guided-booking-wizard.tsx 4-step booking flow
├── uber-location-picker.tsx  Pickup/drop with GPS + autosuggest
├── ertiga-seat-map.tsx       6-seat RHD chassis map + allocation rules
├── monthly-pass-dashboard.tsx
├── uber-ride-animation.tsx   Live driver-approach view
├── live-map.tsx              Leaflet wrapper (theme-reactive)
├── app-loader.tsx            Cold-start splash (once per session)
├── animated-hero.tsx         Hero banner (text-on-photo — see §4.4)
├── corridor-expansion-radar.tsx
├── whatsapp-modal.tsx        Booking confirmation
├── mobile-gps-tracker.tsx    Device GPS → BroadcastChannel + API
└── logo.tsx                  `DailyCabLogo`, aliased as `SjyCabsLogo`

lib/
├── routes-config.ts          ROUTES_CONFIG, DAILY_SCHEDULE_SLOTS (shuttle only)
├── ais140-telematics-engine.ts  NMEA parsing, haversine, ETA, TSP routing
├── carpool-store.ts          Community feed model + seed posts
├── pool-config.ts            ★ /pool roles, modes, places, fare model
├── pool-matching.ts          Geometric ride matching + ranking
├── pool-profile.ts           localStorage identity and ride history hooks
└── supabase/                 client.ts, types.ts

phase1_ingestion/    AIS-140 TCP server, NMEA parser, Redis geo
phase2_dispatch/     FastAPI app, booking engine, WhatsApp client
phase3_optimization/ Route optimiser, OSRM client, parcel manifest
phase4_tracking/     SSE server, tracker HTML
scripts/             Simulators + start_server.py
supabase/migrations/ 20260810_init_schema.sql
dashboards/          Legacy static HTML prototypes (superseded by app/)
```

`★` = read before making styling or UI-primitive changes.

---

## 4. Design token system — **read this first**

The app was migrated (2026-08-11) from hardcoded dark-only Tailwind classes to
a semantic token system. **Do not reintroduce raw colour utilities.**

### 4.1 Why it exists — four bugs that made light mode unusable

Documented so nobody recreates them:

1. **`tailwind.config.js` had no `darkMode` key** → defaulted to `media`. All
   40 `dark:` classes followed the *OS* setting and ignored the app toggle
   entirely. Now: `darkMode: ['class', '[data-theme="dark"]']`.
2. **Every light-mode override in `globals.css` was dead CSS.** Selectors were
   written `[data-theme='light'] \.bg-black\/20`. That leading `\.` makes it a
   *type* selector matching a tag literally named `.bg-black/20` — matches
   nothing, ever. ~30 rules silently did nothing.
3. **`<body className="bg-slate-50 text-slate-900">`** beat the CSS-variable
   rule on specificity, pinning the background light in *both* themes.
4. **`data-theme="light"` hardcoded server-side**, corrected only after
   hydration → dark-mode users got a flash of light.

### 4.2 The tokens

Defined as space-separated RGB channels in `app/globals.css` (so Tailwind's
`/opacity` modifiers keep working), exposed via `tailwind.config.js`.

| Token | Utility | Light | Dark |
|---|---|---|---|
| `--canvas` | `bg-canvas` | slate-50 | `#07080d` |
| `--surface` | `bg-surface` | white | `#121420` |
| `--surface-2` | `bg-surface-2` | slate-100 | `#0d0f18` |
| `--surface-3` | `bg-surface-3` | slate-200 | `#1f2436` |
| `--hairline` | `border-hairline` | slate-300 | `#2d344a` |
| `--content` | `text-content` | slate-900 | slate-50 |
| `--content-secondary` | `text-content-secondary` | slate-700 | slate-300 |
| `--content-muted` | `text-content-muted` | slate-600 | slate-400 |
| `--scrim` | `bg-scrim` | slate-900 | near-black |

**Accents are contrast-corrected per theme.** In light they resolve to the
600/700 steps; in dark to the 300/400 steps. The old code used `-300`/`-400`
everywhere, which sits at ~2:1 on white and was unreadable.

| Utility | Light | Dark |
|---|---|---|
| `text-brand` | indigo-700 | indigo-400 |
| `text-success` | emerald-700 | emerald-400 |
| `text-info` | sky-700 | cyan-400 |
| `text-warning` | amber-700 | amber-400 |
| `text-danger` | rose-700 | rose-300 |
| `text-accent` | violet-700 | violet-300 |
| `text-female` | pink-700 | pink-400 |

### 4.3 Custom utilities

| Class | Purpose |
|---|---|
| `text-micro` (11px) / `text-meta` (12px) | Type floor. **11px is the minimum** — the old code used 8/9/10px in 109 places |
| `min-h-tap` / `min-w-tap` | 44px minimum touch target |
| `inset-b-safe` / `pb-safe` | iOS home-indicator safe-area insets |
| `on-media` | Text sitting on a photo/video — stays light-on-dark in **both** themes |
| `animate-fadeIn` | Was used 33× but never defined until now |
| `scrollbar-none` / `scrollbar-thin` | Was used 5× but never defined |
| `.glass-card`, `.btn-primary` | Component primitives, in `@layer components` |

### 4.4 Rules to follow

1. **Never** use `bg-black/N`, `bg-white/N`, `border-white/N`, `bg-[#0…]`, or
   `text-slate-N` for themed chrome. Use tokens.
2. **`text-white` is only correct on a saturated fill** (a colour-600/700
   button or gradient). On a themed surface use `text-content`.
3. **Text over photos or video uses `.on-media`**, not tokens — tokenising it
   puts dark text on a dark photo in light mode. `animated-hero.tsx` is the
   reference implementation.
4. **Text over a saturated banner** (e.g. the admin SOS bar) stays explicitly
   light — `text-white`, `text-rose-50`. Same reasoning as #3.
5. **Every gradient stop under white text must clear 4.5:1 on its own.** A CTA
   is unreadable at whichever end is too light. Hover stops go *darker*, never
   lighter — the original "Continue" CTA dropped to **2.26:1 on hover**.
6. **Component primitives live in `@layer components`** so utilities can
   override them. Declared as plain top-level CSS they come *after* the
   utilities layer and silently flatten every `border-2 border-<accent>` in the
   app back to a 1px hairline. This actually happened.
7. Decorative dark-only washes get a light counterpart:
   `bg-emerald-500/10 dark:bg-emerald-950/30`.

### 4.5 How theming works at runtime

- `THEME_INIT_SCRIPT` (in `components/theme-provider.tsx`) is injected into
  `<head>` and runs **synchronously before first paint**, stamping
  `data-theme` on `<html>` from `localStorage` or `prefers-color-scheme`.
  This is what prevents the flash. All Next.js framework chunks in `<head>`
  are `async`, so they don't delay it.
- `<html>` carries `suppressHydrationWarning` because the script mutates the
  attribute the server rendered.
- `ThemeProvider` owns the single source of truth, syncs across tabs via the
  `storage` event, tracks OS changes while the preference is `system`, and
  dispatches a `sjy-theme-change` window event.
- `live-map.tsx` listens for `sjy-theme-change` to swap Leaflet basemap tiles.
  Non-React consumers should do the same.
- Storage key: `sjy_cabs_theme` (`light` | `dark`; absent = follow system).

### 4.6 Verification

Both themes were verified across all 6 pages and every tab:
**0 WCAG AA contrast failures, 0 undersized touch targets** (the only
sub-44px element is the Leaflet map pin, which isn't an actionable control).

Re-run after styling changes — a DOM-walking contrast auditor that composites
backgrounds up the tree is the approach used. Note the blind spot: skipping
gradient subtrees hides failures on saturated banners, so **check those by
eye**. That blind spot is exactly how the unreadable SOS banner got missed.

---

## 5. Deployment — how this goes live

### 5.1 Platform

Production is **Vercel**, project name **`sjy-cabs`**. The repo is already
linked (a `.vercel/` folder exists locally).

> `.vercel/` is gitignored and Vercel's own README says not to share it, so the
> project/org IDs are deliberately **not** reproduced here. New machines should
> run `vercel link` and pick the `sjy-cabs` project.

There is **no `vercel.json`** — build settings come from Vercel defaults plus
whatever is set in the dashboard. Next.js is auto-detected.

### 5.2 Deploy commands

```bash
npm i -g vercel        # once
vercel login           # opens browser; stores auth in ~/.vercel
vercel link            # once per machine — select the sjy-cabs project
```

```bash
vercel                 # preview deployment (unique URL)
```

```bash
vercel --prod          # promote to production
```

Always build locally before promoting:

```bash
npm run build
```

### 5.3 ⚠️ Secrets and tokens — handling policy

**No real credentials exist in this repo, and none belong here.** `.env.example`
contains placeholders only. Keep it that way:

- **Never** commit a real `.env`. Add `.env*` (except `.env.example`) to
  `.gitignore` — note the current `.gitignore` contains only `.vercel`, so
  this is a **gap worth closing**.
- **Never** paste secret values into this file, a PR, or a chat.
- Values live in exactly two places: **Vercel → Project → Settings →
  Environment Variables** for production, and a local untracked `.env` for
  development.

**Vercel auth token** — for CI or non-interactive deploys, create one at
*Vercel → Account Settings → Tokens*, store it as a CI secret named
`VERCEL_TOKEN`, and use `vercel --prod --token=$VERCEL_TOKEN`. Do not put it
in any file in this repo.

### 5.4 Environment variables

**Consumed by the Next.js app (must be set in Vercel):**

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public. Falls back to a hardcoded placeholder in `lib/supabase/client.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key. **Currently falls back to a dummy JWT** — see §7 |

`NEXT_PUBLIC_*` is exposed to the browser by design. Never put a service-role
key or any server secret behind that prefix.

**Consumed by the Python backend (`.env`, not Vercel):**

| Group | Variables |
|---|---|
| Postgres | `DATABASE_URL`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` |
| Redis | `REDIS_HOST`, `REDIS_PORT`, `REDIS_DB` |
| GPS TCP | `TCP_HOST`, `TCP_PORT` (9000) |
| OSRM | `OSRM_BASE_URL` |
| Ollama | `OLLAMA_BASE_URL`, `OLLAMA_MODEL` |
| WhatsApp | `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_API_TOKEN`, `WHATSAPP_BSP` (`wati`\|`aisensy`\|`meta`) |
| API | `API_HOST`, `API_PORT`, `API_BASE_URL`, `TRACKING_BASE_URL` |
| Security | `SECRET_KEY` (random 64-char hex), `CORS_ORIGINS` |

Intended production domains per `.env.example`: `sjy.co.in`,
`admin.sjy.co.in`, `t.sjy.co.in`, `api.sjy.co.in`.

### 5.5 ⚠️ Not under version control

**This directory is not a git repository.** There is no history, no branches,
no remote. Everything above about Vercel assumes CLI deploys from this folder.

Before further team work, initialise git and push to a remote — Vercel's
git integration then gives preview deploys per branch and automatic production
deploys on merge, which is far safer than CLI-only deploys. Add a proper
`.gitignore` (`node_modules`, `.next`, `.env*`, `.venv`, `.vercel`, `.DS_Store`)
in the same commit.

---

## 6. Local development

```bash
npm install
npm run dev
```

Dev server runs on **port 3005** (`next dev -p 3005`).

Python backend:

```bash
cp .env.example .env    # then fill in real values
docker compose up
```

Simulators in `scripts/`: `simulate_gps.py`, `simulate_whatsapp.py`,
`ais140_tcp_server.js`, `test_ais140_live_telematics.py`.

### Gotchas

- **`next build` overwrites `.next` and breaks a running `next dev`.** Symptom
  is 404s on `main-app.js` / `app-pages-internals.js` and React never
  hydrating. Fix: stop the dev server, `rm -rf .next`, restart.
- `.claude/launch.json` configures the in-editor browser preview.
- Cross-tab/cross-portal sync uses `BroadcastChannel('sjy_cabs_telematics')`
  plus `localStorage` — open `/simulator` and `/admin` side by side to see it.

---

## 7. Known issues and open questions

**Blocking for production**

1. **`app/api/telematics/route.ts` holds telemetry in a module-level object.**
   On Vercel's serverless runtime this does not persist across invocations and
   is not shared between instances. It works in a single dev process and will
   behave unpredictably in production. Needs Redis, a DB, or a real-time
   service.

   **`lib/carpool-store.ts` has exactly the same problem** and is worse in
   consequence: it backs `/api/carpool`, so on Vercel a commuter can publish a
   ride and have it vanish, or take a seat that another instance still shows as
   open. This is the one thing that must be moved to Supabase before `/pool`
   (§9) or `/community` is put in front of real users. The schema is already
   most of the way there in `CarpoolPost` / `CarpoolBooking`, and the seat and
   waitlist logic in `bookSeat` / `cancelBooking` needs to become a transaction
   rather than in-process mutation.
2. **`lib/supabase/client.ts` falls back to a hardcoded placeholder URL and a
   dummy anon JWT** when env vars are absent. It will silently "work" while
   talking to nothing. Make the env vars required and fail loudly.
3. **No git repository** (§5.5).
4. **`.gitignore` covers only `.vercel`** — `.env`, `node_modules`, `.next`,
   `.venv` are all currently untracked-by-luck, not by rule.

**Product / content**

5. Brand naming split (§1).
6. All portal data is **hardcoded demo data** — bookings, drivers, trips,
   earnings. Nothing persists.
7. `dashboards/*.html` are legacy prototypes superseded by `app/`. Confirm
   before deleting.

**Cleanup (a background task was opened for this)**

8. `app/user/page.tsx`: `showSeatMapModal` is never set `true`, so that dialog
   is unreachable. `handleConfirmBooking`, `handleSwapCities` and
   `originalTotalFare` are defined but never referenced.

**Verify before shipping**

9. The Python backend's production hosting target is unknown (§2).
10. `NEXT_PUBLIC_SUPABASE_*` must be set in Vercel or the app ships with the
    placeholder fallback.

---

## 8. Conventions

- **TypeScript strict**; `npx tsc --noEmit` must pass.
- Path alias `@/*` → project root.
- Client components need `'use client'` — most portals are client-side because
  of the live-telemetry state.
- **Accessibility is not optional here.** The codebase previously had zero
  focus styles, no `aria-current` on navs, unlabelled inputs, and modals with
  no `role`, Escape handling, or focus trap. Keep: `aria-label` on icon-only
  buttons, `aria-current` on nav items, `htmlFor`/`id` on every input,
  `role="alert"` on urgent banners, and `Modal` for all dialogs.
- **Motion:** wrap decorative animation in `motion-safe:`. `globals.css`
  honours `prefers-reduced-motion`. Do not put infinite animation on critical
  or safety UI — a bouncing SOS bar is harder to read and harder to hit.
- **Bottom navs max out at 5 items** (Uber/Ola/Rapido/Grab convention).
  Profile lives in the header avatar.
- **No native `alert()`.** Use `useToast()` from `components/toast-provider`.

### Pre-ship checklist

```bash
npx tsc --noEmit    # types
npm run build       # production build
```

Then: both themes, mobile (375px) and desktop, keyboard-only pass through the
booking flow, and an eyeball check of any saturated banner (§4.6).

---

## 9. Community carpool platform (`/pool`)

A separate product from the shuttle, sharing only the design tokens, the toast
and modal primitives, and `/api/carpool`. **The shuttle product — `/`, `/user`,
`/driver`, `/admin`, and the Python `phase2_dispatch` package — is untouched by
it.** Where the shuttle sells a seat on a company Ertiga at a published fare,
`/pool` helps two commuters split petrol. Keeping the two apart is deliberate:
they have different economics, different liability, and different copy.

### 9.1 Screens and the flow between them

```
/pool          plan a trip   ──►  /pool/matches   see who is going your way
   │                                    │
   └──────► /pool/offer  ◄──────────────┘   publish seats, or a request
                 │
                 └──► /pool/rides            what you booked and published
```

The planner's whole state is serialised into the query string
(`tripToSearchParams` / `tripFromSearchParams` in `lib/pool-config.ts`). That is
what makes "Edit" on the results screen return a filled-in form, and makes a
plan shareable as a link. Every screen that reads it is a client component
behind a `<Suspense>` boundary — `useSearchParams()` otherwise opts the route
out of static rendering.

### 9.2 Roles drive everything

`POOL_ROLES` in `lib/pool-config.ts` is the single source of truth. A role
carries its own accent classes, seat bounds, pooling mode, and CTA copy, so
there is exactly one place to change when a role's behaviour changes.

| Role | Publishes | Mode | Accent |
|---|---|---|---|
| Rider | a `SEEK` request | Carpool | indigo |
| Biker | an `OFFER`, `vehicleType: BIKE` | Bikepool | sky |
| Car Owner | an `OFFER`, `vehicleType: CAR` | Carpool | emerald |

`vehicleType` is a **new optional field** on `CarpoolPost`. It is optional
because it postdates the original community feed; anything without it is treated
as `CAR`, which is what every pre-existing post was. Read it as
`post.vehicleType ?? 'CAR'`, never bare.

### 9.3 Fares are estimates, and the arithmetic is calibrated

Nothing here is a fare we collect, and the UI says so in as many words. Per-seat
figures come from `estimateFare(mode, km)` = `base + perKm × roadKm`.

Road distance is `haversine × 1.07`. **Re-derive that factor rather than
guessing it**: the haversine from Dhar Bus Stand to Rajwada is 58.11 km and
`ROUTES_CONFIG['DHR-IND'].distanceKm` says the road is 62 km, so 62 / 58.11 =
1.07. An earlier 1.28 taken from a mis-remembered haversine inflated every quote
on the corridor by about 12%.

A poster's own quoted figure always wins over the estimate — `parseQuotedFare`
pulls the rupee value out of free text like `"₹150 / seat (Fuel Split)"` and the
card labels which of the two it is showing.

### 9.4 Matching is geometric, not string equality

`buildMatches` in `lib/pool-matching.ts` resolves both endpoints to coordinates
and accepts a post whose ends are within **22 km** of the plan's and whose
departure is within **150 minutes**. Exact-string matching would report "no
rides found" on this corridor while three usable ones sat in the feed — "Dhar
Bus Stand", "Ahilya Fort" and "Mohan Talkies Square" are a few minutes' walk
apart. 22 km is wide enough for "anywhere in Dhar town" and far short of the
62 km corridor, so a match can never be a ride going the other way.

Ranking is `endpoint deviation + timeDelta/10 + 8 if the ride is full`. Two
consequences worth knowing:

- The list is sorted by **match quality, not price**. A "from ₹X" label must
  therefore use `cheapestFare(...)`, not `matches[0].farePerSeat`.
- Results are filtered against the viewer (`MatchViewer`): their own posts are
  excluded by phone, and **female-only rides are hidden from a viewer whose
  saved gender is male**. Listing one would offer a seat they cannot take, and
  if it were the cheapest it would also poison the headline price.

### 9.5 There is no auth

`usePoolProfile()` keeps name, phone, gender and safety preferences in
`localStorage` under `sjy_pool_profile`; `usePoolRides()` keeps booked and
published rides under `sjy_pool_rides`. This is a convenience cache so a
returning commuter books in one tap — **not a security boundary**. The API still
validates its own input, and both hooks seed from a server-safe default and
hydrate in an effect so they cannot cause a hydration mismatch.

### 9.6 Gotchas specific to this surface

1. **`./lib/**` is in the `content` globs of `tailwind.config.js`** because
   `pool-config.ts` holds the role and mode accent class maps. Remove that glob
   and every accent in `/pool` renders unstyled.
2. **`pool-map.tsx`'s root carries `isolate`.** Leaflet gives its internal panes
   `z-index` 200–700; without a stacking context those values escape and paint
   the map over anything later in the DOM that merely has `position: relative`
   — which clipped the top of the role switcher in the sheet overlapping it.
3. **The map's route colour is a raw hex pair, not a token.** Leaflet draws into
   an SVG overlay it owns, where Tailwind classes and CSS variables cannot
   reach, so `PoolRoleMeta.mapAccent` spells out `{ light, dark }` and the map
   re-styles the line on `sjy-theme-change`.
4. Leaflet caches container dimensions, and this container is sized in `vh` with
   a sheet over its lower edge — hence the `invalidateSize()` before
   `fitBounds` and the `ResizeObserver`. Without them a grey unpainted band
   appears where it never requested tiles.
