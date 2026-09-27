import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VersionDiff, type DiffHunk, type DiffRevision } from '../VersionDiff';
import { EventBusProvider } from '../../../../providers/EventBusProvider';
import { useEventBus } from '../../../../hooks/useEventBus';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <EventBusProvider debug={false}>{children}</EventBusProvider>
);

const revisions: DiffRevision[] = [
  { id: 'r1', label: 'v1', author: 'Ada', content: 'title: Tasks\ncolor: blue' },
  { id: 'r2', label: 'v2', author: 'Agent', content: 'title: Tasks\ncolor: green' },
];

const hunks: DiffHunk[] = [
  {
    header: '@@ -1,2 +1,2 @@ orbitals/Task.orb',
    lines: [
      { type: 'context', beforeLineNumber: 1, afterLineNumber: 1, content: 'title: Tasks' },
      { type: 'removed', beforeLineNumber: 2, content: 'color: blue' },
      { type: 'added', afterLineNumber: 2, content: 'color: green' },
    ],
  },
];

function listen(event: string, listener: (e: { type: string; payload?: object }) => void): React.FC {
  return function Listener() {
    const bus = useEventBus();
    React.useEffect(() => bus.on(event, listener), [bus]);
    return null;
  };
}

describe('VersionDiff', () => {
  it('diffs two revisions: one line removed, one added, with revision pickers', () => {
    render(<Wrapper><VersionDiff revisions={revisions} /></Wrapper>);
    expect(screen.getByText('+1')).toBeTruthy();
    expect(screen.getByText('-1')).toBeTruthy();
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
  });

  it('the view toggle switches between side-by-side and inline', () => {
    render(<Wrapper><VersionDiff revisions={revisions} /></Wrapper>);
    expect(screen.queryAllByText('+', { exact: true })).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: /inline/i }));
    expect(screen.getAllByText('+', { exact: true }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /side-by-side/i }));
    expect(screen.queryAllByText('+', { exact: true })).toHaveLength(0);
  });

  it('control: view="inline" opens inline', () => {
    render(<Wrapper><VersionDiff revisions={revisions} view="inline" /></Wrapper>);
    expect(screen.getAllByText('+', { exact: true }).length).toBeGreaterThan(0);
  });

  it('revert emits UI:{revertEvent} with the "before" revision id', () => {
    const listener = vi.fn();
    const Listener = listen('UI:ROLLBACK', listener);
    render(<Wrapper><Listener /><VersionDiff revisions={revisions} revertEvent="ROLLBACK" /></Wrapper>);
    fireEvent.click(screen.getByRole('button', { name: /revert/i }));
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ type: 'UI:ROLLBACK', payload: { id: 'r1' } }));
  });

  it('control: no revert button without a revert handler or event', () => {
    render(<Wrapper><VersionDiff revisions={revisions} /></Wrapper>);
    expect(screen.queryByRole('button', { name: /revert/i })).toBeNull();
  });

  it('edge: a non-array revisions payload or a single revision renders without crashing', () => {
    const { rerender } = render(<Wrapper><VersionDiff revisions={{ not: 'an array' }} /></Wrapper>);
    expect(screen.getByText('+0')).toBeTruthy();
    rerender(<Wrapper><VersionDiff revisions={[revisions[0]]} /></Wrapper>);
    expect(screen.getByText('+0')).toBeTruthy();
  });

  it('hunks: renders a git diff\'s hunks (header, lines, stats) with no revision pickers', () => {
    render(<Wrapper><VersionDiff hunks={hunks} view="inline" /></Wrapper>);
    expect(screen.getByText('@@ -1,2 +1,2 @@ orbitals/Task.orb')).toBeTruthy();
    expect(screen.getByText('color: green')).toBeTruthy();
    expect(screen.getByText('color: blue')).toBeTruthy();
    expect(screen.getByText('+1')).toBeTruthy();
    expect(screen.getByText('-1')).toBeTruthy();
    expect(screen.queryAllByRole('combobox')).toHaveLength(0);
  });

  it('hunks side-by-side: removed lines sit in the before column, added lines in the after column', () => {
    render(<Wrapper><VersionDiff hunks={hunks} /></Wrapper>);
    const before = screen.getByTestId('version-diff-before');
    const after = screen.getByTestId('version-diff-after');
    expect(before.textContent).toContain('color: blue');
    expect(before.textContent).not.toContain('color: green');
    expect(after.textContent).toContain('color: green');
  });

  it('edge: empty hunks show the no-changes message', () => {
    render(<Wrapper><VersionDiff hunks={[]} /></Wrapper>);
    expect(screen.getByTestId('version-diff-empty')).toBeTruthy();
  });
});
