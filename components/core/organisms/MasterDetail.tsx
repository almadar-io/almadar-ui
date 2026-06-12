'use client';
 
/**
 * MasterDetail Component
 *
 * A layout pattern that shows a list/table of entities.
 * This is a thin wrapper around DataTable that accepts master-detail specific props.
 *
 * The `entity` prop carries the data array (injected by the runtime).
 * The "detail" part is typically rendered separately via another render_ui effect
 * to a sidebar or detail panel when an item is selected.
 */

import React from 'react';
import { DataTable, type DataTableProps } from './DataTable';
import type { DisplayStateProps } from './types';
import type { EntityRow } from '@almadar/core';
import { useTranslate } from '../../../hooks/useTranslate';

export interface MasterDetailProps<T extends EntityRow & { id: string | number } = EntityRow & { id: string | number }> extends DisplayStateProps {
  /** Entity rows to display in the master list (collection cardinality). */
  entity?: readonly EntityRow[];
  /** Fields to show in the master list (maps to DataTable columns) */
  masterFields: readonly string[];
  /** Fields for detail view (passed through but typically handled by separate render_ui) */
  detailFields?: readonly string[];
  /** Loading state (alias for isLoading) */
  loading?: boolean;
}

export function MasterDetail<T extends EntityRow & { id: string | number }>({
  entity,
  masterFields,
  detailFields: _detailFields, // Captured but not used here - detail handled separately
  loading: externalLoading,
  isLoading: externalIsLoading,
  error: externalError,
  className,
  ...rest
}: MasterDetailProps<T>): React.ReactElement {
  const { t } = useTranslate();
  const loading = externalLoading ?? false;
  const isLoading = externalIsLoading ?? false;
  const error = externalError ?? null;

  return (
    <DataTable<T>
      fields={masterFields}
      columns={masterFields}
      entity={entity}
      isLoading={loading || isLoading}
      error={error}
      className={className}
      emptyTitle={t('table.empty.title')}
      emptyDescription={t('empty.createFirst')}
      {...(rest as Partial<DataTableProps<T>>)}
    />
  );
}

MasterDetail.displayName = 'MasterDetail';

export default MasterDetail;
