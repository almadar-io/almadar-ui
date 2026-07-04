'use client';
/**
 * FeatureMesh3D
 *
 * Default feature renderer for GameCanvas3D. GLB model when resolved (tinted
 * via `feature.color`); otherwise a procedural tree or rock primitive using
 * the `game3dTheme` default palette.
 *
 * @packageDocumentation
 */

import React from 'react';
import type { Asset } from '@almadar/core';
import { ModelLoader } from './ModelLoader';
import type { IsometricFeature } from '../../shared/isometricTypes';
import type { MinimalMouseEvent } from '../../shared/hooks/useGameCanvas3DEvents';
import { TREE_COLORS_3D, ROCK_COLOR_3D } from '../../shared/game3dTheme';

export interface FeatureMesh3DProps {
    feature: IsometricFeature;
    position: [number, number, number];
    model?: Asset;
    onFeatureClick: (feature: IsometricFeature, event: MinimalMouseEvent | null) => void;
}

export function FeatureMesh3D({
    feature,
    position,
    model,
    onFeatureClick,
}: FeatureMesh3DProps): React.JSX.Element | null {
    if (model?.url) {
        return (
            <ModelLoader
                url={model.url}
                position={position}
                scale={0.5}
                rotation={[0, feature.rotation ?? 0, 0]}
                tint={feature.color}
                onClick={() => onFeatureClick(feature, null)}
                fallbackGeometry="box"
            />
        );
    }

    if (feature.type === 'tree') {
        return (
            <group
                position={position}
                onClick={(e) => onFeatureClick(feature, e)}
                userData={{ type: 'feature', featureId: feature.id }}
            >
                <mesh position={[0, 0.4, 0]}>
                    <cylinderGeometry args={[0.1, 0.15, 0.8, 6]} />
                    <meshStandardMaterial color={TREE_COLORS_3D.trunk} />
                </mesh>
                <mesh position={[0, 0.9, 0]}>
                    <coneGeometry args={[0.5, 0.8, 8]} />
                    <meshStandardMaterial color={TREE_COLORS_3D.foliage} />
                </mesh>
            </group>
        );
    }

    if (feature.type === 'rock') {
        return (
            <mesh
                position={[position[0], position[1] + 0.3, position[2]]}
                onClick={(e) => onFeatureClick(feature, e)}
                userData={{ type: 'feature', featureId: feature.id }}
            >
                <dodecahedronGeometry args={[0.3, 0]} />
                <meshStandardMaterial color={ROCK_COLOR_3D} />
            </mesh>
        );
    }

    return null;
}

export default FeatureMesh3D;
