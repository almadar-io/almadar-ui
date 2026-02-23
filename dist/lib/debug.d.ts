/**
 * Debug utilities for development
 */
export declare function isDebugEnabled(): boolean;
export declare function debug(...args: unknown[]): void;
export declare function debugGroup(label: string): void;
export declare function debugGroupEnd(): void;
export declare function debugWarn(...args: unknown[]): void;
export declare function debugError(...args: unknown[]): void;
export declare function debugTable(data: unknown): void;
export declare function debugTime(label: string): void;
export declare function debugTimeEnd(label: string): void;
/**
 * Debug input events (keyboard, mouse, touch)
 * @param inputType - Type of input (e.g., 'keydown', 'keyup', 'mouse')
 * @param data - Input data to log
 */
export declare function debugInput(inputType: string, data: unknown): void;
/**
 * Debug collision events between entities
 * @param entityA - First entity in collision
 * @param entityB - Second entity in collision
 * @param details - Additional collision details
 */
export declare function debugCollision(entityA: {
    id?: string;
    type?: string;
}, entityB: {
    id?: string;
    type?: string;
}, details?: unknown): void;
/**
 * Debug physics updates (position, velocity)
 * @param entityId - Entity identifier
 * @param physics - Physics data to log
 */
export declare function debugPhysics(entityId: string, physics: unknown): void;
/**
 * Debug game state changes
 * @param stateName - Name of the state that changed
 * @param value - New state value
 */
export declare function debugGameState(stateName: string, value: unknown): void;
