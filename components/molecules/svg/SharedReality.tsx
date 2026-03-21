'use client';

import React from 'react';

export interface SharedRealityProps {
  className?: string;
  color?: string;
  animated?: boolean;
}

let sharedRealityId = 0;

// Fixed positions for 12 orbital units — distributed, no center
const UNITS: Array<{ x: number; y: number; r: number }> = [
  { x: 80, y: 80, r: 18 },
  { x: 200, y: 55, r: 15 },
  { x: 340, y: 70, r: 20 },
  { x: 500, y: 60, r: 16 },
  { x: 60, y: 200, r: 16 },
  { x: 180, y: 180, r: 22 },
  { x: 320, y: 200, r: 17 },
  { x: 470, y: 185, r: 19 },
  { x: 100, y: 320, r: 17 },
  { x: 240, y: 330, r: 15 },
  { x: 400, y: 310, r: 20 },
  { x: 530, y: 330, r: 16 },
];

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export const SharedReality: React.FC<SharedRealityProps> = ({
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  const ids = React.useMemo(() => {
    sharedRealityId += 1;
    const base = `sr-${sharedRealityId}`;
    return { grad: `${base}-grad`, unitGlow: `${base}-ug` };
  }, []);

  // Build connections between nearby units
  const connections: Array<{ a: number; b: number; d: number }> = [];
  for (let i = 0; i < UNITS.length; i++) {
    for (let j = i + 1; j < UNITS.length; j++) {
      const d = dist(UNITS[i], UNITS[j]);
      if (d < 220) {
        connections.push({ a: i, b: j, d });
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
        <radialGradient id={ids.unitGlow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={ids.grad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.08} />
          <stop offset="100%" stopColor={color} stopOpacity={0.04} />
        </linearGradient>
      </defs>

      {animated && (
        <style>{`
          @keyframes sr-breathe { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        `}</style>
      )}

      {/* Energy connections between nearby units */}
      {connections.map(({ a, b, d }, i) => {
        const opacity = Math.max(0.04, 0.18 - (d / 220) * 0.14);
        return (
          <line
            key={`conn-${i}`}
            x1={UNITS[a].x}
            y1={UNITS[a].y}
            x2={UNITS[b].x}
            y2={UNITS[b].y}
            stroke={color}
            strokeWidth={0.8}
            opacity={opacity}
            strokeDasharray={d > 160 ? '3 6' : undefined}
          />
        );
      })}

      {/* Orbital units */}
      {UNITS.map((unit, i) => (
        <g key={`unit-${i}`}>
          {/* Glow background */}
          <circle cx={unit.x} cy={unit.y} r={unit.r + 8} fill={`url(#${ids.unitGlow})`} />
          {/* Orbital ring */}
          <circle
            cx={unit.x}
            cy={unit.y}
            r={unit.r}
            fill="none"
            stroke={color}
            strokeWidth={1}
            opacity={0.25}
          />
          {/* Nucleus */}
          <circle
            cx={unit.x}
            cy={unit.y}
            r={3}
            fill={color}
            opacity={0.5}
            style={animated ? { animation: `sr-breathe 3s ease-in-out ${i * 0.25}s infinite` } : undefined}
          />
        </g>
      ))}
    </svg>
  );
};

SharedReality.displayName = 'SharedReality';
