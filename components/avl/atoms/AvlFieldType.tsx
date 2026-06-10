'use client';

import React from 'react';
import type { AvlBaseProps, AvlFieldTypeKind } from './types';

export interface AvlFieldTypeProps extends AvlBaseProps {
  kind: AvlFieldTypeKind;
  size?: number;
  label?: string;
}

function typeShape(kind: AvlFieldTypeKind, x: number, y: number, s: number, color: string): React.ReactNode {
  switch (kind) {
    case 'string':
      // Filled circle: ●
      return <circle cx={x} cy={y} r={s} fill={color} />;
    case 'number':
      // Triangle: ▲
      return (
        <polygon
          points={`${x},${y - s} ${x + s},${y + s * 0.7} ${x - s},${y + s * 0.7}`}
          fill={color}
        />
      );
    case 'boolean':
      // Square: ■
      return <rect x={x - s * 0.8} y={y - s * 0.8} width={s * 1.6} height={s * 1.6} fill={color} />;
    case 'date':
      // Diamond: ◆
      return (
        <polygon
          points={`${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}`}
          fill={color}
        />
      );
    case 'enum':
      // Ring: ○
      return <circle cx={x} cy={y} r={s} fill="none" stroke={color} strokeWidth={1.5} />;
    case 'object':
      // Hexagon: ⬡
      return (
        <polygon
          points={Array.from({ length: 6 }, (_, i) => {
            const a = (Math.PI * 2 * i) / 6 - Math.PI / 6;
            return `${x + s * Math.cos(a)},${y + s * Math.sin(a)}`;
          }).join(' ')}
          fill={color}
          opacity={0.8}
        />
      );
    case 'array':
      // Bars: ≡
      return (
        <g>
          <line x1={x - s} y1={y - s * 0.6} x2={x + s} y2={y - s * 0.6} stroke={color} strokeWidth={2} />
          <line x1={x - s} y1={y} x2={x + s} y2={y} stroke={color} strokeWidth={2} />
          <line x1={x - s} y1={y + s * 0.6} x2={x + s} y2={y + s * 0.6} stroke={color} strokeWidth={2} />
        </g>
      );
  }
}

export const AvlFieldType: React.FC<AvlFieldTypeProps> = ({
  x = 0,
  y = 0,
  kind,
  size = 5,
  label,
  color = 'var(--color-primary)',
  opacity = 1,
  className,
}) => {
  return (
    <g className={className} opacity={opacity}>
      {typeShape(kind, x, y, size, color)}
      {label && (
        <text
          x={x}
          y={y + size + 10}
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

AvlFieldType.displayName = 'AvlFieldType';
