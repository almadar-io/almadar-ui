/**
 * Icon Atom Component
 *
 * A wrapper component for Lucide icons with consistent sizing and styling.
 * Uses theme-aware CSS variables for stroke width and color.
 *
 * Supports two APIs:
 * - `icon` prop: Pass a LucideIcon component directly
 * - `name` prop: Pass a string icon name (resolved from iconMap)
 */
import React from 'react';
import type { LucideIcon } from 'lucide-react';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconAnimation = 'spin' | 'pulse' | 'none';
/**
 * Resolve an icon name to a Lucide icon component.
 * Falls back to HelpCircle if not found.
 */
export declare function resolveIcon(name: string): LucideIcon;
export interface IconProps {
    /** Lucide icon component (preferred for type-safe usage) */
    icon?: LucideIcon;
    /** Icon name as string (resolved from iconMap) */
    name?: string;
    /** Size of the icon */
    size?: IconSize;
    /** Color class (Tailwind color class) or 'inherit' for theme default */
    color?: string;
    /** Animation type */
    animation?: IconAnimation;
    /** Additional CSS classes */
    className?: string;
    /** Icon stroke width - uses theme default if not specified */
    strokeWidth?: number;
    /** Inline style */
    style?: React.CSSProperties;
}
export declare const Icon: React.FC<IconProps>;
