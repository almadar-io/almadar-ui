'use client';
import React from 'react';
import type {
  DeclaredTraitConfig,
  ConfigFieldDeclaration,
  TraitConfig,
  TraitConfigValue,
  AssetCatalog,
} from '@almadar/core';
import { cn } from '../../../lib/cn';
import { VStack, HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Switch } from '../atoms/Switch';
import { Select } from '../atoms/Select';
import { Input } from '../atoms/Input';
import { FormSection } from './FormSection';
import { IconPicker } from './IconPicker';
import { AssetPicker } from './AssetPicker';
import type { DisplayStateProps } from '../organisms/types';

/**
 * PropertyInspector — Storybook-style controls panel for a trait's `config`.
 *
 * Derives one control per declared config field directly from the schema
 * (`@almadar/core` `DeclaredTraitConfig`): `boolean → Switch`, `string` with
 * `values → Select`, `number → numeric Input`, `string → Input`. Non-scalar
 * fields (array/object/node/SExpr) are shown read-only. Fields group + collapse
 * by `@tier`. The component is controlled — it emits `onChange(field, value)`;
 * text/number commit on blur (so the host can re-render without hammering it).
 */
export interface PropertyInspectorProps extends DisplayStateProps {
  /** The trait's declared config schema (field name → declaration). */
  config: DeclaredTraitConfig;
  /** Current override values keyed by field name (falls back to each field's `default`). */
  values?: TraitConfig;
  /** Fired when a control commits a new value. */
  onChange: (field: string, value: TraitConfigValue) => void;
  /** Optional reset-to-defaults handler. */
  onReset?: () => void;
  /** Panel heading (e.g. the trait name). */
  title?: string;
  /** Browsable asset catalog supplied to `control: 'asset'` fields. */
  assets?: AssetCatalog;
}

const TIER_ORDER = ['presentation', 'domain', 'policy', 'infra', 'internal'];

function currentValue(
  decl: ConfigFieldDeclaration,
  override: TraitConfigValue | undefined,
): TraitConfigValue | undefined {
  return override !== undefined ? override : decl.default;
}

/** Text/number control: local draft, commits to the host on blur or Enter. */
function TextLikeControl({
  field,
  numeric,
  value,
  onCommit,
}: {
  field: string;
  numeric: boolean;
  value: TraitConfigValue | undefined;
  onCommit: (field: string, value: TraitConfigValue) => void;
}): React.ReactElement {
  const initial = value === undefined || value === null ? '' : String(value);
  const [draft, setDraft] = React.useState(initial);
  React.useEffect(() => setDraft(initial), [initial]);

  const commit = (): void => {
    if (numeric) {
      const n = draft.trim() === '' ? 0 : Number(draft);
      onCommit(field, Number.isNaN(n) ? 0 : n);
    } else {
      onCommit(field, draft);
    }
  };

  return (
    <Input
      inputType={numeric ? 'number' : 'text'}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
      }}
    />
  );
}

function FieldControl({
  name,
  decl,
  value,
  onChange,
  assets,
}: {
  name: string;
  decl: ConfigFieldDeclaration;
  value: TraitConfigValue | undefined;
  onChange: (field: string, value: TraitConfigValue) => void;
  assets?: AssetCatalog;
}): React.ReactElement {
  let control: React.ReactNode;

  const stringValue = typeof value === 'string' ? value : undefined;

  // Deterministic `control` tag wins over the type-based dispatch below.
  if (decl.control === 'icon') {
    control = <IconPicker value={stringValue} onChange={(icon) => onChange(name, icon)} />;
  } else if (decl.control === 'asset' && assets !== undefined) {
    control = (
      <AssetPicker assets={assets} value={stringValue} onChange={(url) => onChange(name, url)} />
    );
  } else if (
    decl.control === 'color' &&
    decl.values !== undefined &&
    decl.values.length > 0
  ) {
    control = (
      <Select
        options={decl.values.map((v) => ({ value: v, label: v }))}
        value={stringValue ?? ''}
        onChange={(e) => onChange(name, e.target.value)}
      />
    );
  } else if (decl.control === 'asset' || decl.control === 'color') {
    // `asset` with no catalog / `color` with no enum: degrade to the text control.
    control = <TextLikeControl field={name} numeric={false} value={value} onCommit={onChange} />;
  } else if (decl.type === 'boolean') {
    control = <Switch checked={value === true} onChange={(c) => onChange(name, c)} />;
  } else if (decl.type === 'string' && decl.values !== undefined && decl.values.length > 0) {
    control = (
      <Select
        options={decl.values.map((v) => ({ value: v, label: v }))}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(name, e.target.value)}
      />
    );
  } else if (decl.type === 'number') {
    control = <TextLikeControl field={name} numeric value={value} onCommit={onChange} />;
  } else if (decl.type === 'string') {
    control = <TextLikeControl field={name} numeric={false} value={value} onCommit={onChange} />;
  } else {
    control = (
      <Typography variant="caption" color="muted">
        {decl.type} — edit in source
      </Typography>
    );
  }

  return (
    <VStack gap="xs">
      <Typography variant="label">{decl.label ?? name}</Typography>
      {control}
      {decl.description !== undefined && decl.description !== '' && (
        <Typography variant="caption" color="muted">
          {decl.description}
        </Typography>
      )}
    </VStack>
  );
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  config,
  values,
  onChange,
  onReset,
  title,
  className,
  assets,
}) => {
  const fields = Object.entries(config);

  const byTier = new Map<string, Array<[string, ConfigFieldDeclaration]>>();
  for (const [name, decl] of fields) {
    const tier = decl.tier ?? 'presentation';
    const arr = byTier.get(tier) ?? [];
    arr.push([name, decl]);
    byTier.set(tier, arr);
  }
  const tiers = [...byTier.keys()].sort((a, b) => {
    const ia = TIER_ORDER.indexOf(a);
    const ib = TIER_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return (
    <VStack gap="sm" className={cn('w-full', className)}>
      <HStack justify="between" align="center">
        <Typography variant="caption" weight="bold">
          {title ?? 'Config'}
        </Typography>
        {onReset !== undefined && (
          <Button variant="ghost" size="sm" icon="rotate-ccw" label="Reset" onClick={onReset} />
        )}
      </HStack>

      {fields.length === 0 && (
        <Typography variant="caption" color="muted">
          No configurable properties.
        </Typography>
      )}

      {tiers.map((tier) => (
        <FormSection key={tier} title={tier} collapsible defaultCollapsed={tier !== 'presentation'}>
          <VStack gap="sm">
            {byTier.get(tier)?.map(([name, decl]) => (
              <FieldControl
                key={name}
                name={name}
                decl={decl}
                value={currentValue(decl, values?.[name])}
                onChange={onChange}
                assets={assets}
              />
            ))}
          </VStack>
        </FormSection>
      ))}
    </VStack>
  );
};
