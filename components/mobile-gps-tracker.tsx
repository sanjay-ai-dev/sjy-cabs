'use client';

import React, { useState, useEffect } from 'react';
import { calculateHaversineDistance, calculateETA } from '@/lib/ais140-telematics-engine';

interface MobileGPSTrackerProps {
  onLocationUpdate?: (lat: number, lng: number, speed: number) => void;
}

export const MobileGPSTracker: React.FC<MobileGPSTrackerProps> = ({ onLocationUpdate }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number; speed: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let watchId: number;

    if (isTracking && typeof window !== 'undefined' && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(5));
          const lng = parseFloat(position.coords.longitude.toFixed(5));
          const accuracy = Math.round(position.coords.accuracy || 10);
          const speed = Math.round((position.coords.speed || 0) * 3.6); // m/s to km/h

          setCoords({ lat, lng, accuracy, speed });
          setErrorMsg(null);

          if (onLocationUpdate) {
            onLocationUpdate(lat, lng, speed);
          }

          // Broadcast to Admin & Other Windows via BroadcastChannel
          const channel = new BroadcastChannel('sjy_cabs_telematics');
          channel.postMessage({
            type: 'MOBILE_REALTIME_GPS',
            payload: {
              vehicleId: 'MP09 MOBILE GPS',
              lat,
              lng,
              speed,
              accuracy,
              timestamp: new Date().toLocaleTimeString()
            }
          });

          // Send to HTTP API Webhook for cloud sync
          fetch('/api/telematics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              vehicleId: 'MP09 MOBILE REAL GPS',
              lat,
              lng,
              speed,
              timestamp: new Date().toISOString()
            })
          }).catch(() => {});
        },
        (err) => {
          setErrorMsg(`GPS Error: ${err.message}`);
          setIsTracking(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, onLocationUpdate]);

  return (
    <div className="bg-surface-2 backdrop-blur-xl border border-indigo-500/40 p-4 rounded-2xl space-y-3 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📍</span>
          <div>
            <div className="font-extrabold text-xs text-content">Live Mobile Phone GPS Tracking</div>
            <div className="text-micro text-content-muted">Realtime Device Sensors (iOS & Android)</div>
          </div>
        </div>

        {/* Toggle Watch Switch */}
        <button
          onClick={() => setIsTracking(prev => !prev)}
          className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
            isTracking
              ? 'bg-emerald-500/20 text-success border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-emerald-400 motion-safe:animate-pulse' : 'bg-white'}`} />
          {isTracking ? 'TRACKING LIVE' : 'ENABLE MOBILE GPS'}
        </button>
      </div>

      {/* Coordinates Display */}
      {isTracking && coords && (
        <div className="bg-surface-2 border border-emerald-500/30 p-3 rounded-xl space-y-1.5 animate-fadeIn">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-content-muted">Lat / Lng:</span>
            <span className="text-success font-bold">{coords.lat}, {coords.lng}</span>
          </div>
          <div className="flex justify-between items-center text-micro font-mono text-content-secondary">
            <span>Speed: <strong className="text-brand">{coords.speed} km/h</strong></span>
            <span>Accuracy: <strong className="text-info">±{coords.accuracy}m</strong></span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="text-micro text-danger font-semibold bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 p-2 rounded-xl">
          ⚠️ {errorMsg}. Please allow Location permission in your mobile browser.
        </div>
      )}
    </div>
  );
};
