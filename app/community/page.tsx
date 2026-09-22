import React from 'react';
import Link from 'next/link';
import { SjyCabsLogo } from '@/components/logo';
import { AppLoader } from '@/components/app-loader';
import { ThemeToggle } from '@/components/theme-toggle';
import { WhatsAppCommunityCard } from '@/components/whatsapp-community-card';
import { CommunityJoinForm, OFFICIAL_WHATSAPP_COMMUNITY_URL } from '@/components/community-join-form';
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
  GraduationCap,
  MessageSquare,
  Heart,
  Lock
} from 'lucide-react';

export const metadata = {
  title: 'Dhar - Indore | Daily Commuters Carpool Community',
  description: 'Official WhatsApp Daily Commuters Community for Dhar ↔ Indore ↔ Ujjain. 100% Female-Safe & Verified commute network.',
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
            <span>🚕 Homepage & Shuttle Fleet</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl w-full mx-auto my-8 space-y-12">
        
        {/* Hero Banner */}
        <div className="text-center space-y-6 max-w-4xl mx-auto pt-2">
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-extrabold shadow-lg">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>OFFICIAL DAILY COMMUTERS HUB</span>
            </div>

            <span className="bg-pink-500/10 border border-pink-500/30 text-pink-700 dark:text-pink-300 px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-pink-500 fill-current" />
              Female-Safe Verified Group
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight leading-[1.1]">
            🚗 Dhar - Indore - Ujjain <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 dark:from-emerald-400 dark:via-teal-300 dark:to-indigo-300 bg-clip-text text-transparent">
              Daily Commuters Community
            </span>
          </h1>

          <p className="text-content-secondary text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Welcome to the official hub for daily commuters! Join our closed WhatsApp group to connect with genuine daily travelers, share cab pools, and commute safely every day.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={OFFICIAL_WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-tap w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-7 py-3.5 text-sm font-black text-white shadow-xl hover:bg-emerald-500 transition-all"
            >
              <MessageSquare className="w-5 h-5 fill-current" aria-hidden="true" />
              Join WhatsApp Group 📲
            </a>

            <Link
              href="/pool"
              className="inline-flex min-h-tap w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-hairline bg-surface px-6 py-3.5 text-sm font-bold text-content-secondary transition-colors hover:bg-surface-2 hover:text-content"
            >
              <Navigation className="w-4 h-4" aria-hidden="true" />
              Find a ride for my trip
            </Link>
          </div>

        </div>

        {/* EMBEDDED COMMUNITY JOIN FORM */}
        <div className="max-w-4xl mx-auto">
          <CommunityJoinForm sourcePage="community_page" />
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

        {/* Community Feed / Posts */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black font-display text-content">
              Active Community Posts & Ride Requests
            </h2>
            <p className="text-xs text-content-secondary">
              Browse recent carpool offers & seeker requests from daily commuters.
            </p>
          </div>
          <CarpoolCommunityFeed />
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-6 border-t border-hairline flex flex-col sm:flex-row justify-between items-center text-xs text-content-muted gap-4">
        <div>
          © 2026 DailyCab Express • dailycab.in • Verified Commuter Network
        </div>
        <div className="flex items-center gap-4 text-micro text-content-muted">
          <span>Dhar • Indore • Ujjain • Dewas</span>
          <Link href="/" className="hover:text-emerald-500 font-bold flex items-center gap-1 underline">
            🏠 Home
          </Link>
          <Link href="/qr" className="hover:text-emerald-500 font-bold flex items-center gap-1 underline">
            📱 QR Code
          </Link>
        </div>
      </footer>

    </div>
  );
}
