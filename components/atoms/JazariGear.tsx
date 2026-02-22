'use client';

/**
 * JazariGear — A single brass gear SVG representing a state in the
 * Al-Jazari state machine visualization.
 *
 * Variants:
 * - Default (brass): intermediate state
 * - Initial (gold glow): initial state
 * - Terminal (dashed stroke): terminal/final state
 */

import React from 'react';
import { gearTeethPath } from '../../lib/jazari/svg-paths';
import { JAZARI_COLORS } from '../../lib/jazari/types';
import { cn } from '../../lib/cn';

export interface JazariGearProps {
  /** Center X coordinate */
  cx: number;
  /** Center Y coordinate */
  cy: number;
  /** Gear outer radius */
  radius?: number;
  /** State name label displayed inside the gear */
  label: string;
  /** Whether this is the initial state */
  isInitial?: boolean;
  /** Whether this is a terminal state */
  isTerminal?: boolean;
  /** Additional CSS class on the wrapping <g> */
  className?: string;
}

const TEETH_COUNT = 12;
const TEETH_DEPTH = 7;
const INNER_RATIO = 0.6;

export const JazariGear: React.FC<JazariGearProps> = ({
  cx,
  cy,
  radius = 35,
  label,
  isInitial = false,
  isTerminal = false,
  className,
}) => {
  const outerR = radius + TEETH_DEPTH;
  const innerR = radius * INNER_RATIO;
  const teethD = gearTeethPath(cx, cy, radius - 2, outerR, TEETH_COUNT);

  const fillColor = isInitial ? JAZARI_COLORS.gold : JAZARI_COLORS.brass;
  const strokeColor = isTerminal ? JAZARI_COLORS.brass : fillColor;
  const strokeDash = isTerminal ? '4 3' : 'none';
  const glowFilter = isInitial ? 'url(#jazari-glow)' : undefined;

  // Truncate long labels
  const displayLabel = label.length > 10 ? `${label.slice(0, 9)}…` : label;
  const fontSize = label.length > 7 ? 9 : 11;

  return (
    <g className={cn('jazari-gear', className)}>
      {/* Gear teeth outline */}
      <path
        d={teethD}
        fill={fillColor}
        fillOpacity={0.2}
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeDasharray={strokeDash}
        filter={glowFilter}
      />
      {/* Inner circle */}
      <circle
        cx={cx}
        cy={cy}
        r={innerR}
        fill={fillColor}
        fillOpacity={0.15}
        stroke={strokeColor}
        strokeWidth={1}
        strokeDasharray={strokeDash}
      />
      {/* State name */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill={fillColor}
        fontSize={fontSize}
        fontWeight={600}
        fontFamily="'Noto Naskh Arabic', serif"
      >
        {displayLabel}
      </text>
    </g>
  );
};

JazariGear.displayName = 'JazariGear';
