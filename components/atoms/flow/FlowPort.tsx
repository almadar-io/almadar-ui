'use client';
/**
 * FlowPort Component
 *
 * Connection point rendered on a graph node. Shows a small circle that
 * indicates whether the port is connected or available for wiring.
 * Direction determines label placement (left for inputs, right for outputs).
 */
import React from 'react';
import { cn } from '../../../lib/cn';
import { Box } from '../Box';
import { Typography } from '../Typography';
import { HStack } from '../Stack';

export interface FlowPortProps {
  /** Whether this port receives or sends connections. */
  direction: 'in' | 'out';
  /** Semantic type of the port (e.g. "string", "event", "entity"). */
  portType: string;
  /** Human-readable label shown beside the circle. */
  label?: string;
  /** Whether the port currently has a wire attached. */
  connected?: boolean;
  /** Whether a dragged wire is compatible with this port. */
  compatible?: boolean;
  className?: string;
}

/**
 * A 12px circle with optional label indicating a node connection point.
 * Outlined when disconnected, filled primary when connected, green ring when compatible.
 */
export const FlowPort: React.FC<FlowPortProps> = ({
  direction,
  portType,
  label,
  connected = false,
  compatible = false,
  className,
}) => {
  const dot = (
    <Box
      className={cn(
        'w-3 h-3 rounded-full shrink-0 transition-all duration-150',
        connected
          ? 'bg-primary'
          : 'bg-transparent border-[length:var(--border-width)] border-muted-foreground',
        compatible && 'ring-2 ring-success ring-offset-1 ring-offset-background',
        className,
      )}
      role="presentation"
      aria-label={`${direction} port: ${portType}`}
    />
  );

  if (!label) return dot;

  return (
    <HStack gap="xs" align="center" className={cn(direction === 'in' ? 'flex-row-reverse' : 'flex-row')}>
      {dot}
      <Typography variant="caption" className="text-muted-foreground select-none whitespace-nowrap">
        {label}
      </Typography>
    </HStack>
  );
};

FlowPort.displayName = 'FlowPort';
