import type { KFlowEvent, EventListener, Unsubscribe, EventBusContextType } from './event-bus-types';
export type { KFlowEvent, EventListener, Unsubscribe, EventBusContextType };
declare global {
    interface Window {
        __kflowEventBus?: EventBusContextType | null;
    }
}
/**
 * Global event bus reference for bridging between packages.
 *
 * Uses window-level global to enable cross-package communication.
 * This allows @almadar/ui components to emit events to the same bus
 * that the consuming app's trait state machine listens to.
 *
 * When the EventBusProvider mounts, it sets window.__kflowEventBus.
 * Components in any package can then use this shared event bus.
 *
 * SSR Safety: All window access is guarded by `typeof window !== 'undefined'`.
 * React Compiler Safety: The global bus reference is set once at provider mount
 * and is stable — no render-path side effects. In practice, the React context
 * path (priority 1) is used in real apps; the window global (priority 2) is
 * only reached when no EventBusProvider is in the tree (e.g., Storybook).
 */
/**
 * Set the global event bus reference.
 * Called by EventBusProvider when it mounts.
 *
 * @param bus - The event bus context to set as global, or null to clear
 */
export declare function setGlobalEventBus(bus: EventBusContextType | null): void;
/**
 * Get the global event bus reference.
 *
 * @returns The global event bus if set, null otherwise
 */
export declare function getGlobalEventBus(): EventBusContextType | null;
/**
 * Hook for accessing the event bus.
 *
 * Uses EventBusProvider context if available, otherwise falls back to
 * a simple in-memory event bus (for design system / Storybook).
 *
 * @returns Event bus instance with emit, on, once, and hasListeners methods
 *
 * @example
 * ```tsx
 * const eventBus = useEventBus();
 *
 * // Emit an event
 * eventBus.emit('UI:CLICK', { id: '123' });
 *
 * // Subscribe to an event
 * useEffect(() => {
 *   return eventBus.on('UI:CLICK', (event) => {
 *     console.log('Clicked:', event.payload);
 *   });
 * }, []);
 * ```
 */
export declare function useEventBus(): EventBusContextType;
/**
 * Hook for subscribing to a specific event.
 * Automatically cleans up subscription on unmount.
 *
 * @param event - Event name to subscribe to
 * @param handler - Event handler function
 *
 * @example
 * ```tsx
 * useEventListener('UI:CLICK', (event) => {
 *   console.log('Clicked:', event.payload);
 * });
 * ```
 */
export declare function useEventListener(event: string, handler: EventListener): void;
/**
 * Alias for useEventListener for backward compatibility
 */
export declare const useEventSubscription: typeof useEventListener;
/**
 * Hook for emitting events.
 * Returns a memoized emit function.
 *
 * @returns Function to emit events
 *
 * @example
 * ```tsx
 * const emit = useEmitEvent();
 *
 * const handleClick = () => {
 *   emit('UI:CLICK', { id: '123' });
 * };
 * ```
 */
export declare function useEmitEvent(): (type: string, payload?: Record<string, unknown>) => void;
export default useEventBus;
