/**
 * Box Component
 *
 * A versatile layout primitive that provides spacing, background, border, and shadow controls.
 * Think of it as a styled div with consistent design tokens.
 */
import React from "react";
export type BoxPadding = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type BoxMargin = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "auto";
export type BoxBg = "transparent" | "primary" | "secondary" | "muted" | "accent" | "surface" | "overlay";
export type BoxRounded = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
export type BoxShadow = "none" | "sm" | "md" | "lg" | "xl";
export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Padding on all sides */
    padding?: BoxPadding;
    /** Horizontal padding (overrides padding for x-axis) */
    paddingX?: BoxPadding;
    /** Vertical padding (overrides padding for y-axis) */
    paddingY?: BoxPadding;
    /** Margin on all sides */
    margin?: BoxMargin;
    /** Horizontal margin */
    marginX?: BoxMargin;
    /** Vertical margin */
    marginY?: BoxMargin;
    /** Background color */
    bg?: BoxBg;
    /** Show border */
    border?: boolean;
    /** Border radius */
    rounded?: BoxRounded;
    /** Box shadow */
    shadow?: BoxShadow;
    /** Display type */
    display?: "block" | "inline" | "inline-block" | "flex" | "inline-flex" | "grid";
    /** Fill available width */
    fullWidth?: boolean;
    /** Fill available height */
    fullHeight?: boolean;
    /** Overflow behavior */
    overflow?: "auto" | "hidden" | "visible" | "scroll";
    /** Position */
    position?: "relative" | "absolute" | "fixed" | "sticky";
    /** HTML element to render as */
    as?: React.ElementType;
    /** Declarative event name — emits UI:{action} via eventBus on click */
    action?: string;
    /** Payload to include with the action event */
    actionPayload?: Record<string, unknown>;
    /** Declarative hover event — emits UI:{hoverEvent} with { hovered: true/false } on mouseEnter/mouseLeave */
    hoverEvent?: string;
}
/**
 * Box - Versatile container component with design tokens
 */
export declare const Box: React.ForwardRefExoticComponent<BoxProps & React.RefAttributes<HTMLDivElement>>;
export default Box;
