/**
 * Flex Component
 *
 * A flexbox wrapper with all common flex properties exposed as props.
 * More explicit than Stack for when you need full flex control.
 */
import React from 'react';
export type FlexDirection = 'row' | 'row-reverse' | 'col' | 'col-reverse';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export type FlexGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export interface FlexProps {
    /** Flex direction */
    direction?: FlexDirection;
    /** Flex wrap */
    wrap?: FlexWrap;
    /** Align items */
    align?: FlexAlign;
    /** Justify content */
    justify?: FlexJustify;
    /** Gap between items */
    gap?: FlexGap;
    /** Inline flex */
    inline?: boolean;
    /** Flex grow */
    grow?: boolean | number;
    /** Flex shrink */
    shrink?: boolean | number;
    /** Flex basis */
    basis?: string | number;
    /** Custom class name */
    className?: string;
    /** Children elements */
    children: React.ReactNode;
    /** HTML element to render as */
    as?: React.ElementType;
}
/**
 * Flex - Full-featured flexbox container
 */
export declare const Flex: React.FC<FlexProps>;
export default Flex;
