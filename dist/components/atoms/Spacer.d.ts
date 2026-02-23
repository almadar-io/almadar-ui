/**
 * Spacer Component
 *
 * A flexible spacer that expands to fill available space in a flex container.
 * Useful for pushing elements apart or creating consistent spacing.
 */
import React from 'react';
export type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'auto';
export interface SpacerProps {
    /** Fixed size (auto = flex grow) */
    size?: SpacerSize;
    /** Orientation (for fixed sizes) */
    axis?: 'horizontal' | 'vertical';
    /** Custom class name */
    className?: string;
}
/**
 * Spacer - Flexible spacing element for flex layouts
 *
 * Usage:
 * - size="auto" (default): Expands to fill available space (flex: 1)
 * - size="md": Fixed size spacing
 */
export declare const Spacer: React.FC<SpacerProps>;
export default Spacer;
