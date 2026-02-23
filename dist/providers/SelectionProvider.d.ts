/**
 * SelectionProvider - Manages selected entity state
 *
 * Separates selection state from the EventBusProvider to maintain
 * clean architecture (event bus stays pure pub/sub).
 *
 * This provider:
 * - Listens to UI:VIEW and UI:SELECT events to track selected entity
 * - Listens to UI:CLOSE, UI:DESELECT, UI:CANCEL to clear selection
 * - Provides the selected entity to any component that needs it
 *
 * @packageDocumentation
 */
import React, { type ReactNode } from 'react';
export interface SelectionContextType<T = unknown> {
    /** The currently selected entity */
    selected: T | null;
    /** Manually set the selected entity */
    setSelected: (entity: T | null) => void;
    /** Clear the selection */
    clearSelection: () => void;
    /** Check if an entity is selected */
    isSelected: (entity: T) => boolean;
}
declare const SelectionContext: React.Context<SelectionContextType<unknown> | null>;
interface SelectionProviderProps {
    children: ReactNode;
    /** Enable debug logging */
    debug?: boolean;
    /** Custom comparison function for isSelected */
    compareEntities?: (a: unknown, b: unknown) => boolean;
}
/**
 * Provider component for selection state.
 *
 * Must be used within an EventBusProvider.
 *
 * @example
 * ```tsx
 * function OrderListPage() {
 *   return (
 *     <EventBusProvider>
 *       <SelectionProvider debug={process.env.NODE_ENV === 'development'}>
 *         <OrderTable />
 *         <OrderDetailDrawer />
 *       </SelectionProvider>
 *     </EventBusProvider>
 *   );
 * }
 * ```
 */
export declare function SelectionProvider({ children, debug, compareEntities, }: SelectionProviderProps): import("react/jsx-runtime").JSX.Element;
/**
 * Hook to access selection state.
 *
 * @throws Error if used outside SelectionProvider
 *
 * @example
 * ```tsx
 * function OrderDetailDrawer() {
 *   const { selected, clearSelection } = useSelection<Order>();
 *
 *   if (!selected) return null;
 *
 *   return (
 *     <Drawer onClose={clearSelection}>
 *       <OrderDetail order={selected} />
 *     </Drawer>
 *   );
 * }
 * ```
 */
export declare function useSelection<T = unknown>(): SelectionContextType<T>;
/**
 * Hook to access selection state with fallback for components
 * that may be used outside SelectionProvider.
 *
 * Returns null if no SelectionProvider is found.
 */
export declare function useSelectionOptional<T = unknown>(): SelectionContextType<T> | null;
export { SelectionContext };
