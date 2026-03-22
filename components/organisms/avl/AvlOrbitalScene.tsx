'use client';

/**
 * AvlOrbitalScene - Zoom Level 2
 *
 * Shows a single orbital: entity nucleus with fields,
 * trait rings, page markers, and external connection arrows.
 */

import React from 'react';
import { AvlOrbital } from '../../atoms/avl/AvlOrbital';
import { AvlEntity } from '../../atoms/avl/AvlEntity';
import { AvlTrait } from '../../atoms/avl/AvlTrait';
import { AvlPage } from '../../atoms/avl/AvlPage';
import { AvlClickTarget } from './AvlClickTarget';
import type { OrbitalLevelData } from './avl-schema-parser';

export interface AvlOrbitalSceneProps {
  data: OrbitalLevelData;
  color?: string;
  onTraitClick?: (traitName: string, position: { x: number; y: number }) => void;
}

const CX = 300;
const CY = 200;
const ORBITAL_R = 130;
const ENTITY_R = 24;

export const AvlOrbitalScene: React.FC<AvlOrbitalSceneProps> = ({
  data,
  color = 'var(--color-primary)',
  onTraitClick,
}) => {
  const traitAngleStart = -Math.PI / 3;
  const traitAngleStep = data.traits.length > 1
    ? (Math.PI * 1.2) / (data.traits.length - 1)
    : 0;

  // Position pages around the right side of the orbital
  const pageAngleStart = -Math.PI / 3;
  const pageAngleStep = data.pages.length > 1
    ? (Math.PI * 0.8) / (data.pages.length - 1)
    : 0;

  return (
    <g>
      {/* Orbital boundary */}
      <AvlOrbital cx={CX} cy={CY} r={ORBITAL_R} label={data.name} color={color} />

      {/* Trait rings */}
      {data.traits.map((trait, i) => {
        const rotation = traitAngleStart + i * traitAngleStep;
        const rotationDeg = (rotation * 180) / Math.PI;
        const baseRx = 55 + i * 20;
        const baseRy = 24 + i * 8;

        // Compute the label position (left side of ellipse) for click targeting
        const labelX = CX - baseRx - 10;
        const labelY = CY;

        return (
          <g key={trait.name}>
            <AvlTrait
              cx={CX}
              cy={CY}
              rx={baseRx}
              ry={baseRy}
              rotation={rotationDeg}
              label={trait.name}
              color={color}
              opacity={0.7}
            />

            {/* Clickable target over the trait ring area */}
            {onTraitClick && (
              <AvlClickTarget
                x={CX - baseRx}
                y={CY - baseRy}
                width={baseRx * 2}
                height={baseRy * 2}
                onClick={() => onTraitClick(trait.name, { x: CX, y: CY })}
                label={`Trait: ${trait.name} (${trait.stateCount} states)`}
                glowColor={color}
              >
                <rect x={0} y={0} width={0} height={0} fill="transparent" />
              </AvlClickTarget>
            )}

            {/* State count badge */}
            <text
              x={labelX - 20}
              y={labelY + 12}
              textAnchor="end"
              fill={color}
              fontSize={7}
              opacity={0.4}
              transform={`rotate(${-rotationDeg},${labelX - 20},${labelY + 12})`}
            >
              {trait.stateCount}s {trait.eventCount}e
            </text>
          </g>
        );
      })}

      {/* Entity nucleus */}
      <AvlEntity
        x={CX}
        y={CY}
        r={ENTITY_R}
        fieldCount={data.entity.fields.length}
        persistence={data.entity.persistence as 'persistent' | 'runtime' | 'singleton'}
        color={color}
      />

      {/* Entity name */}
      <text x={CX} y={CY + ENTITY_R + 16} textAnchor="middle" fill={color} fontSize={10} fontWeight="bold">
        {data.entity.name}
      </text>

      {/* Field labels around the entity */}
      {data.entity.fields.slice(0, 8).map((field, i) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * i) / Math.min(data.entity.fields.length, 8);
        const fx = CX + (ENTITY_R + 30) * Math.cos(angle);
        const fy = CY + (ENTITY_R + 30) * Math.sin(angle);
        return (
          <text
            key={field.name}
            x={fx}
            y={fy}
            textAnchor="middle"
            dominantBaseline="central"
            fill={color}
            fontSize={7}
            opacity={0.5}
          >
            {field.name}
          </text>
        );
      })}

      {/* Pages on the orbital boundary */}
      {data.pages.map((page, i) => {
        const angle = pageAngleStart + i * pageAngleStep;
        const px = CX + (ORBITAL_R + 15) * Math.cos(angle);
        const py = CY + (ORBITAL_R + 15) * Math.sin(angle);
        return (
          <AvlPage key={page.name} x={px} y={py} label={page.route} color={color} />
        );
      })}

      {/* External links (arrows to/from viewport edge) */}
      {data.externalLinks.map((link, i) => {
        const isOut = link.direction === 'out';
        const edgeX = isOut ? 580 : 20;
        const y = 50 + i * 24;

        return (
          <g key={`ext-${i}`} opacity={0.3}>
            <line
              x1={isOut ? CX + ORBITAL_R + 10 : edgeX}
              y1={y}
              x2={isOut ? edgeX : CX - ORBITAL_R - 10}
              y2={y}
              stroke={color}
              strokeWidth={1}
              strokeDasharray="6 3"
            />
            <text
              x={isOut ? 585 : 5}
              y={y + 4}
              textAnchor={isOut ? 'start' : 'start'}
              fill={color}
              fontSize={7}
              opacity={0.7}
            >
              {isOut ? 'emit' : 'listen'}: {link.eventName} ({link.targetOrbital})
            </text>
          </g>
        );
      })}
    </g>
  );
};

AvlOrbitalScene.displayName = 'AvlOrbitalScene';
