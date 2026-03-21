'use client';

import React from 'react';

export interface DescribeProveDeployProps {
  className?: string;
  color?: string;
  animated?: boolean;
}

let describeProveDeployId = 0;

// Scattered particles (describe/chaos phase)
const SCATTER_PARTICLES = [
  { x: 40, y: 100, r: 3 },
  { x: 80, y: 150, r: 2.5 },
  { x: 55, y: 220, r: 3 },
  { x: 100, y: 260, r: 2 },
  { x: 70, y: 300, r: 3.5 },
  { x: 120, y: 130, r: 2 },
  { x: 95, y: 190, r: 2.5 },
  { x: 45, y: 340, r: 2 },
  { x: 130, y: 80, r: 2.5 },
  { x: 110, y: 310, r: 3 },
  { x: 60, y: 160, r: 2 },
  { x: 85, y: 280, r: 2.5 },
];

// Deployed constellation units
const CONSTELLATION = [
  { x: 450, y: 90, r: 16 },
  { x: 530, y: 140, r: 14 },
  { x: 490, y: 220, r: 18 },
  { x: 430, y: 300, r: 15 },
  { x: 540, y: 310, r: 13 },
];

export const DescribeProveDeploy: React.FC<DescribeProveDeployProps> = ({
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  const ids = React.useMemo(() => {
    describeProveDeployId += 1;
    const base = `dpd-${describeProveDeployId}`;
    return {
      glow: `${base}-glow`,
      flowGrad: `${base}-fg`,
      nucGlow: `${base}-ng`,
      arrow: `${base}-arrow`,
    };
  }, []);

  // Middle orbital (prove/structure phase)
  const orbX = 270;
  const orbY = 200;
  const orbR = 50;

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
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={ids.flowGrad} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity={0.1} />
          <stop offset="50%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0.1} />
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
          @keyframes dpd-drift {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(2px, -1px); }
          }
          @keyframes dpd-flow { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
        `}</style>
      )}

      {/* Phase 1: Scattered particles (left) */}
      {SCATTER_PARTICLES.map((p, i) => (
        <circle
          key={`scatter-${i}`}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill={color}
          opacity={0.15 + (i % 4) * 0.08}
          style={animated ? { animation: `dpd-drift ${1.5 + (i % 3) * 0.4}s ease-in-out ${i * 0.15}s infinite` } : undefined}
        />
      ))}

      {/* Flow: scatter -> orbital */}
      <path
        d={`M150,${orbY} Q${200},${orbY} ${orbX - orbR - 10},${orbY}`}
        fill="none"
        stroke={`url(#${ids.flowGrad})`}
        strokeWidth={1.5}
        strokeDasharray="5 6"
        markerEnd={`url(#${ids.arrow})`}
        style={animated ? { animation: 'dpd-flow 1.5s linear infinite' } : undefined}
      />

      {/* Phase 2: Structured orbital (middle) */}
      <circle cx={orbX} cy={orbY} r={25} fill={`url(#${ids.nucGlow})`} />
      <circle cx={orbX} cy={orbY} r={orbR} fill="none" stroke={color} strokeWidth={1.5} opacity={0.35} />
      <ellipse
        cx={orbX}
        cy={orbY}
        rx={orbR * 0.6}
        ry={orbR * 0.35}
        fill="none"
        stroke={color}
        strokeWidth={1}
        opacity={0.2}
        transform={`rotate(-25, ${orbX}, ${orbY})`}
      />

      {/* Orbital particles */}
      {[0.5, 2.0, 3.5, 5.0].map((a, i) => (
        <circle key={`op-${i}`} cx={orbX + Math.cos(a) * orbR} cy={orbY + Math.sin(a) * orbR} r={3} fill={color} opacity={0.45} />
      ))}
      <circle cx={orbX} cy={orbY} r={6} fill={color} opacity={0.65} filter={`url(#${ids.glow})`} />

      {/* Flow: orbital -> constellation */}
      <path
        d={`M${orbX + orbR + 10},${orbY} Q${380},${orbY} ${CONSTELLATION[2].x - CONSTELLATION[2].r - 10},${orbY}`}
        fill="none"
        stroke={`url(#${ids.flowGrad})`}
        strokeWidth={1.5}
        strokeDasharray="5 6"
        markerEnd={`url(#${ids.arrow})`}
        style={animated ? { animation: 'dpd-flow 1.5s linear 0.5s infinite' } : undefined}
      />

      {/* Phase 3: Deployed constellation (right) */}
      {/* Constellation connections */}
      {CONSTELLATION.map((a, i) => {
        const next = CONSTELLATION[(i + 1) % CONSTELLATION.length];
        return (
          <line
            key={`cline-${i}`}
            x1={a.x}
            y1={a.y}
            x2={next.x}
            y2={next.y}
            stroke={color}
            strokeWidth={0.7}
            opacity={0.12}
          />
        );
      })}
      {/* Cross connections */}
      <line x1={CONSTELLATION[0].x} y1={CONSTELLATION[0].y} x2={CONSTELLATION[2].x} y2={CONSTELLATION[2].y} stroke={color} strokeWidth={0.5} opacity={0.08} />
      <line x1={CONSTELLATION[1].x} y1={CONSTELLATION[1].y} x2={CONSTELLATION[3].x} y2={CONSTELLATION[3].y} stroke={color} strokeWidth={0.5} opacity={0.08} />

      {/* Constellation units */}
      {CONSTELLATION.map((unit, i) => (
        <g key={`cunit-${i}`}>
          <circle cx={unit.x} cy={unit.y} r={unit.r} fill="none" stroke={color} strokeWidth={1} opacity={0.25} />
          <circle cx={unit.x} cy={unit.y} r={3} fill={color} opacity={0.45} />
        </g>
      ))}
    </svg>
  );
};

DescribeProveDeploy.displayName = 'DescribeProveDeploy';
