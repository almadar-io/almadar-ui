'use client';
/**
 * The row-scoped action filter every list component shares: binds the viewer
 * (`@user`) from the ambient `UserProvider` once and returns the function that
 * yields the actions drawn for a row (see `lib/row-action-when`).
 */
import { useCallback } from 'react';
import { useUser } from '../providers/UserContext';
import type { EntityRow } from '@almadar/core';
import { actionsShownForRow, type RowConditionalAction } from '../lib/row-action-when';

export function useRowActions(): <A extends RowConditionalAction>(
  actions: readonly A[],
  row: EntityRow,
) => readonly A[] {
  const { user } = useUser();
  return useCallback(
    <A extends RowConditionalAction>(actions: readonly A[], row: EntityRow) =>
      actionsShownForRow(actions, row, { user }),
    [user],
  );
}
