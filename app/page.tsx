import Link from 'next/link';
import { SjyCabsLogo } from '@/components/logo';
import { AppLoader } from '@/components/app-loader';
import { ThemeToggle } from '@/components/theme-toggle';
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
  Zap
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas text-content flex flex-col justify-between p-4 md:p-8 font-sans selection:bg-emerald-500 selection:text-white">
      {/* High-Tech Animated Loading & Splash Screen */}
      <AppLoader title="DailyCab Express Network • Launch Survey" />
      
      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 border-b border-hairline">
        <div className="flex items-center gap-3">
          <SjyCabsLogo size="md" />
          <span className="hidden sm:inline-flex bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-black items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 motion-safe:animate-ping" />
            Launching Soon on dailycab.in
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/community"
            className="text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            <span>🚗 Free Carpool Community</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto my-8 space-y-12">
        
        {/* Coming Soon Hero Banner */}
        <div className="text-center space-y-6 max-w-4xl mx-auto pt-4">
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/community"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-full text-xs font-black shadow-lg shadow-emerald-500/20 transition-all group"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>🚗 PHASE 1 ACTIVE: Free Dhar ↔ Indore Carpool Community</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-micro font-extrabold group-hover:translate-x-0.5 transition-transform">Join Free ➔</span>
            </Link>

            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Phase 2 Fleet: Pilot Seats Preview
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight leading-[1.1]">
            Direct Home ➔ Office ➔ Coaching Shuttle <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 dark:from-emerald-400 dark:via-teal-300 dark:to-indigo-300 bg-clip-text text-transparent">
              With Zero Last-Mile Hassles
            </span>
          </h1>

          <p className="text-content-secondary text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Connecting <strong className="text-content">Dhar ↔ Indore ↔ Ujjain ↔ Dewas</strong> with guaranteed AC 6-seat Ertigas, fixed timetables, row 1 female priority seating, and live trip location sharing with family.
          </p>

          {/* Urgency Notice Bar */}
          <div className="bg-surface-2 border border-hairline p-3.5 rounded-2xl max-w-2xl mx-auto flex items-center justify-center gap-2 text-xs font-extrabold text-content-secondary">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Seat allotment is strictly on a <strong className="text-content">First-Come, First-Served basis</strong>. Reserve early!</span>
          </div>

          {/* Target Audience Persona Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-2 text-left">
            
            {/* Student & Coaching */}
            <div className="glass-card p-4 border border-hairline space-y-2 hover:border-indigo-500 transition-all">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                <GraduationCap className="w-5 h-5" /> Daily Students & Coaching
              </div>
              <p className="text-micro text-content-secondary leading-relaxed">
                Direct pick from Dhar to <strong className="text-content">Bhawarkua & Geeta Bhawan Coaching Hubs</strong>. No bus stand crowding!
              </p>
            </div>

            {/* Working Professionals */}
            <div className="glass-card p-4 border border-hairline space-y-2 hover:border-emerald-500 transition-all">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                <Briefcase className="w-5 h-5" /> Working Professionals
              </div>
              <p className="text-micro text-content-secondary leading-relaxed">
                Dhar & Indore Corporate Offices & <strong className="text-content">Vijay Nagar IT Parks</strong>. Fixed daily departure schedule.
              </p>
            </div>

            {/* Office & College Commuters */}
            <div className="glass-card p-4 border border-hairline space-y-2 hover:border-amber-500 transition-all">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                <Building2 className="w-5 h-5" /> Office & College Commuters
              </div>
              <p className="text-micro text-content-secondary leading-relaxed">
                Mon-Fri & Mon-Sat passes. <strong className="text-content">Direct Home ➔ Office/College ➔ Home</strong> again.
              </p>
            </div>

          </div>

          {/* Pricing Options Preview Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-2 text-left">
            
            {/* Single Journey */}
            <div className="glass-card p-5 border border-hairline space-y-2 hover:border-brand transition-all">
              <div className="flex justify-between items-center">
                <span className="text-micro font-black text-brand uppercase tracking-wider">Single Ride</span>
                <span className="bg-brand/10 text-brand px-2 py-0.5 rounded text-micro font-bold">Pay-Per-Trip</span>
              </div>
              <div className="text-3xl font-black text-content font-display">₹299</div>
              <div className="text-xs font-bold text-content-secondary">Per passenger seat</div>
              <p className="text-micro font-bold text-brand">📍 Includes Doorstep Pick & Drop Point</p>
            </div>

            {/* Starter Pass */}
            <div className="glass-card p-5 border border-hairline space-y-2 hover:border-indigo-500 transition-all">
              <div className="flex justify-between items-center">
                <span className="text-micro font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Starter Pass</span>
                <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded text-micro font-bold">20 Rides</span>
              </div>
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-display">₹4,999</div>
              <div className="text-xs font-bold text-content-secondary">~₹250 / ride flexibility</div>
              <p className="text-micro font-bold text-indigo-600 dark:text-indigo-400">📍 Includes Doorstep Pick & Drop Point</p>
            </div>

            {/* Daily Pass */}
            <div className="glass-card p-5 border-2 border-emerald-500/50 bg-emerald-500/5 space-y-2 relative overflow-hidden">
              <span className="absolute top-0 right-0 bg-emerald-600 text-white text-micro font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Best Value
              </span>
              <div className="flex justify-between items-center">
                <span className="text-micro font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Daily Pass</span>
                <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded text-micro font-bold">50 Rides</span>
              </div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display">₹9,999</div>
              <div className="text-xs font-bold text-success font-mono">Only ₹200 / ride (Save 42%)</div>
              <p className="text-micro font-bold text-emerald-600 dark:text-emerald-400">📍 Includes Doorstep Pick & Drop Point</p>
            </div>

          </div>

          {/* USPs Grid — Features No Bus Can Match */}
          <div className="glass-card p-6 border border-hairline max-w-4xl mx-auto space-y-4 text-left">
            <div className="text-xs font-black text-brand uppercase tracking-widest text-center">
              ⚡ USPs THAT NO BUS OR TRAIN CAN MATCH
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              <div className="flex items-start gap-3 p-3 bg-surface-2 rounded-2xl border border-hairline">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-content">100% Passenger Safety & Verified Pilots</div>
                  <div className="text-micro text-content-muted mt-0.5">AIS-140 GPS tracking, emergency SOS button, and Row 1 female priority seating.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-surface-2 rounded-2xl border border-hairline">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-content">Live Trip Location Sharing</div>
                  <div className="text-micro text-content-muted mt-0.5">Share live ride progress link with parents or family in 1-tap while traveling.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-surface-2 rounded-2xl border border-hairline">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-content">Zero Last-Mile Connectivity Hassles</div>
                  <div className="text-micro text-content-muted mt-0.5">No auto-rickshaw bargaining, no standing at dusty bus stands, no waiting in line!</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-surface-2 rounded-2xl border border-hairline">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <HomeIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-content">Direct Home ➔ Office / Coaching ➔ Home</div>
                  <div className="text-micro text-content-muted mt-0.5">Seamless point-to-point AC 6-seat Ertiga ergonomics and fixed departure timings.</div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* SECTION: Public Opinion Questionnaire Form */}
        <div className="max-w-4xl mx-auto">
          <PublicSurveyForm />
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-6 border-t border-hairline flex flex-col sm:flex-row justify-between items-center text-xs text-content-muted gap-4">
        <div>
          © 2026 DailyCab Express • dailycab.in • Premium Intercity Mobility
        </div>
        <div className="flex items-center gap-4 text-micro text-content-muted">
          <span>Malwa Intercity Commute Network • Dhar • Indore • Ujjain • Dewas</span>
          <Link href="/qr" className="hover:text-emerald-500 font-bold flex items-center gap-1 underline">
            📱 QR Poster
          </Link>
          <Link href="/card" className="hover:text-emerald-500 font-bold flex items-center gap-1 underline">
            📇 Visiting Card
          </Link>
        </div>
      </footer>

    </div>
  );
}
