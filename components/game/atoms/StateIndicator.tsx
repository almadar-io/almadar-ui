import React from 'react';
import { Box } from '../../core/atoms/Box';
import { Icon, type IconInput } from '../../core/atoms/Icon';
import { cn } from '../../../lib/cn';
import { GameIcon } from '../../core/atoms/GameIcon';
import type { Asset } from '@almadar/core';

export interface StateStyle {
    icon: IconInput;
    bgClass: string;
}

const DEFAULT_ASSET_URL: Asset = {
  url: 'https://almadar-kflow-assets.web.app/shared/isometric-dungeon/Isometric/chestClosed_E.png',
  role: 'ui',
  category: 'state',
};

export type StateIndicatorState =
    | 'idle'
    | 'active'
    | 'sleeping'
    | 'moving'
    | 'eating'
    | 'waiting'
    | 'happy'
    | 'scared'
    | 'done'
    | 'error'
    | 'ready'
    | 'cooldown';

export interface StateIndicatorProps {
    /** Sprite image URL — takes precedence over the state icon when provided */
    assetUrl?: Asset;
    /** The current state — known values get a styled indicator, unknown values fall back to default */
    state: StateIndicatorState | string;
    /** Optional label override */
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

const DEFAULT_STATE_STYLES: Record<StateIndicatorState, StateStyle> = {
    idle:     { icon: '⏸', bgClass: 'bg-muted' },
    active:   { icon: '▶', bgClass: 'bg-success' },
    sleeping: { icon: '💤', bgClass: 'bg-muted' },
    moving:   { icon: '🚶', bgClass: 'bg-info' },
    eating:   { icon: '🍽️', bgClass: 'bg-success' },
    waiting:  { icon: '⏳', bgClass: 'bg-warning' },
    happy:    { icon: '😊', bgClass: 'bg-success' },
    scared:   { icon: '😨', bgClass: 'bg-error' },
    done:     { icon: '✓', bgClass: 'bg-success' },
    error:    { icon: '✗', bgClass: 'bg-error' },
    ready:    { icon: '✓', bgClass: 'bg-success' },
    cooldown: { icon: '🔄', bgClass: 'bg-warning' },
};

const DEFAULT_STYLE: StateStyle = { icon: '?', bgClass: 'bg-muted' };

const STATIC_STATES = new Set<StateIndicatorState>(['idle', 'done']);

function isKnownState(s: string): s is StateIndicatorState {
    return s in DEFAULT_STATE_STYLES;
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
};

export function StateIndicator({
    assetUrl = DEFAULT_ASSET_URL,
    state = 'idle',
    label,
    size = 'md',
    animated = true,
    stateStyles,
    className,
}: StateIndicatorProps): React.JSX.Element {
    const mergedStyles: Record<string, StateStyle> = stateStyles
        ? { ...DEFAULT_STATE_STYLES, ...stateStyles }
        : DEFAULT_STATE_STYLES;
    const knownState = isKnownState(state) ? state : null;
    const config = knownState !== null ? (mergedStyles[knownState] ?? DEFAULT_STYLE) : DEFAULT_STYLE;
    const displayLabel = label ?? (state.charAt(0).toUpperCase() + state.slice(1));

    return (
        <Box
            display="inline-flex"
            className={cn(
                'items-center gap-1 rounded-full text-foreground font-medium',
                config.bgClass,
                SIZE_CLASSES[size],
                animated && (knownState === null || !STATIC_STATES.has(knownState)) && 'animate-pulse',
                className,
            )}
        >
            <Box as="span">
              {assetUrl ? (
                <GameIcon assetUrl={assetUrl} icon="image" size={16} alt={displayLabel} className="flex-shrink-0" />
              ) : typeof config.icon === 'string'
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
