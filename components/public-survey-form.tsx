'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Phone, 
  User, 
  Ticket,
  Percent,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Building2,
  ShieldCheck,
  Share2,
  Home,
  Check,
  Clock,
  Car,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

interface SurveyData {
  fullName: string;
  phone: string;
  email: string;
  userCategory: string; // 'student' | 'professional' | 'office' | 'other'
  route: string;
  frequency: string; // 'mon_fri' | 'mon_sat' | '2_3_times' | 'weekend'
  preferredPlan: string; // 'pass_50' | 'pass_20' | 'single_299'
  pickupPreference: string;
  topPriority: string;
  feedback: string;
}

export function PublicSurveyForm() {
  const [formData, setFormData] = useState<SurveyData>({
    fullName: '',
    phone: '',
    email: '',
    userCategory: 'professional',
    route: 'DHR-IND',
    frequency: 'mon_fri',
    preferredPlan: 'pass_50',
    pickupPreference: 'doorstep',
    topPriority: 'doorstep_direct',
    feedback: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert('Please fill in your name and phone number.');
      return;
    }
    setIsSubmitting(true);
    
    try {
      await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch (err) {
      console.error('API submission fallback', err);
    }

    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('dailycab_survey_responses') || '[]');
      existing.unshift({ ...formData, timestamp: new Date().toISOString() });
      localStorage.setItem('dailycab_survey_responses', JSON.stringify(existing));
    }

    setIsSubmitting(false);
    setSubmitted(true);
  };

  const whatsappMessage = encodeURIComponent(
    `Hi DailyCab Team! I am ${formData.fullName} (${formData.phone}). I just submitted the launch survey for ${formData.route} (${formData.frequency.replace('_', '-')}). Please reserve my Phase-1 VIP seat priority!`
  );
  const whatsappUrl = `https://wa.me/918109745019?text=${whatsappMessage}`;

  if (submitted) {
    return (
      <div className="glass-card p-8 md:p-12 text-center space-y-6 border-2 border-emerald-500/40 bg-emerald-500/5 rounded-3xl animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-success flex items-center justify-center mx-auto text-4xl shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase border border-emerald-500/30">
            🎉 Response Submitted!
          </span>
          <h3 className="text-2xl md:text-3xl font-black font-display text-content">
            Thank You, {formData.fullName}!
          </h3>
          <p className="text-content-secondary text-sm leading-relaxed">
            Your response helps lock in <strong className="text-content">DailyCab’s</strong> daily point-to-point shuttle service between <strong className="text-content">Dhar & Indore</strong>.
          </p>
        </div>

        {/* Phase-1 Urgency Notice */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl max-w-md mx-auto flex items-start gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <div className="font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-wider text-micro">
              ⚠️ Phase 1 Seat Allocation Notice
            </div>
            <div className="text-content-secondary font-medium">
              Seats are allocated strictly on a <strong className="text-content">First-Come, First-Served basis</strong>. Only <strong className="text-content">12 daily seats</strong> are available in Phase 1.
            </div>
          </div>
        </div>

        {/* VIP Discount Box */}
        <div className="bg-surface-2 p-5 rounded-2xl border border-hairline max-w-md mx-auto space-y-3 text-left">
          <div className="flex items-center gap-2 text-brand font-black text-xs uppercase tracking-wider">
            <Ticket className="w-4 h-4" /> VIP Launch Pass Discount
          </div>
          <div className="flex items-center justify-between bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30">
            <div>
              <div className="text-xs text-content-muted font-bold">VIP Promo Code</div>
              <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">DAILYCAB10</div>
            </div>
            <div className="text-right">
              <div className="text-micro font-bold text-content-muted">Discount</div>
              <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">10% OFF First Pass</div>
            </div>
          </div>
        </div>

        {/* OPTIONAL WHATSAPP DIRECT MESSAGE BUTTON */}
        <div className="space-y-3 max-w-md mx-auto pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl text-xs font-black transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Fast-Track Reservation on WhatsApp (8109745019)</span>
            <ChevronRight className="w-4 h-4" />
          </a>
          <p className="text-micro text-content-muted">
            (Optional) Send a direct message to our founder on 8109745019 to secure priority Phase-1 seat allotment immediately.
          </p>
        </div>

        <button
          onClick={() => setSubmitted(false)}
          className="text-xs text-content-muted hover:text-content font-bold underline block mx-auto pt-2"
        >
          Submit another feedback / edit details
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 md:p-10 border border-hairline rounded-3xl space-y-8 shadow-2xl">
      
      {/* Questionnaire Header */}
      <div className="border-b border-hairline pb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Official Launch Survey
          </div>

          <span className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-micro font-black flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Phase 1: Only 12 Daily Seats Available
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-black font-display text-content">
          Reserve Your Daily Commute Seat
        </h2>
        <p className="text-content-secondary text-xs md:text-sm leading-relaxed max-w-2xl">
          Designed specifically for <strong className="text-content">Students, Professionals & Daily Office Commuters</strong>. Early survey participants get an instant <strong className="text-content">10% Launch VIP Pass Discount</strong>!
        </p>

        {/* Urgency Badge */}
        <div className="bg-surface-2 border border-hairline p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-content-secondary">
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Seats allotted strictly on a <strong className="text-content">First-Come, First-Served basis</strong> for Phase 1 commuters.</span>
        </div>
      </div>

      {/* SECTION 1: Target Audience Category */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-widest text-brand block">
          1. Who Are You Commuting As? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          <button
            type="button"
            onClick={() => setFormData({ ...formData, userCategory: 'professional' })}
            className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
              formData.userCategory === 'professional'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-extrabold shadow-md'
                : 'border-hairline bg-surface-2 text-content-secondary font-bold hover:border-emerald-500/30'
            }`}
          >
            <Briefcase className="w-5 h-5 mb-1 text-emerald-500" />
            <div className="text-xs">Working Professional</div>
            <div className="text-micro text-content-muted font-normal">Indore Offices / Vijay Nagar</div>
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, userCategory: 'student' })}
            className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
              formData.userCategory === 'student'
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-extrabold shadow-md'
                : 'border-hairline bg-surface-2 text-content-secondary font-bold hover:border-indigo-500/30'
            }`}
          >
            <GraduationCap className="w-5 h-5 mb-1 text-indigo-500" />
            <div className="text-xs">Student / Coaching</div>
            <div className="text-micro text-content-muted font-normal">Bhawarkua / Geeta Bhawan</div>
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, userCategory: 'office' })}
            className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
              formData.userCategory === 'office'
                ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-extrabold shadow-md'
                : 'border-hairline bg-surface-2 text-content-secondary font-bold hover:border-amber-500/30'
            }`}
          >
            <Building2 className="w-5 h-5 mb-1 text-amber-500" />
            <div className="text-xs">Office / Govt Employee</div>
            <div className="text-micro text-content-muted font-normal">Daily Fixed Office Timing</div>
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, userCategory: 'other' })}
            className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
              formData.userCategory === 'other'
                ? 'border-brand bg-brand/10 text-brand font-extrabold shadow-md'
                : 'border-hairline bg-surface-2 text-content-secondary font-bold hover:border-brand/30'
            }`}
          >
            <Car className="w-5 h-5 mb-1 text-brand" />
            <div className="text-xs">General Traveler</div>
            <div className="text-micro text-content-muted font-normal">Frequent Intercity Rides</div>
          </button>

        </div>
      </div>

      {/* SECTION 2: Personal Contact Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand">
          <User className="w-4 h-4" /> 2. Contact Details
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-micro font-extrabold text-content-muted uppercase block mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-content-muted" />
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Sharma"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-hairline bg-surface-2 text-xs font-bold text-content focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label className="text-micro font-extrabold text-content-muted uppercase block mb-1">
              WhatsApp / Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-content-muted" />
              <input
                type="tel"
                required
                placeholder="+91 98260 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-hairline bg-surface-2 text-xs font-bold text-content focus:outline-none focus:border-brand"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Route & Frequency (With Mon-Fri Option) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand">
          <MapPin className="w-4 h-4" /> 3. Your Route & Frequency
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-micro font-extrabold text-content-muted uppercase block mb-1">Primary Route</label>
            <select
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              className="w-full p-3 rounded-xl border border-hairline bg-surface-2 text-xs font-bold text-content focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="DHR-IND">Dhar ↔ Indore (62 km)</option>
              <option value="UJJ-IND">Ujjain ↔ Indore (55 km)</option>
              <option value="DEW-IND">Dewas ↔ Indore (35 km)</option>
            </select>
          </div>

          <div>
            <label className="text-micro font-extrabold text-content-muted uppercase block mb-1">Travel Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full p-3 rounded-xl border border-hairline bg-surface-2 text-xs font-bold text-content focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="mon_fri">Mon - Fri (5 Days/Week - Office & College)</option>
              <option value="mon_sat">Mon - Sat (6 Days/Week - Daily Commuter)</option>
              <option value="2_3_times">2-3 Times a Week</option>
              <option value="weekend">Weekend / Occasional</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 4: Pricing & Willingness to Pay */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand">
            <Percent className="w-4 h-4" /> 4. Pricing Preference & Willingness to Pay
          </div>
          <span className="text-micro font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
            Doorstep Included In All Plans
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Option A: Daily Pass 50 Rides @ 9999 */}
          <label 
            onClick={() => setFormData({ ...formData, preferredPlan: 'pass_50' })}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 block relative ${
              formData.preferredPlan === 'pass_50'
                ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                : 'border-hairline bg-surface-2 hover:border-emerald-500/40'
            }`}
          >
            <span className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-micro font-black px-2 py-0.5 rounded-full uppercase">
              Best Value
            </span>
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-content uppercase">Daily Pass</span>
              <input 
                type="radio" 
                name="preferredPlan" 
                checked={formData.preferredPlan === 'pass_50'}
                onChange={() => {}} 
                className="accent-emerald-600"
              />
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-display">
              ₹9,999 <span className="text-xs font-normal text-content-muted">/ month</span>
            </div>
            <div className="text-micro font-bold text-content-secondary">
              • 50 Single Rides included
            </div>
            <div className="text-micro font-bold text-emerald-600 dark:text-emerald-400">
              📍 Doorstep Pick & Drop Included
            </div>
            <div className="text-micro font-extrabold text-success">
              🔥 Only ₹200 / ride (Save 42%)
            </div>
          </label>

          {/* Option B: Starter Pass 20 Rides @ 4999 */}
          <label 
            onClick={() => setFormData({ ...formData, preferredPlan: 'pass_20' })}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 block relative ${
              formData.preferredPlan === 'pass_20'
                ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                : 'border-hairline bg-surface-2 hover:border-indigo-500/40'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-content uppercase">Starter Pass</span>
              <input 
                type="radio" 
                name="preferredPlan" 
                checked={formData.preferredPlan === 'pass_20'}
                onChange={() => {}} 
                className="accent-indigo-600"
              />
            </div>
            <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-display">
              ₹4,999 <span className="text-xs font-normal text-content-muted">/ month</span>
            </div>
            <div className="text-micro font-bold text-content-secondary">
              • 20 Single Rides included
            </div>
            <div className="text-micro font-bold text-indigo-600 dark:text-indigo-400">
              📍 Doorstep Pick & Drop Included
            </div>
            <div className="text-micro font-bold text-indigo-600 dark:text-indigo-400">
              ⚡ ~₹250 / ride flexibility
            </div>
          </label>

          {/* Option C: Single Journey @ 299 */}
          <label 
            onClick={() => setFormData({ ...formData, preferredPlan: 'single_299' })}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 block relative ${
              formData.preferredPlan === 'single_299'
                ? 'border-brand bg-brand/10 shadow-lg shadow-brand/10'
                : 'border-hairline bg-surface-2 hover:border-brand/40'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-content uppercase">Single Ride</span>
              <input 
                type="radio" 
                name="preferredPlan" 
                checked={formData.preferredPlan === 'single_299'}
                onChange={() => {}} 
                className="accent-brand"
              />
            </div>
            <div className="text-xl font-black text-brand font-display">
              ₹299 <span className="text-xs font-normal text-content-muted">/ trip</span>
            </div>
            <div className="text-micro font-bold text-content-secondary">
              • Pay-as-you-go seat
            </div>
            <div className="text-micro font-bold text-brand">
              📍 Doorstep Pick & Drop Included
            </div>
          </label>

        </div>
      </div>

      {/* SECTION 5: Priority Feature Selection */}
      <div className="space-y-2">
        <label className="text-micro font-extrabold text-content-muted uppercase block">
          What Feature Is Most Crucial For You?
        </label>
        <select
          value={formData.topPriority}
          onChange={(e) => setFormData({ ...formData, topPriority: e.target.value })}
          className="w-full p-3 rounded-xl border border-hairline bg-surface-2 text-xs font-bold text-content focus:outline-none focus:border-brand cursor-pointer"
        >
          <option value="doorstep_direct">Direct Home ↔ Office / College / Coaching (Zero Last-Mile Hassle)</option>
          <option value="location_sharing">Live Trip Location Sharing with Parents / Family (Safety)</option>
          <option value="guaranteed_ac">Guaranteed AC 6-Seat Comfort (No Bus Overcrowding)</option>
          <option value="ladies_row1">Row 1 Ladies Priority Safety</option>
          <option value="fixed_timing">Fixed Punctual Departure Timings</option>
        </select>
      </div>

      {/* Optional Feedback */}
      <div>
        <label className="text-micro font-extrabold text-content-muted uppercase block mb-1">
          Your Home & Office / College Landmark (Optional)
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Pickup: Anand Nagar Dhar ➔ Drop: Bhawarkua Coaching Square / Vijay Nagar IT Park..."
          value={formData.feedback}
          onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
          className="w-full p-3 rounded-xl border border-hairline bg-surface-2 text-xs font-bold text-content focus:outline-none focus:border-brand"
        />
      </div>

      {/* Submit CTA Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white py-4 rounded-2xl text-sm font-black transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {isSubmitting ? (
          <span>Reserving Phase-1 VIP Slot...</span>
        ) : (
          <>
            <span>Reserve Phase-1 Seat & Claim 10% Pass Discount</span>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>

    </form>
  );
}
