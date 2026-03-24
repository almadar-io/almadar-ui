'use client';

import React from 'react';
import type { AvlBaseProps, AvlEffectType } from './types';
import { EFFECT_TYPE_TO_CATEGORY, EFFECT_CATEGORY_COLORS } from './types';

export interface AvlEffectProps extends AvlBaseProps {
  effectType: AvlEffectType;
  size?: number;
  label?: string;
  /** V2: Render a category-colored background circle behind the icon. */
  showBackground?: boolean;
}

function effectIcon(type: AvlEffectType, x: number, y: number, s: number, color: string): React.ReactNode {
  // Each effect type gets a distinct mini-icon
  switch (type) {
    case 'render-ui':
      // Grid: ⊞
      return (
        <g>
          <rect x={x - s} y={y - s} width={s * 2} height={s * 2} fill="none" stroke={color} strokeWidth={1.5} rx={1} />
          <line x1={x} y1={y - s} x2={x} y2={y + s} stroke={color} strokeWidth={1} />
          <line x1={x - s} y1={y} x2={x + s} y2={y} stroke={color} strokeWidth={1} />
        </g>
      );
    case 'set':
      // Pencil: ✎
      return (
        <path
          d={`M${x - s * 0.6},${y + s} L${x - s},${y + s * 0.4} L${x + s * 0.4},${y - s} L${x + s},${y - s * 0.4} Z`}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      );
    case 'persist':
      // Cylinder: ⛁
      return (
        <g>
          <ellipse cx={x} cy={y - s * 0.6} rx={s} ry={s * 0.4} fill="none" stroke={color} strokeWidth={1.5} />
          <line x1={x - s} y1={y - s * 0.6} x2={x - s} y2={y + s * 0.4} stroke={color} strokeWidth={1.5} />
          <line x1={x + s} y1={y - s * 0.6} x2={x + s} y2={y + s * 0.4} stroke={color} strokeWidth={1.5} />
          <ellipse cx={x} cy={y + s * 0.4} rx={s} ry={s * 0.4} fill="none" stroke={color} strokeWidth={1.5} />
        </g>
      );
    case 'fetch':
      // Down arrow: ⇣
      return (
        <g>
          <line x1={x} y1={y - s} x2={x} y2={y + s * 0.6} stroke={color} strokeWidth={1.5} />
          <polyline points={`${x - s * 0.5},${y + s * 0.1} ${x},${y + s} ${x + s * 0.5},${y + s * 0.1}`} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
        </g>
      );
    case 'emit':
      // Antenna: 📡
      return (
        <g>
          <circle cx={x} cy={y} r={s * 0.3} fill={color} />
          <path d={`M${x - s * 0.7},${y - s * 0.7} A${s},${s} 0 0,1 ${x + s * 0.7},${y - s * 0.7}`} fill="none" stroke={color} strokeWidth={1.5} />
          <path d={`M${x - s},${y - s} A${s * 1.4},${s * 1.4} 0 0,1 ${x + s},${y - s}`} fill="none" stroke={color} strokeWidth={1} opacity={0.6} />
        </g>
      );
    case 'navigate':
      // Right arrow: ⇢
      return (
        <g>
          <line x1={x - s} y1={y} x2={x + s * 0.6} y2={y} stroke={color} strokeWidth={1.5} />
          <polyline points={`${x + s * 0.1},${y - s * 0.5} ${x + s},${y} ${x + s * 0.1},${y + s * 0.5}`} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
        </g>
      );
    case 'notify':
      // Bell: 🔔
      return (
        <g>
          <path d={`M${x - s * 0.7},${y + s * 0.3} Q${x - s * 0.7},${y - s} ${x},${y - s} Q${x + s * 0.7},${y - s} ${x + s * 0.7},${y + s * 0.3} Z`} fill="none" stroke={color} strokeWidth={1.5} />
          <line x1={x - s * 0.8} y1={y + s * 0.3} x2={x + s * 0.8} y2={y + s * 0.3} stroke={color} strokeWidth={1.5} />
          <circle cx={x} cy={y + s * 0.7} r={s * 0.2} fill={color} />
        </g>
      );
    case 'call-service':
      // Bidirectional: ⇄
      return (
        <g>
          <line x1={x - s} y1={y - s * 0.3} x2={x + s} y2={y - s * 0.3} stroke={color} strokeWidth={1.5} />
          <polyline points={`${x + s * 0.5},${y - s * 0.7} ${x + s},${y - s * 0.3} ${x + s * 0.5},${y + s * 0.1}`} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
          <line x1={x + s} y1={y + s * 0.3} x2={x - s} y2={y + s * 0.3} stroke={color} strokeWidth={1.5} />
          <polyline points={`${x - s * 0.5},${y - s * 0.1} ${x - s},${y + s * 0.3} ${x - s * 0.5},${y + s * 0.7}`} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
        </g>
      );
    case 'spawn':
      // Plus circle: ⊕
      return (
        <g>
          <circle cx={x} cy={y} r={s} fill="none" stroke={color} strokeWidth={1.5} />
          <line x1={x - s * 0.5} y1={y} x2={x + s * 0.5} y2={y} stroke={color} strokeWidth={1.5} />
          <line x1={x} y1={y - s * 0.5} x2={x} y2={y + s * 0.5} stroke={color} strokeWidth={1.5} />
        </g>
      );
    case 'despawn':
      // Minus circle: ⊖
      return (
        <g>
          <circle cx={x} cy={y} r={s} fill="none" stroke={color} strokeWidth={1.5} />
          <line x1={x - s * 0.5} y1={y} x2={x + s * 0.5} y2={y} stroke={color} strokeWidth={1.5} />
        </g>
      );
    case 'do':
      // Execute: ⫘
      return (
        <g>
          <circle cx={x} cy={y} r={s} fill="none" stroke={color} strokeWidth={1.5} />
          <polygon points={`${x - s * 0.3},${y - s * 0.5} ${x + s * 0.5},${y} ${x - s * 0.3},${y + s * 0.5}`} fill={color} />
        </g>
      );
    case 'if':
      // Conditional diamond: ◇
      return (
        <polygon
          points={`${x},${y - s} ${x + s * 0.7},${y} ${x},${y + s} ${x - s * 0.7},${y}`}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      );
    case 'log':
      // Paragraph: ¶
      return (
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={s * 2.2}
          fontFamily="serif"
        >
          ¶
        </text>
      );
  }
}

export const AvlEffect: React.FC<AvlEffectProps> = ({
  x = 0,
  y = 0,
  effectType,
  size = 8,
  label,
  color = 'var(--color-primary)',
  opacity = 1,
  className,
  showBackground = false,
}) => {
  const category = EFFECT_TYPE_TO_CATEGORY[effectType];
  const catColors = EFFECT_CATEGORY_COLORS[category];
  const iconColor = showBackground ? catColors.color : color;

  return (
    <g className={className} opacity={opacity}>
      {showBackground && (
        <>
          <circle cx={x} cy={y} r={size * 1.2} fill={catColors.bg} />
          <circle cx={x} cy={y} r={size * 1.2} fill="none" stroke={catColors.color} strokeWidth={0.5} opacity={0.3} />
        </>
      )}
      {effectIcon(effectType, x, y, size, iconColor)}
      {label && (
        <text
          x={x}
          y={y + size + 10}
          textAnchor="middle"
          fill={iconColor}
          fontSize={11}
          fontWeight={500}
          fontFamily="inherit"
          opacity={0.7}
        >
          {label}
        </text>
      )}
    </g>
  );
};

AvlEffect.displayName = 'AvlEffect';
