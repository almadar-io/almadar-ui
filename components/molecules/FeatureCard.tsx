'use client';
/**
 * FeatureCard Molecule Component
 *
 * A card highlighting a feature with icon, title, description, and optional link.
 * Composes Card, VStack, Icon, Typography, and Button atoms.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Card } from '../atoms/Card';
import { VStack } from '../atoms/Stack';
import { Icon } from '../atoms/Icon';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';

export interface FeatureCardProps {
  /** Icon name (Lucide string) or ReactNode */
  icon?: string | React.ReactNode;
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
  /** Optional link URL */
  href?: string;
  /** Label for the link button */
  linkLabel?: string;
  /** Card visual variant */
  variant?: 'default' | 'bordered' | 'elevated' | 'interactive';
  /** Card size affecting icon and spacing */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

const iconSizeMap: Record<string, 'sm' | 'md' | 'lg'> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

const gapMap: Record<string, 'sm' | 'md' | 'lg'> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  href,
  linkLabel = 'Learn more',
  variant = 'bordered',
  size = 'md',
  className,
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return (
        <Icon
          name={icon}
          size={iconSizeMap[size]}
          className="text-[var(--color-primary)]"
        />
      );
    }
    return icon;
  };

  const handleLinkClick = () => {
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card
      variant={variant}
      padding={size}
      className={cn(
        variant === 'interactive' && 'hover:border-[var(--color-primary)]',
        className,
      )}
      onClick={variant === 'interactive' && href ? handleLinkClick : undefined}
    >
      <VStack gap={gapMap[size]} align="start">
        {renderIcon()}
        <Typography variant="h4" className={size === 'sm' ? 'text-base' : undefined}>
          {title}
        </Typography>
        <Typography variant="body2" color="muted">
          {description}
        </Typography>
        {href && variant !== 'interactive' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLinkClick}
            className="text-[var(--color-primary)] -ml-2"
          >
            {linkLabel}
          </Button>
        )}
      </VStack>
    </Card>
  );
};

FeatureCard.displayName = 'FeatureCard';
