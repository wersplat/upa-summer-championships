/**
 * Accessibility utilities for UPA Summer Championships
 * Use these utilities to ensure consistent accessibility practices across the application
 */

/**
 * Generate an aria-label for a player link
 * @param name - Player name or gamertag
 * @param team - Optional team name
 * @param position - Optional player position
 * @returns Accessible label string
 */
export function getPlayerAriaLabel(name: string, team?: string | null, position?: string | null): string {
  let label = `View ${name}'s profile`;
  
  if (position && team) {
    label = `View ${name}'s profile, ${position} for ${team}`;
  } else if (position) {
    label = `View ${name}'s profile, ${position}`;
  } else if (team) {
    label = `View ${name}'s profile from ${team}`;
  }
  
  return label;
}

/**
 * Generate an aria-label for a team link
 * @param name - Team name
 * @returns Accessible label string
 */
export function getTeamAriaLabel(name: string): string {
  return `View ${name} team details`;
}

/**
 * Generate an aria-label for a match link
 * @param homeTeam - Home team name
 * @param awayTeam - Away team name
 * @param date - Optional match date
 * @returns Accessible label string
 */
export function getMatchAriaLabel(homeTeam: string, awayTeam: string, date?: string): string {
  let label = `View ${homeTeam} vs ${awayTeam} match details`;
  
  if (date) {
    label = `View ${homeTeam} vs ${awayTeam} match details from ${date}`;
  }
  
  return label;
}

/**
 * Generate an aria-label for a sort button
 * @param columnName - Column name being sorted
 * @param isAscending - Whether sort is ascending
 * @returns Accessible label string
 */
export function getSortAriaLabel(columnName: string, isAscending: boolean): string {
  return `Sort by ${columnName} in ${isAscending ? 'ascending' : 'descending'} order`;
}

/**
 * Generate an aria-label for a filter button/control
 * @param filterName - Name of the filter
 * @param currentValue - Current filter value
 * @returns Accessible label string
 */
export function getFilterAriaLabel(filterName: string, currentValue?: string): string {
  if (currentValue) {
    return `Filter by ${filterName}, currently set to ${currentValue}`;
  }
  return `Filter by ${filterName}`;
}

/**
 * Props for skip link component
 */
export interface SkipLinkProps {
  targetId: string;
  label?: string;
}

/**
 * Generate props for a skip link (for keyboard navigation)
 * @param targetId - ID of the element to skip to
 * @param label - Optional custom label
 * @returns Props for skip link
 */
export function getSkipLinkProps(targetId: string, label?: string): SkipLinkProps {
  return {
    targetId,
    label: label || 'Skip to main content',
  };
}

/**
 * ARIA attributes for a tab panel
 * @param id - Base ID for the tab panel
 * @param index - Tab index
 * @returns ARIA attributes object
 */
export function getTabPanelProps(id: string, index: number): Record<string, string> {
  return {
    'id': `${id}-tabpanel-${index}`,
    'aria-labelledby': `${id}-tab-${index}`,
    'role': 'tabpanel',
  };
}

/**
 * ARIA attributes for a tab
 * @param id - Base ID for the tab
 * @param index - Tab index
 * @param selected - Whether tab is selected
 * @returns ARIA attributes object
 */
export function getTabProps(id: string, index: number, selected: boolean): Record<string, string | boolean> {
  return {
    'id': `${id}-tab-${index}`,
    'aria-controls': `${id}-tabpanel-${index}`,
    'aria-selected': selected,
    'role': 'tab',
  };
}
