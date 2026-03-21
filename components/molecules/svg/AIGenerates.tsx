'use client';

import React from 'react';

export interface AIGeneratesProps {
  className?: string;
  color?: string;
  animated?: boolean;
}

let aiGeneratesId = 0;

// Chaotic particles on the left (scattered)
const CHAOS_PARTICLES = [
  { x: 50, y: 90, r: 3 },
  { x: 85, y: 140, r: 2.5 },
  { x: 40, y: 200, r: 3.5 },
  { x: 100, y: 250, r: 2 },
  { x: 70, y: 310, r: 3 },
  { x: 120, y: 100, r: 2 },
  { x: 110, y: 180, r: 3 },
  { x: 60, y: 260, r: 2.5 },
  { x: 130, y: 300, r: 2 },
  { x: 90, y: 60, r: 2.5 },
  { x: 140, y: 220, r: 3 },
  { x: 55, y: 340, r: 2 },
  { x: 115, y: 150, r: 2 },
  { x: 75, y: 290, r: 3 },
  { x: 135, y: 80, r: 2.5 },
];

export const AIGenerates: React.FC<AIGeneratesProps> = ({
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  const ids = React.useMemo(() => {
    aiGeneratesId += 1;
    const base = `ag-${aiGeneratesId}`;
    return {
      glow: `${base}-glow`,
      flowGrad: `${base}-fg`,
      nucGlow: `${base}-ng`,
      arrow: `${base}-arrow`,
    };
  }, []);

  // Organized orbital on the right
  const orbX = 480;
  const orbY = 200;
  const orbR = 55;

  return (
    <svg
      viewBox="0 0 600 400"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <filter id={ids.glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={ids.nucGlow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={ids.flowGrad} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="40%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0.6} />
        </linearGradient>
        <marker
          id={ids.arrow}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L8,3 L0,6 Z" fill={color} opacity={0.5} />
        </marker>
      </defs>

      {animated && (
        <style>{`
          @keyframes ag-converge {
            0% { stroke-dashoffset: 30; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes ag-chaos-drift {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(3px, -2px); }
          }
        `}</style>
      )}

      {/* Chaotic particles (left side) */}
      {CHAOS_PARTICLES.map((p, i) => (
        <circle
          key={`chaos-${i}`}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill={color}
          opacity={0.2 + (i % 4) * 0.1}
          style={animated ? { animation: `ag-chaos-drift ${1.5 + (i % 3) * 0.5}s ease-in-out ${i * 0.2}s infinite` } : undefined}
        />
      ))}

      {/* Convergence flow paths (particles flowing toward orbital) */}
      {[120, 170, 220, 270, 320].map((sy, i) => (
        <path
          key={`flow-${i}`}
          d={`M${150 + i * 5},${sy} C${250},${sy + (i - 2) * 15} ${350},${200 + (i - 2) * 8} ${orbX - orbR - 15},${200}`}
          fill="none"
          stroke={`url(#${ids.flowGrad})`}
          strokeWidth={1}
          strokeDasharray="4 8"
          markerEnd={`url(#${ids.arrow})`}
          style={animated ? { animation: `ag-converge 2s linear ${i * 0.3}s infinite` } : undefined}
        />
      ))}

      {/* Organized orbital (right side) */}
      <circle cx={orbX} cy={orbY} r={orbR + 15} fill="none" stroke={color} strokeWidth={0.3} opacity={0.05} />
      <circle cx={orbX} cy={orbY} r={30} fill={`url(#${ids.nucGlow})`} />

      {/* Orbital ring */}
      <circle cx={orbX} cy={orbY} r={orbR} fill="none" stroke={color} strokeWidth={1.5} opacity={0.35} />

      {/* Inner orbital */}
      <ellipse
        cx={orbX}
        cy={orbY}
        rx={orbR * 0.6}
        ry={orbR * 0.4}
        fill="none"
        stroke={color}
        strokeWidth={1}
        opacity={0.25}
        transform={`rotate(-30, ${orbX}, ${orbY})`}
      />

      {/* Orbital particles */}
      {[0, 1.5, 3, 4.5].map((a, i) => (
        <circle
          key={`op-${i}`}
          cx={orbX + Math.cos(a) * orbR}
          cy={orbY + Math.sin(a) * orbR}
          r={4}
          fill={color}
          opacity={0.55}
        />
      ))}

      {/* Nucleus */}
      <circle cx={orbX} cy={orbY} r={7} fill={color} opacity={0.75} filter={`url(#${ids.glow})`} />
    </svg>
  );
};

AIGenerates.displayName = 'AIGenerates';
