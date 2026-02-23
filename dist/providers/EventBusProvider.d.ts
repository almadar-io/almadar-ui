/**
 * EventBusProvider - React context provider for the event bus
 *
 * Provides a page-scoped event bus for trait communication.
 * Each page has its own event bus instance.
 *
 * NOTE: Selection state has been moved to SelectionProvider.
 * Use SelectionProvider for tracking selected entities.
 *
 * @packageDocumentation
 */
import React, { type ReactNode } from 'react';
import type { EventBusContextType } from '../hooks/event-bus-types';
/**
 * Extended context type for backward compatibility.
 *
 * @deprecated getSelectedEntity and clearSelectedEntity are deprecated.
 * Use SelectionProvider and useSelection hook instead.
 */
export interface EventBusContextTypeExtended extends EventBusContextType {
    /**
     * @deprecated Use useSelection from SelectionProvider instead.
     * This method now returns null - selection state moved to SelectionProvider.
     */
    getSelectedEntity: () => unknown | null;
    /**
     * @deprecated Use useSelection from SelectionProvider instead.
     * This method is now a no-op - selection state moved to SelectionProvider.
     */
    clearSelectedEntity: () => void;
}
export declare const EventBusContext: React.Context<EventBusContextTypeExtended | null>;
interface EventBusProviderProps {
    children: ReactNode;
    /** Enable debug logging in development */
    debug?: boolean;
}
/**
 * Provider component for the page event bus.
 *
 * This is a pure pub/sub event bus. For selection state,
 * use SelectionProvider which listens to events and maintains state.
 *
 * @example
 * ```tsx
 * function TaskDetailPage() {
 *   return (
 *     <EventBusProvider debug={process.env.NODE_ENV === 'development'}>
 *       <SelectionProvider>
 *         <TaskHeader />
 *         <TaskForm />
 *         <TaskActions />
 *       </SelectionProvider>
 *     </EventBusProvider>
 *   );
 * }
 * ```
 */
export declare function EventBusProvider({ children, debug }: EventBusProviderProps): import("react/jsx-runtime").JSX.Element;
export type { EventBusContextType };
