'use client';

/**
 * JazariArabesqueBorder — Lapis+gold geometric frame using SVG pattern + mask.
 * Renders a repeating 8-pointed star pattern as a decorative border.
 */

import React from 'react';
import { eightPointedStarPath } from '../../lib/jazari/svg-paths';
import { JAZARI_COLORS } from '../../lib/jazari/types';
import { useTranslate } from '../../hooks/useTranslate';
import { cn } from '../../lib/cn';

export interface JazariArabesqueBorderProps {
  /** Total SVG width */
  width: number;
  /** Total SVG height */
  height: number;
  /** Border thickness */
  thickness?: number;
  /** Star pattern tile size */
  tileSize?: number;
  /** Additional CSS class */
  className?: string;
}

const PATTERN_ID = 'jazari-arabesque-pattern';
const MASK_ID = 'jazari-border-mask';

export const JazariArabesqueBorder: React.FC<JazariArabesqueBorderProps> = ({
  width,
  height,
  thickness = 14,
  tileSize = 20,
  className,
}) => {
  const { t } = useTranslate();
  void t;

  const starOuter = tileSize * 0.4;
  const starInner = tileSize * 0.2;
  const starCenter = tileSize / 2;
  const starD = eightPointedStarPath(starCenter, starCenter, starOuter, starInner);

  return (
    <g className={cn('jazari-border', className)}>
      <defs>
        {/* Repeating star pattern */}
        <pattern
          id={PATTERN_ID}
          x={0}
          y={0}
          width={tileSize}
          height={tileSize}
          patternUnits="userSpaceOnUse"
        >
          <rect width={tileSize} height={tileSize} fill={JAZARI_COLORS.lapis} fillOpacity={0.1} />
          <path d={starD} fill={JAZARI_COLORS.gold} fillOpacity={0.6} />
        </pattern>

        {/* Border mask: outer rect minus inner rect */}
        <mask id={MASK_ID}>
          <rect x={0} y={0} width={width} height={height} fill="white" />
          <rect
            x={thickness}
            y={thickness}
            width={width - thickness * 2}
            height={height - thickness * 2}
            rx={6}
            fill="black"
          />
        </mask>
      </defs>

      {/* Patterned border */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={8}
        fill={`url(#${PATTERN_ID})`}
        mask={`url(#${MASK_ID})`}
      />

      {/* Thin gold outline */}
      <rect
        x={1}
        y={1}
        width={width - 2}
        height={height - 2}
        rx={8}
        fill="none"
        stroke={JAZARI_COLORS.gold}
        strokeWidth={1}
        strokeOpacity={0.4}
      />
      <rect
        x={thickness - 1}
        y={thickness - 1}
        width={width - (thickness - 1) * 2}
        height={height - (thickness - 1) * 2}
        rx={6}
        fill="none"
        stroke={JAZARI_COLORS.gold}
        strokeWidth={0.5}
        strokeOpacity={0.3}
      />
    </g>
  );
};

JazariArabesqueBorder.displayName = 'JazariArabesqueBorder';
