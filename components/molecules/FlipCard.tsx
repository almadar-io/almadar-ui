'use client';
/**
 * FlipCard - A two-sided card with 3D flip animation.
 *
 * Pure presentational molecule: no entity binding, no event bus, no translations.
 * Uses the FlipContainer atom for the 3D transform mechanics.
 */
import React from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';
import { FlipContainer } from '../atoms/FlipContainer';

export interface FlipCardProps {
  /** Content rendered on the front face */
  front: React.ReactNode;
  /** Content rendered on the back face */
  back: React.ReactNode;
  /** Controlled flip state */
  flipped?: boolean;
  /** Callback when the card is clicked to flip */
  onFlip?: () => void;
  /** Optional className for the outer container */
  className?: string;
  /** Card height as a Tailwind class (default: 'h-64') */
  height?: string;
}

export const FlipCard = ({
  front,
  back,
  flipped = false,
  onFlip,
  className,
  height = 'h-64',
}: FlipCardProps) => {
  return (
    <FlipContainer
      flipped={flipped}
      className={cn(height, className)}
      onClick={onFlip}
    >
      {/* Front face */}
      <Box
        className="absolute inset-0 w-full h-full rounded-lg shadow-lg flex items-center justify-center p-6"
        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
      >
        {front}
      </Box>

      {/* Back face */}
      <Box
        className="absolute inset-0 w-full h-full rounded-lg shadow-lg flex items-center justify-center p-6"
        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      >
        {back}
      </Box>
    </FlipContainer>
  );
};

FlipCard.displayName = 'FlipCard';
