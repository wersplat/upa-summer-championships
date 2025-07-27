'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Divider,
  Button,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
} from '@mui/material';
import {
  SportsBasketball,
  EmojiEvents,
  BarChart,
  People,
  Event,
  ArrowBack,
} from '@mui/icons-material';
import type { PlayerWithTeam } from '@/app/players/page';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`player-tabpanel-${index}`}
      aria-labelledby={`player-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `player-tab-${index}`,
    'aria-controls': `player-tabpanel-${index}`,
  };
}

interface PlayerProfileProps {
  player: PlayerWithTeam;
}

function PlayerProfile({ player }: PlayerProfileProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderStatCard = (title: string, value: string | number, subtext?: string) => (
    <Paper sx={{ p: 2, height: '100%', textAlign: 'center' }} elevation={1}>
      <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      {subtext && (
        <Typography variant="caption" color="text.secondary">
          {subtext}
        </Typography>
      )}
    </Paper>
  );

  const renderStatRow = (label: string, value: string | number, isPercentage = false) => (
    <TableRow>
      <TableCell component="th" scope="row">
        {label}
      </TableCell>
      <TableCell align="right">
        {typeof value === 'number' 
          ? isPercentage 
            ? `${(value * 100).toFixed(1)}%`
            : value.toFixed(1)
          : value}
      </TableCell>
    </TableRow>
  );

  return (
    <Box>
      <Button 
        startIcon={<ArrowBack />} 
        component={Link} 
        href="/players"
        sx={{ mb: 2 }}
      >
        Back to Players
      </Button>

      {/* Player Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md="auto">
            <Avatar 
              src={player.avatar_url || undefined} 
              sx={{ 
                width: 120, 
                height: 120,
                mx: 'auto',
                [theme.breakpoints.up('md')]: { mx: 0 }
              }}
            >
              <SportsBasketball sx={{ fontSize: 60 }} />
            </Avatar>
          </Grid>
          
          <Grid item xs={12} md>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 1, mb: 1 }}>
                <Typography variant="h4" component="h1">
                  {player.gamertag}
                </Typography>
                {player.position && (
                  <Chip 
                    label={player.position} 
                    size="small" 
                    color={getPositionColor(player.position)}
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
              
              {player.teams?.[0] && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar 
                    src={player.teams[0].logo_url || undefined} 
                    alt={player.teams[0].name}
                    sx={{ width: 24, height: 24 }}
                  />
                  <Link href={`/teams/${player.teams[0].id}`} style={{ textDecoration: 'none' }}>
                    <Typography 
                      variant="subtitle1" 
                      color="primary"
                      sx={{ '&:hover': { textDecoration: 'underline' } }}
                    >
                      {player.teams[0].name}
                    </Typography>
                  </Link>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Chip 
                  icon={<EmojiEvents />} 
                  label={`Rank: #${player.player_rank_score || 'N/A'}`} 
                  size="small" 
                  variant="outlined"
                />
                <Chip 
                  icon={<BarChart />} 
                  label={`RP: ${player.player_rp || 0}`} 
                  size="small" 
                  variant="outlined"
                />
                <Chip 
                  icon={<People />} 
                  label={`Performance: ${player.performance_score || 0}`} 
                  size="small" 
                  variant="outlined"
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Overview */}
      {player.stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2.4}>
            {renderStatCard('PPG', player.stats.points_per_game.toFixed(1), 'Points Per Game')}
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            {renderStatCard('APG', player.stats.assists_per_game.toFixed(1), 'Assists Per Game')}
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            {renderStatCard('RPG', player.stats.rebounds_per_game.toFixed(1), 'Rebounds Per Game')}
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            {renderStatCard('SPG', player.stats.steals_per_game.toFixed(1), 'Steals Per Game')}
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            {renderStatCard('BPG', player.stats.blocks_per_game.toFixed(1), 'Blocks Per Game')}
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="player tabs"
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
          >
            <Tab label="Overview" {...a11yProps(0)} />
            <Tab label="Statistics" {...a11yProps(1)} />
            <Tab label="Game Log" {...a11yProps(2)} />
            <Tab label="Awards" {...a11yProps(3)} />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Player Information" />
                <Divider />
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row">Position</TableCell>
                          <TableCell align="right">{player.position || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Team</TableCell>
                          <TableCell align="right">
                            {player.teams?.[0] ? (
                              <Link href={`/teams/${player.teams[0].id}`} style={{ textDecoration: 'none' }}>
                                {player.teams[0].name}
                              </Link>
                            ) : 'Free Agent'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Ranking Points</TableCell>
                          <TableCell align="right">{player.player_rp || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Performance Score</TableCell>
                          <TableCell align="right">{player.performance_score || 0}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {player.stats && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Season Averages" />
                  <Divider />
                  <CardContent>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          {renderStatRow('Games Played', player.stats.games_played)}
                          {renderStatRow('Points Per Game', player.stats.points_per_game)}
                          {renderStatRow('Assists Per Game', player.stats.assists_per_game)}
                          {renderStatRow('Rebounds Per Game', player.stats.rebounds_per_game)}
                          {renderStatRow('Steals Per Game', player.stats.steals_per_game)}
                          {renderStatRow('Blocks Per Game', player.stats.blocks_per_game)}
                          {renderStatRow('Turnovers Per Game', player.stats.turnovers_per_game)}
                          {renderStatRow('Field Goal %', player.stats.field_goal_percentage, true)}
                          {renderStatRow('3PT %', player.stats.three_point_percentage, true)}
                          {renderStatRow('FT %', player.stats.free_throw_percentage, true)}
                          {renderStatRow('+/-', player.stats.plus_minus > 0 ? `+${player.stats.plus_minus}` : player.stats.plus_minus.toString())}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Statistics Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Shooting Stats" />
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {renderStatRow('Field Goals', `${player.stats.field_goal_percentage.toFixed(1)}%`)}
                        {renderStatRow('3-Pointers', player.stats.three_point_percentage > 0 ? `${player.stats.three_point_percentage.toFixed(1)}%` : 'N/A')}
                        {renderStatRow('Free Throws', player.stats.free_throw_percentage > 0 ? `${player.stats.free_throw_percentage.toFixed(1)}%` : 'N/A')}
                        {renderStatRow('Effective FG%', (player.stats.field_goal_percentage + (0.5 * (player.stats.three_point_percentage || 0))).toFixed(1) + '%')}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Advanced Stats" />
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {renderStatRow('Efficiency', (player.stats.points_per_game + player.stats.rebounds_per_game + player.stats.assists_per_game + player.stats.steals_per_game + player.stats.blocks_per_game - player.stats.turnovers_per_game).toFixed(1))}
                        {renderStatRow('Assist/TO Ratio', player.stats.turnovers_per_game > 0 ? (player.stats.assists_per_game / player.stats.turnovers_per_game).toFixed(2) : 'N/A')}
                        {renderStatRow('Steals + Blocks', (player.stats.steals_per_game + player.stats.blocks_per_game).toFixed(1))}
                        {renderStatRow('Double-Doubles', '0')} {/* This would need to be calculated from match history */}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Game Log Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardHeader title="Game Log" />
            <CardContent>
              {player.match_history && player.match_history.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Event</TableCell>
                        <TableCell>Team</TableCell>
                        <TableCell>PTS</TableCell>
                        <TableCell>REB</TableCell>
                        <TableCell>AST</TableCell>
                        <TableCell>STL</TableCell>
                        <TableCell>BLK</TableCell>
                        <TableCell>+/-</TableCell>
                        <TableCell>MVP</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {player.match_history.map((game, index) => (
                        <TableRow key={index}>
                          <TableCell>{new Date(game.played_at).toLocaleDateString()}</TableCell>
                          <TableCell>{game.event_name}</TableCell>
                          <TableCell>{game.team_name}</TableCell>
                          <TableCell>{game.points}</TableCell>
                          <TableCell>{game.rebounds}</TableCell>
                          <TableCell>{game.assists}</TableCell>
                          <TableCell>{game.steals}</TableCell>
                          <TableCell>{game.blocks}</TableCell>
                          <TableCell>{game.performance_score > 0 ? `+${game.performance_score}` : game.performance_score}</TableCell>
                          <TableCell>{game.is_mvp ? '⭐' : ''}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">No game data available</Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Awards Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Awards & Achievements
          </Typography>
          <Typography color="text.secondary">
            Player awards and achievements will be displayed here.
          </Typography>
        </TabPanel>
      </Box>
    </Box>
  );
}

// Helper function to get color based on position
function getPositionColor(position: string) {
  const positionMap: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
    'PG': 'primary',
    'SG': 'secondary',
    'Lock (LCK)': 'success',
    'PF': 'warning',
    'C': 'error',
  };
  
  return positionMap[position] || 'default';
}

export default PlayerProfile;
