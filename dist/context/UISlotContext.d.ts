/**
 * UISlotContext
 *
 * React context for providing the UI Slot Manager throughout the application.
 * Traits use this context to render content into slots via render_ui effects.
 *
 * Usage:
 * ```tsx
 * // In App.tsx or layout
 * <UISlotProvider>
 *   <App />
 * </UISlotProvider>
 *
 * // In trait hooks or components
 * const { render, clear } = useUISlots();
 * render({ target: 'modal', pattern: 'form-section', props: {...} });
 * ```
 *
 * @packageDocumentation
 */
import React from 'react';
import { type UISlotManager, type UISlot, type SlotContent, type RenderUIConfig, type SlotAnimation, type SlotChangeCallback } from '../hooks/useUISlots';
/**
 * Context for the UI Slot Manager
 */
declare const UISlotContext: React.Context<UISlotManager | null>;
export interface UISlotProviderProps {
    children: React.ReactNode;
}
/**
 * Provider component that creates and provides the UI Slot Manager.
 *
 * Must wrap any components that use traits with render_ui effects.
 */
export declare function UISlotProvider({ children }: UISlotProviderProps): React.ReactElement;
/**
 * Hook to access the UI Slot Manager.
 *
 * Must be used within a UISlotProvider.
 *
 * @throws Error if used outside of UISlotProvider
 *
 * @example
 * ```tsx
 * function MyTraitHook() {
 *   const { render, clear } = useUISlots();
 *
 *   const showModal = () => {
 *     render({
 *       target: 'modal',
 *       pattern: 'form-section',
 *       props: { title: 'Create Item' },
 *     });
 *   };
 *
 *   const closeModal = () => {
 *     clear('modal');
 *   };
 *
 *   return { showModal, closeModal };
 * }
 * ```
 */
export declare function useUISlots(): UISlotManager;
/**
 * Hook to get content for a specific slot.
 *
 * Useful for components that only need to read slot state.
 */
export declare function useSlotContent(slot: UISlot): SlotContent | null;
/**
 * Hook to check if a slot has content.
 */
export declare function useSlotHasContent(slot: UISlot): boolean;
export { UISlotContext, type UISlotManager, type UISlot, type SlotContent, type RenderUIConfig, type SlotAnimation, type SlotChangeCallback, };
