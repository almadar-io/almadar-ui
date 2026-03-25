'use client';
/**
 * CTABanner Molecule Component
 *
 * A call-to-action banner with title, subtitle, and action buttons.
 * Uses the site's theme naturally - no forced color inversions.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';
import { VStack, HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';

export type CTABannerBackground = 'default' | 'alt' | 'dark' | 'gradient' | 'primary';

export interface CTABannerProps {
  /** Banner headline */
  title: string;
  /** Supporting text below the title */
  subtitle?: string;
  /** Primary action button config */
  primaryAction?: { label: string; href: string };
  /** Secondary action button config */
  secondaryAction?: { label: string; href: string };
  /** Background style */
  background?: CTABannerBackground;
  /** Content alignment */
  align?: 'center' | 'left';
  /** Additional class names */
  className?: string;
}

export const CTABanner: React.FC<CTABannerProps> = ({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  background = 'alt',
  align = 'center',
  className,
}) => {
  const handleAction = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box
      className={cn(
        'py-16',
        background === 'alt' && 'bg-surface',
        background === 'dark' && 'bg-surface',
        background === 'gradient' && 'bg-surface',
        background === 'primary' && 'bg-surface',
        className,
      )}
    >
      <VStack
        gap="lg"
        align={align === 'center' ? 'center' : 'start'}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <Typography variant="h2" align={align}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body" color="muted" align={align}>
            {subtitle}
          </Typography>
        )}
        {(primaryAction || secondaryAction) && (
          <HStack gap="md" align="center">
            {primaryAction && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleAction(primaryAction.href)}
              >
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleAction(secondaryAction.href)}
              >
                {secondaryAction.label}
              </Button>
            )}
          </HStack>
        )}
      </VStack>
    </Box>
  );
};

CTABanner.displayName = 'CTABanner';
