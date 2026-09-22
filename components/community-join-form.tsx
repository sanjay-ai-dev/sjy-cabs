'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  Phone, 
  User, 
  MapPin, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  HeartHandshake, 
  UserCheck, 
  Zap,
  Share2,
  Check,
  Building2,
  GraduationCap,
  Car
} from 'lucide-react';

export const OFFICIAL_WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/LYayG0ZM9MOK8gFsN1lWte';

interface CommunityJoinFormProps {
  compact?: boolean;
  className?: string;
  sourcePage?: string;
}

export function CommunityJoinForm({ compact = false, className = '', sourcePage = 'home' }: CommunityJoinFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    gender: 'female',
    route: 'Dhar ↔ Indore',
    commuterType: 'Daily Office Commuter'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      alert('Please enter your full name and WhatsApp phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, sourcePage })
      });
    } catch (err) {
      console.warn('Network fallback for community submission', err);
    }

    // Backup in local storage
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('dailycab_community_members') || '[]');
        stored.unshift({ ...formData, timestamp: new Date().toISOString() });
        localStorage.setItem('dailycab_community_members', JSON.stringify(stored));
      } catch (e) {
        console.warn('localStorage save warning', e);
      }
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(OFFICIAL_WHATSAPP_COMMUNITY_URL);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`glass-card p-6 md:p-10 border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 via-surface-1 to-teal-500/5 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden ${className}`}>
        
        {/* Top Verified Ribbon */}
        <div className="absolute top-0 right-0 bg-emerald-600 text-white text-micro font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider flex items-center gap-1.5 shadow-md">
          <ShieldCheck className="w-4 h-4" />
          Female-Safe Verified Community
        </div>

        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>DETAILS REGISTERED SUCCESSFULLY</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-black font-display text-content">
            Welcome, {formData.fullName}! 🎉
          </h3>

          <p className="text-sm text-content-secondary leading-relaxed">
            Your daily commute details for <strong className="text-content">{formData.route}</strong> have been submitted! Click below to enter our closed WhatsApp group.
          </p>
        </div>

        {/* Big Join WhatsApp Button */}
        <div className="pt-2 max-w-md mx-auto space-y-4">
          <a
            href={OFFICIAL_WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-4 rounded-2xl shadow-xl hover:shadow-emerald-500/30 transition-all text-base group animate-pulse hover:animate-none"
          >
            <MessageSquare className="w-6 h-6 fill-current" />
            <span>Click to Join WhatsApp Community 📲</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Verification Notice Card */}
          <div className="bg-surface-2 border border-emerald-500/30 p-4 rounded-2xl text-left space-y-2 text-xs">
            <div className="flex items-center gap-2 font-black text-emerald-700 dark:text-emerald-300">
              <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% Genuine & Female-Safe Verification Policy</span>
            </div>
            <p className="text-content-secondary leading-relaxed">
              To keep our community safe for females and genuine daily commuters, our DailyCab team (+91-8109745019) will perform a quick 1-minute on-call or WhatsApp verification check before approving full group posting rights.
            </p>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-hairline font-bold text-content-secondary transition-all"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Group Link'}</span>
            </button>

            <button
              onClick={() => setIsSubmitted(false)}
              className="inline-flex items-center gap-1 text-content-muted hover:text-content underline font-medium"
            >
              Submit for another commuter
            </button>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className={`glass-card p-6 md:p-8 border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-surface-1 to-teal-500/5 rounded-3xl shadow-2xl relative overflow-hidden ${className}`}>
      
      {/* Top Banner Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-hairline">
        <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-black">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>FEMALE-SAFE & VERIFIED COMMUNITY</span>
        </div>

        <div className="text-micro font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          Quick 10-Second Form
        </div>
      </div>

      <div className="space-y-4 max-w-2xl mb-6">
        <h2 className="text-2xl md:text-3xl font-black font-display text-content leading-tight">
          Join the DailyCab Commuters WhatsApp Community 📲
        </h2>
        <p className="text-sm text-content-secondary leading-relaxed">
          Connect with daily commuters for <strong className="text-content">Dhar ↔ Indore ↔ Ujjain</strong>. Share rides, find cab pools, get live route updates, and commute in a 100% genuine, verified environment.
        </p>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-content-secondary flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-500" />
              <span>Full Name *</span>
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter your name"
              className="w-full bg-surface-2 border border-hairline rounded-2xl px-4 py-3 text-sm text-content placeholder:text-content-muted focus:outline-none focus:border-emerald-500 font-medium transition-all"
            />
          </div>

          {/* WhatsApp Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-content-secondary flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <span>WhatsApp Number *</span>
            </label>
            <input
              type="tel"
              required
              maxLength={10}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
              placeholder="10-digit WhatsApp number"
              className="w-full bg-surface-2 border border-hairline rounded-2xl px-4 py-3 text-sm text-content placeholder:text-content-muted focus:outline-none focus:border-emerald-500 font-mono transition-all"
            />
          </div>

        </div>

        {/* Gender Selection - Pill Buttons with Female Safety Highlight */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-content-secondary flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-500" />
              <span>Gender (Required for Female-Safe Priority) *</span>
            </span>
            <span className="text-micro font-bold text-emerald-600 dark:text-emerald-400">
              🔒 Contact Privacy Guaranteed
            </span>
          </label>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'female' })}
              className={`p-3 rounded-2xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                formData.gender === 'female'
                  ? 'border-pink-500 bg-pink-500/15 text-pink-700 dark:text-pink-300 shadow-md'
                  : 'border-hairline bg-surface-2 text-content-secondary hover:bg-surface-3'
              }`}
            >
              <span>🚺 Female</span>
              <span className="hidden sm:inline bg-pink-500/20 text-pink-600 dark:text-pink-300 text-[10px] px-1.5 py-0.5 rounded font-black">Safe Priority</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'male' })}
              className={`p-3 rounded-2xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                formData.gender === 'male'
                  ? 'border-indigo-500 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 shadow-md'
                  : 'border-hairline bg-surface-2 text-content-secondary hover:bg-surface-3'
              }`}
            >
              <span>🚹 Male</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'other' })}
              className={`p-3 rounded-2xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                formData.gender === 'other'
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-md'
                  : 'border-hairline bg-surface-2 text-content-secondary hover:bg-surface-3'
              }`}
            >
              <span>Prefer not to say</span>
            </button>
          </div>
        </div>

        {/* Route & Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Daily Route */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-content-secondary flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span>Daily Commute Route *</span>
            </label>
            <select
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              className="w-full bg-surface-2 border border-hairline rounded-2xl px-4 py-3 text-xs text-content focus:outline-none focus:border-emerald-500 font-bold transition-all"
            >
              <option value="Dhar ↔ Indore">Dhar ↔ Indore (Main Route)</option>
              <option value="Indore ↔ Ujjain">Indore ↔ Ujjain</option>
              <option value="Dhar ↔ Pithampur">Dhar ↔ Pithampur Industrial Corridor</option>
              <option value="Indore City Commute">Indore City Commute (Coaching / IT Park)</option>
              <option value="Other Regional Route">Other MP Route</option>
            </select>
          </div>

          {/* Who Are You? */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-content-secondary flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Commuter Category *</span>
            </label>
            <select
              value={formData.commuterType}
              onChange={(e) => setFormData({ ...formData, commuterType: e.target.value })}
              className="w-full bg-surface-2 border border-hairline rounded-2xl px-4 py-3 text-xs text-content focus:outline-none focus:border-emerald-500 font-bold transition-all"
            >
              <option value="Daily Office Commuter">Daily Office Commuter</option>
              <option value="Student & Coaching">Student & Coaching (Bhawarkua/Geeta Bhawan)</option>
              <option value="Female Commuter">Female Commuter (Priority Seating)</option>
              <option value="Car Owner / Pooler">Car Owner (Offering Empty Seats)</option>
              <option value="Driver Partner">Driver Partner / Cab Owner</option>
            </select>
          </div>

        </div>

        {/* Verification Policy Banner */}
        <div className="bg-surface-2 border border-hairline p-3.5 rounded-2xl flex items-start gap-3 text-xs text-content-secondary">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-content">On-Call Verification Policy:</strong> To keep our WhatsApp community safe, verified, and free of spam or unauthorized numbers, our admin team (+91-8109745019) conducts a brief verification check.
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-6 rounded-2xl shadow-xl hover:shadow-emerald-500/25 transition-all text-sm flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Registering details...</span>
          ) : (
            <>
              <MessageSquare className="w-5 h-5 fill-current" />
              <span>Submit Details & Join WhatsApp Community ➔</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}
