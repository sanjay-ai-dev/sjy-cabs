'use client';

import React, { useState } from 'react';
import { useToast } from './toast-provider';

interface MonthlyPassDashboardProps {
  onTrackShuttle?: () => void;
}

export const MonthlyPassDashboard: React.FC<MonthlyPassDashboardProps> = ({ onTrackShuttle }) => {
  const { toast } = useToast();
  const [ridesLeft, setRidesLeft] = useState(38);
  const [isMorningLocked, setIsMorningLocked] = useState(true);
  const [isEveningLocked, setIsEveningLocked] = useState(false);
  const [lockedPickup, setLockedPickup] = useState('House 14, Anand Nagar, Dhar');
  const [lockedDrop, setLockedDrop] = useState('C21 Mall / Vijay Nagar, Indore');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn pb-36">
      
      {/* Monthly Pass Active Status Banner */}
      <div className="glass-card p-5 border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-transparent dark:from-emerald-950/40 dark:via-[#0d1616] dark:to-[#0c1220] relative overflow-hidden shadow-2xl space-y-4">
        {/* Clean 2-Row Vertical Layout */}
        <div className="space-y-3.5 border-b border-hairline pb-4">
          {/* Row 1: Active Badge & Pass Title */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="bg-emerald-500/20 text-success border border-emerald-500/40 text-micro font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                ACTIVE MONTHLY PASS
              </span>
              <span className="text-micro font-mono text-content-muted font-bold">PASS-IND-50</span>
            </div>
            <h2 className="text-xl font-extrabold font-display text-content pt-1">
              Indore ↔ Dhar VIP Pass
            </h2>
            <p className="text-xs text-content-secondary">50 Doorstep Rides Included • Priority Seating</p>
          </div>

          {/* Row 2: Full-Width Balance & Validity Bar */}
          <div className="bg-surface-2 p-3 rounded-2xl border border-hairline flex justify-between items-center text-xs">
            <div>
              <span className="text-micro text-content-muted font-bold uppercase block">REMAINING RIDES</span>
              <span className="text-lg font-black font-display text-success">
                {ridesLeft} <span className="text-xs font-semibold text-content-muted">/ 50 Rides Left</span>
              </span>
            </div>

            <div className="text-right border-l border-hairline pl-4">
              <span className="text-micro text-content-muted font-bold uppercase block">VALIDITY</span>
              <span className="text-xs font-bold text-content">30 Sep 2026</span>
            </div>
          </div>
        </div>

        {/* Locked Doorstep Locations Display */}
        <div className="bg-surface-2 border border-hairline p-3.5 rounded-2xl text-xs space-y-2">
          <div className="flex justify-between items-center text-micro text-content-muted font-bold uppercase">
            <span>PRE-LOCKED DOORSTEP ADDRESSES</span>
            <button
              onClick={() => setIsEditingAddress(prev => !prev)}
              className="text-brand hover:underline text-micro font-bold"
            >
              {isEditingAddress ? 'Save Address' : '✏️ Edit Doorstep Address'}
            </button>
          </div>

          {isEditingAddress ? (
            <div className="space-y-2 pt-1">
              <div>
                <label className="text-micro text-content-muted font-bold uppercase block mb-1">Doorstep Pickup</label>
                <input
                  type="text"
                  value={lockedPickup}
                  onChange={e => setLockedPickup(e.target.value)}
                  className="w-full bg-surface-2 border border-indigo-500/50 p-2.5 rounded-xl text-content text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-micro text-content-muted font-bold uppercase block mb-1">Doorstep Drop</label>
                <input
                  type="text"
                  value={lockedDrop}
                  onChange={e => setLockedDrop(e.target.value)}
                  className="w-full bg-surface-2 border border-indigo-500/50 p-2.5 rounded-xl text-content text-xs font-semibold"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 pt-0.5">
              <div className="font-semibold text-content truncate">📍 Pickup: <span className="text-success">{lockedPickup}</span></div>
              <div className="font-semibold text-content truncate">🏁 Drop: <span className="text-info">{lockedDrop}</span></div>
            </div>
          )}
        </div>
      </div>

      {/* 1-Tap Daily Shuttle Reservation Controls */}
      <div className="glass-card p-5 space-y-4 border border-hairline">
        <div>
          <h3 className="text-base font-extrabold font-display">1-Tap Tomorrow Shuttle Reservation</h3>
          <p className="text-xs text-content-muted">Lock your seat for tomorrow with 1 tap. Zero forms.</p>
        </div>

        {/* Stacked Full-Width Cards to Prevent Overflow */}
        <div className="space-y-4">
          
          {/* Morning Shuttle Slot */}
          <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
            isMorningLocked
              ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/50 text-content shadow-md'
              : 'bg-surface-2 border-hairline text-content'
          }`}>
            {/* Header with Clean Badge */}
            <div className="flex justify-between items-center border-b border-hairline pb-2.5">
              <div>
                <span className="text-micro text-content-secondary font-extrabold uppercase tracking-wider block">MORNING SHUTTLE</span>
                <span className="text-2xl font-black font-mono text-success mt-0.5 block">08:00 AM</span>
              </div>
              <span className={`text-micro font-extrabold px-3 py-1 rounded-full whitespace-nowrap ${
                isMorningLocked ? 'bg-emerald-500/20 text-success border border-emerald-500/50' : 'bg-surface-2 text-content-secondary'
              }`}>
                {isMorningLocked ? '✓ SEAT LOCKED' : 'NOT BOOKED'}
              </span>
            </div>

            <div className="text-xs text-content-secondary flex justify-between items-center font-medium">
              <span>Route: <strong className="text-content font-extrabold">Dhar ➔ Indore</strong></span>
              <span className="text-micro text-content-muted font-mono font-bold">Cab: MP09 AB 1001</span>
            </div>

            <button
              onClick={() => {
                if (!isMorningLocked) {
                  setRidesLeft(prev => prev - 1);
                  setIsMorningLocked(true);
                  toast({
                    tone: 'success',
                    title: 'Morning shuttle locked — 08:00 AM',
                    detail: `Pickup: ${lockedPickup}\nVehicle: MP09 AB 1001`,
                  });
                } else {
                  setIsMorningLocked(false);
                  setRidesLeft(prev => prev + 1);
                }
              }}
              className={`w-full py-3 rounded-xl text-xs font-extrabold transition-all ${
                isMorningLocked
                  ? 'bg-surface-2 hover:bg-rose-500/15 text-danger border border-hairline'
                  : 'bg-gradient-to-r from-emerald-700 to-orange-700 hover:from-emerald-800 hover:to-orange-800 text-white shadow-md'
              }`}
            >
              {isMorningLocked ? 'Cancel Morning Reservation' : 'Lock Morning Shuttle (08:00 AM)'}
            </button>
          </div>

          {/* Evening Return Shuttle Slot */}
          <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
            isEveningLocked
              ? 'bg-indigo-500/10 dark:bg-indigo-950/30 border-indigo-500/50 text-content shadow-lg'
              : 'bg-surface-2 border-hairline text-content-secondary'
          }`}>
            {/* Header with Clean Badge */}
            <div className="flex justify-between items-center border-b border-hairline pb-2.5">
              <div>
                <span className="text-micro text-content-muted font-extrabold uppercase tracking-wider block">EVENING RETURN SHUTTLE</span>
                <span className="text-2xl font-black font-mono text-brand mt-0.5 block">06:00 PM</span>
              </div>
              <span className={`text-micro font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                isEveningLocked ? 'bg-indigo-500/20 text-brand border border-indigo-500/50' : 'bg-surface-3 text-content-muted'
              }`}>
                {isEveningLocked ? '✓ SEAT LOCKED' : 'NOT BOOKED'}
              </span>
            </div>

            <div className="text-xs text-content-secondary flex justify-between items-center">
              <span>Route: <strong className="text-content">Indore ➔ Dhar</strong></span>
              <span className="text-micro text-content-muted font-mono">Cab: MP09 AB 1002</span>
            </div>

            <button
              onClick={() => {
                if (!isEveningLocked) {
                  setRidesLeft(prev => prev - 1);
                  setIsEveningLocked(true);
                  toast({
                    tone: 'success',
                    title: 'Evening return locked — 06:00 PM',
                    detail: `Pickup: ${lockedDrop}\nVehicle: MP09 AB 1002`,
                  });
                } else {
                  setIsEveningLocked(false);
                  setRidesLeft(prev => prev + 1);
                }
              }}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                isEveningLocked
                  ? 'bg-surface-2 hover:bg-rose-600/30 text-danger border border-hairline'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md'
              }`}
            >
              {isEveningLocked ? 'Cancel Evening Reservation' : 'Lock Evening Return (06:00 PM)'}
            </button>
          </div>

        </div>
      </div>

      {/* Daily Pickup Notification Center */}
      <div className="glass-card p-4 border border-hairline space-y-2 bg-surface">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔔</span>
          <div>
            <h4 className="font-extrabold text-xs text-content">Daily Commuter Pickup Alert</h4>
            <div className="text-micro text-content-muted">Automated WhatsApp & SMS sent 15 mins before pickup</div>
          </div>
        </div>

        <div className="bg-surface-2 border border-hairline p-3 rounded-xl text-xs text-content-secondary space-y-1">
          <div className="font-bold text-success">⏰ Next Scheduled Pickup: Tomorrow at 08:00 AM</div>
          <div className="truncate">Location: <strong className="text-content">{lockedPickup}</strong></div>
          <div className="text-micro text-content-muted">Cab MP09 AB 1001 assigned • Driver Rajesh Sharma</div>
        </div>
      </div>

    </div>
  );
};
