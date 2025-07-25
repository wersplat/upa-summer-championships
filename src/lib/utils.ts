import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return '';
  }
}

export function formatTime(timeString: string | null | undefined): string {
  if (!timeString) return '';
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    console.error('Error formatting time:', e);
    return '';
  }
}

export function getUniqueValues<T>(items: T[], key: keyof T): T[keyof T][] {
  const values = new Set<T[keyof T]>();
  items.forEach(item => {
    if (item[key] !== null && item[key] !== undefined) {
      values.add(item[key]);
    }
  });
  return Array.from(values);
}

export function filterMatches(
  matches: any[],
  filters: {
    searchQuery?: string;
    status?: string;
    group?: string;
    team?: string;
  }
) {
  return matches.filter(match => {
    // Search query filter
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      const matchText = [
        match.team_a_name,
        match.team_b_name,
        match.venue,
        match.group_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!matchText.includes(searchLower)) {
        return false;
      }
    }

    // Status filter
    if (filters.status && match.status !== filters.status) {
      return false;
    }

    // Group filter
    if (filters.group && match.group_name !== filters.group) {
      return false;
    }

    // Team filter
    if (filters.team && 
        match.team_a_name !== filters.team && 
        match.team_b_name !== filters.team) {
      return false;
    }

    return true;
  });
}
