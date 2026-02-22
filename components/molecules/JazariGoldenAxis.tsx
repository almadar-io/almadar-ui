'use client';

/**
 * JazariGoldenAxis — Horizontal gold rod running through all gear centers.
 * Displays entity field names as small labels along the axis.
 */

import React from 'react';
import { JAZARI_COLORS } from '../../lib/jazari/types';
import { useTranslate } from '../../hooks/useTranslate';
import { cn } from '../../lib/cn';

export interface JazariGoldenAxisProps {
  /** Axis Y position */
  y: number;
  /** Start X coordinate */
  startX: number;
  /** End X coordinate */
  endX: number;
  /** Entity field labels to display */
  entityFields?: string[];
  /** Additional CSS class */
  className?: string;
}

export const JazariGoldenAxis: React.FC<JazariGoldenAxisProps> = ({
  y,
  startX,
  endX,
  entityFields = [],
  className,
}) => {
  const { t } = useTranslate();
  void t;

  const totalLen = Math.abs(endX - startX);
  const fieldCount = entityFields.length;

  return (
    <g className={cn('jazari-axis', className)}>
      {/* Main golden line */}
      <line
        x1={startX - 20}
        y1={y}
        x2={endX + 20}
        y2={y}
        stroke={JAZARI_COLORS.gold}
        strokeWidth={2}
        strokeOpacity={0.5}
      />
      {/* End caps */}
      <circle cx={startX - 20} cy={y} r={3} fill={JAZARI_COLORS.gold} fillOpacity={0.6} />
      <circle cx={endX + 20} cy={y} r={3} fill={JAZARI_COLORS.gold} fillOpacity={0.6} />

      {/* Entity field labels */}
      {fieldCount > 0 && entityFields.map((field, i) => {
        const x = startX + (totalLen / (fieldCount + 1)) * (i + 1);
        return (
          <text
            key={field}
            x={x}
            y={y + 18}
            textAnchor="middle"
            fill={JAZARI_COLORS.sky}
            fontSize={8}
            fontFamily="monospace"
            opacity={0.7}
          >
            {field}
          </text>
        );
      })}
    </g>
  );
};

JazariGoldenAxis.displayName = 'JazariGoldenAxis';
