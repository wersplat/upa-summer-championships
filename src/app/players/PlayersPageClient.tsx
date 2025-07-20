'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Avatar,
  TableSortLabel,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  Button
} from '@mui/material';
import { Search, SportsBasketball } from '@mui/icons-material';
// Define basic player stats type since we can't import it
interface PlayerStats {
  games_played: number;
  points_per_game: number;
  assists_per_game: number;
  rebounds_per_game: number;
  steals_per_game: number;
  blocks_per_game: number;
  field_goal_percentage: number;
  three_point_percentage: number;
  free_throw_percentage: number;
  minutes_per_game: number;
  turnovers_per_game: number;
  fouls_per_game: number;
  plus_minus: number;
  [key: string]: number; // Allow dynamic access
}

// Define all possible value types in Player
type PlayerValue = 
  | string 
  | number 
  | boolean 
  | TeamInfo[] 
  | PlayerStats 
  | undefined 
  | null;

interface Player {
  // Required properties
  id: string;
  gamertag: string;
  performance_score: number;
  player_rp: number;
  player_rank_score: number;
  monthly_value: number;
  created_at: string;
  
  // Optional properties with specific types
  teams?: TeamInfo[];
  stats?: PlayerStats;
  position?: string;
  height?: string;
  weight?: string;
  age?: number;
  
  // Index signature for dynamic access with all possible value types
  [key: string]: PlayerValue;
}

// Define the team interface
type TeamInfo = {
  id: string;
  name: string;
  logo_url: string | null;
};

// Define the player with team and stats interface
type PlayerWithTeam = Player & {
  avatar_url?: string | null;
  teams?: TeamInfo[];
  stats?: PlayerStats;
};

// Fix for the getPositionColor function type issue
type PositionColorType = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'default';

type PlayersPageClientProps = {
  players: PlayerWithTeam[];
  showFallbackMessage?: boolean;
};

type SortField = keyof PlayerWithTeam | 'team' | 'ppg' | 'rpg' | 'apg' | 'spg' | 'bpg' | 'fg_pct' | 'ft_pct' | '3p_pct' | 'tpg' | 'fpg' | 'mpg' | 'plus_minus' | 'performance_score';

// This is a client component that renders the players page
// It receives the players data from the server component
const PlayersPageClient = ({ players, showFallbackMessage = false }: PlayersPageClientProps) => {
  const router = useRouter();
  
  const handleShowAllPlayers = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/players';
    }
  }, []);
  
  // Prefetch player data on hover
  const handlePlayerHover = useCallback((playerId: string) => {
    router.prefetch(`/players/${playerId}`);
  }, [router]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const positions = ['Point Guard', 'Shooting Guard', 'Lock', 'Power Forward', 'Center'];

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch = player.gamertag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.teams?.some(team => team.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPosition = positionFilter === 'all' || 
        (player.position && player.position === positionFilter);
      
      return matchesSearch && matchesPosition;
    });
  }, [players, searchTerm, positionFilter]);

  const sortedPlayers = useMemo(() => {
    return [...filteredPlayers].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'rank':
          comparison = (a.player_rank_score || 0) - (b.player_rank_score || 0);
          break;
        case 'name':
          comparison = a.gamertag.localeCompare(b.gamertag);
          break;
        case 'team':
          const getTeamName = (team?: TeamInfo) => team?.name || '';
          const teamA = getTeamName(a.teams?.[0]);
          const teamB = getTeamName(b.teams?.[0]);
          comparison = teamA.localeCompare(teamB);
          break;
        case 'position':
          comparison = (a.position || '').localeCompare(b.position || '');
          break;
        case 'ppg':
          comparison = (a.stats?.points_per_game || 0) - (b.stats?.points_per_game || 0);
          break;
        case 'rpg':
          comparison = (a.stats?.rebounds_per_game || 0) - (b.stats?.rebounds_per_game || 0);
          break;
        case 'apg':
          comparison = (a.stats?.assists_per_game || 0) - (b.stats?.assists_per_game || 0);
          break;
        case 'spg':
          comparison = (a.stats?.steals_per_game || 0) - (b.stats?.steals_per_game || 0);
          break;
        case 'bpg':
          comparison = (a.stats?.blocks_per_game || 0) - (b.stats?.blocks_per_game || 0);
          break;
        case 'fg_pct':
          comparison = (a.stats?.field_goal_percentage || 0) - (b.stats?.field_goal_percentage || 0);
          break;
        case 'ft_pct':
          comparison = (a.stats?.free_throw_percentage || 0) - (b.stats?.free_throw_percentage || 0);
          break;
        case '3p_pct':
          comparison = (a.stats?.three_point_percentage || 0) - (b.stats?.three_point_percentage || 0);
          break;
        case 'tpg':
          comparison = (a.stats?.turnovers_per_game || 0) - (b.stats?.turnovers_per_game || 0);
          break;
        case 'fpg':
          comparison = (a.stats?.fouls_per_game || 0) - (b.stats?.fouls_per_game || 0);
          break;
        case 'mpg':
          comparison = (a.stats?.minutes_per_game || 0) - (b.stats?.minutes_per_game || 0);
          break;
        case 'plus_minus':
          comparison = (a.stats?.plus_minus || 0) - (b.stats?.plus_minus || 0);
          break;
        case 'performance_score':
          comparison = (a.performance_score || 0) - (b.performance_score || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredPlayers, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderStatCell = (value: number | undefined, isPercentage = false) => {
    if (value === undefined || value === null) return '-.--';
    return isPercentage ? `${(value * 100).toFixed(1)}%` : value.toFixed(1);
  };

  const getPositionColor = (position?: string | null): PositionColorType => {
    if (!position) return 'default';
    
    const positionMap: Record<string, PositionColorType> = {
      'Point Guard': 'primary',
      'Shooting Guard': 'secondary',
      'Lock': 'success',
      'Power Forward': 'warning',
      'Center': 'error',
    };
    
    return positionMap[position] || 'default';
  };

  if (showFallbackMessage) {
    return (
      <Box sx={{ width: '100%', p: 3, textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          No players found for the current event
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          There are no players registered for this event yet.
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleShowAllPlayers}
          startIcon={<SportsBasketball />}
        >
          View All Players
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      p: { xs: 1, sm: 2, md: 3 },
      overflowX: 'hidden'
    }}>
      <Box sx={{ mb: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Player Rankings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: { xs: 2, sm: 3 } }}>
          View and compare player statistics and rankings
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 }, 
          mb: { xs: 2, sm: 3 }, 
          flexDirection: { xs: 'column', sm: 'row' },
          '& .MuiFormControl-root': {
            width: { xs: '100%', sm: 'auto' },
          }
        }}>
          <TextField
            placeholder="Search players or teams..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ 
              minWidth: { xs: '100%', sm: 250 },
              '& .MuiInputBase-root': {
                height: '40px',
              }
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120, width: { xs: '100%', sm: 'auto' } }}>
            <InputLabel>Position</InputLabel>
            <Select
              value={positionFilter}
              label="Position"
              onChange={(e) => setPositionFilter(e.target.value as string)}
            >
              <MenuItem value="all">All Positions</MenuItem>
              {positions.map((pos) => (
                <MenuItem key={pos} value={pos}>{pos}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Paper sx={{ 
        width: '100%', 
        mb: 2, 
        overflow: 'hidden',
        boxShadow: { xs: 'none', sm: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)' }
      }}>
        <TableContainer sx={{ 
          maxHeight: { xs: 'auto', sm: 'calc(100vh - 300px)' },
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
        }}>
          <Table 
            stickyHeader
            sx={{
              minWidth: 900,
              '& .MuiTableCell-root': {
                py: { xs: 0.75, sm: 1 },
                px: { xs: 0.75, sm: 1.5 },
                '&:first-of-type': {
                  pl: { xs: 1, sm: 2 },
                },
                '&:last-child': {
                  pr: { xs: 1, sm: 2 },
                }
              },
              '& .MuiTableHead-root .MuiTableCell-root': {
                whiteSpace: 'nowrap',
                py: { xs: 1, sm: 1.25 },
                px: { xs: 0.75, sm: 1.5 },
                '&:first-of-type': {
                  pl: { xs: 1, sm: 2 },
                },
                '&:last-child': {
                  pr: { xs: 1, sm: 2 },
                }
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'rank'}
                    direction={sortField === 'rank' ? sortDirection : 'desc'}
                    onClick={() => handleSort('rank')}
                  >
                    Rank
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'name'}
                    direction={sortField === 'name' ? sortDirection : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Player
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={sortField === 'team'}
                    direction={sortField === 'team' ? sortDirection : 'asc'}
                    onClick={() => handleSort('team')}
                  >
                    Team
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={sortField === 'position'}
                    direction={sortField === 'position' ? sortDirection : 'asc'}
                    onClick={() => handleSort('position')}
                  >
                    Position
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'ppg'}
                    direction={sortField === 'ppg' ? sortDirection : 'desc'}
                    onClick={() => handleSort('ppg')}
                  >
                    PPG
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'rpg'}
                    direction={sortField === 'rpg' ? sortDirection : 'desc'}
                    onClick={() => handleSort('rpg')}
                  >
                    RPG
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'apg'}
                    direction={sortField === 'apg' ? sortDirection : 'desc'}
                    onClick={() => handleSort('apg')}
                  >
                    APG
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'spg'}
                    direction={sortField === 'spg' ? sortDirection : 'desc'}
                    onClick={() => handleSort('spg')}
                  >
                    SPG
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'bpg'}
                    direction={sortField === 'bpg' ? sortDirection : 'desc'}
                    onClick={() => handleSort('bpg')}
                  >
                    BPG
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'fg_pct'}
                    direction={sortField === 'fg_pct' ? sortDirection : 'desc'}
                    onClick={() => handleSort('fg_pct')}
                  >
                    FG%
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'ft_pct'}
                    direction={sortField === 'ft_pct' ? sortDirection : 'desc'}
                    onClick={() => handleSort('ft_pct')}
                  >
                    FT%
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === '3p_pct'}
                    direction={sortField === '3p_pct' ? sortDirection : 'desc'}
                    onClick={() => handleSort('3p_pct')}
                  >
                    3P%
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPlayers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((player, index) => (
                  <TableRow hover key={player.id}>
                    <TableCell>#{index + 1 + page * rowsPerPage}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          src={player.avatar_url || undefined} 
                          alt={player.gamertag}
                          sx={{ 
                            width: { xs: 28, sm: 32 }, 
                            height: { xs: 28, sm: 32 },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          <SportsBasketball />
                        </Avatar>
                        <Link 
                          href={`/players/${player.id}`} 
                          style={{ textDecoration: 'none', color: 'inherit' }}
                          onMouseEnter={() => handlePlayerHover(player.id)}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500, 
                              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                              '&:hover': { textDecoration: 'underline' } 
                            }}
                          >
                            {player.gamertag}
                          </Typography>
                        </Link>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {player.teams?.[0]?.logo_url ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Avatar 
                            src={player.teams[0].logo_url} 
                            alt={player.teams[0].name}
                            title={player.teams[0].name}
                            sx={{ 
                              width: { xs: 24, sm: 28 }, 
                              height: { xs: 24, sm: 28 },
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              bgcolor: 'background.paper',
                              '& img': {
                                objectFit: 'contain',
                                p: 0.5
                              }
                            }}
                          />
                        </Box>
                      ) : '-'}
                    </TableCell>
                    <TableCell align="center">
                      {player.position ? (
                        <Chip 
                          label={player.position} 
                          size="small" 
                          color={getPositionColor(player.position) as any}
                          sx={{ 
                            minWidth: 40,
                            '& .MuiChip-label': {
                              px: 1,
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }
                          }}
                        />
                      ) : '-'}
                    </TableCell>
                    <TableCell align="right">{renderStatCell(player.stats?.points_per_game)}</TableCell>
                    <TableCell align="right">{renderStatCell(player.stats?.rebounds_per_game)}</TableCell>
                    <TableCell align="right">{renderStatCell(player.stats?.assists_per_game)}</TableCell>
                    <TableCell align="right">{renderStatCell(player.stats?.steals_per_game)}</TableCell>
                    <TableCell align="right">{renderStatCell(player.stats?.blocks_per_game)}</TableCell>
                    <TableCell align="right">{renderStatCell(player.stats?.field_goal_percentage, true)}</TableCell>
                    <TableCell align="right">{renderStatCell(player.stats?.three_point_percentage, true)}</TableCell>
                    <TableCell align="right">{renderStatCell(player.stats?.free_throw_percentage, true)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={sortedPlayers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '& .MuiTablePagination-toolbar': {
              flexWrap: 'wrap',
              gap: 1,
              '& .MuiTablePagination-spacer': {
                flex: '0 0 0',
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                m: 0,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              },
              '& .MuiTablePagination-actions': {
                ml: 1,
              },
              '& .MuiButtonBase-root': {
                p: { xs: 0.5, sm: 1 },
              },
              '& .MuiSelect-select': {
                p: { xs: '6px 24px 6px 8px', sm: '8px 32px 8px 12px' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              },
            },
          }}
        />
      </Paper>
      
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {Math.min(page * rowsPerPage + 1, sortedPlayers.length)}-{Math.min((page + 1) * rowsPerPage, sortedPlayers.length)} of {sortedPlayers.length} players
        </Typography>
      </Box>
    </Box>
  );
};

export default PlayersPageClient;
