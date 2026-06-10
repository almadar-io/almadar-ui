'use client';

import React from 'react';

export interface SvgRingProps {
  cx: number;
  cy: number;
  r?: number;
  variant?: 'solid' | 'dashed' | 'glow';
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  className?: string;
  label?: string;
}

let ringIdCounter = 0;

export const SvgRing: React.FC<SvgRingProps> = ({
  cx,
  cy,
  r = 40,
  variant = 'solid',
  color = 'var(--color-primary)',
  strokeWidth = 1.5,
  opacity = 1,
  className,
  label,
}) => {
  const gradientId = React.useMemo(() => {
    ringIdCounter += 1;
    return `almadar-ring-glow-${ringIdCounter}`;
  }, []);

  return (
    <g className={className} opacity={opacity}>
      {variant === 'glow' && (
        <>
          <defs>
            <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={cx} cy={cy} r={r} fill={`url(#${gradientId})`} />
        </>
      )}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={variant === 'dashed' ? '6 4' : undefined}
      />
      {label && (
        <text
          x={cx}
          y={cy - r - 6}
          textAnchor="middle"
          fill={color}
          fontSize={11}
          fontFamily="inherit"
        >
          {label}
        </text>
      )}
    </g>
  );
};

SvgRing.displayName = 'SvgRing';
