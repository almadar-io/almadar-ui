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
export * from '../../shared/index';

// ---------------------------------------------------------------------------
// Atoms
// ---------------------------------------------------------------------------
export { GameCard, type GameCardProps } from '../atoms/GameCard';
export { HealthBar, type HealthBarProps } from '../atoms/HealthBar';
export { ScoreDisplay, type ScoreDisplayProps } from '../atoms/ScoreDisplay';
export { ControlButton, type ControlButtonProps } from '../atoms/ControlButton';
export { Sprite, drawSprite, type SpriteProps } from '../atoms/Sprite';
export { StateIndicator, type StateIndicatorProps, type StateStyle } from '../atoms/StateIndicator';
export { TimerDisplay, type TimerDisplayProps } from '../atoms/TimerDisplay';
export { ResourceCounter, type ResourceCounterProps } from '../atoms/ResourceCounter';
export { ItemSlot, type ItemSlotProps } from '../atoms/ItemSlot';
export { TurnIndicator, type TurnIndicatorProps } from '../atoms/TurnIndicator';
export { ComboCounter, type ComboCounterProps } from '../atoms/ComboCounter';
export { WaypointMarker, type WaypointMarkerProps } from '../atoms/WaypointMarker';
export { StatusEffect, type StatusEffectProps } from '../atoms/StatusEffect';
export { DamageNumber, type DamageNumberProps } from '../atoms/DamageNumber';
export { DialogueBubble, type DialogueBubbleProps } from '../atoms/DialogueBubble';
export { ChoiceButton, type ChoiceButtonProps } from '../atoms/ChoiceButton';
export { ActionButton, type ActionButtonProps } from '../atoms/ActionButton';
export { MiniMap, type MiniMapProps } from '../atoms/MiniMap';

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
export {
    Canvas2D,
    type Canvas2DProps,
    type Projection,
    type CameraMode,
    type Platform,
    type SidePlayer,
    type TileCoord,
} from './Canvas2D';
export { useUnitSpriteAtlas } from '../../shared/hooks/useUnitSpriteAtlas';

// ---------------------------------------------------------------------------
// Canvas effects organism + hook
// ---------------------------------------------------------------------------
export { CanvasEffect, type CanvasEffectProps } from '../organisms/CanvasEffect';
export * from '../../shared/hooks/useCanvasEffects';

// ---------------------------------------------------------------------------
// Audio System
// ---------------------------------------------------------------------------
export {
    GameAudioProvider,
    GameAudioContext,
    useGameAudioContext,
    type GameAudioProviderProps,
    type GameAudioContextValue,
} from '../../shared/providers/GameAudioProvider';
export {
    GameAudioToggle,
    type GameAudioToggleProps,
} from '../atoms/GameAudioToggle';
export {
    useGameAudio,
    type AudioManifest,
    type SoundEntry,
    type GameAudioControls,
    type UseGameAudioOptions,
} from '../../shared/hooks/useGameAudio';

// ---------------------------------------------------------------------------
// 2D Hooks
// ---------------------------------------------------------------------------
export { useCamera } from '../../shared/hooks/useCamera';
// ---------------------------------------------------------------------------
// Board Organisms (game-logic containers — templates are thin wrappers)
// ---------------------------------------------------------------------------
export {
    BattleBoard,
    type BattleBoardProps,
    type BattlePhase,
    type BattleSlotContext,
} from '../organisms/BattleBoard';
export {
    UncontrolledBattleBoard,
    type UncontrolledBattleBoardProps,
} from '../organisms/UncontrolledBattleBoard';
export {
    useBattleState,
    type BattleStateEventConfig,
    type BattleStateCallbacks,
    type BattleStateResult,
} from '../../shared/hooks/useBattleState';
export {
    WorldMapBoard,
    type WorldMapBoardProps,
    type WorldMapSlotContext,
} from '../organisms/WorldMapBoard';
export {
    CastleBoard,
    type CastleBoardProps,
    type CastleSlotContext,
} from '../organisms/CastleBoard';
export {
    PlatformerBoard,
    type PlatformerBoardProps,
} from '../organisms/PlatformerBoard';
export {
    TowerDefenseBoard,
    type TowerDefenseBoardProps,
} from '../organisms/TowerDefenseBoard';
export {
    RoguelikeBoard,
    type RoguelikeBoardProps,
} from '../organisms/RoguelikeBoard';
export {
    TopDownShooterBoard,
    type TopDownShooterBoardProps,
} from '../organisms/TopDownShooterBoard';
export {
    CityBuilderBoard,
    type CityBuilderBoardProps,
} from '../organisms/CityBuilderBoard';
export {
    VisualNovelBoard,
    type VisualNovelBoardProps,
    type VisualNovelNode,
    type VisualNovelChoice,
} from '../organisms/VisualNovelBoard';
export {
    CardBattlerBoard,
    type CardBattlerBoardProps,
    type CardBattlerCard,
} from '../organisms/CardBattlerBoard';
export {
    HexStrategyBoard,
    type HexStrategyBoardProps,
} from '../organisms/HexStrategyBoard';
export { RacingBoard, type RacingBoardProps } from '../organisms/RacingBoard';
export { TanksBoard, type TanksBoardProps } from '../organisms/TanksBoard';
export { SpaceShmupBoard, type SpaceShmupBoardProps } from '../organisms/SpaceShmupBoard';
export { SportsBoard, type SportsBoardProps } from '../organisms/SportsBoard';
export { SokobanBoard, type SokobanBoardProps } from '../organisms/SokobanBoard';
export { BoardgameBoard, type BoardgameBoardProps } from '../organisms/BoardgameBoard';
export { PirateBoard, type PirateBoardProps } from '../organisms/PirateBoard';
export { PinballBoard, type PinballBoardProps } from '../organisms/PinballBoard';
export { FishingBoard, type FishingBoardProps } from '../organisms/FishingBoard';
export { MatchPuzzleBoard, type MatchPuzzleBoardProps } from '../organisms/MatchPuzzleBoard';
export { HolidayRunnerBoard, type HolidayRunnerBoardProps } from '../organisms/HolidayRunnerBoard';
export { MinigolfBoard, type MinigolfBoardProps } from '../organisms/MinigolfBoard';
export { SpaceStationBoard, type SpaceStationBoardProps } from '../organisms/SpaceStationBoard';

// ---------------------------------------------------------------------------
// Trait / State Machine Visualization
// ---------------------------------------------------------------------------
export {
    TraitStateViewer,
    type TraitStateViewerProps,
    type TraitStateMachineDefinition,
    type TraitTransition,
} from '../organisms/TraitStateViewer';
export {
    TraitSlot,
    type TraitSlotProps,
    type SlotItemData,
} from '../organisms/TraitSlot';

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
} from '../../shared/lib/editorUtils';

// ---------------------------------------------------------------------------
// Puzzle Board Organisms
// ---------------------------------------------------------------------------
// Sequencer (ages 5-8)
export { ActionTile, type ActionTileProps } from '../organisms/ActionTile';
export { ActionPalette, type ActionPaletteProps } from '../organisms/ActionPalette';
export { SequenceBar, type SequenceBarProps } from '../organisms/SequenceBar';
export { SequencerBoard, type SequencerBoardProps } from '../organisms/SequencerBoard';
// Event Handler (ages 9-12)
export { RuleEditor, type RuleEditorProps, type RuleDefinition } from '../organisms/RuleEditor';
export { EventLog, type EventLogProps, type EventLogEntry } from '../organisms/EventLog';
export { ObjectRulePanel, type ObjectRulePanelProps } from '../organisms/ObjectRulePanel';
export { EventHandlerBoard, type EventHandlerBoardProps } from '../organisms/EventHandlerBoard';
export * from '../../shared/lib/puzzleObject';
// State Architect (ages 13+)
export { StateNode, type StateNodeProps } from '../organisms/StateNode';
export { TransitionArrow, type TransitionArrowProps } from '../organisms/TransitionArrow';
export { VariablePanel, type VariablePanelProps } from '../organisms/VariablePanel';
export { StateJsonView, type StateJsonViewProps } from '../organisms/StateJsonView';
export {
    StateArchitectBoard,
    type StateArchitectBoardProps,
    type StateArchitectTransition,
    type TestCase,
} from '../organisms/StateArchitectBoard';
// Simulator
export { SimulatorBoard, type SimulatorBoardProps, type SimulatorParameter } from '../organisms/SimulatorBoard';
// Classifier
export { ClassifierBoard, type ClassifierBoardProps, type ClassifierItem, type ClassifierCategory } from '../organisms/ClassifierBoard';
// Builder
export { BuilderBoard, type BuilderBoardProps, type BuilderComponent, type BuilderSlot } from '../organisms/BuilderBoard';
// Debugger
export { DebuggerBoard, type DebuggerBoardProps, type DebuggerLine } from '../organisms/DebuggerBoard';
// Negotiator
export { NegotiatorBoard, type NegotiatorBoardProps, type NegotiatorAction, type PayoffEntry } from '../organisms/NegotiatorBoard';

// ---------------------------------------------------------------------------
// Physics Simulation (educational presets)
// ---------------------------------------------------------------------------
export { SimulationCanvas, type SimulationCanvasProps } from '../organisms/SimulationCanvas';
export { SimulationControls, type SimulationControlsProps } from '../organisms/SimulationControls';
export { SimulationGraph, type SimulationGraphProps, type MeasurementPoint } from '../organisms/SimulationGraph';
export type { PhysicsPreset, PhysicsBody, PhysicsConstraint } from '../../shared/lib/physicsTypes';
export { projectileMotion, pendulum, springOscillator, ALL_PRESETS } from '../../shared/lib/physicsPresets';

// ---------------------------------------------------------------------------
// Templates (thin wrappers — header + Board organism)
// ---------------------------------------------------------------------------
export { GameTemplate, type GameTemplateProps } from '../templates/GameTemplate';
export { GameShell, type GameShellProps } from '../templates/GameShell';
export { BattleTemplate, type BattleTemplateProps } from '../templates/BattleTemplate';
export { CastleTemplate, type CastleTemplateProps } from '../templates/CastleTemplate';
export { WorldMapTemplate, type WorldMapTemplateProps } from '../templates/WorldMapTemplate';
export { PlatformerTemplate, type PlatformerTemplateProps } from '../templates/PlatformerTemplate';
export { TowerDefenseTemplate, type TowerDefenseTemplateProps } from '../templates/TowerDefenseTemplate';
export { RoguelikeTemplate, type RoguelikeTemplateProps } from '../templates/RoguelikeTemplate';
export { TopDownShooterTemplate, type TopDownShooterTemplateProps } from '../templates/TopDownShooterTemplate';
export { CityBuilderTemplate, type CityBuilderTemplateProps } from '../templates/CityBuilderTemplate';
export { VisualNovelTemplate, type VisualNovelTemplateProps } from '../templates/VisualNovelTemplate';
export { CardBattlerTemplate, type CardBattlerTemplateProps } from '../templates/CardBattlerTemplate';
