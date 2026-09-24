/**
 * The canvas (L2 cards) and the Layers panel read a transition's render-ui
 * through ONE core walker (`renderUiEntriesOf`), so they agree — including on
 * renders nested in control forms, which the canvas used to miss.
 */
import { describe, it, expect } from 'vitest';
import type { OrbitalSchema } from '@almadar/core';
import { orbitalToExpandedGraph } from '../avl-preview-converter';
import { schemaToLayerItems } from '../../organisms/LayersPanel';

const schema = {
  name: 'agree',
  version: '1.0.0',
  orbitals: [
    {
      name: 'Tasks',
      entity: { name: 'Task', persistence: 'runtime', fields: [{ name: 'id', type: 'string' }, { name: 'count', type: 'number' }] },
      traits: [
        {
          name: 'Board',
          scope: 'instance',
          linkedEntity: 'Task',
          stateMachine: {
            states: [{ name: 'idle', isInitial: true }, { name: 'open' }],
            events: [],
            transitions: [
              { from: 'idle', to: 'idle', event: 'INIT', effects: [['render-ui', 'main', { type: 'stack', children: [{ type: 'button', label: 'Open', action: 'OPEN' }] }]] },
              { from: 'idle', to: 'open', event: 'OPEN', effects: [['when', ['>', '@entity.count', 0], ['render-ui', 'modal', { type: 'card', title: 'Details' }]]] },
              { from: 'open', to: 'idle', event: 'CLOSE', effects: [['render-ui', 'modal', null]] },
            ],
          },
        },
      ],
      pages: [{ name: 'Main', path: '/tasks', traits: [{ ref: 'Board' }] }],
    },
  ],
} as OrbitalSchema;

describe('canvas and layers agree on render-ui', () => {
  const cardEvents = orbitalToExpandedGraph(schema, 'Tasks').nodes.map((n) => n.data.transitionEvent);
  const layerIds = schemaToLayerItems(schema).map((i) => i.id);

  it('a render nested in `when` gets a canvas card', () => {
    expect(cardEvents).toContain('OPEN');
  });

  it('a clear-only transition gets no canvas card', () => {
    expect(cardEvents).not.toContain('CLOSE');
  });

  it('the layers panel lists the same slots the canvas renders', () => {
    const t = 'orbital:Tasks/trait:Board';
    expect(layerIds).toContain(`${t}/transition:0/slot:main`);
    expect(layerIds).toContain(`${t}/transition:1/slot:modal`);
    expect(layerIds.some((id) => id.startsWith(`${t}/transition:2/slot:`))).toBe(false);
  });
});
