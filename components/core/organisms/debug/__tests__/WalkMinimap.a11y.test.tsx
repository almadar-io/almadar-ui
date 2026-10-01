import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WalkMinimap } from '../WalkMinimap';
import { EventBusProvider } from '../../../../../providers/EventBusProvider';
import { axeViolations, describeViolations } from '../../../../../test/axe';

afterEach(() => {
  Object.assign(window, { __orbitalWalkStep: undefined, __orbitalWalkTraits: undefined, __orbitalCoveredEdges: undefined });
});

describe('WalkMinimap a11y', () => {
  it('marks the active trait as the current step, spells out done/pending, and names the graph', async () => {
    Object.assign(window, {
      __orbitalWalkStep: { from: 'idle', event: 'GO', to: 'busy', guardCase: null, isRepositioning: false, accepted: true, stepIndex: 1, stepTotal: 3, traitName: 'TaskB', phase: 'engine' },
      __orbitalWalkTraits: [
        { name: 'TaskA', initialState: 'idle', states: ['idle'], transitions: [] },
        { name: 'TaskB', initialState: 'idle', states: ['idle', 'busy'], transitions: [{ from: 'idle', to: 'busy', event: 'GO' }] },
        { name: 'TaskC', initialState: 'idle', states: ['idle'], transitions: [] },
      ],
      __orbitalCoveredEdges: [],
    });
    const { container } = render(<EventBusProvider debug={false}><WalkMinimap /></EventBusProvider>);
    await waitFor(() => expect(screen.getByRole('img', { name: 'State graph for TaskB: idle to busy' })).toBeTruthy());
    const current = container.querySelectorAll('[aria-current="step"]');
    expect(current).toHaveLength(1);
    expect(current[0].textContent).toContain('B');
    expect(container.textContent).toContain('pending');
    expect(describeViolations(await axeViolations(container))).toEqual([]);
  });
});
