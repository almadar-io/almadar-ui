/**
 * Client Effect Executor
 *
 * Executes client effects returned from the server.
 * This is the core of the dual execution model - the server processes
 * events and returns client effects, which this module executes.
 *
 * Used by both Builder preview and compiled shells.
 *
 * @packageDocumentation
 */
import type { ClientEffect, ClientEffectExecutorConfig, PatternConfig, NotifyOptions } from './types';
/**
 * Execute an array of client effects.
 *
 * Effects are executed sequentially in order.
 * Errors in one effect don't prevent subsequent effects from executing.
 *
 * @param effects - Array of client effects to execute
 * @param config - Configuration providing implementations for each effect type
 *
 * @example
 * ```typescript
 * executeClientEffects(
 *   [
 *     ['render-ui', 'main', { type: 'entity-table', entity: 'Task' }],
 *     ['notify', 'Tasks loaded!', { type: 'success' }]
 *   ],
 *   {
 *     renderToSlot: (slot, pattern) => slotManager.render(slot, pattern),
 *     navigate: (path) => router.push(path),
 *     notify: (message, opts) => toast.show(message, opts),
 *     eventBus: { emit: (event, payload) => bus.emit(event, payload) }
 *   }
 * );
 * ```
 */
export declare function executeClientEffects(effects: ClientEffect[], config: ClientEffectExecutorConfig): void;
/**
 * Parse a raw effect array into a typed ClientEffect.
 * Handles unknown effect formats gracefully.
 */
export declare function parseClientEffect(raw: unknown[]): ClientEffect | null;
/**
 * Parse an array of raw effects into typed ClientEffects.
 * Filters out invalid effects.
 */
export declare function parseClientEffects(raw: unknown[] | undefined): ClientEffect[];
/**
 * Filter effects by type.
 */
export declare function filterEffectsByType<T extends ClientEffect[0]>(effects: ClientEffect[], type: T): Extract<ClientEffect, [T, ...unknown[]]>[];
/**
 * Get all render-ui effects.
 */
export declare function getRenderUIEffects(effects: ClientEffect[]): Array<['render-ui', string, PatternConfig | null]>;
/**
 * Get all navigate effects.
 */
export declare function getNavigateEffects(effects: ClientEffect[]): Array<['navigate', string, Record<string, unknown>?]>;
/**
 * Get all notify effects.
 */
export declare function getNotifyEffects(effects: ClientEffect[]): Array<['notify', string, NotifyOptions?]>;
/**
 * Get all emit effects.
 */
export declare function getEmitEffects(effects: ClientEffect[]): Array<['emit', string, unknown?]>;
