'use client';

import React from 'react';

export interface ServiceLayersProps {
  className?: string;
  color?: string;
  animated?: boolean;
}

let serviceLayersId = 0;

// Three concentric rings with nodes
const LAYERS = [
  { r: 55, nodes: 3, opacity: 0.5 },   // Inner: Brains
  { r: 110, nodes: 5, opacity: 0.35 },  // Mid: Metal
  { r: 165, nodes: 7, opacity: 0.2 },   // Outer: Integrations
];

export const ServiceLayers: React.FC<ServiceLayersProps> = ({
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  const ids = React.useMemo(() => {
    serviceLayersId += 1;
    const base = `sly-${serviceLayersId}`;
    return {
      glow: `${base}-glow`,
      innerGrad: `${base}-ig`,
      midGrad: `${base}-mg`,
      outerGrad: `${base}-og`,
      coreGlow: `${base}-cg`,
    };
  }, []);

  const cx = 300;
  const cy = 200;

  // Compute node positions for each layer
  const layerNodes = LAYERS.map((layer) =>
    Array.from({ length: layer.nodes }, (_, i) => {
      const angle = (i / layer.nodes) * Math.PI * 2 - Math.PI / 2;
      return { x: cx + Math.cos(angle) * layer.r, y: cy + Math.sin(angle) * layer.r };
    })
  );

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
        <radialGradient id={ids.coreGlow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={ids.innerGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.45} />
          <stop offset="50%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0.45} />
        </linearGradient>
        <linearGradient id={ids.midGrad} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="50%" stopColor={color} stopOpacity={0.12} />
          <stop offset="100%" stopColor={color} stopOpacity={0.3} />
        </linearGradient>
        <linearGradient id={ids.outerGrad} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="50%" stopColor={color} stopOpacity={0.06} />
          <stop offset="100%" stopColor={color} stopOpacity={0.2} />
        </linearGradient>
      </defs>

      {animated && (
        <style>{`
          @keyframes sly-pulse {
            0%, 100% { opacity: 0.08; }
            50% { opacity: 0.2; }
          }
        `}</style>
      )}

      {/* Ambient background */}
      <circle cx={cx} cy={cy} r={185} fill="none" stroke={color} strokeWidth={0.3} opacity={0.03} />

      {/* Inner glow fill */}
      <circle cx={cx} cy={cy} r={LAYERS[0].r} fill={color} opacity={0.04} />
      <circle cx={cx} cy={cy} r={30} fill={`url(#${ids.coreGlow})`} />

      {/* Concentric rings */}
      {[ids.innerGrad, ids.midGrad, ids.outerGrad].map((gradId, i) => (
        <circle
          key={`ring-${i}`}
          cx={cx}
          cy={cy}
          r={LAYERS[i].r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={i === 0 ? 2 : 1.5}
          strokeDasharray={i === 2 ? '4 6' : undefined}
        />
      ))}

      {/* Cross-layer connections */}
      {layerNodes[0].map((inner, i) => {
        const outer = layerNodes[1][i % layerNodes[1].length];
        return (
          <line
            key={`cross-01-${i}`}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke={color}
            strokeWidth={0.6}
            opacity={0.1}
            style={animated ? { animation: `sly-pulse 3s ease-in-out ${i * 0.5}s infinite` } : undefined}
          />
        );
      })}
      {layerNodes[1].map((mid, i) => {
        const outer = layerNodes[2][i % layerNodes[2].length];
        return (
          <line
            key={`cross-12-${i}`}
            x1={mid.x}
            y1={mid.y}
            x2={outer.x}
            y2={outer.y}
            stroke={color}
            strokeWidth={0.5}
            opacity={0.07}
          />
        );
      })}

      {/* Nodes on each ring */}
      {LAYERS.map((layer, li) => (
        <g key={`layer-${li}`}>
          {layerNodes[li].map((node, ni) => (
            <g key={`node-${li}-${ni}`}>
              <circle cx={node.x} cy={node.y} r={12} fill="none" stroke={color} strokeWidth={0.5} opacity={layer.opacity * 0.3} />
              <circle
                cx={node.x}
                cy={node.y}
                r={li === 0 ? 6 : li === 1 ? 5 : 4}
                fill={color}
                opacity={layer.opacity}
                filter={li === 0 ? `url(#${ids.glow})` : undefined}
              />
            </g>
          ))}
        </g>
      ))}

      {/* Center nucleus */}
      <circle cx={cx} cy={cy} r={4} fill={color} opacity={0.6} filter={`url(#${ids.glow})`} />
    </svg>
  );
};

ServiceLayers.displayName = 'ServiceLayers';
