'use client';

import React from 'react';

export interface StandardLibraryProps {
  className?: string;
  color?: string;
  animated?: boolean;
}

let standardLibraryId = 0;

// Domain clusters on 3 orbital rings
// Each cluster is a group of small dots representing behaviors in that domain
const RING_DATA = [
  {
    r: 70,
    clusters: [
      { angle: 0, dots: 3 },
      { angle: 1.57, dots: 2 },
      { angle: 3.14, dots: 3 },
      { angle: 4.71, dots: 2 },
    ],
  },
  {
    r: 120,
    clusters: [
      { angle: 0.5, dots: 3 },
      { angle: 1.3, dots: 2 },
      { angle: 2.1, dots: 3 },
      { angle: 3.5, dots: 2 },
      { angle: 4.3, dots: 3 },
      { angle: 5.5, dots: 2 },
    ],
  },
  {
    r: 170,
    clusters: [
      { angle: 0.3, dots: 2 },
      { angle: 1.0, dots: 2 },
      { angle: 1.7, dots: 1 },
      { angle: 2.4, dots: 2 },
      { angle: 3.1, dots: 2 },
      { angle: 3.9, dots: 1 },
      { angle: 4.6, dots: 2 },
      { angle: 5.6, dots: 2 },
    ],
  },
];

export const StandardLibrary: React.FC<StandardLibraryProps> = ({
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  const ids = React.useMemo(() => {
    standardLibraryId += 1;
    const base = `sl-${standardLibraryId}`;
    return {
      glow: `${base}-glow`,
      grad1: `${base}-g1`,
      grad2: `${base}-g2`,
      grad3: `${base}-g3`,
      nucGlow: `${base}-ng`,
    };
  }, []);

  const cx = 300;
  const cy = 200;

  return (
    <svg
      viewBox="0 0 600 400"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <filter id={ids.glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={ids.nucGlow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={ids.grad1} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="50%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0.35} />
        </linearGradient>
        <linearGradient id={ids.grad2} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="50%" stopColor={color} stopOpacity={0.1} />
          <stop offset="100%" stopColor={color} stopOpacity={0.25} />
        </linearGradient>
        <linearGradient id={ids.grad3} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="50%" stopColor={color} stopOpacity={0.06} />
          <stop offset="100%" stopColor={color} stopOpacity={0.2} />
        </linearGradient>
      </defs>

      {animated && (
        <style>{`
          @keyframes sl-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      )}

      {/* Background ambient */}
      <circle cx={cx} cy={cy} r={190} fill="none" stroke={color} strokeWidth={0.3} opacity={0.03} />

      {/* Orbital rings */}
      {[ids.grad1, ids.grad2, ids.grad3].map((gradId, ri) => (
        <circle
          key={`ring-${ri}`}
          cx={cx}
          cy={cy}
          r={RING_DATA[ri].r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={ri === 0 ? 1.5 : 1}
          strokeDasharray={ri === 2 ? '3 6' : undefined}
        />
      ))}

      {/* Domain clusters on each ring */}
      {RING_DATA.map((ring, ri) => (
        <g
          key={`ring-clusters-${ri}`}
          style={
            animated
              ? {
                  transformOrigin: `${cx}px ${cy}px`,
                  animation: `sl-orbit ${40 + ri * 20}s linear infinite${ri % 2 === 1 ? ' reverse' : ''}`,
                }
              : undefined
          }
        >
          {ring.clusters.map((cluster, ci) => {
            const basex = cx + Math.cos(cluster.angle) * ring.r;
            const basey = cy + Math.sin(cluster.angle) * ring.r;
            const opacity = ri === 0 ? 0.6 : ri === 1 ? 0.45 : 0.3;
            const dotR = ri === 0 ? 3.5 : ri === 1 ? 3 : 2.5;

            return (
              <g key={`cluster-${ri}-${ci}`}>
                {Array.from({ length: cluster.dots }, (_, di) => {
                  const offsetAngle = cluster.angle + ((di - (cluster.dots - 1) / 2) * 0.12);
                  const offsetR = ring.r + (di % 2 === 0 ? 6 : -6);
                  const dx = cx + Math.cos(offsetAngle) * offsetR;
                  const dy = cy + Math.sin(offsetAngle) * offsetR;
                  return (
                    <circle
                      key={`dot-${ri}-${ci}-${di}`}
                      cx={dx}
                      cy={dy}
                      r={dotR}
                      fill={color}
                      opacity={opacity}
                    />
                  );
                })}
                {/* Cluster anchor dot */}
                <circle cx={basex} cy={basey} r={dotR + 1} fill={color} opacity={opacity * 0.7} />
              </g>
            );
          })}
        </g>
      ))}

      {/* Central nucleus */}
      <circle cx={cx} cy={cy} r={25} fill={`url(#${ids.nucGlow})`} />
      <circle cx={cx} cy={cy} r={8} fill={color} opacity={0.7} filter={`url(#${ids.glow})`} />
    </svg>
  );
};

StandardLibrary.displayName = 'StandardLibrary';
