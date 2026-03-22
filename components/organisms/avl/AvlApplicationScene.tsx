'use client';

/**
 * AvlApplicationScene - Zoom Level 1
 *
 * Shows all orbitals in the application with cross-orbital
 * emit/listen arrows. Each orbital is a clickable AvlOrbitalUnit.
 */

import React from 'react';
import { AvlOrbital } from '../../atoms/avl/AvlOrbital';
import { AvlEntity } from '../../atoms/avl/AvlEntity';
import { AvlTrait } from '../../atoms/avl/AvlTrait';
import { AvlPage } from '../../atoms/avl/AvlPage';
import { AvlEffect } from '../../atoms/avl/AvlEffect';
import { curveControlPoint } from '../../molecules/avl/avl-layout';
import { AvlClickTarget } from './AvlClickTarget';
import type { ApplicationLevelData, CrossLink } from './avl-schema-parser';

export interface AvlApplicationSceneProps {
  data: ApplicationLevelData;
  color?: string;
  onOrbitalClick?: (orbitalName: string, position: { x: number; y: number }) => void;
}

const ORBITAL_R = 60;
const ENTITY_R = 14;

// Bundle cross-links between the same pair of orbitals
function bundleCrossLinks(links: CrossLink[]): Map<string, CrossLink[]> {
  const bundles = new Map<string, CrossLink[]>();
  for (const link of links) {
    const key = [link.emitterOrbital, link.listenerOrbital].sort().join('::');
    if (!bundles.has(key)) bundles.set(key, []);
    bundles.get(key)!.push(link);
  }
  return bundles;
}

export const AvlApplicationScene: React.FC<AvlApplicationSceneProps> = ({
  data,
  color = 'var(--color-primary)',
  onOrbitalClick,
}) => {
  const posMap = new Map<string, { x: number; y: number }>();
  data.orbitals.forEach(o => posMap.set(o.name, o.position));

  const bundles = bundleCrossLinks(data.crossLinks);

  return (
    <g>
      {/* Cross-orbital arrows (behind orbitals) */}
      {Array.from(bundles.entries()).map(([key, links]) => {
        const first = links[0];
        const fromPos = posMap.get(first.emitterOrbital);
        const toPos = posMap.get(first.listenerOrbital);
        if (!fromPos || !toPos) return null;

        const cp = curveControlPoint(fromPos.x, fromPos.y, toPos.x, toPos.y, 40);
        const midX = cp.cpx;
        const midY = cp.cpy;

        return (
          <g key={key} opacity={0.5}>
            {/* Curved arrow path */}
            <path
              d={`M${fromPos.x},${fromPos.y} Q${midX},${midY} ${toPos.x},${toPos.y}`}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray="6 3"
              markerEnd="url(#cosmicArrow)"
            />

            {/* Event labels stacked at midpoint */}
            {links.map((link, i) => (
              <g key={`${key}-${i}`}>
                <AvlEffect
                  x={midX - 12}
                  y={midY - 10 + i * 16}
                  effectType="emit"
                  size={8}
                  color={color}
                />
                <text
                  x={midX + 2}
                  y={midY - 6 + i * 16}
                  fill={color}
                  fontSize={7}
                  opacity={0.7}
                >
                  {link.eventName}
                </text>
              </g>
            ))}
          </g>
        );
      })}

      {/* Orbitals */}
      {data.orbitals.map((orbital) => {
        const { x, y } = orbital.position;

        // Trait angle distribution for mini orbital unit
        const traitAngleStart = -60;
        const traitAngleStep = orbital.traitNames.length > 1
          ? 120 / (orbital.traitNames.length - 1)
          : 0;

        // Page positions around the right side
        const pageAngleStart = -Math.PI / 3;
        const pageAngleStep = orbital.pageNames.length > 1
          ? (Math.PI * 0.8) / (orbital.pageNames.length - 1)
          : 0;

        return (
          <g key={orbital.name}>
            {/* Orbital boundary */}
            <AvlOrbital cx={x} cy={y} r={ORBITAL_R} label={orbital.name} color={color} />

            {/* Trait rings (simplified) */}
            {orbital.traitNames.map((trait, i) => (
              <AvlTrait
                key={trait}
                cx={x}
                cy={y}
                rx={25 + i * 10}
                ry={12 + i * 4}
                rotation={traitAngleStart + i * traitAngleStep}
                color={color}
                opacity={0.4}
              />
            ))}

            {/* Entity nucleus */}
            <AvlEntity
              x={x}
              y={y}
              r={ENTITY_R}
              fieldCount={orbital.fieldCount}
              persistence={orbital.persistence as 'persistent' | 'runtime' | 'singleton'}
              color={color}
            />

            {/* Page markers with labels */}
            {orbital.pageNames.map((page, i) => {
              const angle = pageAngleStart + i * pageAngleStep;
              const px = x + (ORBITAL_R + 12) * Math.cos(angle);
              const py = y + (ORBITAL_R + 12) * Math.sin(angle);
              return <AvlPage key={page} x={px} y={py} size={6} label={page} color={color} />;
            })}

            {/* Click target */}
            {onOrbitalClick && (
              <AvlClickTarget
                x={x - ORBITAL_R}
                y={y - ORBITAL_R}
                width={ORBITAL_R * 2}
                height={ORBITAL_R * 2}
                onClick={() => onOrbitalClick(orbital.name, { x, y })}
                label={`Orbital: ${orbital.name} (${orbital.traitNames.length} traits, ${orbital.pageNames.length} pages)`}
                glowColor={color}
              >
                <rect x={0} y={0} width={0} height={0} fill="transparent" />
              </AvlClickTarget>
            )}
          </g>
        );
      })}

      {/* Arrow marker definition */}
      <defs>
        <marker id="cosmicArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} opacity={0.5} />
        </marker>
      </defs>
    </g>
  );
};

AvlApplicationScene.displayName = 'AvlApplicationScene';
