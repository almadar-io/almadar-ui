'use client';
/**
 * GradientDivider Molecule Component
 *
 * A horizontal line that fades from transparent at edges to primary color at center.
 * Used between major sections for visual separation without hard background-color breaks.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';

export interface GradientDividerProps {
  /** Override the center color (CSS value). Defaults to var(--color-primary). */
  color?: string;
  /** Additional class names */
  className?: string;
}

export const GradientDivider: React.FC<GradientDividerProps> = ({
  color,
  className,
}) => {
  const centerColor = color ?? 'var(--color-primary)';

  return (
    <Box
      className={cn('w-full h-px', className)}
      style={{
        background: `linear-gradient(to right, transparent, ${centerColor}, transparent)`,
      }}
    />
  );
};

GradientDivider.displayName = 'GradientDivider';
