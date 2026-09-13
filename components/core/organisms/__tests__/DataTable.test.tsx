/**
 * DataTable (entity-table) Component Tests — relation-column rendering.
 *
 * `relation-field-rendered-raw`: a column whose entity field is relation-typed
 * must render the related row's label, not the raw foreign id.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTable, type Column } from '../DataTable';
import { EventBusProvider } from '../../../../providers/EventBusProvider';

const renderWithProvider = (ui: React.ReactElement) =>
  render(ui, { wrapper: ({ children }) => <EventBusProvider>{children}</EventBusProvider> });

type Row = {
  id: string;
  title: string;
  assignee: string;
};

const columns: readonly Column<Row>[] = [
  { key: 'title', header: 'Title' },
  { key: 'assignee', header: 'Assignee' },
];

const rows: Row[] = [{ id: '1', title: 'Task One', assignee: 'staff-42' }];

describe('DataTable relation columns', () => {
  it('renders the raw foreign id when no relationsData is supplied', () => {
    renderWithProvider(<DataTable entity={rows} fields={columns} />);
    expect(screen.getByText('staff-42')).toBeInTheDocument();
  });

  it('renders the related row label when relationsData resolves the column', () => {
    renderWithProvider(
      <DataTable
        entity={rows}
        fields={columns}
        relationsData={{ assignee: [{ value: 'staff-42', label: 'Sam Staff' }] }}
      />,
    );
    expect(screen.getByText('Sam Staff')).toBeInTheDocument();
    expect(screen.queryByText('staff-42')).not.toBeInTheDocument();
  });
});
