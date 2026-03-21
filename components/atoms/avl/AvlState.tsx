'use client';

import React from 'react';
import type { AvlBaseProps } from './types';

export interface AvlStateProps extends AvlBaseProps {
  name?: string;
  isInitial?: boolean;
  isTerminal?: boolean;
  width?: number;
  height?: number;
}

export const AvlState: React.FC<AvlStateProps> = ({
  x = 0,
  y = 0,
  name,
  isInitial = false,
  isTerminal = false,
  width = 100,
  height = 40,
  color = 'var(--color-primary)',
  opacity = 1,
  className,
}) => {
  const rx = height / 2;

  return (
    <g className={className} opacity={opacity} transform={`translate(${x},${y})`}>
      {/* Initial state: filled circle marker to the left */}
      {isInitial && (
        <circle
          cx={-16}
          cy={height / 2}
          r={6}
          fill={color}
        />
      )}

      {/* Terminal state: double border */}
      {isTerminal && (
        <rect
          x={-4}
          y={-4}
          width={width + 8}
          height={height + 8}
          rx={rx + 4}
          ry={rx + 4}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.5}
        />
      )}

      {/* Main rounded rectangle */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={rx}
        ry={rx}
        fill="none"
        stroke={color}
        strokeWidth={2}
      />

      {/* State name */}
      {name && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={11}
          fontFamily="inherit"
        >
          {name}
        </text>
      )}
    </g>
  );
};

AvlState.displayName = 'AvlState';
