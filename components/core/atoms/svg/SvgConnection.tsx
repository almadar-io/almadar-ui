'use client';

import React from 'react';

export interface SvgConnectionProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  variant?: 'solid' | 'dashed' | 'animated';
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  className?: string;
}

export const SvgConnection: React.FC<SvgConnectionProps> = ({
  x1,
  y1,
  x2,
  y2,
  variant = 'solid',
  color = 'var(--color-primary)',
  strokeWidth = 1.5,
  opacity = 1,
  className,
}) => {
  const dashProps: React.SVGAttributes<SVGLineElement> =
    variant === 'solid'
      ? {}
      : {
          strokeDasharray: '8 6',
        };

  return (
    <line
      className={
        [
          variant === 'animated' ? 'almadar-svg-flow-dash' : undefined,
          className,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      opacity={opacity}
      {...dashProps}
    />
  );
};

SvgConnection.displayName = 'SvgConnection';
