'use client';

import React, { useRef } from 'react';
import { Bike, Car, PersonStanding, type LucideIcon } from 'lucide-react';
import { POOL_ROLES, POOL_ROLE_ORDER, type PoolRole } from '@/lib/pool-config';

const ICONS: Record<PoolRole, LucideIcon> = {
  RIDER: PersonStanding,
  BIKER: Bike,
  CAR_OWNER: Car,
};

interface RoleSwitcherProps {
  value: PoolRole;
  onChange: (role: PoolRole) => void;
}

/**
 * Segmented control for who the person is on this trip.
 *
 * Radio semantics, not tabs: picking a role changes what the rest of the form
 * *means* — seats offered versus seats wanted — rather than swapping which panel
 * is visible. Screen-reader users get "Car Owner, radio button, 3 of 3" which is
 * the accurate description.
 */
export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ value, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const delta =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (delta === 0) return;

    event.preventDefault();
    const current = POOL_ROLE_ORDER.indexOf(value);
    const next = POOL_ROLE_ORDER[(current + delta + POOL_ROLE_ORDER.length) % POOL_ROLE_ORDER.length];
    onChange(next);
    // Roving tabindex: move focus with the selection so arrow keys keep working.
    containerRef.current
      ?.querySelector<HTMLButtonElement>(`[data-role="${next}"]`)
      ?.focus();
  };

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label="Your role on this trip"
      onKeyDown={onKeyDown}
      className="flex items-stretch gap-1 border-b border-hairline"
    >
      {POOL_ROLE_ORDER.map((roleId) => {
        const role = POOL_ROLES[roleId];
        const Icon = ICONS[roleId];
        const selected = roleId === value;

        return (
          <button
            key={roleId}
            type="button"
            role="radio"
            data-role={roleId}
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(roleId)}
            className={`relative flex min-h-tap flex-1 flex-col items-center justify-center gap-1 rounded-t-xl px-2 pb-3 pt-2 transition-colors ${
              selected ? role.text : 'text-content-muted hover:text-content-secondary'
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={selected ? 2.4 : 1.9} />
            <span className={`text-meta ${selected ? 'font-bold' : 'font-semibold'}`}>
              {selected ? role.activeLabel : role.label}
            </span>
            {/* 2px indicator sitting on the group's own bottom border. */}
            <span
              aria-hidden="true"
              className={`absolute -bottom-px left-2 right-2 h-0.5 rounded-full transition-opacity ${
                selected ? 'bg-current opacity-100' : 'opacity-0'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
