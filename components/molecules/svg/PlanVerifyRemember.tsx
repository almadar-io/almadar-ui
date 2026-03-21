'use client';

import React from 'react';

export interface PlanVerifyRememberProps {
  className?: string;
  color?: string;
  animated?: boolean;
}

let planVerifyRememberId = 0;

// Three loop centers
const LOOPS = [
  { cx: 130, cy: 190, r: 55, particles: [0.3, 2.4, 4.5] },
  { cx: 300, cy: 190, r: 55, particles: [1.0, 3.1, 5.2] },
  { cx: 470, cy: 190, r: 55, particles: [0.8, 2.9, 5.0] },
];

export const PlanVerifyRemember: React.FC<PlanVerifyRememberProps> = ({
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  const ids = React.useMemo(() => {
    planVerifyRememberId += 1;
    const base = `pvr-${planVerifyRememberId}`;
    return {
      glow: `${base}-glow`,
      fwdGrad: `${base}-fg`,
      fbGrad: `${base}-fbg`,
      loopGlow: `${base}-lg`,
      arrow: `${base}-arrow`,
    };
  }, []);

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
        <radialGradient id={ids.loopGlow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={ids.fwdGrad} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0.5} />
        </linearGradient>
        <linearGradient id={ids.fbGrad} x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0.3} />
        </linearGradient>
        <marker
          id={ids.arrow}
          markerWidth="7"
          markerHeight="5"
          refX="6"
          refY="2.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L7,2.5 L0,5 Z" fill={color} opacity={0.4} />
        </marker>
      </defs>

      {animated && (
        <style>{`
          @keyframes pvr-flow { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
          @keyframes pvr-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      )}

      {/* Forward flow connections: loop1 -> loop2 -> loop3 */}
      <path
        d={`M${LOOPS[0].cx + LOOPS[0].r + 5},${LOOPS[0].cy} L${LOOPS[1].cx - LOOPS[1].r - 5},${LOOPS[1].cy}`}
        fill="none"
        stroke={`url(#${ids.fwdGrad})`}
        strokeWidth={1.5}
        markerEnd={`url(#${ids.arrow})`}
        strokeDasharray={animated ? '6 5' : undefined}
        style={animated ? { animation: 'pvr-flow 1.5s linear infinite' } : undefined}
      />
      <path
        d={`M${LOOPS[1].cx + LOOPS[1].r + 5},${LOOPS[1].cy} L${LOOPS[2].cx - LOOPS[2].r - 5},${LOOPS[2].cy}`}
        fill="none"
        stroke={`url(#${ids.fwdGrad})`}
        strokeWidth={1.5}
        markerEnd={`url(#${ids.arrow})`}
        strokeDasharray={animated ? '6 5' : undefined}
        style={animated ? { animation: 'pvr-flow 1.5s linear 0.5s infinite' } : undefined}
      />

      {/* Feedback loop: loop3 -> loop1 (curved arc below) */}
      <path
        d={`M${LOOPS[2].cx},${LOOPS[2].cy + LOOPS[2].r + 5} Q${LOOPS[1].cx},${LOOPS[2].cy + 120} ${LOOPS[0].cx},${LOOPS[0].cy + LOOPS[0].r + 5}`}
        fill="none"
        stroke={`url(#${ids.fbGrad})`}
        strokeWidth={1}
        strokeDasharray="4 6"
        markerEnd={`url(#${ids.arrow})`}
        style={animated ? { animation: 'pvr-flow 2.5s linear infinite' } : undefined}
      />

      {/* Three orbital loops */}
      {LOOPS.map((loop, li) => (
        <g key={`loop-${li}`}>
          {/* Glow background */}
          <circle cx={loop.cx} cy={loop.cy} r={loop.r + 15} fill={`url(#${ids.loopGlow})`} />

          {/* Ambient ring */}
          <circle cx={loop.cx} cy={loop.cy} r={loop.r + 8} fill="none" stroke={color} strokeWidth={0.3} opacity={0.05} />

          {/* Main orbital ring */}
          <circle cx={loop.cx} cy={loop.cy} r={loop.r} fill="none" stroke={color} strokeWidth={1.5} opacity={0.3} />

          {/* Inner structure - different for each loop */}
          {li === 0 && (
            // Plan: branching pattern
            <g opacity={0.25}>
              <line x1={loop.cx - 15} y1={loop.cy} x2={loop.cx + 5} y2={loop.cy} stroke={color} strokeWidth={1.5} />
              <line x1={loop.cx + 5} y1={loop.cy} x2={loop.cx + 18} y2={loop.cy - 10} stroke={color} strokeWidth={1.5} />
              <line x1={loop.cx + 5} y1={loop.cy} x2={loop.cx + 18} y2={loop.cy + 10} stroke={color} strokeWidth={1.5} />
            </g>
          )}
          {li === 1 && (
            // Verify: checkmark pattern
            <path
              d={`M${loop.cx - 10},${loop.cy} L${loop.cx - 3},${loop.cy + 8} L${loop.cx + 12},${loop.cy - 8}`}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.3}
            />
          )}
          {li === 2 && (
            // Remember: stacked layers
            <g opacity={0.25}>
              <rect x={loop.cx - 12} y={loop.cy - 8} width={24} height={6} rx={2} fill={color} opacity={0.4} />
              <rect x={loop.cx - 12} y={loop.cy} width={24} height={6} rx={2} fill={color} opacity={0.3} />
              <rect x={loop.cx - 12} y={loop.cy + 8} width={24} height={6} rx={2} fill={color} opacity={0.2} />
            </g>
          )}

          {/* Particles on orbital ring */}
          <g style={animated ? { transformOrigin: `${loop.cx}px ${loop.cy}px`, animation: `pvr-spin ${20 + li * 5}s linear infinite` } : undefined}>
            {loop.particles.map((a, pi) => (
              <circle
                key={`p-${li}-${pi}`}
                cx={loop.cx + Math.cos(a) * loop.r}
                cy={loop.cy + Math.sin(a) * loop.r}
                r={3}
                fill={color}
                opacity={0.45}
              />
            ))}
          </g>

          {/* Nucleus */}
          <circle cx={loop.cx} cy={loop.cy} r={5} fill={color} opacity={0.6} filter={`url(#${ids.glow})`} />
        </g>
      ))}
    </svg>
  );
};

PlanVerifyRemember.displayName = 'PlanVerifyRemember';
