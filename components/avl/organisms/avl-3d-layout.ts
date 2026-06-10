/**
 * avl-3d-layout.ts
 *
 * Pure math utilities for 3D positioning of AVL visualization nodes.
 * The 3D equivalent of avl-layout.ts (2D positioning helpers).
 *
 * @packageDocumentation
 */

import { QuadraticBezierCurve3, Vector3 } from 'three';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface ExprTreeNode3D {
  label: string;
  type: 'operator' | 'literal' | 'binding';
  children?: ExprTreeNode3D[];
}

export interface TreeLayoutResult {
  node: ExprTreeNode3D;
  position: Position3D;
}

// ---------------------------------------------------------------------------
// Color Palette (from design doc)
// ---------------------------------------------------------------------------

/**
 * Refined palette following Almadar UI Beauty principles:
 * - No pure black: deep navy tint (#0c1222) instead of #0A0A1A
 * - 60-30-10 rule: 60% deep background, 30% muted blues/grays, 10% bright accents
 * - Desaturated for dark backgrounds: softer blues, warmer golds
 * - Depth through color layering: surfaces get progressively lighter
 */
export const AVL_3D_COLORS = {
  // Orbital node: deep indigo body with soft cyan-blue rim glow
  orbitalSphere: '#161b2e',
  orbitalRim: '#5b9bd5',
  // Entity core: warm amber-gold (slightly desaturated for dark bg)
  entityCore: '#f0c040',
  entityCoreGlow: '#ffd866',
  // Trait orbit ring
  traitOrbit: '#5b9bd5',
  traitOrbitHighlight: '#7ab8f5',
  // State nodes
  stateIdle: '#1e2a3a',
  stateEdge: '#5b9bd5',
  stateActive: '#4ecb71',
  // Transitions: warm copper-orange
  transitionArc: '#e0944a',
  transitionArcHover: '#f0a860',
  // Guards
  guardPass: '#4ecb71',
  guardFail: '#f06060',
  // Cross-orbital wires: soft lavender
  crossWire: '#a78bda',
  crossWireGlow: '#c4a8f0',
  // Page portals: soft teal
  pagePortal: '#40c8aa',
  // Background: deep navy with blue undertone (not pure black)
  background: '#0c1222',
  backgroundSurface: '#111a2e',
  // Fog: matches background for seamless fade
  fog: '#0c1222',
  // Sparkle/particle accent
  sparkle: '#7ab8f5',
  sparkleWarm: '#f0c040',
} as const;

// ---------------------------------------------------------------------------
// Golden angle spiral (Application level - galaxy view, fallback)
// ---------------------------------------------------------------------------

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ~137.508 degrees in radians

/**
 * Positions N nodes on a golden-ratio spiral in the XZ plane (y=0).
 * Used as initial positions for the force-directed layout.
 */
export function goldenSpiralPositions(count: number, baseRadius: number): Position3D[] {
  if (count === 0) return [];
  if (count === 1) return [{ x: 0, y: 0, z: 0 }];

  const positions: Position3D[] = [];
  for (let i = 0; i < count; i++) {
    const angle = i * GOLDEN_ANGLE;
    const r = baseRadius * Math.sqrt(i / count);
    positions.push({
      x: r * Math.cos(angle),
      y: 0,
      z: r * Math.sin(angle),
    });
  }
  return positions;
}

// ---------------------------------------------------------------------------
// Force-directed layout (U1: Gestalt grouping)
// ---------------------------------------------------------------------------

interface ForceEdge {
  from: number;
  to: number;
}

/**
 * Runs a simple force-directed simulation to cluster connected nodes.
 * Connected nodes attract, all nodes repel. Runs for a fixed number of iterations.
 *
 * @param count Number of nodes
 * @param edges Connections between nodes (indices)
 * @param baseRadius Approximate spread radius
 * @param iterations Simulation steps (default 80)
 */
export function forceDirectedPositions(
  count: number,
  edges: ForceEdge[],
  baseRadius: number,
  iterations: number = 80,
): Position3D[] {
  if (count === 0) return [];
  if (count === 1) return [{ x: 0, y: 0, z: 0 }];

  // Initialize with spiral positions
  const positions = goldenSpiralPositions(count, baseRadius);

  const repulsionStrength = baseRadius * baseRadius * 0.5;
  const attractionStrength = 0.15;
  const damping = 0.85;

  const velocities: Position3D[] = positions.map(() => ({ x: 0, y: 0, z: 0 }));

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between all pairs
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = positions[i].x - positions[j].x;
        const dz = positions[i].z - positions[j].z;
        const distSq = dx * dx + dz * dz + 0.01;
        const force = repulsionStrength / distSq;
        const dist = Math.sqrt(distSq);
        const fx = (dx / dist) * force;
        const fz = (dz / dist) * force;

        velocities[i].x += fx;
        velocities[i].z += fz;
        velocities[j].x -= fx;
        velocities[j].z -= fz;
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const dx = positions[edge.to].x - positions[edge.from].x;
      const dz = positions[edge.to].z - positions[edge.from].z;
      const dist = Math.sqrt(dx * dx + dz * dz + 0.01);
      const force = dist * attractionStrength;
      const fx = (dx / dist) * force;
      const fz = (dz / dist) * force;

      velocities[edge.from].x += fx;
      velocities[edge.from].z += fz;
      velocities[edge.to].x -= fx;
      velocities[edge.to].z -= fz;
    }

    // Apply velocities with damping
    for (let i = 0; i < count; i++) {
      positions[i].x += velocities[i].x * 0.1;
      positions[i].z += velocities[i].z * 0.1;
      velocities[i].x *= damping;
      velocities[i].z *= damping;
    }
  }

  // Center the layout
  let cx = 0, cz = 0;
  for (const p of positions) { cx += p.x; cz += p.z; }
  cx /= count; cz /= count;
  for (const p of positions) { p.x -= cx; p.z -= cz; }

  return positions;
}

// ---------------------------------------------------------------------------
// Fibonacci sphere (Trait level - state machine)
// ---------------------------------------------------------------------------

/**
 * Distributes N points on a sphere surface using Fibonacci lattice.
 * Produces near-uniform spacing regardless of count.
 */
export function fibonacciSpherePositions(count: number, radius: number): Position3D[] {
  if (count === 0) return [];
  if (count === 1) return [{ x: 0, y: 0, z: 0 }];

  const positions: Position3D[] = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (2 * i) / (count - 1); // -1 to 1
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = GOLDEN_ANGLE * i;
    positions.push({
      x: radius * radiusAtY * Math.cos(theta),
      y: radius * y,
      z: radius * radiusAtY * Math.sin(theta),
    });
  }
  return positions;
}

// ---------------------------------------------------------------------------
// Orbit ring (Orbital level - trait orbits)
// ---------------------------------------------------------------------------

/**
 * Evenly spaces N points on a tilted ring (elliptical orbit).
 * `tilt` is the ring's inclination in radians relative to the XZ plane.
 */
export function orbitRingPositions(
  count: number,
  radius: number,
  tilt: number,
): Position3D[] {
  if (count === 0) return [];

  const positions: Position3D[] = [];
  const step = (2 * Math.PI) / count;

  for (let i = 0; i < count; i++) {
    const angle = i * step;
    const x = radius * Math.cos(angle);
    const flatZ = radius * Math.sin(angle);
    // Apply tilt: rotate around the X-axis
    const y = flatZ * Math.sin(tilt);
    const z = flatZ * Math.cos(tilt);
    positions.push({ x, y, z });
  }
  return positions;
}

// ---------------------------------------------------------------------------
// 3D arc curve (transitions, cross-wires)
// ---------------------------------------------------------------------------

/**
 * Creates a QuadraticBezierCurve3 between two 3D points with a control
 * point offset perpendicular to the from-to line. The offset direction
 * is computed in 3D using a cross product with the up vector.
 */
export function arcCurve3D(
  from: [number, number, number],
  to: [number, number, number],
  offset: number,
): QuadraticBezierCurve3 {
  const start = new Vector3(...from);
  const end = new Vector3(...to);
  const mid = new Vector3().addVectors(start, end).multiplyScalar(0.5);

  // Direction from start to end
  const dir = new Vector3().subVectors(end, start).normalize();
  // Up vector
  const up = new Vector3(0, 1, 0);
  // Perpendicular direction
  const perp = new Vector3().crossVectors(dir, up).normalize();

  // If dir is parallel to up, use a different reference
  if (perp.length() < 0.001) {
    perp.crossVectors(dir, new Vector3(1, 0, 0)).normalize();
  }

  // Offset the midpoint
  const control = mid.clone().add(perp.multiplyScalar(offset));
  // Also lift control point slightly for visual clarity
  control.y += Math.abs(offset) * 0.3;

  return new QuadraticBezierCurve3(start, control, end);
}

// ---------------------------------------------------------------------------
// Self-loop curve (self-transitions)
// ---------------------------------------------------------------------------

/**
 * Creates a loop curve above a point for self-transitions.
 */
export function selfLoopCurve3D(
  position: [number, number, number],
  loopRadius: number,
): QuadraticBezierCurve3 {
  const base = new Vector3(...position);
  const start = base.clone().add(new Vector3(-loopRadius * 0.3, 0, 0));
  const end = base.clone().add(new Vector3(loopRadius * 0.3, 0, 0));
  const control = base.clone().add(new Vector3(0, loopRadius, 0));

  return new QuadraticBezierCurve3(start, control, end);
}

// ---------------------------------------------------------------------------
// 3D tree layout (Transition level - expression tree)
// ---------------------------------------------------------------------------

/**
 * Recursively positions an expression tree in 3D space.
 * Root at origin, children spread horizontally, depth goes downward (negative Y).
 */
export function treeLayout3D(
  node: ExprTreeNode3D,
  origin: Position3D,
  horizontalSpacing: number,
  verticalSpacing: number = 2,
): TreeLayoutResult[] {
  const results: TreeLayoutResult[] = [];

  function layoutNode(
    n: ExprTreeNode3D,
    pos: Position3D,
    depth: number,
  ): void {
    results.push({ node: n, position: pos });

    if (!n.children || n.children.length === 0) return;

    const childCount = n.children.length;
    const totalWidth = (childCount - 1) * horizontalSpacing / (depth + 1);
    const startX = pos.x - totalWidth / 2;

    for (let i = 0; i < childCount; i++) {
      const childPos: Position3D = {
        x: startX + (i * totalWidth) / Math.max(childCount - 1, 1),
        y: pos.y - verticalSpacing,
        z: pos.z,
      };
      layoutNode(n.children[i], childPos, depth + 1);
    }
  }

  layoutNode(node, origin, 0);
  return results;
}

// ---------------------------------------------------------------------------
// Camera positions per zoom level
// ---------------------------------------------------------------------------

export const CAMERA_POSITIONS = {
  application: { position: [0, 20, 30] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
  orbital: { position: [0, 8, 12] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
  trait: { position: [0, 6, 10] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
  transition: { position: [0, 4, 8] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
} as const;
