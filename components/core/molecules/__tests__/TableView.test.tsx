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
