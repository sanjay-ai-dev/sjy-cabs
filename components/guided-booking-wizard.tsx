'use client';

import React, { useState } from 'react';
import { DAILY_SCHEDULE_SLOTS } from '@/lib/routes-config';
import { UberLocationPicker } from '@/components/uber-location-picker';
import { ErtigaSeatMap } from '@/components/ertiga-seat-map';

interface WizardProps {
  fromCity: string;
  toCity: string;
  onBookingComplete: (details: any) => void;
  onOpenMonthlyPass?: () => void;
}

export const GuidedBookingWizard: React.FC<WizardProps> = ({
  fromCity,
  toCity,
  onBookingComplete,
  onOpenMonthlyPass
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State Across Steps
  const [pickupAddress, setPickupAddress] = useState('House 14, Anand Nagar, Dhar Bus Stand Road');
  const [dropAddress, setDropAddress] = useState('Building 4, C21 Mall / Vijay Nagar, Indore');
  const [selectedSlotTime, setSelectedSlotTime] = useState('08:00 AM');
  const [selectedSlotCode, setSelectedSlotCode] = useState('SLOT-08AM');
  const [selectedSeat, setSelectedSeat] = useState<string>('2AW');
  const [passengerName, setPassengerName] = useState('Priya Patel');
  const [passengerPhone, setPassengerPhone] = useState('98260 12345');
  const [passengerGender, setPassengerGender] = useState<'female' | 'male'>('female');

  const handleFinalConfirm = () => {
    const bookingCode = `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    onBookingComplete({
      bookingCode,
      pickup: pickupAddress,
      drop: dropAddress,
      time: selectedSlotTime,
      seat: selectedSeat,
      name: passengerName,
      phone: passengerPhone,
      gender: passengerGender,
      fare: 250
    });
  };

  return (
    <div className="space-y-5">
      {/* STEP 1: DOORSTEP PICKUP & DROP LOCATIONS */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-fadeIn">
          <div className="glass-card p-5 space-y-5 border border-hairline">
            <div>
              <h2 className="text-base font-extrabold font-display text-content">Doorstep Pickup & Drop</h2>
              <p className="text-xs text-content-muted">Intercity express shuttle • {fromCity} ➔ {toCity}</p>
            </div>

            <UberLocationPicker
              pickupAddress={pickupAddress}
              setPickupAddress={setPickupAddress}
              dropAddress={dropAddress}
              setDropAddress={setDropAddress}
              onSwap={() => {
                const temp = pickupAddress;
                setPickupAddress(dropAddress);
                setDropAddress(temp);
              }}
            />

            <button
              onClick={() => setCurrentStep(2)}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-4 rounded-2xl text-xs font-black transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Schedule</span>
              <span>➔</span>
            </button>
          </div>

          {/* MONTHLY PASS SUBSCRIBER PROMO AD CARD */}
          <div className="glass-card p-4 border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-orange-500/10 relative overflow-hidden shadow-xl space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-xl flex items-center justify-center shadow-md">
                  💳
                </div>
                <div>
                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest block">
                    DAILY PASS SUBSCRIBER
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                    Save ₹3,000/mo with Daily Commuter Pass
                  </h4>
                </div>
              </div>
              <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap">
                ₹90 / Ride
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              50 prepaid intercity rides valid for 30 days. Guaranteed morning & evening doorstep seat locks with hassle-free pass management.
            </p>

            <button
              onClick={() => {
                if (onOpenMonthlyPass) onOpenMonthlyPass();
              }}
              className="w-full bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white py-3 rounded-xl text-xs font-extrabold transition-all border border-slate-700 dark:border-white/20 flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span>View My Monthly Pass Dashboard</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: TIME SLOT SELECTION */}
      {currentStep === 2 && (
        <div className="glass-card p-5 space-y-5 border border-hairline animate-fadeIn">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-micro text-brand font-extrabold uppercase tracking-widest">SCHEDULE</span>
              <h2 className="text-lg font-extrabold font-display text-content mt-0.5">Select Shuttle Departure Time</h2>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs text-content-muted hover:text-content font-bold underline"
            >
              ← Change Location
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {DAILY_SCHEDULE_SLOTS.map(slot => {
              const isSelected = selectedSlotCode === slot.id;
              return (
                <button
                  key={slot.id}
                  onClick={() => {
                    setSelectedSlotCode(slot.id);
                    setSelectedSlotTime(slot.time);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/15 text-content shadow-lg ring-2 ring-emerald-500/30'
                      : 'border-hairline bg-surface-2 hover:bg-surface-3 text-content-secondary'
                  }`}
                >
                  <div className="text-micro font-mono text-content-muted uppercase tracking-wider">{slot.id} • {slot.route}</div>
                  <div className="text-base font-black font-mono text-content mt-0.5">{slot.time}</div>
                  <div className="text-micro font-bold text-success mt-1">{slot.seatsLeft} Seats Available</div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentStep(3)}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-4 rounded-2xl text-xs font-black transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Interactive Seat Selection</span>
            <span>➔</span>
          </button>
        </div>
      )}

      {/* STEP 3: ERTIGA SEAT MAP */}
      {currentStep === 3 && (
        <div className="glass-card p-5 space-y-5 border border-hairline animate-fadeIn">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-micro text-brand font-extrabold uppercase tracking-widest">SEAT SELECTION</span>
              <h2 className="text-lg font-extrabold font-display text-content mt-0.5">Select Your Seat</h2>
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              className="text-xs text-content-muted hover:text-content font-bold underline"
            >
              ← Change Time
            </button>
          </div>

          <ErtigaSeatMap
            selectedSeatId={selectedSeat}
            onSelectSeat={(seatId) => setSelectedSeat(seatId)}
            isFemalePassenger={passengerGender === 'female'}
          />

          <button
            onClick={() => setCurrentStep(4)}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-4 rounded-2xl text-xs font-black transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue to Review & Pay (₹250)</span>
            <span>➔</span>
          </button>
        </div>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {currentStep === 4 && (
        <div className="glass-card p-5 space-y-5 border border-hairline animate-fadeIn">
          <div className="flex justify-between items-center border-b border-hairline pb-3">
            <div>
              <span className="text-micro text-brand font-extrabold uppercase tracking-widest">CONFIRMATION</span>
              <h2 className="text-lg font-extrabold font-display text-content mt-0.5">Booking Summary</h2>
            </div>
            <button
              onClick={() => setCurrentStep(3)}
              className="text-xs text-content-muted hover:text-content font-bold underline"
            >
              ← Change Seat
            </button>
          </div>

          <div className="bg-surface-2 p-4 rounded-2xl border border-hairline space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-hairline pb-2">
              <span className="text-content-muted font-semibold">Route & Vehicle</span>
              <span className="font-extrabold text-content">{fromCity} ➔ {toCity} (Ertiga ZXI)</span>
            </div>
            <div className="flex justify-between items-center border-b border-hairline pb-2">
              <span className="text-content-muted font-semibold">Departure Time</span>
              <span className="font-extrabold font-mono text-brand">{selectedSlotTime}</span>
            </div>
            <div className="flex justify-between items-center border-b border-hairline pb-2">
              <span className="text-content-muted font-semibold">Selected Seat</span>
              <span className="font-extrabold text-success font-mono">{selectedSeat}</span>
            </div>
            <div className="flex justify-between items-center border-b border-hairline pb-2">
              <span className="text-content-muted font-semibold">Doorstep Pickup</span>
              <span className="font-bold text-content truncate max-w-[200px]">{pickupAddress}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-content-muted font-semibold">Doorstep Drop</span>
              <span className="font-bold text-content truncate max-w-[200px]">{dropAddress}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-micro text-content-muted font-extrabold uppercase block mb-1">Passenger Name</label>
              <input
                type="text"
                value={passengerName}
                onChange={e => setPassengerName(e.target.value)}
                className="w-full p-3 rounded-xl border border-hairline bg-surface-2 text-xs font-bold text-content"
              />
            </div>
            <div>
              <label className="text-micro text-content-muted font-extrabold uppercase block mb-1">Mobile Number (WhatsApp Updates)</label>
              <input
                type="text"
                value={passengerPhone}
                onChange={e => setPassengerPhone(e.target.value)}
                className="w-full p-3 rounded-xl border border-hairline bg-surface-2 text-xs font-bold text-content"
              />
            </div>
          </div>

          <button
            onClick={handleFinalConfirm}
            className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white py-4 rounded-2xl text-sm font-black transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Confirm & Reserve Seat (₹250)</span>
            <span>➔</span>
          </button>
        </div>
      )}
    </div>
  );
};
