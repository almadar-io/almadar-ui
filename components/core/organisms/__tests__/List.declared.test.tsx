import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { List } from '../List';
import { EventBusProvider } from '../../../../providers/EventBusProvider';
import { useEventBus } from '../../../../hooks/useEventBus';

const wrap = (ui: React.ReactElement) => render(<EventBusProvider debug={false}>{ui}</EventBusProvider>);

const rows = [{ id: '1', name: 'Launch', status: 'failed', progress: 40, due: '2024-03-05', budget: 1200 }];

describe('List declared fields', () => {
  it('renders the declared h3 field as the title', () => {
    wrap(<List entity={rows} fields={[{ name: 'name', variant: 'h3' }]} />);
    expect(screen.getByRole('heading', { name: 'Launch' })).toBeInTheDocument();
  });

  it('renders no title row when none is declared', () => {
    wrap(<List entity={rows} fields={['name']} />);
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.queryByText('Untitled')).toBeNull();
    expect(screen.getByText('Launch')).toBeInTheDocument();
  });

  it('colours a declared badge from colorMap only', () => {
    wrap(<List entity={rows} fields={[{ name: 'status', variant: 'badge', colorMap: { failed: 'danger' } }]} />);
    expect(screen.getByText('failed').className).toMatch(/error|danger/);
  });

  it('keeps a badge neutral when the value is unmapped', () => {
    wrap(<List entity={rows} fields={[{ name: 'status', variant: 'badge' }]} />);
    expect(screen.getByText('failed').className).not.toMatch(/error|danger/);
  });

  it('renders an undeclared status field as labelled metadata', () => {
    wrap(<List entity={rows} fields={['status']} />);
    expect(screen.getByText('status:')).toBeInTheDocument();
  });

  it('draws a declared progress field as a bar and an undeclared one as text', () => {
    const { unmount } = wrap(<List entity={rows} fields={[{ name: 'progress', variant: 'progress' }]} />);
    expect(screen.getByText('40%')).toBeInTheDocument();
    unmount();
    wrap(<List entity={rows} fields={['progress']} />);
    expect(screen.queryByText('40%')).toBeNull();
    expect(screen.getByText('40')).toBeInTheDocument();
  });

  it('formats by declared format, never by field name', () => {
    wrap(<List entity={rows} fields={[{ name: 'budget', format: 'currency' }, 'progress']} />);
    expect(screen.getByText('$1,200.00')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
  });

  it('formats a declared date and leaves a date-shaped undeclared value raw', () => {
    const { unmount } = wrap(<List entity={rows} fields={[{ name: 'due', format: 'date' }]} />);
    expect(screen.queryByText('2024-03-05')).toBeNull();
    unmount();
    wrap(<List entity={rows} fields={['due']} />);
    expect(screen.getByText('2024-03-05')).toBeInTheDocument();
  });

  it('uses the declared label and does not strip a trailing Id', () => {
    wrap(<List entity={[{ id: '1', ownerId: 'u1', code: 'c' }]} fields={['ownerId', { name: 'code', label: 'Ref' }]} />);
    expect(screen.getByText('ownerId:')).toBeInTheDocument();
    expect(screen.getByText('Ref:')).toBeInTheDocument();
  });

  it('shows more than two metadata fields', () => {
    wrap(<List entity={[{ id: '1', a: '1', b: '2', c: '3', d: '4' }]} fields={['a', 'b', 'c', 'd']} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('row click is only itemClickEvent', () => {
    const seen = vi.fn();
    const Probe: React.FC = () => {
      const bus = useEventBus();
      React.useEffect(() => bus.on('UI:VIEW', seen), [bus]);
      return null;
    };
    const actions = [{ label: 'View', event: 'VIEW' as const }];
    const { unmount } = wrap(<><Probe /><List entity={rows} fields={['name']} itemActions={actions} itemClickEvent="VIEW" /></>);
    fireEvent.click(screen.getByText('Launch'));
    expect(seen).toHaveBeenCalledTimes(1);
    unmount();
    seen.mockClear();
    wrap(<><Probe /><List entity={rows} fields={['name']} itemActions={actions} /></>);
    fireEvent.click(screen.getByText('Launch'));
    expect(seen).not.toHaveBeenCalled();
  });

  it('promotes only actions that declare an icon; label text decides nothing', () => {
    const actions = [
      { label: 'Edit', event: 'EDIT' as const },
      { label: 'Inspect', event: 'INSPECT' as const, icon: 'eye' },
    ];
    wrap(<List entity={rows} fields={['name']} itemActions={actions} />);
    expect(screen.getByTestId('action-INSPECT')).toBeInTheDocument();
    expect(screen.queryByTestId('action-EDIT')).toBeNull();
  });
});

describe('List declared row states', () => {
  const rows = [
    { id: '1', title: 'Ship v2', done: true, locked: false },
    { id: '2', title: 'Write docs', done: false, locked: true },
  ];
  const fields = [{ name: 'title', variant: 'h3' as const }];

  it('a declared completedField strikes the completed title through', () => {
    wrap(<List entity={rows} fields={fields} completedField="done" />);
    expect(screen.getByText('Ship v2').className).toContain('line-through');
    expect(screen.getByText('Write docs').className).not.toContain('line-through');
  });

  it('a declared disabledField dims the row and drops its click', () => {
    wrap(<List entity={rows} fields={fields} disabledField="locked" itemClickEvent="OPEN" />);
    const row = screen.getByText('Write docs').closest('[aria-disabled="true"]');
    expect(row?.className).toContain('opacity-50');
    expect(screen.getByText('Ship v2').closest('[aria-disabled="true"]')).toBeNull();
  });

  it('control: without the declarations, fields named completed/disabled mean nothing', () => {
    wrap(<List entity={[{ id: '1', title: 'Ship v2', completed: true, disabled: true }]} fields={fields} />);
    expect(screen.getByText('Ship v2').className).not.toContain('line-through');
    expect(screen.getByText('Ship v2').closest('[aria-disabled="true"]')).toBeNull();
  });

  it('badges show their declared value labels', () => {
    wrap(<List entity={[{ id: '1', title: 'T', status: 'in_progress' }]} fields={[{ name: 'title', variant: 'h3' }, { name: 'status', variant: 'badge', labels: { in_progress: 'قيد التنفيذ' } }]} />);
    expect(screen.getByText('قيد التنفيذ')).toBeTruthy();
  });
});
