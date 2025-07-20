'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
    key: 'position',
    direction: 'asc',
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  const positionOrder: Record<string, number> = {
    'Point Guard': 1,
    'Shooting Guard': 2,
    'Guard': 2.5, // Fallback for just 'Guard'
    'Lock': 3,
    'Small Forward': 3.5, // Fallback for 'Small Forward' which is similar to Lock
    'Power Forward': 4,
    'Center': 5,
    'Big': 4.5, // Fallback for 'Big' which is usually PF or C
  };

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
      // If sorting by position, use custom position order
      if (sortConfig.key === 'position') {
        const aPos = a.position || '';
        const bPos = b.position || '';
        const aOrder = positionOrder[aPos] || 99;
        const bOrder = positionOrder[bPos] || 99;
        
        // If positions are different, sort by position order
        if (aOrder !== bOrder) {
          return sortConfig.direction === 'asc' ? aOrder - bOrder : bOrder - aOrder;
        }
        // If same position, sort by name
        return sortConfig.direction === 'asc' 
          ? a.gamertag.localeCompare(b.gamertag)
          : b.gamertag.localeCompare(a.gamertag);
      }
      
      // For other sort keys, use default sorting
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      // Handle undefined/null values
      if (aValue === undefined || aValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === undefined || bValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
      
      // Compare values
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      
      // If values are equal, sort by position then name
      const aPos = a.position || '';
      const bPos = b.position || '';
      const aOrder = positionOrder[aPos] || 99;
      const bOrder = positionOrder[bPos] || 99;
      
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.gamertag.localeCompare(b.gamertag);
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
        bgcolor: 'background.paper',
        boxShadow: 1,
        borderRadius: 1,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ 
        p: { xs: 1.5, sm: 2 }, 
        borderBottom: 1, 
        borderColor: 'divider', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: { xs: 1.5, sm: 2 },
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
      <Box sx={{ 
        width: '100%',
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
          size="small" 
          sx={{ 
            minWidth: 650,
            '& .MuiTableCell-root': {
              whiteSpace: 'nowrap',
              py: { xs: 1, sm: 1.25 },
              px: { xs: 1, sm: 2 },
            },
            '& .MuiTableHead-root .MuiTableCell-root': {
              whiteSpace: 'nowrap',
              py: { xs: 1, sm: 1.25 },
              px: { xs: 1, sm: 2 },
            },
          }}
        >
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
              <>
                {/* Desktop/Tablet View */}
                <TableRow 
                  key={player.id} 
                  hover 
                  sx={{ 
                    display: { xs: 'none', sm: 'table-row' },
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
                    ...(player.team_rosters?.[0]?.is_captain && {
                      bgcolor: 'rgba(255, 193, 7, 0.1)',
                      '&:hover': {
                        bgcolor: 'primary.light',
                      },
                    }),
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {player.team_rosters?.[0]?.is_captain && (
                        <Box component="span" sx={{ mr: 1, color: 'warning.main', fontWeight: 'bold' }}>©</Box>
                      )}
                      <Avatar 
                        src={player.avatar_url || undefined} 
                        sx={{ 
                          mr: { xs: 1.5, sm: 2 },
                          width: { xs: 28, sm: 32 },
                          height: { xs: 28, sm: 32 },
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        {player.avatar_url ? '' : player.gamertag.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Link href={`/players/${player.id}`} passHref>
                          <Typography 
                            component="a"
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              color: 'inherit',
                              textDecoration: 'none',
                              '&:hover': {
                                textDecoration: 'underline',
                              }
                            }}
                          >
                            {player.gamertag}
                          </Typography>
                        </Link>
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

                {/* Mobile View */}
                <TableRow 
                  key={`${player.id}-mobile`}
                  sx={{
                    display: { xs: 'table-row', sm: 'none' },
                    '&:nth-of-type(odd)': {
                      bgcolor: 'grey.50',
                    },
                    '&:hover': {
                      bgcolor: 'primary.light',
                      '& .MuiTableCell-root': {
                        color: 'primary.contrastText',
                      },
                    },
                    ...(player.team_rosters?.[0]?.is_captain && {
                      bgcolor: 'rgba(255, 193, 7, 0.1)',
                      '&:hover': {
                        bgcolor: 'primary.light',
                      },
                    }),
                  }}
                >
                  <TableCell colSpan={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                      <Avatar 
                        src={player.avatar_url || undefined} 
                        sx={{ 
                          mr: 1.5,
                          width: 32,
                          height: 32,
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          fontSize: '0.75rem'
                        }}
                      >
                        {player.avatar_url ? '' : player.gamertag.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {player.team_rosters?.[0]?.is_captain && (
                            <Box component="span" sx={{ mr: 0.5, color: 'warning.main', fontWeight: 'bold' }}>©</Box>
                          )}
                          <Link href={`/players/${player.id}`} passHref>
                            <Typography 
                              component="a"
                              variant="body2" 
                              sx={{ 
                                fontWeight: 500,
                                color: 'inherit',
                                textDecoration: 'none',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                '&:hover': {
                                  textDecoration: 'underline',
                                }
                              }}
                            >
                              {player.gamertag}
                            </Typography>
                          </Link>
                        </Box>
                        {player.position && (
                          <Chip 
                            label={player.position} 
                            size="small" 
                            sx={{
                              mt: 0.5,
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                              border: '1px solid',
                              borderColor: 'primary.dark',
                              fontSize: '0.7rem',
                              height: 20,
                              '& .MuiChip-label': {
                                px: 0.5,
                              },
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              </>
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
      </Box>
    </Paper>
  );
}
