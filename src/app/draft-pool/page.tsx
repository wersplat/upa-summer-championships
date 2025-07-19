import dynamic from 'next/dynamic';
import { supabase } from '@/utils/supabase';

// Define the draft pool player with extended info
interface DraftPoolPlayerWithInfo {
  player_id: string;
  declared_at: string;
  status: string;
  season?: string;
  draft_rating?: number;
  draft_notes?: string;
  player: {
    id: string;
    gamertag: string;
    position?: string | null;
    region_id?: string | null;
    current_team_id?: string | null;
    teams?: Array<{
      id: string;
      name: string;
      logo_url: string | null;
    }>;
  };
}

// Dynamically import the DraftPoolPageClient component
const DraftPoolPageClient = dynamic<{ 
  draftPlayers: DraftPoolPlayerWithInfo[];
  showFallbackMessage: boolean;
}>(
  () => import('./DraftPoolPageClient').then(mod => mod.default),
  { 
    loading: () => <div>Loading draft pool...</div> 
  }
);

export const revalidate = 30; // Revalidate data every 30 seconds for near-live updates

async function getDraftPoolPlayers(): Promise<DraftPoolPlayerWithInfo[]> {
  try {
    const { data, error } = await supabase
      .from('draft_pool')
      .select(`
        player_id,
        declared_at,
        status,
        season,
        draft_rating,
        draft_notes,
        player:players (
          id,
          gamertag,
          position,
          region_id,
          current_team_id,
          teams (
            id,
            name,
            logo_url
          )
        )
      `)
      .eq('status', 'available')
      .order('draft_rating', { ascending: false, nullsFirst: false })
      .order('declared_at', { ascending: false });

    if (error) {
      console.error('Error fetching draft pool players:', error);
      return [];
    }

    // Filter out any entries where player data is missing and cast to proper type
    const validDraftPlayers = (data || []).filter(
      (entry) => entry.player !== null && typeof entry.player === 'object'
    ) as unknown as DraftPoolPlayerWithInfo[];

    return validDraftPlayers;
  } catch (error) {
    console.error('Unexpected error fetching draft pool players:', error);
    return [];
  }
}

// This is a server component that fetches data and passes it to the client component
export default async function DraftPoolPage() {
  const draftPlayers = await getDraftPoolPlayers();
  const showFallbackMessage = draftPlayers.length === 0;

  return (
    <DraftPoolPageClient 
      draftPlayers={draftPlayers} 
      showFallbackMessage={showFallbackMessage}
    />
  );
}
