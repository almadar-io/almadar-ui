/**
 * Trait Wars Molecules
 *
 * Composite components for the Trait Wars game.
 */

export { UnitCard, type UnitCardProps, type UnitEntity, type UnitTrait } from './UnitCard';
export { ActionMenu, type ActionMenuProps, type GameAction } from './ActionMenu';
export { TurnIndicator, type TurnIndicatorProps, type GamePhase as TurnPhase, type PlayerInfo } from './TurnIndicator';
export { GameUnit, type GameUnitProps } from './GameUnit';
export { TraitStateViewer, type TraitStateViewerProps, type TraitStateMachineDefinition, type TraitTransition } from './TraitStateViewer';
// Deprecated: use TraitStateMachineDefinition from molecules or TraitDefinition from organisms
export type { TraitDefinition as TraitViewerDefinition } from './TraitStateViewer';

