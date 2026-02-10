/**
 * CastleTemplate
 *
 * Generalized castle / base-management template composing IsometricCanvas from
 * almadar-ui. Renders an isometric courtyard/base view and exposes a side-panel
 * area via slots for game-specific UI (building details, recruitment, garrison).
 *
 * @packageDocumentation
 */

import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '../../lib/cn';
import IsometricCanvas from '../organisms/game/IsometricCanvas';
import type {
    IsometricTile,
    IsometricUnit,
    IsometricFeature,
} from '../organisms/game/types/isometric';
import { isoToScreen, TILE_WIDTH, FLOOR_HEIGHT } from '../organisms/game/utils/isometric';

// =============================================================================
// Types
// =============================================================================

/** Context exposed to render-prop slots */
export interface CastleSlotContext {
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
}

export interface CastleTemplateProps {
    /** Isometric tiles (pre-resolved with terrainSprite) */
    tiles: IsometricTile[];
    /** Building features rendered on the grid */
    features?: IsometricFeature[];
    /** Garrison / stationed units on the grid */
    units?: IsometricUnit[];
    /** Canvas render scale */
    scale?: number;
    /** Asset manifest for IsometricCanvas */
    assetManifest?: {
        baseUrl: string;
        terrains?: Record<string, string>;
        units?: Record<string, string>;
        features?: Record<string, string>;
    };
    /** Background image URL */
    backgroundImage?: string;

    // -- Slots --
    /** Top bar / header */
    header?: (ctx: CastleSlotContext) => React.ReactNode;
    /** Side panel content (buildings list, recruit tab, garrison tab) */
    sidePanel?: (ctx: CastleSlotContext) => React.ReactNode;
    /** Canvas overlay (hover tooltips, etc.) */
    overlay?: (ctx: CastleSlotContext) => React.ReactNode;
    /** Bottom bar (income summary, etc.) */
    footer?: (ctx: CastleSlotContext) => React.ReactNode;

    // -- Callbacks --
    /** Called when a feature (building) is clicked */
    onFeatureClick?: (feature: IsometricFeature) => void;
    /** Called when a unit is clicked */
    onUnitClick?: (unit: IsometricUnit) => void;
    /** Called when any tile is clicked */
    onTileClick?: (x: number, y: number) => void;

    className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function CastleTemplate({
    tiles,
    features = [],
    units = [],
    scale = 0.45,
    assetManifest,
    backgroundImage,
    header,
    sidePanel,
    overlay,
    footer,
    onFeatureClick,
    onUnitClick,
    onTileClick,
    className,
}: CastleTemplateProps): JSX.Element {
    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
    const [selectedFeature, setSelectedFeature] = useState<IsometricFeature | null>(null);

    // ── Derived hover state ─────────────────────────────────────────────────
    const hoveredFeature = useMemo(() => {
        if (!hoveredTile) return null;
        return features.find(f => f.x === hoveredTile.x && f.y === hoveredTile.y) ?? null;
    }, [hoveredTile, features]);

    const hoveredUnit = useMemo(() => {
        if (!hoveredTile) return null;
        return units.find(
            u => u.position.x === hoveredTile.x && u.position.y === hoveredTile.y,
        ) ?? null;
    }, [hoveredTile, units]);

    // ── Tile-to-screen helper ───────────────────────────────────────────────
    const maxY = Math.max(...tiles.map(t => t.y), 0);
    const baseOffsetX = (maxY + 1) * (TILE_WIDTH * scale / 2);
    const tileToScreen = useCallback(
        (tx: number, ty: number) => isoToScreen(tx, ty, scale, baseOffsetX),
        [scale, baseOffsetX],
    );

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleTileClick = useCallback((x: number, y: number) => {
        // Check if a feature sits at this tile
        const feature = features.find(f => f.x === x && f.y === y);
        if (feature) {
            setSelectedFeature(feature);
            onFeatureClick?.(feature);
        }
        onTileClick?.(x, y);
    }, [features, onFeatureClick, onTileClick]);

    const handleUnitClick = useCallback((unitId: string) => {
        const unit = units.find(u => u.id === unitId);
        if (unit) onUnitClick?.(unit);
    }, [units, onUnitClick]);

    const clearSelection = useCallback(() => setSelectedFeature(null), []);

    // ── Slot context ────────────────────────────────────────────────────────
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
        <div className={cn('castle-template min-h-screen flex flex-col bg-[var(--color-background)]', className)}>
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
                    <div className="w-96 shrink-0 border-l border-[var(--color-border)] bg-[var(--color-surface)] overflow-y-auto">
                        {sidePanel(ctx)}
                    </div>
                )}
            </div>

            {/* Footer slot */}
            {footer && footer(ctx)}
        </div>
    );
}

CastleTemplate.displayName = 'CastleTemplate';

export default CastleTemplate;
