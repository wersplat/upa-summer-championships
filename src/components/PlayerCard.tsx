'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Avatar, 
  Box, 
  Chip, 
  Typography 
} from '@mui/material';
import { SPACING, MIXINS } from '@/theme/constants';
import { getPositionColor } from '@/theme/colors';
import { getPlayerAriaLabel } from '@/utils/accessibility';

interface PlayerCardProps {
  id: string;
  gamertag: string;
  position?: string | null;
  teamName?: string | null;
  rating?: number | null;
  ratingLabel?: string;
  ratingColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default';
  avatarColor?: string;
  isHighlighted?: boolean;
  rank?: number;
  stats?: {
    field_goal_percentage?: number;
    points_per_game?: number;
    assists_per_game?: number;
    steals_per_game?: number;
    blocks_per_game?: number;
    rebounds_per_game?: number;
    opponent_fg_percentage?: number;
    [key: string]: number | undefined;
  };
  onClick?: () => void;
}

/**
 * PlayerCard - A standardized player card component for use throughout the application
 * 
 * @param id - Player ID for linking to player profile
 * @param gamertag - Player's gamertag/username
 * @param position - Player's position
 * @param teamName - Player's team name
 * @param rating - Player's rating value
 * @param ratingLabel - Label for the rating chip (defaults to the rating value)
 * @param ratingColor - Color theme for the rating chip
 * @param avatarColor - Background color for the avatar
 * @param isHighlighted - Whether this card should be highlighted (e.g., top player)
 * @param rank - Optional rank to display (1, 2, 3, etc.)
 * @param onClick - Optional click handler
 */
export default function PlayerCard({
  id,
  gamertag,
  position,
  teamName,
  rating,
  ratingLabel,
  ratingColor = 'default',
  avatarColor,  // Will be determined automatically if not provided
  isHighlighted = false,
  rank,
  stats,
  onClick,
}: PlayerCardProps) {
  // Medal emojis for top 3 ranks
  const getRankDisplay = () => {
    if (!rank) return null;
    
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const cardContent = (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      p: SPACING.ELEMENT,
      borderRadius: 1,
      bgcolor: isHighlighted ? 'action.selected' : 'grey.50',
      '&:hover': { 
        bgcolor: 'action.hover',
        transform: 'translateY(-2px)',
        transition: 'transform 0.2s ease-in-out',
      },
    }}>
      {rank && (
        <Box sx={{ 
          mr: SPACING.ITEM, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minWidth: 24,
          fontSize: rank <= 3 ? '1.2rem' : '0.875rem',
          fontWeight: 'bold',
        }}>
          {getRankDisplay()}
        </Box>
      )}
      
      <Avatar 
        sx={{ 
          mr: SPACING.ELEMENT,
          width: 40,
          height: 40,
          bgcolor: avatarColor || getPositionColor(position),
          color: 'white'
        }}
      >
        {gamertag.charAt(0).toUpperCase()}
      </Avatar>
      
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600, 
              ...MIXINS.TRUNCATE_TEXT
            }}
          >
            {gamertag}
          </Typography>
          
          {rating !== undefined && rating !== null && (
            <Chip 
              label={ratingLabel || rating.toFixed(1)} 
              size="small" 
              color={isHighlighted ? ratingColor : 'default'}
              sx={{ ml: SPACING.ITEM, fontWeight: 'bold' }}
            />
          )}
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {position && position}{position && teamName && ' • '}{teamName || 'No Team'}
        </Typography>
        
        {/* Stats row */}
        {stats && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
            {stats.field_goal_percentage !== undefined && (
              <Chip 
                size="small" 
                label={stats.opponent_fg_percentage !== undefined 
                  ? `${stats.field_goal_percentage.toFixed(1)}% Opp FG` 
                  : `${stats.field_goal_percentage.toFixed(1)}% FG`}
                variant="outlined"
                sx={{ 
                  height: 'auto', 
                  fontSize: '0.6rem',
                  lineHeight: 1.2,
                  py: 0.25,
                  borderColor: 'divider',
                  bgcolor: 'background.paper'
                }}
              />
            )}
            {stats.points_per_game !== undefined && (
              <Chip 
                size="small" 
                label={`${stats.points_per_game.toFixed(1)} PPG`}
                variant="outlined"
                sx={{ 
                  height: 'auto', 
                  fontSize: '0.6rem',
                  lineHeight: 1.2,
                  py: 0.25,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  display: stats.steals_per_game === undefined ? 'flex' : 'none'
                }}
              />
            )}
            {stats.assists_per_game !== undefined && (
              <Chip 
                size="small" 
                label={`${stats.assists_per_game.toFixed(1)} APG`}
                variant="outlined"
                sx={{ 
                  height: 'auto', 
                  fontSize: '0.6rem',
                  lineHeight: 1.2,
                  py: 0.25,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  display: stats.steals_per_game === undefined ? 'flex' : 'none'
                }}
              />
            )}
            {stats.steals_per_game !== undefined && (
              <Chip 
                size="small" 
                label={`${stats.steals_per_game.toFixed(1)} SPG`}
                variant="outlined"
                sx={{ 
                  height: 'auto', 
                  fontSize: '0.6rem',
                  lineHeight: 1.2,
                  py: 0.25,
                  borderColor: 'divider',
                  bgcolor: 'background.paper'
                }}
              />
            )}
            {stats.blocks_per_game !== undefined && (
              <Chip 
                size="small" 
                label={`${stats.blocks_per_game.toFixed(1)} BPG`}
                variant="outlined"
                sx={{ 
                  height: 'auto', 
                  fontSize: '0.6rem',
                  lineHeight: 1.2,
                  py: 0.25,
                  borderColor: 'divider',
                  bgcolor: 'background.paper'
                }}
              />
            )}
            {stats.rebounds_per_game !== undefined && (
              <Chip 
                size="small" 
                label={`${stats.rebounds_per_game.toFixed(1)} RPG`}
                variant="outlined"
                sx={{ 
                  height: 'auto', 
                  fontSize: '0.6rem',
                  lineHeight: 1.2,
                  py: 0.25,
                  borderColor: 'divider',
                  bgcolor: 'background.paper'
                }}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );

  if (onClick) {
    return (
      <Box onClick={onClick} sx={{ cursor: 'pointer', mb: SPACING.ITEM }}>
        {cardContent}
      </Box>
    );
  }

  return (
    <Link 
      href={`/players/${id}`} 
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: 8 }}
      aria-label={getPlayerAriaLabel(gamertag, teamName, position)}
    >
      {cardContent}
    </Link>
  );
}
