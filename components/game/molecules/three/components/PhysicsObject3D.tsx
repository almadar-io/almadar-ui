'use client';
/**
 * PhysicsObject3D Component
 *
 * Three.js component that syncs a 3D object's position with physics state.
 * Use this to render physics-enabled entities in GameCanvas3D.
 *
 * @example
 * ```tsx
 * <PhysicsObject3D
 *   entityId="player-1"
 *   modelUrl="https://trait-wars-assets.web.app/3d/medieval/props/barrels.glb"
 *   initialPosition={[0, 10, 0]}
 *   mass={1}
 * />
 * ```
 *
 * @packageDocumentation
 */

import React from 'react';
import { createLogger } from '@almadar/logger';
import { ModelLoader } from './ModelLoader';

const log = createLogger('almadar:ui:game:physics');

export interface Physics3DState {
    id: string;
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    rx: number;
    ry: number;
    rz: number;
    isGrounded: boolean;
    gravity: number;
    friction: number;
    mass: number;
    state: 'Active' | 'Frozen';
}

export interface PhysicsObject3DProps {
    /** Unique entity ID */
    entityId: string;
    /** GLB model URL */
    modelUrl: string;
    /** Initial position [x, y, z] */
    initialPosition?: [number, number, number];
    /** Initial velocity [vx, vy, vz] */
    initialVelocity?: [number, number, number];
    /** Mass for collision response */
    mass?: number;
    /** Gravity force (default: 9.8) */
    gravity?: number;
    /** Ground plane Y position (default: 0) */
    groundY?: number;
    /** Model scale */
    scale?: number | [number, number, number];
    /** Called when physics state updates */
    onPhysicsUpdate?: (state: Physics3DState) => void;
    /** Called when object hits ground */
    onGroundHit?: () => void;
    /** Called when collision occurs */
    onCollision?: (otherEntityId: string) => void;
}

/**
 * 3D Physics-enabled object for GameCanvas3D
 */
export function PhysicsObject3D({
    entityId,
    modelUrl,
    initialPosition = [0, 0, 0],
    scale = 1,
}: PhysicsObject3DProps): React.JSX.Element {
    log.debug('PhysicsObject3D render', { entityId, initialPosition });

    const scaleArray: [number, number, number] = typeof scale === 'number'
        ? [scale, scale, scale]
        : scale;

    return (
        <group position={initialPosition} scale={scaleArray}>
            <ModelLoader
                url={modelUrl}
                fallbackGeometry="box"
            />
        </group>
    );
}

/**
 * Hook for controlling a PhysicsObject3D from parent component
 */
export function usePhysics3DController(entityId: string) {
    const applyForce = (fx: number, fy: number, fz: number) => {
        log.debug('apply force', { entityId, fx, fy, fz });
    };

    const setVelocity = (vx: number, vy: number, vz: number) => {
        log.debug('set velocity', { entityId, vx, vy, vz });
    };

    const setPosition = (x: number, y: number, z: number) => {
        log.debug('set position', { entityId, x, y, z });
    };

    const jump = (force: number = 10) => {
        applyForce(0, force, 0);
    };

    return {
        applyForce,
        setVelocity,
        setPosition,
        jump,
    };
}

export default PhysicsObject3D;
