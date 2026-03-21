'use client';

import React from 'react';

export interface CompileAnywhereProps {
  className?: string;
  color?: string;
  animated?: boolean;
}

let compileAnywhereId = 0;

// Three platform targets with different shapes
const TARGETS = [
  { y: 90, shape: 'circle' as const },
  { y: 200, shape: 'rect' as const },
  { y: 310, shape: 'diamond' as const },
];

export const CompileAnywhere: React.FC<CompileAnywhereProps> = ({
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  const ids = React.useMemo(() => {
    compileAnywhereId += 1;
    const base = `ca-${compileAnywhereId}`;
    return {
      glow: `${base}-glow`,
      beamGrad: `${base}-bg`,
      nucGlow: `${base}-ng`,
      arrow: `${base}-arrow`,
    };
  }, []);

  const orbX = 150;
  const orbY = 200;
  const orbR = 45;
  const targetX = 490;

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
        <linearGradient id={ids.beamGrad} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity={0.5} />
          <stop offset="100%" stopColor={color} stopOpacity={0.1} />
        </linearGradient>
        <marker
          id={ids.arrow}
          markerWidth="6"
          markerHeight="5"
          refX="5"
          refY="2.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L6,2.5 L0,5 Z" fill={color} opacity={0.4} />
        </marker>
      </defs>

      {animated && (
        <style>{`
          @keyframes ca-beam-flow {
            from { stroke-dashoffset: 24; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes ca-orbit-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      )}

      {/* Source orbital system */}
      <circle cx={orbX} cy={orbY} r={orbR + 20} fill="none" stroke={color} strokeWidth={0.3} opacity={0.04} />
      <circle cx={orbX} cy={orbY} r={30} fill={`url(#${ids.nucGlow})`} />

      {/* Orbital ring */}
      <g style={animated ? { transformOrigin: `${orbX}px ${orbY}px`, animation: 'ca-orbit-spin 15s linear infinite' } : undefined}>
        <ellipse cx={orbX} cy={orbY} rx={orbR} ry={orbR * 0.65} fill="none" stroke={color} strokeWidth={1.5} opacity={0.3} />
        {/* Particles on orbit */}
        {[0, 2.1, 4.2].map((a, i) => (
          <circle
            key={`p-${i}`}
            cx={orbX + Math.cos(a) * orbR}
            cy={orbY + Math.sin(a) * orbR * 0.65}
            r={3}
            fill={color}
            opacity={0.5}
          />
        ))}
      </g>

      {/* Nucleus */}
      <circle cx={orbX} cy={orbY} r={7} fill={color} opacity={0.7} filter={`url(#${ids.glow})`} />

      {/* Energy beams to targets */}
      {TARGETS.map((target, i) => (
        <path
          key={`beam-${i}`}
          d={`M${orbX + orbR + 10},${orbY} Q${(orbX + targetX) / 2},${(orbY + target.y) / 2} ${targetX - 20},${target.y}`}
          fill="none"
          stroke={`url(#${ids.beamGrad})`}
          strokeWidth={1.5}
          strokeDasharray={animated ? '6 6' : '3 8'}
          markerEnd={`url(#${ids.arrow})`}
          style={animated ? { animation: `ca-beam-flow 1.5s linear ${i * 0.3}s infinite` } : undefined}
        />
      ))}

      {/* Target platforms */}
      {TARGETS.map((target, i) => {
        const tx = targetX;
        const ty = target.y;
        return (
          <g key={`target-${i}`}>
            {/* Glow behind target */}
            <circle cx={tx} cy={ty} r={18} fill="none" stroke={color} strokeWidth={0.8} opacity={0.15} />

            {target.shape === 'circle' && (
              <>
                <circle cx={tx} cy={ty} r={10} fill="none" stroke={color} strokeWidth={1.5} opacity={0.5} />
                <circle cx={tx} cy={ty} r={4} fill={color} opacity={0.4} />
              </>
            )}
            {target.shape === 'rect' && (
              <>
                <rect x={tx - 10} y={ty - 8} width={20} height={16} rx={3} fill="none" stroke={color} strokeWidth={1.5} opacity={0.5} />
                <rect x={tx - 4} y={ty - 2} width={8} height={4} rx={1} fill={color} opacity={0.4} />
              </>
            )}
            {target.shape === 'diamond' && (
              <>
                <polygon
                  points={`${tx},${ty - 10} ${tx + 10},${ty} ${tx},${ty + 10} ${tx - 10},${ty}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  opacity={0.5}
                />
                <circle cx={tx} cy={ty} r={3} fill={color} opacity={0.4} />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
};

CompileAnywhere.displayName = 'CompileAnywhere';
