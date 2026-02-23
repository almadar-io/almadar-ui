/**
 * Container Component
 *
 * A max-width wrapper that centers content horizontally.
 * Essential for controlling page width and maintaining consistent margins.
 */
import React from 'react';
export type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export interface ContainerProps {
    /** Maximum width */
    size?: ContainerSize;
    /** Alias for size (pattern compatibility) */
    maxWidth?: ContainerSize;
    /** Horizontal padding */
    padding?: ContainerPadding;
    /** Center horizontally */
    center?: boolean;
    /** Custom class name */
    className?: string;
    /** Children elements */
    children?: React.ReactNode;
    /** HTML element to render as */
    as?: React.ElementType;
}
/**
 * Container - Centers and constrains content width
 */
export declare const Container: React.FC<ContainerProps>;
export default Container;
