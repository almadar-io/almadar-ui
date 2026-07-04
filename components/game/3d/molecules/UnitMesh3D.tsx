'use client';
/**
 * UnitMesh3D
 *
 * Default unit renderer for GameCanvas3D. Renders (in priority order) an
 * animated sprite-sheet billboard, a GLB model, or a procedural
 * base/body/head primitive stack — plus a selection ring and health bar.
 * Faction color, selection ring, and health-bar palette come from
 * `game3dTheme` defaults, overridable per-unit via `unit.tint`.
 *
 * @packageDocumentation
 */

import React from 'react';
import type { Asset } from '@almadar/core';
import { Billboard } from '@react-three/drei';
import { ModelLoader } from './ModelLoader';
import { SpriteBillboard3D } from '../atoms/SpriteBillboard3D';
import type { IsometricUnit } from '../../shared/isometricTypes';
import type { ResolvedFrame } from '../../shared/spriteAnimationTypes';
import type { MinimalMouseEvent } from '../../shared/hooks/useGameCanvas3DEvents';
import { unitAtlasUrl } from '../../shared/hooks/useUnitSpriteAtlas';
import {
    FACTION_COLORS_3D,
    SELECTION_RING_COLOR_3D,
    HEALTHBAR_3D,
    healthbarFill3D,
} from '../../shared/game3dTheme';

const UNIT_BASE_MODEL_SCALE = 0.5;
const UNIT_BASE_BILLBOARD_HEIGHT = 1.2;
const UNIT_BASE_PRIMITIVE_RADIUS = 0.3;
/** Health-bar plate height — not a game3dTheme value (fixed geometry, not a palette color). */
const HEALTHBAR_HEIGHT = 0.05;

export interface UnitMesh3DProps {
    /** `tint` is an optional per-unit override of the faction default. */
    unit: IsometricUnit;
    position: [number, number, number];
    model?: Asset;
    isSelected: boolean;
    unitScale: number;
    cellSize: number;
    resolveUnitFrame: (unitId: string) => ResolvedFrame | null;
    onUnitClick: (unit: IsometricUnit, event: MinimalMouseEvent) => void;
}

export function UnitMesh3D({
    unit,
    position,
    model,
    isSelected,
    unitScale,
    cellSize,
    resolveUnitFrame,
    onUnitClick,
}: UnitMesh3DProps): React.JSX.Element {
    const color = unit.tint ?? FACTION_COLORS_3D[unit.faction ?? ''] ?? FACTION_COLORS_3D.default;
    const hasAtlas = unitAtlasUrl(unit) !== null;
    const initialFrame = hasAtlas ? resolveUnitFrame(unit.id) : null;

    const modelScale = UNIT_BASE_MODEL_SCALE * unitScale * cellSize;
    // Billboard height is proportional to one cell so units stay
    // tile-sized regardless of board dimensions or cellSize.
    const billboardHeight = UNIT_BASE_BILLBOARD_HEIGHT * unitScale * cellSize;
    const primitiveRadius = UNIT_BASE_PRIMITIVE_RADIUS * unitScale * cellSize;

    return (
        <group
            position={position}
            onClick={(e) => onUnitClick(unit, e)}
            userData={{ type: 'unit', unitId: unit.id }}
        >
            {/* Selection ring */}
            {isSelected && (
                <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.4, 0.5, 32]} />
                    <meshBasicMaterial color={SELECTION_RING_COLOR_3D} transparent opacity={0.8} />
                </mesh>
            )}

            {hasAtlas && initialFrame ? (
                /* Animated sprite-sheet billboard — single cropped frame, by state */
                <Billboard>
                    <SpriteBillboard3D
                        sheetUrl={initialFrame.sheetUrl}
                        resolveFrame={() => resolveUnitFrame(unit.id)}
                        height={billboardHeight}
                    />
                </Billboard>
            ) : model?.url ? (
                /* GLB unit model — LOLO's `animation` field drives the named clip;
                   `heading` (radians) faces the model along its travel direction (driving). */
                <ModelLoader
                    url={model.url}
                    scale={modelScale}
                    rotation={[0, unit.heading ?? 0, 0]}
                    animation={unit.animation ?? 'idle'}
                    fallbackGeometry="box"
                    castShadow
                />
            ) : (
                <>
                    {/* Base */}
                    <mesh position={[0, primitiveRadius, 0]}>
                        <cylinderGeometry args={[primitiveRadius, primitiveRadius, primitiveRadius * 0.33, 8]} />
                        <meshStandardMaterial color={color} />
                    </mesh>

                    {/* Body */}
                    <mesh position={[0, primitiveRadius * 2, 0]}>
                        <capsuleGeometry args={[primitiveRadius * 0.67, primitiveRadius * 1.33, 4, 8]} />
                        <meshStandardMaterial color={color} />
                    </mesh>

                    {/* Head */}
                    <mesh position={[0, primitiveRadius * 3, 0]}>
                        <sphereGeometry args={[primitiveRadius * 0.4, 8, 8]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                </>
            )}

            {/* Health bar */}
            {unit.health !== undefined && unit.maxHealth !== undefined && (
                <group position={[0, billboardHeight, 0]}>
                    <mesh position={[-HEALTHBAR_3D.width / 2, 0, 0]}>
                        <planeGeometry args={[HEALTHBAR_3D.width, HEALTHBAR_HEIGHT]} />
                        <meshBasicMaterial color={HEALTHBAR_3D.bg} />
                    </mesh>
                    <mesh
                        position={[
                            -HEALTHBAR_3D.width / 2 + (HEALTHBAR_3D.width * (unit.health / unit.maxHealth)) / 2,
                            0,
                            0.01,
                        ]}
                    >
                        <planeGeometry args={[HEALTHBAR_3D.width * (unit.health / unit.maxHealth), HEALTHBAR_HEIGHT]} />
                        <meshBasicMaterial color={healthbarFill3D(unit.health / unit.maxHealth)} />
                    </mesh>
                </group>
            )}
        </group>
    );
}

export default UnitMesh3D;
