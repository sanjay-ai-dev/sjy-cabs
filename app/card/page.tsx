'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SjyCabsLogo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sparkles, Printer, ArrowLeft, MapPin, Zap, CheckCircle2, LayoutGrid, Minimize2 } from 'lucide-react';

export default function BusinessCardPage() {
  const [activeVariant, setActiveVariant] = useState<'structured' | 'minimal'>('structured');
  const targetUrl = 'https://dailycab.in';
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(targetUrl)}&color=047857&bgcolor=ffffff`;

  return (
    <div className="min-h-screen bg-canvas text-content p-4 md:p-8 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between items-center">
      
      {/* Top Navbar */}
      <header className="max-w-4xl w-full flex items-center justify-between py-4 border-b border-hairline print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-content-muted hover:text-content transition-colors bg-surface-2 px-3 py-1.5 rounded-xl border border-hairline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <SjyCabsLogo size="md" />
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Card Showcase */}
      <main className="max-w-4xl w-full my-8 space-y-8 text-center">
        
        {/* Title & Instructions */}
        <div className="space-y-2 max-w-2xl mx-auto print:hidden">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> High-Conversion Print Visiting Card
          </div>
          <h1 className="text-3xl md:text-4xl font-black font-display text-content">
            DailyCab Launch Visiting Card
          </h1>
          <p className="text-content-secondary text-xs md:text-sm leading-relaxed">
            Distribute to daily commuters, office goers & coaching students. Choose your preferred design variant below before printing!
          </p>
        </div>

        {/* VARIANT SELECTOR TABS */}
        <div className="flex items-center justify-center gap-3 print:hidden">
          
          <button
            onClick={() => setActiveVariant('structured')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeVariant === 'structured'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                : 'bg-surface-2 text-content-muted hover:text-content border border-hairline'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Variant 1: Structured & Spacious (Recommended)</span>
          </button>

          <button
            onClick={() => setActiveVariant('minimal')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeVariant === 'minimal'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                : 'bg-surface-2 text-content-muted hover:text-content border border-hairline'
            }`}
          >
            <Minimize2 className="w-4 h-4" />
            <span>Variant 2: Ultra Minimalist</span>
          </button>

        </div>

        {/* ========================================================================= */}
        {/* VARIANT 1: STRUCTURED & SPACIOUS (REDUCED TEXT, HIGH READABILITY) */}
        {/* ========================================================================= */}
        {activeVariant === 'structured' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-center justify-center pt-2 animate-fadeIn">
            
            {/* FRONT SIDE */}
            <div className="space-y-2">
              <div className="text-micro font-extrabold uppercase tracking-widest text-content-muted print:hidden">
                FRONT SIDE (PROBLEM & SOLUTION HOOK)
              </div>

              <div className="w-[350px] h-[200px] sm:w-[380px] sm:h-[218px] bg-white text-slate-900 rounded-2xl p-5 shadow-2xl flex flex-col justify-between text-left relative overflow-hidden mx-auto select-none">
                
                {/* Top Row: Logo & Pilot Badge */}
                <div className="flex justify-between items-center">
                  <div className="flex items-baseline font-black font-display tracking-tight text-xl">
                    <span className="text-emerald-700">Daily</span>
                    <span className="text-amber-600">Cab</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 ml-0.5 inline-block" />
                  </div>

                  <span className="bg-amber-100 border border-amber-300 text-amber-900 text-[8.5px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Phase-1 Pilot
                  </span>
                </div>

                {/* Center Core Message with Reduced Text & Spacious Line Height */}
                <div className="space-y-1.5 my-auto">
                  <div className="text-[12px] sm:text-[13px] font-black text-amber-700 tracking-tight leading-snug">
                    "बस की भीड़ & ऑटो के झंझट से आज़ादी!"
                  </div>
                  <div className="text-[14px] sm:text-[15px] font-black text-slate-900 leading-snug font-display">
                    Get Premium AC Cab Comfort <br />
                    <span className="text-emerald-700 underline decoration-amber-500 decoration-2">
                      At The Cost of Bus Fare!
                    </span>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[9.5px] font-extrabold text-slate-700">
                  <div className="flex items-center gap-1 text-emerald-800 font-black">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Direct Home ➔ Office / Coaching</span>
                  </div>
                  <div className="font-mono text-amber-700 font-black">
                    Dhar ↔ Indore
                  </div>
                </div>

              </div>
            </div>

            {/* BACK SIDE */}
            <div className="space-y-2">
              <div className="text-micro font-extrabold uppercase tracking-widest text-content-muted print:hidden">
                BACK SIDE (SCAN & BOOK HOOK)
              </div>

              <div className="w-[350px] h-[200px] sm:w-[380px] sm:h-[218px] bg-white text-slate-900 rounded-2xl p-4 shadow-2xl flex flex-row items-center justify-between text-left relative overflow-hidden mx-auto select-none">
                
                {/* Left Column */}
                <div className="flex-1 pr-3 space-y-2 flex flex-col justify-between h-full">
                  
                  <div className="space-y-1">
                    <div className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[8px] font-black inline-block uppercase tracking-wider">
                      ⚡ 30-Sec Launch Survey
                    </div>
                    <div className="text-[11.5px] sm:text-[12.5px] font-black leading-snug text-slate-900 font-display">
                      Scan QR to Book Seat <br />
                      <span className="text-emerald-700 text-[13px]">
                        & Get 10% VIP Discount!
                      </span>
                    </div>
                  </div>

                  {/* Scarcity Pill */}
                  <div className="bg-amber-50 border border-amber-300 px-2 py-1 rounded-lg flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="text-[8px] font-black text-amber-900 uppercase">
                      Only 12 Daily Seats in Phase 1
                    </span>
                  </div>

                  {/* Clean Pricing Line */}
                  <div className="text-[8px] font-black text-slate-700 border-t border-slate-200 pt-1.5 flex justify-between items-center">
                    <span>📍 Single: <strong className="text-emerald-700">₹299</strong></span>
                    <span>📍 Passes: <strong className="text-emerald-700">₹4,999 / ₹9,999</strong></span>
                  </div>

                  {/* Website Domain */}
                  <div className="text-[9.5px] font-mono font-black text-emerald-800 flex justify-between items-center pt-0.5">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[8.5px] font-black">
                      dailycab.in
                    </span>
                    <span className="text-[8px] font-bold text-slate-500">Doorstep Included</span>
                  </div>

                </div>

                {/* Right Column: QR Code */}
                <div className="bg-emerald-50/80 p-2 rounded-xl text-center shrink-0 flex flex-col items-center justify-center">
                  <img
                    src={qrImageUrl}
                    alt="DailyCab Survey QR Code"
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                  />
                  <div className="text-[7.5px] font-black text-emerald-900 uppercase tracking-wider mt-1 bg-emerald-200/80 px-1.5 py-0.5 rounded">
                    SCAN TO BOOK
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VARIANT 2: ULTRA MINIMALIST */}
        {/* ========================================================================= */}
        {activeVariant === 'minimal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-center justify-center pt-2 animate-fadeIn">
            
            {/* FRONT SIDE */}
            <div className="space-y-2">
              <div className="text-micro font-extrabold uppercase tracking-widest text-content-muted print:hidden">
                FRONT SIDE (MINIMALIST)
              </div>

              <div className="w-[350px] h-[200px] sm:w-[380px] sm:h-[218px] bg-white text-slate-900 rounded-2xl p-6 shadow-2xl flex flex-col justify-between text-center relative overflow-hidden mx-auto select-none">
                
                <div className="flex justify-center items-center pt-1">
                  <div className="flex items-baseline font-black font-display tracking-tight text-2xl">
                    <span className="text-emerald-700">Daily</span>
                    <span className="text-amber-600">Cab</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-600 ml-0.5 inline-block" />
                  </div>
                </div>

                <div className="my-auto space-y-1.5 px-2">
                  <div className="text-sm sm:text-base font-black text-emerald-700 leading-snug font-display">
                    Get Premium AC Cab Experience <br />
                    At The Cost of Bus Fare!
                  </div>
                </div>

                <div className="pt-2 text-[9.5px] font-bold text-slate-600">
                  Dhar ↔ Indore • Direct Home ➔ Office / Coaching
                </div>

              </div>
            </div>

            {/* BACK SIDE */}
            <div className="space-y-2">
              <div className="text-micro font-extrabold uppercase tracking-widest text-content-muted print:hidden">
                BACK SIDE (GREEN QR & ONE HEADLINE)
              </div>

              <div className="w-[350px] h-[200px] sm:w-[380px] sm:h-[218px] bg-white text-slate-900 rounded-2xl p-5 shadow-2xl flex flex-col items-center justify-between text-center relative overflow-hidden mx-auto select-none">
                
                <div className="p-1 shrink-0">
                  <img
                    src={qrImageUrl}
                    alt="DailyCab Survey QR Code"
                    className="w-24 h-24 sm:w-26 sm:h-26 object-contain mx-auto"
                  />
                </div>

                <div className="space-y-0.5">
                  <div className="text-xs sm:text-sm font-black text-emerald-700 font-display leading-tight">
                    Scan To Fill Quick Survey & Book Seat
                  </div>
                  <div className="text-[9px] font-bold text-amber-700">
                    ⚡ 10% VIP Launch Discount Included
                  </div>
                </div>

                <div className="text-xs font-mono font-black text-emerald-800 tracking-wider pb-1">
                  dailycab.in
                </div>

              </div>
            </div>

          </div>
        )}

        {/* Visual Mockup & Print Action Bar */}
        <div className="space-y-4 max-w-xl mx-auto pt-4 print:hidden">
          
          <button
            onClick={() => window.print()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl text-sm font-black transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-5 h-5" />
            <span>Print Selected Visiting Card / Save PDF 🖨️</span>
          </button>

          <p className="text-micro text-content-muted">
            💡 Pro-Tip: Distribute these cards to daily commuters at bus stops, coaching squares, and offices in Dhar & Indore!
          </p>

        </div>

      </main>

      {/* Footer */}
      <footer className="text-micro text-content-muted text-center py-4 print:hidden">
        © 2026 DailyCab Mobility • High-Conversion Print Asset • dailycab.in
      </footer>

    </div>
  );
}
