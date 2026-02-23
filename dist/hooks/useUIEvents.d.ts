import { useEventBus } from "./useEventBus";
/**
 * Hook to bridge UI events to state machine dispatch
 *
 * @param dispatch - The state machine dispatch function
 * @param validEvents - Optional array of valid event names (filters which events to handle)
 * @param eventBusInstance - Optional event bus instance (for testing, uses hook if not provided)
 */
export declare function useUIEvents<E extends string>(dispatch: (event: E, payload?: unknown) => void, validEvents?: readonly E[], eventBusInstance?: ReturnType<typeof useEventBus>): void;
/**
 * Hook for selected entity tracking
 * Many list UIs need to track which item is selected.
 *
 * This hook uses SelectionProvider if available (preferred),
 * otherwise falls back to listening to events directly.
 *
 * @example Using with SelectionProvider (recommended)
 * ```tsx
 * function MyPage() {
 *   return (
 *     <EventBusProvider>
 *       <SelectionProvider>
 *         <MyComponent />
 *       </SelectionProvider>
 *     </EventBusProvider>
 *   );
 * }
 *
 * function MyComponent() {
 *   const [selected, setSelected] = useSelectedEntity<Order>();
 *   // selected is automatically updated when UI:VIEW/UI:SELECT events fire
 * }
 * ```
 */
export declare function useSelectedEntity<T>(eventBusInstance?: ReturnType<typeof useEventBus>): [T | null, (entity: T | null) => void];
