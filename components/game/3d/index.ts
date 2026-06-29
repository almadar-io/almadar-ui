/**
 * Game 3D (three.js) — public code-split barrel.
 *
 * Published behind the `@almadar/ui/components/{molecules,organisms}/game/three`
 * subpath only, NEVER from the main `components/index.ts` barrel — re-exporting
 * it there would statically pull @react-three/fiber into every app's bundle.
 * The component registry lazy-imports this barrel so the 3D family stays a
 * dynamic, code-split chunk.
 *
 * @packageDocumentation
 */

// Molecules, templates, hooks, loaders, AVL-3D, and grid/culling utils.
export * from './molecules';

// Organism (not re-exported by molecules/index.ts).
export { GameBoard3D, type GameBoard3DProps } from './organisms/GameBoard3D';
