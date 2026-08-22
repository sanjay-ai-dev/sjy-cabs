import Link from 'next/link';
import { SjyCabsLogo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sparkles, Download, Share2, QrCode, ShieldCheck, Ticket } from 'lucide-react';

export default function QrCodePage() {
  const targetUrl = 'https://dailycab.in';
  // High-res QR code generated via qrserver API
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(targetUrl)}&color=059669&bgcolor=ffffff`;

  return (
    <div className="min-h-screen bg-canvas text-content p-4 md:p-8 font-sans flex flex-col justify-between items-center selection:bg-emerald-500 selection:text-white">
      
      {/* Navbar */}
      <header className="max-w-xl w-full flex items-center justify-between py-4 border-b border-hairline">
        <SjyCabsLogo size="md" />
        <ThemeToggle />
      </header>

      {/* Printable QR Code Poster Card */}
      <main className="max-w-md w-full my-8 space-y-6">
        
        <div className="glass-card p-6 md:p-8 border-2 border-emerald-500/40 bg-surface-1 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Official Launch Survey
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-display text-content">
              Scan To Commute
            </h1>
            <p className="text-content-secondary text-xs leading-relaxed">
              Dhar ↔ Indore ↔ Ujjain ↔ Dewas Daily Shuttle
            </p>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-6 rounded-2xl border-2 border-emerald-500/30 shadow-xl inline-block mx-auto relative group">
            <img
              src={qrImageUrl}
              alt="DailyCab Launch Survey QR Code"
              className="w-56 h-56 md:w-64 md:h-64 object-contain mx-auto"
            />
            <div className="mt-3 text-center text-slate-800 font-mono text-xs font-black tracking-wider">
              dailycab.in
            </div>
          </div>

          {/* VIP Offer Hook */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-extrabold">
            <Ticket className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Scan to Claim Instant 10% VIP Pass Discount</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href={qrImageUrl}
              download="DailyCab_Survey_QR_Code.png"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Download QR
            </a>

            <Link
              href="/"
              className="bg-surface-2 hover:bg-surface-3 text-content border border-hairline py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Share2 className="w-4 h-4" />
              Open Survey
            </Link>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="text-micro text-content-muted text-center py-4">
        © 2026 DailyCab Express • Print or Display this QR code for in-person traveler surveys.
      </footer>

    </div>
  );
}
