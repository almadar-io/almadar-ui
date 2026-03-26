'use client';

/**
 * Avl3DTransitionArc - Curved tube between two state nodes.
 *
 * Renders a tube geometry along a Bezier curve with optional guard gate
 * and arrowhead cone. The 3D equivalent of SVG transition arrows.
 *
 * @packageDocumentation
 */

import React, { useMemo, useState } from 'react';
import { Quaternion, Vector3 } from 'three';
import { AVL_3D_COLORS, arcCurve3D, selfLoopCurve3D } from '../../organisms/avl/avl-3d-layout';

// V4: Effect type color mapping
function effectTypeColor(type: string): string {
  switch (type) {
    case 'render-ui': return '#5b9bd5';
    case 'set': return '#e0944a';
    case 'persist': return '#4ecb71';
    case 'fetch': return '#5b9bd5';
    case 'emit': return '#a78bda';
    case 'navigate': return '#40c8aa';
    case 'notify': return '#f0c040';
    case 'call-service': return '#a78bda';
    case 'spawn': return '#4ecb71';
    case 'despawn': return '#f06060';
    default: return '#888888';
  }
}
import { Avl3DLabel } from '../../atoms/avl/Avl3DLabel';
import { Avl3DTooltip } from '../../atoms/avl/Avl3DTooltip';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface Avl3DTransitionArcProps {
  /** Start position [x, y, z] */
  from: [number, number, number];
  /** End position [x, y, z] */
  to: [number, number, number];
  /** Event name */
  event: string;
  /** Whether this transition has a guard */
  hasGuard?: boolean;
  /** Number of effects */
  effectCount: number;
  /** Effect type names for V4 micro-icons */
  effectTypes?: string[];
  /** Index (for fanning parallel transitions) */
  index: number;
  /** Whether this is a self-transition */
  isSelf?: boolean;
  /** Source state name (for tooltip) */
  fromState?: string;
  /** Target state name (for tooltip) */
  toState?: string;
  /** Click handler */
  onClick?: () => void;
  /** Color override */
  color?: string;
  /** CSS class */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Avl3DTransitionArc: React.FC<Avl3DTransitionArcProps> = ({
  from,
  to,
  event,
  hasGuard = false,
  effectTypes,
  index,
  isSelf = false,
  fromState,
  toState,
  onClick,
  color = AVL_3D_COLORS.transitionArc,
}) => {
  const [hovered, setHovered] = useState(false);

  const { tubeArgs, labelPos, guardPos, arrowPos, arrowQuat, effectPositions } = useMemo(() => {
    const offset = 1.5 + index * 0.8;
    const curve = isSelf
      ? selfLoopCurve3D(from, 1.2)
      : arcCurve3D(from, to, offset);

    const mid = curve.getPoint(0.5);
    const guardPt = curve.getPoint(0.3);
    const arrowPt = curve.getPoint(0.9);
    const arrowTangent = curve.getTangent(0.9);

    // Compute quaternion to align cone (default Y-up) with tangent direction
    const upVec = new Vector3(0, 1, 0);
    const tangentVec = new Vector3(arrowTangent.x, arrowTangent.y, arrowTangent.z).normalize();
    const quat = new Quaternion().setFromUnitVectors(upVec, tangentVec);

    // V4: Precompute effect icon positions along curve
    const effectPositions: [number, number, number][] = [];
    for (let ei = 0; ei < 4; ei++) {
      const t = 0.7 + ei * 0.05;
      const ep = curve.getPoint(t);
      effectPositions.push([ep.x, ep.y + 0.2, ep.z]);
    }

    return {
      tubeArgs: [curve, 48, 0.02, 8, false] as const,
      labelPos: [mid.x, mid.y + 0.3, mid.z] as [number, number, number],
      guardPos: [guardPt.x, guardPt.y, guardPt.z] as [number, number, number],
      arrowPos: [arrowPt.x, arrowPt.y, arrowPt.z] as [number, number, number],
      arrowQuat: [quat.x, quat.y, quat.z, quat.w] as [number, number, number, number],
      effectPositions,
    };
  }, [from, to, index, isSelf]);

  const emissiveIntensity = hovered ? 0.8 : 0.4;

  return (
    <group>
      {/* Tube along curve */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <tubeGeometry args={tubeArgs as unknown as ConstructorParameters<typeof import('three').TubeGeometry>} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={hovered ? 0.9 : 0.7}
        />
      </mesh>

      {/* Guard gate (octahedron at 30% along curve) */}
      {hasGuard && (
        <mesh position={guardPos} scale={0.15}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={AVL_3D_COLORS.guardPass}
            emissive={AVL_3D_COLORS.guardPass}
            emissiveIntensity={0.8}
          />
        </mesh>
      )}

      {/* Arrowhead cone at 90% along curve, rotated to face tangent */}
      <mesh
        position={arrowPos}
        quaternion={arrowQuat}
        scale={0.08}
      >
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Event label at midpoint */}
      <Avl3DLabel
        position={labelPos}
        text={event}
        color={hovered ? '#ffffff' : color}
        fontSize={hovered ? 11 : 9}
      />

      {/* Hover tooltip */}
      {hovered && (
        <Avl3DTooltip
          position={[labelPos[0], labelPos[1] + 0.6, labelPos[2]]}
          title={event}
          accentColor={AVL_3D_COLORS.transitionArc}
          rows={[
            ...(fromState && toState ? [{ label: 'Transition', value: `${fromState} → ${toState}` }] : []),
            ...(hasGuard ? [{ label: 'Guard', value: 'Yes' }] : []),
            ...(effectTypes && effectTypes.length > 0
              ? [{ label: 'Effects', value: effectTypes.slice(0, 3).join(', ') + (effectTypes.length > 3 ? ` +${effectTypes.length - 3}` : '') }]
              : []),
          ]}
        />
      )}

      {/* V4: Effect type micro-icons near target (70-85% along curve) */}
      {effectTypes && effectTypes.length > 0 && effectTypes.slice(0, 4).map((effectType, ei) => {
        const pt = effectPositions[ei];
        if (!pt) return null;
        const eColor = effectTypeColor(effectType);
        return (
          <group key={ei} position={pt}>
            <mesh scale={0.06}>
              {effectType === 'render-ui' ? (
                <boxGeometry args={[1.5, 1.5, 0.3]} />
              ) : effectType === 'persist' ? (
                <cylinderGeometry args={[0.6, 0.6, 1.5, 8]} />
              ) : effectType === 'emit' ? (
                <sphereGeometry args={[1, 8, 8]} />
              ) : effectType === 'navigate' ? (
                <coneGeometry args={[0.8, 1.5, 6]} />
              ) : effectType === 'set' ? (
                <tetrahedronGeometry args={[1, 0]} />
              ) : effectType === 'notify' ? (
                <dodecahedronGeometry args={[0.8, 0]} />
              ) : effectType === 'call-service' ? (
                <torusGeometry args={[0.8, 0.3, 6, 12]} />
              ) : (
                <octahedronGeometry args={[0.8, 0]} />
              )}
              <meshStandardMaterial
                color={eColor}
                emissive={eColor}
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

Avl3DTransitionArc.displayName = 'Avl3DTransitionArc';
