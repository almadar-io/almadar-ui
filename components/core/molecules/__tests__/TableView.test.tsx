/**
 * TableView Component Tests — relation-column rendering.
 *
 * `relation-field-rendered-raw`: a column whose entity field is relation-typed
 * must render the related row's label, not the raw foreign id. Pins both the
 * "no relationsData" (id shows, historical behavior for a column with nothing
 * to resolve against) and "relationsData present" (label shows) cases so the
 * fix can't silently regress either way.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableView, type TableViewColumn } from '../TableView';
import { EventBusProvider } from '../../../../providers/EventBusProvider';

const renderWithProvider = (ui: React.ReactElement) =>
  render(ui, { wrapper: ({ children }) => <EventBusProvider>{children}</EventBusProvider> });

const columns: readonly TableViewColumn[] = [
  { key: 'title', header: 'Applicant' },
  { key: 'interviewerName', field: 'interviewerName', header: 'Interviewer' },
];

const rows = [
  { id: '1', title: 'Jane Doe', interviewerName: 'staff-42' },
];

describe('TableView relation columns', () => {
  it('renders the raw foreign id when no relationsData is supplied', () => {
    renderWithProvider(<TableView entity={rows} columns={columns} />);
    expect(screen.getByText('staff-42')).toBeInTheDocument();
  });

  it('renders the related row label when relationsData resolves the column', () => {
    renderWithProvider(
      <TableView
        entity={rows}
        columns={columns}
        relationsData={{ interviewerName: [{ value: 'staff-42', label: 'Sam Staff' }] }}
      />,
    );
    expect(screen.getByText('Sam Staff')).toBeInTheDocument();
    expect(screen.queryByText('staff-42')).not.toBeInTheDocument();
  });

  it('renders a hydrated relation row by its label even without relationsData', () => {
    renderWithProvider(
      <TableView
        entity={[{ id: '1', title: 'Jane Doe', interviewerName: { id: 'staff-42', name: 'Sam Staff' } }]}
        columns={columns}
      />,
    );
    expect(screen.getByText('Sam Staff')).toBeInTheDocument();
  });

  it('resolves the label inside a badge-format relation column too', () => {
    const badgeColumns: readonly TableViewColumn[] = [
      { key: 'interviewerName', field: 'interviewerName', header: 'Interviewer', format: 'badge' },
    ];
    renderWithProvider(
      <TableView
        entity={rows}
        columns={badgeColumns}
        relationsData={{ interviewerName: [{ value: 'staff-42', label: 'Sam Staff' }] }}
      />,
    );
    expect(screen.getByText('Sam Staff')).toBeInTheDocument();
    expect(screen.queryByText('staff-42')).not.toBeInTheDocument();
  });
});

describe('TableView narrow (stacked) layout — G-CROSS-019', () => {
  const cols: readonly TableViewColumn[] = [
    { key: 'path', header: 'Path' },
    { key: 'method', header: 'Method', format: 'badge' },
    { key: 'owner', header: 'Owner' },
  ];
  const data = [{ id: 'r1', path: '/orders', method: 'GET', owner: 'Isle Zenith' }];

  it('is its own size container, so rows respond to the table width, not the viewport', () => {
    const { container } = renderWithProvider(<TableView entity={data} columns={cols} />);
    expect(container.querySelector('[role="table"]')?.className).toContain('@container/table');
  });

  it('labels every non-title cell with its column for the stacked view', () => {
    renderWithProvider(<TableView entity={data} columns={cols} />);
    const cells = screen.getAllByRole('cell');
    const labels = cells.map((c) => c.querySelector('[data-stacked-label]')?.textContent ?? null);
    expect(labels).toEqual([null, 'Method', 'Owner']);
  });

  it('control: the column header row still carries every label for the wide view', () => {
    renderWithProvider(<TableView entity={data} columns={cols} />);
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Path', 'Method', 'Owner']);
  });

  it('edge: a single-column table has no stacked labels at all', () => {
    renderWithProvider(<TableView entity={data} columns={[cols[0]]} />);
    expect(document.querySelectorAll('[data-stacked-label]')).toHaveLength(0);
  });

  it('edge: a render-prop row keeps its own layout and gets no stacked labels', () => {
    renderWithProvider(<TableView entity={data} columns={cols}>{(row) => <span>{String(row.path)}</span>}</TableView>);
    expect(document.querySelectorAll('[data-stacked-label]')).toHaveLength(0);
    expect(screen.getByText('/orders')).toBeTruthy();
  });
});
