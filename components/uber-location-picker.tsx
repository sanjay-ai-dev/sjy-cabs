'use client';

import React, { useState } from 'react';

interface LocationPickerProps {
  pickupAddress: string;
  setPickupAddress: (val: string) => void;
  dropAddress: string;
  setDropAddress: (val: string) => void;
  onSwap?: () => void;
}

export const UberLocationPicker: React.FC<LocationPickerProps> = ({
  pickupAddress,
  setPickupAddress,
  dropAddress,
  setDropAddress,
  onSwap
}) => {
  const [activeInput, setActiveInput] = useState<'pickup' | 'drop' | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Popular Auto-Suggest Database (Indore, Dhar, Pithampur, Ujjain, Dewas)
  const SUGGESTED_LOCATIONS = [
    { icon: '📍', label: 'Use My Current Location (GPS)', category: 'gps' },
    { icon: '🏠', label: 'Home (House 14, Anand Nagar, Dhar)', category: 'saved' },
    { icon: '🏢', label: 'Work (Building 4, C21 Mall / Vijay Nagar, Indore)', category: 'saved' },
    { icon: '🏰', label: 'Rajwada Square / Main Market, Indore', category: 'hub' },
    { icon: '🛍️', label: 'Vijay Nagar Square / C21 Mall, Indore', category: 'hub' },
    { icon: '🚌', label: 'Dhar Bus Stand / Ahilya Fort, Dhar', category: 'hub' },
    { icon: '✈️', label: 'Devi Ahilya Bai Holkar Airport (IDR), Indore', category: 'transit' },
    { icon: '🏭', label: 'Pithampur Industrial Area Sector 3, Dhar', category: 'hub' },
    { icon: '🚂', label: 'Indore Junction Railway Station, Indore', category: 'transit' },
    { icon: '🏥', label: 'Bombay Hospital, Ring Road, Indore', category: 'landmark' },
    { icon: '🎓', label: 'IIM Indore / Rau Bypass, Indore', category: 'landmark' },
    { icon: '🛕', label: 'Mahakal Temple / Nanakheda, Ujjain', category: 'hub' },
    { icon: '🏔️', label: 'Tekri Mata Temple / Bus Stand, Dewas', category: 'hub' },
  ];

  // Geolocation API (Uber/Ola style GPS auto-locate)
  const handleGPSAutoLocate = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          const lat = position.coords.latitude.toFixed(4);
          const lng = position.coords.longitude.toFixed(4);
          const gpsAddress = `Current GPS (${lat}, ${lng}), Doorstep Pickup`;
          if (activeInput === 'drop') {
            setDropAddress(gpsAddress);
          } else {
            setPickupAddress(gpsAddress);
          }
          setActiveInput(null);
        },
        () => {
          setIsLocating(false);
          const fallback = `Dhar Main Square / Current GPS`;
          if (activeInput === 'drop') setDropAddress(fallback);
          else setPickupAddress(fallback);
          setActiveInput(null);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleSelectLocation = (locLabel: string, category: string) => {
    if (category === 'gps') {
      handleGPSAutoLocate();
      return;
    }
    if (activeInput === 'pickup') {
      setPickupAddress(locLabel);
    } else if (activeInput === 'drop') {
      setDropAddress(locLabel);
    }
    setActiveInput(null);
  };

  return (
    <div className="glass-card p-5 relative space-y-4 border-2 border-indigo-500/30 dark:bg-gradient-to-br dark:from-[#121420] dark:to-[#0c0e18] shadow-2xl">
      {/* Dual Vertical Timeline Card (Uber/Ola Signature Layout) */}
      <div className="relative flex items-center gap-3">
        {/* Timeline Dots & Connecting Line */}
        <div className="flex flex-col items-center justify-between py-3 h-28 z-10">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          <div className="w-0.5 h-14 bg-gradient-to-b from-emerald-400 via-indigo-500 to-cyan-400" />
          <span className="w-3.5 h-3.5 rounded-md bg-cyan-400 border-2 border-white shadow-[0_0_10px_rgba(0,242,254,0.8)]" />
        </div>

        {/* Inputs */}
        <div className="flex-1 space-y-3">
          {/* Pickup Input (Green Dot) */}
          <div className="relative">
            <label className="text-micro text-success font-extrabold uppercase tracking-wider block mb-1">
              Pickup Location
            </label>
            <input
              type="text"
              value={pickupAddress}
              onFocus={() => setActiveInput('pickup')}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Enter Pickup House No, Building, Area or Landmark"
              className="w-full bg-surface-2 border border-emerald-500/40 rounded-xl py-2.5 px-3 text-xs font-bold text-content outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 shadow-inner"
            />
          </div>

          {/* Drop Input (Cyan Square) */}
          <div className="relative">
            <label className="text-micro text-info font-extrabold uppercase tracking-wider block mb-1">
              Drop Location
            </label>
            <input
              type="text"
              value={dropAddress}
              onFocus={() => setActiveInput('drop')}
              onChange={(e) => setDropAddress(e.target.value)}
              placeholder="Enter Destination House No, Office, Mall or Area"
              className="w-full bg-surface-2 border border-cyan-500/40 rounded-xl py-2.5 px-3 text-xs font-bold text-content outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-inner"
            />
          </div>
        </div>

        {/* Floating Swap Button */}
        {onSwap && (
          <button
            type="button"
            onClick={onSwap}
            aria-label="Swap pickup and drop locations"
            className="min-h-tap min-w-tap grid shrink-0 place-items-center self-center rounded-full bg-indigo-600 text-base text-white shadow-lg transition-transform duration-300 hover:rotate-180 active:scale-95"
            title="Swap Pickup & Drop"
          >
            ⇅
          </button>
        )}
      </div>

      {/* Quick Favorite Location Badges (Home, Work, Airport, Station) */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-micro pt-1">
        <span className="text-content-muted self-center font-bold">Quick:</span>
        <button
          type="button"
          onClick={() => handleSelectLocation('Home (House 14, Anand Nagar, Dhar)', 'saved')}
          className="min-h-tap flex items-center gap-1 whitespace-nowrap rounded-lg border border-hairline bg-surface-2 px-3 font-bold text-content-secondary transition-colors hover:bg-surface-3"
        >
          🏠 Home
        </button>
        <button
          type="button"
          onClick={() => handleSelectLocation('Work (Building 4, C21 Mall, Vijay Nagar, Indore)', 'saved')}
          className="min-h-tap flex items-center gap-1 whitespace-nowrap rounded-lg border border-hairline bg-surface-2 px-3 font-bold text-content-secondary transition-colors hover:bg-surface-3"
        >
          🏢 Work
        </button>
        <button
          type="button"
          onClick={() => handleSelectLocation('Dhar Bus Stand / Ahilya Fort, Dhar', 'hub')}
          className="min-h-tap flex items-center gap-1 whitespace-nowrap rounded-lg border border-hairline bg-surface-2 px-3 font-bold text-content-secondary transition-colors hover:bg-surface-3"
        >
          🚌 Bus Stand
        </button>
        <button
          type="button"
          onClick={() => handleSelectLocation('Devi Ahilya Bai Holkar Airport (IDR), Indore', 'transit')}
          className="min-h-tap flex items-center gap-1 whitespace-nowrap rounded-lg border border-hairline bg-surface-2 px-3 font-bold text-content-secondary transition-colors hover:bg-surface-3"
        >
          ✈️ Airport
        </button>
        <button
          type="button"
          onClick={() => handleSelectLocation('Indore Junction Railway Station, Indore', 'transit')}
          className="min-h-tap flex items-center gap-1 whitespace-nowrap rounded-lg border border-hairline bg-surface-2 px-3 font-bold text-content-secondary transition-colors hover:bg-surface-3"
        >
          🚂 Station
        </button>
      </div>

      {/* Live Auto-Suggest Search Dropdown (Uber/Rapido style) */}
      {activeInput && (
        <div className="bg-surface border-2 border-indigo-500/50 rounded-2xl p-3 shadow-2xl space-y-2 max-h-64 overflow-y-auto animate-fadeIn z-30">
          <div className="flex justify-between items-center pb-2 border-b border-hairline text-xs">
            <span className="font-extrabold text-brand">
              {activeInput === 'pickup' ? '🟢 Select Pickup Location' : '🔴 Select Drop Location'}
            </span>
            <button
              type="button"
              onClick={() => setActiveInput(null)}
              className="text-content-muted hover:text-content font-bold text-xs"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-1">
            {SUGGESTED_LOCATIONS.map((loc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectLocation(loc.label, loc.category)}
                className="w-full text-left p-2.5 rounded-xl hover:bg-indigo-500/20 border border-transparent hover:border-indigo-500/40 flex items-center gap-3 text-xs transition-all group"
              >
                <span className="text-base group-hover:scale-125 transition-transform">{loc.icon}</span>
                <span className="font-semibold text-content group-hover:text-content flex-1">{loc.label}</span>
                {loc.category === 'saved' && <span className="text-micro bg-amber-500/20 text-warning px-1.5 py-0.5 rounded font-bold">SAVED</span>}
                {loc.category === 'gps' && <span className="text-micro bg-emerald-500/20 text-success px-1.5 py-0.5 rounded font-bold">{isLocating ?'LOCATING...' : 'LIVE GPS'}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
