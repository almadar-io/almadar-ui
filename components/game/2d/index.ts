/**
 * Game 2D Components (flat)
 *
 * Atoms, molecules, board organisms, templates, puzzles, editor, and physics-sim.
 * Dimension-agnostic DTO types/utils/hooks are re-surfaced from ../shared.
 *
 * @packageDocumentation
 */

// ---------------------------------------------------------------------------
// Shared (DTO types, projection/animation utils, image cache, combat effects)
// ---------------------------------------------------------------------------
export * from '../shared';

// ---------------------------------------------------------------------------
// Atoms
// ---------------------------------------------------------------------------
export { GameCard, type GameCardProps } from './GameCard';
export { HealthBar, type HealthBarProps } from './HealthBar';
export { ScoreDisplay, type ScoreDisplayProps } from './ScoreDisplay';
export { ControlButton, type ControlButtonProps } from './ControlButton';
export { Sprite, drawSprite, type SpriteProps } from './Sprite';
export { StateIndicator, type StateIndicatorProps, type StateStyle } from './StateIndicator';
export { TimerDisplay, type TimerDisplayProps } from './TimerDisplay';
export { ResourceCounter, type ResourceCounterProps } from './ResourceCounter';
export { ItemSlot, type ItemSlotProps } from './ItemSlot';
export { TurnIndicator, type TurnIndicatorProps } from './TurnIndicator';
export { ComboCounter, type ComboCounterProps } from './ComboCounter';
export { WaypointMarker, type WaypointMarkerProps } from './WaypointMarker';
export { StatusEffect, type StatusEffectProps } from './StatusEffect';
export { DamageNumber, type DamageNumberProps } from './DamageNumber';
export { DialogueBubble, type DialogueBubbleProps } from './DialogueBubble';
export { ChoiceButton, type ChoiceButtonProps } from './ChoiceButton';
export { ActionButton, type ActionButtonProps } from './ActionButton';
export { MiniMap, type MiniMapProps } from './MiniMap';

// ---------------------------------------------------------------------------
// Molecules
// ---------------------------------------------------------------------------
export { ControlGrid, type ControlGridProps, type ControlGridButton, type ControlGridKind, type DPadDirection } from './ControlGrid';
export { StatBadge, type StatBadgeProps } from './StatBadge';
export { InventoryGrid, type InventoryGridProps, type InventoryGridItem } from './InventoryGrid';
export { CardHand, type CardHandProps, type CardHandCard } from './CardHand';
export { QuestTracker, type QuestTrackerProps, type Quest } from './QuestTracker';
export { CraftingRecipe, type CraftingRecipeProps, type CraftingIngredient } from './CraftingRecipe';
export { PowerupSlots, type PowerupSlotsProps, type ActivePowerup } from './PowerupSlots';
export { GameCanvas2D, type GameCanvas2DProps } from './GameCanvas2D';
export { HealthPanel, type HealthPanelProps } from './HealthPanel';
export { ScoreBoard, type ScoreBoardProps } from './ScoreBoard';
export { ResourceBar, type ResourceBarProps, type ResourceBarResource } from './ResourceBar';
export { TurnPanel, type TurnPanelProps, type TurnPanelAction } from './TurnPanel';
export { EnemyPlate, type EnemyPlateProps, type EnemyPlateEffect } from './EnemyPlate';
export { UnitCommandBar, type UnitCommandBarProps, type UnitCommand } from './UnitCommandBar';
export { GameHud, type GameHudProps, type GameHudStat, type GameHudElement } from './GameHud';
export { DialogueBox, type DialogueBoxProps, type DialogueNode, type DialogueChoice } from './DialogueBox';
export { CombatLog, type CombatLogProps, type CombatEvent, type CombatLogEventType } from './CombatLog';
export { InventoryPanel, type InventoryPanelProps, type InventoryItem } from './InventoryPanel';
export { GameMenu, type GameMenuProps, type MenuOption } from './GameMenu';
export { GameOverScreen, type GameOverScreenProps, type GameOverStat, type GameOverAction } from './GameOverScreen';
export { PlatformerCanvas, type PlatformerCanvasProps, type PlatformerPlatform, type PlatformerPlayer } from './PlatformerCanvas';
export { IsometricCanvas, type IsometricCanvasProps } from './IsometricCanvas';
export {
    Canvas2D,
    type Canvas2DProps,
    type Projection,
    type CameraMode,
    type Platform,
    type SidePlayer,
    type TileCoord,
} from './Canvas2D';
export { useUnitSpriteAtlas } from './useUnitSpriteAtlas';

// ---------------------------------------------------------------------------
// Canvas effects organism + hook
// ---------------------------------------------------------------------------
export { CanvasEffect, type CanvasEffectProps } from './CanvasEffect';
export * from './useCanvasEffects';

// ---------------------------------------------------------------------------
// Audio System
// ---------------------------------------------------------------------------
export {
    GameAudioProvider,
    GameAudioContext,
    useGameAudioContext,
    type GameAudioProviderProps,
    type GameAudioContextValue,
} from './GameAudioProvider';
export {
    GameAudioToggle,
    type GameAudioToggleProps,
} from './GameAudioToggle';
export {
    useGameAudio,
    type AudioManifest,
    type SoundEntry,
    type GameAudioControls,
    type UseGameAudioOptions,
} from './useGameAudio';

// ---------------------------------------------------------------------------
// 2D Hooks
// ---------------------------------------------------------------------------
export { useCamera } from './useCamera';
export {
    useSpriteAnimations,
    type UseSpriteAnimationsResult,
    type UseSpriteAnimationsOptions,
    type SheetUrlResolver,
    type FrameDimsResolver,
} from './useSpriteAnimations';
export {
    usePhysics2D,
    type UsePhysics2DOptions,
    type UsePhysics2DReturn,
} from './usePhysics2D';

// ---------------------------------------------------------------------------
// Physics Managers
// ---------------------------------------------------------------------------
export {
    PhysicsManager,
    type Physics2DState,
    type PhysicsBounds,
    type PhysicsConfig,
} from './PhysicsManager';

// ---------------------------------------------------------------------------
// Board Organisms (game-logic containers — templates are thin wrappers)
// ---------------------------------------------------------------------------
export {
    BattleBoard,
    type BattleBoardProps,
    type BattlePhase,
    type BattleSlotContext,
} from './BattleBoard';
export {
    UncontrolledBattleBoard,
    type UncontrolledBattleBoardProps,
} from './UncontrolledBattleBoard';
export {
    useBattleState,
    type BattleStateEventConfig,
    type BattleStateCallbacks,
    type BattleStateResult,
} from './useBattleState';
export {
    WorldMapBoard,
    type WorldMapBoardProps,
    type WorldMapSlotContext,
} from './WorldMapBoard';
export {
    CastleBoard,
    type CastleBoardProps,
    type CastleSlotContext,
} from './CastleBoard';
export {
    PlatformerBoard,
    type PlatformerBoardProps,
} from './PlatformerBoard';
export {
    TowerDefenseBoard,
    type TowerDefenseBoardProps,
} from './TowerDefenseBoard';
export {
    RoguelikeBoard,
    type RoguelikeBoardProps,
} from './RoguelikeBoard';
export {
    TopDownShooterBoard,
    type TopDownShooterBoardProps,
} from './TopDownShooterBoard';
export {
    CityBuilderBoard,
    type CityBuilderBoardProps,
} from './CityBuilderBoard';
export {
    VisualNovelBoard,
    type VisualNovelBoardProps,
    type VisualNovelNode,
    type VisualNovelChoice,
} from './VisualNovelBoard';
export {
    CardBattlerBoard,
    type CardBattlerBoardProps,
    type CardBattlerCard,
} from './CardBattlerBoard';
export {
    HexStrategyBoard,
    type HexStrategyBoardProps,
} from './HexStrategyBoard';
export { RacingBoard, type RacingBoardProps } from './RacingBoard';
export { TanksBoard, type TanksBoardProps } from './TanksBoard';
export { SpaceShmupBoard, type SpaceShmupBoardProps } from './SpaceShmupBoard';
export { SportsBoard, type SportsBoardProps } from './SportsBoard';
export { SokobanBoard, type SokobanBoardProps } from './SokobanBoard';
export { BoardgameBoard, type BoardgameBoardProps } from './BoardgameBoard';
export { PirateBoard, type PirateBoardProps } from './PirateBoard';
export { PinballBoard, type PinballBoardProps } from './PinballBoard';
export { FishingBoard, type FishingBoardProps } from './FishingBoard';
export { MatchPuzzleBoard, type MatchPuzzleBoardProps } from './MatchPuzzleBoard';
export { HolidayRunnerBoard, type HolidayRunnerBoardProps } from './HolidayRunnerBoard';
export { MinigolfBoard, type MinigolfBoardProps } from './MinigolfBoard';
export { SpaceStationBoard, type SpaceStationBoardProps } from './SpaceStationBoard';

// ---------------------------------------------------------------------------
// Trait / State Machine Visualization
// ---------------------------------------------------------------------------
export {
    TraitStateViewer,
    type TraitStateViewerProps,
    type TraitStateMachineDefinition,
    type TraitTransition,
} from './TraitStateViewer';
export {
    TraitSlot,
    type TraitSlotProps,
    type SlotItemData,
} from './TraitSlot';

// ---------------------------------------------------------------------------
// Editor Utilities (Storybook map editor components)
// ---------------------------------------------------------------------------
export {
    CollapsibleSection,
    EditorSlider,
    EditorSelect,
    EditorCheckbox,
    EditorTextInput,
    StatusBar,
    TerrainPalette,
    EditorToolbar,
    TERRAIN_COLORS,
    FEATURE_TYPES,
    type EditorMode,
    type CollapsibleSectionProps,
    type EditorSliderProps,
    type EditorSelectProps,
    type EditorCheckboxProps,
    type EditorTextInputProps,
    type StatusBarProps,
    type TerrainPaletteProps,
    type EditorToolbarProps,
} from './editorUtils';

// ---------------------------------------------------------------------------
// Puzzle Board Organisms
// ---------------------------------------------------------------------------
// Sequencer (ages 5-8)
export { ActionTile, type ActionTileProps } from './ActionTile';
export { ActionPalette, type ActionPaletteProps } from './ActionPalette';
export { SequenceBar, type SequenceBarProps } from './SequenceBar';
export { SequencerBoard, type SequencerBoardProps } from './SequencerBoard';
// Event Handler (ages 9-12)
export { RuleEditor, type RuleEditorProps, type RuleDefinition } from './RuleEditor';
export { EventLog, type EventLogProps, type EventLogEntry } from './EventLog';
export { ObjectRulePanel, type ObjectRulePanelProps } from './ObjectRulePanel';
export { EventHandlerBoard, type EventHandlerBoardProps } from './EventHandlerBoard';
export * from './puzzleObject';
// State Architect (ages 13+)
export { StateNode, type StateNodeProps } from './StateNode';
export { TransitionArrow, type TransitionArrowProps } from './TransitionArrow';
export { VariablePanel, type VariablePanelProps } from './VariablePanel';
export { StateJsonView, type StateJsonViewProps } from './StateJsonView';
export {
    StateArchitectBoard,
    type StateArchitectBoardProps,
    type StateArchitectTransition,
    type TestCase,
} from './StateArchitectBoard';
// Simulator
export { SimulatorBoard, type SimulatorBoardProps, type SimulatorParameter } from './SimulatorBoard';
// Classifier
export { ClassifierBoard, type ClassifierBoardProps, type ClassifierItem, type ClassifierCategory } from './ClassifierBoard';
// Builder
export { BuilderBoard, type BuilderBoardProps, type BuilderComponent, type BuilderSlot } from './BuilderBoard';
// Debugger
export { DebuggerBoard, type DebuggerBoardProps, type DebuggerLine } from './DebuggerBoard';
// Negotiator
export { NegotiatorBoard, type NegotiatorBoardProps, type NegotiatorAction, type PayoffEntry } from './NegotiatorBoard';

// ---------------------------------------------------------------------------
// Physics Simulation (educational presets)
// ---------------------------------------------------------------------------
export { SimulationCanvas, type SimulationCanvasProps } from './SimulationCanvas';
export { SimulationControls, type SimulationControlsProps } from './SimulationControls';
export { SimulationGraph, type SimulationGraphProps, type MeasurementPoint } from './SimulationGraph';
export type { PhysicsPreset, PhysicsBody, PhysicsConstraint } from './types';
export { projectileMotion, pendulum, springOscillator, ALL_PRESETS } from './physicsPresets';

// ---------------------------------------------------------------------------
// Templates (thin wrappers — header + Board organism)
// ---------------------------------------------------------------------------
export { GameTemplate, type GameTemplateProps } from './GameTemplate';
export { GameShell, type GameShellProps } from './GameShell';
export { BattleTemplate, type BattleTemplateProps } from './BattleTemplate';
export { CastleTemplate, type CastleTemplateProps } from './CastleTemplate';
export { WorldMapTemplate, type WorldMapTemplateProps } from './WorldMapTemplate';
export { PlatformerTemplate, type PlatformerTemplateProps } from './PlatformerTemplate';
export { TowerDefenseTemplate, type TowerDefenseTemplateProps } from './TowerDefenseTemplate';
export { RoguelikeTemplate, type RoguelikeTemplateProps } from './RoguelikeTemplate';
export { TopDownShooterTemplate, type TopDownShooterTemplateProps } from './TopDownShooterTemplate';
export { CityBuilderTemplate, type CityBuilderTemplateProps } from './CityBuilderTemplate';
export { VisualNovelTemplate, type VisualNovelTemplateProps } from './VisualNovelTemplate';
export { CardBattlerTemplate, type CardBattlerTemplateProps } from './CardBattlerTemplate';
