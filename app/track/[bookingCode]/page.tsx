'use client';

import React, { useState, useEffect } from 'react';
import { LiveMap } from '@/components/live-map';
import {
  parseAIS140Packet,
  optimize6PassengerRoute,
  calculateHaversineDistance,
  calculateETA,
  StopLocation
} from '@/lib/ais140-telematics-engine';
import { MobileGPSTracker } from '@/components/mobile-gps-tracker';
import { ThemeToggle } from '@/components/theme-toggle';

export default function PublicTrackingPage({ params }: { params: { bookingCode: string } }) {
  const [copied, setCopied] = useState(false);
  const [isPanicTriggered, setIsPanicTriggered] = useState(false);
  const [telemetry, setTelemetry] = useState(parseAIS140Packet('$PVT,150201,22.7196,N,75.8577,E,58.4,180*4E'));
  
  // Sample 6 Passenger Doorstep Stops for Route Optimization Test
  const sampleStops: StopLocation[] = [
    { id: '1', passengerName: 'Raju Sharma', type: 'pickup', address: 'House 14, Anand Nagar, Dhar', lat: 22.598, lng: 75.302 },
    { id: '2', passengerName: 'Gupta Traders (Parcel)', type: 'parcel', address: 'Shop 12, Dhar Market', lat: 22.602, lng: 75.310 },
    { id: '3', passengerName: 'Priya Patel (♀ Ladies)', type: 'pickup', address: 'Flat 302, Pithampur Bypass', lat: 22.620, lng: 75.680 },
    { id: '4', passengerName: 'Kumar Electronics (Parcel)', type: 'drop', address: 'Shop 4, Sarafa Bazaar, Indore', lat: 22.715, lng: 75.850 },
    { id: '5', passengerName: 'Raju & Priya', type: 'drop', address: 'Building 4, Rajwada, Indore', lat: 22.719, lng: 75.857 },
    { id: '6', passengerName: 'Amit & Sunita', type: 'drop', address: 'Office 501, C21 Mall / Vijay Nagar, Indore', lat: 22.753, lng: 75.894 }
  ];

  const routeOptimization = optimize6PassengerRoute(22.598, 75.302, sampleStops);

  // Vehicle Lat/Lng (Simulated Live Progression)
  const vehicleLat = 22.650;
  const vehicleLng = 75.550;

  // Calculate User & Driver Distances
  const userDropLat = 22.719;
  const userDropLng = 75.857;
  const userDistanceKm = calculateHaversineDistance(vehicleLat, vehicleLng, userDropLat, userDropLng);
  const userEtaMins = calculateETA(userDistanceKm, 48);

  const driverPickupLat = 22.620;
  const driverPickupLng = 75.680;
  const driverDistanceKm = calculateHaversineDistance(vehicleLat, vehicleLng, driverPickupLat, driverPickupLng);
  const driverEtaMins = calculateETA(driverDistanceKm, 48);

  useEffect(() => {
    const interval = setInterval(() => {
      const startTime = Date.now();
      const packet = parseAIS140Packet('$PVT,150201,22.6500,N,75.5500,E,62.0,180*4E', startTime);
      setTelemetry(packet);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleShareLiveLocation = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://sjy-cabs.vercel.app/track/${params.bookingCode || 'BK-A3F7K2'}`;
    if (navigator.share) {
      navigator.share({
        title: 'DailyCab — Live Shuttle Location',
        text: `Track my DailyCab Ertiga shuttle (BK-A3F7K2) live on the map! ETA to drop: ${userEtaMins} mins.`,
        url: shareUrl
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTestPanicButton = () => {
    setIsPanicTriggered(true);
    const panicPacket = parseAIS140Packet('$EMR,150201,22.7196,N,75.8577,E,EMERGENCY_PANIC_PRESSED*');
    setTelemetry(panicPacket);

    if (typeof window !== 'undefined') {
      const channel = new BroadcastChannel('sjy_cabs_telematics');
      channel.postMessage({
        type: 'AIS140_PANIC_ALERT',
        payload: {
          vehicleId: 'MP09 AB 1001',
          driverName: 'Rajesh Sharma',
          driverPhone: '+91 98260 12345',
          location: 'Rau Bypass, Indore (Lat: 22.7196, Lng: 75.8577)',
          timestamp: new Date().toLocaleTimeString()
        }
      });
      localStorage.setItem('sjy_cabs_panic', 'true');
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-content flex justify-center p-4 py-6">
      <div className="max-w-md w-full space-y-5">
        
        {/* Header Bar */}
        <header className="flex items-center justify-between border-b border-hairline pb-4">
          <div>
            <div className="text-micro text-content-muted font-bold uppercase tracking-wider">AIS-140 LIVE TELEMETRY</div>
            <div className="text-xl font-black font-mono text-brand">{params.bookingCode || 'BK-A3F7K2'}</div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="bg-emerald-500/15 text-success border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>
        </header>

        {/* SOS Emergency Banner (Triggered on Panic Test) */}
        {isPanicTriggered && (
          <div className="bg-rose-500/20 border-2 border-rose-500 text-danger rounded-2xl p-4 space-y-2 motion-safe:animate-bounce">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm flex items-center gap-1.5 text-danger">
                🚨 AIS-140 SOS EMERGENCY PANIC ALERT TRIGGERED!
              </span>
              <button
                onClick={() => setIsPanicTriggered(false)}
                className="text-xs font-bold bg-rose-600 text-white px-2 py-0.5 rounded"
              >
                DISMISS
              </button>
            </div>
            <p className="text-xs text-danger">
              Packet `$EMR` transmitted via TCP Socket to DailyCab Control Room. Lat: 22.7196, Lng: 75.8577. Emergency dispatch & police dispatch initiated!
            </p>
          </div>
        )}

        {/* Live Shuttle Overview Card */}
        <div className="glass-card p-5 space-y-4 border-2 border-indigo-500/40 dark:bg-gradient-to-br dark:from-[#121424] dark:to-[#0c0e18]">
          <div className="flex justify-between items-center border-b border-hairline pb-3">
            <div>
              <div className="text-lg font-black font-display text-content">Dhar ➔ Indore Express</div>
              <div className="text-xs text-content-muted">MP09 AB 1001 (Maruti Ertiga) • Driver: Rajesh Sharma</div>
            </div>
            <span className="bg-indigo-500/20 text-brand border border-indigo-500/40 text-xs font-bold px-2.5 py-1 rounded-xl">
              RHD 6-Seat
            </span>
          </div>

          {/* User & Driver Live Distance Metrics */}
          <div className="grid grid-cols-2 gap-3">
            {/* Driver to Next Pickup Distance */}
            <div className="bg-surface-2 border border-emerald-500/30 p-3 rounded-2xl">
              <div className="text-micro text-success font-extrabold uppercase tracking-wider">Driver ➔ Next Pickup</div>
              <div className="text-lg font-black text-content font-display mt-0.5">{driverDistanceKm} km</div>
              <div className="text-micro font-bold text-success mt-0.5">Pickup ETA: {driverEtaMins} mins</div>
            </div>

            {/* Vehicle to User Drop Distance */}
            <div className="bg-surface-2 border border-cyan-500/30 p-3 rounded-2xl">
              <div className="text-micro text-info font-extrabold uppercase tracking-wider">Vehicle ➔ Your Drop</div>
              <div className="text-lg font-black text-content font-display mt-0.5">{userDistanceKm} km</div>
              <div className="text-micro font-bold text-info mt-0.5">Drop ETA: {userEtaMins} mins</div>
            </div>
          </div>

          {/* Telemetry Socket Latency Bar */}
          <div className="flex justify-between items-center bg-surface-2 border border-hairline p-2.5 rounded-xl text-xs">
            <span className="text-content-muted font-medium flex items-center gap-1.5">
              <span>⚡ Packet Latency:</span>
              <strong className="text-success font-mono">{telemetry.latencyMs} ms</strong>
            </span>
            <span className="text-content-muted font-medium flex items-center gap-1.5">
              <span>Speed:</span>
              <strong className="text-brand font-mono">{telemetry.speedKmH} km/h</strong>
            </span>
          </div>
        </div>

        {/* Interactive Action Buttons Bar: Share LIVE Location & Test Panic Button */}
        <div className="grid grid-cols-2 gap-3">
          {/* Share LIVE Location Button */}
          <button
            onClick={handleShareLiveLocation}
            className="btn-primary py-3 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <span>🔗</span> {copied ? 'Link Copied!' : 'Share Live Location'}
          </button>

          {/* Test AIS-140 Panic Button */}
          <button
            onClick={handleTestPanicButton}
            className="bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500 text-danger py-3 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <span>🚨</span> Test Panic Button
          </button>
        </div>

        {/* Live Mobile Phone GPS Tracker Component */}
        <MobileGPSTracker />

        {/* Live Interactive Leaflet Map View */}
        <div className="h-[380px] rounded-3xl overflow-hidden border border-hairline shadow-2xl">
          <LiveMap centerLat={22.65} centerLng={75.55} zoom={11} vehicleLat={vehicleLat} vehicleLng={vehicleLng} />
        </div>

        {/* 6-Passenger Fastest Sequential Route Optimization Matrix */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-hairline pb-2">
            <div>
              <h3 className="text-xs font-extrabold text-brand uppercase tracking-wider">
                Fastest 6-Passenger Route Matrix
              </h3>
              <p className="text-micro text-content-muted">TSP Optimization Engine • Total {routeOptimization.totalDistanceKm} km</p>
            </div>
            <span className="text-micro bg-emerald-500/20 text-success border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
              Saved {routeOptimization.savedDistanceKm} km
            </span>
          </div>

          <div className="space-y-2">
            {routeOptimization.optimizedStopsOrder.map((stop, idx) => (
              <div key={stop.id} className="flex items-center justify-between bg-surface-2 border border-hairline p-2.5 rounded-xl text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-brand font-extrabold flex items-center justify-center text-micro">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-content text-xs">{stop.passengerName}</div>
                    <div className="text-micro text-content-muted truncate max-w-[200px]">{stop.address}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-micro font-mono text-info font-bold block">{stop.estTime}</span>
                  <span className="text-micro text-content-muted">+{stop.distanceFromPrevKm} km</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
