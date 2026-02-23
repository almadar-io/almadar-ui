/**
 * StateIndicator Component
 *
 * Displays a visual indicator for a game entity's current state.
 * Generic — not tied to any specific game. Projects can extend
 * the state styles via the `stateStyles` prop.
 */
import React from 'react';
export interface StateStyle {
    icon: string;
    bgClass: string;
}
export interface StateIndicatorProps {
    /** The current state name */
    state: string;
    /** Optional label override (defaults to capitalized state name) */
    label?: string;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Whether to show pulse animation on non-idle states */
    animated?: boolean;
    /** Custom state styles to extend/override defaults */
    stateStyles?: Record<string, StateStyle>;
    /** Additional CSS classes */
    className?: string;
}
export declare function StateIndicator({ state, label, size, animated, stateStyles, className, }: StateIndicatorProps): React.JSX.Element;
export declare namespace StateIndicator {
    var displayName: string;
}
export default StateIndicator;
