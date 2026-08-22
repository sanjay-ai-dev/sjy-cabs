'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function InvestorPitchDeckPage() {
  const [activeTab, setActiveTab] = useState<'deck' | 'economics' | 'tech' | 'roadmap'>('deck');
  const [fleetSize, setFleetSize] = useState(14); // Default Q4 2026 fleet

  // Unit Economics Model (Per Vehicle Per Month)
  const singleVehiclePassRevenue = 50 * 200; // 50 pass rides equivalent @ ₹200 net avg = ₹1,00,000
  const singleVehicleParcelRevenue = 250 * 200; // 250 parcels per month @ ₹200 = ₹50,000
  const singleVehicleTotalRevenue = singleVehiclePassRevenue + singleVehicleParcelRevenue; // ₹1,50,000 / mo
  const singleVehicleOpex = 75000; // Driver salary (₹25k) + Fuel (₹35k) + Toll & Maintenance (₹15k)
  const singleVehicleEbitda = singleVehicleTotalRevenue - singleVehicleOpex; // ₹75,000 / mo (50% EBITDA)

  // Fleet Calculator Metrics
  const totalFleetRevenue = fleetSize * singleVehicleTotalRevenue;
  const totalFleetOpex = fleetSize * singleVehicleOpex;
  const totalFleetEbitda = fleetSize * singleVehicleEbitda;
  const arrRevenue = totalFleetRevenue * 12;
  const arrEbitda = totalFleetEbitda * 12;

  return (
    <div className="min-h-screen bg-canvas text-content flex flex-col font-sans">
      
      {/* Investor Navigation Header */}
      <header className="border-b border-hairline bg-surface-2 backdrop-blur-xl sticky top-0 z-50 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-extrabold text-xl tracking-tighter bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              SJY MOBILITY
            </Link>
            <span className="bg-amber-500/10 border border-amber-500/30 text-warning px-2.5 py-1 rounded-full text-xs font-bold">
              💼 INVESTOR MEMORANDUM & DPR
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <ThemeToggle />
            <Link href="/user" className="hidden sm:inline-block text-content-secondary hover:text-content font-semibold">
              Live Product Demo
            </Link>
            <a
              href="mailto:investors@sjymobility.co.in"
              className="btn-primary py-2 px-4 text-xs shadow-lg shadow-indigo-600/30"
            >
              Schedule Founder Call ➔
            </a>
          </div>
        </div>
      </header>

      {/* Main Pitch Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8">
        
        {/* Pitch Hero */}
        <div className="glass-card p-8 md:p-12 border-2 border-indigo-500/30 dark:bg-gradient-to-br dark:from-[#121424] dark:via-[#0b0c16] dark:to-[#150f24] relative overflow-hidden space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-brand uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              SERIES A FUNDING DECK • Q3 2026
            </span>
            <span className="text-xs font-extrabold text-success flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
              50% EBITDA Margin Asset-Light Model
            </span>
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight leading-tight">
              Disrupting India's <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-rose-400 bg-clip-text text-transparent">$30B Intercity Corridor Market</span>
            </h1>
            <p className="text-content-secondary text-sm md:text-base leading-relaxed">
              SJY Mobility operates a zero-asset, high-frequency intercity Ertiga shuttle network connecting India’s Tier-2 & 3 commuter corridors. Powered by 50-ride recurring subscriptions, door-to-door GPS dispatch, and B2B express cargo monetization.
            </p>
          </div>

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-hairline">
            <div>
              <div className="text-xs text-content-muted font-bold uppercase">Total Addressable Market</div>
              <div className="text-2xl font-black font-display text-content mt-1">$30 Billion</div>
              <div className="text-micro text-brand">Tier-2/3 Indian Regional Corridors</div>
            </div>
            <div>
              <div className="text-xs text-content-muted font-bold uppercase">Unit EBITDA Margin</div>
              <div className="text-2xl font-black font-display text-success mt-1">50.0%</div>
              <div className="text-micro text-success">₹75,000 Net Profit / Vehicle / Mo</div>
            </div>
            <div>
              <div className="text-xs text-content-muted font-bold uppercase">Current Active Fleet</div>
              <div className="text-2xl font-black font-display text-accent mt-1">2 Ertigas</div>
              <div className="text-micro text-accent">Indore ↔ Dhar Express Corridor</div>
            </div>
            <div>
              <div className="text-xs text-content-muted font-bold uppercase">Q4 2026 Target ARR</div>
              <div className="text-2xl font-black font-display text-warning mt-1">₹2.52 Cr</div>
              <div className="text-micro text-warning">14 Ertigas across Malwa Hub</div>
            </div>
          </div>
        </div>

        {/* Presentation Tabs */}
        <div className="flex gap-2 border-b border-hairline pb-2 overflow-x-auto scrollbar-none text-xs font-extrabold">
          {[
            { id: 'deck', label: '📊 Pitch Deck Summary' },
            { id: 'economics', label: '🧮 Dynamic DPR & Unit Economics' },
            { id: 'tech', label: '🛡️ Tech Moats & IP' },
            { id: 'roadmap', label: '🗺️ 100-Vehicle Expansion Roadmap' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-surface-2 text-content-muted hover:text-content'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: PITCH DECK SUMMARY */}
        {activeTab === 'deck' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 3 Pillar Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Problem */}
              <div className="glass-card p-6 space-y-3 border-l-4 border-l-rose-500">
                <div className="text-2xl">⚠️</div>
                <h3 className="text-lg font-extrabold font-display text-danger">The Problem</h3>
                <p className="text-xs text-content-secondary leading-relaxed">
                  Intercity daily commuters face fragmented, unsafe private buses with random timings, high single-ride pricing (₹350+), no fixed doorstep pick & drop, and zero safety guarantees for female daily commuters.
                </p>
              </div>

              {/* Solution */}
              <div className="glass-card p-6 space-y-3 border-l-4 border-l-emerald-500">
                <div className="text-2xl">⚡</div>
                <h3 className="text-lg font-extrabold font-display text-success">The Solution</h3>
                <p className="text-xs text-content-secondary leading-relaxed">
                  SJY Mobility offers scheduled, 6-seat Maruti Ertiga express shuttles with fixed daily doorstep pick & drop, ₹9,999 monthly commuter passes (50 rides @ ₹200), and Row 1 female priority seating.
                </p>
              </div>

              {/* Monitization */}
              <div className="glass-card p-6 space-y-3 border-l-4 border-l-indigo-500">
                <div className="text-2xl">💰</div>
                <h3 className="text-lg font-extrabold font-display text-brand">Dual Revenue Engine</h3>
                <p className="text-xs text-content-secondary leading-relaxed">
                  Every Ertiga shuttle generates recurring revenue from daily commuter passes (₹1,00,000/mo) AND high-margin B2B express cargo in the rear luggage bay (₹50,000/mo @ ₹200/slot with Aadhaar KYC).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DYNAMIC DPR & UNIT ECONOMICS */}
        {activeTab === 'economics' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-card p-6 border-2 border-indigo-500/40 space-y-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-hairline pb-4">
                <div>
                  <h3 className="text-xl font-extrabold font-display">Interactive DPR Financial Simulator</h3>
                  <p className="text-xs text-content-muted">Adjust the fleet size slider to calculate ARR, EBITDA, and net profit projections.</p>
                </div>
                
                {/* Fleet Size Slider */}
                <div className="bg-surface-2 p-4 rounded-2xl border border-hairline min-w-[280px]">
                  <div className="flex justify-between items-center text-xs font-bold mb-2">
                    <span>Fleet Size (Maruti Ertigas):</span>
                    <span className="text-brand font-mono text-base">{fleetSize} Vehicles</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="100"
                    step="1"
                    value={fleetSize}
                    onChange={e => setFleetSize(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-micro text-content-muted font-mono mt-1">
                    <span>2 (Current)</span>
                    <span>14 (Phase 2)</span>
                    <span>50</span>
                    <span>100 (Scale)</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Financial Projections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-surface-2 border border-hairline p-4 rounded-2xl">
                  <div className="text-xs text-content-muted font-bold uppercase">Monthly Gross Revenue</div>
                  <div className="text-2xl font-black font-display text-content mt-1">
                    ₹{(totalFleetRevenue / 100000).toFixed(2)} Lakhs
                  </div>
                  <div className="text-micro text-content-muted mt-1">Passes + B2B Cargo</div>
                </div>

                <div className="bg-surface-2 border border-hairline p-4 rounded-2xl">
                  <div className="text-xs text-content-muted font-bold uppercase">Monthly OPEX</div>
                  <div className="text-2xl font-black font-display text-danger mt-1">
                    ₹{(totalFleetOpex / 100000).toFixed(2)} Lakhs
                  </div>
                  <div className="text-micro text-content-muted mt-1">Driver + Fuel + Toll + Maint</div>
                </div>

                <div className="bg-surface-2 border border-emerald-500/40 p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/20">
                  <div className="text-xs text-success font-bold uppercase">Monthly Net EBITDA</div>
                  <div className="text-2xl font-black font-display text-success mt-1">
                    ₹{(totalFleetEbitda / 100000).toFixed(2)} Lakhs
                  </div>
                  <div className="text-micro text-success mt-1">50.0% EBITDA Margin</div>
                </div>

                <div className="bg-surface-2 border border-amber-500/40 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20">
                  <div className="text-xs text-warning font-bold uppercase">Annual Run Rate (ARR)</div>
                  <div className="text-2xl font-black font-display text-warning mt-1">
                    ₹{(arrRevenue / 10000000).toFixed(2)} Crores
                  </div>
                  <div className="text-micro text-warning">Annual Net: ₹{(arrEbitda / 10000000).toFixed(2)} Cr</div>
                </div>
              </div>

              {/* Single Vehicle DPR Breakdown Table */}
              <div className="space-y-3 pt-4 border-t border-hairline">
                <h4 className="text-sm font-extrabold font-display">Detailed Project Report (DPR) — 1 Ertiga Monthly Breakup</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-surface-2 text-content-muted uppercase font-bold border-b border-hairline">
                      <tr>
                        <th className="p-3">Category</th>
                        <th className="p-3">Monthly Volume</th>
                        <th className="p-3">Unit Price</th>
                        <th className="p-3 text-right">Monthly Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      <tr className="text-content">
                        <td className="p-3 font-semibold">Commuter Pass Revenue (Passengers)</td>
                        <td className="p-3">500 Passes (10 Ertiga Slots)</td>
                        <td className="p-3">₹200 / ride avg</td>
                        <td className="p-3 text-right font-bold text-success">+ ₹1,00,000</td>
                      </tr>
                      <tr className="text-content">
                        <td className="p-3 font-semibold">B2B Express Cargo (Rear Bay)</td>
                        <td className="p-3">250 Parcels / mo</td>
                        <td className="p-3">₹200 / slot</td>
                        <td className="p-3 text-right font-bold text-success">+ ₹50,000</td>
                      </tr>
                      <tr className="text-danger bg-rose-500/10 dark:bg-rose-950/10">
                        <td className="p-3 font-semibold">Driver Salary & Incentives</td>
                        <td className="p-3">1 Dedicated Pilot</td>
                        <td className="p-3">Fixed + Performance</td>
                        <td className="p-3 text-right font-bold text-danger">- ₹25,000</td>
                      </tr>
                      <tr className="text-danger bg-rose-500/10 dark:bg-rose-950/10">
                        <td className="p-3 font-semibold">Fuel Expenses (CNG / High Efficiency)</td>
                        <td className="p-3">~4,500 km / mo</td>
                        <td className="p-3">₹7.7 / km</td>
                        <td className="p-3 text-right font-bold text-danger">- ₹35,000</td>
                      </tr>
                      <tr className="text-danger bg-rose-500/10 dark:bg-rose-950/10">
                        <td className="p-3 font-semibold">Fastag Tolls, Insurance & Maintenance</td>
                        <td className="p-3">Monthly Amortization</td>
                        <td className="p-3">Fixed Allocation</td>
                        <td className="p-3 text-right font-bold text-danger">- ₹15,000</td>
                      </tr>
                      <tr className="bg-indigo-600/20 font-black text-sm text-content">
                        <td className="p-3" colSpan={3}>NET MONTHLY EBITDA (PER ERTIGA)</td>
                        <td className="p-3 text-right text-success">₹75,000 (50% Margin)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TECH MOATS */}
        {activeTab === 'tech' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            <div className="glass-card p-6 space-y-3">
              <div className="text-2xl">🛰️</div>
              <h3 className="text-lg font-extrabold font-display text-brand">AIS-140 Hardware Telematics Integration</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Full compliance with Indian AIS-140 government telematics standard. Native TCP socket server parses live NMEA GPS coordinates, speed, ignition status, and emergency SOS panic alerts with zero third-party API dependencies.
              </p>
            </div>

            <div className="glass-card p-6 space-y-3">
              <div className="text-2xl">♀</div>
              <h3 className="text-lg font-extrabold font-display text-danger">Female Commuter Priority Lock-in</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Dedicated Row 1 Seat 1A lock-in for female commuters creates an unbreakable user loyalty moat, driving high retention and organic referral loops among daily women commuters in Malwa.
              </p>
            </div>

            <div className="glass-card p-6 space-y-3">
              <div className="text-2xl">🛡️</div>
              <h3 className="text-lg font-extrabold font-display text-warning">Aadhaar KYC B2B Cargo Verification</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Mandatory 12-digit Aadhaar verification for cargo senders eliminates regulatory risks and illegal contraband transport under MP Motor Rules while unlocking ₹200 high-margin parcel monetization.
              </p>
            </div>

            <div className="glass-card p-6 space-y-3">
              <div className="text-2xl">⚡</div>
              <h3 className="text-lg font-extrabold font-display text-info">Asset-Light Driver Operator Model</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Zero vehicle capex on balance sheet. Vehicle partners bring Maruti Ertigas, while SJY Mobility provides the intelligent dispatch engine, pass subscription platform, and passenger demand routing.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: ROADMAP */}
        {activeTab === 'roadmap' && (
          <div className="glass-card p-6 space-y-6 animate-fadeIn">
            <h3 className="text-xl font-extrabold font-display">Malwa Corridor Scale Roadmap</h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-500/10 dark:bg-indigo-950/30 border border-indigo-500/40 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  Q3
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-brand">Phase 1: Dhar ↔ Indore Corridor (Current • 2 Ertigas)</h4>
                  <p className="text-xs text-content-secondary mt-1">6 daily schedules running. 50-ride pass launched @ ₹9,999. Monthly EBITDA: ₹1.5 Lakhs.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-500/10 dark:bg-purple-950/30 border border-purple-500/40 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  Q4
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-accent">Phase 2: Ujjain & Dewas Tri-Corridor Launch (14 Ertigas)</h4>
                  <p className="text-xs text-content-secondary mt-1">Connecting Ujjain Mahakal & Dewas Tekri industrial hubs. Target ARR: ₹2.52 Crores • Net Monthly EBITDA: ₹10.5 Lakhs.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/40 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  2027
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-success">Phase 3: State-Wide MP Corridor Expansion (100 Ertigas)</h4>
                  <p className="text-xs text-content-secondary mt-1">Expansion to Bhopal, Gwalior, Jabalpur, Sagar, and Pithampur. Projected ARR: ₹18.0 Crores • EBITDA: ₹9.0 Crores.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
