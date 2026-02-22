'use client';

/**
 * JazariLock — Guard lock SVG icon for the Al-Jazari visualization.
 *
 * Two variants:
 * - Brass gear-lock (deterministic guard)
 * - Brain-lock (AI/call-service guard)
 */

import React from 'react';
import { lockIconPath, brainIconPath } from '../../lib/jazari/svg-paths';
import { JAZARI_COLORS } from '../../lib/jazari/types';
import { cn } from '../../lib/cn';

export interface JazariLockProps {
  /** Center X coordinate */
  cx: number;
  /** Center Y coordinate */
  cy: number;
  /** Icon size */
  size?: number;
  /** Whether this is an AI guard (brain icon) vs deterministic (lock icon) */
  isAI?: boolean;
  /** Additional CSS class on the wrapping <g> */
  className?: string;
}

export const JazariLock: React.FC<JazariLockProps> = ({
  cx,
  cy,
  size = 16,
  isAI = false,
  className,
}) => {
  const d = isAI ? brainIconPath(cx, cy, size) : lockIconPath(cx, cy, size);

  return (
    <g className={cn('jazari-lock', className)}>
      <path
        d={d}
        fill={JAZARI_COLORS.crimson}
        fillOpacity={0.85}
        stroke={JAZARI_COLORS.crimson}
        strokeWidth={0.8}
      />
    </g>
  );
};

JazariLock.displayName = 'JazariLock';
