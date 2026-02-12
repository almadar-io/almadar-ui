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
export {
    GameCanvas3D,
    type GameCanvas3DProps,
    type GameCanvas3DHandle,
    type CameraMode,
    type MapOrientation,
    type OverlayControl,
    type UnitAnimationState,
} from './GameCanvas3D';
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
