'use client';

import React, { useState, useEffect } from 'react';
import { ROUTES_CONFIG, DAILY_SCHEDULE_SLOTS } from '@/lib/routes-config';
import { WhatsAppModal } from '@/components/whatsapp-modal';
import { LiveMap } from '@/components/live-map';
import { UberLocationPicker } from '@/components/uber-location-picker';
import { CorridorExpansionRadar } from '@/components/corridor-expansion-radar';
import { SjyCabsLogo } from '@/components/logo';
import { AppLoader } from '@/components/app-loader';
import { UberRideAnimation } from '@/components/uber-ride-animation';
import { GuidedBookingWizard } from '@/components/guided-booking-wizard';
import { MonthlyPassDashboard } from '@/components/monthly-pass-dashboard';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast } from '@/components/toast-provider';
import { Modal } from '@/components/modal';

export default function UserPortalPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'book' | 'parcel' | 'trips' | 'track' | 'pass' | 'profile'>('book');
  const [personaMode, setPersonaMode] = useState<'regular' | 'monthly_pass'>('regular');
  
  // Booking Form State
  const [fromCity, setFromCity] = useState('Dhar');
  const [toCity, setToCity] = useState('Indore');
  const [selectedTime, setSelectedTime] = useState('08:00 AM');
  const [seats, setSeats] = useState(1);
  const [isLadiesPriority, setIsLadiesPriority] = useState(false);
  const [pickupLandmark, setPickupLandmark] = useState('Dhar Bus Stand');
  const [dropLandmark, setDropLandmark] = useState('Rajwada, Indore');
  const [isPassApplied, setIsPassApplied] = useState(false);

  // Parcel Booking Form State (B2B Cargo + Aadhaar KYC)
  const [parcelSenderName, setParcelSenderName] = useState('Gupta Traders');
  const [parcelSenderPhone, setParcelSenderPhone] = useState('9826012345');
  const [parcelSenderAadhaar, setParcelSenderAadhaar] = useState('9876 5432 1098');
  const [parcelReceiverName, setParcelReceiverName] = useState('Kumar Electronics');
  const [parcelReceiverPhone, setParcelReceiverPhone] = useState('9826098765');
  const [parcelWeight, setParcelWeight] = useState(1.5);
  const [parcelCategory, setParcelCategory] = useState('Electronics & Spare Parts');
  const [parcelPickupAddress, setParcelPickupAddress] = useState('Shop 12, Dhar Main Market');
  const [parcelDropAddress, setParcelDropAddress] = useState('Shop 4, Sarafa Bazaar, Indore');
  const [parcelLegalDeclaration, setParcelLegalDeclaration] = useState(true);

  // Modals & Drawers
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [userSosSent, setUserSosSent] = useState(false);
  const [latestBookingCode, setLatestBookingCode] = useState('');

  const handleTriggerUserSos = () => {
    setUserSosSent(true);
    if (typeof window !== 'undefined') {
      const channel = new BroadcastChannel('sjy_cabs_telematics');
      channel.postMessage({
        type: 'AIS140_PANIC_ALERT',
        payload: {
          vehicleId: 'MP09 AB 1001',
          driverName: 'Rajesh Sharma',
          driverPhone: '+91 98260 12345',
          location: 'Dhar ↔ Indore Shuttle (Lat: 22.6500, Lng: 75.5500)',
          timestamp: new Date().toLocaleTimeString()
        }
      });
      localStorage.setItem('sjy_cabs_panic', 'true');
    }
  };

  // Auto-Stream Passenger Mobile HTML5 GPS to Unified Telematics Broker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          fetch('/api/telematics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: 'user',
              passengerName: 'Anand Thakur',
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            })
          }).catch(() => {});
        },
        () => {},
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Sample Trips State
  const [upcomingTrips, setUpcomingTrips] = useState([
    {
      code: 'BK-A3F7K2',
      route: 'Dhar ➔ Indore',
      time: 'Tomorrow • 08:00 AM',
      seats: 1,
      isLadies: true,
      fare: 250,
      pickup: 'Dhar Bus Stand',
      drop: 'Rajwada, Indore',
      driver: 'Rajesh Sharma (4.9 ★)',
      vehicle: 'MP09 AB 1001'
    }
  ]);

  const basePrice = 250;
  const totalFare = isPassApplied ? 0 : seats * basePrice;

  return (
    <div className="min-h-screen bg-canvas flex justify-center py-0 md:py-6">
      <AppLoader title="DailyCab User Portal" />
      {/* Mobile Frame Container */}
      <div className="w-full max-w-[430px] min-h-screen md:min-h-[860px] md:h-[860px] bg-canvas md:border md:border-hairline md:rounded-[40px] flex flex-col relative overflow-hidden shadow-2xl">
        
        {/* Header. Kept to three controls: at 430px the previous four wrapped
            the logo onto three lines and clipped the "Pass Active" pill. */}
        <header className="flex items-center justify-between gap-2 border-b border-hairline bg-surface px-4 py-3">
          <SjyCabsLogo size="sm" showSubtitle={false} />

          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle />

            {/* Profile avatar */}
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              aria-label="Your profile — Priya Sharma, Gold pass holder"
              aria-current={activeTab === 'profile' ? 'page' : undefined}
              className={`min-h-tap min-w-tap grid place-items-center rounded-full transition-all ${
                activeTab === 'profile' ? 'ring-2 ring-brand ring-offset-2 ring-offset-surface' : ''
              }`}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-xs font-bold text-white">
                P
              </span>
            </button>
          </div>
        </header>

        {/* Main Content View */}
        <main className="flex-1 overflow-y-auto p-5 pb-32 scrollbar-none space-y-6">
          
          {/* TAB 1: BOOKING & PASS MODES */}
          {activeTab === 'book' && personaMode === 'regular' && (
            <GuidedBookingWizard
              fromCity={fromCity}
              toCity={toCity}
              onOpenMonthlyPass={() => setPersonaMode('monthly_pass')}
              onBookingComplete={(details) => {
                setLatestBookingCode(details.bookingCode);
                setShowConfirmationModal(true);
              }}
            />
          )}

          {activeTab === 'book' && personaMode === 'monthly_pass' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <span>💳</span> Daily Pass Subscriber Dashboard
                </span>
                <button
                  onClick={() => setPersonaMode('regular')}
                  className="text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:underline"
                >
                  ← Back to Single Booking
                </button>
              </div>
              <MonthlyPassDashboard
                onTrackShuttle={() => setActiveTab('track')}
              />
            </div>
          )}

          {/* TAB: B2B PARCEL COURIER (Aadhaar KYC & Legal Compliance) */}
          {activeTab === 'parcel' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-extrabold font-display">B2B Parcel Express</h2>
                  <p className="text-xs text-content-muted">1×1 ft Cargo Bay (Max 6 Parcels / Ertiga Trip)</p>
                </div>
                <span className="bg-amber-500/15 border border-amber-500/30 text-warning text-micro font-extrabold px-2.5 py-1 rounded-full">
                  🛡️ Aadhaar KYC Required
                </span>
              </div>

              {/* Route & Schedule */}
              <div className="glass-card p-4 space-y-3 border-l-4 border-l-purple-500">
                <div className="text-xs font-bold text-content-muted uppercase">Route Corridor</div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>{fromCity} ➔ {toCity}</span>
                  <span className="text-accent font-mono">Tomorrow • {selectedTime}</span>
                </div>
              </div>

              {/* Sender & Aadhaar KYC Card */}
              <div className="glass-card p-4 space-y-3 border-2 border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-warning uppercase tracking-wider flex items-center gap-1">
                    👤 Sender Details & Aadhaar KYC
                  </span>
                  <span className="text-micro text-success font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                    Verified ID
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-micro text-content-muted font-bold uppercase block mb-1">Sender Name</label>
                    <input
                      type="text"
                      value={parcelSenderName}
                      onChange={e => setParcelSenderName(e.target.value)}
                      className="w-full bg-surface-2 border border-hairline rounded-xl py-2 px-3 text-xs font-semibold text-content outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-micro text-content-muted font-bold uppercase block mb-1">Sender Phone</label>
                    <input
                      type="text"
                      value={parcelSenderPhone}
                      onChange={e => setParcelSenderPhone(e.target.value)}
                      className="w-full bg-surface-2 border border-hairline rounded-xl py-2 px-3 text-xs font-semibold text-content outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-micro text-warning font-extrabold uppercase block mb-1 flex items-center gap-1">
                    <span>🪪</span> Sender 12-Digit Aadhaar Number (Mandatory Legal Compliance)
                  </label>
                  <input
                    type="text"
                    value={parcelSenderAadhaar}
                    onChange={e => setParcelSenderAadhaar(e.target.value)}
                    maxLength={14}
                    className="w-full bg-surface-2 border border-amber-500/50 rounded-xl py-2.5 px-3 text-xs font-mono font-bold text-warning outline-none focus:border-amber-400 tracking-widest"
                    placeholder="XXXX XXXX XXXX"
                  />
                  <div className="text-micro text-content-muted mt-1">
                    🔒 Aadhaar verified to prevent transport of contraband or illegal items under MP Motor Rules.
                  </div>
                </div>
              </div>

              {/* Receiver Card */}
              <div className="glass-card p-4 space-y-3">
                <span className="text-xs font-extrabold text-info uppercase tracking-wider block">
                  🏢 Receiver Details
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-micro text-content-muted font-bold uppercase block mb-1">Receiver Name</label>
                    <input
                      type="text"
                      value={parcelReceiverName}
                      onChange={e => setParcelReceiverName(e.target.value)}
                      className="w-full bg-surface-2 border border-hairline rounded-xl py-2 px-3 text-xs font-semibold text-content outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-micro text-content-muted font-bold uppercase block mb-1">Receiver Phone</label>
                    <input
                      type="text"
                      value={parcelReceiverPhone}
                      onChange={e => setParcelReceiverPhone(e.target.value)}
                      className="w-full bg-surface-2 border border-hairline rounded-xl py-2 px-3 text-xs font-semibold text-content outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* Shipment Specs */}
              <div className="glass-card p-4 space-y-3">
                <span className="text-xs font-extrabold text-accent uppercase tracking-wider block">
                  📦 Shipment Specifications
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-micro text-content-muted font-bold uppercase block mb-1">Category</label>
                    <select
                      value={parcelCategory}
                      onChange={e => setParcelCategory(e.target.value)}
                      className="w-full bg-surface-2 border border-hairline rounded-xl py-2 px-2.5 text-xs font-semibold text-content outline-none"
                    >
                      <option>Electronics & Spare Parts</option>
                      <option>Documents & Contracts</option>
                      <option>Apparel & Textiles</option>
                      <option>Auto Components</option>
                      <option>General Non-Perishable Cargo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-micro text-content-muted font-bold uppercase block mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={parcelWeight}
                      onChange={e => setParcelWeight(parseFloat(e.target.value) || 1.0)}
                      className="w-full bg-surface-2 border border-hairline rounded-xl py-2 px-3 text-xs font-semibold text-content outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-hairline">
                  <div>
                    <label className="text-micro text-content-muted font-bold uppercase block mb-1">Pickup Doorstep Shop / Landmark</label>
                    <input
                      type="text"
                      value={parcelPickupAddress}
                      onChange={e => setParcelPickupAddress(e.target.value)}
                      className="w-full bg-surface-2 border border-hairline rounded-xl py-2 px-3 text-xs font-semibold text-content outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-micro text-content-muted font-bold uppercase block mb-1">Drop Doorstep Shop / Landmark</label>
                    <input
                      type="text"
                      value={parcelDropAddress}
                      onChange={e => setParcelDropAddress(e.target.value)}
                      className="w-full bg-surface-2 border border-hairline rounded-xl py-2 px-3 text-xs font-semibold text-content outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Mandatory Legal Declaration */}
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="parcel-dec"
                    checked={parcelLegalDeclaration}
                    onChange={e => setParcelLegalDeclaration(e.target.checked)}
                    className="w-5 h-5 accent-rose-500 rounded cursor-pointer mt-0.5"
                  />
                  <label htmlFor="parcel-dec" className="text-xs font-bold text-danger leading-relaxed cursor-pointer">
                    <strong className="text-danger">Mandatory Compliance Declaration:</strong> I hereby confirm that this shipment contains NO illegal goods, contraband, hazardous chemicals, or prohibited items under MP Motor Rules & Indian Laws. Sender Aadhaar is verified.
                  </label>
                </div>
              </div>

              {/* Fare & CTA */}
              <div className="glass-card p-4 flex justify-between items-center">
                <div>
                  <div className="text-xs text-content-secondary font-bold">Flat Express Parcel Rate</div>
                  <div className="text-2xl font-black text-accent">₹200 <span className="text-xs font-semibold text-content-secondary">/ 1×1 ft slot</span></div>
                </div>
                <button
                  onClick={() => {
                    if (!parcelSenderAadhaar || parcelSenderAadhaar.replace(/\s/g, '').length < 12) {
                      toast({
                        tone: 'warning',
                        title: 'Aadhaar number incomplete',
                        detail:
                          'Enter all 12 digits — KYC is mandatory for cargo senders.',
                      });
                      return;
                    }
                    const parcelCode = 'PCL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                    toast({
                      tone: 'success',
                      title: `Parcel booked — ${parcelCode}`,
                      detail: `${parcelSenderName} ➔ ${parcelReceiverName}\n${fromCity} ➔ ${toCity} • ₹200\nManifest sent to MP09 AB 1001.`,
                    });
                  }}
                  className="btn-primary py-3 px-6 text-sm bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  Book Express Parcel (₹200)
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TRIPS */}
          {activeTab === 'trips' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-extrabold font-display">My Upcoming Trips</h2>

              <div className="space-y-4">
                {upcomingTrips.map((trip) => (
                  <div key={trip.code} className="glass-card p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-hairline pb-3">
                      <div>
                        <div className="font-extrabold font-mono text-brand">{trip.code}</div>
                        <div className="text-xs text-content-muted mt-0.5">{trip.time}</div>
                      </div>
                      <span className="bg-emerald-500/15 text-success border border-emerald-500/30 px-2.5 py-1 rounded-xl text-xs font-bold">
                        CONFIRMED
                      </span>
                    </div>

                    <div className="text-lg font-bold font-display">{trip.route}</div>
                    <div className="text-xs text-content-secondary">
                      💺 {trip.seats} Seat(s) {trip.isLadies && '(♀ Ladies Priority)'} • 💰 ₹{trip.fare}
                    </div>

                    <div className="bg-surface-2 p-3 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold">{trip.driver}</div>
                        <div className="text-content-muted text-micro">{trip.vehicle}</div>
                      </div>
                      <a href="tel:919876540001" aria-label={`Call driver ${trip.driver}`}
                        className="min-h-tap min-w-tap grid shrink-0 place-items-center rounded-full border border-emerald-500/40 bg-emerald-500/20 text-success">
                        📞
                      </a>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setActiveTab('track')}
                        className="min-h-tap flex-1 rounded-xl border border-indigo-500/40 bg-indigo-500/15 text-xs font-bold text-brand"
                      >
                        Track Live
                      </button>
                      <button
                        onClick={() => {
                          toast({
                            tone: 'info',
                            title: `Booking ${trip.code} cancelled`,
                            detail: 'Any amount paid is refunded to source in 3–5 days.',
                          });
                          setUpcomingTrips(prev => prev.filter(t => t.code !== trip.code));
                        }}
                        className="min-h-tap flex-1 rounded-xl border border-hairline bg-surface-2 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TRACK */}
          {activeTab === 'track' && (
            <UberRideAnimation
              bookingCode={latestBookingCode || 'BK-IND-9921'}
              fromCity={fromCity}
              toCity={toCity}
              pickupAddress={pickupLandmark}
              dropAddress={dropLandmark}
              seats={seats}
              totalFare={totalFare}
              onTriggerSos={() => setShowSosModal(true)}
            />
          )}

          {/* TAB 4: PASS */}
          {activeTab === 'pass' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-extrabold font-display">Daily Commuter Passes</h2>

                {/* Pass Hero Offer Card */}
                <div className="glass-card p-6 border-2 border-indigo-500/50 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 dark:from-indigo-900/40 dark:to-purple-900/25 relative overflow-hidden space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-brand text-xs font-extrabold tracking-widest uppercase">
                      🔥 FLAT LAUNCH OFFER
                    </span>
                    <span className="bg-rose-600 text-white text-micro font-extrabold px-2.5 py-0.5 rounded-full">
                      SAVE ₹8,001
                    </span>
                  </div>

                  <div>
                    <div className="text-2xl font-extrabold font-display">Fixed Pickup & Drop Pass</div>
                    <div className="text-xs text-brand font-semibold mt-0.5">Indore ↔ Dhar (50 Rides Included • Priority Seating)</div>
                  </div>

                  <div className="bg-surface-2 border border-hairline rounded-2xl p-4">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-3xl font-extrabold font-display text-success">₹9,999</span>
                      <span className="line-through text-content-muted font-semibold text-lg">₹18,000</span>
                      <span className="text-xs text-brand font-semibold">/ 50 Rides</span>
                    </div>
                    <p className="text-xs text-content-muted">
                      ⚡ <strong>Only ₹200 / Ride</strong> (vs ₹350 regular fare). Automatic daily doorstep pickup & drop priority!
                    </p>
                  </div>

                  {/* Fixed Daily Address Preference Box */}
                  <div className="bg-surface-2 border border-hairline rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-warning uppercase tracking-wider flex items-center gap-1">
                        🏠 Fixed Daily Doorstep Addresses
                      </span>
                      <span className="text-micro text-success font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                        Saved for 50 Rides
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-micro text-content-muted font-bold uppercase block mb-1">Fixed Morning Home Pickup</label>
                        <input
                          type="text"
                          defaultValue="House 14, Anand Nagar, Dhar (Near Bus Stand)"
                          className="w-full bg-surface-2 border border-hairline rounded-xl py-2 px-3 text-xs font-semibold text-content outline-none focus:border-amber-400"
                          placeholder="Home House No, Building, Street, Dhar"
                        />
                      </div>
                      <div>
                        <label className="text-micro text-content-muted font-bold uppercase block mb-1">Fixed Evening Office Drop</label>
                        <input
                          type="text"
                          defaultValue="Building 4, C21 Mall / Vijay Nagar, Indore"
                          className="w-full bg-surface-2 border border-hairline rounded-xl py-2 px-3 text-xs font-semibold text-content outline-none focus:border-amber-400"
                          placeholder="Office Building, Floor, Area, Indore"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      toast({
                        tone: 'info',
                        title: 'Continue to UPI payment — ₹9,999',
                        detail:
                          'Indore ↔ Dhar • 50 rides • fixed doorstep pickup and office drop.',
                      })
                    }
                    className="btn-primary w-full text-sm shadow-lg shadow-indigo-600/40"
                  >
                    BUY PASS NOW FOR ₹9,999
                  </button>
                </div>
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 text-center animate-fadeIn py-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-3xl font-bold flex items-center justify-center mx-auto shadow-xl">
                P
              </div>
              <div>
                <h2 className="text-2xl font-extrabold font-display">Priya Sharma</h2>
                <div className="inline-block bg-amber-500/15 border border-amber-500/30 text-warning px-3 py-1 rounded-full text-xs font-semibold mt-1">
                  Gold Commuter Pass Holder
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="glass-card p-3">
                  <div className="text-xl font-bold text-info">34</div>
                  <div className="text-micro text-content-muted">Total Rides</div>
                </div>
                <div className="glass-card p-3">
                  <div className="text-xl font-bold text-info">₹4.8k</div>
                  <div className="text-micro text-content-muted">Saved</div>
                </div>
                <div className="glass-card p-3">
                  <div className="text-xl font-bold text-info">120 kg</div>
                  <div className="text-micro text-content-muted">CO₂ Saved</div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Bottom nav. Five destinations, down from six: Profile now lives in
            the header avatar. Six 11px labels across 430px left every target
            under the 44px minimum and the labels barely readable. */}
        <nav
          aria-label="Primary"
          className="absolute inset-b-safe left-3 right-3 z-40 flex justify-between rounded-3xl border border-hairline bg-surface/90 p-1.5 shadow-lg backdrop-blur-2xl"
        >
          {[
            { id: 'book', icon: '🚗', label: 'Book' },
            { id: 'parcel', icon: '📦', label: 'Parcel' },
            { id: 'trips', icon: '🕒', label: 'Trips' },
            { id: 'track', icon: '📍', label: 'Track' },
            { id: 'pass', icon: '🎟️', label: 'Pass' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                // aria-current is how assistive tech learns which tab is open;
                // colour alone carried that signal before.
                aria-current={isActive ? 'page' : undefined}
                className={`min-h-tap flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 text-micro font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand/10 text-brand'
                    : 'text-content-muted hover:bg-surface-2 hover:text-content'
                }`}
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </div>

      {/* Confirmation WhatsApp Modal */}
      <WhatsAppModal
        isOpen={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
          setActiveTab('trips');
        }}
        bookingCode={latestBookingCode}
        fromCity={fromCity}
        toCity={toCity}
        selectedTime={selectedTime}
        seats={seats}
        isLadiesPriority={isLadiesPriority}
        totalFare={totalFare}
        pickupLandmark={pickupLandmark}
        dropLandmark={dropLandmark}
      />
      {/* Emergency SOS */}
      <Modal
        isOpen={showSosModal}
        onClose={() => setShowSosModal(false)}
        title="24×7 emergency SOS"
        subtitle="DailyCab passenger safety protocol"
        size="sm"
        className="border-2 border-rose-500"
      >
        {userSosSent ? (
          <div
            role="alert"
            className="space-y-2 rounded-2xl border border-rose-500 bg-rose-500/20 p-4 text-center"
          >
            <span aria-hidden="true" className="block text-3xl">🚨</span>
            <h3 className="text-sm font-extrabold text-content">
              SOS alert sent
            </h3>
            <p className="text-xs text-content-secondary">
              An AIS-140 emergency alert went to DailyCab Fleet Command and Police
              112 with your live GPS coordinates.
            </p>
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-content-secondary">
            If you feel unsafe or have an emergency inside the vehicle, this
            instantly alerts <strong className="text-content">DailyCab Fleet
            Command</strong> and <strong className="text-content">police
            services</strong> with your location.
          </p>
        )}

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleTriggerUserSos}
            className="flex min-h-tap w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-rose-600/40 transition-all hover:from-rose-700 hover:to-red-700"
          >
            <span aria-hidden="true">🚨</span> Dispatch SOS alert now
          </button>

          <a
            href="tel:112"
            className="flex min-h-tap w-full items-center justify-center gap-2 rounded-2xl border border-hairline bg-surface-2 px-4 py-3 text-xs font-bold text-content transition-colors hover:bg-surface-3"
          >
            <span aria-hidden="true">🚓</span> Call police emergency (112)
          </a>

          <a
            href="tel:+919826012345"
            className="flex min-h-tap w-full items-center justify-center gap-2 rounded-2xl border border-hairline bg-surface-2 px-4 py-3 text-xs font-bold text-brand transition-colors hover:bg-surface-3"
          >
            <span aria-hidden="true">📞</span> Call DailyCab helpline
          </a>
        </div>

        <div className="border-t border-hairline pt-2 text-center font-mono text-micro text-content-muted">
          Live GPS telematics compliant • MP-09 corridor
        </div>
      </Modal>

    </div>
  );
}
