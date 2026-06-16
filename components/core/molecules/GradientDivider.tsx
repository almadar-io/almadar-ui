'use client';
/**
 * GradientDivider Molecule Component
 *
 * A horizontal line that fades from transparent at edges to primary color at center.
 * Used between major sections for visual separation without hard background-color breaks.
 */

import React from 'react';
import { cn } from '../../../lib/cn';
import { Box } from '../atoms/Box';
import type { ColorToken } from '../atoms/types';

const colorTokenVars: Record<ColorToken, string> = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  muted: 'var(--color-muted)',
};

export interface GradientDividerProps {
  /** Semantic palette token or a raw CSS color value. Defaults to 'primary'. */
  color?: ColorToken | string;
  /** Additional class names */
  className?: string;
}

export const GradientDivider: React.FC<GradientDividerProps> = ({
  color,
  className,
}) => {
  const centerColor = color
    ? (color in colorTokenVars
        ? colorTokenVars[color as ColorToken]
        : color)
    : 'var(--color-primary)';

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
