import type { ClientEffect, ClientEffectExecutorConfig } from './types';
/**
 * Options for the useClientEffects hook
 */
export interface UseClientEffectsOptions extends ClientEffectExecutorConfig {
    /**
     * Whether to execute effects. Defaults to true.
     * Set to false to temporarily disable effect execution.
     */
    enabled?: boolean;
    /**
     * Debug mode - logs effect execution details.
     */
    debug?: boolean;
}
/**
 * Result of useClientEffects hook
 */
export interface UseClientEffectsResult {
    /**
     * Number of effects executed in the last batch.
     */
    executedCount: number;
    /**
     * Whether effects are currently being executed.
     */
    executing: boolean;
    /**
     * Manually trigger effect execution.
     * Useful for imperative control.
     */
    execute: (effects: ClientEffect[]) => void;
}
/**
 * Execute client effects from server response.
 *
 * This hook automatically executes effects when they change,
 * tracking which effects have been executed to prevent duplicates.
 *
 * @param effects - Array of client effects to execute (from server response)
 * @param options - Configuration including effect implementations
 * @returns Hook result with execution state and manual trigger
 *
 * @example
 * ```typescript
 * function useMyTrait() {
 *   const [state, setState] = useState({ pendingEffects: [] });
 *   const effectConfig = useClientEffectConfig();
 *
 *   useClientEffects(state.pendingEffects, {
 *     ...effectConfig,
 *     onComplete: () => setState(s => ({ ...s, pendingEffects: [] }))
 *   });
 *
 *   // ...
 * }
 * ```
 */
export declare function useClientEffects(effects: ClientEffect[] | undefined, options: UseClientEffectsOptions): UseClientEffectsResult;
declare const ClientEffectConfigContext: import("react").Context<ClientEffectExecutorConfig | null>;
/**
 * Provider for client effect configuration.
 */
export declare const ClientEffectConfigProvider: import("react").Provider<ClientEffectExecutorConfig | null>;
/**
 * Hook to get the client effect configuration from context.
 *
 * @throws Error if used outside of ClientEffectConfigProvider
 *
 * @example
 * ```typescript
 * function MyTraitHook() {
 *   const effectConfig = useClientEffectConfig();
 *
 *   useClientEffects(pendingEffects, {
 *     ...effectConfig,
 *     onComplete: () => clearPendingEffects()
 *   });
 * }
 * ```
 */
export declare function useClientEffectConfig(): ClientEffectExecutorConfig;
/**
 * Hook to get client effect configuration, returning null if not available.
 * Use this for optional integration where effects may not be configured.
 */
export declare function useClientEffectConfigOptional(): ClientEffectExecutorConfig | null;
export { ClientEffectConfigContext };
