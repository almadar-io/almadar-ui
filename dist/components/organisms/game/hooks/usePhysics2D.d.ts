import { Physics2DState, PhysicsConfig, PhysicsBounds } from '../managers/PhysicsManager';
export interface UsePhysics2DOptions extends PhysicsConfig {
    /** Enable physics debug visualization */
    debug?: boolean;
    /** Callback when collision occurs */
    onCollision?: (entityIdA: string, entityIdB: string) => void;
    /** Ground Y position (default: 500) */
    groundY?: number;
}
export interface UsePhysics2DReturn {
    /** Register a unit for physics simulation */
    registerUnit: (unitId: string, options?: Partial<Physics2DState>) => void;
    /** Unregister a unit from physics */
    unregisterUnit: (unitId: string) => void;
    /** Get current physics position for a unit */
    getPosition: (unitId: string) => {
        x: number;
        y: number;
    } | null;
    /** Get full physics state for a unit */
    getState: (unitId: string) => Physics2DState | undefined;
    /** Apply force to a unit */
    applyForce: (unitId: string, fx: number, fy: number) => void;
    /** Set velocity directly */
    setVelocity: (unitId: string, vx: number, vy: number) => void;
    /** Set position directly (teleport) */
    setPosition: (unitId: string, x: number, y: number) => void;
    /** Run physics tick - call this in your RAF loop */
    tick: (deltaTime?: number) => void;
    /** Check collision between two units */
    checkCollision: (unitIdA: string, unitIdB: string, boundsA: PhysicsBounds, boundsB: PhysicsBounds) => boolean;
    /** Resolve collision between two units */
    resolveCollision: (unitIdA: string, unitIdB: string) => void;
    /** Freeze/unfreeze a unit */
    setFrozen: (unitId: string, frozen: boolean) => void;
    /** Get all physics-enabled units */
    getAllUnits: () => Physics2DState[];
    /** Reset all physics */
    reset: () => void;
}
/**
 * Hook for managing 2D physics simulation
 */
export declare function usePhysics2D(options?: UsePhysics2DOptions): UsePhysics2DReturn;
export default usePhysics2D;
