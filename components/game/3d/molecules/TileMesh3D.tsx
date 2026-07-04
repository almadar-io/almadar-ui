'use client';
/**
 * TileMesh3D
 *
 * Default tile renderer for GameCanvas3D. GLB tile when a model is resolved
 * (with a box fallback while loading/on error); otherwise a colored plate
 * whose terrain color and highlight emissive come from `game3dTheme` defaults,
 * overridable per-tile via `tile.color`.
 *
 * @packageDocumentation
 */

import React from 'react';
import type { Asset } from '@almadar/core';
import { ModelLoader } from './ModelLoader';
import type { IsometricTile } from '../../shared/isometricTypes';
import type { MinimalMouseEvent } from '../../shared/hooks/useGameCanvas3DEvents';
import { TERRAIN_COLORS_3D, HIGHLIGHT_EMISSIVE_3D } from '../../shared/game3dTheme';

export interface TileMesh3DProps {
    /** `color` is an optional per-tile override of the terrain default. */
    tile: IsometricTile;
    position: [number, number, number];
    model?: Asset;
    isSelected: boolean;
    isHovered: boolean;
    isValidMove: boolean;
    isAttackTarget: boolean;
    onTileClick: (tile: IsometricTile, event: MinimalMouseEvent) => void;
    onTileHover: (tile: IsometricTile | null, event: MinimalMouseEvent) => void;
}

export function TileMesh3D({
    tile,
    position,
    model,
    isSelected,
    isHovered,
    isValidMove,
    isAttackTarget,
    onTileClick,
    onTileHover,
}: TileMesh3DProps): React.JSX.Element {
    const color = tile.color ?? TERRAIN_COLORS_3D[tile.type ?? ''] ?? TERRAIN_COLORS_3D.base;

    let emissive = HIGHLIGHT_EMISSIVE_3D.none;
    if (isSelected) emissive = HIGHLIGHT_EMISSIVE_3D.selected;
    else if (isAttackTarget) emissive = HIGHLIGHT_EMISSIVE_3D.attackTarget;
    else if (isValidMove) emissive = HIGHLIGHT_EMISSIVE_3D.validMove;
    else if (isHovered) emissive = HIGHLIGHT_EMISSIVE_3D.hovered;

    // GLB tile (box fallback while loading / on error); the procedural
    // color/emissive path below is only for tiles without a model.
    if (model?.url) {
        return (
            <group
                position={position}
                onClick={(e) => onTileClick(tile, e)}
                onPointerEnter={(e) => onTileHover(tile, e)}
                onPointerLeave={(e) => onTileHover(null, e)}
                userData={{ type: 'tile', tileId: tile.id, gridX: tile.x, gridZ: tile.z ?? tile.y }}
            >
                <ModelLoader
                    url={model.url}
                    scale={0.95}
                    rotation={[0, tile.rotation ?? 0, 0]}
                    fallbackGeometry="box"
                    castShadow
                    receiveShadow
                />
            </group>
        );
    }

    return (
        <mesh
            position={position}
            onClick={(e) => onTileClick(tile, e)}
            onPointerEnter={(e) => onTileHover(tile, e)}
            onPointerLeave={(e) => onTileHover(null, e)}
            userData={{ type: 'tile', tileId: tile.id, gridX: tile.x, gridZ: tile.z ?? tile.y }}
        >
            <boxGeometry args={[0.95, 0.2, 0.95]} />
            <meshStandardMaterial color={color} emissive={emissive} />
        </mesh>
    );
}

export default TileMesh3D;
