import Link from 'next/link';
import { SjyCabsLogo } from '@/components/logo';
import { AppLoader } from '@/components/app-loader';
import { ThemeToggle } from '@/components/theme-toggle';
import { CommunityJoinForm, OFFICIAL_WHATSAPP_COMMUNITY_URL } from '@/components/community-join-form';
import { PublicSurveyForm } from '@/components/public-survey-form';
import { 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  Clock, 
  UserCheck, 
  Share2, 
  Home as HomeIcon, 
  GraduationCap, 
  Briefcase, 
  Building2, 
  Ban,
  CheckCircle2,
  AlertTriangle,
  Zap,
  MessageSquare,
  Lock,
  PhoneCall,
  Heart,
  Users
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas text-content flex flex-col justify-between p-4 md:p-8 font-sans selection:bg-emerald-500 selection:text-white">
      {/* High-Tech Animated Loading & Splash Screen */}
      <AppLoader title="DailyCab Express • Commuter Community Hub" />
      
      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 border-b border-hairline">
        <div className="flex items-center gap-3">
          <SjyCabsLogo size="md" />
          <span className="hidden sm:inline-flex bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-black items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 motion-safe:animate-ping" />
            Phase 1: Free Verified Commuter Community
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={OFFICIAL_WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span>Join WhatsApp Group</span>
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto my-8 space-y-12">
        
        {/* Main Hero Header */}
        <div className="text-center space-y-6 max-w-4xl mx-auto pt-2">
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg shadow-emerald-600/20">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>COMMUNITY FIRST: Dhar ↔ Indore ↔ Ujjain</span>
            </div>

            <span className="bg-pink-500/10 border border-pink-500/30 text-pink-700 dark:text-pink-300 px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm">
              <Heart className="w-4 h-4 text-pink-500 fill-current" />
              100% Female-Safe & Verified Environment
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight leading-[1.1]">
            Dhar ↔ Indore ↔ Ujjain <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 dark:from-emerald-400 dark:via-teal-300 dark:to-indigo-300 bg-clip-text text-transparent">
              Daily Commuters Community
            </span>
          </h1>

          <p className="text-content-secondary text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Welcome to the official verified hub for daily commuters! Join our closed WhatsApp group to connect with genuine travelers, share cab pools, and commute safely every day.
          </p>

          {/* Quick Stats / Trust Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-extrabold text-content-secondary pt-1">
            <span className="flex items-center gap-1.5 bg-surface-2 px-3 py-1.5 rounded-xl border border-hairline">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> On-Call Verified Profiles
            </span>
            <span className="flex items-center gap-1.5 bg-surface-2 px-3 py-1.5 rounded-xl border border-hairline">
              <Lock className="w-4 h-4 text-emerald-500" /> Contact & Phone Privacy
            </span>
            <span className="flex items-center gap-1.5 bg-surface-2 px-3 py-1.5 rounded-xl border border-hairline">
              <UserCheck className="w-4 h-4 text-pink-500" /> Female Safe Seating & Priority
            </span>
          </div>

        </div>

        {/* MAIN COMMUNITY LANDING FORM SECTION */}
        <div className="max-w-4xl mx-auto">
          <CommunityJoinForm sourcePage="home_hero" />
        </div>

        {/* 3-STEP FEMALE SAFE & VERIFIED WORKFLOW CARD */}
        <div className="glass-card p-6 md:p-8 border border-hairline max-w-4xl mx-auto space-y-6 rounded-3xl">
          <div className="text-center space-y-2">
            <div className="text-xs font-black text-brand uppercase tracking-widest">
              🛡️ HOW WE KEEP OUR COMMUNITY SAFE & GENUINE
            </div>
            <h3 className="text-xl md:text-2xl font-black font-display text-content">
              Simple 3-Step Verification & Join Process
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="bg-surface-2 p-5 rounded-2xl border border-hairline space-y-2 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-sm shadow-md">
                1
              </div>
              <h4 className="font-extrabold text-content text-sm">Fill Quick 10-Sec Details</h4>
              <p className="text-micro text-content-secondary leading-relaxed">
                Enter your name, WhatsApp number, daily route, and gender (for female priority seating).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-surface-2 p-5 rounded-2xl border border-hairline space-y-2 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-sm shadow-md">
                2
              </div>
              <h4 className="font-extrabold text-content text-sm">Join Closed WhatsApp Group</h4>
              <p className="text-micro text-content-secondary leading-relaxed">
                Click to join <strong className="text-content">https://chat.whatsapp.com/LYayG0ZM9MOK8gFsN1lWte</strong> to enter the verified group queue.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-surface-2 p-5 rounded-2xl border border-hairline space-y-2 relative">
              <div className="w-8 h-8 rounded-full bg-pink-500 text-white font-black flex items-center justify-center text-sm shadow-md">
                3
              </div>
              <h4 className="font-extrabold text-content text-sm">Quick On-Call Verification</h4>
              <p className="text-micro text-content-secondary leading-relaxed">
                Our DailyCab admin (+91-8109745019) performs a quick 1-min call/chat check to verify genuine commuters before approving group posting.
              </p>
            </div>

          </div>
        </div>

        {/* TARGET AUDIENCE PERSONAS */}
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="text-xs font-black text-brand uppercase tracking-widest text-center">
            👥 WHO BENEFITS FROM THE COMMUNITY?
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            
            {/* Student & Coaching */}
            <div className="glass-card p-5 border border-hairline space-y-2 hover:border-indigo-500 transition-all rounded-2xl">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                <GraduationCap className="w-5 h-5" /> Students & Coaching Commuters
              </div>
              <p className="text-micro text-content-secondary leading-relaxed">
                Daily pick from Dhar to <strong className="text-content">Bhawarkua & Geeta Bhawan Coaching Hubs</strong>. Connect with fellow students for safe, budget-friendly pooling!
              </p>
            </div>

            {/* Working Professionals */}
            <div className="glass-card p-5 border border-hairline space-y-2 hover:border-emerald-500 transition-all rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                <Briefcase className="w-5 h-5" /> Working Professionals
              </div>
              <p className="text-micro text-content-secondary leading-relaxed">
                Dhar & Indore Corporate Offices, Pithampur Industrial Belt & <strong className="text-content">Vijay Nagar IT Parks</strong>. Fixed departure schedules & cab pools.
              </p>
            </div>

            {/* Female Commuters */}
            <div className="glass-card p-5 border border-pink-500/30 bg-pink-500/5 space-y-2 hover:border-pink-500 transition-all rounded-2xl">
              <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-extrabold text-xs">
                <Heart className="w-5 h-5 fill-current" /> Female Daily Commuters
              </div>
              <p className="text-micro text-content-secondary leading-relaxed">
                Verified member profiles, phone number privacy protection, and <strong className="text-content">Row 1 Female Priority Seating</strong> in shared cabs.
              </p>
            </div>

          </div>
        </div>

        {/* PHASE 2 FLEET PREVIEW & PRICING OPTIONS */}
        <div className="max-w-4xl mx-auto space-y-6 pt-6 border-t border-hairline">
          
          <div className="text-center space-y-2">
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-black inline-flex items-center gap-1.5 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Phase 2 Preview: AC 6-Seat Ertiga Shuttle Fleet
            </span>
            <h3 className="text-2xl font-black font-display text-content">
              Direct Home ➔ Office ➔ Coaching Shuttle Passes
            </h3>
            <p className="text-xs text-content-secondary">
              Doorstep pickup points, AIS-140 GPS tracking, and fixed departure timetables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            
            {/* Single Journey */}
            <div className="glass-card p-5 border border-hairline space-y-2 hover:border-brand transition-all rounded-2xl">
              <div className="flex justify-between items-center">
                <span className="text-micro font-black text-brand uppercase tracking-wider">Single Ride</span>
                <span className="bg-brand/10 text-brand px-2 py-0.5 rounded text-micro font-bold">Pay-Per-Trip</span>
              </div>
              <div className="text-3xl font-black text-content font-display">₹299</div>
              <div className="text-xs font-bold text-content-secondary">Per passenger seat</div>
              <p className="text-micro font-bold text-brand">📍 Includes Doorstep Pick & Drop Point</p>
            </div>

            {/* Starter Pass */}
            <div className="glass-card p-5 border border-hairline space-y-2 hover:border-indigo-500 transition-all rounded-2xl">
              <div className="flex justify-between items-center">
                <span className="text-micro font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Starter Pass</span>
                <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded text-micro font-bold">20 Rides</span>
              </div>
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-display">₹4,999</div>
              <div className="text-xs font-bold text-content-secondary">~₹250 / ride flexibility</div>
              <p className="text-micro font-bold text-indigo-600 dark:text-indigo-400">📍 Includes Doorstep Pick & Drop Point</p>
            </div>

            {/* Daily Pass */}
            <div className="glass-card p-5 border-2 border-emerald-500/50 bg-emerald-500/5 space-y-2 relative overflow-hidden rounded-2xl">
              <span className="absolute top-0 right-0 bg-emerald-600 text-white text-micro font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Best Value
              </span>
              <div className="flex justify-between items-center">
                <span className="text-micro font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Daily Pass</span>
                <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded text-micro font-bold">50 Rides</span>
              </div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display">₹9,999</div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">Only ₹200 / ride (Save 42%)</div>
              <p className="text-micro font-bold text-emerald-600 dark:text-emerald-400">📍 Includes Doorstep Pick & Drop Point</p>
            </div>

          </div>

        </div>

        {/* SECTION: Public Survey */}
        <div className="max-w-4xl mx-auto pt-6 border-t border-hairline">
          <PublicSurveyForm />
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-6 border-t border-hairline flex flex-col sm:flex-row justify-between items-center text-xs text-content-muted gap-4">
        <div>
          © 2026 DailyCab Express • dailycab.in • Verified Commuter Network
        </div>
        <div className="flex flex-wrap items-center gap-4 text-micro text-content-muted">
          <span>Malwa Intercity Commute Network • Dhar • Indore • Ujjain • Dewas</span>
          <Link href="/community" className="hover:text-emerald-500 font-bold flex items-center gap-1 underline text-emerald-600 dark:text-emerald-400">
            💬 WhatsApp Community
          </Link>
          <Link href="/qr" className="hover:text-emerald-500 font-bold flex items-center gap-1 underline">
            📱 QR Poster
          </Link>
          <Link href="/card" className="hover:text-emerald-500 font-bold flex items-center gap-1 underline">
            📇 Visiting Card
          </Link>
          <Link href="/nda" className="hover:text-emerald-500 font-bold flex items-center gap-1 underline">
            📝 NDA
          </Link>
        </div>
      </footer>

    </div>
  );
}
