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

import React, { useState, useMemo, useCallback, useRef, useId } from 'react';
import type { Asset, EventEmit, EntityRow, EntityWith } from '@almadar/core';
import { makeAsset } from '../../shared/makeAsset';
import { cn } from '../../../../lib/cn';
import { useEventBus } from '../../../../hooks/useEventBus';
import { useTranslate } from '../../../../hooks/useTranslate';
import { Box } from '../../../core/atoms/Box';
import { Button } from '../../../core/atoms/Button';
import { Typography } from '../../../core/atoms/Typography';
import { VStack } from '../../../core/atoms/Stack';
import { Canvas2D } from '../molecules/Canvas2D';
import { useEventListener } from '../../../../hooks/useEventBus';
import type {
    IsometricTile,
    IsometricUnit,
    IsometricFeature,
} from '../../shared/isometricTypes';
import { boardEntity, num, str, rows } from '../../shared/boardEntity';
import { isoToScreen, TILE_WIDTH, FLOOR_HEIGHT } from '../../shared/isometric';

// =============================================================================
// Types
// =============================================================================

/** Manifest of per-kind sprite maps (UI value DTO). */
type CastleAssetManifest = {
    terrains?: Record<string, Asset>;
    units?: Record<string, Asset>;
    features?: Record<string, Asset>;
};

/** Typed entity row for the castle board — fields this board reads off the entity. */
type CastleBoardEntity = EntityWith<{
    tiles?: IsometricTile[];
    features?: IsometricFeature[];
    units?: IsometricUnit[];
    assetManifest?: CastleAssetManifest;
    backgroundImage?: string;
    gold?: number;
    health?: number;
    maxHealth?: number;
    wave?: number;
    tickCount?: number;
    buildings?: EntityRow[];
    result?: string;
}>;

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
    // -- Model-owned resource state (lolo sets these on @entity) --
    gold: number;
    health: number;
    maxHealth: number;
    wave: number;
    tickCount: number;
    buildings: readonly EntityRow[];
    result: 'none' | 'victory' | 'defeat';
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
    /** Emits UI:{playAgainEvent} with {} on play again / reset */
    playAgainEvent?: EventEmit<Record<string, never>>;

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
    playAgainEvent,
    className,
}: CastleBoardProps): React.JSX.Element {
    const eventBus = useEventBus();
    const { t } = useTranslate();

    // Synthetic internal event names for canvas hover/leave.
    const boardId = useId();
    const internalTileHoverEvent = `castle.tileHover.${boardId}`;
    const internalTileLeaveEvent = `castle.tileLeave.${boardId}`;

    // Resolve the single board-state row, then read defensively so a missing
    // entity yields empty collections rather than throwing. Direct props win.
    const resolved = boardEntity(entity) as CastleBoardEntity | undefined;
    const tiles = propTiles ?? (resolved?.tiles ?? []);
    const features = propFeatures ?? (resolved?.features ?? []);
    const units = propUnits ?? (resolved?.units ?? []);
    const assetManifest = propAssetManifest ?? resolved?.assetManifest;
    const backgroundImage = resolved?.backgroundImage;

    // -- Model-owned resource state (set by lolo on every TICK/BUILD/etc) ------
    const gold = num(resolved?.gold);
    const health = num(resolved?.health);
    const maxHealth = num(resolved?.maxHealth);
    const wave = num(resolved?.wave);
    const tickCount = num(resolved?.tickCount);
    const buildings = rows(resolved?.buildings);
    const result = (str(resolved?.result) || 'none') as 'none' | 'victory' | 'defeat';

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

    // Live refs to avoid stale closures in event listeners.
    const featuresRef = useRef(features);
    featuresRef.current = features;
    const unitsRef = useRef(units);
    unitsRef.current = units;

    // -- Tile-click: Canvas2D emits tileClickEvent; listen for feature detection + callbacks ──
    useEventListener(tileClickEvent ? `UI:${tileClickEvent}` : '__castle_tile_click_noop__', useCallback((evt) => {
        const x = (evt.payload as { x?: number; y?: number })?.x;
        const y = (evt.payload as { x?: number; y?: number })?.y;
        if (x == null || y == null) return;
        const feature = featuresRef.current.find(f => f.x === x && f.y === y);
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
    }, [onFeatureClick, featureClickEvent, onTileClick, eventBus]));

    // -- Unit-click: Canvas2D emits unitClickEvent; listen for onUnitClick callback ──
    useEventListener(unitClickEvent ? `UI:${unitClickEvent}` : '__castle_unit_click_noop__', useCallback((evt) => {
        const unitId = (evt.payload as { unitId?: string })?.unitId;
        if (!unitId) return;
        const unit = unitsRef.current.find(u => u.id === unitId);
        if (unit) {
            onUnitClick?.(unit);
        }
    }, [onUnitClick]));

    // -- Hover/leave listeners for local hover state ──
    useEventListener(`UI:${internalTileHoverEvent}`, useCallback((evt) => {
        const x = (evt.payload as { x?: number; y?: number })?.x;
        const y = (evt.payload as { x?: number; y?: number })?.y;
        if (x != null && y != null) setHoveredTile({ x, y });
    }, []));

    useEventListener(`UI:${internalTileLeaveEvent}`, useCallback(() => {
        setHoveredTile(null);
    }, []));

    const clearSelection = useCallback(() => setSelectedFeature(null), []);

    const handlePlayAgain = useCallback(() => {
        if (playAgainEvent) {
            eventBus.emit(`UI:${playAgainEvent}`, {});
        }
    }, [playAgainEvent, eventBus]);

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
            gold,
            health,
            maxHealth,
            wave,
            tickCount,
            buildings,
            result,
        }),
        [hoveredTile, hoveredFeature, hoveredUnit, selectedFeature, clearSelection, tileToScreen, scale, gold, health, maxHealth, wave, tickCount, buildings, result],
    );

    return (
        <div className={cn('castle-board relative min-h-screen flex flex-col bg-background', className)}>
            {/* Header slot */}
            {header && header(ctx)}

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Canvas area */}
                <div className="flex-1 overflow-auto p-4 relative">
                    <Canvas2D
                        projection="isometric"
                        tiles={tiles}
                        units={units}
                        features={features}
                        hoveredTile={hoveredTile}
                        tileClickEvent={tileClickEvent}
                        unitClickEvent={unitClickEvent}
                        tileHoverEvent={internalTileHoverEvent}
                        tileLeaveEvent={internalTileLeaveEvent}
                        scale={scale}
                        assetManifest={assetManifest}
                        backgroundImage={backgroundImage ? makeAsset(backgroundImage, 'decoration') : undefined}
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

            {/* End-game overlay */}
            {result !== 'none' && (
                <Box className="absolute inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm rounded-container">
                    <VStack className="text-center p-8" gap="lg">
                        <Typography
                            variant="h2"
                            className={cn(
                                'text-4xl font-black tracking-widest uppercase',
                                result === 'victory' ? 'text-warning' : 'text-error',
                            )}
                        >
                            {result === 'victory' ? t('battle.victory') : t('battle.defeat')}
                        </Typography>
                        <Button
                            variant="primary"
                            className="px-8 py-3 font-semibold"
                            onClick={handlePlayAgain}
                        >
                            {t('battle.playAgain')}
                        </Button>
                    </VStack>
                </Box>
            )}
        </div>
    );
}

CastleBoard.displayName = 'CastleBoard';

export default CastleBoard;
