'use client';
/**
 * ListingCard Molecule Component
 *
 * Real-estate / classifieds / marketplace listing card with hero image,
 * price, location, key facts, and favorite toggle.
 * Composes Card, VStack, HStack, Badge, Typography, Icon atoms.
 */

import React from 'react';
import { Heart, Star, MapPin } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Card } from '../atoms/Card';
import { VStack, HStack } from '../atoms/Stack';
import { Badge } from '../atoms/Badge';
import { Typography } from '../atoms/Typography';
import { resolveIcon } from '../atoms/Icon';

export interface ListingFact {
  /** Lucide icon name (e.g. 'bed', 'bath', 'square') */
  icon?: string;
  /** Fact label, e.g. '3 bed' / '$45/hr' / 'San Francisco' */
  label: string;
}

export type ListingBadgeVariant =
  | 'new'
  | 'featured'
  | 'price-drop'
  | 'sold'
  | 'pending';

export interface ListingCardProps {
  title: string;
  imageUrl: string;
  imageAlt?: string;
  /** Pre-formatted price string (e.g. '$525,000', '$45/hr') */
  price?: string;
  location?: string;
  /** Numeric rating 0-5 */
  rating?: number;
  reviewCount?: number;
  /** 2-4 quick stats with optional icons */
  facts?: ListingFact[];
  badge?: ListingBadgeVariant;
  favorite?: boolean;
  onFavoriteToggle?: () => void;
  onClick?: () => void;
  /** Optional link target. When provided, the card renders as an <a> wrapper. */
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal';
  className?: string;
}

const badgeVariantMap: Record<
  ListingBadgeVariant,
  { variant: 'primary' | 'warning' | 'success' | 'neutral' | 'info'; label: string }
> = {
  'new': { variant: 'primary', label: 'New' },
  'featured': { variant: 'warning', label: 'Featured' },
  'price-drop': { variant: 'success', label: 'Price drop' },
  'sold': { variant: 'neutral', label: 'Sold' },
  'pending': { variant: 'info', label: 'Pending' },
};

const titleVariantMap: Record<'sm' | 'md' | 'lg', 'h5' | 'h4' | 'h3'> = {
  sm: 'h5',
  md: 'h4',
  lg: 'h3',
};

const priceSizeMap: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
};

const factIconSizeMap: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-4 h-4',
};

const contentPaddingMap: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export const ListingCard: React.FC<ListingCardProps> = ({
  title,
  imageUrl,
  imageAlt,
  price,
  location,
  rating,
  reviewCount,
  facts,
  badge,
  favorite = false,
  onFavoriteToggle,
  onClick,
  href,
  size = 'md',
  layout = 'vertical',
  className,
}) => {
  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.();
  };

  const badgeInfo = badge ? badgeVariantMap[badge] : null;
  const isHorizontal = layout === 'horizontal';

  const imageWrapperClasses = cn(
    'relative overflow-hidden bg-muted',
    isHorizontal
      ? 'aspect-square w-1/3 flex-shrink-0 rounded-l-md'
      : 'aspect-[4/3] w-full rounded-t-md',
  );

  const cardContent = (
    <Card
      variant={onClick || href ? 'interactive' : 'bordered'}
      padding="none"
      className={cn(
        'overflow-hidden flex',
        isHorizontal ? 'flex-row' : 'flex-col',
        'transition-all duration-[var(--transition-normal)] hover:shadow-lg',
        className,
      )}
      onClick={onClick}
    >
      <div className={imageWrapperClasses}>
        <img
          src={imageUrl}
          alt={imageAlt ?? title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {badgeInfo && (
          <div className="absolute top-2 left-2">
            <Badge variant={badgeInfo.variant} size="sm">
              {badgeInfo.label}
            </Badge>
          </div>
        )}
        {onFavoriteToggle && (
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={favorite}
            className={cn(
              'absolute top-2 right-2',
              'inline-flex items-center justify-center',
              'w-8 h-8 rounded-full',
              'bg-white/70 backdrop-blur-sm',
              'border border-border',
              'transition-colors duration-[var(--transition-fast)]',
              'hover:bg-white/90',
            )}
          >
            <Heart
              className={cn(
                'w-4 h-4',
                favorite ? 'text-error' : 'text-foreground',
              )}
              fill={favorite ? 'currentColor' : 'none'}
              strokeWidth={2}
            />
          </button>
        )}
      </div>

      <VStack
        gap="xs"
        align="start"
        className={cn('flex-1 min-w-0', contentPaddingMap[size])}
      >
        <Typography
          variant={titleVariantMap[size]}
          truncate
          className="w-full"
        >
          {title}
        </Typography>

        {price && (
          <Typography
            as="span"
            variant="body1"
            weight="bold"
            className={cn('text-primary', priceSizeMap[size])}
          >
            {price}
          </Typography>
        )}

        {location && (
          <HStack gap="xs" align="center" className="w-full min-w-0">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <Typography variant="caption" truncate className="min-w-0">
              {location}
            </Typography>
          </HStack>
        )}

        {typeof rating === 'number' && (
          <HStack gap="xs" align="center">
            <Star
              className="w-3.5 h-3.5 text-warning"
              fill="currentColor"
              strokeWidth={1.5}
            />
            <Typography variant="caption" weight="semibold">
              {rating.toFixed(1)}
            </Typography>
            {typeof reviewCount === 'number' && (
              <Typography variant="caption" color="muted">
                ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
              </Typography>
            )}
          </HStack>
        )}

        {facts && facts.length > 0 && (
          <HStack gap="md" align="center" className="flex-wrap pt-1">
            {facts.slice(0, 4).map((fact) => {
              const FactIcon = fact.icon ? resolveIcon(fact.icon) : null;
              return (
                <HStack key={fact.label} gap="xs" align="center">
                  {FactIcon && (
                    <FactIcon
                      className={cn(
                        factIconSizeMap[size],
                        'text-muted-foreground',
                      )}
                      strokeWidth={2}
                    />
                  )}
                  <Typography variant="caption">{fact.label}</Typography>
                </HStack>
              );
            })}
          </HStack>
        )}
      </VStack>
    </Card>
  );

  if (href) {
    return (
      <a
        href={href}
        className={cn('block no-underline text-inherit')}
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
};

ListingCard.displayName = 'ListingCard';
