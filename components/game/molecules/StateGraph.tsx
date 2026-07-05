/**
 * StateGraph (molecule)
 *
 * Dumb visual renderer for a state-machine graph: lays states out on a circle,
 * draws the player's transitions as SVG arrows, and emits a node-click event.
 * All state (which transitions exist, the pending "from" selection, test results)
 * lives in the .lolo FSM — this molecule only renders and reports clicks.
 */
import * as React from 'react';
import { Box, type Point } from '../../core/atoms/index';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import type { EventKey } from '@almadar/core';
import { StateNode } from './StateNode';
import { TransitionArrow } from './TransitionArrow';

export interface StateGraphTransition {
    from: string;
    to: string;
    event: string;
    guardHint?: string;
}

export interface StateGraphProps {
    /** All states in the machine (node labels). */
    states: string[];
    /** Player-built transitions rendered as arrows. */
    transitions?: StateGraphTransition[];
    /** State highlighted as current (test playback / initial). */
    currentState?: string;
    /** State the player has selected (first click). */
    selectedState?: string;
    /** When set, the graph is in "pick a target" mode from this state. */
    addingFrom?: string;
    /** The machine's initial state (ring-marked). */
    initialState?: string;
    /** Graph canvas width. */
    width?: number;
    /** Graph canvas height. */
    height?: number;
    /** Emits UI:{nodeClickEvent} with { stateId } when a node is clicked. */
    nodeClickEvent?: EventKey;
    className?: string;
}

function layoutStates(states: string[], width: number, height: number): Record<string, Point> {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 60;
    const positions: Record<string, Point> = {};
    states.forEach((state, i) => {
        const angle = (2 * Math.PI * i) / Math.max(states.length, 1) - Math.PI / 2;
        positions[state] = { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    });
    return positions;
}

export function StateGraph({
    states,
    transitions = [],
    currentState,
    selectedState,
    addingFrom,
    initialState,
    width = 500,
    height = 400,
    nodeClickEvent,
    className,
}: StateGraphProps): React.JSX.Element {
    const eventBus = useEventBus();
    const nodes = states ?? [];
    const positions = React.useMemo(() => layoutStates(nodes, width, height), [nodes, width, height]);

    return (
        <Box
            position="relative"
            className={cn('rounded-container border border-border bg-background overflow-hidden', className)}
            style={{ width, height }}
        >
            <svg width={width} height={height} className="absolute inset-0" style={{ pointerEvents: 'none' }}>
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-border)" />
                    </marker>
                    <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-primary)" />
                    </marker>
                </defs>
                {transitions.map((tr, i) => {
                    const fromPos = positions[tr.from];
                    const toPos = positions[tr.to];
                    if (!fromPos || !toPos) return null;
                    return (
                        <TransitionArrow
                            key={`${tr.from}-${tr.event}-${tr.to}-${i}`}
                            from={fromPos}
                            to={toPos}
                            eventLabel={tr.event}
                            guardHint={tr.guardHint}
                            isActive={tr.from === currentState}
                        />
                    );
                })}
            </svg>
            {nodes.map(state => {
                const pos = positions[state];
                if (!pos) return null;
                return (
                    <StateNode
                        key={state}
                        name={state}
                        position={pos}
                        isCurrent={state === currentState}
                        isSelected={state === selectedState || state === addingFrom}
                        isInitial={state === initialState}
                        onClick={nodeClickEvent ? () => eventBus.emit(`UI:${nodeClickEvent}`, { stateId: state }) : undefined}
                    />
                );
            })}
        </Box>
    );
}
