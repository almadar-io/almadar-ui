/**
 * PhysicsManager
 *
 * Manages 2D physics simulation for entities with Physics2D state.
 * This implements the tick logic that would normally be compiled from .orb schemas.
 *
 * @packageDocumentation
 */
export interface Physics2DState {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    isGrounded: boolean;
    gravity: number;
    friction: number;
    airResistance: number;
    maxVelocityY: number;
    mass?: number;
    restitution?: number;
    state: 'Active' | 'Frozen';
}
export interface PhysicsBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface PhysicsConfig {
    gravity?: number;
    friction?: number;
    airResistance?: number;
    maxVelocityY?: number;
    groundY?: number;
}
export declare class PhysicsManager {
    private entities;
    private config;
    constructor(config?: PhysicsConfig);
    /**
     * Register an entity for physics simulation
     */
    registerEntity(entityId: string, initialState?: Partial<Physics2DState>): Physics2DState;
    /**
     * Unregister an entity from physics simulation
     */
    unregisterEntity(entityId: string): void;
    /**
     * Get physics state for an entity
     */
    getState(entityId: string): Physics2DState | undefined;
    /**
     * Get all registered entities
     */
    getAllEntities(): Physics2DState[];
    /**
     * Apply a force to an entity (impulse)
     */
    applyForce(entityId: string, fx: number, fy: number): void;
    /**
     * Set velocity directly
     */
    setVelocity(entityId: string, vx: number, vy: number): void;
    /**
     * Set position directly
     */
    setPosition(entityId: string, x: number, y: number): void;
    /**
     * Freeze/unfreeze an entity
     */
    setFrozen(entityId: string, frozen: boolean): void;
    /**
     * Main tick function - call this every frame
     * Implements the logic from std-physics2d ticks
     */
    tick(deltaTime?: number): void;
    /**
     * ApplyGravity tick implementation
     */
    private applyGravity;
    /**
     * ApplyVelocity tick implementation
     */
    private applyVelocity;
    /**
     * Check and handle ground collision
     */
    private checkGroundCollision;
    /**
     * Check AABB collision between two entities
     */
    checkCollision(entityIdA: string, entityIdB: string, boundsA: PhysicsBounds, boundsB: PhysicsBounds): boolean;
    /**
     * Resolve collision with bounce
     */
    resolveCollision(entityIdA: string, entityIdB: string): void;
    /**
     * Reset all physics state
     */
    reset(): void;
}
export default PhysicsManager;
