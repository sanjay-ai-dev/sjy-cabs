'use client';

import React, { useState } from 'react';
import { 
  X, 
  Car, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  Navigation, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { CarpoolPost } from '@/lib/carpool-store';

interface PostRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: CarpoolPost) => void;
}

export function PostRideModal({ isOpen, onClose, onPostCreated }: PostRideModalProps) {
  const [type, setType] = useState<'OFFER' | 'SEEK'>('OFFER');
  const [driverName, setDriverName] = useState('');
  const [driverGender, setDriverGender] = useState<'male' | 'female'>('male');
  const [phone, setPhone] = useState('');
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');
  const [departureDate, setDepartureDate] = useState('Daily (Mon-Sat)');
  const [customDate, setCustomDate] = useState('');
  const [isPrePlanned, setIsPrePlanned] = useState(false);
  const [departureTime, setDepartureTime] = useState('08:30 AM');
  const [returnTime, setReturnTime] = useState('06:00 PM');
  const [totalSeats, setTotalSeats] = useState(3);
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [fuelShare, setFuelShare] = useState('₹150 / seat');
  const [isFemaleOnly, setIsFemaleOnly] = useState(false);
  const [liveGpsEnabled, setLiveGpsEnabled] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!driverName || !phone || !routeFrom || !routeTo || !departureTime) {
      setError('Please fill in all mandatory fields (*)');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalDate = isPrePlanned && customDate ? customDate : departureDate;

      const response = await fetch('/api/carpool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          posterRole: type === 'OFFER' ? 'CAR_OWNER' : 'PASSENGER',
          driverName,
          driverGender,
          phone,
          routeFrom,
          routeTo,
          departureDate: finalDate,
          departureTime,
          returnTime,
          totalSeats: Number(totalSeats),
          vehicleModel,
          vehicleNumber,
          fuelShare,
          isFemaleOnly,
          liveGpsEnabled,
          notes,
        }),
      });

      const data = await response.json();

      if (data.success && data.post) {
        onPostCreated(data.post);
        onClose();
        // Reset form
        setDriverName('');
        setPhone('');
        setRouteFrom('');
        setRouteTo('');
        setNotes('');
      } else {
        setError(data.error || 'Failed to submit post.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="glass-card max-w-2xl w-full border border-hairline my-8 overflow-hidden rounded-3xl shadow-2xl bg-canvas text-content relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-hairline bg-surface-1">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black font-display text-content">Post a Carpool / Ride</h2>
              <p className="text-xs text-content-secondary">Dhar ↔ Indore Commuters Community</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-content-muted hover:text-content hover:bg-surface-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Role Switcher (#OfferRide vs #SeekRide) */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-surface-2 rounded-2xl border border-hairline">
            <button
              type="button"
              onClick={() => { setType('OFFER'); }}
              className={`py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                type === 'OFFER'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-content-secondary hover:text-content'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>I am OFFERING a Ride (#OfferRide)</span>
            </button>
            <button
              type="button"
              onClick={() => { setType('SEEK'); }}
              className={`py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                type === 'SEEK'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-content-secondary hover:text-content'
              }`}
            >
              <User className="w-4 h-4" />
              <span>I am SEEKING a Ride (#SeekRide)</span>
            </button>
          </div>

          {/* Person & Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-micro font-bold text-content-secondary mb-1">
                {type === 'OFFER' ? 'Driver / Owner Name *' : 'Your Name *'}
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                required
                className="w-full bg-surface-2 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-content focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-micro font-bold text-content-secondary mb-1">Gender *</label>
              <select
                value={driverGender}
                onChange={(e) => setDriverGender(e.target.value as 'male' | 'female')}
                className="w-full bg-surface-2 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-content focus:border-brand focus:outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female 🚺</option>
              </select>
            </div>

            <div>
              <label className="block text-micro font-bold text-content-secondary mb-1">WhatsApp / Phone *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 98260XXXXX"
                required
                className="w-full bg-surface-2 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-content focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          {/* Route Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-micro font-bold text-content-secondary mb-1">Pickup Area / Origin *</label>
              <input
                type="text"
                value={routeFrom}
                onChange={(e) => setRouteFrom(e.target.value)}
                placeholder="e.g. Dhar Trimurti Nagar / LIG"
                required
                className="w-full bg-surface-2 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-content focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-micro font-bold text-content-secondary mb-1">Destination *</label>
              <input
                type="text"
                value={routeTo}
                onChange={(e) => setRouteTo(e.target.value)}
                placeholder="e.g. Indore Vijay Nagar (IT Park)"
                required
                className="w-full bg-surface-2 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-content focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          {/* Schedule & Pre-Planned Trip */}
          <div className="space-y-3 bg-surface-2/60 p-4 rounded-2xl border border-hairline">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-content flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand" /> Trip Schedule
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-brand font-extrabold">
                <input
                  type="checkbox"
                  checked={isPrePlanned}
                  onChange={(e) => setIsPrePlanned(e.target.checked)}
                  className="rounded border-hairline text-brand focus:ring-brand"
                />
                Pre-Planned Future Date (e.g. Ujjain trip)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {!isPrePlanned ? (
                <div>
                  <label className="block text-micro text-content-muted mb-1">Frequency</label>
                  <select
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full bg-surface-1 border border-hairline rounded-xl px-3 py-2 text-xs text-content"
                  >
                    <option value="Daily (Mon-Sat)">Daily (Mon-Sat)</option>
                    <option value="Daily (Mon-Fri)">Daily (Mon-Fri)</option>
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Weekends Only">Weekends Only</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-micro text-content-muted mb-1">Target Date *</label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    required={isPrePlanned}
                    className="w-full bg-surface-1 border border-hairline rounded-xl px-3 py-2 text-xs text-content"
                  />
                </div>
              )}

              <div>
                <label className="block text-micro text-content-muted mb-1">Departure Time *</label>
                <input
                  type="text"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  placeholder="e.g. 08:30 AM"
                  required
                  className="w-full bg-surface-1 border border-hairline rounded-xl px-3 py-2 text-xs text-content"
                />
              </div>

              <div>
                <label className="block text-micro text-content-muted mb-1">Return Time (Optional)</label>
                <input
                  type="text"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  placeholder="e.g. 06:30 PM"
                  className="w-full bg-surface-1 border border-hairline rounded-xl px-3 py-2 text-xs text-content"
                />
              </div>
            </div>
          </div>

          {/* Vehicle & Seats (If offering) */}
          {type === 'OFFER' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-micro font-bold text-content-secondary mb-1">Seats Available *</label>
                <select
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(Number(e.target.value))}
                  className="w-full bg-surface-2 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-content"
                >
                  <option value={1}>1 Seat</option>
                  <option value={2}>2 Seats</option>
                  <option value={3}>3 Seats</option>
                  <option value={4}>4 Seats</option>
                  <option value={5}>5 Seats</option>
                </select>
              </div>

              <div>
                <label className="block text-micro font-bold text-content-secondary mb-1">Vehicle Model</label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="e.g. Swift Dzire AC / Ertiga"
                  className="w-full bg-surface-2 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-content"
                />
              </div>

              <div>
                <label className="block text-micro font-bold text-content-secondary mb-1">Fuel Share Contribution</label>
                <input
                  type="text"
                  value={fuelShare}
                  onChange={(e) => setFuelShare(e.target.value)}
                  placeholder="e.g. ₹150/seat or Free"
                  className="w-full bg-surface-2 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-content"
                />
              </div>
            </div>
          )}

          {/* Safety & Live GPS Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-surface-2 rounded-2xl border border-hairline">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFemaleOnly}
                onChange={(e) => setIsFemaleOnly(e.target.checked)}
                className="mt-0.5 rounded border-hairline text-rose-500 focus:ring-rose-500"
              />
              <div>
                <div className="text-xs font-bold text-content flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-500" />
                  Female-Safe Environment
                </div>
                <div className="text-micro text-content-muted">
                  Female driver or female-only passengers preference.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={liveGpsEnabled}
                onChange={(e) => setLiveGpsEnabled(e.target.checked)}
                className="mt-0.5 rounded border-hairline text-emerald-500 focus:ring-emerald-500"
              />
              <div>
                <div className="text-xs font-bold text-content flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-emerald-500" />
                  Live Mobile GPS Tracking
                </div>
                <div className="text-micro text-content-muted">
                  Will share live location link with passengers during commute.
                </div>
              </div>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-micro font-bold text-content-secondary mb-1">Additional Notes & Preferences</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Non-smoker, clean car, music preference, luggage space..."
              className="w-full bg-surface-2 border border-hairline rounded-xl p-3 text-xs text-content focus:border-brand focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-content-secondary hover:text-content hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20 flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <span>Posting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Post {type === 'OFFER' ? '#OfferRide' : '#SeekRide'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
