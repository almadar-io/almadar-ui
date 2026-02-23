import { type EventBusContextType } from "../../../hooks/useEventBus";
export interface MenuOption {
    /** Optional ID (generated from index if not provided) */
    id?: string;
    /** Display label */
    label: string;
    /** Event to emit on click */
    event?: string;
    /** Page to navigate to */
    navigatesTo?: string;
    /** Button variant */
    variant?: "primary" | "secondary" | "ghost" | string;
    /** Whether the option is disabled */
    disabled?: boolean;
    /** Sub-label or description */
    subLabel?: string;
    /** Action identifier (alternative to event) */
    action?: string;
}
export interface GameMenuProps {
    /** Menu title */
    title: string;
    /** Optional subtitle or version */
    subtitle?: string;
    /** Menu options - accepts readonly for compatibility with generated const arrays */
    options?: readonly MenuOption[];
    /** Alias for options (schema compatibility) */
    menuItems?: readonly MenuOption[];
    /** Called when an option is selected (legacy callback, prefer event bus) */
    onSelect?: (option: MenuOption) => void;
    /** Event bus for emitting UI events (optional, uses hook if not provided) */
    eventBus?: EventBusContextType;
    /** Background image or gradient */
    background?: string;
    /** Logo image URL */
    logo?: string;
    /** Additional CSS classes */
    className?: string;
}
export declare function GameMenu({ title, subtitle, options, menuItems, onSelect, eventBus: eventBusProp, background, logo, className, }: GameMenuProps): import("react/jsx-runtime").JSX.Element;
export declare namespace GameMenu {
    var displayName: string;
}
