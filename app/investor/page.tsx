'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SjyCabsLogo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Lock,
  ShieldCheck,
  TrendingUp,
  Users,
  Car,
  MapPin,
  Zap,
  Target,
  PieChart,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Building2,
  GraduationCap,
  Briefcase,
  Navigation,
  Phone,
  Mail,
  Globe,
  IndianRupee,
  Calendar,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';

const PASSCODE = 'DailyCabs@3008';

/* ════════════════════════════════════════════════════════════════════════════
   FINANCIAL MODEL CONSTANTS (Conservative — 30 pax/city, 15-cab fleet)
   ════════════════════════════════════════════════════════════════════════════ */
const VEHICLE_COST = 950000;           // Ertiga CNG ex-showroom + reg
const VEHICLES_PER_CITY = 5;
const CITIES = 3;
const TOTAL_FLEET = VEHICLES_PER_CITY * CITIES; // 15
const FEMALE_VEHICLES_PER_CITY = 1;
const DEPRECIATION_RATE = 0.25;        // 25% per annum
const ROTATION_YEARS = 2;

// Per vehicle monthly (conservative: 30 pax/city ÷ 5 vehicles = 6 pax/vehicle)
const PER_VEH_PAX_REVENUE = 65000;     // 2 trips × 5 pax × 26 days × ₹250 avg
const PER_VEH_PARCEL_REVENUE = 15000;  // 100 parcels × ₹150
const PER_VEH_TOTAL_REVENUE = PER_VEH_PAX_REVENUE + PER_VEH_PARCEL_REVENUE; // ₹80,000
const PER_VEH_DRIVER = 20000;
const PER_VEH_FUEL = 8000;
const PER_VEH_TOLL = 4000;
const PER_VEH_INSURANCE = 2500;
const PER_VEH_MAINTENANCE = 3500;
const PER_VEH_EMI = 18000;
const PER_VEH_TOTAL_OPEX = PER_VEH_DRIVER + PER_VEH_FUEL + PER_VEH_TOLL + PER_VEH_INSURANCE + PER_VEH_MAINTENANCE + PER_VEH_EMI; // ₹56,000
const PER_VEH_NET = PER_VEH_TOTAL_REVENUE - PER_VEH_TOTAL_OPEX; // ₹24,000

const MONTHLY_MARKETING = 100000;
const MONTHLY_ADMIN = 50000;

// Seed funding breakdown
const SEED_VEHICLES = 6000000;
const SEED_TECH = 800000;
const SEED_MARKETING = 1200000;
const SEED_DRIVERS = 500000;
const SEED_WORKING_CAPITAL = 1500000;
const SEED_TOTAL = SEED_VEHICLES + SEED_TECH + SEED_MARKETING + SEED_DRIVERS + SEED_WORKING_CAPITAL; // ₹1 Cr

// Marketing channels
const MARKETING_CHANNELS = [
  { channel: 'WhatsApp Marketing & Community', monthly: 15000 },
  { channel: 'Local Newspaper & Auto Branding', monthly: 25000 },
  { channel: 'College/Office Pamphlet Distribution', monthly: 10000 },
  { channel: 'Google Ads (Local Search)', monthly: 20000 },
  { channel: 'Social Media (Instagram/Facebook)', monthly: 15000 },
  { channel: 'Referral Incentives (₹100/referral)', monthly: 15000 },
];

// Corridor data
const CORRIDORS = [
  { city: 'Dhar', distance: '62 km', cabs: 5, female: 1, pax: 30 },
  { city: 'Ujjain', distance: '55 km', cabs: 5, female: 1, pax: 30 },
  { city: 'Dewas', distance: '35 km', cabs: 5, female: 1, pax: 30 },
];

function formatINR(num: number): string {
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
}

type TabId = 'summary' | 'dpr' | 'funds' | 'marketing' | 'growth' | 'why' | 'team';

export default function InvestorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcodeError, setPasscodeError] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [fleetSize, setFleetSize] = useState(TOTAL_FLEET);

  // Dynamic fleet calculations
  const fleetRevenue = fleetSize * PER_VEH_TOTAL_REVENUE;
  const fleetOpex = fleetSize * PER_VEH_TOTAL_OPEX;
  const fleetEbitda = fleetRevenue - fleetOpex;
  const fleetNetMonthly = fleetEbitda - MONTHLY_MARKETING - MONTHLY_ADMIN;
  const annualRevenue = fleetRevenue * 12;
  const annualNet = fleetNetMonthly * 12;

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === PASSCODE) {
      setIsAuthenticated(true);
      setPasscodeError('');
    } else {
      setPasscodeError('Invalid passcode. Contact founder@dailycab.in for access.');
    }
  };

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'summary', label: 'Executive Summary', icon: '📊' },
    { id: 'dpr', label: 'Financial DPR', icon: '🧮' },
    { id: 'funds', label: 'Use of Funds', icon: '💰' },
    { id: 'marketing', label: 'Marketing Strategy', icon: '📣' },
    { id: 'growth', label: 'Growth & Scale', icon: '🚀' },
    { id: 'why', label: 'Why Invest', icon: '🎯' },
    { id: 'team', label: 'Team & Contact', icon: '👥' },
  ];

  /* ══════════════════════════════════════════════════════════════════════════
     PASSCODE GATE
     ══════════════════════════════════════════════════════════════════════════ */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-canvas text-content flex items-center justify-center p-4 font-sans">
        <div className="glass-card max-w-md w-full p-8 md:p-12 border border-hairline space-y-8 text-center shadow-2xl">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center">
              <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <SjyCabsLogo size="lg" />
            <div>
              <h1 className="text-2xl font-black font-display">Investor Access Portal</h1>
              <p className="text-xs text-content-secondary mt-2 leading-relaxed">
                This pitch deck and Detailed Project Report (DPR) is confidential.
                Enter the investor passcode to access the full funding memorandum.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => { setPasscode(e.target.value); setPasscodeError(''); }}
                placeholder="Enter Investor Passcode"
                className="w-full bg-surface-2 border border-hairline rounded-2xl px-4 py-3.5 pr-12 text-sm text-content text-center font-mono tracking-widest focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-content-muted hover:text-content"
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {passcodeError && (
              <div className="text-xs text-danger font-bold bg-rose-500/10 border border-rose-500/30 px-4 py-2.5 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {passcodeError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all text-sm flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Access Pitch Deck & DPR
            </button>
          </form>

          <div className="text-micro text-content-muted space-y-1 pt-2 border-t border-hairline">
            <p>Protected under NDA • DailyCabs Pvt Ltd</p>
            <p>Contact: <a href="mailto:founder@dailycab.in" className="text-brand underline">founder@dailycab.in</a> • +91-8109745019</p>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     MAIN INVESTOR DECK (Post-Authentication)
     ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-canvas text-content flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Navigation Header */}
      <header className="border-b border-hairline bg-surface-2 backdrop-blur-xl sticky top-0 z-50 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SjyCabsLogo size="md" />
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              CONFIDENTIAL INVESTOR MEMORANDUM
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <ThemeToggle />
            <Link href="/community" className="hidden sm:inline-block text-content-secondary hover:text-content font-semibold">
              Live Platform Demo
            </Link>
            <a
              href="mailto:founder@dailycab.in"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              Schedule Founder Call
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8">
        
        {/* Hero Card */}
        <div className="glass-card p-8 md:p-12 border-2 border-emerald-500/30 relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/5 via-transparent to-transparent rounded-full pointer-events-none" />
          
          <div className="flex flex-wrap justify-between items-center gap-4">
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              SEED FUNDING ROUND • 2026
            </span>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/30">
              <Target className="w-4 h-4" />
              Seeking ₹1.00 Crore Seed Capital
            </span>
          </div>

          <div className="space-y-3 max-w-3xl relative z-10">
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight leading-tight">
              India's First <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 dark:from-emerald-400 dark:via-teal-300 dark:to-indigo-300 bg-clip-text text-transparent">Female-Safe Intercity Daily Commuter Network</span>
            </h1>
            <p className="text-content-secondary text-sm md:text-base leading-relaxed">
              DailyCab operates scheduled, AC 6-seat Ertiga express shuttles connecting Tier-2 & 3 city commuters to Indore with fixed doorstep pickup, monthly subscription passes, and dedicated female-safe vehicles with women drivers.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-hairline">
            <div>
              <div className="text-micro text-content-muted font-bold uppercase">Seed Ask</div>
              <div className="text-2xl font-black font-display text-content mt-1">₹1.00 Cr</div>
              <div className="text-micro text-emerald-600 dark:text-emerald-400">15-Vehicle Fleet Launch</div>
            </div>
            <div>
              <div className="text-micro text-content-muted font-bold uppercase">Fleet</div>
              <div className="text-2xl font-black font-display text-content mt-1">15 Ertigas</div>
              <div className="text-micro text-emerald-600 dark:text-emerald-400">5 per city × 3 corridors</div>
            </div>
            <div>
              <div className="text-micro text-content-muted font-bold uppercase">Corridors</div>
              <div className="text-2xl font-black font-display text-content mt-1">3 Active</div>
              <div className="text-micro text-emerald-600 dark:text-emerald-400">Dhar • Ujjain • Dewas</div>
            </div>
            <div>
              <div className="text-micro text-content-muted font-bold uppercase">Target ARR</div>
              <div className="text-2xl font-black font-display text-success mt-1">₹1.44 Cr</div>
              <div className="text-micro text-success">Year 1 Revenue</div>
            </div>
            <div>
              <div className="text-micro text-content-muted font-bold uppercase">Net Profit</div>
              <div className="text-2xl font-black font-display text-amber-600 dark:text-amber-400 mt-1">₹25.2 L</div>
              <div className="text-micro text-amber-600 dark:text-amber-400">Year 1 (Pre-Tax)</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-hairline pb-2 overflow-x-auto scrollbar-none text-xs font-extrabold">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-surface-2 text-content-muted hover:text-content'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ═══════ TAB 1: EXECUTIVE SUMMARY ═══════ */}
        {activeTab === 'summary' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Problem → Solution → Market */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 space-y-3 border-l-4 border-l-rose-500">
                <div className="text-2xl">⚠️</div>
                <h3 className="text-lg font-extrabold font-display text-danger">The Problem</h3>
                <ul className="text-xs text-content-secondary leading-relaxed space-y-2">
                  <li>• 50L+ daily intercity commuters in MP face overcrowded buses with no guaranteed seating</li>
                  <li>• Single ride costs ₹350-500 via Ola/Uber outstation — unaffordable for daily use</li>
                  <li>• Zero dedicated female-safe transit options for daily women commuters</li>
                  <li>• No fixed schedules, no doorstep pickup, no subscription plans</li>
                </ul>
              </div>

              <div className="glass-card p-6 space-y-3 border-l-4 border-l-emerald-500">
                <div className="text-2xl">⚡</div>
                <h3 className="text-lg font-extrabold font-display text-success">The Solution</h3>
                <ul className="text-xs text-content-secondary leading-relaxed space-y-2">
                  <li>• Scheduled 6-seat AC Maruti Ertiga express shuttles at bus-fare pricing (₹250/ride)</li>
                  <li>• Monthly subscription passes: ₹4,999 (20 rides) & ₹9,999 (50 rides)</li>
                  <li>• Doorstep pickup clusters within 5-min walk — no bus stand crowding</li>
                  <li>• Dedicated female vehicles with verified women drivers (1 per city)</li>
                </ul>
              </div>

              <div className="glass-card p-6 space-y-3 border-l-4 border-l-indigo-500">
                <div className="text-2xl">🎯</div>
                <h3 className="text-lg font-extrabold font-display text-brand">Market Opportunity</h3>
                <ul className="text-xs text-content-secondary leading-relaxed space-y-2">
                  <li>• India's intercity mobility market: <strong>$30 Billion</strong></li>
                  <li>• Malwa Corridor TAM (Dhar-Ujjain-Dewas-Indore): ₹500 Cr annually</li>
                  <li>• 90+ daily commuters already validated via DailyCab survey & carpool community</li>
                  <li>• Zero organized competition in Tier 2-3 intercity daily shuttle space</li>
                </ul>
              </div>
            </div>

            {/* Corridor Configuration Table */}
            <div className="glass-card p-6 border border-hairline space-y-4">
              <h3 className="text-sm font-black font-display flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-500" />
                Phase 1: Tri-Corridor Fleet Configuration
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-2 text-content-muted uppercase font-bold border-b border-hairline">
                    <tr>
                      <th className="p-3">Corridor</th>
                      <th className="p-3">Distance</th>
                      <th className="p-3">Fleet</th>
                      <th className="p-3">Female-Safe Vehicle</th>
                      <th className="p-3">Daily Pax Target</th>
                      <th className="p-3 text-right">Monthly Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {CORRIDORS.map(c => (
                      <tr key={c.city} className="text-content">
                        <td className="p-3 font-bold">{c.city} ↔ Indore</td>
                        <td className="p-3">{c.distance}</td>
                        <td className="p-3 font-mono">{c.cabs} Ertigas</td>
                        <td className="p-3"><span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full text-micro font-bold">🚺 {c.female} Dedicated</span></td>
                        <td className="p-3 font-mono">{c.pax} passengers</td>
                        <td className="p-3 text-right font-bold text-success">{formatINR(c.cabs * PER_VEH_TOTAL_REVENUE)}</td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-500/10 font-black text-sm">
                      <td className="p-3" colSpan={2}>TOTAL</td>
                      <td className="p-3 font-mono">{TOTAL_FLEET} Ertigas</td>
                      <td className="p-3">3 Female-Safe</td>
                      <td className="p-3 font-mono">90 daily</td>
                      <td className="p-3 text-right text-success">{formatINR(TOTAL_FLEET * PER_VEH_TOTAL_REVENUE)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Why Now */}
            <div className="glass-card p-6 border border-hairline space-y-3">
              <h3 className="text-sm font-black font-display flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Why Now? — Market Timing Advantage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start gap-3 p-3 bg-surface-2 rounded-2xl border border-hairline">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-extrabold text-content">Ertiga CNG Cost Revolution</div>
                    <div className="text-content-muted mt-0.5">Maruti Ertiga CNG Tour at ₹9.5L ex-showroom — running cost under ₹2.5/km makes intercity daily shuttle economically viable for the first time.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-surface-2 rounded-2xl border border-hairline">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-extrabold text-content">UPI Subscription Economy</div>
                    <div className="text-content-muted mt-0.5">UPI AutoPay adoption in Tier 2-3 cities enables monthly ₹4,999-₹9,999 pass subscriptions without cash collection overhead.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-surface-2 rounded-2xl border border-hairline">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-extrabold text-content">Government Push for Women Safety</div>
                    <div className="text-content-muted mt-0.5">MP State Government actively subsidizes female-safe transport initiatives. DailyCab's 1-per-city female-dedicated vehicle qualifies for government backing.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-surface-2 rounded-2xl border border-hairline">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-extrabold text-content">Zero Organized Competition</div>
                    <div className="text-content-muted mt-0.5">No Ola/Uber subscription. No organized intercity daily shuttle exists in Tier 2-3 India. First-mover advantage is massive.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ TAB 2: FINANCIAL DPR ═══════ */}
        {activeTab === 'dpr' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Fleet Size Simulator */}
            <div className="glass-card p-6 border-2 border-emerald-500/40 space-y-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-hairline pb-4">
                <div>
                  <h3 className="text-xl font-extrabold font-display flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-emerald-500" />
                    Interactive DPR Financial Simulator
                  </h3>
                  <p className="text-xs text-content-muted">Adjust the fleet size slider to project ARR, EBITDA, and net profit at scale.</p>
                </div>
                <div className="bg-surface-2 p-4 rounded-2xl border border-hairline min-w-[280px]">
                  <div className="flex justify-between items-center text-xs font-bold mb-2">
                    <span>Fleet Size (Ertigas):</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base">{fleetSize} Vehicles</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="1"
                    value={fleetSize}
                    onChange={e => setFleetSize(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-micro text-content-muted font-mono mt-1">
                    <span>5</span>
                    <span>15 (Seed)</span>
                    <span>50</span>
                    <span>100 (Series A)</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Financial Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface-2 border border-hairline p-4 rounded-2xl">
                  <div className="text-micro text-content-muted font-bold uppercase">Monthly Revenue</div>
                  <div className="text-2xl font-black font-display text-content mt-1">{formatINR(fleetRevenue)}</div>
                  <div className="text-micro text-content-muted">Passengers + Parcels</div>
                </div>
                <div className="bg-surface-2 border border-hairline p-4 rounded-2xl">
                  <div className="text-micro text-content-muted font-bold uppercase">Monthly OPEX</div>
                  <div className="text-2xl font-black font-display text-danger mt-1">{formatINR(fleetOpex)}</div>
                  <div className="text-micro text-content-muted">Driver+Fuel+EMI+Toll+Ins</div>
                </div>
                <div className="bg-surface-2 border border-emerald-500/40 p-4 rounded-2xl bg-emerald-500/5">
                  <div className="text-micro text-success font-bold uppercase">Monthly Net Profit</div>
                  <div className="text-2xl font-black font-display text-success mt-1">{formatINR(fleetNetMonthly)}</div>
                  <div className="text-micro text-success">After Mktg & Admin</div>
                </div>
                <div className="bg-surface-2 border border-amber-500/40 p-4 rounded-2xl bg-amber-500/5">
                  <div className="text-micro text-amber-600 dark:text-amber-400 font-bold uppercase">Annual Revenue</div>
                  <div className="text-2xl font-black font-display text-amber-600 dark:text-amber-400 mt-1">{formatINR(annualRevenue)}</div>
                  <div className="text-micro text-amber-600 dark:text-amber-400">Annual Net: {formatINR(annualNet)}</div>
                </div>
              </div>
            </div>

            {/* Per Vehicle P&L Table */}
            <div className="glass-card p-6 border border-hairline space-y-4">
              <h4 className="text-sm font-extrabold font-display">Detailed Project Report — Per Ertiga Monthly P&L</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-2 text-content-muted uppercase font-bold border-b border-hairline">
                    <tr>
                      <th className="p-3">Line Item</th>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Monthly Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    <tr className="text-content"><td className="p-3 font-semibold text-success">Passenger Revenue</td><td className="p-3">2 round trips × 5 pax × 26 days × ₹250 avg</td><td className="p-3 text-right font-bold text-success">+ ₹65,000</td></tr>
                    <tr className="text-content"><td className="p-3 font-semibold text-success">B2B Parcel Revenue</td><td className="p-3">100 parcels × ₹150 per parcel</td><td className="p-3 text-right font-bold text-success">+ ₹15,000</td></tr>
                    <tr className="bg-emerald-500/5 font-bold"><td className="p-3" colSpan={2}>TOTAL REVENUE / VEHICLE / MONTH</td><td className="p-3 text-right text-success">₹80,000</td></tr>
                    <tr className="text-content bg-rose-500/5"><td className="p-3 font-semibold text-danger">Driver Salary + Incentives</td><td className="p-3">1 dedicated pilot (fixed + performance)</td><td className="p-3 text-right font-bold text-danger">- ₹20,000</td></tr>
                    <tr className="text-content bg-rose-500/5"><td className="p-3 font-semibold text-danger">Fuel (CNG)</td><td className="p-3">~120 km/day × 26 days × ₹2.5/km</td><td className="p-3 text-right font-bold text-danger">- ₹8,000</td></tr>
                    <tr className="text-content bg-rose-500/5"><td className="p-3 font-semibold text-danger">Toll & FASTag</td><td className="p-3">Daily highway toll amortized</td><td className="p-3 text-right font-bold text-danger">- ₹4,000</td></tr>
                    <tr className="text-content bg-rose-500/5"><td className="p-3 font-semibold text-danger">Insurance (Amortized)</td><td className="p-3">Comprehensive + third-party annual ÷ 12</td><td className="p-3 text-right font-bold text-danger">- ₹2,500</td></tr>
                    <tr className="text-content bg-rose-500/5"><td className="p-3 font-semibold text-danger">Maintenance & Tyres</td><td className="p-3">Service, parts, tyre rotation amortized</td><td className="p-3 text-right font-bold text-danger">- ₹3,500</td></tr>
                    <tr className="text-content bg-rose-500/5"><td className="p-3 font-semibold text-danger">Vehicle EMI / Lease</td><td className="p-3">Ertiga CNG ~₹9.5L, 5-year EMI</td><td className="p-3 text-right font-bold text-danger">- ₹18,000</td></tr>
                    <tr className="bg-rose-500/5 font-bold"><td className="p-3" colSpan={2}>TOTAL OPEX / VEHICLE / MONTH</td><td className="p-3 text-right text-danger">- ₹56,000</td></tr>
                    <tr className="bg-emerald-600/20 font-black text-sm"><td className="p-3" colSpan={2}>NET CONTRIBUTION / VEHICLE / MONTH</td><td className="p-3 text-right text-success text-base">₹24,000 (30%)</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Depreciation Schedule */}
            <div className="glass-card p-6 border border-hairline space-y-4">
              <h4 className="text-sm font-extrabold font-display flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                Vehicle Depreciation & 2-Year Rotation Schedule (25% p.a.)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-2 text-content-muted uppercase font-bold border-b border-hairline">
                    <tr>
                      <th className="p-3">Year</th>
                      <th className="p-3">Book Value / Vehicle</th>
                      <th className="p-3">Depreciation</th>
                      <th className="p-3">Fleet Book Value (15 vehicles)</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    <tr className="text-content">
                      <td className="p-3 font-bold">Year 0 (Purchase)</td>
                      <td className="p-3 font-mono">₹9,50,000</td>
                      <td className="p-3">—</td>
                      <td className="p-3 font-mono">₹1.425 Cr</td>
                      <td className="p-3 text-right"><span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-micro font-bold">New Fleet</span></td>
                    </tr>
                    <tr className="text-content">
                      <td className="p-3 font-bold">Year 1</td>
                      <td className="p-3 font-mono">₹7,12,500</td>
                      <td className="p-3 text-danger">-25%</td>
                      <td className="p-3 font-mono">₹1.069 Cr</td>
                      <td className="p-3 text-right text-content-muted">Service & maintain</td>
                    </tr>
                    <tr className="text-content bg-amber-500/5">
                      <td className="p-3 font-bold">Year 2 (Rotation)</td>
                      <td className="p-3 font-mono">₹5,34,375</td>
                      <td className="p-3 text-danger">-25%</td>
                      <td className="p-3 font-mono">₹80.2 L</td>
                      <td className="p-3 text-right"><span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-micro font-bold">🔄 Rotate & Replace</span></td>
                    </tr>
                    <tr className="text-content">
                      <td className="p-3 font-bold">Resale Value (Year 2)</td>
                      <td className="p-3 font-mono text-success">~₹5,00,000</td>
                      <td className="p-3">Market rate</td>
                      <td className="p-3 font-mono text-success">~₹75 L recovery</td>
                      <td className="p-3 text-right"><span className="bg-emerald-500/10 text-success px-2 py-0.5 rounded-full text-micro font-bold">93% Recovery</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-micro text-content-muted italic">Vehicle rotation every 2 years ensures passenger safety standards, reduces maintenance costs, and maintains premium brand perception. Resale value of 2-year-old CNG Ertigas remains high (~93% of depreciated book value).</p>
            </div>
          </div>
        )}

        {/* ═══════ TAB 3: USE OF FUNDS ═══════ */}
        {activeTab === 'funds' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-card p-6 border-2 border-emerald-500/40 space-y-6">
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <div>
                  <h3 className="text-xl font-extrabold font-display">Seed Funding: ₹1.00 Crore — Deployment Plan</h3>
                  <p className="text-xs text-content-muted">How every rupee of investor capital will be deployed across the 15-vehicle tri-corridor launch.</p>
                </div>
                <div className="text-3xl font-black font-display text-emerald-600 dark:text-emerald-400">₹1 Cr</div>
              </div>

              {/* Fund Allocation Bars */}
              <div className="space-y-4">
                {[
                  { label: '15× Ertiga CNG (Down Payment + Insurance + Registration)', amount: SEED_VEHICLES, pct: (SEED_VEHICLES / SEED_TOTAL * 100), color: 'bg-emerald-500' },
                  { label: 'Working Capital (3-Month Runway)', amount: SEED_WORKING_CAPITAL, pct: (SEED_WORKING_CAPITAL / SEED_TOTAL * 100), color: 'bg-indigo-500' },
                  { label: 'Marketing & Launch Campaign (3 Cities × 6 Months)', amount: SEED_MARKETING, pct: (SEED_MARKETING / SEED_TOTAL * 100), color: 'bg-amber-500' },
                  { label: 'Technology Platform (App, GPS Telematics, Dispatch)', amount: SEED_TECH, pct: (SEED_TECH / SEED_TOTAL * 100), color: 'bg-purple-500' },
                  { label: 'Driver Recruitment & Training (15 + 3 Backup)', amount: SEED_DRIVERS, pct: (SEED_DRIVERS / SEED_TOTAL * 100), color: 'bg-rose-500' },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-content">{item.label}</span>
                      <span className="font-black font-mono text-content">{formatINR(item.amount)} ({item.pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-surface-2 rounded-full h-3 border border-hairline overflow-hidden">
                      <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Break-Even Analysis */}
            <div className="glass-card p-6 border border-hairline space-y-4">
              <h4 className="text-sm font-extrabold font-display flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Break-Even Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface-2 p-4 rounded-2xl border border-hairline text-center space-y-2">
                  <div className="text-micro text-content-muted font-bold uppercase">Monthly Fixed Costs</div>
                  <div className="text-2xl font-black font-display text-content">{formatINR(TOTAL_FLEET * PER_VEH_TOTAL_OPEX + MONTHLY_MARKETING + MONTHLY_ADMIN)}</div>
                  <div className="text-micro text-content-muted">Fleet OPEX + Marketing + Admin</div>
                </div>
                <div className="bg-surface-2 p-4 rounded-2xl border border-hairline text-center space-y-2">
                  <div className="text-micro text-content-muted font-bold uppercase">Break-Even Passengers / Day</div>
                  <div className="text-2xl font-black font-display text-amber-600 dark:text-amber-400">72 pax/day</div>
                  <div className="text-micro text-content-muted">Across 15 vehicles (4.8 per vehicle)</div>
                </div>
                <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/40 text-center space-y-2">
                  <div className="text-micro text-success font-bold uppercase">Target: 90 Passengers / Day</div>
                  <div className="text-2xl font-black font-display text-success">125% of BE</div>
                  <div className="text-micro text-success">25% safety margin above break-even</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ TAB 4: MARKETING STRATEGY ═══════ */}
        {activeTab === 'marketing' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-card p-6 border border-hairline space-y-6">
              <div>
                <h3 className="text-xl font-extrabold font-display">Tier 2-3 City Marketing Strategy</h3>
                <p className="text-xs text-content-muted">Hyperlocal marketing playbook to achieve 30 daily passengers per corridor within 90 days of launch.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-2 text-content-muted uppercase font-bold border-b border-hairline">
                    <tr>
                      <th className="p-3">Channel</th>
                      <th className="p-3">Monthly Budget</th>
                      <th className="p-3">Annual Budget</th>
                      <th className="p-3">Expected Reach</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {MARKETING_CHANNELS.map((ch, i) => (
                      <tr key={i} className="text-content">
                        <td className="p-3 font-semibold">{ch.channel}</td>
                        <td className="p-3 font-mono">{formatINR(ch.monthly)}</td>
                        <td className="p-3 font-mono">{formatINR(ch.monthly * 12)}</td>
                        <td className="p-3 text-content-secondary">
                          {i === 0 && '5,000+ commuters in broadcast groups'}
                          {i === 1 && '50,000+ daily newspaper readers + auto wraps'}
                          {i === 2 && '3,000+ pamphlets at colleges & offices monthly'}
                          {i === 3 && '10,000+ monthly search impressions'}
                          {i === 4 && '25,000+ monthly reel views'}
                          {i === 5 && '100+ referrals/month (organic growth loop)'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-500/10 font-black text-sm">
                      <td className="p-3">TOTAL</td>
                      <td className="p-3 font-mono text-success">{formatINR(MARKETING_CHANNELS.reduce((s, c) => s + c.monthly, 0))}</td>
                      <td className="p-3 font-mono text-success">{formatINR(MARKETING_CHANNELS.reduce((s, c) => s + c.monthly, 0) * 12)}</td>
                      <td className="p-3 text-success">Full corridor awareness in 90 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card p-6 border border-hairline space-y-4">
              <h4 className="text-sm font-extrabold font-display">90-Day Launch Playbook (Per City)</h4>
              <div className="space-y-3">
                {[
                  { day: 'Day 1-15', title: 'Community Building Phase', desc: 'Launch WhatsApp broadcast group, distribute 5,000 pamphlets at colleges (Bhawarkua, Geeta Bhawan), coaching centers, IT offices (Vijay Nagar), and government offices.' },
                  { day: 'Day 15-30', title: 'Free Trial Phase', desc: 'Offer 5 free trial rides to first 50 sign-ups from survey. Collect feedback and testimonials. Run Instagram Reels showing AC Ertiga vs crowded bus comparison.' },
                  { day: 'Day 30-60', title: 'Subscription Push', desc: 'Convert free trial users to ₹4,999 Starter Pass (20 rides). Launch referral program: ₹100 credit per referral. Local newspaper ad campaign.' },
                  { day: 'Day 60-90', title: 'Full Operations', desc: 'Scale to 30 daily passengers per corridor. Launch female-safe vehicle marketing targeted at women professionals and students. Upgrade loyal riders to ₹9,999 Daily Pass.' },
                ].map((phase, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-surface-2 rounded-2xl border border-hairline">
                    <div className="w-20 shrink-0 text-center">
                      <div className="bg-emerald-600 text-white font-black text-micro px-2.5 py-1.5 rounded-xl">{phase.day}</div>
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-content">{phase.title}</div>
                      <div className="text-micro text-content-secondary mt-1">{phase.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ TAB 5: GROWTH & SCALE ═══════ */}
        {activeTab === 'growth' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-card p-6 space-y-6 border border-hairline">
              <h3 className="text-xl font-extrabold font-display">Growth Roadmap — From 15 to 500+ Vehicles</h3>
              <div className="space-y-4">
                {[
                  { phase: 'SEED', period: 'Q3-Q4 2026', title: 'Malwa Corridor Launch (Current)', fleet: '15 Ertigas', cities: 'Dhar • Ujjain • Dewas ↔ Indore', revenue: '₹1.44 Cr ARR', color: 'emerald', status: 'Funding Stage' },
                  { phase: 'SERIES A', period: 'H1 2027', title: 'MP State Expansion', fleet: '50 Ertigas', cities: '+ Bhopal • Gwalior • Jabalpur ↔ Major Hubs', revenue: '₹4.80 Cr ARR', color: 'indigo', status: 'Planned' },
                  { phase: 'SERIES B', period: 'H2 2027', title: 'Multi-State Expansion', fleet: '150 Vehicles', cities: '+ Jaipur-Ajmer • Pune-Nashik • Ahmedabad-Vadodara', revenue: '₹14.4 Cr ARR', color: 'purple', status: 'Vision' },
                  { phase: 'SCALE', period: '2028+', title: 'Pan-India Metro Corridor Network', fleet: '500+ Vehicles', cities: 'All Tier 1-2 intercity corridors (50-150 km range)', revenue: '₹48 Cr+ ARR', color: 'amber', status: 'Vision' },
                ].map((stage, i) => (
                  <div key={i} className={`p-5 rounded-2xl bg-${stage.color}-500/10 border border-${stage.color}-500/40 flex flex-col md:flex-row items-start gap-4`}>
                    <div className={`w-24 shrink-0 bg-${stage.color}-600 text-white font-black text-xs px-3 py-2 rounded-xl text-center`}>
                      {stage.phase}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-content">{stage.title}</h4>
                        <span className={`text-micro font-bold px-2 py-0.5 rounded-full bg-${stage.color}-500/20 text-${stage.color}-600 dark:text-${stage.color}-400`}>{stage.status}</span>
                      </div>
                      <p className="text-xs text-content-secondary">{stage.period} • {stage.fleet} • {stage.cities}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-lg font-black font-display text-${stage.color}-600 dark:text-${stage.color}-400`}>{stage.revenue}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 border border-hairline space-y-4">
              <h4 className="text-sm font-extrabold font-display">Competitive Moat — Why DailyCab Can't Be Easily Replicated</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {[
                  { icon: '🚺', title: 'Female-Safe Brand Lock-in', desc: 'First intercity shuttle brand with dedicated female vehicles and women drivers. Women commuters will not switch once trust is built.' },
                  { icon: '🔄', title: 'Subscription Stickiness', desc: 'Monthly pass subscribers (₹4,999-₹9,999) have 80%+ renewal rates. Pre-paid commitment creates revenue predictability.' },
                  { icon: '📍', title: 'Route Network Effects', desc: 'Every new passenger on a route reduces per-seat cost for all riders. More routes → more passengers → better unit economics.' },
                  { icon: '🛡️', title: 'First-Mover Data Advantage', desc: 'Real commuter pattern data (pickup points, peak times, demand density) creates an insurmountable intelligence moat for route optimization.' },
                ].map((moat, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-surface-2 rounded-2xl border border-hairline">
                    <div className="text-2xl shrink-0">{moat.icon}</div>
                    <div>
                      <div className="font-extrabold text-content">{moat.title}</div>
                      <div className="text-content-muted mt-1">{moat.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ TAB 6: WHY INVEST ═══════ */}
        {activeTab === 'why' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-card p-6 border-2 border-emerald-500/40 space-y-6">
              <h3 className="text-xl font-extrabold font-display">Why Should You Invest in DailyCab?</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { num: '1', title: 'Proven Demand — Not a Theory', desc: '90+ daily commuters already validated through our live carpool community platform (dailycab.in/community). Real names, real routes, real demand.', highlight: true },
                  { num: '2', title: 'Conservative 30% Net Margin', desc: 'Even at conservative 30 passengers/city, each vehicle generates ₹24,000/month net contribution. At 50 pax/city, margins jump to 45%+.' },
                  { num: '3', title: 'Asset-Backed Investment', desc: '60% of seed capital goes into physical vehicles with 93% resale value after 2-year rotation. Your money is backed by real, depreciating-but-valuable assets.' },
                  { num: '4', title: 'India\'s Only Female-Safe Intercity Shuttle', desc: 'No competitor offers dedicated female vehicles with women drivers for daily intercity commuters. This is a brand moat competitors cannot easily replicate.' },
                  { num: '5', title: 'Scalable to 500+ Vehicles Pan-India', desc: 'The model replicates to any 30-150 km Tier 2-3 corridor. India has 1,000+ such corridors. DailyCab can be India\'s Greyhound for daily commuters.' },
                  { num: '6', title: 'Government Tailwinds', desc: 'MP State Government pro-women transport policies, CNG subsidy programs, and Smart City Mission corridor development actively support this model.' },
                ].map((point, i) => (
                  <div key={i} className={`p-5 rounded-2xl border space-y-2 ${point.highlight ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-hairline bg-surface-2'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">{point.num}</div>
                      <h4 className="font-extrabold text-sm text-content">{point.title}</h4>
                    </div>
                    <p className="text-xs text-content-secondary leading-relaxed pl-11">{point.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ROI Projection */}
            <div className="glass-card p-6 border border-hairline space-y-4">
              <h4 className="text-sm font-extrabold font-display">Investor ROI Projection</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-surface-2 p-4 rounded-2xl border border-hairline text-center">
                  <div className="text-micro text-content-muted font-bold uppercase">Investment</div>
                  <div className="text-xl font-black font-display text-content mt-1">₹1.00 Cr</div>
                </div>
                <div className="bg-surface-2 p-4 rounded-2xl border border-hairline text-center">
                  <div className="text-micro text-content-muted font-bold uppercase">Year 1 Net Profit</div>
                  <div className="text-xl font-black font-display text-success mt-1">₹25.2 L</div>
                  <div className="text-micro text-success">25% ROI</div>
                </div>
                <div className="bg-surface-2 p-4 rounded-2xl border border-hairline text-center">
                  <div className="text-micro text-content-muted font-bold uppercase">Year 2 Net Profit</div>
                  <div className="text-xl font-black font-display text-success mt-1">₹38.0 L</div>
                  <div className="text-micro text-content-muted">At 50% higher utilization</div>
                </div>
                <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/40 text-center">
                  <div className="text-micro text-success font-bold uppercase">Payback Period</div>
                  <div className="text-xl font-black font-display text-success mt-1">~30 Months</div>
                  <div className="text-micro text-success">Full capital recovery</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ TAB 7: TEAM & CONTACT ═══════ */}
        {activeTab === 'team' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-card p-8 border border-hairline space-y-6">
              <h3 className="text-xl font-extrabold font-display">Founding Team</h3>

              <div className="flex flex-col md:flex-row items-start gap-6 p-6 bg-surface-2 rounded-2xl border border-hairline">
                <div className="w-20 h-20 rounded-2xl bg-emerald-600/20 border-2 border-emerald-500/40 flex items-center justify-center text-3xl shrink-0">
                  👤
                </div>
                <div className="space-y-3 flex-1">
                  <div>
                    <h4 className="text-lg font-black font-display text-content">Sanjay Thakur</h4>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Founder & Managing Director — DailyCabs Pvt Ltd</p>
                  </div>
                  <p className="text-xs text-content-secondary leading-relaxed">
                    Full-stack technology entrepreneur with deep domain expertise in intercity mobility, GPS telematics (AIS-140), and Tier 2-3 Indian commuter behavior. Built the entire DailyCab platform — from the booking engine and carpool community to live GPS tracking and investor pitch infrastructure — as a solo technical founder. Passionate about solving India's intercity daily commuter crisis with a female-safety-first approach.
                  </p>
                  <div className="flex flex-wrap gap-3 text-micro font-bold text-content-muted pt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> Dhar, Madhya Pradesh</span>
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-emerald-500" /> +91-8109745019</span>
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-emerald-500" /> founder@dailycab.in</span>
                    <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-emerald-500" /> dailycab.in</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="glass-card p-6 border border-hairline space-y-4">
              <h4 className="text-sm font-extrabold font-display">Company Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-surface-2 p-4 rounded-2xl border border-hairline space-y-2">
                  <div className="font-bold text-content-muted uppercase text-micro">Legal Entity</div>
                  <div className="font-extrabold text-content">DailyCabs Pvt Ltd</div>
                </div>
                <div className="bg-surface-2 p-4 rounded-2xl border border-hairline space-y-2">
                  <div className="font-bold text-content-muted uppercase text-micro">Registered Address</div>
                  <div className="font-extrabold text-content">15, Bandichhod Marg, Sharda Nagar, Dhar, M.P. — 454001</div>
                </div>
                <div className="bg-surface-2 p-4 rounded-2xl border border-hairline space-y-2">
                  <div className="font-bold text-content-muted uppercase text-micro">Website</div>
                  <div className="font-extrabold text-content">dailycab.in</div>
                </div>
                <div className="bg-surface-2 p-4 rounded-2xl border border-hairline space-y-2">
                  <div className="font-bold text-content-muted uppercase text-micro">Sector</div>
                  <div className="font-extrabold text-content">Intercity Mobility / Transportation / SaaS</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="glass-card p-8 border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-surface-1 to-surface-1 text-center space-y-4">
              <h3 className="text-2xl font-black font-display">Ready to Back India's Next Intercity Mobility Brand?</h3>
              <p className="text-sm text-content-secondary max-w-xl mx-auto">
                Schedule a 30-minute founder call to discuss the opportunity, walk through the live platform, and review detailed financials.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <a
                  href="mailto:founder@dailycab.in?subject=DailyCab%20Seed%20Funding%20Discussion&body=Hi%20Sanjay%2C%0A%0AI%20reviewed%20the%20DailyCab%20pitch%20deck%20and%20I'm%20interested%20in%20discussing%20the%20seed%20funding%20opportunity.%0A%0APlease%20schedule%20a%20call%20at%20your%20earliest%20convenience.%0A%0AThanks"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all text-sm"
                >
                  <Mail className="w-4 h-4" />
                  Email: founder@dailycab.in
                </a>
                <a
                  href={`https://wa.me/918109745019?text=${encodeURIComponent('Hi Sanjay, I reviewed the DailyCab investor pitch deck and I am interested in discussing the seed funding opportunity. Please schedule a call at your convenience.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-surface-2 hover:bg-surface-3 text-content font-black px-6 py-3.5 rounded-2xl border border-hairline transition-all text-sm"
                >
                  <Phone className="w-4 h-4 text-emerald-500" />
                  WhatsApp: +91-8109745019
                </a>
              </div>
              <div className="pt-4 border-t border-hairline">
                <Link href="/nda" className="text-xs font-bold text-brand underline hover:text-emerald-500 flex items-center justify-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Sign NDA & Confidentiality Agreement
                </Link>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-6 px-4 border-t border-hairline flex flex-col sm:flex-row justify-between items-center text-xs text-content-muted gap-4">
        <div>
          © 2026 DailyCabs Pvt Ltd • Confidential Investor Memorandum • dailycab.in
        </div>
        <div className="flex items-center gap-4 text-micro">
          <Link href="/nda" className="hover:text-emerald-500 font-bold underline">📝 Sign NDA</Link>
          <Link href="/community" className="hover:text-emerald-500 font-bold underline">🚗 Carpool Community</Link>
          <Link href="/" className="hover:text-emerald-500 font-bold underline">🏠 Public Site</Link>
        </div>
      </footer>
    </div>
  );
}
