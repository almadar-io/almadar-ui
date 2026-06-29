/**
 * Curated list of the PUBLIC 3D (Three.js) render-ui pattern components.
 *
 * The 3D family is a code-split optional surface (published via the
 * `@almadar/ui/components/{organisms,molecules}/game/three` subpath, never in
 * the main barrel — that would pull @react-three/fiber into every app). This
 * file is the source of truth for WHICH 3D components are render-ui patterns:
 * `pattern-sync` discovers `patterns.ts` files by walking the tree and admits
 * exactly the names listed here, so the 3D scene internals re-exported alongside
 * them (Scene3D, Camera3D, Lighting3D, ModelLoader, Canvas3D, …) do NOT leak in
 * as factory patterns. Move this file anywhere under `components/` and the
 * scanner still finds it.
 *
 * @packageDocumentation
 */

export { GameCanvas3D } from './molecules/GameCanvas3D';
export { GameBoard3D } from './organisms/GameBoard3D';
export { GameCanvas3DBattleTemplate } from './templates/GameCanvas3DBattleTemplate';
export { GameCanvas3DCastleTemplate } from './templates/GameCanvas3DCastleTemplate';
export { GameCanvas3DWorldMapTemplate } from './templates/GameCanvas3DWorldMapTemplate';
