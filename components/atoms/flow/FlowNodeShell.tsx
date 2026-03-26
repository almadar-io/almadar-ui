'use client';
/**
 * FlowNodeShell Component
 *
 * Outer container for a graph node. Provides the card-like wrapper with a
 * thin colored header bar, optional node-type label, and selection / warning
 * ring states. Children are rendered in the body area below the header.
 */
import React from 'react';
import { cn } from '../../../lib/cn';
import { Box } from '../Box';
import { Typography } from '../Typography';

export interface FlowNodeShellProps {
  /** Whether this node is currently selected on the canvas. */
  selected?: boolean;
  /** Whether this node has a validation warning. */
  warning?: boolean;
  /** Semantic node type label shown in the header (e.g. "Entity", "Trait"). */
  nodeType?: string;
  /** Background color for the 8px header bar. Any valid CSS color. */
  headerColor?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Card-style wrapper for flow nodes with a colored header strip.
 * Selection adds a solid primary ring; warnings show a dashed warning ring.
 */
export const FlowNodeShell: React.FC<FlowNodeShellProps> = ({
  selected = false,
  warning = false,
  nodeType,
  headerColor = 'var(--color-primary)',
  children,
  className,
}) => (
  <Box
    className={cn(
      'rounded-md overflow-hidden bg-card',
      'border-[length:var(--border-width)] border-border',
      'shadow-sm transition-shadow duration-150 min-w-[140px]',
      selected && 'ring-2 ring-primary',
      warning && !selected && 'ring-2 ring-dashed ring-warning',
      className,
    )}
  >
    {/* Colored header bar */}
    <Box
      className="flex items-center px-2"
      style={{ backgroundColor: headerColor, height: 8 }}
    >
      {nodeType && (
        <Typography
          variant="caption"
          className="text-white/90 font-semibold select-none leading-none sr-only"
        >
          {nodeType}
        </Typography>
      )}
    </Box>

    {/* Node type label row (visible) */}
    {nodeType && (
      <Box className="px-2 pt-1.5 pb-0.5">
        <Typography variant="caption" className="text-muted-foreground font-semibold uppercase tracking-wider select-none">
          {nodeType}
        </Typography>
      </Box>
    )}

    {/* Body content */}
    <Box className="px-2 pb-2">
      {children}
    </Box>
  </Box>
);

FlowNodeShell.displayName = 'FlowNodeShell';
