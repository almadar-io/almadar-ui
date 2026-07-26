'use client';
/**
 * ImportPreviewTree Molecule
 *
 * Staged import preview: generic units grouped by targetEntity, nested by
 * parentRef, with per-unit field summaries, a skipped-elements section, and
 * confirm/cancel actions. Pure render — props in, events out.
 * Follows atomic design: composes Box, Badge, Button, Icon, Typography atoms.
 */

import React from 'react';
import type { FieldValue } from '@almadar/core';
import { Box } from '../../atoms/Box';
import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Typography } from '../../atoms/Typography';
import { cn } from '../../../../lib/cn';

export interface ImportPreviewUnit {
  /** Staging ref, provenance-linked to a source span */
  ref: string;
  /** Target entity name */
  targetEntity: string;
  /** Mapped field values */
  fields: Record<string, FieldValue>;
  /** Staging ref of the unit this nests under */
  parentRef?: string;
}

export interface ImportSkippedElement {
  ref: string;
  reason: string;
}

export interface ImportEntityDisplay {
  singular: string;
  plural: string;
}

export interface ImportPreviewTreeProps {
  /** Staged units to preview */
  units: ImportPreviewUnit[];
  /** Elements skipped during extraction, with reasons */
  skipped?: ImportSkippedElement[];
  /** Entity name → display labels; falls back to the entity name */
  entityDisplay: Record<string, ImportEntityDisplay>;
  /** Called when the user confirms the staged import */
  onConfirm?: () => void;
  /** Called when the user cancels the staged import */
  onCancel?: () => void;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Indent per tree depth in px (default: 16) */
  indent?: number;
  /** Additional CSS classes */
  className?: string;
}

const TITLE_KEYS = ['title', 'name', 'label'];

function formatFieldValue(value: FieldValue): string {
  if (value === null) return '—';
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(formatFieldValue).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function unitTitle(unit: ImportPreviewUnit): string {
  for (const key of TITLE_KEYS) {
    const value = unit.fields[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return unit.ref;
}

function fieldSummary(unit: ImportPreviewUnit): string {
  return Object.entries(unit.fields)
    .filter(([key]) => !TITLE_KEYS.includes(key))
    .map(([key, value]) => `${key}: ${formatFieldValue(value)}`)
    .join(' · ');
}

export const ImportPreviewTree: React.FC<ImportPreviewTreeProps> = ({
  units,
  skipped = [],
  entityDisplay,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm import',
  cancelLabel = 'Cancel',
  indent = 16,
  className,
}) => {
  const groups = new Map<string, ImportPreviewUnit[]>();
  for (const unit of units) {
    const group = groups.get(unit.targetEntity);
    if (group) group.push(unit);
    else groups.set(unit.targetEntity, [unit]);
  }

  const renderUnit = (unit: ImportPreviewUnit, childrenByParent: Map<string, ImportPreviewUnit[]>, depth: number) => {
    const summary = fieldSummary(unit);
    const children = childrenByParent.get(unit.ref) ?? [];
    return (
      <React.Fragment key={unit.ref}>
        <Box
          className="flex flex-col py-1"
          style={{ paddingLeft: depth * indent }}
          data-testid={`import-preview-unit-${unit.ref}`}
        >
          <Box className="flex items-center gap-2">
            <Icon icon="file-text" size="xs" className="text-muted-foreground" />
            <Typography variant="body2">{unitTitle(unit)}</Typography>
          </Box>
          {summary ? (
            <Typography variant="caption" className="text-muted-foreground">
              {summary}
            </Typography>
          ) : null}
        </Box>
        {children.map((child) => renderUnit(child, childrenByParent, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <Box className={cn('flex flex-col gap-4', className)}>
      {units.length === 0 ? (
        <Typography variant="body2" className="text-muted-foreground">
          No units staged.
        </Typography>
      ) : null}
      {Array.from(groups.entries()).map(([entity, groupUnits]) => {
        const refs = new Set(groupUnits.map((unit) => unit.ref));
        const childrenByParent = new Map<string, ImportPreviewUnit[]>();
        const roots: ImportPreviewUnit[] = [];
        for (const unit of groupUnits) {
          if (unit.parentRef && refs.has(unit.parentRef)) {
            const siblings = childrenByParent.get(unit.parentRef);
            if (siblings) siblings.push(unit);
            else childrenByParent.set(unit.parentRef, [unit]);
          } else {
            roots.push(unit);
          }
        }
        const label = entityDisplay[entity]?.plural ?? entity;
        return (
          <Box key={entity} border className="rounded-md border-border bg-card p-3">
            <Box className="flex items-center gap-2 pb-2">
              <Typography variant="label">{label}</Typography>
              <Badge amount={groupUnits.length} />
            </Box>
            {roots.map((unit) => renderUnit(unit, childrenByParent, 0))}
          </Box>
        );
      })}
      {skipped.length > 0 ? (
        <Box border className="rounded-md border-border bg-card p-3">
          <Box className="flex items-center gap-2 pb-2">
            <Typography variant="label">Skipped</Typography>
            <Badge amount={skipped.length} />
          </Box>
          {skipped.map((element) => (
            <Box key={element.ref} className="flex items-baseline gap-2 py-1">
              <Typography variant="body2">{element.ref}</Typography>
              <Typography variant="caption" className="text-muted-foreground">
                {element.reason}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : null}
      {onConfirm || onCancel ? (
        <Box className="flex items-center justify-end gap-2">
          {onCancel ? (
            <Button variant="default" label={cancelLabel} onClick={onCancel} />
          ) : null}
          {onConfirm ? (
            <Button variant="primary" label={confirmLabel} onClick={onConfirm} />
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
};

export default ImportPreviewTree;
