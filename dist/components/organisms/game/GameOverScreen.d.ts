import * as React from "react";
import { type EventBusContextType } from "../../../hooks/useEventBus";
export interface GameOverStat {
    /** Stat label */
    label: string;
    /** Stat value (required if bind is not provided) */
    value?: number | string;
    /**
     * Schema-style data binding (e.g., "player.score").
     * Alternative to value - used when stats come from schema render_ui effects.
     * Component will display 0 as placeholder since runtime binding is not implemented.
     */
    bind?: string;
    /** Display format */
    format?: "number" | "time" | "text";
    /** Icon */
    icon?: React.ReactNode;
}
export interface GameOverAction {
    /** Display label */
    label: string;
    /** Event to emit on click */
    event?: string;
    /** Page to navigate to */
    navigatesTo?: string;
    /** Button variant */
    variant?: "primary" | "secondary" | "ghost";
}
export interface GameOverScreenProps {
    /** Screen title (e.g., "Game Over", "Victory!") */
    title: string;
    /** Optional message */
    message?: string;
    /** Stats to display */
    stats?: GameOverStat[];
    /** Action buttons */
    actions?: GameOverAction[];
    /** Alias for actions (schema compatibility) */
    menuItems?: GameOverAction[];
    /** Called when an action is selected (legacy callback, prefer event bus) */
    onAction?: (action: GameOverAction) => void;
    /** Event bus for emitting UI events (optional, uses hook if not provided) */
    eventBus?: EventBusContextType;
    /** Victory or defeat variant */
    variant?: "victory" | "defeat" | "neutral";
    /** High score (optional, shows "NEW HIGH SCORE!" if exceeded) */
    highScore?: number | string;
    /** Current score for high score comparison (accepts string for schema bindings) */
    currentScore?: number | string;
    /** Additional CSS classes */
    className?: string;
}
export declare function GameOverScreen({ title, message, stats, actions, menuItems, onAction, eventBus: eventBusProp, variant, highScore, currentScore, className, }: GameOverScreenProps): import("react/jsx-runtime").JSX.Element;
export declare namespace GameOverScreen {
    var displayName: string;
}
