/**
 * Stack Component
 *
 * A layout primitive for arranging children in a vertical or horizontal stack with consistent spacing.
 * Includes convenience exports VStack and HStack for common use cases.
 */
import React from "react";
export type StackDirection = "horizontal" | "vertical";
export type StackGap = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
export interface StackProps {
    /** Stack direction */
    direction?: StackDirection;
    /** Gap between children */
    gap?: StackGap;
    /** Align items on the cross axis */
    align?: StackAlign;
    /** Justify items on the main axis */
    justify?: StackJustify;
    /** Allow items to wrap */
    wrap?: boolean;
    /** Reverse the order of children */
    reverse?: boolean;
    /** Fill available space (flex: 1) */
    flex?: boolean;
    /** Custom class name */
    className?: string;
    /** Inline styles */
    style?: React.CSSProperties;
    /** Children elements */
    children?: React.ReactNode;
    /** HTML element to render as */
    as?: React.ElementType;
    /** Click handler */
    onClick?: (e: React.MouseEvent) => void;
    /** Keyboard handler */
    onKeyDown?: (e: React.KeyboardEvent) => void;
    /** Role for accessibility */
    role?: string;
    /** Tab index for focus management */
    tabIndex?: number;
    /** Declarative event name — emits UI:{action} via eventBus on click */
    action?: string;
    /** Payload to include with the action event */
    actionPayload?: Record<string, unknown>;
}
/**
 * Stack - Flexible layout component for arranging children
 */
export declare const Stack: React.FC<StackProps>;
/**
 * VStack - Vertical stack shorthand
 */
export interface VStackProps extends Omit<StackProps, "direction"> {
}
export declare const VStack: React.FC<VStackProps>;
/**
 * HStack - Horizontal stack shorthand
 */
export interface HStackProps extends Omit<StackProps, "direction"> {
}
export declare const HStack: React.FC<HStackProps>;
export default Stack;
