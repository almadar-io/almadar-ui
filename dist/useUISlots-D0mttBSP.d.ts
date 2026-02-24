/**
 * Valid UI slot names
 */
type UISlot = 'main' | 'sidebar' | 'modal' | 'drawer' | 'overlay' | 'center' | 'toast' | 'hud-top' | 'hud-bottom' | 'floating';
/**
 * Animation types for slot transitions
 */
type SlotAnimation = 'fade' | 'slide' | 'scale' | 'none';
/**
 * Content rendered in a slot
 */
interface SlotContent {
    /** Unique ID for this content */
    id: string;
    /** Pattern/component type to render */
    pattern: string;
    /** Props to pass to the pattern component */
    props: Record<string, unknown>;
    /** Priority for conflict resolution (higher wins) */
    priority: number;
    /** Animation for showing/hiding */
    animation?: SlotAnimation;
    /** Auto-dismiss timestamp (for toasts) */
    autoDismissAt?: number;
    /** Callback when dismissed */
    onDismiss?: () => void;
    /** Source trait that rendered this content */
    sourceTrait?: string;
}
/**
 * Configuration for render_ui effect
 */
interface RenderUIConfig {
    /** Target slot */
    target: UISlot;
    /** Pattern/component to render */
    pattern: string;
    /** Props for the pattern */
    props?: Record<string, unknown>;
    /** Priority (default: 0) */
    priority?: number;
    /** Animation type */
    animation?: SlotAnimation;
    /** Auto-dismiss after ms (for toasts) */
    autoDismissMs?: number;
    /** Callback on dismiss */
    onDismiss?: () => void;
    /** Source trait name */
    sourceTrait?: string;
}
/**
 * Callback for slot changes
 */
type SlotChangeCallback = (slot: UISlot, content: SlotContent | null) => void;
/**
 * UI Slot Manager interface
 */
interface UISlotManager {
    /** Current content for each slot */
    slots: Record<UISlot, SlotContent | null>;
    /** Render content to a slot */
    render: (config: RenderUIConfig) => string;
    /** Clear a specific slot */
    clear: (slot: UISlot) => void;
    /** Clear content by ID */
    clearById: (id: string) => void;
    /** Clear all slots */
    clearAll: () => void;
    /** Subscribe to slot changes */
    subscribe: (callback: SlotChangeCallback) => () => void;
    /** Check if a slot has content */
    hasContent: (slot: UISlot) => boolean;
    /** Get content for a slot */
    getContent: (slot: UISlot) => SlotContent | null;
}
declare const DEFAULT_SLOTS: Record<UISlot, SlotContent | null>;
/**
 * Create a UI Slot Manager instance.
 *
 * This is the internal hook that creates the manager.
 * Use `useUISlots()` from context in components.
 */
declare function useUISlotManager(): UISlotManager;

export { DEFAULT_SLOTS as D, type RenderUIConfig as R, type SlotContent as S, type UISlotManager as U, type UISlot as a, type SlotAnimation as b, type SlotChangeCallback as c, useUISlotManager as u };
