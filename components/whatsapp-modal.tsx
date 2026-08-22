'use client';

import React from 'react';
import { Modal } from './modal';
import { useToast } from './toast-provider';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingCode: string;
  fromCity: string;
  toCity: string;
  selectedTime: string;
  seats: number;
  isLadiesPriority: boolean;
  totalFare: number;
  pickupLandmark: string;
  dropLandmark: string;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  bookingCode,
  fromCity,
  toCity,
  selectedTime,
  seats,
  isLadiesPriority,
  totalFare,
  pickupLandmark,
  dropLandmark,
}) => {
  const { toast } = useToast();

  const whatsappMessageText = `✅ *DAILYCAB DOORSTEP BOOKING CONFIRMED!* [${bookingCode}]
🚗 *Route:* ${fromCity} ➔ ${toCity}
📅 *Schedule:* Tomorrow, ${selectedTime}
💺 *Seats:* ${seats} Seat(s) ${isLadiesPriority ? '(♀ Ladies Priority)' : ''}
🚪 *Exact Doorstep Pickup:* ${pickupLandmark}
🏁 *Exact Doorstep Drop:* ${dropLandmark}
🚘 *Vehicle:* MP09 AB 1001 (Maruti Ertiga)
👤 *Driver:* Rajesh Sharma (919876540001)
💰 *Amount Payable:* ₹${totalFare} ${totalFare === 0 ? '(50-Ride Pass Redeemed)' : ''}
📍 *Live Shuttle Tracking:* https://sjy.co.in/track/${bookingCode}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${fromCity} ➔ ${toCity}`}
      subtitle={`Tomorrow • ${selectedTime} • ${seats} seat${seats === 1 ? '' : 's'}${
        isLadiesPriority ? ' • ♀ Ladies priority' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-success">
          <span className="h-2 w-2 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
          BOOKING CONFIRMED
        </span>
        <span className="font-mono text-xs text-content-muted">{bookingCode}</span>
      </div>

      <div className="space-y-2 rounded-2xl border border-hairline bg-surface-2 p-4 text-xs">
        <div className="text-micro font-bold uppercase tracking-wider text-content-muted">
          Door-to-door route
        </div>
        <div className="font-semibold text-content">📍 Pickup: {pickupLandmark}</div>
        <div className="font-semibold text-content">🏁 Drop: {dropLandmark}</div>
        <div className="border-t border-hairline pt-1 text-brand">
          🚗 MP09 AB 1001 (Maruti Ertiga) • Driver: Rajesh Sharma
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">
        <span className="text-sm font-semibold">Total payable</span>
        <span className="text-2xl font-extrabold text-brand">
          ₹{totalFare}
          {totalFare === 0 && (
            <span className="ml-1 text-xs font-semibold">(pass redeemed)</span>
          )}
        </span>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-tap w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-indigo-600 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/30 transition-all hover:from-emerald-800 hover:to-indigo-700"
        >
          <span aria-hidden="true">🚖</span> Track live driver approach
        </button>

        <button
          type="button"
          onClick={() =>
            toast({
              tone: 'success',
              title: 'WhatsApp ticket sent',
              detail: whatsappMessageText.replace(/\*/g, ''),
            })
          }
          className="min-h-tap w-full rounded-xl border border-hairline bg-surface-2 py-2.5 text-xs font-bold text-content transition-colors hover:bg-surface-3"
        >
          📱 Send WhatsApp ticket
        </button>
      </div>
    </Modal>
  );
};
