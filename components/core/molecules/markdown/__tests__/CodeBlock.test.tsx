/**
 * CodeBlock Component Tests
 *
 * GAP-84 regression: `CodeBlock` had three render branches (standard /
 * editable / viewer) but only the first two tokenized code through
 * `SyntaxHighlighter` — viewer mode (`title`/`files`/`showLineNumbers`/
 * `diff`/`actions`) mapped `code.split('\n')` straight into `<Typography>`
 * rows with NO Prism pass at all, live on the public marketing/playground
 * sites via `OrbPreviewBlock`. These tests assert real tokenization (a
 * `.token` span count) for every branch, including diff rows, so the defect
 * can't silently come back.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { CodeBlock, EDITOR_MOTIONS, EDITOR_OPERATORS } from '../CodeBlock';
import { EventBusProvider } from '../../../../../providers/EventBusProvider';
import { useEventBus, type EventBusContextType } from '../../../../../hooks/useEventBus';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <EventBusProvider debug={false}>{children}</EventBusProvider>;
}

const JSON_CODE = '{\n  "orbital": "Task",\n  "count": 3\n}';

describe('CodeBlock', () => {
  it('standard mode: tokenizes JSON via SyntaxHighlighter', () => {
    const { container } = render(
      <Wrapper>
        <CodeBlock code={JSON_CODE} language="json" />
      </Wrapper>,
    );
    const tokens = container.querySelectorAll('span.token');
    expect(tokens.length).toBeGreaterThan(1);
    expect(container.textContent).toContain('"orbital"');
  });

  it('viewer mode (title): tokenizes JSON via SyntaxHighlighter (GAP-84)', () => {
    // This is the exact call shape of the live GAP-84 callers
    // (OrbPreviewBlock passes title="schema.orb"), which used to route into
    // the unhighlighted `activeCode.split('\n')` → `<Typography>` branch.
    const { container } = render(
      <Wrapper>
        <CodeBlock code={JSON_CODE} language="json" title="schema.orb" />
      </Wrapper>,
    );
    const tokens = container.querySelectorAll('span.token');
    expect(tokens.length).toBeGreaterThan(1);
    expect(container.textContent).toContain('"orbital"');
  });

  it('viewer mode (showLineNumbers): tokenizes AND renders line numbers', () => {
    const { container } = render(
      <Wrapper>
        <CodeBlock code={JSON_CODE} language="json" title="schema.orb" showLineNumbers />
      </Wrapper>,
    );
    const tokens = container.querySelectorAll('span.token');
    expect(tokens.length).toBeGreaterThan(1);

    const lineNumbers = container.querySelectorAll('.react-syntax-highlighter-line-number');
    expect(lineNumbers.length).toBeGreaterThan(0);
    expect(lineNumbers[0]?.textContent).toContain('1');
  });

  it('editable mode: the Prism overlay produces token spans', () => {
    const { container } = render(
      <Wrapper>
        <CodeBlock code={JSON_CODE} language="json" editable onChange={() => {}} />
      </Wrapper>,
    );
    const tokens = container.querySelectorAll('span.token');
    expect(tokens.length).toBeGreaterThan(1);
  });

  it('diff mode: tokenizes +/- lines AND keeps diff row backgrounds', () => {
    const { container } = render(
      <Wrapper>
        <CodeBlock
          language="json"
          title="schema.orb"
          diff={[
            { type: 'context', content: '{', lineNumber: 1 },
            { type: 'remove', content: '  "count": 2', lineNumber: 2 },
            { type: 'add', content: '  "count": 3', lineNumber: 2 },
            { type: 'context', content: '}', lineNumber: 3 },
          ]}
        />
      </Wrapper>,
    );

    const tokens = container.querySelectorAll('span.token');
    expect(tokens.length).toBeGreaterThan(1);
    expect(container.textContent).toContain('"count"');

    const removedRow = Array.from(container.querySelectorAll('.bg-error\\/10'));
    const addedRow = Array.from(container.querySelectorAll('.bg-success\\/10'));
    expect(removedRow.length).toBeGreaterThan(0);
    expect(addedRow.length).toBeGreaterThan(0);
  });

  // P0-1 S-A: declaration-only editor capability surface (plugin system,
  // Part D1). Runtime wiring lands in P1 — these props are accepted but
  // inert here.
  describe('editor capability surface (declaration-only)', () => {
    it('EDITOR_MOTIONS lists all 17 motions', () => {
      expect(EDITOR_MOTIONS).toHaveLength(17);
      expect(EDITOR_MOTIONS).toEqual([
        'left',
        'right',
        'up',
        'down',
        'word-forward',
        'word-back',
        'word-end',
        'line-start',
        'line-end',
        'first-nonblank',
        'doc-start',
        'doc-end',
        'paragraph-forward',
        'paragraph-back',
        'line',
        'selection',
        'match-bracket',
      ]);
    });

    it('EDITOR_OPERATORS lists all 12 operators', () => {
      expect(EDITOR_OPERATORS).toEqual([
        'delete',
        'yank',
        'change',
        'put',
        'put-before',
        'undo',
        'redo',
        'join',
        'toggle-case',
        'indent',
        'dedent',
        'replace',
      ]);
    });

    it('accepts the editor capability props without runtime error', () => {
      const { container } = render(
        <Wrapper>
          <CodeBlock
            code={JSON_CODE}
            language="json"
            editorId="editor-1"
            onEditorFocus="EDITOR_FOCUS"
            onEditorBlur="EDITOR_BLUR"
            onMotion="MOTION"
            onOperate="OPERATE"
            onInsertText="INSERT_TEXT"
            onSetMode="SET_MODE"
            motions={EDITOR_MOTIONS}
            operators={EDITOR_OPERATORS}
          />
        </Wrapper>,
      );
      const tokens = container.querySelectorAll('span.token');
      expect(tokens.length).toBeGreaterThan(1);
    });
  });

  // P1-1 S-H: runtime wiring of the editor capability surface (Part E3).
  describe('editor capabilities (runtime wiring)', () => {
    function BusGrabber({ onBus }: { onBus: (bus: EventBusContextType) => void }) {
      onBus(useEventBus());
      return null;
    }

    function renderEditable(props: { editorId?: string; onChange?: (code: string) => void }) {
      let bus!: EventBusContextType;
      const { container } = render(
        <Wrapper>
          <BusGrabber onBus={(b) => { bus = b; }} />
          <CodeBlock code="hello world" language="text" editable {...props} />
        </Wrapper>,
      );
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      return { bus, textarea };
    }

    it('emits UI:EDITOR_FOCUS on focus and UI:EDITOR_BLUR on blur when editorId is set', () => {
      const { bus, textarea } = renderEditable({ editorId: 'e1' });
      const focusSpy = vi.fn();
      const blurSpy = vi.fn();
      bus.on('UI:EDITOR_FOCUS', focusSpy);
      bus.on('UI:EDITOR_BLUR', blurSpy);

      fireEvent.focus(textarea);
      expect(focusSpy).toHaveBeenCalledTimes(1);
      expect(focusSpy.mock.calls[0][0].payload).toEqual({ editorId: 'e1' });

      fireEvent.blur(textarea);
      expect(blurSpy).toHaveBeenCalledTimes(1);
      expect(blurSpy.mock.calls[0][0].payload).toEqual({ editorId: 'e1' });
    });

    it('UI:OPERATE delete word-forward changes the textarea value and calls onChange with it', () => {
      const onChange = vi.fn();
      const { bus, textarea } = renderEditable({ editorId: 'e1', onChange });
      textarea.setSelectionRange(0, 0);

      act(() => {
        bus.emit('UI:OPERATE', { editorId: 'e1', operator: 'delete', motion: 'word-forward', count: 1 });
      });

      expect(textarea.value).toBe('world');
      expect(onChange).toHaveBeenCalledWith('world');
    });
  });
});
