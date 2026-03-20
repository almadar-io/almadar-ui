'use client';
/**
 * CTABanner Molecule Component
 *
 * A call-to-action banner with title, subtitle, and action buttons.
 * Supports dark, gradient, and primary background styles.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';
import { VStack, HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';

export type CTABannerBackground = 'dark' | 'gradient' | 'primary';

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

const backgroundStyles: Record<CTABannerBackground, string> = {
  dark: 'bg-[var(--color-foreground)]',
  gradient: [
    'bg-gradient-to-br',
    'from-[var(--color-primary)]',
    'to-[var(--color-secondary)]',
  ].join(' '),
  primary: 'bg-[var(--color-primary)]',
};

const titleColorMap: Record<CTABannerBackground, string> = {
  dark: 'text-[var(--color-background)]',
  gradient: 'text-[var(--color-primary-foreground)]',
  primary: 'text-[var(--color-primary-foreground)]',
};

const subtitleColorMap: Record<CTABannerBackground, string> = {
  dark: 'text-[var(--color-muted-foreground)]',
  gradient: 'text-[var(--color-primary-foreground)] opacity-80',
  primary: 'text-[var(--color-primary-foreground)] opacity-80',
};

export const CTABanner: React.FC<CTABannerProps> = ({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  background = 'dark',
  align = 'center',
  className,
}) => {
  const handleAction = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box
      className={cn(
        backgroundStyles[background],
        'rounded-[var(--radius-lg)]',
        'py-16 px-4',
        className,
      )}
    >
      <VStack
        gap="lg"
        align={align === 'center' ? 'center' : 'start'}
        className="max-w-3xl mx-auto"
      >
        <Typography
          variant="h2"
          align={align}
          className={titleColorMap[background]}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body"
            align={align}
            className={subtitleColorMap[background]}
          >
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
