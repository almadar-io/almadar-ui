/**
 * CustomPattern Component
 *
 * Renders freeform elements with Tailwind classes for custom UI designs.
 * Uses Box with the `as` prop to render different element types.
 * Supports nested children and the closed circuit pattern (action prop for events).
 *
 * @packageDocumentation
 */
import React from "react";
/**
 * Allowed element types for custom patterns.
 */
export declare const ALLOWED_CUSTOM_COMPONENTS: readonly ["div", "span", "button", "a", "p", "h1", "h2", "h3", "h4", "h5", "h6", "header", "footer", "section", "article", "nav", "main", "aside", "ul", "ol", "li", "img", "label", "input", "form"];
export type AllowedCustomComponent = (typeof ALLOWED_CUSTOM_COMPONENTS)[number];
/**
 * Check if a component name is allowed.
 */
export declare function isAllowedComponent(component: string): component is AllowedCustomComponent;
/**
 * Check if an element is interactive (requires action for closed circuit).
 */
export declare function isInteractiveElement(component: string): boolean;
export interface CustomPatternProps {
    /** Element type to render */
    component: AllowedCustomComponent;
    /** Tailwind classes */
    className?: string;
    /** Token path(s) for design token resolution */
    token?: string | string[];
    /** Text content (for leaf elements) */
    content?: string;
    /** Event to emit on click (REQUIRED for interactive elements) */
    action?: string;
    /** Event payload */
    payload?: Record<string, unknown>;
    /** Nested children patterns */
    children?: React.ReactNode;
    /** Image source (for img elements) */
    src?: string;
    /** Image alt text (for img elements) */
    alt?: string;
    /** Link href (for a elements) */
    href?: string;
    /** Open link in new tab */
    external?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Additional HTML attributes */
    htmlProps?: Record<string, unknown>;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name */
    entity?: string;
}
/**
 * Renders a custom element with Tailwind styling.
 *
 * Follows the closed circuit pattern - interactive elements emit events via action prop.
 * Uses Box with `as` prop for all element types to comply with the design system.
 *
 * @example
 * ```tsx
 * <CustomPattern
 *   component="button"
 *   className="bg-blue-500 text-white px-4 py-2 rounded"
 *   action="SUBMIT"
 *   content="Submit"
 * />
 * ```
 */
export declare function CustomPattern({ component, className, content, action, payload, children, src, alt, href, external, disabled, htmlProps, }: CustomPatternProps): React.ReactElement | null;
export declare namespace CustomPattern {
    var displayName: string;
}
export interface CustomPatternConfig {
    type: "custom";
    component: AllowedCustomComponent;
    className?: string;
    token?: string | string[];
    content?: string;
    action?: string;
    payload?: Record<string, unknown>;
    children?: CustomPatternConfig[];
    src?: string;
    alt?: string;
    href?: string;
    external?: boolean;
    disabled?: boolean;
    [key: string]: unknown;
}
/**
 * Check if a pattern config is a custom pattern.
 */
export declare function isCustomPatternConfig(config: unknown): config is CustomPatternConfig;
/**
 * Recursively render custom pattern configurations.
 *
 * Use this to render nested custom patterns from render_ui effects.
 */
export declare function renderCustomPattern(config: CustomPatternConfig, key?: string | number): React.ReactElement;
export { ALLOWED_CUSTOM_COMPONENTS as CUSTOM_COMPONENT_TYPES };
