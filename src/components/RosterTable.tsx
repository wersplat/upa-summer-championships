'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import type { Player as BasePlayer } from '@/utils/supabase';

type Player = BasePlayer & {
  avatar_url?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  position?: string | null;
  team_rosters?: Array<{
    id: string;
    team_id: string;
    player_id: string;
    is_captain: boolean;
    is_player_coach: boolean;
    joined_at: string;
    left_at: string | null;
    event_id: string | null;
  }>;
};

type SortConfig = {
  key: keyof Player;
  direction: 'asc' | 'desc';
};

interface RosterTableProps {
  players: Player[];
}

export default function RosterTable({ players }: RosterTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'gamertag',
    direction: 'asc',
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  const sortedAndFilteredPlayers = useMemo(() => {
    const filtered = players.filter(player => {
      const searchLower = searchTerm.toLowerCase();
      return (
        player.gamertag.toLowerCase().includes(searchLower) ||
        (player.position?.toLowerCase() || '').includes(searchLower) ||
        (player.first_name?.toLowerCase() || '').includes(searchLower) ||
        (player.last_name?.toLowerCase() || '').includes(searchLower)
      );
    });

    return [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      // Handle undefined/null values
      if (aValue === undefined || aValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === undefined || bValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
      
      // Compare values
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [players, sortConfig, searchTerm]);

  const requestSort = (key: keyof Player) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  const getStatusBadge = (player: Player) => {
    const rosterInfo = player.team_rosters?.[0];
    if (!rosterInfo) return null;
    
    const badges: React.ReactNode[] = [];
    
    if (rosterInfo.is_captain) {
      badges.push(
        <Chip 
          key="captain" 
          label="Captain" 
          size="small" 
          sx={{ 
            mr: 0.5,
            bgcolor: 'warning.main',
            color: 'warning.contrastText',
            border: '1px solid',
            borderColor: 'warning.dark',
            '& .MuiChip-label': {
              px: 1,
              py: 0.5,
              fontWeight: 500,
            },
            boxShadow: 1,
          }} 
        />
      );
    }
    
    if (rosterInfo.is_player_coach) {
      badges.push(
        <Chip 
          key="coach" 
          label="Coach" 
          size="small" 
          sx={{ 
            mr: 0.5,
            bgcolor: 'secondary.main',
            color: 'secondary.contrastText',
            border: '1px solid',
            borderColor: 'secondary.dark',
            '& .MuiChip-label': {
              px: 1,
              py: 0.5,
              fontWeight: 500,
            },
            boxShadow: 1,
          }} 
        />
      );
    }
    
    if (badges.length === 0) {
      badges.push(
        <Chip 
          key="player" 
          label="Player" 
          size="small" 
          sx={{ 
            mr: 0.5,
            bgcolor: 'grey.100',
            color: 'text.primary',
            border: '1px solid',
            borderColor: 'grey.300',
            '& .MuiChip-label': {
              px: 1,
              py: 0.5,
            },
          }} 
        />
      );
    }
    
    return (
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 0.5,
        '& .MuiChip-root': {
          height: 'auto',
          minHeight: 24,
        }
      }}>
        {badges}
      </Box>
    );
  };
  


  return (
    <Paper 
      sx={{ 
        overflowX: 'auto',
        bgcolor: 'background.paper',
        boxShadow: 1,
        borderRadius: 1
      }}
    >
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: 2,
        bgcolor: 'grey.50'
      }}>
        <div>
          <Typography variant="h6" color="text.primary">Team Roster</Typography>
          <Typography variant="body2" color="text.secondary">
            {players.length} {players.length === 1 ? 'player' : 'players'} on roster
          </Typography>
        </div>
        <TextField
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search players..."
          size="small"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" color="action" />
              </InputAdornment>
            ),
            sx: {
              bgcolor: 'background.paper',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }
          }}
          sx={{ 
            width: { xs: '100%', sm: 250 },
            '& .MuiInputBase-input': {
              color: 'text.primary',
            },
            '& .MuiInputLabel-root': {
              color: 'text.secondary',
            },
          }}
        />
      </Box>
      <Table size="small" sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ 
            bgcolor: 'grey.100',
            '& .MuiTableCell-head': {
              bgcolor: 'grey.100',
            }
          }}>
            <TableCell sx={{ 
              color: 'text.primary',
              fontWeight: 600,
              borderColor: 'divider'
            }}>
              <TableSortLabel
                active={sortConfig.key === 'gamertag'}
                direction={sortConfig.direction}
                onClick={() => requestSort('gamertag')}
                sx={{ color: 'text.primary !important' }}
              >
                Player
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ 
              color: 'text.primary',
              fontWeight: 600,
              borderColor: 'divider'
            }}>
              <TableSortLabel
                active={sortConfig.key === 'position'}
                direction={sortConfig.direction}
                onClick={() => requestSort('position')}
                sx={{ color: 'text.primary !important' }}
              >
                Position
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ 
              color: 'text.primary',
              fontWeight: 600,
              borderColor: 'divider'
            }}>
              Status
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedAndFilteredPlayers.length > 0 ? (
            sortedAndFilteredPlayers.map((player) => (
              <TableRow 
                key={player.id} 
                hover 
                sx={{ 
                  '&:nth-of-type(odd)': {
                    bgcolor: 'grey.50',
                  },
                  '&:hover': {
                    bgcolor: 'primary.light',
                    '& .MuiTableCell-root': {
                      color: 'primary.contrastText',
                    },
                  },
                  '&:last-child td': {
                    borderBottom: 0,
                  },
                  '& td': {
                    borderColor: 'divider',
                    color: 'text.primary',
                  },
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      src={player.avatar_url || undefined} 
                      sx={{ 
                        mr: 2,
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText'
                      }}
                    >
                      {player.avatar_url ? '' : player.gamertag.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          color: 'text.primary'
                        }}
                      >
                        {player.gamertag}
                      </Typography>
                      {(player.first_name || player.last_name) && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            lineHeight: 1.2,
                            display: 'block'
                          }}
                        >
                          {player.first_name} {player.last_name}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {player.position ? (
                    <Chip 
                      label={player.position} 
                      size="small" 
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        border: '1px solid',
                        borderColor: 'primary.dark',
                        '& .MuiChip-label': {
                          px: 1,
                        },
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">-</Typography>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(player)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} align="center">
                <Typography variant="body2" color="text.secondary">
                  {searchTerm ? 'No players match your search.' : 'No players found on the roster.'}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
