'use client';
/**
 * FlowMinimap Component
 *
 * A styled container that wraps a React Flow MiniMap at the organism level.
 * Since atoms must not depend on React Flow, this component only provides the
 * card-styled wrapper box and exports a color config object that organisms pass
 * through to the MiniMap props.
 */
import React from 'react';
import { cn } from '../../../lib/cn';
import { Box } from '../Box';

export interface FlowMinimapProps {
  /** Additional class names applied to the wrapper. */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Color tokens for the React Flow MiniMap component.
 * Organisms import this and spread it onto `<MiniMap {...MINIMAP_COLORS} />`.
 */
export const MINIMAP_COLORS = {
  nodeColor: 'var(--color-primary, #3B82F6)',
  maskColor: 'var(--color-background, #ffffff80)',
  nodeStrokeColor: 'var(--color-border, #E5E7EB)',
} as const;

/**
 * Card-styled wrapper for the React Flow MiniMap.
 * Render the actual `<MiniMap>` component as children at the organism level.
 */
export const FlowMinimap: React.FC<FlowMinimapProps> = ({
  className,
  children,
}) => (
  <Box
    className={cn(
      'rounded-md overflow-hidden',
      'bg-card border-[length:var(--border-width)] border-border',
      'shadow-sm',
      className,
    )}
  >
    {children}
  </Box>
);

FlowMinimap.displayName = 'FlowMinimap';
