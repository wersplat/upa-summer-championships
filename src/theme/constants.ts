/**
 * Theme constants for UPA Summer Championships
 * Use these constants for consistent spacing, colors, and styling across the application
 */

// Spacing constants (in MUI's 8px units)
export const SPACING = {
  // Vertical spacing
  SECTION: 6,       // 48px - Large sections
  SUBSECTION: 4,    // 32px - Subsections
  ELEMENT: 2,       // 16px - Between elements
  ITEM: 1,          // 8px - Between items in a list/group
  
  // Padding
  CARD_PADDING: 3,  // 24px - Standard card padding
  CONTAINER_PADDING: 4, // 32px - Container padding
  
  // Horizontal spacing
  GAP_SMALL: 1,     // 8px
  GAP_MEDIUM: 2,    // 16px
  GAP_LARGE: 3,     // 24px
};

// Border radius
export const BORDER_RADIUS = {
  SMALL: 1,         // 8px
  MEDIUM: 2,        // 16px
  LARGE: 3,         // 24px
};

// Elevation (shadow levels)
export const ELEVATION = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 4,
  HIGH: 8,
};

// Animation durations
export const ANIMATION = {
  FAST: '0.1s',
  MEDIUM: '0.2s',
  SLOW: '0.3s',
};

// Z-index levels
export const Z_INDEX = {
  BACKGROUND: -1,
  DEFAULT: 0,
  ABOVE: 1,
  HEADER: 10,
  MODAL: 100,
  TOOLTIP: 1000,
};

// Common style mixins
export const MIXINS = {
  GLASS_MORPHISM: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  TRUNCATE_TEXT: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  HOVER_EFFECT: {
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
  },
};

// Breakpoints (matching MUI defaults for reference)
export const BREAKPOINTS = {
  XS: 0,
  SM: 600,
  MD: 900,
  LG: 1200,
  XL: 1536,
};
