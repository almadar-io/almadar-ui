'use client';

import React from 'react';

export interface ClosedCircuitProps {
  className?: string;
  color?: string;
  animated?: boolean;
}

let closedCircuitId = 0;

function pentagonPoint(
  cx: number,
  cy: number,
  r: number,
  index: number,
): [number, number] {
  const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

export const ClosedCircuit: React.FC<ClosedCircuitProps> = ({
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  const ids = React.useMemo(() => {
    closedCircuitId += 1;
    const base = `cc-${closedCircuitId}`;
    return {
      glow: `${base}-glow`,
      grad: `${base}-grad`,
      arrow: `${base}-arrow`,
      nodeGlow: `${base}-ng`,
    };
  }, []);

  const cx = 300;
  const cy = 200;
  const r = 130;
  const points = Array.from({ length: 5 }, (_, i) => pentagonPoint(cx, cy, r, i));

  // Guard diamond at node 1
  const gx = points[1][0];
  const gy = points[1][1];
  const ds = 10;

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
        <radialGradient id={ids.nodeGlow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={ids.grad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="50%" stopColor={color} stopOpacity={0.5} />
          <stop offset="100%" stopColor={color} stopOpacity={0.15} />
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
          @keyframes cc-energy-flow {
            from { stroke-dashoffset: 28; }
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      )}

      {/* Background ambient circle */}
      <circle cx={cx} cy={cy} r={50} fill="none" stroke={color} strokeWidth={0.5} opacity={0.06} />
      <circle cx={cx} cy={cy} r={r + 20} fill="none" stroke={color} strokeWidth={0.3} opacity={0.04} />

      {/* Flow paths between nodes */}
      {points.map((pt, i) => {
        const next = points[(i + 1) % 5];
        const mx = (pt[0] + next[0]) / 2 + (cy - (pt[1] + next[1]) / 2) * 0.15;
        const my = (pt[1] + next[1]) / 2 + ((pt[0] + next[0]) / 2 - cx) * 0.15;
        return (
          <path
            key={`flow-${i}`}
            d={`M${pt[0]},${pt[1]} Q${mx},${my} ${next[0]},${next[1]}`}
            fill="none"
            stroke={`url(#${ids.grad})`}
            strokeWidth={1.5}
            strokeDasharray={animated ? '8 6' : undefined}
            markerEnd={`url(#${ids.arrow})`}
            style={animated ? { animation: 'cc-energy-flow 1.5s linear infinite' } : undefined}
          />
        );
      })}

      {/* Node glow backgrounds */}
      {points.map((pt, i) => (
        <circle key={`glow-${i}`} cx={pt[0]} cy={pt[1]} r={22} fill={`url(#${ids.nodeGlow})`} />
      ))}

      {/* Regular nodes (skip index 1 for guard diamond) */}
      {points.map((pt, i) => {
        if (i === 1) return null;
        return (
          <g key={`node-${i}`}>
            <circle cx={pt[0]} cy={pt[1]} r={12} fill="none" stroke={color} strokeWidth={1} opacity={0.2} />
            <circle
              cx={pt[0]}
              cy={pt[1]}
              r={7}
              fill={color}
              opacity={0.6}
              filter={`url(#${ids.glow})`}
            />
          </g>
        );
      })}

      {/* Guard diamond at node 1 */}
      <polygon
        points={`${gx},${gy - ds} ${gx + ds},${gy} ${gx},${gy + ds} ${gx - ds},${gy}`}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        opacity={0.6}
        filter={`url(#${ids.glow})`}
      />
      <polygon
        points={`${gx},${gy - ds * 0.5} ${gx + ds * 0.5},${gy} ${gx},${gy + ds * 0.5} ${gx - ds * 0.5},${gy}`}
        fill={color}
        opacity={0.3}
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3} fill={color} opacity={0.4} />
    </svg>
  );
};

ClosedCircuit.displayName = 'ClosedCircuit';
