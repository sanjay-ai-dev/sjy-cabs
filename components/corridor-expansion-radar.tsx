'use client';

import React, { useState } from 'react';
import { Modal } from './modal';
import { useToast } from './toast-provider';

export const CorridorExpansionRadar: React.FC = () => {
  const { toast } = useToast();
  const [selectedCorridor, setSelectedCorridor] = useState<'ujjain' | 'dewas' | null>(null);
  const [phone, setPhone] = useState('');
  const [preferredArea, setPreferredArea] = useState('');
  const [reservedCount, setReservedCount] = useState({ ujjain: 412, dewas: 589 });
  const [isReserved, setIsReserved] = useState(false);

  const handleVIPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast({
        tone: 'warning',
        title: 'Check the mobile number',
        detail: 'Enter all 10 digits so we can send your launch voucher.',
      });
      return;
    }
    setIsReserved(true);
    setReservedCount(prev => ({
      ...prev,
      [selectedCorridor || 'ujjain']: prev[selectedCorridor || 'ujjain'] + 1
    }));
  };

  return (
    <div className="space-y-4 my-6">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-extrabold tracking-tight text-content font-display">
            Upcoming Corridor Expansion
          </h3>
          <p className="text-micro text-content-muted">Reserve early access & vote for doorstep routes</p>
        </div>
        <span className="text-micro font-bold text-brand bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
          Malwa Network
        </span>
      </div>

      {/* Full Width Stacked Cards (Mobile Friendly - No 2-Col Cramping) */}
      <div className="space-y-3">
        
        {/* Ujjain Corridor Card */}
        <div className="glass-card p-4 border border-hairline hover:border-indigo-500/40 dark:bg-gradient-to-r dark:from-[#121422] dark:to-[#0c0e18] transition-all space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl">
                🛕
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-content font-display">Ujjain ↔ Indore</h4>
                  <span className="text-micro font-bold text-danger bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                    Launching Next Week
                  </span>
                </div>
                <p className="text-micro text-content-muted mt-0.5">Mahakal Express Corridor • 55 km</p>
              </div>
            </div>
          </div>

          {/* Pricing & Metrics Bar */}
          <div className="grid grid-cols-2 gap-2 bg-surface-2 border border-hairline p-2.5 rounded-xl text-xs">
            <div>
              <span className="text-micro text-content-muted uppercase font-bold tracking-wider block">Single Ride</span>
              <div className="font-bold text-success text-sm mt-0.5">
                ₹180 <span className="line-through text-content-muted text-micro font-normal">₹250</span>
              </div>
            </div>
            <div>
              <span className="text-micro text-content-muted uppercase font-bold tracking-wider block">50-Ride Pass</span>
              <div className="font-bold text-brand text-sm mt-0.5">₹7,500</div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 gap-3">
            <div className="text-micro text-content-muted font-medium">
              <strong className="text-brand font-bold">{reservedCount.ujjain}</strong> commuters joined
            </div>
            <button
              onClick={() => {
                setSelectedCorridor('ujjain');
                setIsReserved(false);
              }}
              className="btn-primary py-2 px-4 text-xs font-bold shadow-none hover:shadow-indigo-500/20"
            >
              Reserve VIP Pass ➔
            </button>
          </div>
        </div>

        {/* Dewas Corridor Card */}
        <div className="glass-card p-4 border border-hairline hover:border-amber-500/40 dark:bg-gradient-to-r dark:from-[#17151f] dark:to-[#0c0e18] transition-all space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl">
                🏔️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-content font-display">Dewas ↔ Indore</h4>
                  <span className="text-micro font-bold text-warning bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                    12 Ertigas Arriving
                  </span>
                </div>
                <p className="text-micro text-content-muted mt-0.5">Tekri Express Corridor • 35 km</p>
              </div>
            </div>
          </div>

          {/* Pricing & Metrics Bar */}
          <div className="grid grid-cols-2 gap-2 bg-surface-2 border border-hairline p-2.5 rounded-xl text-xs">
            <div>
              <span className="text-micro text-content-muted uppercase font-bold tracking-wider block">Single Ride</span>
              <div className="font-bold text-success text-sm mt-0.5">
                ₹160 <span className="line-through text-content-muted text-micro font-normal">₹220</span>
              </div>
            </div>
            <div>
              <span className="text-micro text-content-muted uppercase font-bold tracking-wider block">50-Ride Pass</span>
              <div className="font-bold text-warning text-sm mt-0.5">₹7,000</div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 gap-3">
            <div className="text-micro text-content-muted font-medium">
              <strong className="text-warning font-bold">{reservedCount.dewas}</strong> votes cast
            </div>
            <button
              onClick={() => {
                setSelectedCorridor('dewas');
                setIsReserved(false);
              }}
              className="bg-amber-500/15 border border-amber-500/30 text-warning hover:bg-amber-500/25 py-2 px-4 rounded-xl text-xs font-bold transition-all"
            >
              Vote Pickup Stop ➔
            </button>
          </div>
        </div>

      </div>

      <Modal
        isOpen={selectedCorridor !== null}
        onClose={() => setSelectedCorridor(null)}
        title={
          selectedCorridor === 'dewas'
            ? 'Dewas ↔ Indore Express'
            : 'Ujjain ↔ Indore Express'
        }
        subtitle="VIP launch access"
        size="sm"
      >
        {!isReserved ? (
          <form onSubmit={handleVIPSubmit} className="space-y-3">
            <div className="space-y-1 text-center">
              <div aria-hidden="true" className="text-3xl">
                {selectedCorridor === 'ujjain' ? '🛕' : '🏔️'}
              </div>
              <p className="text-xs text-content-secondary">
                Get ₹50 off your first ride and seat priority when this corridor
                launches.
              </p>
            </div>

            <div>
              {/* htmlFor/id: these labels were previously unassociated, so
                  tapping them did not focus the field and screen readers
                  announced the inputs as unlabelled. */}
              <label
                htmlFor="vip-phone"
                className="mb-1 block text-micro font-bold uppercase text-content-muted"
              >
                Mobile number (WhatsApp)
              </label>
              <input
                id="vip-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                pattern="[0-9]{10}"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                placeholder="10-digit mobile number"
                className="w-full rounded-xl border border-hairline bg-surface-2 px-3 py-2.5 text-xs font-bold text-content outline-none focus:border-brand"
              />
            </div>

            <div>
              <label
                htmlFor="vip-area"
                className="mb-1 block text-micro font-bold uppercase text-content-muted"
              >
                Preferred pickup area in{' '}
                {selectedCorridor === 'ujjain' ? 'Ujjain' : 'Dewas'}
              </label>
              <input
                id="vip-area"
                name="preferredArea"
                type="text"
                value={preferredArea}
                onChange={(e) => setPreferredArea(e.target.value)}
                placeholder={
                  selectedCorridor === 'ujjain'
                    ? 'e.g. Mahakal Temple, Nanakheda, Freeganj'
                    : 'e.g. Tekri Mata, Industrial Area, Bus Stand'
                }
                className="w-full rounded-xl border border-hairline bg-surface-2 px-3 py-2.5 text-xs font-semibold text-content outline-none focus:border-brand"
              />
            </div>

            <button type="submit" className="btn-primary mt-2 w-full text-xs">
              Claim VIP launch access ➔
            </button>
          </form>
        ) : (
          <div className="space-y-4 py-2 text-center">
            <div
              aria-hidden="true"
              className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-emerald-500 bg-emerald-500/20 text-2xl text-success"
            >
              ✓
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-success">
                VIP spot confirmed
              </h3>
              <p className="mt-1 text-xs text-content-secondary">
                You are <strong>#{reservedCount[selectedCorridor ?? 'ujjain']}</strong>{' '}
                in the queue for the{' '}
                {selectedCorridor === 'ujjain' ? 'Ujjain' : 'Dewas'} corridor launch.
              </p>
            </div>
            <div className="rounded-2xl border border-hairline bg-surface-2 p-3 text-xs text-brand">
              📱 Your ₹50 launch voucher goes to <strong>+91 {phone}</strong> on
              WhatsApp as soon as vehicles roll out.
            </div>
            <button
              type="button"
              onClick={() => setSelectedCorridor(null)}
              className="min-h-tap w-full rounded-xl bg-surface-2 py-2.5 text-xs font-bold text-content transition-colors hover:bg-surface-3"
            >
              Back to portal
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
