'use client';
/**
 * useEditorCapabilities — colocated with `CodeBlock.tsx`.
 *
 * Wires the four declarative editor-capability LISTENS (`onMotion` /
 * `onOperate` / `onInsertText` / `onSetMode`, Almadar Studio V4 §14 plan,
 * P1 E3) onto a live `<textarea>` via the pure `editorMotions` module. Not
 * barrel-exported — internal to the `CodeBlock` editable branch.
 */

import { useRef, useState, type RefObject } from 'react';
import { useEventListener, type BusEvent } from '../../../../hooks/useEventBus';
import type { EventPayload } from '@almadar/core';
import { applyMotion, motionRange, applyOperator, type EditorMotion, type EditorOperator } from '../../../../lib/editorMotions';
import type { EditorCaret } from './CodeBlock';

export interface EditorCapabilityEvents {
  onMotion: string;
  onOperate: string;
  onInsertText: string;
  onSetMode: string;
}

export interface UseEditorCapabilitiesArgs {
  /** Unset = this instance never receives capability events. */
  editorId: string | undefined;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  events: EditorCapabilityEvents;
  /** The ONE change path — same one a keystroke drives. */
  applyChange: (next: string) => void;
}

export interface MotionPayload extends EventPayload {
  editorId: string;
  motion: EditorMotion;
  count: number;
}

export interface OperatePayload extends EventPayload {
  editorId: string;
  operator: EditorOperator;
  motion: EditorMotion;
  count: number;
}

export interface InsertTextPayload extends EventPayload {
  editorId: string;
  text: string;
}

export interface SetModePayload extends EventPayload {
  editorId: string;
  mode: string;
  caret: EditorCaret;
}

function isMotionPayload(payload: EventPayload | undefined): payload is MotionPayload {
  return (
    !!payload &&
    typeof payload.editorId === 'string' &&
    typeof payload.motion === 'string' &&
    typeof payload.count === 'number'
  );
}

function isOperatePayload(payload: EventPayload | undefined): payload is OperatePayload {
  return (
    !!payload &&
    typeof payload.editorId === 'string' &&
    typeof payload.operator === 'string' &&
    typeof payload.motion === 'string' &&
    typeof payload.count === 'number'
  );
}

function isInsertTextPayload(payload: EventPayload | undefined): payload is InsertTextPayload {
  return !!payload && typeof payload.editorId === 'string' && typeof payload.text === 'string';
}

function isSetModePayload(payload: EventPayload | undefined): payload is SetModePayload {
  return (
    !!payload &&
    typeof payload.editorId === 'string' &&
    typeof payload.mode === 'string' &&
    typeof payload.caret === 'string'
  );
}

export function useEditorCapabilities(args: UseEditorCapabilitiesArgs): { caretMode: EditorCaret } {
  const [caretMode, setCaretMode] = useState<EditorCaret>('bar');
  // Vim-style yank/delete register. Unnamed — the single register the
  // vocabulary currently exposes.
  const registerRef = useRef<string>('');

  useEventListener(`UI:${args.events.onMotion}`, (evt: BusEvent) => {
    if (!args.editorId || !isMotionPayload(evt.payload) || evt.payload.editorId !== args.editorId) return;
    const ta = args.textareaRef.current;
    if (!ta) return;
    const { motion, count } = evt.payload;
    const newCaret = applyMotion(ta.value, ta.selectionStart, motion, count);
    // Simplification (documented, E3): a held selection EXTENDS its end to
    // the new caret instead of collapsing, so repeated motions grow/shrink
    // a VISUAL-style selection rather than losing it.
    if (ta.selectionStart !== ta.selectionEnd) {
      ta.setSelectionRange(ta.selectionStart, newCaret);
    } else {
      ta.setSelectionRange(newCaret, newCaret);
    }
  });

  useEventListener(`UI:${args.events.onOperate}`, (evt: BusEvent) => {
    if (!args.editorId || !isOperatePayload(evt.payload) || evt.payload.editorId !== args.editorId) return;
    const ta = args.textareaRef.current;
    if (!ta) return;
    const { operator, motion, count } = evt.payload;
    const selection: [number, number] | undefined =
      motion === 'selection' ? [ta.selectionStart, ta.selectionEnd] : undefined;
    const range = motionRange(ta.value, ta.selectionStart, motion, count, selection);
    const result = applyOperator(ta.value, range, operator, registerRef.current);
    registerRef.current = result.register;
    if (operator === 'yank') {
      ta.setSelectionRange(range[0], range[0]);
    } else {
      ta.setRangeText('', range[0], range[1], 'end');
    }
    args.applyChange(ta.value);
  });

  useEventListener(`UI:${args.events.onInsertText}`, (evt: BusEvent) => {
    if (!args.editorId || !isInsertTextPayload(evt.payload) || evt.payload.editorId !== args.editorId) return;
    const ta = args.textareaRef.current;
    if (!ta) return;
    ta.setRangeText(evt.payload.text, ta.selectionStart, ta.selectionEnd, 'end');
    args.applyChange(ta.value);
  });

  useEventListener(`UI:${args.events.onSetMode}`, (evt: BusEvent) => {
    if (!args.editorId || !isSetModePayload(evt.payload) || evt.payload.editorId !== args.editorId) return;
    setCaretMode(evt.payload.caret);
  });

  return { caretMode };
}
