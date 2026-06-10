'use client';

import React from 'react';

export interface SvgShieldProps {
  x: number;
  y: number;
  size?: number;
  variant?: 'outline' | 'filled' | 'check';
  color?: string;
  opacity?: number;
  className?: string;
}

const SHIELD_PATH =
  'M15,2 C15,2 5,5 2,6 C2,6 2,18 5,24 C8,30 15,34 15,34 C15,34 22,30 25,24 C28,18 28,6 28,6 C25,5 15,2 15,2 Z';

const CHECK_PATH = 'M10,18 L14,22 L21,13';

export const SvgShield: React.FC<SvgShieldProps> = ({
  x,
  y,
  size = 1,
  variant = 'outline',
  color = 'var(--color-primary)',
  opacity = 1,
  className,
}) => {
  return (
    <g
      className={className}
      opacity={opacity}
      transform={`translate(${x - 15 * size}, ${y - 18 * size}) scale(${size})`}
    >
      <path
        d={SHIELD_PATH}
        fill={variant === 'filled' || variant === 'check' ? color : 'none'}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {variant === 'check' && (
        <path
          d={CHECK_PATH}
          fill="none"
          stroke={variant === 'check' ? 'white' : color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </g>
  );
};

SvgShield.displayName = 'SvgShield';
