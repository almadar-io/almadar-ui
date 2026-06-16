'use client';
import React from 'react';
import type { TraitConfigValue, TraitConfigObject } from '@almadar/core';
import { VStack, HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Switch } from '../atoms/Switch';
import { Input } from '../atoms/Input';
import { cn } from '../../../lib/cn';

export interface ObjectEditorProps {
  /** Current object value. */
  value: TraitConfigObject;
  /** Fired when any field changes. */
  onChange: (next: TraitConfigObject) => void;
  /** Additional CSS classes. */
  className?: string;
}

function isTraitConfigObject(v: TraitConfigValue): v is TraitConfigObject {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** Scalar leaf editor for a single object field value. */
function ScalarControl({
  fieldKey,
  value,
  onFieldChange,
}: {
  fieldKey: string;
  value: TraitConfigValue;
  onFieldChange: (k: string, next: TraitConfigValue) => void;
}): React.ReactElement {
  if (typeof value === 'boolean') {
    return <Switch checked={value} onChange={(c) => onFieldChange(fieldKey, c)} />;
  }
  if (typeof value === 'number') {
    const [draft, setDraft] = React.useState(String(value));
    React.useEffect(() => setDraft(String(value)), [value]);
    const commit = (): void => {
      const n = draft.trim() === '' ? 0 : Number(draft);
      onFieldChange(fieldKey, Number.isNaN(n) ? 0 : n);
    };
    return (
      <Input
        inputType="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
      />
    );
  }
  if (isTraitConfigObject(value)) {
    const [draft, setDraft] = React.useState(JSON.stringify(value));
    React.useEffect(() => setDraft(JSON.stringify(value)), [value]);
    const commit = (): void => {
      try { onFieldChange(fieldKey, JSON.parse(draft) as TraitConfigObject); } catch { /* keep draft */ }
    };
    return (
      <Input
        inputType="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
      />
    );
  }
  if (Array.isArray(value)) {
    const [draft, setDraft] = React.useState(JSON.stringify(value));
    React.useEffect(() => setDraft(JSON.stringify(value)), [value]);
    const commit = (): void => {
      try { onFieldChange(fieldKey, JSON.parse(draft) as ReadonlyArray<TraitConfigValue>); } catch { /* keep draft */ }
    };
    return (
      <Input
        inputType="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
      />
    );
  }
  // string | null
  const [draft, setDraft] = React.useState(value === null ? '' : String(value));
  React.useEffect(() => setDraft(value === null ? '' : String(value)), [value]);
  const commit = (): void => { onFieldChange(fieldKey, draft); };
  return (
    <Input
      inputType="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
    />
  );
}

/**
 * ObjectEditor — edits a `TraitConfigObject` showing one labeled row per key.
 * Keys are fixed (derived from the current object's shape).
 */
export const ObjectEditor: React.FC<ObjectEditorProps> = ({ value, onChange, className }) => {
  const entries = Object.entries(value);

  const handleFieldChange = (k: string, next: TraitConfigValue): void => {
    onChange({ ...value, [k]: next });
  };

  if (entries.length === 0) {
    return (
      <Typography variant="caption" color="muted">
        Empty object
      </Typography>
    );
  }

  return (
    <VStack gap="xs" className={cn('w-full', className)}>
      {entries.map(([k, v]) => (
        <HStack key={k} gap="sm" align="center">
          <Typography variant="caption" className="w-24 shrink-0 text-muted-foreground truncate" title={k}>
            {k}
          </Typography>
          <div className="flex-1">
            <ScalarControl fieldKey={k} value={v} onFieldChange={handleFieldChange} />
          </div>
        </HStack>
      ))}
    </VStack>
  );
};
