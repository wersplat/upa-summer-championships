/**
 * Color utilities for UPA Summer Championships
 * Use these utilities to ensure consistent color usage across the application
 */

// Award category colors
export const AWARD_COLORS = {
  OFFENSIVE: {
    main: 'error.main',
    light: 'error.light',
    dark: 'error.dark',
    contrastText: 'error.contrastText',
  },
  DEFENSIVE: {
    main: 'info.main',
    light: 'info.light',
    dark: 'info.dark',
    contrastText: 'info.contrastText',
  },
  ROOKIE: {
    main: 'warning.main',
    light: 'warning.light',
    dark: 'warning.dark',
    contrastText: 'warning.contrastText',
  },
};

// Position colors
export const POSITION_COLORS = {
  'Point Guard': 'primary.main',
  'Shooting Guard': 'secondary.main',
  'Small Forward': 'error.main',
  'Power Forward': 'warning.main',
  'Center': 'info.main',
  'default': 'grey.500',
};

// Team colors - can be expanded with actual team colors
export const TEAM_COLORS = {
  'default': 'primary.main',
};

// Status colors
export const STATUS_COLORS = {
  active: 'success.main',
  inactive: 'grey.500',
  injured: 'error.main',
  suspended: 'warning.main',
};

// Stat trend colors
export const TREND_COLORS = {
  positive: 'success.main',
  neutral: 'grey.500',
  negative: 'error.main',
};

// Background gradients
export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
  secondary: 'linear-gradient(135deg, #f50057 0%, #c51162 100%)',
  dark: 'linear-gradient(135deg, #424242 0%, #212121 100%)',
  light: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
  awards: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(13, 71, 161, 0.1) 100%)',
};

/**
 * Get color for a player position
 * @param position - Player position
 * @returns MUI theme color string
 */
export function getPositionColor(position: string | null | undefined): string {
  if (!position) return POSITION_COLORS.default;
  return POSITION_COLORS[position as keyof typeof POSITION_COLORS] || POSITION_COLORS.default;
}

/**
 * Get color for a team
 * @param teamName - Team name
 * @returns MUI theme color string
 */
export function getTeamColor(teamName: string | null | undefined): string {
  if (!teamName) return TEAM_COLORS.default;
  return TEAM_COLORS[teamName as keyof typeof TEAM_COLORS] || TEAM_COLORS.default;
}

/**
 * Get award category color
 * @param category - Award category ('OFFENSIVE', 'DEFENSIVE', 'ROOKIE')
 * @param variant - Color variant ('main', 'light', 'dark', 'contrastText')
 * @returns MUI theme color string
 */
export function getAwardColor(
  category: 'OFFENSIVE' | 'DEFENSIVE' | 'ROOKIE', 
  variant: 'main' | 'light' | 'dark' | 'contrastText' = 'main'
): string {
  return AWARD_COLORS[category][variant];
}
