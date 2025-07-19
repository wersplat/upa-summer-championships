'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
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
} from '@mui/material';
import { Search, SportsBasketball } from '@mui/icons-material';
import type { PlayerWithTeam } from './page';

// Fix for the getPositionColor function type issue
type PositionColorType = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'default';

interface PlayersPageClientProps {
  players: PlayerWithTeam[];
}

type SortField = 'rank' | 'name' | 'team' | 'ppg' | 'rpg' | 'apg' | 'spg' | 'bpg' | 'fg' | '3pt' | 'ft';

export default function PlayersPageClient({ players }: PlayersPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const positions = ['PG', 'SG', 'Lock (LCK)', 'PF', 'C'];

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
          const teamA = a.teams?.[0]?.name || '';
          const teamB = b.teams?.[0]?.name || '';
          comparison = teamA.localeCompare(teamB);
          break;
        case 'ppg':
          comparison = (a.stats?.points_per_game || 0) - (b.stats?.points_per_game || 0);
          break;
        // Add other stat comparisons as needed
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

  const handleChangePage = (event: unknown, newPage: number) => {
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
      'PG': 'primary',
      'SG': 'secondary',
      'Lock (LCK)': 'success',
      'PF': 'warning',
      'C': 'error',
    };
    
    return positionMap[position] || 'default';
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Player Rankings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          View and compare player statistics and rankings
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
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
            sx={{ minWidth: 250 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
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
      
      <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader>
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
                <TableCell>Position</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'team'}
                    direction={sortField === 'team' ? sortDirection : 'asc'}
                    onClick={() => handleSort('team')}
                  >
                    Team
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
                <TableCell align="right">RPG</TableCell>
                <TableCell align="right">APG</TableCell>
                <TableCell align="right">SPG</TableCell>
                <TableCell align="right">BPG</TableCell>
                <TableCell align="right">FG%</TableCell>
                <TableCell align="right">3P%</TableCell>
                <TableCell align="right">FT%</TableCell>
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
                          sx={{ width: 32, height: 32 }}
                        >
                          <SportsBasketball />
                        </Avatar>
                        <Link href={`/players/${player.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}>
                            {player.gamertag}
                          </Typography>
                        </Link>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {player.position ? (
                        <Chip 
                          label={player.position} 
                          size="small" 
                          color={getPositionColor(player.position) as any}
                        />
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {player.teams?.[0] ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {player.teams[0].logo_url && (
                            <Avatar 
                              src={player.teams[0].logo_url} 
                              alt={player.teams[0].name}
                              sx={{ width: 24, height: 24 }}
                            />
                          )}
                          <Typography variant="body2">
                            {player.teams[0].name}
                          </Typography>
                        </Box>
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
        />
      </Paper>
      
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {Math.min(page * rowsPerPage + 1, sortedPlayers.length)}-{Math.min((page + 1) * rowsPerPage, sortedPlayers.length)} of {sortedPlayers.length} players
        </Typography>
      </Box>
    </Box>
  );
}
