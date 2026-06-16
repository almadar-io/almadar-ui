'use client';

import React from 'react';

export interface SvgConnectionProps {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  variant?: 'solid' | 'dashed' | 'animated';
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  className?: string;
  /** When true (default), wraps in a standalone <svg> so the shape is visible without a parent SVG context. */
  asRoot?: boolean;
  width?: number;
  height?: number;
}

export const SvgConnection: React.FC<SvgConnectionProps> = ({
  x1 = 10,
  y1 = 50,
  x2 = 90,
  y2 = 50,
  variant = 'solid',
  color = 'var(--color-primary)',
  strokeWidth = 1.5,
  opacity = 1,
  className,
  asRoot = true,
  width = 100,
  height = 100,
}) => {
  const dashProps: React.SVGAttributes<SVGLineElement> =
    variant === 'solid'
      ? {}
      : {
          strokeDasharray: '8 6',
        };

  const inner = (
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

  if (asRoot) {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        {inner}
      </svg>
    );
  }

  return inner;
};

SvgConnection.displayName = 'SvgConnection';
