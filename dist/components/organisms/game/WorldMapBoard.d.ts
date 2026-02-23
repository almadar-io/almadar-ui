/**
 * WorldMapBoard
 *
 * Organism for the strategic world-map view.  Renders an isometric hex/iso
 * map with hero selection, movement animation, and encounter callbacks.
 * Game-specific panels (hero detail, hero lists, resource bars) are injected
 * via render-prop slots.
 *
 * **State categories (closed-circuit compliant):**
 * - Game data (hexes, heroes, selectedHeroId, features) → received via
 *   `entity` prop; the Orbital trait owns this state.
 * - Rendering state (hoveredTile, movingPositions animation) → local only.
 * - Events → emitted via `useEventBus()` for trait integration.
 *
 * This component is mostly prop-driven.  The only internal state is hover
 * tracking and movement animation interpolation, both of which are
 * rendering-only concerns that cannot (and should not) be externalised.
 *
 * @packageDocumentation
 */
import React from 'react';
import type { IsometricFeature } from './types/isometric';
import type { ResolvedFrame } from './types/spriteAnimation';
/** A hero on the world map */
export interface MapHero {
    id: string;
    name: string;
    owner: 'player' | 'enemy' | string;
    position: {
        x: number;
        y: number;
    };
    movement: number;
    sprite?: string;
    level?: number;
}
/** A hex on the map */
export interface MapHex {
    x: number;
    y: number;
    terrain: string;
    terrainSprite?: string;
    feature?: string;
    featureData?: Record<string, unknown>;
    passable?: boolean;
}
/** Context exposed to render-prop slots */
export interface WorldMapSlotContext {
    /** Currently hovered tile */
    hoveredTile: {
        x: number;
        y: number;
    } | null;
    /** Hex at the hovered tile */
    hoveredHex: MapHex | null;
    /** Hero at the hovered tile */
    hoveredHero: MapHero | null;
    /** Currently selected hero */
    selectedHero: MapHero | null;
    /** Valid move tiles for selected hero */
    validMoves: Array<{
        x: number;
        y: number;
    }>;
    /** Selects a hero */
    selectHero: (id: string) => void;
    /** Resolve screen position of a tile for overlays */
    tileToScreen: (x: number, y: number) => {
        x: number;
        y: number;
    };
    /** Canvas scale */
    scale: number;
}
/** Entity shape for the WorldMapBoard */
export interface WorldMapEntity {
    id: string;
    hexes: MapHex[];
    heroes: MapHero[];
    features?: IsometricFeature[];
    selectedHeroId?: string | null;
    assetManifest?: {
        baseUrl: string;
        terrains?: Record<string, string>;
        units?: Record<string, string>;
        features?: Record<string, string>;
    };
    backgroundImage?: string;
}
export interface WorldMapBoardProps {
    /** World map entity data */
    entity: WorldMapEntity;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Canvas render scale */
    scale?: number;
    /** Unit draw-size multiplier */
    unitScale?: number;
    /** Allow selecting / moving ALL heroes (including enemy). For testing. */
    allowMoveAllHeroes?: boolean;
    /** Custom movement range validator */
    isInRange?: (from: {
        x: number;
        y: number;
    }, to: {
        x: number;
        y: number;
    }, range: number) => boolean;
    /** Emits UI:{heroSelectEvent} with { heroId } */
    heroSelectEvent?: string;
    /** Emits UI:{heroMoveEvent} with { heroId, toX, toY } */
    heroMoveEvent?: string;
    /** Emits UI:{battleEncounterEvent} with { attackerId, defenderId } */
    battleEncounterEvent?: string;
    /** Emits UI:{featureEnterEvent} with { heroId, feature, hex } */
    featureEnterEvent?: string;
    /** Emits UI:{tileClickEvent} with { x, y } */
    tileClickEvent?: string;
    /** Header / top bar */
    header?: (ctx: WorldMapSlotContext) => React.ReactNode;
    /** Side panel (hero detail, hero lists, etc.) */
    sidePanel?: (ctx: WorldMapSlotContext) => React.ReactNode;
    /** Canvas overlay (tooltips, popups) */
    overlay?: (ctx: WorldMapSlotContext) => React.ReactNode;
    /** Footer */
    footer?: (ctx: WorldMapSlotContext) => React.ReactNode;
    onHeroSelect?: (heroId: string) => void;
    onHeroMove?: (heroId: string, toX: number, toY: number) => void;
    /** Called when hero clicks an enemy hero tile */
    onBattleEncounter?: (attackerId: string, defenderId: string) => void;
    /** Called when hero enters a feature hex (castle, resource, etc.) */
    onFeatureEnter?: (heroId: string, hex: MapHex) => void;
    /** Override for the diamond-top Y offset within tile sprites (default: 374). */
    diamondTopY?: number;
    /** Disable pan/zoom camera (default: true). Set false for fixed maps where overlay labels need stable positions. */
    enableCamera?: boolean;
    effectSpriteUrls?: string[];
    resolveUnitFrame?: (unitId: string) => ResolvedFrame | null;
    className?: string;
}
export declare function WorldMapBoard({ entity, scale, unitScale, allowMoveAllHeroes, isInRange, heroSelectEvent, heroMoveEvent, battleEncounterEvent, featureEnterEvent, tileClickEvent, header, sidePanel, overlay, footer, onHeroSelect, onHeroMove, onBattleEncounter, onFeatureEnter, diamondTopY, enableCamera, effectSpriteUrls, resolveUnitFrame, className, }: WorldMapBoardProps): React.JSX.Element;
export declare namespace WorldMapBoard {
    var displayName: string;
}
export default WorldMapBoard;
