// @vitest-environment jsdom
/**
 * useKeyboardRouter — declared-data keydown capture, sole emitter of UI:KEY.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { EventBusProvider } from '../providers/EventBusProvider';
import { useEventBus } from '../hooks/useEventBus';
import { useKeyboardRouter, mergeCaptureTables, type KeyCaptureTable, type EditorKeyEvent } from '../hooks/useKeyboardRouter';

function wrapper({ children }: { children?: React.ReactNode }): React.JSX.Element {
  return React.createElement(EventBusProvider, { isolated: true }, children as React.ReactElement);
}

function dispatchKeyDown(init: KeyboardEventInit): ReturnType<typeof vi.spyOn> {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  const preventDefault = vi.spyOn(event, 'preventDefault');
  window.dispatchEvent(event);
  return preventDefault;
}

function renderRouterWithBus(captureTable: KeyCaptureTable) {
  const received: EditorKeyEvent[] = [];
  const { result } = renderHook(
    () => {
      const bus = useEventBus();
      useKeyboardRouter({ captureTable });
      return bus;
    },
    { wrapper },
  );
  result.current.on('UI:KEY', (evt) => received.push(evt.payload as unknown as EditorKeyEvent));
  return { bus: result.current, received };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useKeyboardRouter', () => {
  it('captures a declared key for the focused editor and emits UI:KEY', () => {
    const captureTable: KeyCaptureTable = { e1: { mode: 'NORMAL', keys: new Set(['h']) } };
    const { bus, received } = renderRouterWithBus(captureTable);

    bus.emit('UI:EDITOR_FOCUS', { editorId: 'e1' });
    const preventDefault = dispatchKeyDown({ key: 'h', code: 'KeyH' });

    expect(preventDefault).toHaveBeenCalled();
    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({ editorId: 'e1', key: 'h', code: 'KeyH' });
  });

  it('does not preventDefault for an undeclared key, but still emits UI:KEY', () => {
    const captureTable: KeyCaptureTable = { e1: { mode: 'NORMAL', keys: new Set(['h']) } };
    const { bus, received } = renderRouterWithBus(captureTable);

    bus.emit('UI:EDITOR_FOCUS', { editorId: 'e1' });
    const preventDefault = dispatchKeyDown({ key: 'a', code: 'KeyA' });

    expect(preventDefault).not.toHaveBeenCalled();
    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({ editorId: 'e1', key: 'a' });
  });

  it('falls back to the shell target with no focus event; mode "any" captures every key', () => {
    const captureTable: KeyCaptureTable = { shell: { mode: 'any', keys: new Set() } };
    renderHook(() => useKeyboardRouter({ captureTable }), { wrapper });

    const preventDefault = dispatchKeyDown({ key: 'z', code: 'KeyZ' });

    expect(preventDefault).toHaveBeenCalled();
  });

  it('captures nothing when no shell entry is declared and no editor is focused', () => {
    const captureTable: KeyCaptureTable = {};
    renderHook(() => useKeyboardRouter({ captureTable }), { wrapper });

    const preventDefault = dispatchKeyDown({ key: 'z', code: 'KeyZ' });

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('falls back to shell after a matching UI:EDITOR_BLUR', () => {
    const captureTable: KeyCaptureTable = {
      e1: { mode: 'NORMAL', keys: new Set(['h']) },
      shell: { mode: 'any', keys: new Set() },
    };
    const { bus, received } = renderRouterWithBus(captureTable);

    bus.emit('UI:EDITOR_FOCUS', { editorId: 'e1' });
    bus.emit('UI:EDITOR_BLUR', { editorId: 'e1' });
    dispatchKeyDown({ key: 'x', code: 'KeyX' });

    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({ editorId: 'shell', key: 'x' });
  });

  it('removes the window keydown listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const captureTable: KeyCaptureTable = { shell: { mode: 'any', keys: new Set() } };

    const { unmount } = renderHook(() => useKeyboardRouter({ captureTable }), { wrapper });
    unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function), { capture: true });
  });

  it('ignores IME composition keydowns entirely — no emit', () => {
    const captureTable: KeyCaptureTable = { shell: { mode: 'any', keys: new Set() } };
    const { received } = renderRouterWithBus(captureTable);

    const preventDefault = dispatchKeyDown({ key: 'a', code: 'KeyA', isComposing: true });

    expect(preventDefault).not.toHaveBeenCalled();
    expect(received).toHaveLength(0);
  });
});

describe('mergeCaptureTables', () => {
  it('unions keys for a target declared by every table', () => {
    const merged = mergeCaptureTables([
      { editor: { mode: 'NORMAL', keys: new Set(['h', 'j']) } },
      { editor: { mode: 'NORMAL', keys: new Set(['j', 'k']) } },
    ]);

    expect(merged.editor.mode).toBe('NORMAL');
    expect(Array.from(merged.editor.keys).sort()).toEqual(['h', 'j', 'k']);
  });

  it('"any" wins over any other mode', () => {
    const merged = mergeCaptureTables([
      { editor: { mode: 'NORMAL', keys: new Set(['h']) } },
      { editor: { mode: 'any', keys: new Set() } },
    ]);

    expect(merged.editor.mode).toBe('any');
  });

  it('preserves the shared mode when every input agrees', () => {
    const merged = mergeCaptureTables([
      { editor: { mode: 'NORMAL', keys: new Set(['h']) } },
      { editor: { mode: 'NORMAL', keys: new Set(['j']) } },
      { editor: { mode: 'NORMAL', keys: new Set(['k']) } },
    ]);

    expect(merged.editor.mode).toBe('NORMAL');
  });

  it('joins distinct modes, sorted and pipe-separated', () => {
    const merged = mergeCaptureTables([
      { editor: { mode: 'VISUAL', keys: new Set(['v']) } },
      { editor: { mode: 'NORMAL', keys: new Set(['n']) } },
      { editor: { mode: 'INSERT', keys: new Set(['i']) } },
    ]);

    expect(merged.editor.mode).toBe('INSERT|NORMAL|VISUAL');
  });

  it('empty input yields an empty table', () => {
    expect(mergeCaptureTables([])).toEqual({});
  });

  it('a target present in only one table passes through unchanged', () => {
    const merged = mergeCaptureTables([
      { editor: { mode: 'NORMAL', keys: new Set(['h']) } },
      { shell: { mode: 'any', keys: new Set() } },
    ]);

    expect(merged.editor).toEqual({ mode: 'NORMAL', keys: new Set(['h']) });
    expect(merged.shell).toEqual({ mode: 'any', keys: new Set() });
  });
});
