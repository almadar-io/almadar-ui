'use client';
/**
 * SideScene3D
 *
 * Side-scroller scene: renders the LOLO-owned pixel-space `player`/`platforms`
 * as 3D geometry. Physics stays in the board's tick (same contract as Canvas2D's
 * SideView) — this only maps px → world units and draws. Platform and player
 * fallback colors come from `game3dTheme` defaults.
 *
 * @packageDocumentation
 */

import React from 'react';
import type { Asset } from '@almadar/core';
import type { Platform, SidePlayer } from '../../2d/molecules/Canvas2D';
import type { IsometricFeature } from '../../shared/isometricTypes';
import { ModelLoader } from './ModelLoader';
import { LerpedGroup3D } from './GameCamera3D';
import { EventMarker3D } from '../atoms/EventMarker3D';
import { SIDE_PLATFORM_COLORS_3D, SIDE_PLAYER_COLOR_3D } from '../../shared/game3dTheme';
import type { GameEvent, GameCanvas3DAssetManifest } from './GameCanvas3D';

export interface SideScene3DProps {
    player: SidePlayer;
    platforms: Platform[];
    worldHeight: number;
    ppu: number;
    playerSprite?: Asset;
    tileSprites?: Record<string, Asset>;
    interpolate: boolean;
    /** Side-view features (collectibles/props) — x/y are PIXELS like platforms. */
    features?: IsometricFeature[];
    /** Feedback markers — x/y are PIXELS in side view. */
    events?: GameEvent[];
    assetManifest?: GameCanvas3DAssetManifest;
}

export function SideScene3D({
    player,
    platforms,
    worldHeight,
    ppu,
    playerSprite,
    tileSprites,
    interpolate,
    features = [],
    events = [],
    assetManifest,
}: SideScene3DProps): React.JSX.Element {
    const pw = player.width ?? 32;
    const ph = player.height ?? 48;
    const playerPos: [number, number, number] = [
        (player.x + pw / 2) / ppu,
        (worldHeight - player.y - ph) / ppu,
        0,
    ];
    const playerH = Math.max(ph / ppu, 0.5);
    return (
        <group>
            {platforms.map((p, i) => {
                const platformType = p.type ?? 'platform';
                const model = tileSprites?.[platformType]?.url;
                const topY = (worldHeight - p.y) / ppu;
                if (model) {
                    // Tile the platform with unit blocks, top edge on the AABB top.
                    const cells = Math.max(1, Math.round(p.width / ppu));
                    const x0 = p.x / ppu;
                    return (
                        <group key={`plat-${i}`}>
                            {Array.from({ length: cells }, (_, c) => (
                                <group key={c} position={[x0 + c + 0.5, topY - 0.475, 0]}>
                                    <ModelLoader url={model} scale={0.95} fallbackGeometry="box" castShadow receiveShadow />
                                </group>
                            ))}
                        </group>
                    );
                }
                // No model — exact AABB box in the theme's fallback color.
                return (
                    <mesh
                        key={`plat-${i}`}
                        position={[(p.x + p.width / 2) / ppu, topY - p.height / 2 / ppu, 0]}
                    >
                        <boxGeometry args={[p.width / ppu, p.height / ppu, 1]} />
                        <meshStandardMaterial color={SIDE_PLATFORM_COLORS_3D[platformType] ?? SIDE_PLATFORM_COLORS_3D.default} />
                    </mesh>
                );
            })}
            {/* Side-view features (collectibles/props) — pixel coords, LOLO owns pickup logic */}
            {features.map((feature, i) => {
                const model = feature.assetUrl ?? assetManifest?.features?.[feature.type];
                const fx = feature.x / ppu;
                const fy = (worldHeight - feature.y) / ppu;
                if (!model?.url) return null;
                return (
                    <group key={feature.id ?? `sfeat-${i}`} position={[fx, fy, 0]}>
                        <ModelLoader url={model.url} scale={0.6} tint={feature.color} fallbackGeometry="sphere" castShadow />
                    </group>
                );
            })}

            {/* Feedback markers — pixel coords */}
            {events.map((ev, i) => (
                <EventMarker3D
                    key={ev.id ?? `sev-${i}`}
                    event={ev}
                    position={[ev.x / ppu, (worldHeight - (ev.y ?? 0)) / ppu + 0.8, 0.2]}
                />
            ))}

            <LerpedGroup3D target={playerPos} enabled={interpolate}>
                {playerSprite?.url ? (
                    <group position={[0, playerH / 2, 0]}>
                        <ModelLoader
                            url={playerSprite.url}
                            scale={playerH}
                            rotation={[0, player.facingRight ? 90 : -90, 0]}
                            animation={player.animation ?? 'idle'}
                            fallbackGeometry="box"
                            castShadow
                        />
                    </group>
                ) : (
                    <mesh position={[0, playerH / 2, 0]}>
                        <capsuleGeometry args={[playerH * 0.25, playerH * 0.5, 4, 8]} />
                        <meshStandardMaterial color={SIDE_PLAYER_COLOR_3D} />
                    </mesh>
                )}
            </LerpedGroup3D>
        </group>
    );
}

export default SideScene3D;
