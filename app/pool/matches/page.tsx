import { Suspense } from 'react';
import { MatchesView } from '@/components/pool/matches-view';
import { PoolSkeleton } from '@/components/pool/pool-skeleton';

export const metadata = {
  title: 'Matching rides — DailyCab Pool',
  description: 'Carpool, bikepool and taxipool matches along your route.',
};

export default function PoolMatchesPage() {
  return (
    <Suspense fallback={<PoolSkeleton />}>
      <MatchesView />
    </Suspense>
  );
}
