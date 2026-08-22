'use client';

import React from 'react';

/**
 * Hero banner. Every overlay here sits on a photograph, not on a themed
 * surface, so it stays light-on-dark in both themes — that is what `.on-media`
 * encodes. Tokenising these would put dark text on a dark photo in light mode.
 */
export const AnimatedHeroBanner: React.FC = () => {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-hairline shadow-lg group my-6">
      <img
        src="/images/hero.jpg"
        alt="A white Maruti Ertiga shuttle on the Indore–Dhar highway corridor"
        className="w-full h-[260px] md:h-[380px] object-cover motion-safe:group-hover:scale-105 transition-transform duration-700"
      />

      {/* Scrim. Needed in BOTH themes: it is what makes the overlay text
          readable against an arbitrary photograph. */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/10 pointer-events-none" />

      {/* Top HUD row */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center gap-2 z-10">
        <div className="on-media border px-3 py-1.5 rounded-full text-micro font-bold text-emerald-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
          <span>INDORE ↔ DHAR CORRIDOR LIVE</span>
        </div>

        <div className="bg-indigo-600 border border-indigo-300/50 px-3 py-1.5 rounded-full text-micro font-extrabold text-white flex items-center gap-1.5 shadow-lg whitespace-nowrap">
          <span>⚡ 6 Daily Schedules</span>
        </div>
      </div>

      {/* Bottom overlay card */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-3 on-media border p-4 md:p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="text-meta text-indigo-200 font-extrabold uppercase tracking-widest flex items-center gap-1">
            <span>🚘</span> MARUTI ERTIGA 6-SEATER SHUTTLE
          </div>
          <h2 className="text-xl md:text-2xl font-black font-display text-white tracking-tight">
            Door-to-Door Intercity Express
          </h2>
          <p className="text-meta text-slate-200 max-w-lg">
            Fixed daily doorstep pickup &amp; office drop • ₹9,999 for 50 Rides • B2B Parcel Cargo • Row 1 ♀ Priority
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <div className="bg-slate-950/70 border border-white/15 px-3 py-2 rounded-xl text-center flex-1 md:flex-initial">
            <div className="text-micro text-slate-300 uppercase font-bold">Single Fare</div>
            <div className="text-base font-extrabold text-emerald-300 font-display">₹250</div>
          </div>
          <div className="bg-slate-950/70 border border-amber-400/40 px-3 py-2 rounded-xl text-center flex-1 md:flex-initial">
            <div className="text-micro text-slate-300 uppercase font-bold">50-Ride Pass</div>
            <div className="text-base font-extrabold text-amber-300 font-display">₹9,999</div>
          </div>
        </div>
      </div>
    </div>
  );
};
