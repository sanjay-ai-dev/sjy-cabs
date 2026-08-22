import { Suspense } from 'react';
import { PlannerView } from '@/components/pool/planner-view';
import { PoolSkeleton } from '@/components/pool/pool-skeleton';

export const metadata = {
  title: 'Plan a pooled trip — DailyCab Pool',
  description:
    'Tell us where you are going and when. Find commuters on the Dhar ↔ Indore corridor travelling the same way.',
};

export default function PoolPlannerPage() {
  return (
    <Suspense fallback={<PoolSkeleton withMap />}>
      <PlannerView />
    </Suspense>
  );
}
