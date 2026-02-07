/**
 * TraitStateViewer Component
 *
 * Displays a mini state machine visualization for a trait.
 * Shows states as nodes, transitions as arrows, and highlights current state.
 */

import React from 'react';
import { Box, Typography, cn } from '@almadar/ui';
import { StateIndicator, TraitState } from '../atoms/StateIndicator';

export interface TraitTransition {
    from: string;
    to: string;
    event: string;
    guardHint?: string;
}

export interface TraitStateMachineDefinition {
    name: string;
    states: string[];
    currentState: string;
    transitions: TraitTransition[];
    description?: string;
}

/** @deprecated Use TraitStateMachineDefinition instead */
export type TraitDefinition = TraitStateMachineDefinition;

export interface TraitStateViewerProps {
    /** The trait to visualize */
    trait: TraitDefinition;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Whether to show transition labels */
    showTransitions?: boolean;
    /** Click handler for states */
    onStateClick?: (state: string) => void;
    /** Additional CSS classes */
    className?: string;
}

const sizeConfig = {
    sm: { nodeSize: 'min-w-12 h-8', fontSize: 'text-xs', gap: 'gap-2' },
    md: { nodeSize: 'min-w-16 h-10', fontSize: 'text-sm', gap: 'gap-4' },
    lg: { nodeSize: 'min-w-20 h-12', fontSize: 'text-base', gap: 'gap-6' },
};

export function TraitStateViewer({
    trait,
    size = 'md',
    showTransitions = true,
    onStateClick,
    className,
}: TraitStateViewerProps): JSX.Element {
    const config = sizeConfig[size];

    // Map state names to TraitState enum values
    const mapToTraitState = (stateName: string): TraitState => {
        const stateMap: Record<string, TraitState> = {
            idle: 'idle',
            active: 'active',
            attacking: 'attacking',
            defending: 'defending',
            casting: 'casting',
            recovering: 'recovering',
            cooldown: 'cooldown',
        };
        return stateMap[stateName.toLowerCase()] || 'idle';
    };

    // Get transitions from current state
    const currentTransitions = trait.transitions.filter(t => t.from === trait.currentState);

    return (
        <Box
            display="flex"
            className={cn(
                'flex-col p-3 rounded-lg bg-card border border-border',
                className
            )}
        >
            {/* Trait Header */}
            <Box display="flex" className="items-center justify-between mb-3">
                <Typography variant="body2" className="text-foreground font-bold">
                    {trait.name}
                </Typography>
                <StateIndicator state={mapToTraitState(trait.currentState)} size="sm" />
            </Box>

            {/* Description */}
            {trait.description && (
                <Typography variant="caption" className="text-muted-foreground mb-3" overflow="wrap">
                    {trait.description}
                </Typography>
            )}

            {/* State Nodes */}
            <Box display="flex" className={cn('flex-wrap', config.gap)}>
                {trait.states.map((state) => {
                    const isCurrent = state === trait.currentState;
                    const hasOutgoing = trait.transitions.some(t => t.from === state);

                    return (
                        <Box
                            key={state}
                            display="flex"
                            className={cn(
                                'items-center justify-center rounded-md border-2 transition-all px-2',
                                config.nodeSize,
                                isCurrent && 'bg-primary/20 border-primary shadow-md shadow-primary/20',
                                !isCurrent && hasOutgoing && 'bg-muted border-border hover:border-muted-foreground',
                                !isCurrent && !hasOutgoing && 'bg-background border-border opacity-60',
                                onStateClick && 'cursor-pointer'
                            )}
                            onClick={() => onStateClick?.(state)}
                        >
                            <Typography
                                variant="caption"
                                className={cn(
                                    config.fontSize,
                                    'whitespace-nowrap',
                                    isCurrent ? 'text-primary font-bold' : 'text-foreground/80'
                                )}
                            >
                                {state}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {/* Available Transitions from Current State */}
            {showTransitions && currentTransitions.length > 0 && (
                <Box className="mt-3 pt-3 border-t border-border">
                    <Typography variant="caption" className="text-muted-foreground mb-2 block">
                        Available Actions:
                    </Typography>
                    <Box display="flex" className="flex-wrap gap-2">
                        {currentTransitions.map((transition, i) => (
                            <Box
                                key={i}
                                display="inline-flex"
                                className="items-center gap-1 px-2 py-1 rounded bg-muted text-xs"
                            >
                                <span className="text-accent">{transition.event}</span>
                                <span className="text-muted-foreground">→</span>
                                <span className="text-success">{transition.to}</span>
                                {transition.guardHint && (
                                    <span className="text-warning ml-1" title={transition.guardHint}>⚠</span>
                                )}
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default TraitStateViewer;
