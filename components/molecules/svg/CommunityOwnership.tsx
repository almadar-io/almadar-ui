'use client';

import React from 'react';

export interface CommunityOwnershipProps {
  className?: string;
  color?: string;
  animated?: boolean;
}

let communityOwnershipId = 0;

// Independent orbital units at scattered positions — no center
const ORBITAL_UNITS = [
  { x: 85, y: 90, r: 22 },
  { x: 240, y: 60, r: 18 },
  { x: 420, y: 80, r: 20 },
  { x: 540, y: 100, r: 16 },
  { x: 60, y: 220, r: 19 },
  { x: 200, y: 200, r: 24 },
  { x: 370, y: 210, r: 20 },
  { x: 530, y: 240, r: 18 },
  { x: 120, y: 340, r: 17 },
  { x: 300, y: 330, r: 21 },
  { x: 480, y: 340, r: 18 },
];

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export const CommunityOwnership: React.FC<CommunityOwnershipProps> = ({
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  const ids = React.useMemo(() => {
    communityOwnershipId += 1;
    const base = `co-${communityOwnershipId}`;
    return { unitGlow: `${base}-ug` };
  }, []);

  // Thin connecting threads between nearby units
  const threads: Array<{ a: number; b: number; d: number }> = [];
  for (let i = 0; i < ORBITAL_UNITS.length; i++) {
    for (let j = i + 1; j < ORBITAL_UNITS.length; j++) {
      const d = dist(ORBITAL_UNITS[i], ORBITAL_UNITS[j]);
      if (d < 230) {
        threads.push({ a: i, b: j, d });
      }
    }
  }

  // Highlight a few threads
  const highlightedPairs = new Set(['0-5', '5-6', '6-10', '2-6', '1-5']);

  return (
    <svg
      viewBox="0 0 600 400"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id={ids.unitGlow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.12} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>

      {animated && (
        <style>{`
          @keyframes co-thread-pulse {
            0%, 100% { opacity: 0.08; }
            50% { opacity: 0.2; }
          }
        `}</style>
      )}

      {/* Connecting threads */}
      {threads.map(({ a, b, d }, i) => {
        const isHighlighted = highlightedPairs.has(`${a}-${b}`);
        const opacity = isHighlighted ? 0.2 : Math.max(0.04, 0.12 - (d / 230) * 0.08);
        return (
          <line
            key={`thread-${i}`}
            x1={ORBITAL_UNITS[a].x}
            y1={ORBITAL_UNITS[a].y}
            x2={ORBITAL_UNITS[b].x}
            y2={ORBITAL_UNITS[b].y}
            stroke={color}
            strokeWidth={isHighlighted ? 1.5 : 0.7}
            opacity={opacity}
            style={animated && isHighlighted ? { animation: 'co-thread-pulse 3s ease-in-out infinite' } : undefined}
          />
        );
      })}

      {/* Orbital units */}
      {ORBITAL_UNITS.map((unit, i) => (
        <g key={`unit-${i}`}>
          {/* Glow background */}
          <circle cx={unit.x} cy={unit.y} r={unit.r + 10} fill={`url(#${ids.unitGlow})`} />

          {/* Self-contained orbital ring */}
          <circle cx={unit.x} cy={unit.y} r={unit.r} fill="none" stroke={color} strokeWidth={1} opacity={0.25} />

          {/* Inner ring (orbital path) */}
          <ellipse
            cx={unit.x}
            cy={unit.y}
            rx={unit.r * 0.55}
            ry={unit.r * 0.35}
            fill="none"
            stroke={color}
            strokeWidth={0.7}
            opacity={0.15}
            transform={`rotate(${(i * 30) % 180}, ${unit.x}, ${unit.y})`}
          />

          {/* Nucleus */}
          <circle cx={unit.x} cy={unit.y} r={3.5} fill={color} opacity={0.5} />
        </g>
      ))}
    </svg>
  );
};

CommunityOwnership.displayName = 'CommunityOwnership';
