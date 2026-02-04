/**
 * Trait Wars Organisms
 *
 * Complex feature components for the Trait Wars game.
 */

export { HexGrid, type HexGridProps, type HexTileEntity, type GridUnit } from './HexGrid';
export { CombatLog, type CombatLogProps, type CombatEvent, type CombatEventType } from './CombatLog';
export { TraitPanel, type TraitPanelProps, type TraitDefinition } from './TraitPanel';
export { GameTile, type GameTileProps, type TileUnit } from './GameTile';
export { GameBoard, type GameBoardProps } from './GameBoard';
export { GameBoardWithTraits, type GameBoardWithTraitsProps, type CombatLogEntry } from './GameBoardWithTraits';

// High-fidelity hex grid components
export { HexGameTile, type HexGameTileProps, type HexUnit } from './HexGameTile';
export { HexGameBoard, type HexGameBoardProps, type HexBoardTile } from './HexGameBoard';
