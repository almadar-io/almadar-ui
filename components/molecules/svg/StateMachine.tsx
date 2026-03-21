'use client';

import React from 'react';

export interface StateMachineProps {
  className?: string;
  color?: string;
  animated?: boolean;
}

let stateMachineId = 0;

// State positions
const STATES = [
  { x: 100, y: 200, r: 14, initial: true },  // idle (initial state)
  { x: 260, y: 100, r: 11, initial: false },  // loading
  { x: 460, y: 200, r: 12, initial: false },  // active
  { x: 260, y: 320, r: 10, initial: false },  // error
];

export const StateMachine: React.FC<StateMachineProps> = ({
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  const ids = React.useMemo(() => {
    stateMachineId += 1;
    const base = `sm-${stateMachineId}`;
    return {
      glow: `${base}-glow`,
      activeGlow: `${base}-ag`,
      transGrad: `${base}-tg`,
      arrow: `${base}-arrow`,
      stateGlow: `${base}-sg`,
    };
  }, []);

  const [idle, loading, active, errorState] = STATES;

  // Guard diamond position (between loading and active)
  const guardX = 360;
  const guardY = 105;
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
        <radialGradient id={ids.activeGlow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={ids.stateGlow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.12} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={ids.transGrad} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0.45} />
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
          <path d="M0,0 L7,2.5 L0,5 Z" fill={color} opacity={0.5} />
        </marker>
      </defs>

      {animated && (
        <style>{`
          @keyframes sm-flow { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
          @keyframes sm-active-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.9; } }
        `}</style>
      )}

      {/* Transition: idle -> loading (curved up-right) */}
      <path
        d={`M${idle.x + 15},${idle.y - 10} Q${180},${loading.y - 30} ${loading.x - 15},${loading.y + 5}`}
        fill="none"
        stroke={`url(#${ids.transGrad})`}
        strokeWidth={1.5}
        markerEnd={`url(#${ids.arrow})`}
        strokeDasharray={animated ? '6 5' : undefined}
        style={animated ? { animation: 'sm-flow 1.5s linear infinite' } : undefined}
      />

      {/* Transition: loading -> guard */}
      <path
        d={`M${loading.x + 15},${loading.y} L${guardX - ds - 5},${guardY}`}
        fill="none"
        stroke={color}
        strokeWidth={1.2}
        opacity={0.3}
        markerEnd={`url(#${ids.arrow})`}
        strokeDasharray={animated ? '5 5' : undefined}
        style={animated ? { animation: 'sm-flow 1.5s linear 0.3s infinite' } : undefined}
      />

      {/* Transition: guard -> active (curved down-right) */}
      <path
        d={`M${guardX + ds + 5},${guardY} Q${420},${guardY + 30} ${active.x - 15},${active.y - 5}`}
        fill="none"
        stroke={`url(#${ids.transGrad})`}
        strokeWidth={1.5}
        markerEnd={`url(#${ids.arrow})`}
        strokeDasharray={animated ? '6 5' : undefined}
        style={animated ? { animation: 'sm-flow 1.5s linear 0.6s infinite' } : undefined}
      />

      {/* Transition: loading -> error (down) */}
      <path
        d={`M${loading.x},${loading.y + 15} L${errorState.x},${errorState.y - 15}`}
        fill="none"
        stroke={color}
        strokeWidth={1}
        opacity={0.2}
        markerEnd={`url(#${ids.arrow})`}
        strokeDasharray="4 6"
      />

      {/* Return flow: active -> idle (curved via bottom) */}
      <path
        d={`M${active.x - 5},${active.y + 15} Q${active.x},${active.y + 70} ${300},${380} Q${idle.x},${idle.y + 70} ${idle.x + 5},${idle.y + 15}`}
        fill="none"
        stroke={color}
        strokeWidth={1}
        opacity={0.15}
        strokeDasharray="4 8"
        markerEnd={`url(#${ids.arrow})`}
        style={animated ? { animation: 'sm-flow 3s linear infinite' } : undefined}
      />

      {/* Guard diamond */}
      <polygon
        points={`${guardX},${guardY - ds} ${guardX + ds},${guardY} ${guardX},${guardY + ds} ${guardX - ds},${guardY}`}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        opacity={0.45}
      />
      <polygon
        points={`${guardX},${guardY - ds * 0.4} ${guardX + ds * 0.4},${guardY} ${guardX},${guardY + ds * 0.4} ${guardX - ds * 0.4},${guardY}`}
        fill={color}
        opacity={0.2}
      />

      {/* State nodes */}
      {STATES.map((state, i) => (
        <g key={`state-${i}`}>
          {/* State glow */}
          <circle
            cx={state.x}
            cy={state.y}
            r={state.r + 12}
            fill={`url(#${i === 2 ? ids.activeGlow : ids.stateGlow})`}
          />

          {/* Initial state: double ring */}
          {state.initial && (
            <circle cx={state.x} cy={state.y} r={state.r + 5} fill="none" stroke={color} strokeWidth={1} opacity={0.25} />
          )}

          {/* Main circle */}
          <circle
            cx={state.x}
            cy={state.y}
            r={state.r}
            fill={i === 2 || i === 0 ? color : 'none'}
            fillOpacity={i === 2 ? 0.5 : i === 0 ? 0.4 : 1}
            stroke={color}
            strokeWidth={1.5}
            opacity={i === 3 ? 0.3 : 0.6}
            filter={i === 2 ? `url(#${ids.glow})` : undefined}
            style={animated && i === 2 ? { animation: 'sm-active-pulse 2s ease-in-out infinite' } : undefined}
          />
        </g>
      ))}
    </svg>
  );
};

StateMachine.displayName = 'StateMachine';
