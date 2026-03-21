'use client';

import React from 'react';

export interface StandardLibraryProps {
  className?: string;
  color?: string;
  animated?: boolean;
}

let standardLibraryId = 0;

// 6 domain groups arranged in a hexagonal pattern around a center
// Each group is a cluster of 3-5 small dots representing behaviors
const GROUPS = [
  { x: 300, y: 80, dots: 5 },   // top
  { x: 430, y: 140, dots: 4 },  // top-right
  { x: 430, y: 260, dots: 5 },  // bottom-right
  { x: 300, y: 320, dots: 4 },  // bottom
  { x: 170, y: 260, dots: 5 },  // bottom-left
  { x: 170, y: 140, dots: 4 },  // top-left
];

export const StandardLibrary: React.FC<StandardLibraryProps> = ({
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  const ids = React.useMemo(() => {
    standardLibraryId += 1;
    const base = `sl-${standardLibraryId}`;
    return { glow: `${base}-glow`, groupGlow: `${base}-gg` };
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
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={ids.groupGlow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.1} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>

      {animated && (
        <style>{`
          @keyframes sl-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        `}</style>
      )}

      {/* Connections from center to each group */}
      {GROUPS.map((g, i) => (
        <line
          key={`conn-${i}`}
          x1={cx} y1={cy} x2={g.x} y2={g.y}
          stroke={color} strokeWidth={0.8} opacity={0.1}
          strokeDasharray="4 6"
        />
      ))}

      {/* Connections between adjacent groups */}
      {GROUPS.map((g, i) => {
        const next = GROUPS[(i + 1) % GROUPS.length];
        return (
          <line
            key={`adj-${i}`}
            x1={g.x} y1={g.y} x2={next.x} y2={next.y}
            stroke={color} strokeWidth={0.5} opacity={0.06}
          />
        );
      })}

      {/* Domain groups */}
      {GROUPS.map((group, gi) => {
        const dotR = 3;
        const spread = 14;
        return (
          <g key={`group-${gi}`}>
            {/* Group glow */}
            <circle cx={group.x} cy={group.y} r={28} fill={`url(#${ids.groupGlow})`} />

            {/* Group boundary */}
            <circle cx={group.x} cy={group.y} r={24} fill="none" stroke={color} strokeWidth={0.7} opacity={0.15} />

            {/* Behavior dots in a tight cluster */}
            {Array.from({ length: group.dots }, (_, di) => {
              const angle = (di / group.dots) * Math.PI * 2 - Math.PI / 2;
              const r = di === 0 ? 0 : spread * 0.55;
              const dx = di === 0 ? group.x : group.x + Math.cos(angle) * r;
              const dy = di === 0 ? group.y : group.y + Math.sin(angle) * r;
              return (
                <circle
                  key={`dot-${gi}-${di}`}
                  cx={dx} cy={dy} r={di === 0 ? dotR + 1 : dotR}
                  fill={color}
                  opacity={di === 0 ? 0.6 : 0.35}
                  style={animated && di === 0 ? { animation: `sl-pulse 3s ease-in-out ${gi * 0.4}s infinite` } : undefined}
                />
              );
            })}
          </g>
        );
      })}

      {/* Center hub */}
      <circle cx={cx} cy={cy} r={16} fill="none" stroke={color} strokeWidth={1} opacity={0.25} />
      <circle cx={cx} cy={cy} r={6} fill={color} opacity={0.6} filter={`url(#${ids.glow})`} />
    </svg>
  );
};

StandardLibrary.displayName = 'StandardLibrary';
