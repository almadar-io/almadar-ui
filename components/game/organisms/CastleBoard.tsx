'use client';
/**
 * CastleBoard
 *
 * Self-contained castle / base-management game board organism. Encapsulates all
 * isometric canvas rendering, hover/selection state, and slot-based layout.
 * Designed to be consumed by CastleTemplate (thin wrapper) or embedded directly
 * in any page that needs an isometric castle view.
 *
 * Accepts an `entity` prop (`EntityRow`) and optional declarative event props
 * (`featureClickEvent`, `unitClickEvent`, `tileClickEvent`) that emit through
 * the Orbital event bus.
 *
 * @packageDocumentation
 */

import React, { useState, useMemo, useCallback } from 'react';
import type { AssetUrl, EventEmit, EntityRow } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import IsometricCanvas from './IsometricCanvas';
import type {
    IsometricTile,
    IsometricUnit,
    IsometricFeature,
} from './types/isometric';
import { boardEntity } from './boardEntity';
import { isoToScreen, TILE_WIDTH, FLOOR_HEIGHT } from './utils/isometric';

// =============================================================================
// Types
// =============================================================================

/** Manifest of asset base-url + per-kind sprite maps (UI value DTO). */
type CastleAssetManifest = {
    baseUrl?: AssetUrl;
    terrains?: Record<string, AssetUrl>;
    units?: Record<string, AssetUrl>;
    features?: Record<string, AssetUrl>;
};

/** Context exposed to render-prop slots */
export type CastleSlotContext = {
    /** Currently hovered tile coordinates (null when not hovering) */
    hoveredTile: { x: number; y: number } | null;
    /** Feature that sits on the hovered tile, if any */
    hoveredFeature: IsometricFeature | null;
    /** Unit that sits on the hovered tile, if any */
    hoveredUnit: IsometricUnit | null;
    /** The clicked feature (e.g. building) for detail view */
    selectedFeature: IsometricFeature | null;
    /** Clear selected feature */
    clearSelection: () => void;
    /** Resolve screen position for overlay positioning */
    tileToScreen: (x: number, y: number) => { x: number; y: number };
    /** Canvas scale */
    scale: number;
};

export interface CastleBoardProps {
    /** Castle board-state entity (single row or array). The board reads
     *  `tiles` / `features` / `units` arrays plus an `assetManifest` off it. */
    entity?: EntityRow | readonly EntityRow[];
    /** Direct tile data — takes priority over entity-derived tiles. */
    tiles?: IsometricTile[];
    /** Direct unit data — takes priority over entity-derived units. */
    units?: IsometricUnit[];
    /** Direct feature data — takes priority over entity-derived features. */
    features?: IsometricFeature[];
    /** Direct asset manifest — takes priority over entity-derived manifest. */
    assetManifest?: CastleAssetManifest;
    /** Canvas render scale */
    scale?: number;

    // -- Render-prop slots --
    /** Top bar / header */
    header?: (ctx: CastleSlotContext) => React.ReactNode;
    /** Side panel content (buildings list, recruit tab, garrison tab) */
    sidePanel?: (ctx: CastleSlotContext) => React.ReactNode;
    /** Canvas overlay (hover tooltips, etc.) */
    overlay?: (ctx: CastleSlotContext) => React.ReactNode;
    /** Bottom bar (income summary, etc.) */
    footer?: (ctx: CastleSlotContext) => React.ReactNode;

    // -- Callback overrides --
    /** Called when a feature (building) is clicked */
    onFeatureClick?: (feature: IsometricFeature) => void;
    /** Called when a unit is clicked */
    onUnitClick?: (unit: IsometricUnit) => void;
    /** Called when any tile is clicked */
    onTileClick?: (x: number, y: number) => void;

    // -- Declarative event props --
    /** Event name to emit via event bus when a feature is clicked (emits UI:{featureClickEvent}) */
    featureClickEvent?: EventEmit<{ featureId: string; featureType: string; x: number; y: number }>;
    /** Event name to emit via event bus when a unit is clicked (emits UI:{unitClickEvent}) */
    unitClickEvent?: EventEmit<{ unitId: string }>;
    /** Event name to emit via event bus when a tile is clicked (emits UI:{tileClickEvent}) */
    tileClickEvent?: EventEmit<{ x: number; y: number }>;

    className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function CastleBoard({
    entity,
    tiles: propTiles,
    units: propUnits,
    features: propFeatures,
    assetManifest: propAssetManifest,
    scale = 0.45,
    header,
    sidePanel,
    overlay,
    footer,
    onFeatureClick,
    onUnitClick,
    onTileClick,
    featureClickEvent,
    unitClickEvent,
    tileClickEvent,
    className,
}: CastleBoardProps): React.JSX.Element {
    const eventBus = useEventBus();

    // Resolve the single board-state row, then read defensively so a missing
    // entity yields empty collections rather than throwing. Direct props win.
    const resolved = boardEntity(entity);
    const tiles = propTiles ?? (Array.isArray(resolved?.tiles) ? resolved.tiles : []) as unknown as IsometricTile[];
    const features = propFeatures ?? (Array.isArray(resolved?.features) ? resolved.features : []) as unknown as IsometricFeature[];
    const units = propUnits ?? (Array.isArray(resolved?.units) ? resolved.units : []) as unknown as IsometricUnit[];
    const assetManifest = propAssetManifest ?? resolved?.assetManifest as CastleAssetManifest | undefined;
    const backgroundImage = resolved?.backgroundImage as string | undefined;

    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
    const [selectedFeature, setSelectedFeature] = useState<IsometricFeature | null>(null);

    // -- Derived hover state ------------------------------------------------
    const hoveredFeature = useMemo(() => {
        if (!hoveredTile) return null;
        return features.find(f => f.x === hoveredTile.x && f.y === hoveredTile.y) ?? null;
    }, [hoveredTile, features]);

    const hoveredUnit = useMemo(() => {
        if (!hoveredTile) return null;
        return units.find(
            u => u.position?.x === hoveredTile.x && u.position?.y === hoveredTile.y,
        ) ?? null;
    }, [hoveredTile, units]);

    // -- Tile-to-screen helper ----------------------------------------------
    const maxY = Math.max(...tiles.map(t => t.y), 0);
    const baseOffsetX = (maxY + 1) * (TILE_WIDTH * scale / 2);
    const tileToScreen = useCallback(
        (tx: number, ty: number) => isoToScreen(tx, ty, scale, baseOffsetX),
        [scale, baseOffsetX],
    );

    // -- Handlers -----------------------------------------------------------
    const handleTileClick = useCallback((x: number, y: number) => {
        // Check if a feature sits at this tile
        const feature = features.find(f => f.x === x && f.y === y);
        if (feature) {
            setSelectedFeature(feature);
            onFeatureClick?.(feature);
            if (featureClickEvent) {
                eventBus.emit(`UI:${featureClickEvent}`, {
                    featureId: feature.id ?? '',
                    featureType: feature.type,
                    x: feature.x,
                    y: feature.y,
                });
            }
        }
        onTileClick?.(x, y);
        if (tileClickEvent) {
            eventBus.emit(`UI:${tileClickEvent}`, { x, y });
        }
    }, [features, onFeatureClick, onTileClick, featureClickEvent, tileClickEvent, eventBus]);

    const handleUnitClick = useCallback((unitId: string) => {
        const unit = units.find(u => u.id === unitId);
        if (unit) {
            onUnitClick?.(unit);
            if (unitClickEvent) {
                eventBus.emit(`UI:${unitClickEvent}`, { unitId: unit.id });
            }
        }
    }, [units, onUnitClick, unitClickEvent, eventBus]);

    const clearSelection = useCallback(() => setSelectedFeature(null), []);

    // -- Slot context -------------------------------------------------------
    const ctx: CastleSlotContext = useMemo(
        () => ({
            hoveredTile,
            hoveredFeature,
            hoveredUnit,
            selectedFeature,
            clearSelection,
            tileToScreen,
            scale,
        }),
        [hoveredTile, hoveredFeature, hoveredUnit, selectedFeature, clearSelection, tileToScreen, scale],
    );

    return (
        <div className={cn('castle-board min-h-screen flex flex-col bg-background', className)}>
            {/* Header slot */}
            {header && header(ctx)}

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Canvas area */}
                <div className="flex-1 overflow-auto p-4 relative">
                    <IsometricCanvas
                        tiles={tiles}
                        units={units}
                        features={features}
                        hoveredTile={hoveredTile}
                        onTileClick={handleTileClick}
                        onUnitClick={handleUnitClick}
                        onTileHover={(x, y) => setHoveredTile({ x, y })}
                        onTileLeave={() => setHoveredTile(null)}
                        scale={scale}
                        assetBaseUrl={assetManifest?.baseUrl}
                        assetManifest={assetManifest}
                        backgroundImage={backgroundImage}
                    />

                    {/* Canvas overlay slot (tooltips, popups) */}
                    {overlay && overlay(ctx)}
                </div>

                {/* Side panel slot */}
                {sidePanel && (
                    <div className="w-96 shrink-0 border-l border-border bg-surface overflow-y-auto">
                        {sidePanel(ctx)}
                    </div>
                )}
            </div>

            {/* Footer slot */}
            {footer && footer(ctx)}
        </div>
    );
}

CastleBoard.displayName = 'CastleBoard';

export default CastleBoard;
