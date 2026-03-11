'use client';
import * as React from 'react';
import { cn } from '../../../lib/cn';
import { StatBadge } from './StatBadge';
import { Box } from '../../atoms/Box';

export interface ResourceBarResource {
  /** Icon for the resource */
  icon?: React.ReactNode;
  /** Resource name */
  label: string;
  /** Current amount */
  value: number;
  /** Maximum amount (displays as bar if provided) */
  max?: number;
}

export interface ResourceBarProps {
  /** Resources to display */
  resources: ResourceBarResource[];
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

export function ResourceBar({
  resources,
  size = 'md',
  className,
}: ResourceBarProps) {
  return (
    <Box
      className={cn(
        'flex items-center gap-2 flex-wrap',
        className
      )}
    >
      {resources.map((resource, i) => (
        <StatBadge
          key={i}
          label={resource.label}
          value={resource.value}
          max={resource.max}
          format={resource.max != null ? 'bar' : 'number'}
          icon={resource.icon}
          size={size}
        />
      ))}
    </Box>
  );
}

ResourceBar.displayName = 'ResourceBar';
