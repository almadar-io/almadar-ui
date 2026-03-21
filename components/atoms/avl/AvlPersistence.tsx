'use client';

import React from 'react';
import type { AvlBaseProps, AvlPersistenceKind } from './types';

export interface AvlPersistenceProps extends AvlBaseProps {
  kind: AvlPersistenceKind;
  size?: number;
  label?: string;
}

export const AvlPersistence: React.FC<AvlPersistenceProps> = ({
  x = 0,
  y = 0,
  kind,
  size = 20,
  label,
  color = 'var(--color-primary)',
  opacity = 1,
  className,
}) => {
  const half = size / 2;

  const strokeProps: { strokeDasharray?: string; strokeWidth: number } = (() => {
    switch (kind) {
      case 'persistent': return { strokeWidth: 2.5 };
      case 'runtime': return { strokeDasharray: '6 3', strokeWidth: 2 };
      case 'singleton': return { strokeWidth: 3 };
      case 'instance': return { strokeDasharray: '2 3', strokeWidth: 2 };
    }
  })();

  return (
    <g className={className} opacity={opacity}>
      {/* Decorative line sample showing the persistence style */}
      <line
        x1={x - half}
        y1={y}
        x2={x + half}
        y2={y}
        stroke={color}
        strokeWidth={strokeProps.strokeWidth}
        strokeDasharray={strokeProps.strokeDasharray}
        strokeLinecap="round"
      />

      {/* Singleton: second line */}
      {kind === 'singleton' && (
        <line
          x1={x - half}
          y1={y + 5}
          x2={x + half}
          y2={y + 5}
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      )}

      {label && (
        <text
          x={x}
          y={y + (kind === 'singleton' ? 20 : 14)}
          textAnchor="middle"
          fill={color}
          fontSize={8}
          fontFamily="inherit"
          opacity={0.7}
        >
          {label}
        </text>
      )}
    </g>
  );
};

AvlPersistence.displayName = 'AvlPersistence';
