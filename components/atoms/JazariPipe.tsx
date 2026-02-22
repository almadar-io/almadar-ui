'use client';

/**
 * JazariPipe — Sky-blue copper pipe effect indicator for the Al-Jazari visualization.
 * Renders a pipe icon with an optional count badge for multiple effects.
 */

import React from 'react';
import { pipeIconPath } from '../../lib/jazari/svg-paths';
import { JAZARI_COLORS } from '../../lib/jazari/types';
import { cn } from '../../lib/cn';

export interface JazariPipeProps {
  /** Center X coordinate */
  cx: number;
  /** Center Y coordinate */
  cy: number;
  /** Icon size */
  size?: number;
  /** Number of effects (shows count badge if > 1) */
  count?: number;
  /** Additional CSS class on the wrapping <g> */
  className?: string;
}

export const JazariPipe: React.FC<JazariPipeProps> = ({
  cx,
  cy,
  size = 16,
  count = 1,
  className,
}) => {
  const d = pipeIconPath(cx, cy, size);

  return (
    <g className={cn('jazari-pipe', className)}>
      <path
        d={d}
        fill={JAZARI_COLORS.sky}
        fillOpacity={0.85}
        stroke={JAZARI_COLORS.sky}
        strokeWidth={0.8}
      />
      {count > 1 && (
        <>
          <circle
            cx={cx + size * 0.5}
            cy={cy - size * 0.4}
            r={size * 0.3}
            fill={JAZARI_COLORS.sky}
          />
          <text
            x={cx + size * 0.5}
            y={cy - size * 0.4}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#fff"
            fontSize={size * 0.35}
            fontWeight={700}
          >
            {count}
          </text>
        </>
      )}
    </g>
  );
};

JazariPipe.displayName = 'JazariPipe';
