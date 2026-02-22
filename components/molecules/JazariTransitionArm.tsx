'use client';

/**
 * JazariTransitionArm — Mechanical arm (Bezier path) connecting two state gears.
 * Displays the event label at the midpoint, with optional guard lock and effect pipe.
 */

import React, { useCallback } from 'react';
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
  /** Called when mouse enters the arm area */
  onHover?: (arm: JazariArmLayout, screenX: number, screenY: number) => void;
  /** Called when mouse leaves the arm area */
  onLeave?: () => void;
  /** Additional CSS class */
  className?: string;
}

export const JazariTransitionArm: React.FC<JazariTransitionArmProps> = ({
  arm,
  showGuards = true,
  showEffects = true,
  onHover,
  onLeave,
  className,
}) => {
  const { t } = useTranslate();
  void t;

  const handleMouseEnter = useCallback((e: React.MouseEvent<SVGElement>) => {
    if (onHover) {
      onHover(arm, e.clientX, e.clientY);
    }
  }, [arm, onHover]);

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
      {/* Wide invisible hit area for hover */}
      <path
        d={arm.path}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
        style={{ cursor: 'pointer' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onLeave}
      />

      {/* Event label at midpoint — opaque background so line doesn't obscure text */}
      <rect
        x={arm.labelX - 30}
        y={arm.labelY - 10}
        width={60}
        height={18}
        rx={4}
        fill={JAZARI_COLORS.darkBg}
        stroke={JAZARI_COLORS.lapis}
        strokeWidth={0.5}
        strokeOpacity={0.4}
        style={{ cursor: 'pointer' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onLeave}
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
        style={{ pointerEvents: 'none' }}
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
