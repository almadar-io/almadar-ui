import { type StatBadgeProps } from "../../molecules/game/StatBadge";
export interface GameHudStat extends Omit<StatBadgeProps, "size"> {
    /** Data source entity name */
    source?: string;
    /** Field name in the source */
    field?: string;
}
/**
 * Schema-style HUD element definition.
 * Used when elements are passed from schema render_ui effects.
 */
export interface GameHudElement {
    type: string;
    bind?: string;
    position?: string;
    label?: string;
}
export interface GameHudProps {
    /** Position of the HUD */
    position?: "top" | "bottom" | "corners" | string;
    /** Stats to display - accepts readonly for compatibility with generated const arrays */
    stats?: readonly GameHudStat[];
    /** Alias for stats (schema compatibility) */
    items?: readonly GameHudStat[];
    /**
     * Schema-style elements array (alternative to stats).
     * Converted to stats internally for backwards compatibility.
     */
    elements?: readonly GameHudElement[];
    /** Size variant */
    size?: "sm" | "md" | "lg";
    /** Additional CSS classes */
    className?: string;
    /** Whether to use a semi-transparent background */
    transparent?: boolean;
}
export declare function GameHud({ position: propPosition, stats: propStats, items, elements, size, className, transparent, }: GameHudProps): import("react/jsx-runtime").JSX.Element;
export declare namespace GameHud {
    var displayName: string;
}
