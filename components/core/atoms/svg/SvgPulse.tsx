'use client';

import React from 'react';

export interface SvgPulseProps {
  cx: number;
  cy: number;
  rings?: number;
  maxRadius?: number;
  color?: string;
  animated?: boolean;
  opacity?: number;
  className?: string;
}

const PULSE_KEYFRAMES = `
@keyframes almadar-svg-pulse-expand {
  0% {
    transform: scale(0.3);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}
`;

export const SvgPulse: React.FC<SvgPulseProps> = ({
  cx,
  cy,
  rings = 3,
  maxRadius = 60,
  color = 'var(--color-primary)',
  animated = true,
  opacity = 1,
  className,
}) => {
  return (
    <g className={className} opacity={opacity}>
      {animated && <style>{PULSE_KEYFRAMES}</style>}
      {Array.from({ length: rings }).map((_, i) => {
        const ringRadius = ((i + 1) / rings) * maxRadius;
        const ringOpacity = 1 - (i / rings) * 0.6;
        const delay = i * 0.6;

        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={ringRadius}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            opacity={animated ? undefined : ringOpacity * 0.4}
            style={
              animated
                ? {
                    transformOrigin: `${cx}px ${cy}px`,
                    animation: `almadar-svg-pulse-expand 2s ease-out ${delay}s infinite`,
                  }
                : undefined
            }
          />
        );
      })}
      <circle cx={cx} cy={cy} r={3} fill={color} />
    </g>
  );
};

SvgPulse.displayName = 'SvgPulse';
