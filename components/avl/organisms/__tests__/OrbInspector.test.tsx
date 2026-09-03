/**
 * OrbInspector — Design/Prototype tab regrouping (Wave D3).
 *
 * Covers: tab-bar visibility by persona (Code architect-only; Design and
 * Prototype universal), section placement (Pattern Props + Styles under
 * Design; State Transition/Trigger/Guard/Effects under Prototype; Entity
 * Fields/Service Mode/Traits stay on the overview Inspector tab), each
 * section's persona gate unchanged, and the new defaultTab/onTabChange
 * props (initial-only, local state still owns the active tab).
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import type { OrbitalSchema } from '@almadar/core';
import { OrbInspector } from '../OrbInspector';
import { PatternSelectionContext, type SelectedPattern } from '../../molecules/OrbPreviewNode';
import type { PreviewNodeData } from '../../types/avl-preview-types';

/** Scrollable content pane only — the header repeats the pattern type /
 *  transition event as its title, which collides with content-area text
 *  queries (e.g. "LOAD" appears both as the header title and the Trigger
 *  section body). */
function contentPane(container: HTMLElement): HTMLElement {
  const pane = container.querySelector('.overflow-y-auto');
  if (!pane) throw new Error('content pane not found');
  return pane as HTMLElement;
}

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
                guard: ['>', '@entity.count', 1],
                effects: [['set', '@entity.count', 1], ['render-ui', 'main', { type: 'badge' }]],
              },
            ],
          },
        },
      ],
    },
  ],
};

const overviewNode: PreviewNodeData = {
  orbitalName: 'TaskBoard',
  patterns: [],
  eventSources: [],
};

const expandedNode: PreviewNodeData = {
  orbitalName: 'TaskBoard',
  traitName: 'TaskList',
  transitionEvent: 'LOAD',
  fromState: 'idle',
  toState: 'loaded',
  entityName: 'Task',
  effectTypes: ['set', 'render-ui'],
  guard: ['>', '@entity.count', 1],
  patterns: [{ slot: 'main', pattern: { type: 'badge' } }],
  eventSources: [],
};

const badgeSelection: SelectedPattern = {
  patternType: 'badge',
  nodeData: overviewNode,
};

function renderWithSelection(ui: React.ReactElement, selected: SelectedPattern | null = null) {
  return render(
    <PatternSelectionContext.Provider value={{ selected, select: () => {} }}>
      {ui}
    </PatternSelectionContext.Provider>,
  );
}

describe('OrbInspector tab bar', () => {
  it('shows Inspector, Design, Prototype, and Code for an architect', () => {
    renderWithSelection(<OrbInspector node={overviewNode} schema={schema} userType="architect" onClose={() => {}} />);
    expect(screen.getByRole('button', { name: 'Inspector' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Design' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prototype' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Code' })).toBeInTheDocument();
  });

  it('hides Code for a designer, keeping Inspector, Design, and Prototype', () => {
    renderWithSelection(<OrbInspector node={overviewNode} schema={schema} userType="designer" onClose={() => {}} />);
    expect(screen.getByRole('button', { name: 'Inspector' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Design' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prototype' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Code' })).not.toBeInTheDocument();
  });
});

describe('OrbInspector Design tab', () => {
  it('renders Pattern Props for a selected pattern plus the Styles content', () => {
    const { container } = renderWithSelection(
      <OrbInspector node={overviewNode} schema={schema} userType="architect" defaultTab="design" onClose={() => {}} />,
      badgeSelection,
    );
    const pane = within(contentPane(container));
    // Pattern Props section (moved from the old inline "Inspector" body)
    expect(pane.getByText('Props')).toBeInTheDocument();
    expect(pane.getByText('variant')).toBeInTheDocument();
    // Styles content (unchanged StylesTab component) — the header also shows
    // "badge" as the selection title, so this is scoped to the content pane.
    expect(pane.getByText('badge')).toBeInTheDocument();
    expect(pane.getByText('Variant')).toBeInTheDocument();
  });

  it('shows the Styles placeholder with no pattern selected', () => {
    renderWithSelection(
      <OrbInspector node={overviewNode} schema={schema} userType="architect" defaultTab="design" onClose={() => {}} />,
    );
    expect(screen.getByText('Select a pattern to view its style tokens.')).toBeInTheDocument();
  });
});

describe('OrbInspector Prototype tab', () => {
  it('renders State Transition, Trigger, Guard, and Effects for an architect', () => {
    const { container } = renderWithSelection(
      <OrbInspector node={expandedNode} schema={schema} userType="architect" defaultTab="prototype" onClose={() => {}} />,
    );
    const pane = within(contentPane(container));
    expect(pane.getByText('Transition')).toBeInTheDocument();
    expect(pane.getByText('idle')).toBeInTheDocument();
    expect(pane.getByText('loaded')).toBeInTheDocument();
    expect(pane.getByText('LOAD')).toBeInTheDocument();
    expect(pane.getByText('(> @entity.count 1)')).toBeInTheDocument();
    expect(pane.getByText('Effects (2)')).toBeInTheDocument();
  });

  it('hides the architect-only Guard and Effects sections for a designer, keeping Trigger', () => {
    const { container } = renderWithSelection(
      <OrbInspector node={expandedNode} schema={schema} userType="designer" defaultTab="prototype" onClose={() => {}} />,
    );
    const pane = within(contentPane(container));
    expect(pane.getByText('LOAD')).toBeInTheDocument();
    expect(pane.queryByText('(> @entity.count 1)')).not.toBeInTheDocument();
    expect(pane.queryByText(/^Effects/)).not.toBeInTheDocument();
  });
});

describe('OrbInspector Inspector (overview) tab', () => {
  it('renders Entity Fields (architect), Service Mode, and Traits — not Prototype content', () => {
    const { container } = renderWithSelection(
      <OrbInspector node={overviewNode} schema={schema} userType="architect" onClose={() => {}} />,
    );
    const pane = within(contentPane(container));
    expect(pane.getByText('Entity')).toBeInTheDocument();
    expect(pane.getByText('Task')).toBeInTheDocument();
    expect(pane.getByText('Traits')).toBeInTheDocument();
    expect(pane.getByText('TaskList')).toBeInTheDocument();
    // Prototype-only content must not leak into the overview tab (this node
    // isn't even expanded, so Trigger/Guard/Effects have nothing to show).
    expect(pane.queryByText('LOAD')).not.toBeInTheDocument();
  });

  it('hides Entity Fields for a designer', () => {
    const { container } = renderWithSelection(
      <OrbInspector node={overviewNode} schema={schema} userType="designer" onClose={() => {}} />,
    );
    const pane = within(contentPane(container));
    expect(pane.queryByText('Entity')).not.toBeInTheDocument();
    expect(pane.getByText('Traits')).toBeInTheDocument();
  });
});

describe('OrbInspector defaultTab / onTabChange', () => {
  it('opens on defaultTab without being controlled, and reports subsequent clicks', () => {
    const onTabChange = vi.fn();
    const { container } = renderWithSelection(
      <OrbInspector
        node={expandedNode}
        schema={schema}
        userType="architect"
        defaultTab="prototype"
        onTabChange={onTabChange}
        onClose={() => {}}
      />,
    );
    const pane = within(contentPane(container));
    // Starts on Prototype content without any click.
    expect(pane.getByText('Transition')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Design' }));
    expect(onTabChange).toHaveBeenCalledWith('design');
    // Local state now owns the tab — Prototype content is gone, Design is up.
    expect(pane.queryByText('Transition')).not.toBeInTheDocument();
    expect(pane.getByText('Select a pattern to view its style tokens.')).toBeInTheDocument();
  });
});
