'use client';

import React, { useEffect, useRef, useState } from 'react';

interface LiveMapProps {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  vehicleLat?: number;
  vehicleLng?: number;
}

const TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
} as const;

function currentTheme(): 'light' | 'dark' {
  return document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'dark'
    : 'light';
}

export const LiveMap: React.FC<LiveMapProps> = ({
  centerLat = 22.7196,
  centerLng = 75.8577,
  zoom = 12,
  vehicleLat = 22.7196,
  vehicleLng = 75.8577,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Build the map exactly once. The previous version listed vehicleLat/Lng in
  // its dependency array, so every GPS poll tore the map down and rebuilt it —
  // on the admin dashboard that meant a full re-init every 2 seconds.
  useEffect(() => {
    if (!mounted || !containerRef.current || mapRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        const L = await import('leaflet');
        if (cancelled || !containerRef.current) return;

        const map = L.map(containerRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([centerLat, centerLng], zoom);
        mapRef.current = map;

        tileLayerRef.current = L.tileLayer(TILES[currentTheme()], {
          subdomains: 'abcd',
          maxZoom: 19,
        }).addTo(map);

        markerRef.current = L.marker([vehicleLat, vehicleLng], {
          icon: L.divIcon({
            html:
              '<div style="background:#6366f1;width:28px;height:28px;border-radius:50%;' +
              'border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.35);display:flex;' +
              'align-items:center;justify-content:center;font-size:14px;">🚙</div>',
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          }),
          alt: 'Live shuttle position',
        }).addTo(map);

        setTimeout(() => map.invalidateSize(), 200);
      } catch (err) {
        console.error('Leaflet load error:', err);
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Follow position updates by moving the marker instead of remounting.
  useEffect(() => {
    if (!markerRef.current || !mapRef.current) return;
    markerRef.current.setLatLng([vehicleLat, vehicleLng]);
    mapRef.current.panTo([vehicleLat, vehicleLng], {
      animate: true,
      duration: 1,
    });
  }, [vehicleLat, vehicleLng]);

  useEffect(() => {
    mapRef.current?.setView([centerLat, centerLng], zoom);
  }, [centerLat, centerLng, zoom]);

  // Swap basemap tiles when the theme changes. The old version read the theme
  // once at init, so toggling left a dark map sitting on a light page.
  useEffect(() => {
    const applyTheme = () => tileLayerRef.current?.setUrl(TILES[currentTheme()]);
    window.addEventListener('sjy-theme-change', applyTheme);
    return () => window.removeEventListener('sjy-theme-change', applyTheme);
  }, []);

  if (!mounted) {
    return (
      <div className="relative flex h-full min-h-[350px] w-full items-center justify-center overflow-hidden rounded-2xl border border-hairline bg-surface-2">
        <div className="text-sm text-content-muted motion-safe:animate-pulse">
          Loading live map…
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[350px] w-full overflow-hidden rounded-2xl border border-hairline">
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', minHeight: '350px' }}
      />
    </div>
  );
};
