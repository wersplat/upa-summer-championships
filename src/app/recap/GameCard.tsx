'use client';

import { useState } from 'react';
import { Game } from '@/types/game';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Divider,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper as MuiPaper,
  styled,
  Tabs,
  Tab,
  Avatar,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  SportsBasketball,
  LocationOn,
  Event,
  EmojiEvents,
} from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const TeamName = styled(Typography)({
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const ScoreText = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 700,
  textAlign: 'center',
  minWidth: '2.5rem',
});

const StatValue = styled(Typography)({
  textAlign: 'center',
  fontWeight: 500,
});

const StatLabel = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
}));

const PlayerRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StatCell = styled(TableCell)({
  padding: '8px 12px',
  fontSize: '0.8rem',
});

const PlayerNameCell = styled(StatCell)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

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
      id={`player-stats-tabpanel-${index}`}
      aria-labelledby={`player-stats-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const toggleDetails = () => setShowDetails(!showDetails);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Calculate shooting percentages
  const team1FgPct = game.team1.stats ? (game.team1.stats.field_goals_made / Math.max(1, game.team1.stats.field_goals_attempted) * 100).toFixed(1) : '0.0';
  const team2FgPct = game.team2.stats ? (game.team2.stats.field_goals_made / Math.max(1, game.team2.stats.field_goals_attempted) * 100).toFixed(1) : '0.0';
  const team13ptPct = game.team1.stats?.three_points_attempted > 0 
    ? ((game.team1.stats.three_points_made / game.team1.stats.three_points_attempted) * 100).toFixed(1)
    : '0.0';
  const team23ptPct = game.team2.stats?.three_points_attempted > 0 
    ? ((game.team2.stats.three_points_made / game.team2.stats.three_points_attempted) * 100).toFixed(1)
    : '0.0';
  const team1FtPct = game.team1.stats?.free_throws_attempted > 0 
    ? ((game.team1.stats.free_throws_made / game.team1.stats.free_throws_attempted) * 100).toFixed(1)
    : '0.0';
  const team2FtPct = game.team2.stats?.free_throws_attempted > 0 
    ? ((game.team2.stats.free_throws_made / game.team2.stats.free_throws_attempted) * 100).toFixed(1)
    : '0.0';

  return (
    <StyledCard>
      <CardContent>
        {/* Game Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" component="h2" fontWeight={600}>
              {game.tournamentStage || 'Game Recap'}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5} color="text.secondary">
              <Event fontSize="small" color="inherit" />
              <Typography variant="body2">
                {new Date(game.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
              {game.location && (
                <>
                  <Typography variant="body2" mx={0.5}>•</Typography>
                  <LocationOn fontSize="small" color="inherit" />
                  <Typography variant="body2">{game.location}</Typography>
                </>
              )}
            </Box>
          </Box>
          <IconButton 
            size="small" 
            onClick={toggleDetails}
            aria-label={showDetails ? 'Hide details' : 'Show details'}
          >
            {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        {/* Scoreboard */}
        <Box mb={2}>
          <Grid container spacing={2} alignItems="center">
            {/* Team 1 */}
            <Grid item xs={5} display="flex" alignItems="center">
              <Box 
                component="img"
                src={game.team1.logo_url || '/team-placeholder.png'}
                alt={`${game.team1.name} logo`}
                sx={{
                  width: 40,
                  height: 40,
                  objectFit: 'contain',
                  mr: 2,
                  borderRadius: '4px',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/team-placeholder.png';
                }}
              />
              <TeamName variant="subtitle1">{game.team1.name}</TeamName>
            </Grid>
            
            <Grid item xs={2} display="flex" justifyContent="center">
              <ScoreText>
                {game.team1.score}
              </ScoreText>
            </Grid>
            
            <Grid item xs={2} display="flex" justifyContent="center">
              <Typography color="text.secondary" sx={{ alignSelf: 'center' }}>
                VS
              </Typography>
            </Grid>
            
            <Grid item xs={2} display="flex" justifyContent="center">
              <ScoreText>
                {game.team2.score}
              </ScoreText>
            </Grid>
            
            {/* Team 2 */}
            <Grid item xs={5} display="flex" alignItems="center" justifyContent="flex-end">
              <TeamName variant="subtitle1" sx={{ textAlign: 'right', mr: 2 }}>
                {game.team2.name}
              </TeamName>
              <Box 
                component="img"
                src={game.team2.logo_url || '/team-placeholder.png'}
                alt={`${game.team2.name} logo`}
                sx={{
                  width: 40,
                  height: 40,
                  objectFit: 'contain',
                  borderRadius: '4px',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/team-placeholder.png';
                }}
              />
            </Grid>
          </Grid>
        </Box>
        
        {/* Player Stats Boxscore */}
        <Box mt={3}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Player Stats
          </Typography>
          
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            <Tab label={game.team1.name} />
            <Tab label={game.team2.name} />
          </Tabs>
          
          {/* Team 1 Player Stats */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer component={MuiPaper} elevation={0} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <StatCell>Player</StatCell>
                    <StatCell align="right">PTS</StatCell>
                    <StatCell align="right">REB</StatCell>
                    <StatCell align="right">AST</StatCell>
                    <StatCell align="right">STL</StatCell>
                    <StatCell align="right">BLK</StatCell>
                    <StatCell align="right">FG%</StatCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {game.team1.playerStats?.map((player) => (
                    <PlayerRow key={player.id} hover>
                      <PlayerNameCell>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {player.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </Avatar>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            <SportsBasketball sx={{ width: 20, height: 20 }} />
                          </Avatar>
                          <Typography variant="body2">
                            {player.name}
                          </Typography>
                          {player.is_mvp && (
                            <EmojiEvents fontSize="small" color="warning" />
                          )}
                        </Box>
                      </PlayerNameCell>
                      <StatCell align="right">{player.points}</StatCell>
                      <StatCell align="right">{player.rebounds}</StatCell>
                      <StatCell align="right">{player.assists}</StatCell>
                      <StatCell align="right">{player.steals}</StatCell>
                      <StatCell align="right">{player.blocks}</StatCell>
                      <StatCell align="right">
                        {player.field_goals_attempted > 0 
                          ? Math.round((player.field_goals_made / player.field_goals_attempted) * 100) 
                          : 0}%
                      </StatCell>
                    </PlayerRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
          
          {/* Team 2 Player Stats */}
          <TabPanel value={tabValue} index={1}>
            <TableContainer component={MuiPaper} elevation={0} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <StatCell>Player</StatCell>
                    <StatCell align="right">PTS</StatCell>
                    <StatCell align="right">REB</StatCell>
                    <StatCell align="right">AST</StatCell>
                    <StatCell align="right">STL</StatCell>
                    <StatCell align="right">BLK</StatCell>
                    <StatCell align="right">FG%</StatCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {game.team2.playerStats?.map((player) => (
                    <PlayerRow key={player.id} hover>
                      <PlayerNameCell>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {player.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </Avatar>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            <SportsBasketball sx={{ width: 20, height: 20 }} />
                          </Avatar>
                          <Typography variant="body2">
                            {player.name}
                          </Typography>
                          {player.is_mvp && (
                            <EmojiEvents fontSize="small" color="warning" />
                          )}
                        </Box>
                      </PlayerNameCell>
                      <StatCell align="right">{player.points}</StatCell>
                      <StatCell align="right">{player.rebounds}</StatCell>
                      <StatCell align="right">{player.assists}</StatCell>
                      <StatCell align="right">{player.steals}</StatCell>
                      <StatCell align="right">{player.blocks}</StatCell>
                      <StatCell align="right">
                        {player.field_goals_attempted > 0 
                          ? Math.round((player.field_goals_made / player.field_goals_attempted) * 100) 
                          : 0}%
                      </StatCell>
                    </PlayerRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Box>
        
        {/* MVP */}
        {game.mvp && game.mvp !== 'MVP not available' && (
          <Box display="flex" alignItems="center" mb={2}>
            <EmojiEvents color="warning" sx={{ mr: 1 }} />
            <Typography variant="body2">
              <strong>MVP:</strong> {game.mvp}
            </Typography>
          </Box>
        )}
        
        {/* Detailed Stats */}
        <Collapse in={showDetails} timeout="auto" unmountOnExit>
          <Box mt={2} pt={2} borderTop="1px solid" borderColor="divider">
            <TableContainer component={MuiPaper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Stat</TableCell>
                    <TableCell align="right">{game.team1.name}</TableCell>
                    <TableCell align="right">{game.team2.name}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row">Field Goals</TableCell>
                    <TableCell align="right">
                      {game.team1.stats?.field_goals_made || 0}-{game.team1.stats?.field_goals_attempted || 0} ({team1FgPct}%)
                    </TableCell>
                    <TableCell align="right">
                      {game.team2.stats?.field_goals_made || 0}-{game.team2.stats?.field_goals_attempted || 0} ({team2FgPct}%)
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">3-Pointers</TableCell>
                    <TableCell align="right">
                      {game.team1.stats?.three_points_made || 0}-{game.team1.stats?.three_points_attempted || 0} ({team13ptPct}%)
                    </TableCell>
                    <TableCell align="right">
                      {game.team2.stats?.three_points_made || 0}-{game.team2.stats?.three_points_attempted || 0} ({team23ptPct}%)
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Free Throws</TableCell>
                    <TableCell align="right">
                      {game.team1.stats?.free_throws_made || 0}-{game.team1.stats?.free_throws_attempted || 0} ({team1FtPct}%)
                    </TableCell>
                    <TableCell align="right">
                      {game.team2.stats?.free_throws_made || 0}-{game.team2.stats?.free_throws_attempted || 0} ({team2FtPct}%)
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Rebounds</TableCell>
                    <TableCell align="right">
                      {((game.team1.stats?.offensive_rebounds || 0) + (game.team1.stats?.defensive_rebounds || 0)) || 0}
                      {game.team1.stats && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          ({game.team1.stats.offensive_rebounds || 0} OREB, {game.team1.stats.defensive_rebounds || 0} DREB)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {((game.team2.stats?.offensive_rebounds || 0) + (game.team2.stats?.defensive_rebounds || 0)) || 0}
                      {game.team2.stats && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          ({game.team2.stats.offensive_rebounds || 0} OREB, {game.team2.stats.defensive_rewards || 0} DREB)
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Assists</TableCell>
                    <TableCell align="right">{game.team1.stats?.assists || 0}</TableCell>
                    <TableCell align="right">{game.team2.stats?.assists || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Steals</TableCell>
                    <TableCell align="right">{game.team1.stats?.steals || 0}</TableCell>
                    <TableCell align="right">{game.team2.stats?.steals || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Blocks</TableCell>
                    <TableCell align="right">{game.team1.stats?.blocks || 0}</TableCell>
                    <TableCell align="right">{game.team2.stats?.blocks || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Turnovers</TableCell>
                    <TableCell align="right">{game.team1.stats?.turnovers || 0}</TableCell>
                    <TableCell align="right">{game.team2.stats?.turnovers || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Fouls</TableCell>
                    <TableCell align="right">{game.team1.stats?.fouls || 0}</TableCell>
                    <TableCell align="right">{game.team2.stats?.fouls || 0}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Collapse>
        
        {/* Toggle Button */}
        <Box display="flex" justifyContent="center" mt={1}>
          <IconButton 
            size="small" 
            onClick={toggleDetails}
            color="primary"
            aria-label={showDetails ? 'Hide details' : 'Show details'}
            sx={{
              '&:hover': {
                backgroundColor: 'transparent',
              }
            }}
          >
            {showDetails ? (
              <>
                <Typography variant="button" color="primary" sx={{ mr: 0.5 }}>
                  Hide Details
                </Typography>
                <ExpandLessIcon />
              </>
            ) : (
              <>
                <Typography variant="button" color="primary" sx={{ mr: 0.5 }}>
                  Show Details
                </Typography>
                <ExpandMoreIcon />
              </>
            )}
          </IconButton>
        </Box>
      </CardContent>
    </StyledCard>
  );
}
