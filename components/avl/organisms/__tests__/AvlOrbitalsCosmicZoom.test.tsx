// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { OrbitalSchema } from '@almadar/core';
import { AvlOrbitalsCosmicZoom } from '../AvlOrbitalsCosmicZoom';
import { EventBusProvider } from '../../../../providers/EventBusProvider';
import type { AvlPlayStep } from '../../../../lib/avl-play';

beforeAll(() => {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
});

const schema: OrbitalSchema = {
  name: 'EditorApp',
  orbitals: [
    {
      name: 'Editor',
      entity: { name: 'Doc', fields: [{ name: 'mode', type: 'string', default: 'normal' }] },
      pages: [],
      traits: [
        {
          name: 'Modes',
          scope: 'instance',
          linkedEntity: 'Doc',
          stateMachine: {
            states: [{ name: 'NORMAL', isInitial: true }, { name: 'INSERT' }],
            events: [{ key: 'KEY', name: 'Key' }, { key: 'ESC', name: 'Esc' }],
            transitions: [
              { from: 'NORMAL', to: 'INSERT', event: 'KEY', guard: ['=', '@payload.key', 'i'] },
              { from: 'NORMAL', to: 'INSERT', event: 'KEY', guard: ['=', '@payload.key', 'a'] },
              { from: 'INSERT', to: 'NORMAL', event: 'ESC' },
            ],
          },
        },
      ],
    },
  ],
};

const step = (from: string, event: string, after: string, firedArm: number): AvlPlayStep => ({
  orbital: 'Editor',
  trait: 'Modes',
  from,
  payload: {},
  result: { trait: 'Modes', event, transitionFired: true, guard: 'none', firedArm, state: { before: from, after }, effects: [], emitted: [] },
});

const renderCosmic = (props: Partial<React.ComponentProps<typeof AvlOrbitalsCosmicZoom>> = {}) =>
  render(
    <EventBusProvider debug={false}>
      <AvlOrbitalsCosmicZoom schema={schema} highlightedOrbital="Editor" width={900} height={700} {...props} />
    </EventBusProvider>,
  );

const labels = async () => {
  await waitFor(() => expect(screen.getAllByTestId('avl-sm-label').length).toBe(3));
  return screen.getAllByTestId('avl-sm-label');
};

describe('AvlOrbitalsCosmicZoom — the trait drill', () => {
  it('opens exactly the clicked arm when two arms share an event', async () => {
    renderCosmic();
    const keyArms = (await labels()).filter((l) => l.dataset.event === 'KEY');
    fireEvent.click(keyArms[1]);
    await waitFor(() => expect(screen.getByTestId('avl-transition-detail')).toBeInTheDocument());
    expect(screen.getAllByTestId('avl-circuit-code')[0].textContent).toBe('(= @payload.key "a")');
  });

  it('a played scene lights the trait machine and shows the scrubber position', async () => {
    renderCosmic({ scene: [step('NORMAL', 'KEY', 'INSERT', 1), step('INSERT', 'ESC', 'NORMAL', 0)] });
    await labels();
    await waitFor(() => expect(screen.getAllByTestId('avl-sm-state').find((n) => n.dataset.active === 'true')?.dataset.state).toBe('NORMAL'));
    expect(screen.getByTestId('avl-scene-position').textContent).toBe('Step 2 of 2');
  });

  it('control: without a scene there is no scene bar and nothing is active', async () => {
    renderCosmic();
    await labels();
    expect(screen.queryByTestId('avl-scene-bar')).toBeNull();
    expect(screen.getAllByTestId('avl-sm-state').filter((n) => n.dataset.active === 'true')).toHaveLength(0);
  });
});
