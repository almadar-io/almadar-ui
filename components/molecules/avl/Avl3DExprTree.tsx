'use client';

/**
 * Avl3DExprTree - 3D s-expression tree for guard/effect visualization.
 *
 * Renders operators as rounded boxes, literals as small spheres,
 * bindings as wireframe spheres, connected by thin cylinders.
 *
 * @packageDocumentation
 */

import React, { useMemo } from 'react';
import { Vector3 } from 'three';
import { AVL_OPERATOR_COLORS } from '../../atoms/avl/types';
import type { ExprTreeNode } from '../../organisms/avl/avl-schema-parser';
import { treeLayout3D, type Position3D } from '../../organisms/avl/avl-3d-layout';
import { Avl3DLabel } from '../../atoms/avl/Avl3DLabel';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface Avl3DExprTreeProps {
  /** The expression tree to render */
  expression: ExprTreeNode;
  /** Root position [x, y, z] */
  position: [number, number, number];
  /** Color override */
  color?: string;
  /** CSS class */
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map operator label to a namespace color */
function operatorColor(label: string): string {
  if (['+', '-', '*', '/', '%', 'mod'].includes(label)) return AVL_OPERATOR_COLORS.arithmetic;
  if (['=', '!=', '<', '>', '<=', '>=', 'eq', 'neq', 'lt', 'gt'].includes(label)) return AVL_OPERATOR_COLORS.comparison;
  if (['and', 'or', 'not', 'if', 'cond'].includes(label)) return AVL_OPERATOR_COLORS.logic;
  if (['concat', 'upper', 'lower', 'trim', 'substr'].includes(label)) return AVL_OPERATOR_COLORS.string;
  if (['map', 'filter', 'reduce', 'find', 'count', 'sum'].includes(label)) return AVL_OPERATOR_COLORS.collection;
  return '#4A90D9'; // default blue
}

/** Compute edge between parent and child positions */
function edgeGeometry(parent: Position3D, child: Position3D): {
  position: [number, number, number];
  rotation: [number, number, number];
  length: number;
} {
  const p = new Vector3(parent.x, parent.y, parent.z);
  const c = new Vector3(child.x, child.y, child.z);
  const mid = new Vector3().addVectors(p, c).multiplyScalar(0.5);
  const dir = new Vector3().subVectors(c, p);
  const length = dir.length();

  // Cylinder default axis is Y. Compute rotation to align with direction.
  const yAxis = new Vector3(0, 1, 0);
  const angle = yAxis.angleTo(dir.normalize());
  const axis = new Vector3().crossVectors(yAxis, dir).normalize();

  // If vectors are parallel, no rotation needed
  if (axis.length() < 0.001) {
    return {
      position: [mid.x, mid.y, mid.z],
      rotation: [0, 0, 0],
      length,
    };
  }

  // Convert axis-angle to euler (approximate)
  return {
    position: [mid.x, mid.y, mid.z],
    rotation: [
      axis.x * angle,
      axis.y * angle,
      axis.z * angle,
    ],
    length,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Avl3DExprTree: React.FC<Avl3DExprTreeProps> = ({
  expression,
  position,
}) => {
  const layoutResults = useMemo(() => {
    const origin: Position3D = { x: position[0], y: position[1], z: position[2] };
    return treeLayout3D(expression, origin, 2.5, 1.5);
  }, [expression, position]);

  // Build parent-child edges
  const edges = useMemo(() => {
    const result: Array<{ parent: Position3D; child: Position3D; key: string }> = [];

    function collectEdges(node: ExprTreeNode, parentPos: Position3D | null): void {
      const entry = layoutResults.find((r) => r.node === node);
      if (!entry) return;

      if (parentPos) {
        result.push({
          parent: parentPos,
          child: entry.position,
          key: `${parentPos.x}-${parentPos.y}-${entry.position.x}-${entry.position.y}`,
        });
      }

      if (node.children) {
        for (const child of node.children) {
          collectEdges(child, entry.position);
        }
      }
    }

    collectEdges(expression, null);
    return result;
  }, [expression, layoutResults]);

  return (
    <group>
      {/* Edges (thin cylinders) */}
      {edges.map((edge) => {
        const geo = edgeGeometry(edge.parent, edge.child);
        return (
          <mesh
            key={edge.key}
            position={geo.position}
            rotation={geo.rotation}
          >
            <cylinderGeometry args={[0.015, 0.015, geo.length, 6]} />
            <meshStandardMaterial
              color="#555555"
              transparent
              opacity={0.5}
            />
          </mesh>
        );
      })}

      {/* Nodes */}
      {layoutResults.map((entry, i) => {
        const pos: [number, number, number] = [
          entry.position.x,
          entry.position.y,
          entry.position.z,
        ];

        if (entry.node.type === 'operator') {
          const opColor = operatorColor(entry.node.label);
          return (
            <group key={i} position={pos}>
              {/* Rounded box for operators */}
              <mesh>
                <boxGeometry args={[0.6, 0.4, 0.3]} />
                <meshStandardMaterial
                  color={opColor}
                  emissive={opColor}
                  emissiveIntensity={0.4}
                  roughness={0.3}
                />
              </mesh>
              <Avl3DLabel
                position={[0, -0.4, 0]}
                text={entry.node.label}
                color={opColor}
                fontSize={10}
              />
            </group>
          );
        }

        if (entry.node.type === 'binding') {
          // V1: Torus knot for bindings (loop = "connected to something else")
          return (
            <group key={i} position={pos}>
              <mesh scale={0.08}>
                <torusKnotGeometry args={[2, 0.6, 48, 8, 2, 3]} />
                <meshStandardMaterial
                  color="#4A90D9"
                  emissive="#4A90D9"
                  emissiveIntensity={0.4}
                  transparent
                  opacity={0.85}
                  roughness={0.3}
                />
              </mesh>
              <Avl3DLabel
                position={[0, -0.35, 0]}
                text={entry.node.label}
                color="#4A90D9"
                fontSize={9}
              />
            </group>
          );
        }

        // V1: Literal = small cube ("fixed, solid value")
        return (
          <group key={i} position={pos}>
            <mesh rotation={[Math.PI / 6, Math.PI / 4, 0]}>
              <boxGeometry args={[0.2, 0.2, 0.2]} />
              <meshStandardMaterial
                color="#888888"
                emissive="#666666"
                emissiveIntensity={0.2}
                roughness={0.5}
              />
            </mesh>
            <Avl3DLabel
              position={[0, -0.3, 0]}
              text={entry.node.label}
              color="#999999"
              fontSize={8}
            />
          </group>
        );
      })}
    </group>
  );
};

Avl3DExprTree.displayName = 'Avl3DExprTree';
