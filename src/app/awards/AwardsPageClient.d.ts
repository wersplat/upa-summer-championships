import { PlayerStats } from './page';

declare module 'AwardsPageClient' {
  interface AwardsPageClientProps {
    omvpCandidates: PlayerStats[];
    dmvpCandidates: PlayerStats[];
    rookieCandidates: PlayerStats[];
  }

  const AwardsPageClient: React.FC<AwardsPageClientProps>;
  export default AwardsPageClient;
}
