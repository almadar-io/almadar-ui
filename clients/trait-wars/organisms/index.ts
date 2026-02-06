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
export { BuildingGrid, type BuildingGridProps } from './BuildingGrid';

// High-fidelity hex grid components
export { HexGameTile, type HexGameTileProps, type HexUnit } from './HexGameTile';
export { HexGameBoard, type HexGameBoardProps, type HexBoardTile } from './HexGameBoard';

// Canvas-based isometric game
export {
    IsometricGameCanvas,
    type IsometricGameCanvasProps,
    type IsometricTile,
    type IsometricUnit,
    type IsometricFeature,
    isoToScreen,
    screenToIso,
    TILE_WIDTH,
    TILE_HEIGHT,
    FLOOR_HEIGHT,
    HORIZONTAL_OFFSET,
    VERTICAL_OFFSET
} from './IsometricGameCanvas';
