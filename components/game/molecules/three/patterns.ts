/**
 * Public 3D render-ui pattern components.
 *
 * These are the three.js-backed components that authors target from `render-ui`
 * effects. They are code-split behind the optional
 * `@almadar/ui/components/molecules/game/three` subpath and are NEVER exported
 * from the main `@almadar/ui` barrel — that would pull @react-three/fiber into
 * every app's main bundle.
 *
 * The pattern scanner (tools/almadar-pattern-sync/scanner.ts) reads THIS file to
 * register these as render-ui patterns. It is the curated public surface: 3D
 * scene internals (Scene3D, Camera3D, Lighting3D, …) live in `./index.ts` for
 * the lazy loader but are intentionally absent here so they don't become
 * render-ui targets.
 */
export { GameCanvas3D } from '../GameCanvas3D';
export { GameCanvas3DBattleTemplate } from '../../templates/GameCanvas3DBattleTemplate';
export { GameCanvas3DCastleTemplate } from '../../templates/GameCanvas3DCastleTemplate';
export { GameCanvas3DWorldMapTemplate } from '../../templates/GameCanvas3DWorldMapTemplate';
