'use client';

import React from 'react';

export interface SvgLobeProps {
  cx: number;
  cy: number;
  rx?: number;
  ry?: number;
  rotation?: number;
  shells?: number;
  color?: string;
  opacity?: number;
  className?: string;
}

export const SvgLobe: React.FC<SvgLobeProps> = ({
  cx,
  cy,
  rx = 14,
  ry = 20,
  rotation = 0,
  shells = 2,
  color = 'var(--color-primary)',
  opacity = 1,
  className,
}) => {
  const clampedShells = Math.max(1, Math.min(3, shells));

  const renderShell = (shellIndex: number) => {
    const scale = shellIndex === 0 ? 1 : 1 - shellIndex * 0.3;
    const shellOpacity = shellIndex === 0 ? 1 : 0.5;
    const sRx = rx * scale;
    const sRy = ry * scale;

    return (
      <g key={shellIndex} opacity={shellOpacity}>
        <ellipse
          cx={cx}
          cy={cy - sRy}
          rx={sRx}
          ry={sRy}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
        />
        <ellipse
          cx={cx}
          cy={cy + sRy}
          rx={sRx}
          ry={sRy}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
        />
      </g>
    );
  };

  return (
    <g
      className={className}
      opacity={opacity}
      transform={`rotate(${rotation}, ${cx}, ${cy})`}
    >
      {Array.from({ length: clampedShells }, (_, i) => renderShell(i))}
    </g>
  );
};

SvgLobe.displayName = 'SvgLobe';
