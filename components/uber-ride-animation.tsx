'use client';

import React, { useEffect, useState } from 'react';
import { LiveMap } from './live-map';
import { calculateHaversineDistance, calculateETA } from '@/lib/ais140-telematics-engine';
import { useToast } from './toast-provider';

interface UberRideAnimationProps {
  bookingCode: string;
  fromCity: string;
  toCity: string;
  pickupAddress: string;
  dropAddress: string;
  seats: number;
  totalFare: number;
  onCancel?: () => void;
  onTriggerSos?: () => void;
}

export const UberRideAnimation: React.FC<UberRideAnimationProps> = ({
  bookingCode,
  fromCity,
  toCity,
  pickupAddress,
  dropAddress,
  seats,
  totalFare,
  onCancel,
  onTriggerSos
}) => {
  const { toast } = useToast();
  // Animated driver approach progress (100% -> 0%)
  const [driverApproachPercent, setDriverApproachPercent] = useState(80);
  const [driverDistanceKm, setDriverDistanceKm] = useState(2.4);
  const [driverEtaMins, setDriverEtaMins] = useState(6);
  const [tripDurationMins, setTripDurationMins] = useState(82);

  // Vehicle Lat/Lng moving towards pickup
  const pickupLat = 22.598;
  const pickupLng = 75.302;
  const vehicleLat = 22.610;
  const vehicleLng = 75.320;

  useEffect(() => {
    const interval = setInterval(() => {
      setDriverApproachPercent(prev => {
        if (prev <= 10) return 90; // loop simulation
        return prev - 2;
      });

      setDriverDistanceKm(prev => {
        const nextDist = Math.max(0.4, prev - 0.1);
        setDriverEtaMins(calculateETA(nextDist, 40));
        return parseFloat(nextDist.toFixed(1));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* Top Uber-Style Dispatch Status Header */}
      <div className="glass-card p-4 border-2 border-indigo-500/40 dark:bg-gradient-to-br dark:from-[#121426] dark:via-[#0d0f1c] dark:to-[#161026] relative overflow-hidden shadow-2xl">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 motion-safe:animate-ping" />
              <span className="text-micro text-success font-extrabold uppercase tracking-widest">
                DRIVER EN ROUTE TO YOUR DOORSTEP
              </span>
            </div>
            <h2 className="text-xl font-black font-display text-content mt-1">
              Shuttle Arriving in <span className="text-success">{driverEtaMins} Mins</span>
            </h2>
          </div>

          <div className="text-right">
            <div className="text-micro text-content-muted font-bold uppercase">BOOKING CODE</div>
            <div className="text-sm font-mono font-black text-brand">{bookingCode || 'BK-IND-9921'}</div>
          </div>
        </div>

        {/* Uber Animated Progress Bar */}
        <div className="w-full bg-surface-3 h-2 rounded-full overflow-hidden relative mb-2">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
            style={{ width: `${100 - driverApproachPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-micro font-mono text-content-muted">
          <span>🚘 MP09 AB 1001 is {driverDistanceKm} km away</span>
          <span>🏁 Total Trip: {tripDurationMins} mins</span>
        </div>
      </div>

      {/* Interactive Map View with Cab & Doorstep Pins */}
      <div className="h-[320px] rounded-3xl overflow-hidden border-2 border-indigo-500/30 shadow-2xl relative">
        <LiveMap
          centerLat={pickupLat}
          centerLng={pickupLng}
          zoom={12}
          vehicleLat={vehicleLat}
          vehicleLng={vehicleLng}
        />

        {/* Floating Uber ETA Overlay on Map */}
        <div className="absolute top-3 left-3 z-[400] bg-surface/95 backdrop-blur-md border border-hairline px-3 py-1.5 rounded-full text-meta font-bold text-content flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
          <span>Driver: Rajesh Sharma (4.9 ★)</span>
        </div>
      </div>

      {/* Driver & Shuttle Micro-Card */}
      <div className="glass-card p-4 space-y-4 border border-hairline bg-surface">
        
        {/* Driver Details & Call Pill */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-700 to-blue-600 font-black text-white text-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              R
            </div>
            <div>
              <div className="font-extrabold text-sm text-content flex items-center gap-1.5">
                Rajesh Sharma <span className="text-warning text-xs font-bold">4.9 ★</span>
              </div>
              <div className="text-xs font-mono text-info font-bold">MP09 AB 1001 • White Maruti Ertiga</div>
            </div>
          </div>

          <a
            href="tel:+919826012345"
            className="btn-primary py-2 px-3 text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1"
          >
            <span>📞</span> Call
          </a>
        </div>

        {/* Pickup & Drop Timeline Cards */}
        <div className="space-y-2 border-t border-hairline pt-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0" />
            <div className="flex-1 truncate">
              <span className="text-micro text-content-muted font-bold uppercase block">DOORSTEP PICKUP (ETA {driverEtaMins} MINS)</span>
              <strong className="text-content font-semibold">{pickupAddress || 'Dhar Bus Stand'}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-md bg-cyan-400 ring-4 ring-cyan-400/20 shrink-0" />
            <div className="flex-1 truncate">
              <span className="text-micro text-content-muted font-bold uppercase block">DOORSTEP DROP</span>
              <strong className="text-content font-semibold">{dropAddress || 'Rajwada, Indore'}</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons: Share Live Status & Emergency SOS */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-hairline">
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(`https://sjy-cabs.vercel.app/track/${bookingCode || 'BK-IND-9921'}`);
                toast({
                  tone: 'success',
                  title: 'Tracking link copied',
                  detail: 'Share it so someone can follow this trip live.',
                });
              }
            }}
            className="min-h-tap flex items-center justify-center gap-1.5 rounded-xl border border-hairline bg-surface-2 px-3 text-xs font-bold text-brand transition-colors hover:bg-surface-3"
          >
            <span>🔗</span> Share Live Trip
          </button>

          <button
            type="button"
            onClick={() => {
              if (onTriggerSos) onTriggerSos();
              else window.location.href = 'tel:112';
            }}
            className="min-h-tap flex items-center justify-center gap-1.5 rounded-xl border border-rose-500 bg-rose-600/20 px-3 text-xs font-black text-rose-700 dark:text-rose-300 transition-colors hover:bg-rose-600/30 cursor-pointer"
          >
            <span aria-hidden="true">🚨</span> SOS Emergency
          </button>
        </div>

      </div>

    </div>
  );
};
