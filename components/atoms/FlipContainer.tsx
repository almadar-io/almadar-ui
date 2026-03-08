'use client';
/**
 * FlipContainer - A 3D perspective container atom for flip animations.
 *
 * Provides CSS 3D transform infrastructure: perspective on the outer wrapper,
 * preserve-3d + rotateY on the inner, and backface-visibility hidden on each child face.
 */
import React from 'react';
import { cn } from '../../lib/cn';
import { Box } from './Box';

export interface FlipContainerProps {
  /** Whether the container is flipped (rotateY 180deg) */
  flipped: boolean;
  /** Optional className for the outer wrapper */
  className?: string;
  /** The two face elements (front and back) */
  children: React.ReactNode;
  /** Click handler on the outer wrapper */
  onClick?: () => void;
}

export const FlipContainer = ({
  flipped,
  className,
  children,
  onClick,
}: FlipContainerProps) => {
  return (
    <Box
      className={cn('relative w-full cursor-pointer', className)}
      style={{ perspective: '1000px' }}
      onClick={onClick}
    >
      <Box
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

FlipContainer.displayName = 'FlipContainer';
