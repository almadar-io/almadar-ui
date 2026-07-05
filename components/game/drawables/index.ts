/**
 * Neutral drawable primitives — the `children` vocabulary of the canvas draw-host.
 *
 * ATOMS: `sprite` (image/atlas frame), `shape` (rect/cell/ellipse/poly), `text`.
 * MOLECULES: `sprite-layer`, `shape-layer` (batches, O(layers)).
 * Each ships BOTH painters: 2D through the portable `Painter2D` seam (`Projector`
 * maps a core `ScenePos` to pixels), and 3D as an R3F mesh (`Projector3D` maps to
 * world, `Drawable3D` dispatches). Genre (unit/tile/highlight) is a `.lolo`
 * composition of these, never a component here. `DRAWABLE_MODES` records the
 * drawable capability the compiler validates canvas children against.
 */
export * from './types';
export * from './projector';
export * from './projector3d';
export * from './sprite';
export * from './shape';
export * from './text';
export * from './spriteLayer';
export * from './shapeLayer';
export * from './sprite3d';
export * from './shape3d';
export * from './text3d';
export * from './Drawable3D';
export * from './paintRegistry';
