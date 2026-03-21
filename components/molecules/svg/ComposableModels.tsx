'use client';

import React from 'react';

export interface ComposableModelsProps {
  className?: string;
  color?: string;
  animated?: boolean;
}

let composableModelsId = 0;

export const ComposableModels: React.FC<ComposableModelsProps> = ({
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  const ids = React.useMemo(() => {
    composableModelsId += 1;
    const base = `cm-${composableModelsId}`;
    return {
      glow: `${base}-glow`,
      gradL: `${base}-gl`,
      gradR: `${base}-gr`,
      sharedGlow: `${base}-sg`,
    };
  }, []);

  const leftCx = 210;
  const rightCx = 390;
  const cy = 200;
  const ringR = 130;

  // Private particles for each field
  const leftPrivate = [
    { x: 110, y: 140 },
    { x: 95, y: 220 },
    { x: 140, y: 270 },
    { x: 170, y: 110 },
  ];
  const rightPrivate = [
    { x: 490, y: 140 },
    { x: 505, y: 220 },
    { x: 460, y: 270 },
    { x: 430, y: 110 },
  ];

  // Shared particles in overlap zone
  const shared = [
    { x: 300, y: 160 },
    { x: 300, y: 240 },
    { x: 280, y: 200 },
    { x: 320, y: 200 },
  ];

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
        <radialGradient id={ids.sharedGlow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={ids.gradL} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.08} />
        </linearGradient>
        <linearGradient id={ids.gradR} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.08} />
          <stop offset="100%" stopColor={color} stopOpacity={0.3} />
        </linearGradient>
      </defs>

      {animated && (
        <style>{`
          @keyframes cm-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.9; } }
        `}</style>
      )}

      {/* Background ambient */}
      <circle cx={leftCx} cy={cy} r={ringR + 20} fill="none" stroke={color} strokeWidth={0.3} opacity={0.03} />
      <circle cx={rightCx} cy={cy} r={ringR + 20} fill="none" stroke={color} strokeWidth={0.3} opacity={0.03} />

      {/* Left orbital ring */}
      <circle cx={leftCx} cy={cy} r={ringR} fill="none" stroke={`url(#${ids.gradL})`} strokeWidth={1.5} />

      {/* Right orbital ring */}
      <circle cx={rightCx} cy={cy} r={ringR} fill="none" stroke={`url(#${ids.gradR})`} strokeWidth={1.5} />

      {/* Cross-connections from private to shared */}
      {leftPrivate.map((pt, i) => (
        <line
          key={`lc-${i}`}
          x1={pt.x}
          y1={pt.y}
          x2={shared[i % shared.length].x}
          y2={shared[i % shared.length].y}
          stroke={color}
          strokeWidth={0.5}
          opacity={0.1}
        />
      ))}
      {rightPrivate.map((pt, i) => (
        <line
          key={`rc-${i}`}
          x1={pt.x}
          y1={pt.y}
          x2={shared[(i + 1) % shared.length].x}
          y2={shared[(i + 1) % shared.length].y}
          stroke={color}
          strokeWidth={0.5}
          opacity={0.1}
        />
      ))}

      {/* Shared zone connections */}
      {shared.map((pt, i) => {
        const next = shared[(i + 1) % shared.length];
        return (
          <line key={`sc-${i}`} x1={pt.x} y1={pt.y} x2={next.x} y2={next.y} stroke={color} strokeWidth={1} opacity={0.25} />
        );
      })}

      {/* Left nucleus */}
      <circle cx={leftCx} cy={cy} r={5} fill={color} opacity={0.5} />

      {/* Right nucleus */}
      <circle cx={rightCx} cy={cy} r={5} fill={color} opacity={0.5} />

      {/* Private particles */}
      {leftPrivate.map((pt, i) => (
        <circle key={`lp-${i}`} cx={pt.x} cy={pt.y} r={3.5} fill={color} opacity={0.35} />
      ))}
      {rightPrivate.map((pt, i) => (
        <circle key={`rp-${i}`} cx={pt.x} cy={pt.y} r={3.5} fill={color} opacity={0.35} />
      ))}

      {/* Shared particles with glow */}
      <circle cx={300} cy={200} r={40} fill={`url(#${ids.sharedGlow})`} />
      {shared.map((pt, i) => (
        <circle
          key={`sp-${i}`}
          cx={pt.x}
          cy={pt.y}
          r={5}
          fill={color}
          opacity={0.7}
          filter={`url(#${ids.glow})`}
          style={animated ? { animation: `cm-pulse 2s ease-in-out ${i * 0.5}s infinite` } : undefined}
        />
      ))}
    </svg>
  );
};

ComposableModels.displayName = 'ComposableModels';
