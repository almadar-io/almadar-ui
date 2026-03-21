'use client';

import React from 'react';

export interface ProveCorrectProps {
  className?: string;
  color?: string;
  animated?: boolean;
}

let proveCorrectId = 0;

// Validation points around the perimeter
const VALIDATION_POINTS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
  return { angle, x: 300 + Math.cos(angle) * 140, y: 200 + Math.sin(angle) * 140 };
});

export const ProveCorrect: React.FC<ProveCorrectProps> = ({
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  const ids = React.useMemo(() => {
    proveCorrectId += 1;
    const base = `pc-${proveCorrectId}`;
    return {
      glow: `${base}-glow`,
      shieldGrad: `${base}-sg`,
      nucGlow: `${base}-ng`,
      ringGrad: `${base}-rg`,
    };
  }, []);

  const cx = 300;
  const cy = 200;

  // Shield-shaped boundary path (larger, centered)
  const shieldPath = `M${cx},${cy - 150} C${cx - 80},${cy - 130} ${cx - 155},${cy - 100} ${cx - 155},${cy - 30}
    C${cx - 155},${cy + 40} ${cx - 80},${cy + 110} ${cx},${cy + 150}
    C${cx + 80},${cy + 110} ${cx + 155},${cy + 40} ${cx + 155},${cy - 30}
    C${cx + 155},${cy - 100} ${cx + 80},${cy - 130} ${cx},${cy - 150} Z`;

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
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={ids.shieldGrad} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="50%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0.3} />
        </linearGradient>
        <linearGradient id={ids.ringGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="50%" stopColor={color} stopOpacity={0.1} />
          <stop offset="100%" stopColor={color} stopOpacity={0.3} />
        </linearGradient>
      </defs>

      {animated && (
        <style>{`
          @keyframes pc-verify-pulse {
            0%, 100% { opacity: 0.15; }
            50% { opacity: 0.35; }
          }
        `}</style>
      )}

      {/* Shield boundary */}
      <path
        d={shieldPath}
        fill={color}
        fillOpacity={0.03}
        stroke={`url(#${ids.shieldGrad})`}
        strokeWidth={2}
        style={animated ? { animation: 'pc-verify-pulse 3s ease-in-out infinite' } : undefined}
      />

      {/* Connecting lines from center to validation points */}
      {VALIDATION_POINTS.map((pt, i) => (
        <line
          key={`link-${i}`}
          x1={cx}
          y1={cy}
          x2={pt.x}
          y2={pt.y}
          stroke={color}
          strokeWidth={0.8}
          opacity={0.12}
          strokeDasharray="4 6"
        />
      ))}

      {/* Validation points on perimeter */}
      {VALIDATION_POINTS.map((pt, i) => (
        <g key={`vp-${i}`}>
          <circle cx={pt.x} cy={pt.y} r={10} fill="none" stroke={color} strokeWidth={0.5} opacity={0.15} />
          <circle cx={pt.x} cy={pt.y} r={4.5} fill={color} opacity={0.4} />
        </g>
      ))}

      {/* Inner orbital */}
      <circle cx={cx} cy={cy} r={60} fill="none" stroke={`url(#${ids.ringGrad})`} strokeWidth={1.5} />

      {/* Orbital particles */}
      {[0.5, 2.5, 4.5].map((a, i) => {
        const px = cx + Math.cos(a) * 60;
        const py = cy + Math.sin(a) * 60;
        return <circle key={`op-${i}`} cx={px} cy={py} r={3} fill={color} opacity={0.45} />;
      })}

      {/* Nucleus glow */}
      <circle cx={cx} cy={cy} r={25} fill={`url(#${ids.nucGlow})`} />

      {/* Checkmark as orbital pattern */}
      <path
        d={`M${cx - 12},${cy} L${cx - 3},${cy + 10} L${cx + 14},${cy - 10}`}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
        filter={`url(#${ids.glow})`}
      />
    </svg>
  );
};

ProveCorrect.displayName = 'ProveCorrect';
