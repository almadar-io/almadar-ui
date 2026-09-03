/**
 * `withNodeTransition` regression: `OrbPreviewNode`'s click handler emits
 * `UI:ELEMENT_SELECTED` with a `focus` built by `deriveEditFocusFromElement`,
 * which reads `data-orb-transition` off the CLICKED element — not reliably
 * populated at L2, since the rendered content's own `transitionEvent` doesn't
 * always mirror the node's. A `focus` missing `transition` strands every
 * consumer that requires all of orbital/trait/transition (canvas delete via
 * `UI:DELETE_PATTERN`, the contextual-edit chat flow) — the click silently
 * dead-ends behind a "no pattern focused" warning. Each L2 `OrbPreviewNode`
 * renders exactly one transition, so its own `PreviewNodeData.transitionEvent`
 * is authoritative and should win regardless of what the DOM walk found.
 */
import { describe, it, expect } from 'vitest';
import type { EditFocus } from '@almadar/core';
import { withNodeTransition } from '../components/avl/lib/derive-edit-focus';

function baseFocus(overrides: Partial<EditFocus> = {}): EditFocus {
  return { level: 'node', orbital: 'Widgets', label: 'typography', ...overrides };
}

describe('withNodeTransition', () => {
  it('fills in transition when the DOM-derived focus has none', () => {
    const result = withNodeTransition(baseFocus(), 'INIT');
    expect(result.transition).toBe('INIT');
  });

  it('the node transition wins over a stale/mismatched DOM-derived one', () => {
    const result = withNodeTransition(baseFocus({ transition: 'STALE' }), 'INIT');
    expect(result.transition).toBe('INIT');
  });

  it('falls back to the DOM-derived transition when the node has none', () => {
    const result = withNodeTransition(baseFocus({ transition: 'FROM_DOM' }), undefined);
    expect(result.transition).toBe('FROM_DOM');
  });

  it('leaves transition unset when neither source has one', () => {
    const result = withNodeTransition(baseFocus(), undefined);
    expect(result.transition).toBeUndefined();
  });

  it('does not mutate other focus fields', () => {
    const focus = baseFocus({ trait: 'WidgetInteraction', path: 'root.children.0' });
    const result = withNodeTransition(focus, 'INIT');
    expect(result).toEqual({ ...focus, transition: 'INIT' });
  });
});
