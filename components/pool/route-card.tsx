'use client';

import React, { useState } from 'react';
import { ArrowUpDown, LocateFixed, Repeat } from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { LocationCombobox } from '@/components/pool/location-combobox';
import { nearestPlace } from '@/lib/pool-config';

interface RouteCardProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onSwap: () => void;
  /** Token text-colour class for the endpoint indicators, e.g. `text-brand`. */
  accentText: string;
}

/** The two directions almost every commuter on this corridor wants. */
const PRESETS = [
  { label: 'Dhar → Indore', from: 'Dhar Bus Stand', to: 'Vijay Nagar (IT Park)' },
  { label: 'Indore → Dhar', from: 'Vijay Nagar (IT Park)', to: 'Dhar Bus Stand' },
] as const;

export const RouteCard: React.FC<RouteCardProps> = ({
  from,
  to,
  onFromChange,
  onToChange,
  onSwap,
  accentText,
}) => {
  const { toast } = useToast();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = () => {
    if (!('geolocation' in navigator)) {
      toast({
        tone: 'warning',
        title: 'Location unavailable',
        detail: 'This browser cannot share a GPS position. Type your pickup point instead.',
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const place = nearestPlace(position.coords.latitude, position.coords.longitude);
        onFromChange(place.name);
        setIsLocating(false);
        toast({
          tone: 'success',
          title: `Pickup set to ${place.name}`,
          detail: 'Nearest known landmark to your position. Edit it if you need a closer point.',
        });
      },
      () => {
        setIsLocating(false);
        toast({
          tone: 'warning',
          title: 'Could not get your location',
          detail: 'Allow location access, or type your pickup point.',
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative rounded-3xl border border-hairline bg-surface">
        <div className="flex items-center gap-3 py-1 pl-4 pr-16">
          <span
            className={`h-3 w-3 shrink-0 rounded-full ${accentText}`}
            style={{ backgroundColor: 'currentColor' }}
            aria-hidden="true"
          />
          <LocationCombobox
            id="pool-from"
            label="From"
            value={from}
            onChange={onFromChange}
            placeholder="Colony, square or landmark"
          />
        </div>

        {/* Connector: a dotted stub under the origin dot, then a hairline rule
            across the rest of the row to separate the two fields. */}
        <div className="flex items-center gap-3 pl-4 pr-16" aria-hidden="true">
          <span className="ml-[0.3rem] h-3 w-0 shrink-0 border-l-2 border-dotted border-hairline" />
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <div className="flex items-center gap-3 py-1 pl-4 pr-16">
          <span
            className={`h-3 w-3 shrink-0 rounded-full border-2 ${accentText}`}
            style={{ borderColor: 'currentColor' }}
            aria-hidden="true"
          />
          <LocationCombobox
            id="pool-to"
            label="To"
            value={to}
            onChange={onToChange}
            placeholder="Office, college or landmark"
          />
        </div>

        <button
          type="button"
          onClick={onSwap}
          aria-label="Swap pickup and drop"
          className="absolute right-3 top-1/2 flex min-h-tap min-w-tap -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-surface-2 text-content-secondary transition-colors hover:bg-surface-3 hover:text-content"
        >
          <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleLocate}
          disabled={isLocating}
          className="inline-flex min-h-tap items-center gap-2 rounded-full border border-hairline bg-surface px-4 text-meta font-semibold text-content-secondary transition-colors hover:bg-surface-2 hover:text-content disabled:opacity-60"
        >
          <LocateFixed
            className={`h-4 w-4 ${isLocating ? 'motion-safe:animate-pulse' : ''}`}
            aria-hidden="true"
          />
          {isLocating ? 'Locating…' : 'Use my location'}
        </button>

        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              onFromChange(preset.from);
              onToChange(preset.to);
            }}
            className="inline-flex min-h-tap items-center gap-2 rounded-full border border-hairline bg-surface px-4 text-meta font-semibold text-content-secondary transition-colors hover:bg-surface-2 hover:text-content"
          >
            <Repeat className="h-3.5 w-3.5" aria-hidden="true" />
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};
