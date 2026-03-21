'use client';

import React from 'react';

export interface WorldModelProps {
  className?: string;
  color?: string;
  animated?: boolean;
}

let worldModelId = 0;

export const WorldModel: React.FC<WorldModelProps> = ({
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  const ids = React.useMemo(() => {
    worldModelId += 1;
    const base = `wm-${worldModelId}`;
    return {
      glow: `${base}-glow`,
      nucGlow: `${base}-ng`,
      orbit1Grad: `${base}-o1`,
      orbit2Grad: `${base}-o2`,
      boundaryGrad: `${base}-bg`,
    };
  }, []);

  const cx = 300;
  const cy = 200;

  // Trait orbit 1 parameters
  const t1rx = 80;
  const t1ry = 55;
  const t1rot = -25;
  // Particles on trait orbit 1
  const t1particles = [0.5, 2.4, 4.3].map((a) => {
    const px = t1rx * Math.cos(a);
    const py = t1ry * Math.sin(a);
    const rotRad = (t1rot * Math.PI) / 180;
    return {
      x: cx + px * Math.cos(rotRad) - py * Math.sin(rotRad),
      y: cy + px * Math.sin(rotRad) + py * Math.cos(rotRad),
    };
  });

  // Trait orbit 2 parameters
  const t2rx = 100;
  const t2ry = 40;
  const t2rot = 40;
  // Particles on trait orbit 2
  const t2particles = [1.2, 4.0].map((a) => {
    const px = t2rx * Math.cos(a);
    const py = t2ry * Math.sin(a);
    const rotRad = (t2rot * Math.PI) / 180;
    return {
      x: cx + px * Math.cos(rotRad) - py * Math.sin(rotRad),
      y: cy + px * Math.sin(rotRad) + py * Math.cos(rotRad),
    };
  });

  // Page connection points on outer boundary
  const boundaryR = 140;
  const pages = [0, 1.57, 3.14, 4.71].map((a) => ({
    x: cx + Math.cos(a) * boundaryR,
    y: cy + Math.sin(a) * boundaryR,
  }));

  return (
    <svg
      viewBox="0 0 600 400"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <filter id={ids.glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={ids.nucGlow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={ids.orbit1Grad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="50%" stopColor={color} stopOpacity={0.45} />
          <stop offset="100%" stopColor={color} stopOpacity={0.15} />
        </linearGradient>
        <linearGradient id={ids.orbit2Grad} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.1} />
          <stop offset="50%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0.1} />
        </linearGradient>
        <linearGradient id={ids.boundaryGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.12} />
          <stop offset="50%" stopColor={color} stopOpacity={0.04} />
          <stop offset="100%" stopColor={color} stopOpacity={0.12} />
        </linearGradient>
      </defs>

      {animated && (
        <style>{`
          @keyframes wm-orbit1 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes wm-orbit2 { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        `}</style>
      )}

      {/* Ambient outer ring */}
      <circle cx={cx} cy={cy} r={160} fill="none" stroke={color} strokeWidth={0.3} opacity={0.03} />

      {/* Outer boundary (page connection ring) */}
      <circle
        cx={cx}
        cy={cy}
        r={boundaryR}
        fill="none"
        stroke={`url(#${ids.boundaryGrad})`}
        strokeWidth={1}
        strokeDasharray="4 8"
      />

      {/* Page connection lines to entity */}
      {pages.map((page, i) => (
        <line
          key={`pl-${i}`}
          x1={cx}
          y1={cy}
          x2={page.x}
          y2={page.y}
          stroke={color}
          strokeWidth={0.5}
          opacity={0.08}
          strokeDasharray="3 6"
        />
      ))}

      {/* Page connection points */}
      {pages.map((page, i) => (
        <g key={`page-${i}`}>
          <circle cx={page.x} cy={page.y} r={8} fill="none" stroke={color} strokeWidth={0.8} opacity={0.2} />
          <circle cx={page.x} cy={page.y} r={3.5} fill={color} opacity={0.3} />
        </g>
      ))}

      {/* Trait orbit 1 */}
      <g style={animated ? { transformOrigin: `${cx}px ${cy}px`, animation: 'wm-orbit1 25s linear infinite' } : undefined}>
        <ellipse
          cx={cx}
          cy={cy}
          rx={t1rx}
          ry={t1ry}
          fill="none"
          stroke={`url(#${ids.orbit1Grad})`}
          strokeWidth={1.5}
          transform={`rotate(${t1rot}, ${cx}, ${cy})`}
        />
      </g>

      {/* Trait orbit 1 particles */}
      {t1particles.map((pt, i) => (
        <circle key={`t1p-${i}`} cx={pt.x} cy={pt.y} r={4} fill={color} opacity={0.5} />
      ))}

      {/* Trait orbit 2 */}
      <g style={animated ? { transformOrigin: `${cx}px ${cy}px`, animation: 'wm-orbit2 35s linear infinite' } : undefined}>
        <ellipse
          cx={cx}
          cy={cy}
          rx={t2rx}
          ry={t2ry}
          fill="none"
          stroke={`url(#${ids.orbit2Grad})`}
          strokeWidth={1.5}
          transform={`rotate(${t2rot}, ${cx}, ${cy})`}
        />
      </g>

      {/* Trait orbit 2 particles */}
      {t2particles.map((pt, i) => (
        <circle key={`t2p-${i}`} cx={pt.x} cy={pt.y} r={3.5} fill={color} opacity={0.45} />
      ))}

      {/* Entity nucleus glow */}
      <circle cx={cx} cy={cy} r={30} fill={`url(#${ids.nucGlow})`} />

      {/* Entity nucleus */}
      <circle cx={cx} cy={cy} r={10} fill={color} opacity={0.75} filter={`url(#${ids.glow})`} />
    </svg>
  );
};

WorldModel.displayName = 'WorldModel';
