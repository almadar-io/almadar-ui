/**
 * StateIndicator — animated game-entity state pill (distinct from core Badge atom).
 * Badge is a static text label. StateIndicator maps a state string (idle/active/
 * moving/…) to icon + bg colour + optional pulse via a style registry that callers
 * can extend. Use it in game HUDs where the entity state machine drives the display.
 */

import React from 'react';
import { Box } from '../../core/atoms/Box';
import { Icon, type IconInput } from '../../core/atoms/Icon';
import { cn } from '../../../lib/cn';

export interface StateStyle {
    icon: IconInput;
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

const DEFAULT_STATE_STYLES: Record<string, StateStyle> = {
    idle: { icon: '\u23F8', bgClass: 'bg-muted' },
    active: { icon: '\u25B6', bgClass: 'bg-success' },
    sleeping: { icon: '\uD83D\uDCA4', bgClass: 'bg-muted' },
    moving: { icon: '\uD83D\uDEB6', bgClass: 'bg-info' },
    eating: { icon: '\uD83C\uDF7D\uFE0F', bgClass: 'bg-success' },
    waiting: { icon: '\u23F3', bgClass: 'bg-warning' },
    happy: { icon: '\uD83D\uDE0A', bgClass: 'bg-success' },
    scared: { icon: '\uD83D\uDE28', bgClass: 'bg-error' },
    done: { icon: '\u2713', bgClass: 'bg-success' },
    error: { icon: '\u2717', bgClass: 'bg-error' },
    ready: { icon: '\u2713', bgClass: 'bg-success' },
    cooldown: { icon: '\uD83D\uDD04', bgClass: 'bg-warning' },
};

const DEFAULT_STYLE: StateStyle = { icon: '?', bgClass: 'bg-muted' };

const SIZE_CLASSES = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
};

export function StateIndicator({
    state,
    label,
    size = 'md',
    animated = true,
    stateStyles,
    className,
}: StateIndicatorProps): React.JSX.Element {
    const mergedStyles = stateStyles
        ? { ...DEFAULT_STATE_STYLES, ...stateStyles }
        : DEFAULT_STATE_STYLES;
    const config = mergedStyles[state.toLowerCase()] || DEFAULT_STYLE;
    const displayLabel = label || state.charAt(0).toUpperCase() + state.slice(1);

    return (
        <Box
            display="inline-flex"
            className={cn(
                'items-center gap-1 rounded-full text-foreground font-medium',
                config.bgClass,
                SIZE_CLASSES[size],
                animated && state.toLowerCase() !== 'idle' && state.toLowerCase() !== 'done' && 'animate-pulse',
                className,
            )}
        >
            <Box as="span">
              {typeof config.icon === 'string'
                ? /^[a-zA-Z0-9-]+$/.test(config.icon)
                  ? <Icon name={config.icon} />
                  : config.icon
                : <Icon icon={config.icon} />}
            </Box>
            <Box as="span">{displayLabel}</Box>
        </Box>
    );
}

StateIndicator.displayName = 'StateIndicator';

export default StateIndicator;
