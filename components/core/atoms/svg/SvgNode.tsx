'use client';

import React from 'react';

export interface SvgNodeProps {
  x: number;
  y: number;
  r?: number;
  variant?: 'filled' | 'stroked' | 'pulse';
  color?: string;
  opacity?: number;
  className?: string;
  label?: string;
}

export const SvgNode: React.FC<SvgNodeProps> = ({
  x,
  y,
  r = 6,
  variant = 'filled',
  color = 'var(--color-primary)',
  opacity = 1,
  className,
  label,
}) => {
  return (
    <g className={className} opacity={opacity}>
      {variant === 'pulse' && (
        <circle
          cx={x}
          cy={y}
          r={r * 2}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.3}
          className="almadar-svg-pulse-ring"
        />
      )}
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={variant === 'stroked' ? 'none' : color}
        stroke={variant === 'stroked' ? color : 'none'}
        strokeWidth={variant === 'stroked' ? 2 : 0}
      />
      {label && (
        <text
          x={x}
          y={y + r + 14}
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

SvgNode.displayName = 'SvgNode';
