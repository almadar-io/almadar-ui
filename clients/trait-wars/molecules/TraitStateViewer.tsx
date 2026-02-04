/**
 * TraitStateViewer Component
 *
 * Displays a mini state machine visualization for a trait.
 * Shows states as nodes, transitions as arrows, and highlights current state.
 */

import React from 'react';
import { Box } from '../../../components/atoms/Box';
import { Typography } from '../../../components/atoms/Typography';
import { StateIndicator, TraitState } from '../atoms/StateIndicator';
import { cn } from '../../../lib/cn';

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
    sm: { nodeSize: 'w-12 h-8', fontSize: 'text-xs', gap: 'gap-2' },
    md: { nodeSize: 'w-16 h-10', fontSize: 'text-sm', gap: 'gap-4' },
    lg: { nodeSize: 'w-20 h-12', fontSize: 'text-base', gap: 'gap-6' },
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
                'flex-col p-3 rounded-lg bg-gray-800 border border-gray-600',
                className
            )}
        >
            {/* Trait Header */}
            <Box display="flex" className="items-center justify-between mb-3">
                <Typography variant="body2" className="text-white font-bold">
                    {trait.name}
                </Typography>
                <StateIndicator state={mapToTraitState(trait.currentState)} size="sm" />
            </Box>

            {/* Description */}
            {trait.description && (
                <Typography variant="caption" className="text-gray-400 mb-3">
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
                                'items-center justify-center rounded-md border-2 transition-all',
                                config.nodeSize,
                                isCurrent && 'bg-yellow-500/20 border-yellow-400 shadow-md shadow-yellow-400/20',
                                !isCurrent && hasOutgoing && 'bg-gray-700 border-gray-500 hover:border-gray-400',
                                !isCurrent && !hasOutgoing && 'bg-gray-900 border-gray-700 opacity-60',
                                onStateClick && 'cursor-pointer'
                            )}
                            onClick={() => onStateClick?.(state)}
                        >
                            <Typography
                                variant="caption"
                                className={cn(
                                    config.fontSize,
                                    isCurrent ? 'text-yellow-300 font-bold' : 'text-gray-300'
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
                <Box className="mt-3 pt-3 border-t border-gray-700">
                    <Typography variant="caption" className="text-gray-500 mb-2 block">
                        Available Actions:
                    </Typography>
                    <Box display="flex" className="flex-wrap gap-2">
                        {currentTransitions.map((transition, i) => (
                            <Box
                                key={i}
                                display="inline-flex"
                                className="items-center gap-1 px-2 py-1 rounded bg-gray-700 text-xs"
                            >
                                <span className="text-cyan-400">{transition.event}</span>
                                <span className="text-gray-500">→</span>
                                <span className="text-green-400">{transition.to}</span>
                                {transition.guardHint && (
                                    <span className="text-orange-400 ml-1" title={transition.guardHint}>⚠</span>
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
