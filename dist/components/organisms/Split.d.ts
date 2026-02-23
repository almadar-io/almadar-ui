/**
 * Split Component
 *
 * A two-column layout with configurable ratios.
 * Perfect for sidebar/content layouts or side-by-side comparisons.
 */
import React from 'react';
export type SplitRatio = '1:1' | '1:2' | '2:1' | '1:3' | '3:1' | '1:4' | '4:1' | '2:3' | '3:2';
export type SplitGap = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export interface SplitProps {
    /** Size ratio between left and right panels */
    ratio?: SplitRatio;
    /** Gap between panels */
    gap?: SplitGap;
    /** Reverse the order (right first) */
    reverse?: boolean;
    /** Stack vertically on mobile */
    stackOnMobile?: boolean;
    /** Breakpoint to switch from stacked to side-by-side */
    stackBreakpoint?: 'sm' | 'md' | 'lg' | 'xl';
    /** Align items vertically */
    align?: 'start' | 'center' | 'end' | 'stretch';
    /** Custom class name */
    className?: string;
    /** Left/first panel class name */
    leftClassName?: string;
    /** Right/second panel class name */
    rightClassName?: string;
    /** Exactly two children: [left, right] */
    children: [React.ReactNode, React.ReactNode];
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
/**
 * Split - Two-column layout with flexible ratios
 */
export declare const Split: React.FC<SplitProps>;
export default Split;
