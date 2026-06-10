'use client';

import React from 'react';

export interface SvgGridProps {
  x: number;
  y: number;
  cols?: number;
  rows?: number;
  spacing?: number;
  nodeRadius?: number;
  color?: string;
  opacity?: number;
  className?: string;
  highlights?: number[];
}

export const SvgGrid: React.FC<SvgGridProps> = ({
  x,
  y,
  cols = 4,
  rows = 3,
  spacing = 20,
  nodeRadius = 3,
  color = 'var(--color-primary)',
  opacity = 1,
  className,
  highlights = [],
}) => {
  const highlightSet = new Set(highlights);

  return (
    <g className={className} opacity={opacity}>
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => {
          const index = row * cols + col;
          const isHighlighted = highlightSet.has(index);
          const cx = x + col * spacing;
          const cy = y + row * spacing;

          return (
            <circle
              key={index}
              cx={cx}
              cy={cy}
              r={isHighlighted ? nodeRadius * 1.6 : nodeRadius}
              fill={color}
              opacity={isHighlighted ? 1 : 0.4}
            />
          );
        })
      )}
    </g>
  );
};

SvgGrid.displayName = 'SvgGrid';
