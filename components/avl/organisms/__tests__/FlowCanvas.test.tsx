/**
 * FlowCanvas — externalInspector / onSelectedNodeChange (Studio V4 persistent
 * properties panel). Covers: default behavior renders the inline OrbInspector
 * unchanged, `externalInspector` suppresses it while selection changes still
 * fire `onSelectedNodeChange` through every `setSelectedNode` call site.
 */
import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type { OrbitalSchema } from '@almadar/core';
import { FlowCanvas } from '../FlowCanvas';
import type { PreviewNodeData } from '../../types/avl-preview-types';

// jsdom has no ResizeObserver; React Flow's viewport pane measures itself
// with one on mount. A no-op stub is enough for the graph to render.
beforeAll(() => {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver = ResizeObserverStub;
});

const schema: OrbitalSchema = {
  name: 'FixtureApp',
  orbitals: [
    {
      name: 'TaskBoard',
      entity: {
        name: 'Task',
        fields: [{ name: 'title', type: 'string', required: true }],
      },
      pages: [{ name: 'TasksPage', path: '/tasks' }],
      traits: [
        {
          name: 'TaskList',
          scope: 'collection',
          linkedEntity: 'Task',
          stateMachine: {
            states: [{ name: 'idle', isInitial: true }, { name: 'loaded' }],
            events: [{ key: 'LOAD', name: 'Load' }],
            transitions: [
              {
                from: 'idle',
                to: 'loaded',
                event: 'LOAD',
                effects: [['render-ui', 'main', { type: 'badge' }]],
              },
            ],
          },
        },
      ],
    },
  ],
};

const preselectedNode: PreviewNodeData = {
  orbitalName: 'TaskBoard',
  traitName: 'TaskList',
  transitionEvent: 'LOAD',
  fromState: 'idle',
  toState: 'loaded',
  entityName: 'Task',
  patterns: [{ slot: 'main', pattern: { type: 'badge' } }],
  eventSources: [],
};

describe('FlowCanvas default (externalInspector absent)', () => {
  it('renders the inline OrbInspector when a node is pre-selected', () => {
    render(
      <FlowCanvas
        schema={schema}
        initialOrbital="TaskBoard"
        initialLevel="expanded"
        initialSelectedNode={preselectedNode}
      />,
    );
    // OrbInspector's own tab bar — proves it mounted inline.
    expect(screen.getByRole('button', { name: 'Inspector' })).toBeInTheDocument();
  });

  it('clears the inline inspector on Escape and reports it via onSelectedNodeChange', () => {
    const onSelectedNodeChange = vi.fn();
    render(
      <FlowCanvas
        schema={schema}
        initialOrbital="TaskBoard"
        initialLevel="expanded"
        initialSelectedNode={preselectedNode}
        onSelectedNodeChange={onSelectedNodeChange}
      />,
    );
    expect(screen.getByRole('button', { name: 'Inspector' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('button', { name: 'Inspector' })).not.toBeInTheDocument();
    expect(onSelectedNodeChange).toHaveBeenCalledWith(null);
  });
});

describe('FlowCanvas externalInspector=true', () => {
  it('suppresses the inline OrbInspector even with a node pre-selected', () => {
    render(
      <FlowCanvas
        schema={schema}
        initialOrbital="TaskBoard"
        initialLevel="expanded"
        initialSelectedNode={preselectedNode}
        externalInspector
      />,
    );
    expect(screen.queryByRole('button', { name: 'Inspector' })).not.toBeInTheDocument();
  });

  it('still fires onSelectedNodeChange on clear-on-escape with the inspector suppressed', () => {
    const onSelectedNodeChange = vi.fn();
    render(
      <FlowCanvas
        schema={schema}
        initialOrbital="TaskBoard"
        initialLevel="expanded"
        initialSelectedNode={preselectedNode}
        externalInspector
        onSelectedNodeChange={onSelectedNodeChange}
      />,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onSelectedNodeChange).toHaveBeenCalledWith(null);
    expect(screen.queryByRole('button', { name: 'Inspector' })).not.toBeInTheDocument();
  });

  it('fires onSelectedNodeChange with the node on click-select at expanded level', async () => {
    const onSelectedNodeChange = vi.fn();
    const { container } = render(
      <FlowCanvas
        schema={schema}
        initialOrbital="TaskBoard"
        initialLevel="expanded"
        externalInspector
        onSelectedNodeChange={onSelectedNodeChange}
      />,
    );
    const node = container.querySelector('.react-flow__node');
    expect(node).toBeTruthy();
    await act(async () => {
      fireEvent.click(node as Element);
    });
    expect(onSelectedNodeChange).toHaveBeenCalledWith(
      expect.objectContaining({ orbitalName: 'TaskBoard', traitName: 'TaskList', transitionEvent: 'LOAD' }),
    );
  });
});
