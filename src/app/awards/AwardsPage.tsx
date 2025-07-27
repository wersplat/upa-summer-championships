'use client';

import dynamic from 'next/dynamic';
import { PlayerStats } from './page';

const AwardsClientWrapper = dynamic(
  () => import('./AwardsClientWrapper'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }
);

interface AwardsPageProps {
  omvpCandidates: PlayerStats[];
  dmvpCandidates: PlayerStats[];
  rookieCandidates: PlayerStats[];
}

export default function AwardsPage({ omvpCandidates, dmvpCandidates, rookieCandidates }: AwardsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
      <AwardsClientWrapper 
        omvpCandidates={omvpCandidates} 
        dmvpCandidates={dmvpCandidates} 
        rookieCandidates={rookieCandidates} 
      />
    </div>
  );
}
