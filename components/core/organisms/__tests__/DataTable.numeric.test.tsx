import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '../DataTable';
import { EventBusProvider } from '../../../../providers/EventBusProvider';
import { useEventBus } from '../../../../hooks/useEventBus';

const rows = [
  { id: '1', name: 'Alpha', amount: 1234567.5, active: 'true' },
  { id: '2', name: 'Beta', amount: 20, active: 'false' },
];

function Listen({ event, spy }: { event: string; spy: (p: unknown) => void }) {
  const bus = useEventBus();
  React.useEffect(() => bus.on(event, (e) => spy(e.payload)), [bus, event, spy]);
  return null;
}

function renderTable(fields: React.ComponentProps<typeof DataTable>['fields'], extra: Partial<React.ComponentProps<typeof DataTable>> = {}) {
  return render(
    <EventBusProvider debug={false}>
      <DataTable entity={rows} fields={fields} {...extra} />
    </EventBusProvider>,
  );
}

describe('DataTable declared columns', () => {
  it('a column declared format number + align right is locale-formatted and end-aligned, header too', () => {
    renderTable([{ key: 'name', header: 'Name' }, { key: 'amount', header: 'Amount', format: 'number', align: 'right' }]);
    const cell = screen.getByText(new Intl.NumberFormat('en').format(1234567.5));
    expect(cell.closest('td')?.className).toMatch(/text-end/);
    expect(cell.closest('td')?.className).toMatch(/tabular-nums/);
    const header = screen.getByRole('columnheader', { name: 'Amount' });
    expect(header.className).toMatch(/text-end/);
    expect((header.firstElementChild as HTMLElement).className).toMatch(/justify-end/);
  });

  it('control: an undeclared numeric column is plain, start-aligned text', () => {
    renderTable(['name', 'amount']);
    const cell = screen.getByText('1234567.5');
    expect(cell.closest('td')?.className).not.toMatch(/text-end/);
  });

  it('a column declared format boolean renders Yes/No', () => {
    renderTable([{ key: 'active', header: 'Active', format: 'boolean' }]);
    expect(screen.getAllByText('Yes').length).toBe(1);
    expect(screen.getAllByText('No').length).toBe(1);
  });

  it('control: an undeclared "true" string stays text', () => {
    renderTable(['active']);
    expect(screen.getByText('true')).toBeTruthy();
    expect(screen.queryByText('Yes')).toBeNull();
  });

  it('the header row stays in view when the table scrolls', () => {
    renderTable(['name']);
    expect(screen.getAllByRole('rowgroup')[0].className).toMatch(/sticky/);
  });
});

describe('DataTable row click', () => {
  it('a declared itemClickEvent makes rows activatable and emits { id, row }', () => {
    const spy = vi.fn();
    render(
      <EventBusProvider debug={false}>
        <Listen event="UI:OPEN_ROW" spy={spy} />
        <DataTable entity={rows} fields={['name']} itemClickEvent="OPEN_ROW" />
      </EventBusProvider>,
    );
    const row = screen.getByText('Alpha').closest('tr');
    expect(row?.getAttribute('tabindex')).toBe('0');
    if (row) fireEvent.keyDown(row, { key: 'Enter' });
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });

  it('control: an action named VIEW no longer hijacks the row click', () => {
    render(
      <EventBusProvider debug={false}>
        <DataTable entity={rows} fields={['name']} itemActions={[{ label: 'View', event: 'VIEW' }]} />
      </EventBusProvider>,
    );
    expect(screen.getByText('Alpha').closest('tr')?.getAttribute('tabindex')).toBeNull();
  });
});
