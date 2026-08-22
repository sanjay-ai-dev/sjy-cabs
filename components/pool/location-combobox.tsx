'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { searchPlaces, type PoolPlace } from '@/lib/pool-config';

interface LocationComboboxProps {
  /** Must be unique on the page — derives the listbox and option ids. */
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/**
 * Landmark picker for a pickup or drop point.
 *
 * A combobox rather than a `<select>`: doorstep carpooling means the useful
 * answer is often a colony or a square that isn't on any list, so free text has
 * to stay valid. The suggestions exist to make the common corridor stops one
 * tap, not to constrain the input.
 */
export const LocationCombobox: React.FC<LocationComboboxProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const listboxId = `${id}-listbox`;
  const suggestions = useMemo<PoolPlace[]>(() => searchPlaces(value), [value]);

  // A typed value that already names a landmark needs no dropdown.
  const exactMatch = suggestions.length === 1 && suggestions[0].name === value;
  const showList = isOpen && suggestions.length > 0 && !exactMatch;

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [isOpen]);

  const commit = (place: PoolPlace) => {
    onChange(place.name);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!showList) {
        setIsOpen(true);
        setActiveIndex(0);
        return;
      }
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const next = (activeIndex + delta + suggestions.length) % suggestions.length;
      setActiveIndex(next);
      return;
    }

    if (event.key === 'Enter' && showList && activeIndex >= 0) {
      event.preventDefault();
      commit(suggestions[activeIndex]);
      return;
    }

    if (event.key === 'Escape' && isOpen) {
      // Stop here so this doesn't also close an enclosing dialog.
      event.stopPropagation();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex min-w-0 flex-1 items-center gap-3">
      {/* Caption sits beside the value, not above it, so the origin and
          destination dots line up with the text they mark. */}
      <label
        htmlFor={id}
        className="w-12 shrink-0 text-micro font-semibold uppercase tracking-wide text-content-muted"
      >
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          showList && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
        }
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={onKeyDown}
        // Bare-looking field: the card already provides the chrome, and a nested
        // input border makes the route card read as a form rather than a route.
        // Font size stays at the inherited 16px so iOS Safari doesn't zoom, and
        // the global :focus-visible outline is left intact — this input is the
        // primary keyboard target on the screen.
        className="min-h-tap w-full min-w-0 flex-1 truncate border-0 bg-transparent p-0 font-semibold text-content placeholder:font-normal placeholder:text-content-muted"
      />

      {showList && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-hairline bg-surface p-1 shadow-xl scrollbar-thin"
        >
          {suggestions.map((place, index) => (
            <li key={place.id} role="none">
              <button
                type="button"
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                // Commit before blur so the click isn't lost to the
                // outside-pointer handler closing the list first.
                onMouseDown={(event) => {
                  event.preventDefault();
                  commit(place);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex min-h-tap w-full items-center gap-3 rounded-xl px-3 text-left transition-colors ${
                  index === activeIndex ? 'bg-surface-3' : 'hover:bg-surface-2'
                }`}
              >
                <MapPin className="h-4 w-4 shrink-0 text-content-muted" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-content">
                    {place.name}
                  </span>
                  <span className="block text-micro text-content-muted">{place.city}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
