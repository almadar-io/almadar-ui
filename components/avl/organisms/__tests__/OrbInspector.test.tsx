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
import { EventBusProvider } from '../../../../providers/EventBusProvider';
import { useEventBus } from '../../../../hooks/useEventBus';
import type { EventPayload } from '@almadar/core';
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


// ---------------------------------------------------------------------------
// Appearance: Local (this element's classes) vs Global (the theme token)
// ---------------------------------------------------------------------------

function styledSchema(className: string | ['concat', string, string]): OrbitalSchema {
  return {
    name: 'StyledApp',
    orbitals: [
      {
        name: 'TaskBoard',
        entity: { name: 'Task', fields: [{ name: 'title', type: 'string' }] },
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
                { from: 'idle', to: 'loaded', event: 'LOAD', effects: [['when', true, ['render-ui', 'main', { type: 'badge', className }]]] },
              ],
            },
          },
        ],
      },
    ],
  } as OrbitalSchema;
}

function PropChangeSpy({ onEvent }: { onEvent: (payload: EventPayload | undefined) => void }): null {
  const { on } = useEventBus();
  React.useEffect(() => on('UI:PROP_CHANGE', (e) => onEvent(e.payload)), [on, onEvent]);
  return null;
}

function renderAppearance(className: string | ['concat', string, string], offsetInParent?: SelectedPattern['offsetInParent']) {
  const onEvent = vi.fn();
  const selection: SelectedPattern = { patternType: 'badge', patternId: 'root', nodeData: expandedNode, ...(offsetInParent ? { offsetInParent } : {}) };
  render(
    <EventBusProvider debug={false}>
      <PropChangeSpy onEvent={onEvent} />
      <PatternSelectionContext.Provider value={{ selected: selection, select: () => {} }}>
        <OrbInspector
          node={expandedNode}
          schema={styledSchema(className)}
          userType="designer"
          editable
          defaultTab="design"
          themeManifest={{ name: 'project', tokens: { colors: { primary: '#2563eb' }, radii: { md: '6px' }, spacing: { '10': '60px' } } }}
          onClose={() => {}}
        />
      </PatternSelectionContext.Provider>
    </EventBusProvider>,
  );
  return { onEvent };
}

describe('OrbInspector Appearance — local vs global', () => {
  it('local: picking a fill replaces the element\'s bg class and keeps the rest', () => {
    const { onEvent } = renderAppearance('p-4 bg-primary hover:bg-muted w-40');
    fireEvent.click(within(screen.getByTestId('inspector-bg')).getByLabelText('bg-accent'));
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({
      scope: 'local',
      propName: 'className',
      value: 'p-4 hover:bg-muted w-40 bg-accent',
    }));
  });

  it('local: a width step replaces the element\'s w class', () => {
    const { onEvent } = renderAppearance('p-4 w-40');
    fireEvent.change(within(screen.getByTestId('inspector-w')).getByRole('combobox'), { target: { value: 'w-60' } });
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ scope: 'local', propName: 'className', value: 'p-4 w-60' }));
  });

  it('local: width can be set to Hug contents or Fill container', () => {
    const { onEvent } = renderAppearance('p-4 w-40');
    const select = within(screen.getByTestId('inspector-w')).getByRole('combobox');
    expect((select as HTMLSelectElement).value).toBe('w-40');
    fireEvent.change(select, { target: { value: 'fill' } });
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'p-4 w-full' }));
    fireEvent.change(select, { target: { value: 'hug' } });
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'p-4 w-fit' }));
  });

  it('local: an element with no className gets one', () => {
    const { onEvent } = renderAppearance('');
    fireEvent.click(within(screen.getByTestId('inspector-radius')).getByText('lg'));
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ scope: 'local', value: 'rounded-lg' }));
  });

  it('global: edits the theme token behind the element\'s class', () => {
    const { onEvent } = renderAppearance('p-4 bg-primary');
    fireEvent.click(screen.getByTestId('inspector-scope-global'));
    const input = within(screen.getByTestId('inspector-bg')).getByLabelText('colors.primary');
    expect((input as HTMLInputElement).value).toBe('#2563eb');
    fireEvent.change(input, { target: { value: '#e14b2a' } });
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({
      scope: 'global',
      tokenGroup: 'colors',
      tokenKey: 'primary',
      value: '#e14b2a',
    }));
  });

  it('global: a class with no theme token says so and offers no editor', () => {
    renderAppearance('p-4 w-40');
    fireEvent.click(screen.getByTestId('inspector-scope-global'));
    expect(within(screen.getByTestId('inspector-bg')).getByText(/Not a theme value/)).toBeTruthy();
    expect(within(screen.getByTestId('inspector-w')).getByText(/Not a theme value/)).toBeTruthy();
  });

  it('global: a width on a token step edits that --space-N token', () => {
    const { onEvent } = renderAppearance('p-4 w-10');
    fireEvent.click(screen.getByTestId('inspector-scope-global'));
    const input = within(screen.getByTestId('inspector-w')).getByLabelText('spacing.10');
    expect((input as HTMLInputElement).value).toBe('60px');
    fireEvent.change(input, { target: { value: '64px' } });
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ scope: 'global', tokenGroup: 'spacing', tokenKey: '10', value: '64px' }));
  });

  it('global: Hug and Fill are not theme values', () => {
    renderAppearance('w-fit h-full');
    fireEvent.click(screen.getByTestId('inspector-scope-global'));
    expect(within(screen.getByTestId('inspector-w')).getByText(/Not a theme value/)).toBeTruthy();
    expect(within(screen.getByTestId('inspector-h')).getByText(/Not a theme value/)).toBeTruthy();
  });

  it('local: gap and padding steps write the smallest class set', () => {
    const { onEvent } = renderAppearance('p-4 gap-4');
    fireEvent.change(within(screen.getByTestId('inspector-gap')).getByRole('combobox'), { target: { value: '6' } });
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ scope: 'local', value: 'gap-6 p-4' }));
    fireEvent.change(within(screen.getByTestId('inspector-padding')).getByRole('combobox'), { target: { value: '2' } });
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ scope: 'local', value: 'gap-4 p-2' }));
  });

  it('local: mixed per-side padding shows as mixed until a step is picked', () => {
    renderAppearance('pt-2 pr-4 pb-2 pl-4');
    expect((within(screen.getByTestId('inspector-padding')).getByRole('combobox') as HTMLSelectElement).value).toBe('mixed');
  });

  it('global: gap and uniform padding edit their tokens; per-side padding is not one theme value', () => {
    const { onEvent } = renderAppearance('gap-2 p-4');
    fireEvent.click(screen.getByTestId('inspector-scope-global'));
    fireEvent.change(within(screen.getByTestId('inspector-gap')).getByLabelText('spacing.2'), { target: { value: '8px' } });
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ scope: 'global', tokenGroup: 'spacing', tokenKey: '2', value: '8px' }));
    expect(within(screen.getByTestId('inspector-padding')).getByLabelText('spacing.4')).toBeTruthy();
  });

  it('global: per-side padding has no single token', () => {
    renderAppearance('pt-2 pr-4 pb-2 pl-4');
    fireEvent.click(screen.getByTestId('inspector-scope-global'));
    expect(within(screen.getByTestId('inspector-padding')).getByText(/Not a theme value/)).toBeTruthy();
  });

  it('custom: an arbitrary value is written as its class, replacing the same utility', () => {
    const { onEvent } = renderAppearance('p-4 w-40');
    const field = within(screen.getByTestId('inspector-custom')).getByRole('textbox');
    fireEvent.change(field, { target: { value: 'w-[243px]' } });
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ scope: 'local', propName: 'className', value: 'p-4 w-[243px]' }));
  });

  it('custom: anything but an arbitrary-value class is refused with a reason', () => {
    const { onEvent } = renderAppearance('p-4');
    const field = within(screen.getByTestId('inspector-custom')).getByRole('textbox');
    for (const bad of ['w-60', 'foo', 'w-[1px] h-[2px]']) {
      fireEvent.change(field, { target: { value: bad } });
      fireEvent.keyDown(field, { key: 'Enter' });
    }
    expect(onEvent).not.toHaveBeenCalled();
    expect(within(screen.getByTestId('inspector-custom')).getByText(/like w-\[243px\]/)).toBeTruthy();
  });

  it('custom values are not theme values', () => {
    renderAppearance('p-4');
    fireEvent.click(screen.getByTestId('inspector-scope-global'));
    expect(within(screen.getByTestId('inspector-custom')).getByText(/Not a theme value/)).toBeTruthy();
  });

  it('a className bound to an expression is not editable here', () => {
    renderAppearance(['concat', 'p-4 ', '@entity.tone']);
    expect(within(screen.getByTestId('inspector-appearance')).getByText(/come from a binding/)).toBeTruthy();
    expect(screen.queryByTestId('inspector-scope-local')).toBeNull();
  });
});

describe('OrbInspector Appearance — min / max size', () => {
  it('each limit row shows its step, or none', () => {
    renderAppearance('w-40 min-w-10');
    expect((within(screen.getByTestId('inspector-min-w')).getByRole('combobox') as HTMLSelectElement).value).toBe('10');
    expect((within(screen.getByTestId('inspector-max-w')).getByRole('combobox') as HTMLSelectElement).value).toBe('none');
  });

  it('picking a step writes that limit and keeps the size', () => {
    const { onEvent } = renderAppearance('p-4 w-40');
    fireEvent.change(within(screen.getByTestId('inspector-max-w')).getByRole('combobox'), { target: { value: '60' } });
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ scope: 'local', propName: 'className', value: 'p-4 w-40 max-w-60' }));
  });

  it('none clears the limit', () => {
    const { onEvent } = renderAppearance('h-full min-h-12');
    fireEvent.change(within(screen.getByTestId('inspector-min-h')).getByRole('combobox'), { target: { value: 'none' } });
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'h-full' }));
  });

  it('a custom limit reads as custom, and a step replaces it', () => {
    const { onEvent } = renderAppearance('min-w-[120px]');
    const select = within(screen.getByTestId('inspector-min-w')).getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('custom');
    fireEvent.change(select, { target: { value: '4' } });
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'min-w-4' }));
  });

  it('global: a limit on a token step edits that --space-N token', () => {
    const { onEvent } = renderAppearance('max-h-10');
    fireEvent.click(screen.getByTestId('inspector-scope-global'));
    fireEvent.change(within(screen.getByTestId('inspector-max-h')).getByLabelText('spacing.10'), { target: { value: '72px' } });
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ scope: 'global', tokenGroup: 'spacing', tokenKey: '10', value: '72px' }));
  });
});

describe('OrbInspector Appearance — absolute position + constraints', () => {
  const absoluteSwitch = () => within(screen.getByTestId('inspector-position')).getByRole('switch');
  const offset = { left: 12, top: 8, right: 30, bottom: 20, parentWidth: 200, parentHeight: 100 };

  it('an element in the flow shows the switch off and no constraint pickers', () => {
    renderAppearance('p-4', offset);
    expect(absoluteSwitch().getAttribute('aria-checked')).toBe('false');
    expect(screen.queryByTestId('inspector-constraint-x')).toBeNull();
  });

  it('turning absolute on pins it where it is now (left/top offsets it was measured at)', () => {
    const { onEvent } = renderAppearance('p-4', offset);
    fireEvent.click(absoluteSwitch());
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ propName: 'className', value: 'p-4 absolute left-[12px] top-[8px]' }));
  });

  it('turning it off removes every position class', () => {
    const { onEvent } = renderAppearance('p-4 absolute left-[12px] top-[8px]', offset);
    const toggle = absoluteSwitch();
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(toggle);
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'p-4' }));
  });

  it('a horizontal constraint keeps the measured distance to the side it pins', () => {
    const { onEvent } = renderAppearance('absolute left-[12px] top-[8px]', offset);
    const x = within(screen.getByTestId('inspector-constraint-x')).getByRole('combobox') as HTMLSelectElement;
    expect(x.value).toBe('start');
    fireEvent.change(x, { target: { value: 'end' } });
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'absolute right-[30px] top-[8px]' }));
    fireEvent.change(x, { target: { value: 'both' } });
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'absolute left-[12px] right-[30px] top-[8px]' }));
  });

  it('center and scale on the vertical axis', () => {
    const { onEvent } = renderAppearance('absolute left-[12px] top-[8px]', { left: 12, top: 10, right: 30, bottom: 30, parentWidth: 200, parentHeight: 100 });
    const y = within(screen.getByTestId('inspector-constraint-y')).getByRole('combobox');
    // Center keeps it where it is: 10 from the top and 30 from the bottom is 10px above centre.
    fireEvent.change(y, { target: { value: 'center' } });
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'absolute left-[12px] top-[calc(50%-10px)] -translate-y-1/2' }));
    fireEvent.change(y, { target: { value: 'scale' } });
    // Scale: the distances as % of the parent's height.
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'absolute left-[12px] top-[10%] bottom-[30%]' }));
  });

  it('without a measured position, turning absolute on pins it at the top-left', () => {
    const { onEvent } = renderAppearance('p-4');
    fireEvent.click(absoluteSwitch());
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'p-4 absolute left-0 top-0' }));
  });
});
