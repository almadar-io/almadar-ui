/**
 * Debug Utilities - Functions for toggling and checking debug mode
 *
 * @packageDocumentation
 */
type DebugToggleListener = (enabled: boolean) => void;
/**
 * Check if debug mode is enabled
 */
export declare function isDebugEnabled(): boolean;
/**
 * Enable or disable debug mode
 */
export declare function setDebugEnabled(enabled: boolean): void;
/**
 * Toggle debug mode
 */
export declare function toggleDebug(): boolean;
/**
 * Subscribe to debug mode changes
 */
export declare function onDebugToggle(listener: DebugToggleListener): () => void;
/**
 * Initialize debug mode from keyboard shortcut (Ctrl+Shift+D)
 */
export declare function initDebugShortcut(): () => void;
export {};
