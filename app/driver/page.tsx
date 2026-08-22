'use client';

import React, { useState } from 'react';
import { SjyCabsLogo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast } from '@/components/toast-provider';

export default function DriverCockpitPage() {
  const { toast } = useToast();
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'manifest' | 'earnings' | 'profile'>('today');

  // Manifest Step State
  const [currentStepIndex, setCurrentStepIndex] = useState(2);
  const [stops, setStops] = useState([
    { id: 1, type: 'pickup', title: 'Raju Sharma', subtitle: 'Doorstep: House 14, Anand Nagar, Dhar (Near Bus Stand)', time: '08:00 AM', status: 'completed', phone: '919876543201' },
    { id: 2, type: 'parcel', title: 'Gupta Traders (Parcel)', subtitle: 'Doorstep: Shop 12, Dhar Main Market', time: '08:10 AM', status: 'completed', phone: '919876543202' },
    { id: 3, type: 'pickup', title: 'Priya Patel (♀ Ladies)', subtitle: 'Doorstep: Flat 302, Green Valley Apartments, Pithampur Bypass', time: '08:25 AM', status: 'active', phone: '919876543210' },
    { id: 4, type: 'parcel_drop', title: 'Kumar Electronics (Parcel)', subtitle: 'Doorstep: Shop 4, Sarafa Bazaar, Indore', time: '09:10 AM', status: 'pending', phone: '919876543204' },
    { id: 5, type: 'drop', title: 'Raju Sharma & Priya Patel', subtitle: 'Doorstep: Building 4, Rajwada Main Square, Indore', time: '09:20 AM', status: 'pending', phone: '919876543205' },
    { id: 6, type: 'drop', title: 'Amit Kumar & Sunita Verma', subtitle: 'Doorstep: Office 501, C21 Mall / Vijay Nagar, Indore', time: '09:35 AM', status: 'pending', phone: '919876543206' }
  ]);

  // Stream Driver Mobile HTML5 GPS to Unified Telematics Broker
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          fetch('/api/telematics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: 'driver',
              driverName: 'Rajesh Sharma',
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              speed: (pos.coords.speed || 0) * 3.6,
              accuracy: pos.coords.accuracy,
              nextPickup: {
                address: stops[currentStepIndex]?.subtitle || 'House 14, Anand Nagar, Dhar',
                passengerName: stops[currentStepIndex]?.title || 'Priya Patel',
                etaMinutes: 6
              }
            })
          }).catch(() => {});
        },
        () => {},
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [currentStepIndex, stops]);

  const handleAdvanceStop = () => {
    if (currentStepIndex < stops.length - 1) {
      setStops(prev => prev.map((stop, i) => {
        if (i === currentStepIndex) return { ...stop, status: 'completed' };
        if (i === currentStepIndex + 1) return { ...stop, status: 'active' };
        return stop;
      }));
      setCurrentStepIndex(prev => prev + 1);
    } else {
      toast({
        tone: 'success',
        title: 'Trip completed',
        detail: 'All stops cleared. Vehicle returning to depot.',
      });
    }
  };

  const currentStop = stops[currentStepIndex];

  return (
    <div className="min-h-screen bg-canvas flex justify-center py-0 md:py-6">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-[430px] min-h-screen md:min-h-[860px] md:h-[860px] bg-canvas md:border md:border-hairline md:rounded-[40px] flex flex-col relative overflow-hidden shadow-2xl">
        
        {/* Cockpit Bar */}
        <header className="p-4 bg-surface-2 border-b border-hairline backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-700 to-blue-600 font-extrabold flex items-center justify-center text-white text-lg">
              R
            </div>
            <div>
              <div className="font-extrabold text-sm flex items-center gap-1.5">
                Rajesh Sharma <span className="text-warning text-xs font-bold">4.9 ★</span>
              </div>
              <div className="text-micro font-mono text-info">MP09 AB 1001 • Ertiga ZXI</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Duty Switch */}
          <button
            onClick={() => setIsOnDuty(prev => !prev)}
            aria-pressed={isOnDuty}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all flex items-center gap-2 ${
              isOnDuty
                ? 'bg-emerald-500/20 border-emerald-500/50 text-success shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-surface-3 border-hairline text-content-muted'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-emerald-400 motion-safe:animate-pulse' : 'bg-slate-500'}`} />
            {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
          </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 pb-32 space-y-5 scrollbar-none">
          
          {/* TAB 1: TODAY */}
          {activeTab === 'today' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Hero Active Trip Card */}
              <div className="glass-card p-5 border-2 border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 dark:from-cyan-950/40 dark:to-blue-950/25 relative overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-extrabold text-info tracking-wider">CURRENT ACTIVE SHUTTLE</span>
                  <span className="bg-emerald-500/20 text-success border border-emerald-500/40 text-micro font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
                    IN TRANSIT
                  </span>
                </div>

                <div className="text-2xl font-black font-display mb-1">Dhar ➔ Indore</div>
                <div className="text-xs text-content-secondary font-semibold mb-4">Route #DHR-IND • 62 km (Est 90 mins)</div>

                {/* Occupancy Meters */}
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="bg-surface-2 border border-hairline p-3 rounded-2xl">
                    <div className="text-micro text-content-muted font-bold uppercase">Passenger Seats</div>
                    <div className="text-lg font-extrabold text-info mt-0.5">5 / 6</div>
                    <div className="w-full bg-surface-3 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full" style={{ width: '83%' }} />
                    </div>
                  </div>
                  <div className="bg-surface-2 border border-hairline p-3 rounded-2xl">
                    <div className="text-micro text-content-muted font-bold uppercase">Cargo Slots</div>
                    <div className="text-lg font-extrabold text-accent mt-0.5">3 / 6</div>
                    <div className="w-full bg-surface-3 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-purple-400 h-full rounded-full" style={{ width: '50%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* NEXT TARGET STOP CARD (HIGH IMPACT) */}
              <div className="glass-card p-5 border-2 border-emerald-500/50 bg-emerald-500/10 dark:bg-emerald-950/20 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-success tracking-wider uppercase">🎯 NEXT TARGET STOP</span>
                  <span className="text-xs font-extrabold text-warning bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                    in 8 mins (4.2 km)
                  </span>
                </div>

                <div>
                  <div className="text-xl font-extrabold text-content">{currentStop?.title}</div>
                  <div className="text-xs text-content-secondary font-semibold mt-1">📍 {currentStop?.subtitle}</div>
                </div>

                {/* One-Tap Action Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <a
                    href="https://maps.google.com/?q=Pithampur+Chowk+Bypass+Dhar"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1 shadow-lg text-center"
                  >
                    🗺️ Navigate
                  </a>
                  <a
                    href={`tel:${currentStop?.phone || '919876543210'}`}
                    className="bg-surface-3 hover:bg-surface-3 border border-hairline text-content text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1 text-center"
                  >
                    📞 Call
                  </a>
                  <button
                    onClick={handleAdvanceStop}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1 text-center shadow-lg shadow-emerald-600/30"
                  >
                    ✅ Complete
                  </button>
                </div>
              </div>

              {/* Visual Ertiga 6-Seat Map (RHD) */}
              <div className="glass-card p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-content-muted uppercase tracking-wider">Vehicle Occupancy (Ertiga RHD)</span>
                  <span className="text-micro text-warning font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    🛞 Driver Right Hand Drive
                  </span>
                </div>
                
                <div className="bg-surface-2 border border-hairline rounded-3xl p-4 space-y-3">
                  {/* Row 1: Passenger 1A (Left) + Driver Steering (Right) */}
                  <div className="flex justify-between items-center px-2">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500 text-danger flex flex-col items-center justify-center font-bold text-micro">
                      <span className="font-extrabold text-xs">1A</span>
                      <span>♀ Priya</span>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-surface-3 border border-amber-500/50 text-warning flex flex-col items-center justify-center font-bold text-micro">
                      <span className="text-lg">🛞</span>
                      <span className="text-micro text-content-muted font-extrabold">DRIVER</span>
                    </div>
                  </div>

                  {/* Row 2: 2AW, 2B, 2CW */}
                  <div className="flex justify-between items-center px-1">
                    <div className="w-12 h-12 rounded-xl bg-cyan-700 border border-cyan-400 text-white flex flex-col items-center justify-center font-bold text-micro">
                      <span className="font-extrabold">2AW</span>
                      <span>Raju</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-cyan-700 border border-cyan-400 text-white flex flex-col items-center justify-center font-bold text-micro">
                      <span className="font-extrabold">2B</span>
                      <span>Amit</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-cyan-700 border border-cyan-400 text-white flex flex-col items-center justify-center font-bold text-micro">
                      <span className="font-extrabold">2CW</span>
                      <span>Sunita</span>
                    </div>
                  </div>

                  {/* Row 3: 3AW, 3BW */}
                  <div className="flex justify-around items-center px-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-700 border border-cyan-400 text-white flex flex-col items-center justify-center font-bold text-micro">
                      <span className="font-extrabold">3AW</span>
                      <span>Kavita</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-surface-2 border border-dashed border-hairline text-content-muted flex flex-col items-center justify-center font-bold text-micro">
                      <span className="font-extrabold">3BW</span>
                      <span className="text-micro">VACANT</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MANIFEST */}
          {activeTab === 'manifest' && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-xl font-extrabold font-display">Trip Manifest Timeline</h2>

              <div className="space-y-3">
                {stops.map((stop) => {
                  const isActive = stop.status === 'active';
                  const isDone = stop.status === 'completed';
                  return (
                    <div
                      key={stop.id}
                      className={`glass-card p-4 flex items-center gap-4 transition-all ${
                        isActive ? 'border-2 border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        isDone ? 'bg-emerald-500 text-black' : isActive ? 'bg-cyan-500 text-black motion-safe:animate-pulse' : 'bg-surface-3 text-content-muted'
                      }`}>
                        {isDone ? '✓' : stop.id}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-sm text-content">{stop.title}</span>
                          <span className="text-micro font-mono text-content-muted">{stop.time}</span>
                        </div>
                        <div className="text-xs text-content-muted mt-0.5">📍 {stop.subtitle}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: EARNINGS */}
          {activeTab === 'earnings' && (
            <div className="space-y-5 animate-fadeIn">
              <h2 className="text-xl font-extrabold font-display">Today's Earnings</h2>

              <div className="glass-card p-6 border-2 border-cyan-500/40 text-center space-y-2">
                <div className="text-xs text-content-muted font-bold uppercase tracking-wider">Gross Today</div>
                <div className="text-4xl font-black font-display text-info">₹3,250</div>
                <div className="text-xs text-content-muted pt-2 border-t border-hairline flex justify-around">
                  <span>Passenger Fares: <strong>₹2,600</strong></span>
                  <span>B2B Parcels: <strong>₹650</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-4">
                  <div className="text-xs text-content-muted">This Week</div>
                  <div className="text-xl font-bold text-content mt-1">₹19,400</div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-xs text-content-muted">This Month</div>
                  <div className="text-xl font-bold text-content mt-1">₹76,800</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-5 animate-fadeIn py-4">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-2xl font-bold flex items-center justify-center mx-auto shadow-xl">
                  R
                </div>
                <h2 className="text-2xl font-extrabold">Rajesh Sharma</h2>
                <div className="text-xs font-mono text-info">DL: MP09-2018-004523</div>
              </div>

              <div className="glass-card p-4 space-y-3">
                <div className="text-xs font-bold text-content-muted uppercase">Vehicle Telemetry</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-surface-2 p-2.5 rounded-xl">Fuel Level: <strong className="text-success">75%</strong></div>
                  <div className="bg-surface-2 p-2.5 rounded-xl">Tire Pressure: <strong className="text-success">OK (33 psi)</strong></div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Cockpit bottom nav. inset-b-safe keeps it clear of the iOS home
            indicator, which the fixed bottom-4 sat underneath. */}
        <nav
          aria-label="Driver sections"
          className="absolute inset-b-safe left-3 right-3 z-40 flex justify-between rounded-3xl border border-hairline bg-surface/90 p-1.5 shadow-lg backdrop-blur-2xl"
        >
          {[
            { id: 'today', icon: '🚘', label: 'Today' },
            { id: 'manifest', icon: '📋', label: 'Manifest' },
            { id: 'earnings', icon: '💰', label: 'Earnings' },
            { id: 'profile', icon: '👤', label: 'Profile' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-h-tap flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 text-micro font-semibold transition-colors ${
                  isActive
                    ? 'bg-info/10 text-info'
                    : 'text-content-muted hover:bg-surface-2 hover:text-content'
                }`}
              >
                <span aria-hidden="true" className="text-lg leading-none">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
