/**
 * Inline text editing: double-click text a component marked as one of its
 * text props (`data-inline-text`) to edit it in place — Enter or click-away
 * saves it as a local `UI:PROP_CHANGE` on that prop of that element, Esc
 * cancels. The element's address comes from the rendered DOM
 * (`deriveEditFocusFromElement`), so the same editor serves canvas cards and
 * a running live preview. Only literal text is editable: a value bound to
 * data (`@entity.x`, an expression) is left alone, with a notice.
 */
import { useCallback } from 'react';
import type { OrbitalSchema } from '@almadar/core';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { INLINE_TEXT_ATTR } from '../../../lib/inlineText';
import { deriveEditFocusFromElement, withNodeTransition } from '../lib/derive-edit-focus';
import { resolvePatternConfig } from '../lib/resolve-pattern-config';

export interface InlineTextEditOptions {
  /** The schema being rendered — the literal-or-bound check reads the prop from it. */
  schema: OrbitalSchema | null | undefined;
  enabled: boolean;
  /** The render's transition when the host knows it better than the DOM (a canvas card). */
  transitionEvent?: string;
}

/** A `onDoubleClickCapture` handler for the element that contains the rendered content. */
export function useInlineTextEdit({ schema, enabled, transitionEvent }: InlineTextEditOptions): (e: React.MouseEvent) => void {
  const { emit } = useEventBus();
  const { t } = useTranslate();

  return useCallback((e: React.MouseEvent) => {
    if (!enabled || !schema || !(e.target instanceof Element)) return;
    const text = e.target.closest(`[${INLINE_TEXT_ATTR}]`);
    const propName = text?.getAttribute(INLINE_TEXT_ATTR);
    const patternEl = text?.closest('[data-pattern-path],[data-orb-path]');
    if (!(text instanceof HTMLElement) || !propName || !(patternEl instanceof HTMLElement)) return;
    const derived = deriveEditFocusFromElement(patternEl);
    const focus = derived ? withNodeTransition(derived, transitionEvent) : null;
    if (!focus?.trait || !focus.transition || !focus.path) return;

    e.preventDefault();
    e.stopPropagation();
    const node = resolvePatternConfig(schema, {
      orbitalName: focus.orbital,
      traitName: focus.trait,
      transitionEvent: focus.transition,
      patternId: focus.path,
    });
    const current = node?.[propName];
    if (typeof current !== 'string' || current.startsWith('@')) {
      emit('UI:NOTIFY', { severity: 'info', message: t('inlineText.boundValue') });
      return;
    }

    const original = text.textContent ?? '';
    const selection = { patternPath: focus.path, orbitalName: focus.orbital, traitName: focus.trait, transitionEvent: focus.transition };
    let done = false;
    const finish = (save: boolean) => {
      if (done) return;
      done = true;
      text.removeEventListener('keydown', onKey);
      text.removeEventListener('blur', onBlur);
      text.removeAttribute('contenteditable');
      const value = text.textContent ?? '';
      if (!save) text.textContent = original;
      else if (value !== original) emit('UI:PROP_CHANGE', { scope: 'local', propName, value, selection });
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        finish(true);
      } else if (ev.key === 'Escape') {
        ev.preventDefault();
        finish(false);
      }
      ev.stopPropagation();
    };
    const onBlur = () => finish(true);

    text.setAttribute('contenteditable', 'true');
    text.addEventListener('keydown', onKey);
    text.addEventListener('blur', onBlur);
    text.focus();
    const range = document.createRange();
    range.selectNodeContents(text);
    const selected = window.getSelection();
    selected?.removeAllRanges();
    selected?.addRange(range);
  }, [enabled, schema, transitionEvent, emit, t]);
}
