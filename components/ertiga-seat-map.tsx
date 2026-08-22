'use client';

import React, { useState } from 'react';

interface ErtigaSeatMapProps {
  selectedSeatId: string;
  onSelectSeat: (seatId: string) => void;
  isFemalePassenger?: boolean;
  bookedSeats?: string[]; // Currently booked seats on this schedule
  onClose?: () => void;
}

export const ErtigaSeatMap: React.FC<ErtigaSeatMapProps> = ({
  selectedSeatId,
  onSelectSeat,
  isFemalePassenger = false,
  bookedSeats = [],
  onClose
}) => {
  const [genderFilter, setGenderFilter] = useState<'female' | 'male'>(isFemalePassenger ? 'female' : 'female');
  const [ruleMessage, setRuleMessage] = useState<string | null>(null);

  // Check if other 5 seats (2AW, 2B, 2CW, 3AW, 3BW) are all booked
  const nonFrontSeats = ['2AW', '2B', '2CW', '3AW', '3BW'];
  const areOther5SeatsBooked = nonFrontSeats.every(s => bookedSeats.includes(s));

  // Check if 2AW and 2CW are both booked by females
  const row2WindowsFemaleBooked = bookedSeats.includes('2AW') && bookedSeats.includes('2CW');

  // Handle seat click with rule validation
  const handleSeatClick = (code: string) => {
    setRuleMessage(null);

    // If already booked by someone else
    if (bookedSeats.includes(code)) {
      setRuleMessage(`⚠️ Seat ${code} is already booked by another passenger.`);
      return;
    }

    // RULE 1: Seat 1A (Front Left Co-Driver)
    if (code === '1A') {
      if (genderFilter === 'female' || areOther5SeatsBooked) {
        onSelectSeat('1A');
        setRuleMessage(`✅ Seat 1A Selected (${genderFilter === 'female' ? 'Female Priority' : 'All Seats Full Exception'})`);
      } else {
        setRuleMessage(`🔒 Seat 1A is reserved for Female Passengers. It opens for all once other 5 seats are booked.`);
      }
      return;
    }

    // RULE 2: Seat 2B (Row 2 Middle)
    if (code === '2B') {
      if (genderFilter === 'female') {
        if (row2WindowsFemaleBooked || bookedSeats.length >= 2) {
          onSelectSeat('2B');
          setRuleMessage(`✅ Seat 2B Middle Selected for Female Passenger.`);
        } else {
          onSelectSeat('2B');
          setRuleMessage(`ℹ️ Seat 2B Middle selected. Note: Middle seat is reserved for females when row 2 window seats are female-occupied.`);
        }
      } else {
        // Male passenger trying to book 2B
        onSelectSeat('2B');
      }
      return;
    }

    // RULE 3: Window Seats (2AW, 2CW, 3AW, 3BW) -> Open for ALL
    onSelectSeat(code);
    setRuleMessage(`✅ Seat ${code} Selected.`);
  };

  const getSeatStatusClass = (code: string) => {
    const isBooked = bookedSeats.includes(code);
    const isSelected = selectedSeatId === code;

    if (isBooked) {
      return 'bg-surface-3 border-hairline text-content-muted cursor-not-allowed';
    }
    if (isSelected) {
      return 'bg-gradient-to-tr from-emerald-700 to-teal-700 border-emerald-300 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)] scale-105';
    }
    if (code === '1A') {
      return 'bg-rose-500/20 border-rose-500/60 text-danger hover:bg-rose-500/30';
    }
    return 'bg-indigo-500/10 dark:bg-indigo-950/40 border-indigo-500/30 text-brand hover:border-indigo-400 hover:bg-indigo-500/20 dark:hover:bg-indigo-900/50';
  };

  return (
    <div className="bg-surface border border-hairline rounded-3xl p-5 text-content max-w-sm w-full mx-auto shadow-2xl space-y-4">
      
      {/* Title & Gender Selector Pill */}
      <div className="text-center space-y-2">
        <h3 className="font-extrabold text-base font-display">Select Your Ertiga Seat (RHD)</h3>
        <p className="text-micro text-content-muted">Right-Hand Drive • 6 Passengers</p>

        {/* Gender Toggle for Rule Testing */}
        <div className="flex bg-surface-2 p-1 rounded-xl border border-hairline w-fit mx-auto text-xs font-bold">
          <button
            onClick={() => setGenderFilter('female')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
              genderFilter === 'female' ? 'bg-rose-600 text-white shadow-md' : 'text-content-muted'
            }`}
          >
            <span>♀</span> Female Passenger
          </button>
          <button
            onClick={() => setGenderFilter('male')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
              genderFilter === 'male' ? 'bg-indigo-600 text-white shadow-md' : 'text-content-muted'
            }`}
          >
            <span>♂</span> Male Passenger
          </button>
        </div>
      </div>

      {/* Sleek RHD Ertiga Chassis Frame */}
      <div className="bg-surface-2 border-2 border-indigo-500/40 rounded-[32px] p-5 relative overflow-hidden shadow-inner space-y-5">
        
        {/* Windshield Indicator */}
        <div className="text-center text-micro text-brand font-black tracking-widest uppercase pb-2 border-b border-indigo-500/20">
          ▲ WINDSHIELD / FRONT (RIGHT-HAND DRIVE 🛞)
        </div>

        {/* ROW 1: Passenger 1A (Left) + Driver 🛞 (Right) */}
        <div className="flex justify-between items-center px-2">
          {/* Passenger 1A (Left) */}
          <button
            type="button"
            onClick={() => handleSeatClick('1A')}
            className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-bold text-xs transition-all shadow-lg ${getSeatStatusClass('1A')}`}
          >
            <span className="text-sm font-black">1A</span>
            <span className="text-micro font-extrabold uppercase mt-0.5">
              {genderFilter === 'female' ? '♀ Ladies 1st' : '♀ Priority'}
            </span>
          </button>

          {/* Steering Wheel / Driver (Right) */}
          <div className="w-16 h-16 rounded-2xl bg-surface-3 border-2 border-amber-500/40 flex flex-col items-center justify-center text-warning shadow-md">
            <span className="text-xl">🛞</span>
            <span className="text-micro font-black uppercase text-content-muted mt-0.5">DRIVER</span>
          </div>
        </div>

        {/* ROW 2: 3 Seats (2AW Left Window, 2B Middle, 2CW Right Window) */}
        <div className="flex justify-between items-center gap-1.5 px-1">
          {[
            { code: '2AW', label: 'Window' },
            { code: '2B', label: 'Middle (♀)' },
            { code: '2CW', label: 'Window' }
          ].map((seat) => (
            <button
              key={seat.code}
              type="button"
              onClick={() => handleSeatClick(seat.code)}
              className={`flex-1 h-14 rounded-2xl border-2 flex flex-col items-center justify-center font-bold text-xs transition-all shadow-md ${getSeatStatusClass(seat.code)}`}
            >
              <span className="text-sm font-black">{seat.code}</span>
              <span className="text-micro text-content-muted font-semibold">{seat.label}</span>
            </button>
          ))}
        </div>

        {/* ROW 3: 2 Seats (3AW Left Window, 3BW Right Window) */}
        <div className="flex justify-around items-center gap-3 px-4">
          {[
            { code: '3AW', label: 'Window' },
            { code: '3BW', label: 'Window' }
          ].map((seat) => (
            <button
              key={seat.code}
              type="button"
              onClick={() => handleSeatClick(seat.code)}
              className={`w-20 h-14 rounded-2xl border-2 flex flex-col items-center justify-center font-bold text-xs transition-all shadow-md ${getSeatStatusClass(seat.code)}`}
            >
              <span className="text-sm font-black">{seat.code}</span>
              <span className="text-micro text-content-muted font-semibold">{seat.label}</span>
            </button>
          ))}
        </div>

      </div>

      {/* Rule Helper Feedback Alert Box */}
      {ruleMessage && (
        <div className="bg-indigo-500/10 dark:bg-indigo-950/60 border border-indigo-500/40 p-3 rounded-2xl text-xs font-semibold text-brand text-center animate-fadeIn">
          {ruleMessage}
        </div>
      )}

      {/* Legend & Seat Allocation Rules Summary */}
      <div className="bg-surface-2 border border-hairline p-3 rounded-2xl text-micro space-y-1 text-content-secondary">
        <div className="font-extrabold text-brand uppercase tracking-wider text-micro">SJY SEAT ALLOCATION RULES</div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
          <span><strong>Seat 1A:</strong> Reserved for Female Passengers (opens for all if 5 seats booked).</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
          <span><strong>Seat 2B (Middle):</strong> Female priority when row 2 window seats are female-booked.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span><strong>Window Seats (2AW, 2CW, 3AW, 3BW):</strong> Open for all passengers.</span>
        </div>
      </div>

    </div>
  );
};
