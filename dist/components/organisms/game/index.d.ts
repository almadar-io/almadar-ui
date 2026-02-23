/**
 * Game Organism Components
 *
 * Complex UI patterns for game interfaces.
 * Composable isometric canvas system with hooks, utils, and types.
 *
 * @packageDocumentation
 */
export { IsometricCanvas, type IsometricCanvasProps } from './IsometricCanvas';
export { CanvasEffect, type CanvasEffectProps, type CombatActionType } from './CanvasEffect';
export type { IsometricTile, IsometricUnit, IsometricFeature, CameraState, } from './types/isometric';
export type { AnimationName, FacingDirection, SpriteDirection, ResolvedFrame, UnitAnimationState, SpriteFrameDims, SpriteSheetUrls, AnimationDef, } from './types/spriteAnimation';
export { GameAudioProvider, GameAudioContext, useGameAudioContext, type GameAudioProviderProps, type GameAudioContextValue, } from './GameAudioProvider';
export { GameAudioToggle, type GameAudioToggleProps, } from './GameAudioToggle';
export { useGameAudio, type AudioManifest, type SoundEntry, type GameAudioControls, type UseGameAudioOptions, } from './hooks/useGameAudio';
export { useImageCache } from './hooks/useImageCache';
export { useCamera } from './hooks/useCamera';
export { useSpriteAnimations, type UseSpriteAnimationsResult, type UseSpriteAnimationsOptions, type SheetUrlResolver, type FrameDimsResolver, } from './hooks/useSpriteAnimations';
export { usePhysics2D, type UsePhysics2DOptions, type UsePhysics2DReturn, } from './hooks/usePhysics2D';
export { PhysicsManager, type Physics2DState, type PhysicsBounds, type PhysicsConfig, } from './managers/PhysicsManager';
export { isoToScreen, screenToIso, TILE_WIDTH, TILE_HEIGHT, FLOOR_HEIGHT, DIAMOND_TOP_Y, FEATURE_COLORS, } from './utils/isometric';
export { inferDirection, resolveSheetDirection, getCurrentFrame, resolveFrame, createUnitAnimationState, transitionAnimation, tickAnimationState, } from './utils/spriteAnimation';
export { SPRITE_SHEET_LAYOUT, SHEET_COLUMNS } from './utils/spriteSheetConstants';
export { GameHud, type GameHudProps, type GameHudStat, type GameHudElement } from './GameHud';
export { GameMenu, type GameMenuProps, type MenuOption } from './GameMenu';
export { GameOverScreen, type GameOverScreenProps, type GameOverStat, type GameOverAction } from './GameOverScreen';
export { InventoryPanel, type InventoryPanelProps, type InventoryItem } from './InventoryPanel';
export { DialogueBox, type DialogueBoxProps, type DialogueNode, type DialogueChoice } from './DialogueBox';
export { BattleBoard, type BattleBoardProps, type BattleEntity, type BattlePhase, type BattleUnit, type BattleTile, type BattleSlotContext, } from './BattleBoard';
export { UncontrolledBattleBoard, type UncontrolledBattleBoardProps, } from './UncontrolledBattleBoard';
export { useBattleState, type BattleStateEventConfig, type BattleStateCallbacks, type BattleStateResult, } from './hooks/useBattleState';
export { WorldMapBoard, type WorldMapBoardProps, type WorldMapEntity, type MapHero, type MapHex, type WorldMapSlotContext, } from './WorldMapBoard';
export { CastleBoard, type CastleBoardProps, type CastleEntity, type CastleSlotContext, } from './CastleBoard';
export { TraitStateViewer, type TraitStateViewerProps, type TraitStateMachineDefinition, type TraitTransition, } from './TraitStateViewer';
export { TraitSlot, type TraitSlotProps, type SlotItemData, } from './TraitSlot';
export { CollapsibleSection, EditorSlider, EditorSelect, EditorCheckbox, EditorTextInput, StatusBar, TerrainPalette, EditorToolbar, TERRAIN_COLORS, FEATURE_TYPES, type EditorMode, type CollapsibleSectionProps, type EditorSliderProps, type EditorSelectProps, type EditorCheckboxProps, type EditorTextInputProps, type StatusBarProps, type TerrainPaletteProps, type EditorToolbarProps, } from './editor';
