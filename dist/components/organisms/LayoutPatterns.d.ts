/**
 * Layout Pattern Components
 *
 * Pattern wrappers for layout components that support recursive rendering
 * of nested patterns via the `children` prop.
 *
 * These components bridge the shell's layout primitives (Stack, Box, Grid, etc.)
 * with the pattern system's recursive rendering capability.
 *
 * @packageDocumentation
 */
import React from 'react';
import { type StackGap, type StackAlign, type StackJustify } from '../atoms/Stack';
import { type BoxPadding, type BoxBg, type BoxRounded, type BoxShadow } from '../atoms/Box';
import { type GridCols, type GridGap, type ResponsiveGridCols } from '../molecules/Grid';
import { type DividerVariant, type DividerOrientation } from '../atoms/Divider';
/**
 * Base props for all layout patterns with children support.
 */
export interface LayoutPatternProps {
    /** Nested pattern configurations - rendered recursively */
    children?: React.ReactNode;
    /** Additional CSS classes */
    className?: string;
    /** Inline styles */
    style?: React.CSSProperties;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name */
    entity?: string;
}
export interface VStackPatternProps extends LayoutPatternProps {
    /** Gap between children */
    gap?: StackGap;
    /** Cross-axis alignment */
    align?: StackAlign;
    /** Main-axis alignment */
    justify?: StackJustify;
}
/**
 * VStack pattern component.
 *
 * Renders children in a vertical stack with configurable spacing.
 */
export declare function VStackPattern({ gap, align, justify, className, style, children, }: VStackPatternProps): React.ReactElement;
export declare namespace VStackPattern {
    var displayName: string;
}
export interface HStackPatternProps extends LayoutPatternProps {
    /** Gap between children */
    gap?: StackGap;
    /** Cross-axis alignment */
    align?: StackAlign;
    /** Main-axis alignment */
    justify?: StackJustify;
    /** Enable wrapping */
    wrap?: boolean;
}
/**
 * HStack pattern component.
 *
 * Renders children in a horizontal stack with configurable spacing.
 */
export declare function HStackPattern({ gap, align, justify, wrap, className, style, children, }: HStackPatternProps): React.ReactElement;
export declare namespace HStackPattern {
    var displayName: string;
}
export interface BoxPatternProps extends LayoutPatternProps {
    /** Padding shorthand */
    p?: BoxPadding;
    /** Margin shorthand */
    m?: BoxPadding;
    /** Background color token */
    bg?: BoxBg;
    /** Show border */
    border?: boolean;
    /** Border radius */
    radius?: BoxRounded;
    /** Shadow level */
    shadow?: BoxShadow;
}
/**
 * Box pattern component.
 *
 * Generic styled container with theming support.
 */
export declare function BoxPattern({ p, m, bg, border, radius, shadow, className, style, children, }: BoxPatternProps): React.ReactElement;
export declare namespace BoxPattern {
    var displayName: string;
}
export interface GridPatternProps extends LayoutPatternProps {
    /** Number of columns */
    cols?: GridCols | ResponsiveGridCols;
    /** Gap between cells */
    gap?: GridGap;
    /** Row gap override */
    rowGap?: GridGap;
    /** Column gap override */
    colGap?: GridGap;
}
/**
 * Grid pattern component.
 *
 * CSS Grid layout for multi-column content.
 */
export declare function GridPattern({ cols, gap, rowGap, colGap, className, style, children, }: GridPatternProps): React.ReactElement;
export declare namespace GridPattern {
    var displayName: string;
}
export interface CenterPatternProps extends LayoutPatternProps {
    /** Minimum height */
    minHeight?: string;
}
/**
 * Center pattern component.
 *
 * Centers content horizontally and vertically.
 */
export declare function CenterPattern({ minHeight, className, style, children, }: CenterPatternProps): React.ReactElement;
export declare namespace CenterPattern {
    var displayName: string;
}
export interface SpacerPatternProps {
    /** Size or 'flex' for flexible */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'flex';
    /** Additional CSS classes */
    className?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name */
    entity?: string;
}
/**
 * Spacer pattern component.
 *
 * Flexible space that expands or has fixed size.
 */
export declare function SpacerPattern({ size }: SpacerPatternProps): React.ReactElement;
export declare namespace SpacerPattern {
    var displayName: string;
}
export interface DividerPatternProps {
    /** Orientation */
    orientation?: DividerOrientation;
    /** Line style */
    variant?: DividerVariant;
    /** Color token */
    color?: string;
    /** Spacing around divider */
    spacing?: 'xs' | 'sm' | 'md' | 'lg';
    /** Additional CSS classes */
    className?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name */
    entity?: string;
}
/**
 * Divider pattern component.
 *
 * Visual separator between sections.
 */
export declare function DividerPattern({ orientation, variant, spacing, }: DividerPatternProps): React.ReactElement;
export declare namespace DividerPattern {
    var displayName: string;
}
export declare const LAYOUT_PATTERNS: {
    readonly vstack: typeof VStackPattern;
    readonly hstack: typeof HStackPattern;
    readonly box: typeof BoxPattern;
    readonly grid: typeof GridPattern;
    readonly center: typeof CenterPattern;
    readonly spacer: typeof SpacerPattern;
    readonly divider: typeof DividerPattern;
};
