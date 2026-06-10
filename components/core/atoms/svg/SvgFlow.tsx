'use client';

import React from 'react';

export interface SvgFlowProps {
  points: Array<[number, number]>;
  color?: string;
  strokeWidth?: number;
  animated?: boolean;
  opacity?: number;
  className?: string;
}

let flowIdCounter = 0;

export const SvgFlow: React.FC<SvgFlowProps> = ({
  points,
  color = 'var(--color-primary)',
  strokeWidth = 1.5,
  animated = false,
  opacity = 1,
  className,
}) => {
  const markerId = React.useMemo(() => {
    flowIdCounter += 1;
    return `almadar-flow-arrow-${flowIdCounter}`;
  }, []);

  if (points.length < 2) {
    return null;
  }

  const pathData = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt[0]},${pt[1]}`)
    .join(' ');

  return (
    <g className={className} opacity={opacity}>
      <defs>
        <marker
          id={markerId}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L8,3 L0,6 Z" fill={color} />
        </marker>
      </defs>
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd={`url(#${markerId})`}
        className={animated ? 'almadar-svg-flow-dash' : undefined}
        strokeDasharray={animated ? '8 6' : undefined}
      />
    </g>
  );
};

SvgFlow.displayName = 'SvgFlow';
