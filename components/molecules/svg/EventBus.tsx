'use client';

import React from 'react';

export interface EventBusProps {
  className?: string;
  color?: string;
  animated?: boolean;
}

let eventBusId = 0;

const OUTER_COUNT = 6;
const OUTER_RADIUS = 150;
const CX = 300;
const CY = 200;

function getOuterPositions(): Array<{ x: number; y: number }> {
  return Array.from({ length: OUTER_COUNT }, (_, i) => {
    const angle = (i / OUTER_COUNT) * Math.PI * 2 - Math.PI / 2;
    return {
      x: CX + Math.cos(angle) * OUTER_RADIUS,
      y: CY + Math.sin(angle) * OUTER_RADIUS,
    };
  });
}

export const EventBus: React.FC<EventBusProps> = ({
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  const ids = React.useMemo(() => {
    eventBusId += 1;
    const base = `eb-${eventBusId}`;
    return {
      glow: `${base}-glow`,
      pulseGlow: `${base}-pg`,
      connGrad: `${base}-cg`,
      unitGlow: `${base}-ug`,
    };
  }, []);

  const positions = getOuterPositions();

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
        <radialGradient id={ids.pulseGlow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={ids.unitGlow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.12} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={ids.connGrad} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0.08} />
        </linearGradient>
      </defs>

      {animated && (
        <style>{`
          @keyframes eb-wave-expand {
            0% { transform: scale(0.3); opacity: 0.4; }
            100% { transform: scale(1); opacity: 0; }
          }
        `}</style>
      )}

      {/* Background ambient */}
      <circle cx={CX} cy={CY} r={OUTER_RADIUS + 30} fill="none" stroke={color} strokeWidth={0.3} opacity={0.03} />

      {/* Connection lines from center to outer units */}
      {positions.map((pos, i) => (
        <line
          key={`conn-${i}`}
          x1={CX}
          y1={CY}
          x2={pos.x}
          y2={pos.y}
          stroke={color}
          strokeWidth={0.8}
          opacity={0.12}
          strokeDasharray="3 6"
        />
      ))}

      {/* Center pulse glow */}
      <circle cx={CX} cy={CY} r={40} fill={`url(#${ids.pulseGlow})`} />

      {/* Wave rings emanating from center */}
      {[30, 50, 75].map((r, i) => (
        <circle
          key={`wave-${i}`}
          cx={CX}
          cy={CY}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={1.2}
          opacity={animated ? undefined : 0.12 - i * 0.03}
          style={
            animated
              ? {
                  transformOrigin: `${CX}px ${CY}px`,
                  animation: `eb-wave-expand 2.5s ease-out ${i * 0.6}s infinite`,
                }
              : undefined
          }
        />
      ))}

      {/* Center nucleus */}
      <circle cx={CX} cy={CY} r={6} fill={color} opacity={0.7} filter={`url(#${ids.glow})`} />

      {/* Outer orbital units */}
      {positions.map((pos, i) => {
        const unitR = 20;
        return (
          <g key={`unit-${i}`}>
            {/* Unit glow */}
            <circle cx={pos.x} cy={pos.y} r={unitR + 8} fill={`url(#${ids.unitGlow})`} />

            {/* Orbital ring */}
            <circle cx={pos.x} cy={pos.y} r={unitR} fill="none" stroke={color} strokeWidth={1} opacity={0.25} />

            {/* Inner orbital path */}
            <ellipse
              cx={pos.x}
              cy={pos.y}
              rx={unitR * 0.6}
              ry={unitR * 0.35}
              fill="none"
              stroke={color}
              strokeWidth={0.6}
              opacity={0.15}
              transform={`rotate(${i * 30}, ${pos.x}, ${pos.y})`}
            />

            {/* Nucleus */}
            <circle cx={pos.x} cy={pos.y} r={3.5} fill={color} opacity={0.5} />
          </g>
        );
      })}
    </svg>
  );
};

EventBus.displayName = 'EventBus';
