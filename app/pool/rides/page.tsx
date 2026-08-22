import { RidesView } from '@/components/pool/rides-view';

export const metadata = {
  title: 'My rides — DailyCab Pool',
  description: 'Seats you have taken and rides you have published.',
};

export default function PoolRidesPage() {
  return <RidesView />;
}
