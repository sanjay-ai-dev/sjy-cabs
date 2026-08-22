import type { Metadata } from 'next';
import { PoolShell } from '@/components/pool/pool-shell';

export const metadata: Metadata = {
  title: 'DailyCab Pool — Carpool the Dhar ↔ Indore corridor',
  description:
    'Community carpooling, bikepooling and taxipooling for daily commuters between Dhar and Indore. Find a seat, offer one, and split the fuel.',
};

export default function PoolLayout({ children }: { children: React.ReactNode }) {
  return <PoolShell>{children}</PoolShell>;
}
