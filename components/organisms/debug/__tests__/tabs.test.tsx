/**
 * Tests for tab components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Import tabs
import { TraitsTab } from '../tabs/TraitsTab';
import { TicksTab } from '../tabs/TicksTab';
import { EntitiesTab } from '../tabs/EntitiesTab';
import { EventFlowTab } from '../tabs/EventFlowTab';
import { GuardsPanel } from '../tabs/GuardsPanel';

describe('TraitsTab', () => {
    it('shows empty state when no traits', () => {
        render(<TraitsTab traits={[]} />);
        expect(screen.getByText('No active traits')).toBeInTheDocument();
    });

    it('displays traits when provided', () => {
        const traits = [
            {
                id: 'trait-1',
                name: 'TestTrait',
                currentState: 'Idle',
                states: ['Idle', 'Active'],
                transitions: [],
                guards: [],
                lastStateChange: Date.now(),
                transitionCount: 5,
            },
        ];

        render(<TraitsTab traits={traits} />);
        expect(screen.getByText('TestTrait')).toBeInTheDocument();
        expect(screen.getByText('Idle')).toBeInTheDocument();
        expect(screen.getByText('5 transitions')).toBeInTheDocument();
    });
});

describe('TicksTab', () => {
    it('shows empty state when no ticks', () => {
        render(<TicksTab ticks={[]} />);
        expect(screen.getByText('No ticks registered')).toBeInTheDocument();
    });

    it('displays active ticks when provided', () => {
        const ticks = [
            {
                id: 'tick-1',
                name: 'updatePhysics',
                traitName: 'Physics2D',
                interval: 16,
                lastRun: Date.now(),
                executionTime: 1.5,
                guardPassed: true,
                runCount: 100,
                active: true,
            },
        ];

        render(<TicksTab ticks={ticks} />);
        expect(screen.getByText('updatePhysics')).toBeInTheDocument();
        expect(screen.getByText('Physics2D')).toBeInTheDocument();
        expect(screen.getByText('Active (1)')).toBeInTheDocument();
    });

    it('separates active and inactive ticks', () => {
        const ticks = [
            {
                id: 'tick-1',
                name: 'activeTick',
                traitName: 'Trait1',
                interval: 16,
                lastRun: Date.now(),
                executionTime: 1,
                guardPassed: true,
                runCount: 10,
                active: true,
            },
            {
                id: 'tick-2',
                name: 'inactiveTick',
                traitName: 'Trait2',
                interval: 32,
                lastRun: Date.now() - 10000,
                executionTime: 2,
                guardPassed: true,
                runCount: 5,
                active: false,
            },
        ];

        render(<TicksTab ticks={ticks} />);
        expect(screen.getByText('Active (1)')).toBeInTheDocument();
        expect(screen.getByText('Inactive (1)')).toBeInTheDocument();
    });
});

describe('EntitiesTab', () => {
    it('shows empty state when no snapshot', () => {
        render(<EntitiesTab snapshot={null} />);
        expect(screen.getByText('No entity data')).toBeInTheDocument();
    });

    it('shows empty state when snapshot has no entities', () => {
        render(
            <EntitiesTab
                snapshot={{
                    singletons: {},
                    runtime: [],
                    persistent: {},
                    timestamp: Date.now(),
                }}
            />
        );
        expect(screen.getByText('No entities')).toBeInTheDocument();
    });

    it('displays singletons when present', () => {
        render(
            <EntitiesTab
                snapshot={{
                    singletons: { Player: { x: 100, y: 200 } },
                    runtime: [],
                    persistent: {},
                    timestamp: Date.now(),
                }}
            />
        );
        expect(screen.getByText('Singletons (1)')).toBeInTheDocument();
        expect(screen.getByText('Player')).toBeInTheDocument();
    });
});

describe('EventFlowTab', () => {
    it('shows empty state when no events', () => {
        render(<EventFlowTab events={[]} />);
        expect(screen.getByText('No events yet')).toBeInTheDocument();
    });

    it('displays events when provided', () => {
        const events = [
            {
                id: 'evt-1',
                timestamp: Date.now(),
                type: 'trait' as const,
                source: 'TestTrait',
                message: 'State changed to Active',
            },
        ];

        render(<EventFlowTab events={events} />);
        expect(screen.getByText('TestTrait')).toBeInTheDocument();
        expect(screen.getByText('State changed to Active')).toBeInTheDocument();
    });

    it('shows filter buttons', () => {
        const events = [
            {
                id: 'evt-1',
                timestamp: Date.now(),
                type: 'trait' as const,
                source: 'Test',
                message: 'msg',
            },
        ];

        render(<EventFlowTab events={events} />);
        expect(screen.getByText(/All/)).toBeInTheDocument();
    });
});

describe('GuardsPanel', () => {
    it('shows empty state when no guards', () => {
        render(<GuardsPanel guards={[]} />);
        expect(screen.getByText('No guard evaluations')).toBeInTheDocument();
    });

    it('displays guard evaluations', () => {
        const guards = [
            {
                id: 'guard-1',
                timestamp: Date.now(),
                guardName: 'canMove',
                expression: 'velocity > 0',
                context: {
                    type: 'transition' as const,
                    traitName: 'Movement',
                    transitionFrom: 'Idle',
                    transitionTo: 'Moving',
                    transitionEvent: 'MOVE',
                },
                inputs: { velocity: 5 },
                result: true,
            },
        ];

        render(<GuardsPanel guards={guards} />);
        expect(screen.getByText('canMove')).toBeInTheDocument();
        expect(screen.getByText('✓ 1')).toBeInTheDocument();
    });

    it('shows pass/fail counts', () => {
        const guards = [
            {
                id: 'guard-1',
                timestamp: Date.now(),
                guardName: 'pass',
                expression: 'true',
                context: { type: 'transition' as const, traitName: 'T' },
                inputs: {},
                result: true,
            },
            {
                id: 'guard-2',
                timestamp: Date.now(),
                guardName: 'fail',
                expression: 'false',
                context: { type: 'transition' as const, traitName: 'T' },
                inputs: {},
                result: false,
            },
        ];

        render(<GuardsPanel guards={guards} />);
        expect(screen.getByText('✓ 1')).toBeInTheDocument();
        expect(screen.getByText('✗ 1')).toBeInTheDocument();
    });
});
