'use client';

import React from 'react';
import type { AvlBaseProps, AvlOperatorNamespace } from './types';
import { AVL_OPERATOR_COLORS } from './types';

export interface AvlOperatorProps extends AvlBaseProps {
  name: string;
  namespace?: AvlOperatorNamespace;
  size?: number;
}

export const AvlOperator: React.FC<AvlOperatorProps> = ({
  x = 0,
  y = 0,
  name,
  namespace = 'arithmetic',
  size = 16,
  color,
  opacity = 1,
  className,
}) => {
  const opColor = color ?? AVL_OPERATOR_COLORS[namespace];

  return (
    <g className={className} opacity={opacity}>
      {/* Rounded rectangle node */}
      <rect
        x={x - size}
        y={y - size * 0.7}
        width={size * 2}
        height={size * 1.4}
        rx={4}
        ry={4}
        fill={opColor}
        fillOpacity={0.15}
        stroke={opColor}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill={opColor}
        fontSize={size > 14 ? 10 : 8}
        fontFamily="inherit"
        fontWeight="bold"
      >
        {name}
      </text>
    </g>
  );
};

AvlOperator.displayName = 'AvlOperator';
