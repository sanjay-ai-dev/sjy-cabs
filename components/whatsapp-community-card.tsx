'use client';

import React from 'react';
import { MessageSquare, ShieldCheck, Zap, ArrowRight, Lock } from 'lucide-react';

interface WhatsAppCommunityCardProps {
  communityPhone?: string;
  groupName?: string;
}

export function WhatsAppCommunityCard({
  communityPhone = '8109745019',
  groupName = 'Dhar - Indore | Daily Commuters Hub',
}: WhatsAppCommunityCardProps) {
  const whatsappUrl = `https://wa.me/91${communityPhone}?text=${encodeURIComponent(
    `Hi, I want to join the DailyCab Secured Private WhatsApp Community for Dhar - Indore daily commuter updates!`
  )}`;

  return (
    <div className="glass-card p-6 md:p-8 border-2 border-emerald-500/40 relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-surface-1 shadow-xl">
      <div className="absolute top-0 right-0 bg-emerald-600 text-white text-micro font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider flex items-center gap-1.5 shadow-md">
        <Lock className="w-3.5 h-3.5" />
        Verified Private Group
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span>INSTANT DAILY COMMUTE ALERTS</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-black font-display text-content leading-tight">
            Join the Secured Private WhatsApp Community 📲
          </h3>

          <p className="text-sm text-content-secondary leading-relaxed">
            Get instant notifications for empty seats, daily ride offers (#OfferRide), ride requests (#SeekRide), live traffic alerts, and female-only pool updates between <strong className="text-content">Dhar ↔ Indore</strong>.
          </p>

          <div className="flex flex-wrap gap-4 text-micro font-extrabold text-content-muted pt-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Admin Verified Members
            </span>
            <span className="flex items-center gap-1.5">
              🔒 Spam & Contact Protected
            </span>
            <span className="flex items-center gap-1.5">
              ⚡ Real-time Route Updates
            </span>
          </div>
        </div>

        <div className="shrink-0 w-full md:w-auto">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto inline-flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-4 rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition-all text-sm group"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            <span>Join WhatsApp Community</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="text-center text-micro text-content-muted mt-2 font-mono">
            Direct message support: +91 {communityPhone}
          </p>
        </div>
      </div>
    </div>
  );
}
