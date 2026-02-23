/**
 * UISlotRenderer Component
 *
 * Renders all UI slots. This is the central component that displays
 * content rendered by traits via render_ui effects.
 *
 * Slots are rendered as:
 * - Layout slots: Inline in the page flow (main, sidebar)
 * - Portal slots: Rendered via portals (modal, drawer, toast, etc.)
 * - HUD slots: Fixed position overlays (hud-top, hud-bottom)
 *
 * @packageDocumentation
 */
import React from "react";
import { type UISlot, type SlotContent } from "../../context/UISlotContext";
export interface SuspenseConfig {
    /** Enable Suspense boundaries around slot content */
    enabled: boolean;
    /** Custom fallback per slot, overrides default Skeleton variant */
    slotFallbacks?: Partial<Record<UISlot, React.ReactNode>>;
}
/**
 * Provider for Suspense configuration.
 * When enabled, each UI slot is wrapped in `<ErrorBoundary><Suspense>`.
 */
export declare function SuspenseConfigProvider({ config, children, }: {
    config: SuspenseConfig;
    children: React.ReactNode;
}): React.FunctionComponentElement<React.ProviderProps<SuspenseConfig>>;
export declare namespace SuspenseConfigProvider {
    var displayName: string;
}
/**
 * Maps component names to actual React components.
 * The pattern resolver returns a component name (e.g., "DataTable"),
 * and this registry provides the actual component.
 *
 * Component names match those in orbital-shared/patterns/component-mapping.json
 */
export declare const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>>;
interface UISlotComponentProps {
    slot: UISlot;
    portal?: boolean;
    position?: "left" | "right" | "top-right" | "top-left" | "bottom-right" | "bottom-left";
    className?: string;
    draggable?: boolean;
    isLoading?: boolean;
    error?: Error | null;
    entity?: string;
}
/**
 * Individual slot renderer.
 *
 * Handles different slot types with appropriate wrappers.
 */
declare function UISlotComponent({ slot, portal, position, className, }: UISlotComponentProps): React.ReactElement | null;
interface SlotContentRendererProps {
    content: SlotContent;
    onDismiss: () => void;
    className?: string;
    isLoading?: boolean;
    error?: Error | null;
    entity?: string;
}
/**
 * Renders the actual content of a slot.
 *
 * Dynamically renders pattern components from the registry.
 * For layout patterns with `hasChildren`, recursively renders nested patterns.
 */
declare function SlotContentRenderer({ content, onDismiss, }: SlotContentRendererProps): React.ReactElement;
export interface UISlotRendererProps {
    /** Include HUD slots */
    includeHud?: boolean;
    /** Include floating slot */
    includeFloating?: boolean;
    /** Additional class name for the container */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /**
     * Enable Suspense boundaries around each slot.
     * When true, each inline slot is wrapped in `<ErrorBoundary><Suspense>` with
     * Skeleton fallbacks. Opt-in — existing isLoading prop pattern still works.
     */
    suspense?: boolean | SuspenseConfig;
}
/**
 * Main UI Slot Renderer component.
 *
 * Renders all slot containers. Place this in your page/layout component.
 *
 * @example
 * ```tsx
 * function PageLayout() {
 *   return (
 *     <div className="page-layout">
 *       <UISlotRenderer />
 *     </div>
 *   );
 * }
 * ```
 */
export declare function UISlotRenderer({ includeHud, includeFloating, className, suspense, }: UISlotRendererProps): React.ReactElement;
export declare namespace UISlotRenderer {
    var displayName: string;
}
export { UISlotComponent, SlotContentRenderer };
