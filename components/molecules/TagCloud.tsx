'use client';
/**
 * TagCloud Molecule Component
 *
 * A collection of tags displayed as badges in a wrapping layout.
 * Composes HStack and Badge atoms.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { HStack } from '../atoms/Stack';
import { Badge, type BadgeVariant } from '../atoms/Badge';

export interface TagCloudItem {
  label: string;
  href?: string;
  variant?: string;
}

export interface TagCloudProps {
  tags: string[] | TagCloudItem[];
  variant?: 'default' | 'primary' | 'accent';
  className?: string;
}

const variantMap: Record<string, BadgeVariant> = {
  default: 'default',
  primary: 'primary',
  accent: 'info',
};

function normalizeTags(tags: string[] | TagCloudItem[]): TagCloudItem[] {
  if (tags.length === 0) return [];
  if (typeof tags[0] === 'string') {
    return (tags as string[]).map((label) => ({ label }));
  }
  return tags as TagCloudItem[];
}

export const TagCloud: React.FC<TagCloudProps> = ({
  tags,
  variant = 'default',
  className,
}) => {
  const normalizedTags = normalizeTags(tags);

  return (
    <HStack gap="sm" className={cn('flex-wrap justify-center', className)}>
      {normalizedTags.map((tag, index) => {
        const badgeVariant = tag.variant
          ? (variantMap[tag.variant] ?? 'default')
          : (variantMap[variant] ?? 'default');

        return (
          <Badge key={index} variant={badgeVariant} label={tag.label} />
        );
      })}
    </HStack>
  );
};

TagCloud.displayName = 'TagCloud';
