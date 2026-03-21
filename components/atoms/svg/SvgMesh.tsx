'use client';

import React from 'react';

export interface SvgMeshProps {
  cx: number;
  cy: number;
  nodes?: number;
  radius?: number;
  color?: string;
  connectionDensity?: number;
  opacity?: number;
  className?: string;
}

function getNodePositions(
  cx: number,
  cy: number,
  count: number,
  radius: number
): Array<{ x: number; y: number }> {
  return Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    };
  });
}

function getConnections(
  count: number,
  density: number
): Array<[number, number]> {
  const allPairs: Array<[number, number]> = [];

  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      allPairs.push([i, j]);
    }
  }

  const connectCount = Math.round(allPairs.length * Math.max(0, Math.min(1, density)));

  return allPairs.slice(0, connectCount);
}

export const SvgMesh: React.FC<SvgMeshProps> = ({
  cx,
  cy,
  nodes = 6,
  radius = 50,
  color = 'var(--color-primary)',
  connectionDensity = 0.5,
  opacity = 1,
  className,
}) => {
  const positions = getNodePositions(cx, cy, nodes, radius);
  const connections = getConnections(nodes, connectionDensity);

  return (
    <g className={className} opacity={opacity}>
      {connections.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={positions[a].x}
          y1={positions[a].y}
          x2={positions[b].x}
          y2={positions[b].y}
          stroke={color}
          strokeWidth={1}
          opacity={0.3}
        />
      ))}
      {positions.map((pos, i) => (
        <circle
          key={i}
          cx={pos.x}
          cy={pos.y}
          r={4}
          fill={color}
        />
      ))}
    </g>
  );
};

SvgMesh.displayName = 'SvgMesh';
