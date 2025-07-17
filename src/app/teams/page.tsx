import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Typography,
} from '@mui/material';

export const revalidate = 3600; // Revalidate data every hour

interface TeamWithRegion {
  id: string;
  name: string;
  logo_url: string | null;
  region_id: string | null;
  current_rp: number | null;
  elo_rating: number | null;
  global_rank: number | null;
  leaderboard_tier: string | null;
  created_at: string;
  regions: Array<{
    id: string;
    name: string;
  }>;
}

async function getTeams(): Promise<TeamWithRegion[]> {
  try {
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        logo_url,
        region_id,
        current_rp,
        elo_rating,
        global_rank,
        leaderboard_tier,
        created_at,
        regions (id, name)
      `)
      .order('elo_rating', { ascending: false });

    if (error) throw error;
    return teams || [];
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
}

export default async function TeamsPage() {
  const teams = await getTeams();

  return (
    <div style={{ minHeight: '100vh', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>
            UPA Summer Championships
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 560, margin: '0 auto' }}>
            Explore teams and track their progress throughout the season
          </Typography>
        </div>

        <Grid container spacing={2}>
          {teams.map(team => (
            <Grid item xs={12} sm={6} md={3} key={team.id}>
              <Card component={Link} href={`/teams/${team.id}`} sx={{ textDecoration: 'none', boxShadow: '0 0 10px rgba(246,216,96,0.4)', height: '100%' }}>
                <CardHeader
                  avatar={
                    team.logo_url ? (
                      <Avatar src={team.logo_url} imgProps={{ referrerPolicy: 'no-referrer' }} />
                    ) : (
                      <Avatar>{team.name.charAt(0).toUpperCase()}</Avatar>
                    )
                  }
                  title={<Typography variant="h6">{team.name}</Typography>}
                  subheader={team.regions?.[0]?.name || 'No region'}
                />
                <CardContent>
                  <Chip label={`ELO: ${team.elo_rating?.toFixed(0) || 'N/A'}`} size="small" sx={{ mr: 1 }} />
                  {team.current_rp !== null && (
                    <Chip label={`${team.current_rp} RP`} size="small" color="secondary" />
                  )}
                  {team.leaderboard_tier && (
                    <Chip label={team.leaderboard_tier} size="small" sx={{ ml: 1 }} />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {teams.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <Typography color="text.secondary">No teams found. Check back later for updates.</Typography>
          </div>
        )}
      </div>
    </div>
  );
}
