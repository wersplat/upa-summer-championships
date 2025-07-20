'use client';

import React from 'react';
import { 
  Card, 
  CardProps, 
  CardHeader, 
  CardHeaderProps, 
  CardContent, 
  CardContentProps, 
  CardActions, 
  CardActionsProps,
  Typography,
  Box
} from '@mui/material';
import { SPACING, BORDER_RADIUS, MIXINS } from '@/theme/constants';

interface StandardCardProps {
  /**
   * Optional ID for the card (for accessibility)
   */
  id?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  elevation?: number;
  variant?: 'default' | 'outlined' | 'glass' | 'highlight';
  cardProps?: CardProps;
  headerProps?: CardHeaderProps;
  contentProps?: CardContentProps;
  actionsProps?: CardActionsProps;
  className?: string;
}

/**
 * StandardCard - A consistent card component for use throughout the application
 * 
 * @param title - Optional card title
 * @param subtitle - Optional card subtitle
 * @param icon - Optional icon to display next to the title
 * @param action - Optional action element (button, icon, etc.)
 * @param children - Card content
 * @param footer - Optional footer content
 * @param elevation - Card elevation (shadow level)
 * @param variant - Card style variant
 * @param cardProps - Additional props for MUI Card component
 * @param headerProps - Additional props for MUI CardHeader component
 * @param contentProps - Additional props for MUI CardContent component
 * @param actionsProps - Additional props for MUI CardActions component
 * @param className - Additional CSS class name
 */
export default function StandardCard({
  title,
  subtitle,
  icon,
  action,
  children,
  footer,
  elevation = 1,
  variant = 'default',
  cardProps,
  headerProps,
  contentProps,
  actionsProps,
  className,
  id,
}: StandardCardProps) {
  // Determine card styling based on variant
  const getCardStyle = () => {
    switch (variant) {
      case 'glass':
        return {
          ...MIXINS.GLASS_MORPHISM,
          borderRadius: BORDER_RADIUS.MEDIUM,
        };
      case 'outlined':
        return {
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: BORDER_RADIUS.MEDIUM,
        };
      case 'highlight':
        return {
          borderRadius: BORDER_RADIUS.MEDIUM,
          background: 'linear-gradient(to right bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          border: '1px solid',
          borderColor: 'primary.light',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        };
      default:
        return {
          borderRadius: BORDER_RADIUS.MEDIUM,
        };
    }
  };

  return (
    <Card 
      elevation={elevation}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...getCardStyle(),
      }}
      id={id}
      role="region"
      aria-labelledby={id ? `${id}-title` : undefined}
      {...cardProps}
      className={className}
    >
      {(title || subtitle || icon) && (
        <CardHeader
          title={
            title && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING.ITEM }}>
                {icon}
                {typeof title === 'string' ? (
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ fontWeight: 'bold' }}
                    id={id ? `${id}-title` : undefined}
                  >
                    {title}
                  </Typography>
                ) : (
                  <div id={id ? `${id}-title` : undefined}>{title}</div>
                )}
              </Box>
            )
          }
          subheader={subtitle}
          action={action}
          sx={{ pb: 0 }}
          {...headerProps}
        />
      )}
      <CardContent sx={{ pt: title ? SPACING.ITEM : SPACING.CARD_PADDING, flexGrow: 1 }} {...contentProps}>
        {children}
      </CardContent>
      {footer && (
        <CardActions sx={{ p: SPACING.CARD_PADDING, pt: 0 }} {...actionsProps}>
          {footer}
        </CardActions>
      )}
    </Card>
  );
}
