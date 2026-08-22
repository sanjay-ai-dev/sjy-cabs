'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Navigation, ShieldCheck, Trash2 } from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { ChipGroup } from '@/components/pool/chip-group';
import { isValidPhone, usePoolProfile, usePoolRides } from '@/lib/pool-profile';

const GENDER_LABELS = ['Female', 'Male', 'Prefer not to say'] as const;

function genderToLabel(gender: string): string {
  if (gender === 'female') return 'Female';
  if (gender === 'male') return 'Male';
  return 'Prefer not to say';
}

export const ProfileView: React.FC = () => {
  const { toast } = useToast();
  const { profile, saveProfile, clearProfile, isHydrated } = usePoolProfile();
  const { rides } = usePoolRides();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<string>('Prefer not to say');
  const [error, setError] = useState<string | null>(null);

  // Mirror the stored profile into the form once localStorage has been read.
  useEffect(() => {
    if (!isHydrated) return;
    setName(profile.name);
    setPhone(profile.phone);
    setGender(genderToLabel(profile.gender));
  }, [isHydrated, profile.name, profile.phone, profile.gender]);

  const save = () => {
    if (name.trim().length < 2) {
      setError('Enter the name your ride partners should see.');
      return;
    }
    if (!isValidPhone(phone)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setError(null);
    saveProfile({
      name: name.trim(),
      phone: phone.replace(/\D/g, ''),
      gender: gender === 'Female' ? 'female' : gender === 'Male' ? 'male' : 'unspecified',
    });
    toast({
      tone: 'success',
      title: 'Profile saved',
      detail: 'Booking a seat is now a single tap.',
    });
  };

  return (
    <div className="space-y-6 px-4 py-5">
      <header className="space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight text-content">Profile</h1>
        <p className="text-meta text-content-muted">
          Saved on this device only. Your number is shared with a ride partner
          just when you join or publish a ride.
        </p>
      </header>

      <section className="space-y-3 rounded-3xl border border-hairline bg-surface p-4">
        <div>
          <label
            htmlFor="profile-name"
            className="mb-1 block text-micro font-semibold uppercase tracking-wide text-content-muted"
          >
            Name
          </label>
          <input
            id="profile-name"
            type="text"
            value={name}
            autoComplete="name"
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
            placeholder="Name commuters will see"
            className="w-full rounded-xl px-3"
          />
        </div>

        <div>
          <label
            htmlFor="profile-phone"
            className="mb-1 block text-micro font-semibold uppercase tracking-wide text-content-muted"
          >
            Mobile number
          </label>
          <input
            id="profile-phone"
            type="tel"
            inputMode="numeric"
            value={phone}
            autoComplete="tel"
            onChange={(event) => {
              setPhone(event.target.value);
              setError(null);
            }}
            placeholder="10-digit number"
            className="w-full rounded-xl px-3"
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-micro font-semibold uppercase tracking-wide text-content-muted">
            You are
          </h2>
          <ChipGroup
            label="Your gender"
            options={GENDER_LABELS}
            value={gender}
            onChange={setGender}
          />
        </div>

        {error && (
          <p role="alert" className="text-meta font-semibold text-danger">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={save}
          className="min-h-tap w-full rounded-xl bg-indigo-600 px-6 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
        >
          Save profile
        </button>
      </section>

      <section className="space-y-2">
        <h2 className="text-micro font-bold uppercase tracking-wide text-content-muted">
          Safety preferences
        </h2>

        <button
          type="button"
          role="switch"
          aria-checked={profile.femaleOnlyPreference}
          onClick={() => saveProfile({ femaleOnlyPreference: !profile.femaleOnlyPreference })}
          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
            profile.femaleOnlyPreference
              ? 'border-female bg-female/10'
              : 'border-hairline bg-surface hover:bg-surface-2'
          }`}
        >
          <ShieldCheck
            className={`h-5 w-5 shrink-0 ${
              profile.femaleOnlyPreference ? 'text-female' : 'text-content-muted'
            }`}
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-content">
              Prefer female-only rides
            </span>
            <span className="block text-micro text-content-muted">
              Turns the female-only filter on by default when you plan a trip
            </span>
          </span>
          <span
            aria-hidden="true"
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              profile.femaleOnlyPreference ? 'bg-female' : 'bg-surface-3'
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-surface transition-all ${
                profile.femaleOnlyPreference ? 'left-6' : 'left-1'
              }`}
            />
          </span>
        </button>

        <button
          type="button"
          role="switch"
          aria-checked={profile.shareLiveLocation}
          onClick={() => saveProfile({ shareLiveLocation: !profile.shareLiveLocation })}
          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
            profile.shareLiveLocation
              ? 'border-success bg-success/10'
              : 'border-hairline bg-surface hover:bg-surface-2'
          }`}
        >
          <Navigation
            className={`h-5 w-5 shrink-0 ${
              profile.shareLiveLocation ? 'text-success' : 'text-content-muted'
            }`}
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-content">
              Share live location on a trip
            </span>
            <span className="block text-micro text-content-muted">
              Only while a pooled trip is running, only with that vehicle
            </span>
          </span>
          <span
            aria-hidden="true"
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              profile.shareLiveLocation ? 'bg-success' : 'bg-surface-3'
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-surface transition-all ${
                profile.shareLiveLocation ? 'left-6' : 'left-1'
              }`}
            />
          </span>
        </button>
      </section>

      <section className="space-y-2">
        <h2 className="text-micro font-bold uppercase tracking-wide text-content-muted">
          Elsewhere
        </h2>
        <ul className="divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-surface">
          {[
            { href: '/community', label: 'Full community feed', hint: 'Every post, unfiltered' },
            { href: '/', label: 'DailyCab shuttle service', hint: 'Booked seats on our own Ertigas' },
          ].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex min-h-tap items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-content">{link.label}</span>
                  <span className="block text-micro text-content-muted">{link.hint}</span>
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 text-content-muted" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <button
          type="button"
          onClick={() => {
            clearProfile();
            setName('');
            setPhone('');
            setGender('Prefer not to say');
            toast({
              tone: 'info',
              title: 'Profile cleared',
              detail: `Your ${rides.length} saved ride${rides.length === 1 ? '' : 's'} are untouched.`,
            });
          }}
          className="flex min-h-tap w-full items-center justify-center gap-2 rounded-2xl border border-hairline bg-surface px-6 text-sm font-semibold text-content-secondary transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Clear saved details
        </button>
        <p className="text-micro leading-relaxed text-content-muted">
          Carpooling here is a community arrangement between commuters. Verify
          who you are travelling with, share your trip with someone you trust,
          and settle fuel shares directly.
        </p>
      </section>
    </div>
  );
};
