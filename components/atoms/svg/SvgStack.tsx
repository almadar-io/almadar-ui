'use client';

import React from 'react';

export interface SvgStackProps {
  x: number;
  y: number;
  layers?: number;
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
  className?: string;
  labels?: string[];
}

export const SvgStack: React.FC<SvgStackProps> = ({
  x,
  y,
  layers: rawLayers = 3,
  width = 60,
  height = 40,
  color = 'var(--color-primary)',
  opacity = 1,
  className,
  labels,
}) => {
  const layers = Math.max(2, Math.min(4, rawLayers));
  const verticalOffset = 8;
  const horizontalOffset = 4;

  return (
    <g className={className} opacity={opacity}>
      {Array.from({ length: layers }).map((_, i) => {
        const layerIndex = layers - 1 - i;
        const layerX = x + layerIndex * horizontalOffset;
        const layerY = y - layerIndex * verticalOffset;
        const layerOpacity = 0.3 + (layerIndex / (layers - 1)) * 0.7;
        const label = labels?.[layerIndex];

        return (
          <g key={layerIndex}>
            <rect
              x={layerX}
              y={layerY}
              width={width}
              height={height}
              rx={6}
              ry={6}
              fill={color}
              opacity={layerOpacity}
              stroke={color}
              strokeWidth={1}
              strokeOpacity={layerOpacity * 0.6}
            />
            {label && (
              <text
                x={layerX + width / 2}
                y={layerY + height / 2 + 4}
                textAnchor="middle"
                fill="white"
                fontSize={10}
                fontFamily="inherit"
                opacity={layerOpacity}
              >
                {label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};

SvgStack.displayName = 'SvgStack';
