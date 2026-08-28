'use client';
/**
 * DocumentDetails Molecule
 *
 * The document's settings rail card — the Gutenberg "Document settings"
 * sidebar pattern: a compact bordered panel beside the writing surface
 * holding the record's metadata, so nothing sits between the document's
 * title and its content. Each property edits in place and commits the
 * moment it changes (boolean → switch, options → select, text →
 * click-to-edit input, `readonly` → display only); commits emit
 * `metaCommitEvent` with `{ id, patch }` where patch carries the id plus
 * the one changed field, ready to hand straight to a quiet partial persist.
 *
 * Rows are stacked (muted label over value) — the rail is narrow.
 * Renders nothing when `fields` is empty.
 */
import React, { useState } from 'react';
import type { EntityRow, EventEmit, FieldValue } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { formatValue, humanizeEnumValue, humanizeFieldName } from '../../../lib/format';
import { getNestedValue } from '../../../lib/getNestedValue';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { Box } from '../atoms/Box';
import { VStack, HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { Card } from '../atoms/Card';
import { Icon } from '../atoms/Icon';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Switch } from '../atoms/Switch';
import type { IconInput } from '../atoms/index';

export interface DocumentDetailsField {
  /** Entity field name (dot-notation supported for read-only display) */
  name?: string;
  /** Alias for `name` — RecordFieldSpec-style call sites pass `key` */
  key?: string;
  /** Display label (auto-generated from the field name if omitted) */
  label?: string;
  /** RecordFieldSpec-style alias for `label` */
  header?: string;
  /** Lucide icon name or component shown beside the label */
  icon?: IconInput;
  /** How the property edits: text input, boolean switch, select, or display-only.
   *  Inferred from the value when omitted (boolean → boolean, array → readonly, else text). */
  kind?: 'text' | 'boolean' | 'select' | 'readonly';
  /** Options for kind: 'select' */
  options?: readonly string[];
  /** Display format for the read value */
  format?: 'date' | 'currency' | 'number' | 'boolean' | 'percent';
}

/**
 * DocumentDetails — the document's metadata as a compact settings card for
 * the rail beside a DocumentPanel, each property committing in place.
 *
 * @capabilities document settings, page details, post settings sidebar, metadata panel, document properties, publish settings
 */
export interface DocumentDetailsProps {
  /** The loaded record — supplies the id every commit carries and the
   *  values the rows read. */
  entity?: EntityRow;
  /** The properties shown; empty renders nothing. */
  fields?: readonly DocumentDetailsField[];
  /** Emitted when a property commits: { id, patch } — patch carries the id
   *  plus the one changed field, ready for a partial persist update. */
  metaCommitEvent?: EventEmit<{ id: string; patch: Record<string, FieldValue> }>;
  /** Card heading (defaults to the localized "Details") */
  title?: string;
  className?: string;
}

function renderIconInput(icon: IconInput, props: React.ComponentProps<typeof Icon>): React.ReactElement {
  return typeof icon === 'string' ? <Icon name={icon} {...props} /> : <Icon icon={icon} {...props} />;
}

function fieldName(field: DocumentDetailsField): string {
  return field.name ?? field.key ?? '';
}

/** A hydrated relation row shown by its human label, never "[object Object]". */
function relationLabel(value: FieldValue): string | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value) || value instanceof Date) return null;
  for (const key of ['name', 'title', 'label'] as const) {
    const candidate = value[key];
    if (typeof candidate === 'string' && candidate !== '') return candidate;
  }
  const id = value.id;
  return id !== undefined && id !== null ? String(id) : null;
}

function fieldKind(field: DocumentDetailsField, value: FieldValue | undefined): NonNullable<DocumentDetailsField['kind']> {
  if (field.kind) return field.kind;
  if (field.options && field.options.length > 0) return 'select';
  if (typeof value === 'boolean' || field.format === 'boolean') return 'boolean';
  if (Array.isArray(value) || relationLabel(value ?? null) !== null) return 'readonly';
  return 'text';
}

export function DocumentDetails({
  entity,
  fields,
  metaCommitEvent,
  title,
  className,
}: DocumentDetailsProps): React.ReactElement | null {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const [fieldDraft, setFieldDraft] = useState<{ name: string; value: string } | null>(null);

  const recordId = entity?.id !== undefined && entity?.id !== null ? String(entity.id) : '';
  const fieldDefs = (fields ?? []).filter((f) => fieldName(f) !== '');
  if (fieldDefs.length === 0) return null;

  const commitField = (name: string, next: FieldValue, current: FieldValue | undefined) => {
    setFieldDraft(null);
    if (!metaCommitEvent || next === current) return;
    eventBus.emit(`UI:${metaCommitEvent}`, { id: recordId, patch: { id: recordId, [name]: next } });
  };

  const renderValue = (field: DocumentDetailsField) => {
    const name = fieldName(field);
    const raw = getNestedValue(entity ?? {}, name);
    const kind = fieldKind(field, raw);
    const label = field.label ?? field.header ?? humanizeFieldName(name);

    if (kind === 'boolean') {
      return (
        <Switch
          checked={Boolean(raw)}
          disabled={!metaCommitEvent}
          aria-label={label}
          onChange={(checked) => commitField(name, checked, Boolean(raw))}
        />
      );
    }

    if (kind === 'select') {
      return (
        <Select
          value={raw !== undefined && raw !== null ? String(raw) : ''}
          disabled={!metaCommitEvent}
          aria-label={label}
          className="h-8 w-full"
          options={(field.options ?? []).map((opt) => ({ value: opt, label: humanizeEnumValue(opt) }))}
          onChange={(e) => commitField(name, e.target.value, raw)}
        />
      );
    }

    if (kind === 'readonly' || !metaCommitEvent) {
      if (Array.isArray(raw)) {
        if (raw.length === 0) {
          return <Typography variant="small" color="secondary">—</Typography>;
        }
        return (
          <HStack gap="xs" className="flex-wrap">
            {raw.map((item, i) => (
              <Badge key={i} variant="default">{relationLabel(item) ?? humanizeEnumValue(String(item))}</Badge>
            ))}
          </HStack>
        );
      }
      const shown = raw === undefined || raw === null || raw === ''
        ? '—'
        : relationLabel(raw) ?? formatValue(raw, field.format);
      return <Typography variant="small" className="break-words">{shown}</Typography>;
    }

    // Editable text property: click-to-edit, commit on blur/Enter, Escape cancels.
    if (fieldDraft?.name === name) {
      return (
        <Input
          value={fieldDraft.value}
          autoFocus
          aria-label={label}
          className="h-8 w-full"
          onChange={(e) => setFieldDraft({ name, value: e.target.value })}
          onBlur={() => commitField(name, fieldDraft.value.trim(), raw)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitField(name, fieldDraft.value.trim(), raw);
            } else if (e.key === 'Escape') {
              e.preventDefault();
              setFieldDraft(null);
            }
          }}
          data-testid={`document-property-input-${name}`}
        />
      );
    }
    const shown = raw === undefined || raw === null || raw === ''
      ? '—'
      : relationLabel(raw) ?? formatValue(raw, field.format);
    return (
      <Box
        role="button"
        tabIndex={0}
        className={cn(
          'cursor-text rounded px-1 -mx-1 transition-colors hover:bg-muted/40',
          (raw === undefined || raw === null || raw === '') && 'text-muted-foreground',
        )}
        onClick={() => setFieldDraft({ name, value: raw !== undefined && raw !== null ? String(raw) : '' })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setFieldDraft({ name, value: raw !== undefined && raw !== null ? String(raw) : '' });
          }
        }}
        data-testid={`document-property-${name}`}
      >
        <Typography variant="small" className="break-words">{shown}</Typography>
      </Box>
    );
  };

  return (
    <Card variant="bordered" className={cn('w-full', className)}>
      <VStack gap="sm" className="p-4">
        <Typography variant="caption" color="secondary" weight="medium" className="uppercase tracking-wide">
          {title ?? (t('documentDetails.title') || 'Details')}
        </Typography>
        <VStack gap="sm">
          {fieldDefs.map((field) => {
            const name = fieldName(field);
            const label = field.label ?? field.header ?? humanizeFieldName(name);
            return (
              <VStack key={name} gap="xs">
                <HStack gap="xs" className="items-center">
                  {field.icon && renderIconInput(field.icon, { size: 'xs', className: 'text-muted-foreground' })}
                  <Typography variant="caption" color="muted">{label}</Typography>
                </HStack>
                <Box className="min-w-0">{renderValue(field)}</Box>
              </VStack>
            );
          })}
        </VStack>
      </VStack>
    </Card>
  );
}
