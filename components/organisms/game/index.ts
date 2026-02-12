/**
 * Game Organism Components
 *
 * Complex UI patterns for game interfaces.
 * Composable isometric canvas system with hooks, utils, and types.
 *
 * @packageDocumentation
 */

// ---------------------------------------------------------------------------
// Core Canvas Components
// ---------------------------------------------------------------------------
export { IsometricCanvas, type IsometricCanvasProps } from './IsometricCanvas';
// GameCanvas3D and Three.js components are NOT barrel-exported because they depend on
// @react-three/fiber + three which are optional peer dependencies.
// Import directly from './GameCanvas3D' or './three' if needed.
//
// Example:
//   import { GameCanvas3D } from '@almadar/ui/components/organisms/game/GameCanvas3D';
//   import { TileRenderer, useAssetLoader } from '@almadar/ui/components/organisms/game/three';
export { CanvasEffect, type CanvasEffectProps, type CombatActionType } from './CanvasEffect';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type {
    IsometricTile,
    IsometricUnit,
    IsometricFeature,
    CameraState,
} from './types/isometric';
export type {
    AnimationName,
    FacingDirection,
    SpriteDirection,
    ResolvedFrame,
    UnitAnimationState,
    SpriteFrameDims,
    SpriteSheetUrls,
    AnimationDef,
} from './types/spriteAnimation';

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export { useImageCache } from './hooks/useImageCache';
export { useCamera } from './hooks/useCamera';
export {
    useSpriteAnimations,
    type UseSpriteAnimationsResult,
    type UseSpriteAnimationsOptions,
    type SheetUrlResolver,
    type FrameDimsResolver,
} from './hooks/useSpriteAnimations';

// ---------------------------------------------------------------------------
// Utils (pure functions)
// ---------------------------------------------------------------------------
export {
    isoToScreen,
    screenToIso,
    TILE_WIDTH,
    TILE_HEIGHT,
    FLOOR_HEIGHT,
    DIAMOND_TOP_Y,
    FEATURE_COLORS,
} from './utils/isometric';
export {
    inferDirection,
    resolveSheetDirection,
    getCurrentFrame,
    resolveFrame,
    createUnitAnimationState,
    transitionAnimation,
    tickAnimationState,
} from './utils/spriteAnimation';
export { SPRITE_SHEET_LAYOUT, SHEET_COLUMNS } from './utils/spriteSheetConstants';

// ---------------------------------------------------------------------------
// Retained Pattern-Compliant Components
// ---------------------------------------------------------------------------
export { GameHud, type GameHudProps, type GameHudStat, type GameHudElement } from './GameHud';
export { GameMenu, type GameMenuProps, type MenuOption } from './GameMenu';
export { GameOverScreen, type GameOverScreenProps, type GameOverStat, type GameOverAction } from './GameOverScreen';
export { InventoryPanel, type InventoryPanelProps, type InventoryItem } from './InventoryPanel';
export { DialogueBox, type DialogueBoxProps, type DialogueNode, type DialogueChoice } from './DialogueBox';
