import type { EditFocus } from '@almadar/core';

/**
 * Build an `EditFocus` from a clicked element's `data-orb-*` address (stamped by
 * UISlotRenderer). The owning orbital is read from the DOM (`data-orb-orbital`,
 * walking up via `closest` when the clicked node itself doesn't carry it); since
 * `EditFocus.orbital` is required, returns `null` when it can't be resolved.
 */
export function deriveEditFocusFromElement(el: HTMLElement): EditFocus | null {
  const orbitalEl = el.getAttribute('data-orb-orbital') !== null
    ? el
    : el.closest('[data-orb-orbital]');
  const orbital = orbitalEl?.getAttribute('data-orb-orbital') ?? '';
  if (!orbital) return null;

  const path = el.getAttribute('data-orb-path') ?? el.getAttribute('data-pattern-path');
  const patternType = el.getAttribute('data-orb-pattern') ?? el.getAttribute('data-pattern');
  const trait = el.getAttribute('data-orb-trait') ?? el.getAttribute('data-source-trait');
  const focus: EditFocus = {
    level: 'node',
    orbital,
    label: patternType ?? trait ?? 'element',
  };
  if (path !== null) focus.path = path;
  if (trait !== null) focus.trait = trait;
  if (patternType !== null) focus.patternType = patternType;
  const transition = el.getAttribute('data-orb-transition');
  if (transition !== null) focus.transition = transition;
  const state = el.getAttribute('data-orb-state');
  if (state !== null) focus.state = state;
  const slot = el.getAttribute('data-orb-slot');
  if (slot !== null) focus.slot = slot;
  const entity = el.getAttribute('data-orb-entity');
  if (entity !== null) focus.entity = entity;
  return focus;
}
