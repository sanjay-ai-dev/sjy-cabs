'use client';

import React, { useState, useEffect } from 'react';
import { ROUTES_CONFIG, DAILY_SCHEDULE_SLOTS } from '@/lib/routes-config';
import { LiveMap } from '@/components/live-map';
import { SjyCabsLogo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast } from '@/components/toast-provider';
import { SurveyAdminDashboard } from '@/components/survey-admin-dashboard';

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'bookings' | 'trips' | 'routes' | 'drivers' | 'revenue' | 'survey'>('overview');
  
  // AIS-140 SOS Emergency Panic State
  const [isPanicActive, setIsPanicActive] = useState(false);
  const [panicData, setPanicData] = useState({
    vehicleId: 'MP09 AB 1001',
    driverName: 'Rajesh Sharma',
    driverPhone: '+91 98260 12345',
    location: 'Rau Bypass, Indore (Lat: 22.7196, Lng: 75.8577)',
    timestamp: new Date().toLocaleTimeString()
  });

  // Realtime Telematics State
  const [mobileGpsInfo, setMobileGpsInfo] = useState<string | null>(null);
  const [vehicleLat, setVehicleLat] = useState(22.7196);
  const [vehicleLng, setVehicleLng] = useState(75.8577);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Bookings Data
  const [bookings, setBookings] = useState([
    { code: 'BK-A3F7K2', passenger: 'Priya Sharma (♀ Ladies)', phone: '98260 11111', route: 'Dhar ➔ Indore', seat: '1A (Ladies Priority)', fare: '₹250', status: 'CONFIRMED' },
    { code: 'BK-X9Y2M1', passenger: 'Sunita Verma', phone: '98260 22222', route: 'Indore ➔ Dhar', seat: '2AW (Window)', fare: '₹0 (50-Ride Pass)', status: 'CONFIRMED' },
    { code: 'BK-K4L8P9', passenger: 'Amit Kumar', phone: '98260 33333', route: 'Dhar ➔ Indore', seat: '2B & 2CW', fare: '₹500 (2 Seats)', status: 'CONFIRMED' },
    { code: 'PCL-IND-8841', passenger: 'Gupta Traders (B2B Cargo)', phone: '98260 44444', route: 'Dhar ➔ Indore', seat: 'Luggage Bay (Aadhaar Verified)', fare: '₹200 (Parcel)', status: 'IN TRANSIT' }
  ]);

  // Realtime Polling & Cross-Device Event Synchronization
  useEffect(() => {
    // 1. Poll HTTP API Webhook for live mobile device updates
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('/api/telematics');
        const data = await res.json();
        if (data && data.telemetry) {
          const t = data.telemetry;
          if (t.source === 'LIVE_MOBILE_GPS') {
            setMobileGpsInfo(`📱 Mobile Phone GPS: ${t.lat}, ${t.lng} (${t.speed} km/h • ±${t.accuracy}m)`);
            setVehicleLat(t.lat);
            setVehicleLng(t.lng);
          }
          if (t.isPanic) {
            setIsPanicActive(true);
          }
        }
      } catch (e) {}
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2000);

    // 2. BroadcastChannel Listener for same-origin tabs
    if (typeof window !== 'undefined') {
      const channel = new BroadcastChannel('sjy_cabs_telematics');
      channel.onmessage = (event) => {
        if (event.data?.type === 'AIS140_PANIC_ALERT') {
          setIsPanicActive(true);
          if (event.data.payload) {
            setPanicData(prev => ({ ...prev, ...event.data.payload }));
          }
        }
        if (event.data?.type === 'MOBILE_REALTIME_GPS') {
          const { lat, lng, speed, accuracy } = event.data.payload || {};
          if (lat && lng) {
            setMobileGpsInfo(`📱 Mobile Phone GPS: ${lat}, ${lng} (${speed} km/h • ±${accuracy}m)`);
            setVehicleLat(lat);
            setVehicleLng(lng);
          }
        }
      };

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'sjy_cabs_panic' && e.newValue === 'true') {
          setIsPanicActive(true);
        }
      };
      window.addEventListener('storage', handleStorageChange);

      return () => {
        clearInterval(interval);
        channel.close();
        window.removeEventListener('storage', handleStorageChange);
      };
    }
    return () => clearInterval(interval);
  }, []);

  const triggerTestPanic = async () => {
    setIsPanicActive(true);
    setPanicData({
      vehicleId: 'MP09 AB 1001',
      driverName: 'Rajesh Sharma',
      driverPhone: '+91 98260 12345',
      location: 'Near Rau Bypass, Indore (Lat: 22.7196, Lng: 75.8577)',
      timestamp: new Date().toLocaleTimeString()
    });

    try {
      await fetch('/api/telematics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPanic: true })
      });
    } catch (e) {}
  };

  const dismissPanic = async () => {
    setIsPanicActive(false);
    try {
      await fetch('/api/telematics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPanic: false })
      });
    } catch (e) {}
  };

  const navItems = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'survey', icon: '📋', label: 'Launch Survey' },
    { id: 'fleet', icon: '🚗', label: 'Fleet Map' },
    { id: 'bookings', icon: '🎟️', label: 'Bookings' },
    { id: 'trips', icon: '🚍', label: 'Today Trips' },
    { id: 'routes', icon: '🗺️', label: 'Routes & Pricing' },
    { id: 'drivers', icon: '👤', label: 'Drivers' },
    { id: 'revenue', icon: '💰', label: 'Revenue' }
  ];

  return (
    <div className="min-h-screen bg-canvas text-content flex flex-col lg:flex-row">
      
      {/* Sidebar (Desktop) */}
      <aside className="w-64 border-r border-hairline bg-surface p-5 hidden lg:flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <SjyCabsLogo size="md" />

          {/* Emergency SOS Indicator Badge in Sidebar */}
          {isPanicActive && (
            <div className="bg-rose-500/20 border-2 border-rose-500 text-danger p-3 rounded-2xl text-xs space-y-1 motion-safe:animate-pulse">
              <div className="font-extrabold flex items-center gap-1.5">
                <span>🚨</span> SOS PANIC ACTIVE
              </div>
              <div className="text-micro text-danger">MP09 AB 1001 Emergency Alert</div>
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/50'
                      : 'text-content-muted hover:bg-surface-2 hover:text-content'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 bg-surface-2 border border-hairline rounded-2xl flex items-center gap-3 text-xs">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 font-bold flex items-center justify-center">
            S
          </div>
          <div>
            <div className="font-bold">Sanjay T.</div>
            <div className="text-micro text-content-muted">Super Admin</div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* CRITICAL SOS EMERGENCY ALERT BAR.

            This is a saturated red surface, so every child stays light-on-dark
            in BOTH themes — themed text tokens would render near-black rose on
            red here and become unreadable.

            The whole bar previously ran an infinite animate-bounce. A bar that
            never stops moving is harder to read and its buttons harder to hit,
            which is the opposite of what an emergency control needs; the colour
            and the role="alert" announcement carry the urgency instead. */}
        {isPanicActive && (
          <div
            role="alert"
            className="z-50 flex flex-col gap-3 border-b-4 border-rose-300 bg-gradient-to-r from-rose-700 via-red-700 to-rose-800 p-4 text-white shadow-lg lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span aria-hidden="true" className="text-2xl leading-none motion-safe:animate-pulse">
                🚨
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-black uppercase tracking-wider">
                    AIS-140 SOS panic alert detected
                  </span>
                  <span className="rounded-full bg-white/95 px-2 py-0.5 font-mono text-micro font-bold text-rose-800">
                    {panicData.timestamp}
                  </span>
                </div>
                <div className="mt-1 text-meta text-rose-50">
                  <span className="text-rose-100">Vehicle</span>{' '}
                  <strong className="font-mono text-white">{panicData.vehicleId}</strong>
                  {' • '}
                  <span className="text-rose-100">Pilot</span>{' '}
                  <strong className="text-white">
                    {panicData.driverName} ({panicData.driverPhone})
                  </strong>
                  {' • '}
                  <span className="text-rose-100">Location</span>{' '}
                  <strong className="text-white">{panicData.location}</strong>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <a
                href={`tel:${panicData.driverPhone}`}
                className="min-h-tap flex items-center gap-1 rounded-xl bg-white px-3 text-xs font-extrabold text-rose-800 shadow transition-colors hover:bg-rose-50"
              >
                <span aria-hidden="true">📞</span> Call pilot
              </a>
              <button
                type="button"
                onClick={() =>
                  toast({
                    tone: 'error',
                    title: 'Police alert dispatched',
                    detail:
                      'Sent to MP Police Control Room (112) and the Indore Transport Department.',
                  })
                }
                className="min-h-tap flex items-center gap-1 rounded-xl border border-white/40 bg-white/15 px-3 text-xs font-extrabold text-white transition-colors hover:bg-white/25"
              >
                <span aria-hidden="true">🚓</span> Alert police (112)
              </button>
              <button
                type="button"
                onClick={dismissPanic}
                className="min-h-tap rounded-xl border border-white/30 px-3 text-xs font-extrabold text-white transition-colors hover:bg-white/15"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Top Header Bar */}
        <header className="p-4 md:p-6 border-b border-hairline bg-surface/50 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <SjyCabsLogo size="sm" className="lg:hidden" />
            <div>
              <h1 className="text-xl font-extrabold font-display capitalize">{activeTab}</h1>
              <div className="text-xs text-content-muted">DailyCab Intercity Network Control</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Live Mobile GPS Telemetry Badge */}
            {mobileGpsInfo && (
              <span className="bg-cyan-500/15 border border-cyan-500/30 text-info px-3 py-1 rounded-full text-xs font-mono font-bold motion-safe:animate-pulse">
                {mobileGpsInfo}
              </span>
            )}

            {/* Test Panic Button on Admin Header */}
            <button
              onClick={triggerTestPanic}
              className="bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/60 text-danger px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-lg shadow-rose-600/20 cursor-pointer"
            >
              <span>🚨</span> Test AIS-140 Panic Alert
            </button>
          </div>
        </header>

        {/* Mobile Navigation Tabs (Shown on small screens) */}
        <div className="flex lg:hidden gap-1 p-2 bg-surface border-b border-hairline overflow-x-auto scrollbar-none text-xs font-bold">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === item.id ? 'bg-indigo-600 text-white font-extrabold' : 'text-content-muted'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* Dashboard Main Content Area (Renders based on activeTab) */}
        <main className="p-4 md:p-6 flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Top 4 KPI Cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="glass-card p-5 border border-hairline space-y-1">
                  <div className="text-micro text-content-muted font-bold uppercase tracking-wider">TODAY REVENUE</div>
                  <div className="text-2xl font-black font-display text-content">₹47,850</div>
                  <div className="text-micro text-success font-bold">+12.5% vs yesterday</div>
                </div>

                <div className="glass-card p-5 border border-hairline space-y-1">
                  <div className="text-micro text-content-muted font-bold uppercase tracking-wider">ACTIVE FLEET</div>
                  <div className="text-2xl font-black font-display text-success">2 <span className="text-sm font-normal text-content-muted">/ 2 Vehicles</span></div>
                  <div className="text-micro text-content-muted">6 Daily Schedules Running</div>
                </div>

                <div className="glass-card p-5 border border-hairline space-y-1">
                  <div className="text-micro text-content-muted font-bold uppercase tracking-wider">TODAY BOOKINGS</div>
                  <div className="text-2xl font-black font-display text-brand">67</div>
                  <div className="text-micro text-content-muted">Avg 4.8 seats/trip</div>
                </div>

                <div className="glass-card p-5 border border-hairline space-y-1">
                  <div className="text-micro text-content-muted font-bold uppercase tracking-wider">B2B PARCELS</div>
                  <div className="text-2xl font-black font-display text-warning">12</div>
                  <div className="text-micro text-content-muted">₹1,800 parcel revenue</div>
                </div>
              </div>

              {/* Live Fleet Map & Recent Bookings */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 glass-card p-5 space-y-4 border border-hairline">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-3">
                    <div>
                      <h3 className="font-extrabold text-base font-display">Unified Dual Live Telematics Control</h3>
                      <p className="text-xs text-content-muted">Real-time driver cab GPS + passenger phone GPS & next pickup target</p>
                    </div>
                    <span className="text-xs text-brand font-mono font-bold self-start sm:self-auto bg-emerald-500/20 text-success border border-emerald-500/30 px-2.5 py-1 rounded-full">
                      ● Live 2s Telematics Broker
                    </span>
                  </div>

                  {/* Unified Telematics Status Strip */}
                  <div className="bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>🚙 Cab MP09 AB 1001:</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">{vehicleLat.toFixed(4)}, {vehicleLng.toFixed(4)} (48 km/h)</span>
                      </div>
                      <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>📱 Passenger Mobile:</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">22.7499, 75.9047 (Accuracy ±12m)</span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-black/70 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-left sm:text-right shrink-0">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">NEXT DOORSTEP PICKUP</div>
                      <div className="font-extrabold text-emerald-700 dark:text-emerald-400 text-xs">House 14, Anand Nagar, Dhar</div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400">ETA: <strong className="text-orange-600 font-extrabold">6 Mins</strong> (2.4 km away)</div>
                    </div>
                  </div>

                  <div className="h-[340px] rounded-2xl overflow-hidden border border-hairline">
                    <LiveMap centerLat={vehicleLat} centerLng={vehicleLng} zoom={11} vehicleLat={vehicleLat} vehicleLng={vehicleLng} />
                  </div>
                </div>

                <div className="glass-card p-5 space-y-4 border border-hairline">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-base font-display">Recent Bookings</h3>
                    <span className="text-xs text-content-muted">Realtime</span>
                  </div>

                  <div className="space-y-3">
                    {bookings.slice(0, 3).map(b => (
                      <div key={b.code} className="flex justify-between items-center gap-3 p-3 bg-surface-2 border border-hairline rounded-xl text-xs">
                        <div className="min-w-0">
                          <div className="font-bold text-brand font-mono">{b.code}</div>
                          <div className="text-content-secondary font-semibold mt-0.5 truncate">{b.passenger}</div>
                          <div className="text-micro text-content-muted truncate">{b.route}</div>
                        </div>
                        <div className="shrink-0 font-extrabold text-success font-display whitespace-nowrap">{b.fare}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FLEET MAP */}
          {activeTab === 'fleet' && (
            <div className="glass-card p-6 space-y-4 border border-hairline animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-extrabold font-display">Full Fleet Telematics Tracking</h3>
                  <p className="text-xs text-content-muted">Live GPS telemetry for 2 Maruti Ertigas on Dhar ↔ Indore Route</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-emerald-500/20 text-success border border-emerald-500/40 text-xs px-3 py-1 rounded-full font-bold">
                    MP09 AB 1001 (Active)
                  </span>
                  <span className="bg-emerald-500/20 text-success border border-emerald-500/40 text-xs px-3 py-1 rounded-full font-bold">
                    MP09 AB 1002 (Active)
                  </span>
                </div>
              </div>
              <div className="h-[550px] rounded-3xl overflow-hidden border border-hairline">
                <LiveMap centerLat={vehicleLat} centerLng={vehicleLng} zoom={11} vehicleLat={vehicleLat} vehicleLng={vehicleLng} />
              </div>
            </div>
          )}

          {/* TAB 3: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="glass-card p-6 space-y-4 border border-hairline animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h3 className="text-lg font-extrabold font-display">Passenger & B2B Cargo Bookings</h3>
                <input
                  type="text"
                  placeholder="Search code, passenger name, phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-surface-2 border border-hairline px-4 py-2 rounded-xl text-xs text-content focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-2 text-content-muted uppercase font-bold border-b border-hairline">
                    <tr>
                      <th className="p-3">Booking Code</th>
                      <th className="p-3">Passenger / B2B Cargo</th>
                      <th className="p-3">Route</th>
                      <th className="p-3">Seat / Cargo Slot</th>
                      <th className="p-3">Fare Amount</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {bookings
                      .filter(b => b.passenger.toLowerCase().includes(searchQuery.toLowerCase()) || b.code.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(b => (
                        <tr key={b.code} className="hover:bg-surface-2">
                          <td className="p-3 font-mono font-bold text-brand">{b.code}</td>
                          <td className="p-3 font-semibold text-content">{b.passenger} <span className="text-micro text-content-muted block">{b.phone}</span></td>
                          <td className="p-3 text-content-secondary">{b.route}</td>
                          <td className="p-3 font-mono text-info">{b.seat}</td>
                          <td className="p-3 font-extrabold text-success font-display">{b.fare}</td>
                          <td className="p-3 text-right">
                            <span className="bg-emerald-500/20 text-success border border-emerald-500/40 text-micro px-2.5 py-1 rounded-full font-bold">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TODAY TRIPS */}
          {activeTab === 'trips' && (
            <div className="glass-card p-6 space-y-4 border border-hairline animate-fadeIn">
              <h3 className="text-lg font-extrabold font-display">6 Daily Maruti Ertiga Schedules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DAILY_SCHEDULE_SLOTS.map(slot => (
                  <div key={slot.id} className="bg-surface-2 border border-hairline p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-extrabold text-brand font-mono">{slot.time}</span>
                      <span className="bg-emerald-500/20 text-success text-xs px-2.5 py-0.5 rounded-full font-bold">
                        {slot.seatsLeft} Seats Available
                      </span>
                    </div>
                    <div className="text-xs font-bold text-content">{slot.route}</div>
                    <div className="text-micro text-content-muted">Assigned Ertiga: {slot.ertiga}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ROUTES & PRICING */}
          {activeTab === 'routes' && (
            <div className="glass-card p-6 space-y-4 border border-hairline animate-fadeIn">
              <h3 className="text-lg font-extrabold font-display">Dynamic Route Pricing & Monthly Passes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(ROUTES_CONFIG).map(r => (
                  <div key={r.id} className="bg-surface-2 border border-hairline p-5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-extrabold text-base text-content">{r.fromCity} ↔ {r.toCity}</h4>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${r.status === 'active' ? 'bg-emerald-500/20 text-success border border-emerald-500/40' : 'bg-amber-500/20 text-warning border border-amber-500/40'}`}>
                        {r.status === 'active' ? 'Active Route' : 'Expanding Q4'}
                      </span>
                    </div>
                    <div className="text-xs text-content-secondary">Distance: {r.distanceKm} km • Avg Time: {r.durationMins} mins</div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-hairline text-xs">
                      <div>Single Fare: <strong className="text-success font-display text-sm block">₹{r.fareRegular}</strong></div>
                      <div>50-Ride Pass: <strong className="text-warning font-display text-sm block">{r.passOfferPrice ? `₹${r.passOfferPrice}` : 'N/A'}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: DRIVERS */}
          {activeTab === 'drivers' && (
            <div className="glass-card p-6 space-y-4 border border-hairline animate-fadeIn">
              <h3 className="text-lg font-extrabold font-display">Active Pilots Directory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-2 border border-hairline p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-700 font-bold flex items-center justify-center text-white text-lg">R</div>
                      <div>
                        <h4 className="font-extrabold text-sm text-content">Rajesh Sharma</h4>
                        <div className="text-micro text-info font-mono">MP09 AB 1001 • Ertiga ZXI</div>
                      </div>
                    </div>
                    <span className="text-warning text-xs font-bold">4.9 ★</span>
                  </div>
                  <div className="pt-2 flex justify-between items-center text-xs text-content-muted">
                    <span>Status: <strong className="text-success">ON DUTY</strong></span>
                    <a href="tel:+919826012345" className="btn-primary py-1 px-3 text-micro font-bold">Call Pilot</a>
                  </div>
                </div>

                <div className="bg-surface-2 border border-hairline p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-600 font-bold flex items-center justify-center text-white text-lg">V</div>
                      <div>
                        <h4 className="font-extrabold text-sm text-content">Vikram Singh</h4>
                        <div className="text-micro text-accent font-mono">MP09 AB 1002 • Ertiga ZXI</div>
                      </div>
                    </div>
                    <span className="text-warning text-xs font-bold">4.8 ★</span>
                  </div>
                  <div className="pt-2 flex justify-between items-center text-xs text-content-muted">
                    <span>Status: <strong className="text-success">ON DUTY</strong></span>
                    <a href="tel:+919826023456" className="btn-primary py-1 px-3 text-micro font-bold">Call Pilot</a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: REVENUE */}
          {activeTab === 'revenue' && (
            <div className="glass-card p-6 space-y-4 border border-hairline animate-fadeIn">
              <h3 className="text-lg font-extrabold font-display">Revenue Analytics & Pass Subscription Model</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface-2 border border-hairline p-4 rounded-2xl">
                  <div className="text-xs text-content-muted uppercase font-bold">Monthly Recurring Passes</div>
                  <div className="text-2xl font-black font-display text-success mt-1">₹1,50,000</div>
                  <div className="text-micro text-content-muted">15 Active Passes (50 Rides)</div>
                </div>

                <div className="bg-surface-2 border border-hairline p-4 rounded-2xl">
                  <div className="text-xs text-content-muted uppercase font-bold">B2B Express Cargo Revenue</div>
                  <div className="text-2xl font-black font-display text-warning mt-1">₹54,000</div>
                  <div className="text-micro text-content-muted">270 Cargo Parcels Transported</div>
                </div>

                <div className="bg-surface-2 border border-emerald-500/40 p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/20">
                  <div className="text-xs text-success uppercase font-bold">Net EBITDA Margin</div>
                  <div className="text-2xl font-black font-display text-success mt-1">50.0%</div>
                  <div className="text-micro text-success">₹75,000 Net / Vehicle / Month</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: LAUNCH SURVEY RESPONSES */}
          {activeTab === 'survey' && (
            <SurveyAdminDashboard />
          )}
        </main>

      </div>

    </div>
  );
}
