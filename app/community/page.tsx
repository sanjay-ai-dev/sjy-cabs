import React from 'react';
import Link from 'next/link';
import { SjyCabsLogo } from '@/components/logo';
import { AppLoader } from '@/components/app-loader';
import { ThemeToggle } from '@/components/theme-toggle';
import { WhatsAppCommunityCard } from '@/components/whatsapp-community-card';
import { CarpoolCommunityFeed } from '@/components/carpool-community-feed';
import { 
  Car, 
  Users, 
  ShieldCheck, 
  Navigation, 
  Sparkles, 
  MapPin, 
  Clock, 
  ArrowRight,
  UserCheck,
  Zap,
  Calendar,
  Building2,
  GraduationCap
} from 'lucide-react';

export const metadata = {
  title: 'Dhar - Indore | Daily Commuters Carpool Community',
  description: 'Free Carpooling & Daily Commuters Community for Dhar ↔ Indore. Share fuel costs, find daily ride partners, female-safe rides, and cab pools.',
};

export default function CarpoolCommunityPage() {
  return (
    <div className="min-h-screen bg-canvas text-content flex flex-col justify-between p-4 md:p-8 font-sans selection:bg-emerald-500 selection:text-white">
      {/* High-Tech Animated Loading Screen */}
      <AppLoader title="Dhar ↔ Indore Daily Commuters Community" />

      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 border-b border-hairline">
        <div className="flex items-center gap-3">
          <SjyCabsLogo size="md" />
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 motion-safe:animate-ping" />
            Phase 1: Free Carpool Community
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="text-xs font-extrabold text-content-secondary hover:text-emerald-500 transition-colors flex items-center gap-1 bg-surface-2 px-3 py-1.5 rounded-xl border border-hairline"
          >
            <span>🚕 Phase 2 Cab Fleet</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl w-full mx-auto my-8 space-y-12">
        
        {/* Hero Banner */}
        <div className="text-center space-y-6 max-w-4xl mx-auto pt-2">
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-xs font-extrabold shadow-lg">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>OFFICIAL DAILY COMMUTERS HUB</span>
            </div>

            <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5">
              🚗 Dhar ↔ Indore Corridor
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight leading-[1.1]">
            🚗 Dhar - Indore - Dhar <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 dark:from-emerald-400 dark:via-teal-300 dark:to-indigo-300 bg-clip-text text-transparent">
              Daily Commuters Community
            </span>
          </h1>

          <p className="text-content-secondary text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Welcome to the official hub for daily commuters traveling between Dhar and Indore! Make your daily commute affordable, safe, and convenient through smart carpooling and shared taxi pools.
          </p>

          {/* Primary route into the /pool app. This feed is the full firehose;
              /pool is the guided version that matches a specific trip. */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/pool"
              className="inline-flex min-h-tap w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
            >
              <Navigation className="w-4 h-4" aria-hidden="true" />
              Find a ride for my trip
            </Link>
            <Link
              href="/pool/offer"
              className="inline-flex min-h-tap w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-hairline bg-surface px-6 py-3 text-sm font-bold text-content-secondary transition-colors hover:bg-surface-2 hover:text-content"
            >
              <Car className="w-4 h-4" aria-hidden="true" />
              Offer my empty seats
            </Link>
          </div>
          <p className="text-micro text-content-muted">
            Or scroll down to browse every post in the community feed.
          </p>

        </div>

        {/* Secured WhatsApp Private Group CTA */}
        <WhatsAppCommunityCard />

        {/* WHO CAN JOIN? — Persona Cards */}
        <div className="space-y-4">
          <div className="text-xs font-black text-brand uppercase tracking-widest text-center">
            👥 WHO CAN JOIN THE COMMUNITY?
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Car Owners */}
            <div className="glass-card p-6 border border-hairline space-y-3 hover:border-emerald-500 transition-all rounded-3xl">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black font-display text-content">🚗 Car Owners</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Share fuel costs and find reliable company for your daily drive between Dhar & Indore. Post daily schedules or pre-planned upcoming trips.
              </p>
            </div>

            {/* Daily Passengers */}
            <div className="glass-card p-6 border border-hairline space-y-3 hover:border-indigo-500 transition-all rounded-3xl">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 w-fit">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black font-display text-content">🙋 Daily Passengers</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Find comfortable, direct, and pocket-friendly ride options (#SeekRide) instead of waiting at crowded bus stands or commuting in hot buses.
              </p>
            </div>

            {/* Cab Pools */}
            <div className="glass-card p-6 border border-hairline space-y-3 hover:border-amber-500 transition-all rounded-3xl">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black font-display text-content">🚕 Cab Pools</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Commuters grouping together to book and share daily or monthly taxi services with doorstep pickup points.
              </p>
            </div>

          </div>
        </div>

        {/* Security & Female Safety Assurance Bar */}
        <div className="glass-card p-6 border border-hairline rounded-3xl bg-surface-1 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-black text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> FEMALE SAFE ENVIRONMENT & SECURITY GUARANTEE
              </div>
              <h4 className="text-base font-extrabold text-content">
                Safe, Verified Commutes for Women & Daily Travelers
              </h4>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-content-secondary">
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30">
                🚺 Female Driver / Passenger Option
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                <Navigation className="w-3.5 h-3.5" /> Live Mobile GPS Tracking
              </span>
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30">
                ⏳ Automatic Seat Waitlist
              </span>
            </div>
          </div>
        </div>

        {/* LIVE CARPOOL COMMUNITY FEED */}
        <CarpoolCommunityFeed />

      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-6 border-t border-hairline flex flex-col sm:flex-row justify-between items-center text-xs text-content-muted gap-4">
        <div>
          © 2026 DailyCab Express Community • dailycab.in/community
        </div>
        <div className="flex items-center gap-4 text-micro text-content-muted">
          <span>Dhar ↔ Indore Commuter Hub</span>
          <Link href="/qr" className="hover:text-emerald-500 font-bold flex items-center gap-1 underline">
            📱 QR Poster
          </Link>
          <Link href="/card" className="hover:text-emerald-500 font-bold flex items-center gap-1 underline">
            📇 Visiting Card
          </Link>
          <Link href="/admin/survey" className="hover:text-emerald-500 font-bold flex items-center gap-1 underline">
            ⚙️ Admin Panel
          </Link>
        </div>
      </footer>

    </div>
  );
}
