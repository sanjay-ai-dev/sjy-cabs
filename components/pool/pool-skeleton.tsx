import React from 'react';

/**
 * Suspense fallback for the /pool screens.
 *
 * Every one of them reads `useSearchParams()`, which opts a client component
 * out of static rendering unless it sits behind a Suspense boundary. This is
 * that boundary's placeholder — laid out to roughly match the real screen so
 * the swap doesn't shift the page.
 */
export const PoolSkeleton: React.FC<{ withMap?: boolean }> = ({ withMap = false }) => (
  <div aria-hidden="true" className="motion-safe:animate-pulse">
    {withMap && <div className="h-[32vh] min-h-[190px] w-full bg-surface-2" />}
    <div className="space-y-4 px-4 py-5">
      <div className="h-6 w-2/5 rounded-lg bg-surface-2" />
      <div className="h-28 rounded-3xl bg-surface-2" />
      <div className="h-20 rounded-2xl bg-surface-2" />
      <div className="h-20 rounded-2xl bg-surface-2" />
      <div className="h-14 rounded-2xl bg-surface-2" />
    </div>
    <span className="sr-only">Loading</span>
  </div>
);
