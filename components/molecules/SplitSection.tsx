'use client';
/**
 * SplitSection Molecule Component
 *
 * A two-column content section with text on one side and an image (or custom content) on the other.
 * Composes Box, HStack, VStack, Typography, and Icon atoms.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';
import { HStack, VStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';

export interface SplitSectionProps {
  title: string;
  description: string | React.ReactNode;
  bullets?: string[];
  image?: { src: string; alt: string };
  imagePosition?: 'left' | 'right';
  background?: 'default' | 'alt';
  children?: React.ReactNode;
  className?: string;
}

export const SplitSection: React.FC<SplitSectionProps> = ({
  title,
  description,
  bullets,
  image,
  imagePosition = 'right',
  background = 'default',
  children,
  className,
}) => {
  const textContent = (
    <VStack gap="md" className="flex-1 min-w-0">
      <Typography variant="h2">{title}</Typography>
      {typeof description === 'string' ? (
        <Typography variant="body" color="muted">
          {description}
        </Typography>
      ) : (
        description
      )}
      {bullets && bullets.length > 0 && (
        <VStack gap="sm">
          {bullets.map((bullet, index) => (
            <HStack key={index} gap="sm" align="start" className="mt-0.5">
              <Icon
                name="check"
                size="sm"
                className="text-primary flex-shrink-0 mt-0.5"
              />
              <Typography variant="body2">{bullet}</Typography>
            </HStack>
          ))}
        </VStack>
      )}
    </VStack>
  );

  const mediaContent = children ?? (
    image ? (
      <Box
        className={cn(
          'flex-1 min-w-0 min-h-[240px] rounded-md',
          'bg-cover bg-center',
        )}
        style={{ backgroundImage: `url(${image.src})` }}
        role="img"
        aria-label={image.alt}
      />
    ) : null
  );

  const isImageLeft = imagePosition === 'left';

  return (
    <Box
      className={cn(
        'w-full',
        background === 'alt'
          ? 'bg-muted'
          : 'bg-background',
        className,
      )}
      padding="lg"
    >
      <Box className={cn('w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-center', isImageLeft && 'lg:flex-row-reverse')}>
        <Box className="flex-1 min-w-0 lg:min-w-[45%]">
          {textContent}
        </Box>
        <Box className="flex-1 min-w-0 lg:max-w-[50%]">
          {mediaContent}
        </Box>
      </Box>
    </Box>
  );
};

SplitSection.displayName = 'SplitSection';
