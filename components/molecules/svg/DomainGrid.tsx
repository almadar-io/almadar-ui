'use client';

import React from 'react';

export interface DomainGridProps {
  className?: string;
  color?: string;
  animated?: boolean;
}

let domainGridId = 0;

// 18 star-clusters in a constellation layout
const CLUSTERS: Array<{ x: number; y: number; size: number; dots: number; highlighted: boolean }> = [
  { x: 60, y: 70, size: 8, dots: 3, highlighted: true },
  { x: 170, y: 50, size: 6, dots: 2, highlighted: false },
  { x: 290, y: 65, size: 7, dots: 3, highlighted: false },
  { x: 420, y: 55, size: 8, dots: 3, highlighted: true },
  { x: 530, y: 80, size: 6, dots: 2, highlighted: false },
  { x: 100, y: 170, size: 7, dots: 3, highlighted: false },
  { x: 220, y: 155, size: 6, dots: 2, highlighted: false },
  { x: 350, y: 160, size: 9, dots: 4, highlighted: true },
  { x: 480, y: 175, size: 6, dots: 2, highlighted: false },
  { x: 50, y: 270, size: 6, dots: 2, highlighted: false },
  { x: 160, y: 260, size: 7, dots: 3, highlighted: false },
  { x: 280, y: 250, size: 6, dots: 2, highlighted: false },
  { x: 400, y: 265, size: 8, dots: 3, highlighted: true },
  { x: 530, y: 270, size: 6, dots: 2, highlighted: false },
  { x: 90, y: 350, size: 7, dots: 3, highlighted: false },
  { x: 230, y: 340, size: 6, dots: 2, highlighted: false },
  { x: 370, y: 350, size: 8, dots: 3, highlighted: true },
  { x: 510, y: 345, size: 6, dots: 2, highlighted: false },
];

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export const DomainGrid: React.FC<DomainGridProps> = ({
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  const ids = React.useMemo(() => {
    domainGridId += 1;
    const base = `dg-${domainGridId}`;
    return { clusterGlow: `${base}-cg` };
  }, []);

  // Constellation connections between nearby clusters
  const connections: Array<{ a: number; b: number }> = [];
  for (let i = 0; i < CLUSTERS.length; i++) {
    for (let j = i + 1; j < CLUSTERS.length; j++) {
      const d = dist(CLUSTERS[i], CLUSTERS[j]);
      if (d < 180) {
        connections.push({ a: i, b: j });
      }
    }
  }

  return (
    <svg
      viewBox="0 0 600 400"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id={ids.clusterGlow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>

      {animated && (
        <style>{`
          @keyframes dg-twinkle {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
        `}</style>
      )}

      {/* Constellation connection lines */}
      {connections.map(({ a, b }, i) => (
        <line
          key={`conn-${i}`}
          x1={CLUSTERS[a].x}
          y1={CLUSTERS[a].y}
          x2={CLUSTERS[b].x}
          y2={CLUSTERS[b].y}
          stroke={color}
          strokeWidth={0.5}
          opacity={0.06}
        />
      ))}

      {/* Star clusters */}
      {CLUSTERS.map((cluster, ci) => {
        const baseOpacity = cluster.highlighted ? 0.6 : 0.3;
        return (
          <g key={`cluster-${ci}`}>
            {/* Glow for highlighted clusters */}
            {cluster.highlighted && (
              <circle cx={cluster.x} cy={cluster.y} r={cluster.size + 10} fill={`url(#${ids.clusterGlow})`} />
            )}

            {/* Cluster dots */}
            {Array.from({ length: cluster.dots }, (_, di) => {
              const angle = (di / cluster.dots) * Math.PI * 2;
              const spread = cluster.size * 0.6;
              const dx = cluster.x + Math.cos(angle) * spread;
              const dy = cluster.y + Math.sin(angle) * spread;
              const dotR = cluster.highlighted ? 2.5 : 2;
              return (
                <circle
                  key={`dot-${ci}-${di}`}
                  cx={dx}
                  cy={dy}
                  r={dotR}
                  fill={color}
                  opacity={baseOpacity - di * 0.05}
                  style={animated && cluster.highlighted ? { animation: `dg-twinkle 3s ease-in-out ${ci * 0.3}s infinite` } : undefined}
                />
              );
            })}

            {/* Center anchor */}
            <circle
              cx={cluster.x}
              cy={cluster.y}
              r={cluster.highlighted ? 3.5 : 2.5}
              fill={color}
              opacity={baseOpacity}
            />
          </g>
        );
      })}
    </svg>
  );
};

DomainGrid.displayName = 'DomainGrid';
