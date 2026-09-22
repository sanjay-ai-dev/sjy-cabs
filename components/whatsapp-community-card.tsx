'use client';

import React from 'react';
import { MessageSquare, ShieldCheck, Zap, ArrowRight, Lock, UserCheck, Heart } from 'lucide-react';
import { OFFICIAL_WHATSAPP_COMMUNITY_URL } from '@/components/community-join-form';

interface WhatsAppCommunityCardProps {
  groupName?: string;
  onOpenForm?: () => void;
}

export function WhatsAppCommunityCard({
  groupName = 'Dhar - Indore | Daily Commuters Hub',
  onOpenForm
}: WhatsAppCommunityCardProps) {
  return (
    <div className="glass-card p-6 md:p-8 border-2 border-emerald-500/40 relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-surface-1 shadow-xl rounded-3xl">
      <div className="absolute top-0 right-0 bg-emerald-600 text-white text-micro font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider flex items-center gap-1.5 shadow-md">
        <Lock className="w-3.5 h-3.5" />
        Verified Private Group
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>INSTANT DAILY COMMUTE ALERTS</span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-pink-500/15 text-pink-700 dark:text-pink-300 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-black">
              <Heart className="w-3.5 h-3.5 text-pink-500 fill-current" />
              <span>100% Female-Safe & Verified</span>
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-black font-display text-content leading-tight">
            Join the Official WhatsApp Community 📲
          </h3>

          <p className="text-sm text-content-secondary leading-relaxed">
            Get instant updates for daily ride offers, cab pool matching, emergency route alerts, and female-priority seats for <strong className="text-content">Dhar ↔ Indore ↔ Ujjain</strong>. Members are verified on-call for maximum safety.
          </p>

          <div className="flex flex-wrap gap-4 text-micro font-extrabold text-content-muted pt-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> On-Call Verified Profiles
            </span>
            <span className="flex items-center gap-1.5">
              🔒 Contact & Phone Privacy
            </span>
            <span className="flex items-center gap-1.5">
              ⚡ Real-Time Seat & Route Alerts
            </span>
          </div>
        </div>

        <div className="shrink-0 w-full md:w-auto space-y-2 text-center">
          <a
            href={OFFICIAL_WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto inline-flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-7 py-4 rounded-2xl shadow-xl hover:shadow-emerald-500/25 transition-all text-sm group"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            <span>Join WhatsApp Group</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          
          <p className="text-micro text-content-muted font-mono">
            Verification Support: +91 8109745019
          </p>
        </div>
      </div>
    </div>
  );
}
