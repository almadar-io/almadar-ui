/**
 * CastleBoard
 *
 * Self-contained castle / base-management game board organism. Encapsulates all
 * isometric canvas rendering, hover/selection state, and slot-based layout.
 * Designed to be consumed by CastleTemplate (thin wrapper) or embedded directly
 * in any page that needs an isometric castle view.
 *
 * Accepts an `entity` prop conforming to `CastleEntity` and optional declarative
 * event props (`featureClickEvent`, `unitClickEvent`, `tileClickEvent`) that
 * emit through the Orbital event bus.
 *
 * @packageDocumentation
 */
import React from 'react';
import type { IsometricTile, IsometricUnit, IsometricFeature } from './types/isometric';
/** Entity shape consumed by CastleBoard */
export interface CastleEntity {
    id: string;
    tiles: IsometricTile[];
    features?: IsometricFeature[];
    units?: IsometricUnit[];
    assetManifest?: {
        baseUrl: string;
        terrains?: Record<string, string>;
        units?: Record<string, string>;
        features?: Record<string, string>;
    };
    backgroundImage?: string;
}
/** Context exposed to render-prop slots */
export interface CastleSlotContext {
    /** Currently hovered tile coordinates (null when not hovering) */
    hoveredTile: {
        x: number;
        y: number;
    } | null;
    /** Feature that sits on the hovered tile, if any */
    hoveredFeature: IsometricFeature | null;
    /** Unit that sits on the hovered tile, if any */
    hoveredUnit: IsometricUnit | null;
    /** The clicked feature (e.g. building) for detail view */
    selectedFeature: IsometricFeature | null;
    /** Clear selected feature */
    clearSelection: () => void;
    /** Resolve screen position for overlay positioning */
    tileToScreen: (x: number, y: number) => {
        x: number;
        y: number;
    };
    /** Canvas scale */
    scale: number;
}
export interface CastleBoardProps {
    /** Castle entity data */
    entity: CastleEntity;
    /** Canvas render scale */
    scale?: number;
    /** Top bar / header */
    header?: (ctx: CastleSlotContext) => React.ReactNode;
    /** Side panel content (buildings list, recruit tab, garrison tab) */
    sidePanel?: (ctx: CastleSlotContext) => React.ReactNode;
    /** Canvas overlay (hover tooltips, etc.) */
    overlay?: (ctx: CastleSlotContext) => React.ReactNode;
    /** Bottom bar (income summary, etc.) */
    footer?: (ctx: CastleSlotContext) => React.ReactNode;
    /** Called when a feature (building) is clicked */
    onFeatureClick?: (feature: IsometricFeature) => void;
    /** Called when a unit is clicked */
    onUnitClick?: (unit: IsometricUnit) => void;
    /** Called when any tile is clicked */
    onTileClick?: (x: number, y: number) => void;
    /** Event name to emit via event bus when a feature is clicked (emits UI:{featureClickEvent}) */
    featureClickEvent?: string;
    /** Event name to emit via event bus when a unit is clicked (emits UI:{unitClickEvent}) */
    unitClickEvent?: string;
    /** Event name to emit via event bus when a tile is clicked (emits UI:{tileClickEvent}) */
    tileClickEvent?: string;
    className?: string;
}
export declare function CastleBoard({ entity, scale, header, sidePanel, overlay, footer, onFeatureClick, onUnitClick, onTileClick, featureClickEvent, unitClickEvent, tileClickEvent, className, }: CastleBoardProps): React.JSX.Element;
export declare namespace CastleBoard {
    var displayName: string;
}
export default CastleBoard;
