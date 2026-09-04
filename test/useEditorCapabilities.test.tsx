// @vitest-environment jsdom
/**
 * useEditorCapabilities — bus-driven editor-capability wiring (Almadar
 * Studio V4 §14 plan, P1 E3). A tiny harness renders a real `<textarea>`
 * and calls the hook against it, so motion/operator math runs through the
 * actual DOM selection APIs, not a mock.
 */
import React, { useRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { EventBusProvider } from '../providers/EventBusProvider';
import { useEventBus, type EventBusContextType } from '../hooks/useEventBus';
import { useEditorCapabilities } from '../components/core/molecules/markdown/useEditorCapabilities';
import type { EditorCaret } from '../components/core/molecules/markdown/CodeBlock';

const INITIAL = 'hello world\nfoo bar';
const EVENTS = { onMotion: 'MOTION', onOperate: 'OPERATE', onInsertText: 'INSERT_TEXT', onSetMode: 'SET_MODE' };

function Harness({
  editorId,
  applyChange,
}: {
  editorId: string | undefined;
  applyChange: (v: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { caretMode } = useEditorCapabilities({ editorId, textareaRef, events: EVENTS, applyChange });
  return <textarea ref={textareaRef} defaultValue={INITIAL} data-testid="ta" data-caret={caretMode} />;
}

function renderHarness(editorId: string | undefined) {
  const applyChange = vi.fn();
  let bus!: EventBusContextType;
  function BusGrabber() {
    bus = useEventBus();
    return null;
  }
  render(
    <EventBusProvider isolated>
      <BusGrabber />
      <Harness editorId={editorId} applyChange={applyChange} />
    </EventBusProvider>,
  );
  const ta = screen.getByTestId('ta') as HTMLTextAreaElement;
  return { applyChange, bus, ta };
}

function caretModeOf(ta: HTMLTextAreaElement): EditorCaret {
  return ta.dataset.caret as EditorCaret;
}

describe('useEditorCapabilities', () => {
  it('MOTION word-forward moves the caret to the next word start', () => {
    const { bus, ta } = renderHarness('e1');
    ta.setSelectionRange(0, 0);

    act(() => {
      bus.emit('UI:MOTION', { editorId: 'e1', motion: 'word-forward', count: 1 });
    });

    expect(ta.selectionStart).toBe(6);
    expect(ta.selectionEnd).toBe(6);
  });

  it('OPERATE delete word-forward removes the range and calls applyChange with the result', () => {
    const { bus, ta, applyChange } = renderHarness('e1');
    ta.setSelectionRange(0, 0);

    act(() => {
      bus.emit('UI:OPERATE', { editorId: 'e1', operator: 'delete', motion: 'word-forward', count: 1 });
    });

    expect(ta.value).toBe('world\nfoo bar');
    expect(applyChange).toHaveBeenCalledWith('world\nfoo bar');
  });

  it('ignores a payload for a different editorId', () => {
    const { bus, ta, applyChange } = renderHarness('e1');
    ta.setSelectionRange(0, 0);

    act(() => {
      bus.emit('UI:OPERATE', { editorId: 'other', operator: 'delete', motion: 'word-forward', count: 1 });
    });

    expect(ta.value).toBe(INITIAL);
    expect(applyChange).not.toHaveBeenCalled();
  });

  it('SET_MODE updates the returned caretMode', () => {
    const { bus, ta } = renderHarness('e1');
    expect(caretModeOf(ta)).toBe('bar');

    act(() => {
      bus.emit('UI:SET_MODE', { editorId: 'e1', mode: 'INSERT', caret: 'bar' });
    });

    expect(caretModeOf(ta)).toBe('bar');

    act(() => {
      bus.emit('UI:SET_MODE', { editorId: 'e1', mode: 'NORMAL', caret: 'block' });
    });

    expect(caretModeOf(ta)).toBe('block');
  });

  it('INSERT_TEXT inserts at the caret and calls applyChange', () => {
    const { bus, ta, applyChange } = renderHarness('e1');
    ta.setSelectionRange(6, 6);

    act(() => {
      bus.emit('UI:INSERT_TEXT', { editorId: 'e1', text: 'XY' });
    });

    expect(ta.value).toBe('hello XYworld\nfoo bar');
    expect(applyChange).toHaveBeenCalledWith('hello XYworld\nfoo bar');
  });

  it('with editorId undefined, no capability event mutates the textarea', () => {
    const { bus, ta, applyChange } = renderHarness(undefined);
    ta.setSelectionRange(0, 0);

    act(() => {
      bus.emit('UI:OPERATE', { editorId: 'e1', operator: 'delete', motion: 'word-forward', count: 1 });
      bus.emit('UI:MOTION', { editorId: 'e1', motion: 'word-forward', count: 1 });
    });

    expect(ta.value).toBe(INITIAL);
    expect(applyChange).not.toHaveBeenCalled();
  });
});
