'use client';

/**
 * JazariTransitionArm — Mechanical arm (Bezier path) connecting two state gears.
 * Displays the event label at the midpoint, with optional guard lock and effect pipe.
 */

import React from 'react';
import type { JazariArmLayout } from '../../lib/jazari/types';
import { JAZARI_COLORS } from '../../lib/jazari/types';
import { JazariLock } from '../atoms/JazariLock';
import { JazariPipe } from '../atoms/JazariPipe';
import { useTranslate } from '../../hooks/useTranslate';
import { cn } from '../../lib/cn';

export interface JazariTransitionArmProps {
  /** Arm layout data from the layout engine */
  arm: JazariArmLayout;
  /** Whether to show guard icons */
  showGuards?: boolean;
  /** Whether to show effect icons */
  showEffects?: boolean;
  /** Additional CSS class */
  className?: string;
}

export const JazariTransitionArm: React.FC<JazariTransitionArmProps> = ({
  arm,
  showGuards = true,
  showEffects = true,
  className,
}) => {
  const { t } = useTranslate();
  void t;

  if (!arm.path) return null;

  return (
    <g className={cn('jazari-arm', className)}>
      {/* Arm path */}
      <path
        d={arm.path}
        fill="none"
        stroke={JAZARI_COLORS.brass}
        strokeWidth={1.5}
        strokeOpacity={0.7}
        markerEnd="url(#jazari-arrow)"
      />

      {/* Event label at midpoint */}
      <rect
        x={arm.labelX - 30}
        y={arm.labelY - 10}
        width={60}
        height={18}
        rx={4}
        fill={JAZARI_COLORS.lapis}
        fillOpacity={0.15}
        stroke={JAZARI_COLORS.lapis}
        strokeWidth={0.5}
        strokeOpacity={0.4}
      />
      <text
        x={arm.labelX}
        y={arm.labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fill={JAZARI_COLORS.lapis}
        fontSize={8}
        fontWeight={600}
        fontFamily="monospace"
      >
        {arm.event.length > 12 ? `${arm.event.slice(0, 11)}…` : arm.event}
      </text>

      {/* Guard lock icon */}
      {showGuards && arm.guard && (
        <JazariLock
          cx={arm.guard.x}
          cy={arm.guard.y}
          isAI={arm.guard.isAI}
          size={14}
        />
      )}

      {/* Effect pipe icon */}
      {showEffects && arm.effect && (
        <JazariPipe
          cx={arm.effect.x}
          cy={arm.effect.y}
          count={arm.effect.count}
          size={14}
        />
      )}
    </g>
  );
};

JazariTransitionArm.displayName = 'JazariTransitionArm';
