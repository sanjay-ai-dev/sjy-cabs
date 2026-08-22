'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SjyCabsLogo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { calculateHaversineDistance, calculateETA } from '@/lib/ais140-telematics-engine';

export default function TelematicsSimulatorPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedKmH, setSpeedKmH] = useState(58);
  const [progressPercent, setProgressPercent] = useState(25); // 25% along Dhar -> Indore route
  const [isPanic, setIsPanic] = useState(false);
  const [packetCount, setPacketCount] = useState(142);
  const [lastLatency, setLastLatency] = useState(14);
  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM INIT] AIS-140 Simulator Engine Ready',
    '[TCP SOCKET] Connected to virtual port 5000',
    '[GPS LOCK] 12 Satellites Fix (Dhar ↔ Indore Route)'
  ]);

  // Route Coordinates Sequence (Dhar -> Pithampur -> Rau -> Rajwada -> Vijay Nagar)
  const routeWaypoints = [
    { name: 'Dhar Bus Stand', lat: 22.598, lng: 75.302 },
    { name: 'Pithampur Industrial Area', lat: 22.620, lng: 75.680 },
    { name: 'Rau Circle', lat: 22.650, lng: 75.800 },
    { name: 'Rajwada Palace, Indore', lat: 22.719, lng: 75.857 },
    { name: 'Vijay Nagar / C21 Mall', lat: 22.753, lng: 75.894 }
  ];

  // Interpolate current vehicle coordinates based on progressPercent
  const totalWaypoints = routeWaypoints.length - 1;
  const rawIdx = (progressPercent / 100) * totalWaypoints;
  const baseIdx = Math.floor(rawIdx);
  const nextIdx = Math.min(baseIdx + 1, totalWaypoints);
  const fraction = rawIdx - baseIdx;

  const currentLat = parseFloat(
    (routeWaypoints[baseIdx].lat + (routeWaypoints[nextIdx].lat - routeWaypoints[baseIdx].lat) * fraction).toFixed(4)
  );
  const currentLng = parseFloat(
    (routeWaypoints[baseIdx].lng + (routeWaypoints[nextIdx].lng - routeWaypoints[baseIdx].lng) * fraction).toFixed(4)
  );

  const destinationLat = 22.753;
  const destinationLng = 75.894;
  const remainingDistanceKm = calculateHaversineDistance(currentLat, currentLng, destinationLat, destinationLng);
  const remainingEtaMins = calculateETA(remainingDistanceKm, speedKmH || 45);

  // Live Drive Simulation Timer
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgressPercent(prev => {
          if (prev >= 100) return 0; // Loop back
          return prev + 1;
        });
        setPacketCount(prev => prev + 1);
        setLastLatency(Math.floor(12 + Math.random() * 8));

        const timeStr = new Date().toLocaleTimeString();
        const nmeaStr = `$PVT,${timeStr.replace(/:/g, '')},${currentLat},N,${currentLng},E,${speedKmH}.0,180*4E`;
        setLogs(prev => [nmeaStr, ...prev.slice(0, 15)]);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentLat, currentLng, speedKmH]);

  const handleTriggerPanic = () => {
    setIsPanic(true);
    const panicPacket = `$EMR,${new Date().toLocaleTimeString().replace(/:/g, '')},${currentLat},N,${currentLng},E,0.0,0*PANIC_ALERT`;
    setLogs(prev => [
      `🚨 [SOS PANIC BUTTON PRESSED] ${panicPacket}`,
      '🚨 Control Room & Police Emergency Alert Dispatched!',
      ...prev
    ]);

    if (typeof window !== 'undefined') {
      const channel = new BroadcastChannel('sjy_cabs_telematics');
      channel.postMessage({
        type: 'AIS140_PANIC_ALERT',
        payload: {
          vehicleId: 'MP09 AB 1001',
          driverName: 'Rajesh Sharma',
          driverPhone: '+91 98260 12345',
          location: `Dhar ↔ Indore Route (Lat: ${currentLat}, Lng: ${currentLng})`,
          timestamp: new Date().toLocaleTimeString()
        }
      });
      localStorage.setItem('sjy_cabs_panic', 'true');
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-content flex flex-col justify-between p-4 md:p-8 font-sans">
      
      {/* Navbar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 border-b border-hairline">
        <SjyCabsLogo size="md" />
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <span className="hidden md:flex bg-purple-500/10 border border-purple-500/30 text-accent px-3 py-1 rounded-full text-xs font-bold items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 motion-safe:animate-pulse" />
            VIRTUAL HARDWARE SIMULATOR
          </span>
          <Link href="/user" className="btn-primary py-2 px-4 text-xs font-bold">
            Launch Portals ➔
          </Link>
        </div>
      </header>

      {/* Main Simulator Panel */}
      <main className="max-w-6xl w-full mx-auto my-8 space-y-8">
        
        {/* Header Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-brand px-3 py-1 rounded-full text-xs font-extrabold">
            🛰️ NO HARDWARE REQUIRED • 100% REALTIME SYNC
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight">
            AIS-140 Telematics & Synchronization Simulator
          </h1>
          <p className="text-content-secondary text-sm md:text-base max-w-3xl">
            Test how live GPS location, speed, seat bookings and SOS panic alerts
            synchronise across the{' '}
            <strong className="text-content">User Booking Portal</strong>,{' '}
            <strong className="text-content">Driver Cockpit</strong> and{' '}
            <strong className="text-content">Admin Command</strong> in real time.
          </p>
        </div>

        {/* SOS Emergency Banner if Triggered */}
        {isPanic && (
          <div className="bg-rose-500/20 border-2 border-rose-500 text-danger p-4 rounded-2xl flex items-center justify-between motion-safe:animate-bounce">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚨</span>
              <div>
                <div className="font-extrabold text-sm text-danger">AIS-140 SOS EMERGENCY PANIC ALERT ACTIVE!</div>
                <div className="text-xs text-danger">Vehicle MP09 AB 1001 • Lat: {currentLat}, Lng: {currentLng} • Dispatching Emergency Services</div>
              </div>
            </div>
            <button
              onClick={() => setIsPanic(false)}
              className="bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl"
            >
              Reset SOS
            </button>
          </div>
        )}

        {/* 3 Synchronized Ecosystem Quick Link Portals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <Link
            href="/user"
            target="_blank"
            className="glass-card p-5 border-2 border-indigo-500/40 hover:border-indigo-500 transition-all hover:-translate-y-1 block space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-2xl">📱</span>
              <span className="text-micro bg-indigo-500/20 text-brand px-2 py-0.5 rounded-full font-bold">1. User Booking</span>
            </div>
            <h3 className="font-extrabold text-base text-content font-display">User Portal (`/user`)</h3>
            <p className="text-xs text-content-muted">Book seats, pick doorstep locations, & see live shuttle approach in real time.</p>
            <div className="text-xs font-bold text-brand">Open User Portal (New Tab) ➔</div>
          </Link>

          <Link
            href="/driver"
            target="_blank"
            className="glass-card p-5 border-2 border-emerald-500/40 hover:border-emerald-500 transition-all hover:-translate-y-1 block space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-2xl">🚖</span>
              <span className="text-micro bg-emerald-500/20 text-success px-2 py-0.5 rounded-full font-bold">2. Driver Cockpit</span>
            </div>
            <h3 className="font-extrabold text-base text-content font-display">Driver Cockpit (`/driver`)</h3>
            <p className="text-xs text-content-muted">Receives live bookings, displays filled Ertiga 6-seat chassis map, & doorstep stops.</p>
            <div className="text-xs font-bold text-success">Open Driver Cockpit (New Tab) ➔</div>
          </Link>

          <Link
            href="/admin"
            target="_blank"
            className="glass-card p-5 border-2 border-purple-500/40 hover:border-purple-500 transition-all hover:-translate-y-1 block space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-2xl">📊</span>
              <span className="text-micro bg-purple-500/20 text-accent px-2 py-0.5 rounded-full font-bold">3. Admin Command</span>
            </div>
            <h3 className="font-extrabold text-base text-content font-display">Admin Enterprise (`/admin`)</h3>
            <p className="text-xs text-content-muted">Tracks vehicle live on Leaflet map, receives SOS panic alerts, & updates fares.</p>
            <div className="text-xs font-bold text-accent">Open Admin Command (New Tab) ➔</div>
          </Link>

        </div>

        {/* Live Telematics Simulator Control Desk */}
        <div className="glass-card p-6 border-2 border-indigo-500/40 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-hairline pb-4">
            <div>
              <h3 className="text-lg font-extrabold font-display text-content">Live Telematics Drive Controller</h3>
              <p className="text-xs text-content-muted">Simulate vehicle movement along Dhar ➔ Pithampur ➔ Rau ➔ Rajwada ➔ Vijay Nagar</p>
            </div>

            {/* Play / Pause & Panic Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`py-2.5 px-6 rounded-2xl text-xs font-extrabold transition-all shadow-lg flex items-center gap-2 ${
                  isPlaying
                    ? 'bg-amber-500 text-black shadow-amber-500/30'
                    : 'bg-emerald-700 text-white shadow-emerald-700/30 hover:bg-emerald-700'
                }`}
              >
                <span>{isPlaying ? '⏸ PAUSE DRIVE SIMULATION' : '▶ START LIVE DRIVE SIMULATION'}</span>
              </button>

              <button
                onClick={handleTriggerPanic}
                className="bg-rose-600 hover:bg-rose-700 text-white py-2.5 px-4 rounded-2xl text-xs font-extrabold transition-all shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                <span>🚨</span> SIMULATE SOS PANIC
              </button>
            </div>
          </div>

          {/* Telemetry Metrics & Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Speed Slider */}
            <div className="bg-surface-2 border border-hairline p-4 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-content-secondary">
                <span>Vehicle Speed:</span>
                <span className="text-brand font-mono text-sm">{speedKmH} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                value={speedKmH}
                onChange={e => setSpeedKmH(parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="text-micro text-content-muted flex justify-between">
                <span>0 (Stopped)</span>
                <span>45 (City)</span>
                <span>90 (Highway)</span>
              </div>
            </div>

            {/* Route Progress Slider */}
            <div className="bg-surface-2 border border-hairline p-4 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-content-secondary">
                <span>Route Position:</span>
                <span className="text-success font-mono text-sm">{progressPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercent}
                onChange={e => setProgressPercent(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="text-micro text-content-muted flex justify-between">
                <span>Dhar (Start)</span>
                <span>Pithampur</span>
                <span>Indore (End)</span>
              </div>
            </div>

            {/* Live GPS Coordinates */}
            <div className="bg-surface-2 border border-hairline p-4 rounded-2xl">
              <div className="text-xs text-content-muted font-bold uppercase">Current GPS Location</div>
              <div className="text-sm font-black font-mono text-content mt-1">
                {currentLat}, {currentLng}
              </div>
              <div className="text-micro text-info mt-1 font-semibold">
                ETA to End: {remainingEtaMins} mins ({remainingDistanceKm} km)
              </div>
            </div>

            {/* Latency & Packet Stats */}
            <div className="bg-surface-2 border border-hairline p-4 rounded-2xl">
              <div className="text-xs text-content-muted font-bold uppercase">Ingestion Telemetry</div>
              <div className="text-sm font-black font-mono text-success mt-1">
                Latency: {lastLatency} ms
              </div>
              <div className="text-micro text-content-muted mt-1 font-mono">
                Packets: {packetCount} | Protocol: TCP NMEA
              </div>
            </div>

          </div>

          {/* Live Telematics NMEA Raw Log Stream */}
          <div className="space-y-2 pt-2 border-t border-hairline">
            <div className="flex justify-between items-center text-xs text-content-muted font-bold uppercase">
              <span>Live AIS-140 Telematics Packet Log Stream (`$PVT`)</span>
              <span className="text-success text-micro font-mono">● LIVE 1-SEC TELEMETRY STREAM</span>
            </div>

            <div className="bg-surface-2 font-mono text-micro text-success p-4 rounded-2xl h-36 overflow-y-auto space-y-1 border border-hairline scrollbar-thin">
              {logs.map((log, i) => (
                <div key={i} className={log.includes('🚨') ? 'text-danger font-bold' : ''}>
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
