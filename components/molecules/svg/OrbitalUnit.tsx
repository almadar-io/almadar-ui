'use client';

import React from 'react';

export interface OrbitalUnitProps {
  className?: string;
  color?: string;
  animated?: boolean;
}

let orbitalUnitId = 0;

export const OrbitalUnit: React.FC<OrbitalUnitProps> = ({
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  const ids = React.useMemo(() => {
    orbitalUnitId += 1;
    const base = `ou-${orbitalUnitId}`;
    return {
      glow: `${base}-glow`,
      grad1: `${base}-grad1`,
      grad2: `${base}-grad2`,
      grad3: `${base}-grad3`,
      nucleusGlow: `${base}-ng`,
    };
  }, []);

  const cx = 300;
  const cy = 200;

  // Outer orbit connection points (pages)
  const outerR = 140;
  const outerPoints = Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(a) * outerR, y: cy + Math.sin(a) * outerR };
  });

  // Mid orbit particles (traits)
  const midRx = 90;
  const midRy = 65;
  const midRot = 25;
  const midParticles = [0, 2.1, 4.2].map((a) => {
    const rad = a;
    const px = midRx * Math.cos(rad);
    const py = midRy * Math.sin(rad);
    const rotRad = (midRot * Math.PI) / 180;
    return {
      x: cx + px * Math.cos(rotRad) - py * Math.sin(rotRad),
      y: cy + px * Math.sin(rotRad) + py * Math.cos(rotRad),
    };
  });

  // Inner orbit particles
  const innerRx = 50;
  const innerRy = 35;
  const innerRot = -15;
  const innerParticles = [0.8, 3.9].map((a) => {
    const rad = a;
    const px = innerRx * Math.cos(rad);
    const py = innerRy * Math.sin(rad);
    const rotRad = (innerRot * Math.PI) / 180;
    return {
      x: cx + px * Math.cos(rotRad) - py * Math.sin(rotRad),
      y: cy + px * Math.sin(rotRad) + py * Math.cos(rotRad),
    };
  });

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
        <radialGradient id={ids.nucleusGlow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={ids.grad1} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.1} />
          <stop offset="50%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0.1} />
        </linearGradient>
        <linearGradient id={ids.grad2} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="50%" stopColor={color} stopOpacity={0.5} />
          <stop offset="100%" stopColor={color} stopOpacity={0.15} />
        </linearGradient>
        <linearGradient id={ids.grad3} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="50%" stopColor={color} stopOpacity={0.6} />
          <stop offset="100%" stopColor={color} stopOpacity={0.2} />
        </linearGradient>
      </defs>

      {animated && (
        <style>{`
          @keyframes ou-spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes ou-spin-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        `}</style>
      )}

      {/* Background ambient rings */}
      <circle cx={cx} cy={cy} r={170} fill="none" stroke={color} strokeWidth={0.5} opacity={0.04} />
      <circle cx={cx} cy={cy} r={180} fill="none" stroke={color} strokeWidth={0.3} opacity={0.03} />

      {/* Nucleus ambient glow */}
      <circle cx={cx} cy={cy} r={30} fill={`url(#${ids.nucleusGlow})`} />

      {/* Outer orbit (pages) */}
      <circle
        cx={cx}
        cy={cy}
        r={outerR}
        fill="none"
        stroke={`url(#${ids.grad1})`}
        strokeWidth={1}
        strokeDasharray="4 8"
      />

      {/* Outer orbit connection points */}
      {outerPoints.map((pt, i) => (
        <circle key={`op-${i}`} cx={pt.x} cy={pt.y} r={3.5} fill={color} opacity={0.3} />
      ))}

      {/* Mid orbit (traits) */}
      <g
        style={animated ? { transformOrigin: `${cx}px ${cy}px`, animation: 'ou-spin-slow 30s linear infinite' } : undefined}
      >
        <ellipse
          cx={cx}
          cy={cy}
          rx={midRx}
          ry={midRy}
          fill="none"
          stroke={`url(#${ids.grad2})`}
          strokeWidth={1.5}
          transform={`rotate(${midRot}, ${cx}, ${cy})`}
        />
      </g>

      {/* Mid particles */}
      {midParticles.map((pt, i) => (
        <circle key={`mp-${i}`} cx={pt.x} cy={pt.y} r={4} fill={color} opacity={0.5} />
      ))}

      {/* Inner orbit */}
      <g
        style={animated ? { transformOrigin: `${cx}px ${cy}px`, animation: 'ou-spin-rev 20s linear infinite' } : undefined}
      >
        <ellipse
          cx={cx}
          cy={cy}
          rx={innerRx}
          ry={innerRy}
          fill="none"
          stroke={`url(#${ids.grad3})`}
          strokeWidth={1.5}
          transform={`rotate(${innerRot}, ${cx}, ${cy})`}
        />
      </g>

      {/* Inner particles */}
      {innerParticles.map((pt, i) => (
        <circle key={`ip-${i}`} cx={pt.x} cy={pt.y} r={3.5} fill={color} opacity={0.6} />
      ))}

      {/* Nucleus */}
      <circle
        cx={cx}
        cy={cy}
        r={7}
        fill={color}
        opacity={0.8}
        filter={`url(#${ids.glow})`}
      />
    </svg>
  );
};

OrbitalUnit.displayName = 'OrbitalUnit';
