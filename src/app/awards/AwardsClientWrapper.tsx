'use client';

import dynamic from 'next/dynamic';
import { PlayerStats } from './page';

const AwardsPageClient = dynamic(
  () => import('./AwardsPageClient'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }
);

export default function AwardsClientWrapper({ 
  omvpCandidates, 
  dmvpCandidates, 
  rookieCandidates 
}: { 
  omvpCandidates: PlayerStats[];
  dmvpCandidates: PlayerStats[];
  rookieCandidates: PlayerStats[];
}) {
  return (
    <AwardsPageClient
      omvpCandidates={omvpCandidates}
      dmvpCandidates={dmvpCandidates}
      rookieCandidates={rookieCandidates}
    />
  );
}
