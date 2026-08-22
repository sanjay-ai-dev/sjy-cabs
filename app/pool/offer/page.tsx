import { Suspense } from 'react';
import { OfferView } from '@/components/pool/offer-view';
import { PoolSkeleton } from '@/components/pool/pool-skeleton';

export const metadata = {
  title: 'Post a ride — DailyCab Pool',
  description:
    'Offer your empty seats, or ask the community for one, on the Dhar ↔ Indore corridor.',
};

export default function PoolOfferPage() {
  return (
    <Suspense fallback={<PoolSkeleton />}>
      <OfferView />
    </Suspense>
  );
}
