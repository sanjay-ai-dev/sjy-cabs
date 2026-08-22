'use client';

import React, { useEffect, useRef, useState } from 'react';
import { buildRoutePath, resolvePlace } from '@/lib/pool-config';

interface PoolMapProps {
  from: string;
  to: string;
  /**
   * Route line colour per theme. Raw CSS colours, not Tailwind classes —
   * Leaflet draws into an SVG overlay it owns, so utilities can't reach it, and
   * the accent has to be swapped by hand when the theme flips.
   */
  accent?: { light: string; dark: string };
  className?: string;
}

const DEFAULT_ACCENT = { light: '#4f46e5', dark: '#818cf8' } as const;

// CARTO Positron rather than Voyager: Voyager's warm cream landmass and
// coloured road casings fight the route line and the accent chrome. Positron is
// near-neutral, which is what lets a 5px indigo polyline read as the subject.
const TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
} as const;

const LABEL_TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png',
} as const;

function currentTheme(): 'light' | 'dark' {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/**
 * Filled dot for the origin, hollow ring for the destination. The halo picks up
 * the map's own background so the pin separates from the tiles in both themes —
 * a white halo on the dark basemap reads as a smudge.
 */
function endpointIcon(
  L: typeof import('leaflet'),
  accent: string,
  theme: 'light' | 'dark',
  filled: boolean
) {
  const ground = theme === 'dark' ? '#0b0d14' : '#ffffff';
  return L.divIcon({
    className: '',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    html: `<span style="display:block;width:14px;height:14px;border-radius:50%;
      border:3px solid ${accent};background:${filled ? accent : ground};
      box-shadow:0 0 0 3px ${ground},0 2px 6px rgba(0,0,0,.32);"></span>`,
  });
}

/**
 * A schematic corridor map. Read-only on purpose: the route is a consequence of
 * the two location fields, so panning or zooming it can't change anything, and
 * a map that swallows scroll gestures on a mobile form is actively hostile.
 */
export const PoolMap: React.FC<PoolMapProps> = ({
  from,
  to,
  accent = DEFAULT_ACCENT,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const baseLayerRef = useRef<import('leaflet').TileLayer | null>(null);
  const labelLayerRef = useRef<import('leaflet').TileLayer | null>(null);
  const routeRef = useRef<import('leaflet').Polyline | null>(null);
  const markersRef = useRef<import('leaflet').Marker[]>([]);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);
  const [ready, setReady] = useState(false);
  // Server-render as light to match the SSR'd HTML; the init effect corrects it
  // before the map draws anything.
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Build once. Listing `from`/`to` here would tear the map down on every
  // keystroke in the location fields.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = await import('leaflet');
      if (cancelled || !containerRef.current || mapRef.current) return;

      leafletRef.current = L;
      const initialTheme = currentTheme();
      setTheme(initialTheme);

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        // The map is context, not a control: nothing inside it takes focus and
        // no gesture on it changes the plan.
        keyboard: false,
      }).setView([22.66, 75.58], 9);
      mapRef.current = map;

      baseLayerRef.current = L.tileLayer(TILES[initialTheme], {
        subdomains: 'abcd',
        maxZoom: 18,
      }).addTo(map);

      // Labels ride above the route line so town names stay readable where the
      // highway passes through them.
      labelLayerRef.current = L.tileLayer(LABEL_TILES[initialTheme], {
        subdomains: 'abcd',
        maxZoom: 18,
        pane: 'markerPane',
      }).addTo(map);

      setReady(true);
      setTimeout(() => map.invalidateSize(), 120);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      baseLayerRef.current = null;
      labelLayerRef.current = null;
      routeRef.current = null;
      markersRef.current = [];
    };
  }, []);

  // Redraw the route whenever the endpoints or the accent change.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map) return;

    const lineColour = accent[theme];
    const origin = resolvePlace(from);
    const destination = resolvePlace(to);
    const path = buildRoutePath(origin, destination);

    routeRef.current?.remove();
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    routeRef.current = L.polyline(path, {
      color: lineColour,
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
      interactive: false,
    }).addTo(map);

    if (origin) {
      markersRef.current.push(
        L.marker([origin.lat, origin.lng], {
          icon: endpointIcon(L, lineColour, theme, true),
          interactive: false,
          keyboard: false,
        }).addTo(map)
      );
    }
    if (destination) {
      markersRef.current.push(
        L.marker([destination.lat, destination.lng], {
          icon: endpointIcon(L, lineColour, theme, false),
          interactive: false,
          keyboard: false,
        }).addTo(map)
      );
    }

    // The container is sized in vh and the sheet overlaps its lower edge, so
    // Leaflet's cached dimensions can be stale on first paint — which leaves a
    // grey unpainted band where it never asked for tiles.
    map.invalidateSize();
    // Generous horizontal padding keeps the city labels the tile layer draws
    // beside each endpoint from being cut off at the container edge.
    map.fitBounds(L.latLngBounds(path), {
      paddingTopLeft: [52, 30],
      paddingBottomRight: [58, 46],
      animate: false,
    });
  }, [ready, from, to, accent, theme]);

  // Keep tiles covering the container through rotation and viewport changes.
  useEffect(() => {
    const container = containerRef.current;
    if (!ready || !container) return;

    const observer = new ResizeObserver(() => mapRef.current?.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [ready]);

  // Swap basemap tiles with the app theme. Reading the theme only at init is
  // how a dark map ends up sitting on a light page after a toggle. Setting the
  // state also re-runs the route effect, which restyles the line and pins.
  useEffect(() => {
    const applyTheme = () => {
      const next = currentTheme();
      setTheme(next);
      baseLayerRef.current?.setUrl(TILES[next]);
      labelLayerRef.current?.setUrl(LABEL_TILES[next]);
    };
    window.addEventListener('sjy-theme-change', applyTheme);
    return () => window.removeEventListener('sjy-theme-change', applyTheme);
  }, []);

  const routeLabel =
    from && to
      ? `Map of the route from ${from} to ${to}`
      : 'Map of the Dhar to Indore corridor';

  return (
    // `isolate` is load-bearing. Leaflet gives its internal panes z-index
    // 200–700, and without a stacking context here those values escape and
    // paint the map over anything later in the DOM that merely has
    // `position: relative` — which clipped the top of the controls in the sheet
    // that overlaps this map.
    <div
      className={`relative isolate overflow-hidden bg-surface-2 ${className}`}
      role="img"
      aria-label={routeLabel}
    >
      <div ref={containerRef} className="h-full w-full" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-meta text-content-muted motion-safe:animate-pulse">
            Loading map…
          </span>
        </div>
      )}
    </div>
  );
};
