'use client';

/**
 * OrbInspector
 *
 * Universal contextual inspector for .orb programs. Built into FlowCanvas.
 * Two tabs: Inspector (contextual sections) and Code (.orb syntax view).
 *
 * Inspector shows different sections based on what was clicked:
 *   - Orbital header → entity fields, traits, pages
 *   - Pattern element → pattern props, entity (if entity-aware), transition (if fires event)
 *   - Transition node → state diagram, guard, effects, render-ui source
 *
 * Code tab shows the .orb representation of the selected context.
 *
 * When `editable` is true, inspector fields become inputs.
 */

import React, { useContext, useMemo, useCallback, useState } from 'react';
import type {
  EventPayload,
  EventPayloadValue,
  Expression,
  FieldType,
  OrbitalDefinition,
  OrbitalSchema,
  ThemeDefinition,
  Trait,
  Transition,
} from '@almadar/core';
import { FieldTypeSchema } from '@almadar/core';
import { Box } from '../../atoms/Box';
import { Button } from '../../atoms/Button';
import { Typography } from '../../atoms/Typography';
import { Input } from '../../atoms/Input';
import { Select } from '../../atoms/Select';
import { Icon } from '../../atoms/Icon';
import { HStack } from '../../atoms/Stack';
import { CodeBlock } from '../../molecules/markdown/CodeBlock';
import { AvlState } from '../../atoms/avl/AvlState';
import { AvlEvent } from '../../atoms/avl/AvlEvent';
import { AvlGuard } from '../../atoms/avl/AvlGuard';
import { AvlEffect } from '../../atoms/avl/AvlEffect';
import { AvlFieldType } from '../../atoms/avl/AvlFieldType';
import {
  getStateRole, type StateRole, type AvlEffectType, type AvlFieldTypeKind,
  EFFECT_TYPE_TO_CATEGORY, EFFECT_CATEGORY_COLORS,
} from '../../atoms/avl/types';
import type { PreviewNodeData } from '../../molecules/avl/avl-preview-types';
import { PatternSelectionContext } from '../../molecules/avl/OrbPreviewNode';
import { getPatternDefinition, isEntityAwarePattern } from '@almadar/patterns';
import { createLogger } from '@almadar/logger';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';

const inspectorLog = createLogger('almadar:ui:inspector');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatExpression(expr: unknown): string {
  if (!expr) return '';
  if (typeof expr === 'string') return expr;
  if (Array.isArray(expr)) return `(${expr.map(formatExpression).join(' ')})`;
  return String(expr);
}

const KNOWN_EFFECTS = new Set([
  'render-ui', 'set', 'persist', 'fetch', 'emit', 'navigate',
  'notify', 'call-service', 'spawn', 'despawn', 'do', 'if', 'log',
]);

function effectSummary(type: string): string {
  return type;
}

const FIELD_TYPE_MAP: Record<string, AvlFieldTypeKind> = {
  string: 'string', number: 'number', boolean: 'boolean',
  date: 'date', enum: 'enum', object: 'object', array: 'array',
};

function findEntity(schema: OrbitalSchema, orbitalName: string): { name: string; persistence: string; fields: Array<{ name: string; type: string; required?: boolean }> } | null {
  const orbital = (schema.orbitals ?? []).find((o: OrbitalDefinition) => o.name === orbitalName);
  if (!orbital || typeof orbital.entity === 'string') return null;
  const e = orbital.entity as unknown as Record<string, unknown>;
  const fields = ((e.fields ?? []) as unknown as Array<Record<string, unknown>>).map(f => ({
    name: (f.name as string) ?? '',
    type: (f.type as string) ?? 'string',
    required: f.required as boolean,
  }));
  return { name: (e.name as string) ?? orbitalName, persistence: (e.persistence as string) ?? 'runtime', fields };
}

function findTransition(schema: OrbitalSchema, orbitalName: string, traitName: string, event: string): Transition | null {
  const orbital = (schema.orbitals ?? []).find((o: OrbitalDefinition) => o.name === orbitalName);
  if (!orbital) return null;
  const traits = (orbital.traits ?? []) as Trait[];
  const trait = traits.find(t => typeof t !== 'string' && t.name === traitName);
  if (!trait || typeof trait === 'string') return null;
  const sm = trait.stateMachine;
  if (!sm) return null;
  return (sm.transitions as Transition[])?.find(t => t.event === event) ?? null;
}

function findTraits(schema: OrbitalSchema, orbitalName: string): Array<{ name: string; stateCount: number }> {
  const orbital = (schema.orbitals ?? []).find((o: OrbitalDefinition) => o.name === orbitalName);
  if (!orbital) return [];
  return ((orbital.traits ?? []) as Trait[]).filter((t: Trait) => typeof t !== 'string').map((t: Trait) => ({
    name: t.name,
    stateCount: (t.stateMachine?.states as unknown[])?.length ?? 0,
  }));
}

/**
 * Navigate a dot-separated path within a pattern config tree.
 *
 * Pattern nodes may carry children at either `node.children` (flat
 * authoring form) or `node.props.children` (nested form some IR
 * transformations emit). UISlotRenderer's path emission uses
 * `<parentPath>.children.<index>` regardless of source form (it
 * normalizes before assigning the `data-pattern-path` attribute), so
 * this walker has to look in both places to keep path → node lookup
 * symmetric with the renderer's emission.
 */
function findPatternInTree(root: Record<string, unknown>, path: string): Record<string, unknown> | null {
  if (!path || path === 'root') return root;
  // UISlotRenderer emits paths starting with 'root' as the entry-point
  // name (UISlotRenderer.tsx:1249). `root.children.0.children.0` means
  // "from root, go children[0] → children[0]" — the leading 'root.' is
  // a label, not a key to traverse. Without stripping, the first walk
  // step tries `root['root']`, gets undefined, and every nested lookup
  // returns null → inspector renders every prop as '—'.
  const cleanPath = path.startsWith('root.') ? path.slice('root.'.length) : path;
  const parts = cleanPath.split('.');
  let current: unknown = root;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') return null;
    const record = current as Record<string, unknown>;
    if (part === 'children') {
      // Prefer flat `.children`; fall back to `.props.children` for nested
      // pattern nodes.
      if (Array.isArray(record.children)) {
        current = record.children;
      } else {
        const nestedProps = record.props;
        if (nestedProps && typeof nestedProps === 'object' && !Array.isArray(nestedProps)
            && Array.isArray((nestedProps as Record<string, unknown>).children)) {
          current = (nestedProps as Record<string, unknown>).children;
        } else {
          return null;
        }
      }
    } else if (Array.isArray(current)) {
      const idx = parseInt(part, 10);
      if (isNaN(idx) || idx < 0 || idx >= (current as unknown[]).length) return null;
      current = (current as unknown[])[idx];
    } else {
      current = record[part];
    }
  }
  return typeof current === 'object' && current !== null ? current as Record<string, unknown> : null;
}

// Derived from @almadar/core FieldTypeSchema (canonical source)
const FIELD_TYPE_OPTIONS: Array<{ value: string; label: string }> =
  FieldTypeSchema.options.map((v: FieldType) => ({ value: v, label: v }));

// Derived from EFFECT_TYPE_TO_CATEGORY keys (canonical source in avl/types.ts)
const EFFECT_TYPE_OPTIONS: Array<{ value: string; label: string }> =
  (Object.keys(EFFECT_TYPE_TO_CATEGORY) as AvlEffectType[]).map(v => ({ value: v, label: v }));

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface OrbInspectorProps {
  node: PreviewNodeData;
  schema: OrbitalSchema;
  editable?: boolean;
  /**
   * Studio persona viewing the inspector. Controls tab visibility (Code is
   * architect-only, Styles is universal) and section visibility (Entity,
   * raw guard, raw effects are architect-only). Default `'builder'` matches
   * pre-Phase-2 behavior except for the new Styles tab, which every persona
   * gets.
   */
  userType?: 'builder' | 'designer' | 'architect';
  /**
   * Project theme tokens (Design System tab only). When provided AND the
   * selection originates from the synthesized `__design_system__` schema,
   * the Styles tab renders an editable token-row list; edits emit
   * `UI:PROP_CHANGE` with `propName: '__token__.<group>.<key>'` and the
   * page-level dispatcher routes them to `themeManifest.setToken`.
   */
  themeManifest?: ThemeDefinition;
  onSchemaChange?: (schema: OrbitalSchema) => void;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type InspectorTab = 'inspector' | 'styles' | 'code';

export function OrbInspector({ node, schema, editable = false, userType = 'builder', themeManifest, onSchemaChange, onClose }: OrbInspectorProps): React.ReactElement {
  const { selected: selectedPattern } = useContext(PatternSelectionContext);
  const [activeTab, setActiveTab] = useState<InspectorTab>('inspector');
  const eventBus = useEventBus();
  const { t } = useTranslate();

  const orbitalName = (node.orbitalName as string) ?? '';
  const traitName = (node.traitName as string) ?? '';
  const transitionEvent = (node.transitionEvent as string) ?? '';
  const fromState = (node.fromState as string) ?? '';
  const toState = (node.toState as string) ?? '';
  const entityName = (node.entityName as string) ?? '';
  const patterns = node.patterns ?? [];
  const effectTypes = (node.effectTypes ?? []) as string[];
  const guard = node.guard as Expression | null | undefined;
  const isExpanded = Boolean(traitName);

  const hasRenderUi = effectTypes.includes('render-ui');

  const patternType = selectedPattern?.patternType;
  const patternDef = useMemo(() => patternType ? getPatternDefinition(patternType) : null, [patternType]);
  const isEntityPattern = patternType ? isEntityAwarePattern(patternType) : false;
  const entity = useMemo(() => findEntity(schema, orbitalName), [schema, orbitalName]);
  const transition = useMemo(() => {
    if (!traitName || !transitionEvent) return null;
    return findTransition(schema, orbitalName, traitName, transitionEvent);
  }, [schema, orbitalName, traitName, transitionEvent]);
  const traits = useMemo(() => findTraits(schema, orbitalName), [schema, orbitalName]);

  // Resolve current pattern config values from the schema.
  //
  // Pattern configs arrive in two shapes (see UISlotRenderer.tsx:1003 —
  // the runtime normalizes both):
  //  1. Flat:   `{type: 'icon', name: 'home', size: 'md'}`
  //  2. Nested: `{type: 'icon', props: {name: 'home', size: 'md'}, _id}`
  // The std behaviors emit flat; agent runs sometimes emit nested. Without
  // unwrapping, a nested-shape pattern shows every prop as '—' because
  // `patternConfig.name` is undefined and the actual value lives at
  // `patternConfig.props.name`. Same VG31 cascade the renderer's comment
  // calls out, surfaced one layer down.
  //
  // Selection scoping: at L2 the click context carries (orbital, trait,
  // transition) so we resolve against that one transition's render-ui. At
  // L1 the click context only carries (orbital), so `transition` is null —
  // we widen to "any render-ui in the source trait, or any in the orbital
  // if the source trait is also unknown." The patternId path is unique to
  // one tree; the wrong tree returns null and we move on.
  const patternConfig = useMemo(() => {
    if (!selectedPattern) return null;
    const patternId = selectedPattern.patternId ?? 'root';

    const tryEffects = (effects: unknown[]): Record<string, unknown> | null => {
      for (const eff of effects as unknown[][]) {
        if (!Array.isArray(eff) || eff[0] !== 'render-ui' || !eff[2]) continue;
        const found = findPatternInTree(eff[2] as Record<string, unknown>, patternId);
        if (!found) continue;
        // Type-discriminate so two transitions whose render-ui trees share
        // a path but differ in the node at that path don't silently swap.
        if (selectedPattern.patternType
            && typeof found.type === 'string'
            && found.type !== selectedPattern.patternType) {
          continue;
        }
        // Normalize nested → flat. Merge top-level keys over `props` so
        // `type` / `_id` / `children` survive the unwrap.
        const nested = found.props;
        if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
          const { props: _stripped, ...rest } = found;
          void _stripped;
          return { ...(nested as Record<string, unknown>), ...rest };
        }
        return found;
      }
      return null;
    };

    // L2 fast path: the click came with a specific transition.
    if (transition) {
      const direct = tryEffects(transition.effects ?? []);
      if (direct) return direct;
    }

    // L1 fallback: widen to every transition in the orbital's traits.
    // Prefer the trait the click reported via `data-source-trait` so we
    // don't accidentally collide with another trait's identical render-ui
    // path (atoms reused across traits → same `root.children.0.…` path).
    const orbital = schema.orbitals.find((o) => o.name === orbitalName);
    if (orbital) {
      const orderedTraits = [...(orbital.traits ?? [])].sort((a, b) => {
        const aName = typeof a === 'string' ? a : a.name;
        const bName = typeof b === 'string' ? b : b.name;
        const src = selectedPattern.sourceTrait;
        if (src && aName === src) return -1;
        if (src && bName === src) return 1;
        return 0;
      });
      for (const traitRef of orderedTraits) {
        if (typeof traitRef === 'string') continue;
        // Inline traits carry `stateMachine` directly; preprocessed ref
        // traits (`{ref, _resolved}`) carry it on `_resolved`. Read both.
        const inline = 'stateMachine' in traitRef ? traitRef.stateMachine : undefined;
        const resolved = '_resolved' in traitRef
          ? (traitRef as { _resolved?: Trait })._resolved?.stateMachine
          : undefined;
        const sm = inline ?? resolved;
        const traitTransitions = sm?.transitions;
        if (!Array.isArray(traitTransitions)) continue;
        for (const tx of traitTransitions) {
          const hit = tryEffects((tx as { effects?: unknown[] }).effects ?? []);
          if (hit) return hit;
        }
      }
    }

    // Selection has a patternId but nothing matched anywhere — usually a
    // path/key mismatch between the click target's `data-pattern-path`
    // and the SExpr tree shape. Surface it so future divergences don't
    // quietly render every prop as '—'.
    if (selectedPattern.patternId) {
      inspectorLog.warn('pattern-config-unresolved', () => ({
        patternId: selectedPattern.patternId,
        patternType: selectedPattern.patternType,
        sourceTrait: selectedPattern.sourceTrait,
        orbitalName,
        traitName,
        transitionEvent,
      }));
    }
    return null;
  }, [selectedPattern, transition, schema, orbitalName, traitName, transitionEvent]);

  // Generate the relevant JSON slice for the code tab
  const orbCode = useMemo(() => {
    const orbital = (schema.orbitals ?? []).find((o: OrbitalDefinition) => o.name === orbitalName);
    if (!orbital) return '{}';

    if (isExpanded && traitName) {
      const traitList = (orbital.traits ?? []) as Trait[];
      const trait = traitList.find(tr => typeof tr !== 'string' && tr.name === traitName);
      if (trait && typeof trait !== 'string' && trait.stateMachine) {
        if (transitionEvent) {
          const tx = (trait.stateMachine.transitions as Transition[])?.find(txn => txn.event === transitionEvent);
          if (tx) return JSON.stringify(tx, null, 2);
        }
        return JSON.stringify({ name: trait.name, stateMachine: trait.stateMachine }, null, 2);
      }
    }

    return JSON.stringify(orbital, null, 2);
  }, [schema, orbitalName, traitName, transitionEvent, isExpanded]);

  // W1: Pattern prop editing via EventBus. Selection context goes with the
  // payload so the page-level dispatcher can fork between the project schema
  // (schemaEditor.updatePatternProp) and the synthesized Design System schema
  // (themeManifest.setToken) without consulting any global ref.
  const handlePropChange = useCallback((propName: string, value: EventPayloadValue) => {
    if (!editable) return;
    eventBus.emit('UI:PROP_CHANGE', {
      propName,
      value,
      selection: {
        sourceSchemaName: selectedPattern?.nodeData.sourceSchemaName,
        patternPath: selectedPattern?.patternId,
        orbitalName,
        traitName,
        transitionEvent,
      },
    });
  }, [editable, eventBus, selectedPattern, orbitalName, traitName, transitionEvent]);

  // W2: Entity field mutations via EventBus
  const handleAddField = useCallback(() => {
    eventBus.emit('UI:ADD_FIELD', {});
  }, [eventBus]);

  const handleUpdateField = useCallback((fieldName: string, updates: EventPayload) => {
    eventBus.emit('UI:UPDATE_FIELD', { fieldName, updates });
  }, [eventBus]);

  const handleRemoveField = useCallback((fieldName: string) => {
    eventBus.emit('UI:REMOVE_FIELD', { fieldName });
  }, [eventBus]);

  // W3: Guard editing via EventBus
  const handleGuardChange = useCallback((guardExpr: string) => {
    if (!editable) return;
    // Pass the raw string; BuilderPage can parse if needed
    eventBus.emit('UI:GUARD_CHANGE', { guard: guardExpr || null });
  }, [editable, eventBus]);

  // W3: Effect mutations via EventBus
  const handleAddEffect = useCallback((effectType: string) => {
    eventBus.emit('UI:ADD_EFFECT', { effectType });
  }, [eventBus]);

  const handleRemoveEffect = useCallback((effectIndex: number) => {
    eventBus.emit('UI:REMOVE_EFFECT', { effectIndex });
  }, [eventBus]);

  void onSchemaChange; // Editing goes through EventBus, not direct callback

  const headerTitle = selectedPattern
    ? selectedPattern.patternType
    : isExpanded ? transitionEvent || 'Transition' : orbitalName;

  return (
    <Box className="flex flex-col bg-card border-l border-border h-full" style={{ width: 340 }}>
      {/* Header + Tabs */}
      <Box className="shrink-0 border-b border-border">
        <Box className="flex items-center justify-between px-4 py-2">
          <Box className="flex items-center gap-2">
            {selectedPattern ? (
              <Box
                className="rounded px-2 py-0.5 text-[11px] font-mono font-semibold"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
              >
                {headerTitle}
              </Box>
            ) : (
              <Typography variant="small" className="font-semibold">{headerTitle}</Typography>
            )}
          </Box>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm cursor-pointer bg-transparent border-none p-1"
            aria-label="Close"
          >
            &times;
          </button>
        </Box>

        {/* Tab bar. Persona gating: Code is architect-only; Styles is universal. */}
        <Box className="flex px-4 gap-4">
          {(['inspector', 'styles', 'code'] as const)
            .filter((tab) => tab !== 'code' || userType === 'architect')
            .map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-[12px] font-medium border-b-2 cursor-pointer bg-transparent border-x-0 border-t-0 px-0 capitalize ${
                  activeTab === tab
                    ? 'border-[var(--color-primary)] text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
        </Box>
      </Box>

      {/* Scrollable content */}
      <Box className="flex-1 overflow-y-auto">
        {activeTab === 'code' && userType === 'architect' ? (
          /* ── Code Tab (architect only) ── */
          /* GAP-51: when editable, the CodeBlock molecule renders the existing
             Textarea atom internally and forwards keystrokes via UI:CODE_CHANGE
             on the EventBus. The consumer (builder workspace) listens, debounces,
             parses via safeParseOrbitalSchema, and calls setSchema. Read-only
             consumers (editable=false) see the existing syntax-highlighted view. */
          <Box className="p-2">
            <CodeBlock
              code={orbCode}
              language="orb"
              showCopyButton
              showLanguageBadge
              maxHeight="100%"
              editable={editable}
              onChange={editable ? (code) => eventBus.emit('UI:CODE_CHANGE', { code }) : undefined}
            />
          </Box>
        ) : activeTab === 'styles' ? (
          /* ── Styles Tab ──
             Variant + size pills are clickable when `editable` and emit
             `UI:PROP_CHANGE` with the selection context. The page-level
             dispatcher routes those events to the project schemaEditor or
             to the theme manifest based on `selection.sourceSchemaName`. */
          <StylesTab
            patternType={patternType}
            patternDef={patternDef}
            patternConfig={patternConfig}
            editable={editable}
            onPropChange={handlePropChange}
            themeManifest={themeManifest}
            isDesignSystem={selectedPattern?.nodeData.sourceSchemaName === '__design_system__'}
          />
        ) : (
          /* ── Inspector Tab ── */
          <>
            {/* Pattern Props */}
            {selectedPattern && patternDef?.propsSchema && (
              <Box className="px-4 py-3 border-b border-border/40">
                <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">{t('Props')}</Typography>
                <Box className="flex flex-col gap-1.5">
                  {Object.entries(patternDef.propsSchema).slice(0, 12).map(([propName, propSchema]) => {
                    const ps = propSchema as Record<string, unknown>;
                    const explicitValue = patternConfig ? patternConfig[propName] : undefined;
                    const defaultValue = ps.default;
                    const isImplicit = explicitValue === undefined && defaultValue !== undefined;
                    const currentValue = explicitValue !== undefined ? explicitValue : defaultValue;
                    const displayValue = currentValue !== undefined
                      ? (typeof currentValue === 'object' ? JSON.stringify(currentValue) : String(currentValue))
                      : '';
                    inspectorLog.debug('prop-row', () => ({
                      patternType: patternDef.type,
                      patternId: selectedPattern?.patternId ?? '',
                      propName,
                      explicitValue: explicitValue === undefined ? '<unset>' : JSON.stringify(explicitValue),
                      defaultValue: defaultValue === undefined ? '<unset>' : JSON.stringify(defaultValue),
                      isImplicit: String(isImplicit),
                    }));
                    return (
                      <Box key={propName} className="flex items-center gap-2">
                        <Typography variant="small" className="text-muted-foreground text-[11px] w-20 shrink-0 font-mono">{propName}</Typography>
                        {editable ? (
                          <Input
                            defaultValue={displayValue}
                            placeholder={(ps.types as string[])?.join(' | ') ?? 'string'}
                            className="flex-1 text-[11px] h-6"
                            onBlur={(e: React.FocusEvent<HTMLInputElement>) => handlePropChange(propName, e.target.value)}
                          />
                        ) : (
                          <Typography variant="small" className="text-[11px] text-muted-foreground">
                            {displayValue || '—'}{ps.required ? ' *' : ''}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Entity Fields (architect only — designer/builder hide entity persistence + field types) */}
            {userType === 'architect' && ((selectedPattern && isEntityPattern) || (!selectedPattern && !isExpanded)) && entity && (
              <Box className="px-4 py-3 border-b border-border/40">
                <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">{t('Entity')}</Typography>
                <Box className="flex items-center gap-2 mb-2">
                  <svg width={14} height={14}><circle cx={7} cy={7} r={5} fill="var(--color-primary)" /></svg>
                  <Typography variant="small" className="font-semibold text-[12px]">{entity.name}</Typography>
                  <Typography variant="small" className="text-muted-foreground text-[10px]">{entity.persistence}</Typography>
                </Box>
                <Box className="flex flex-col gap-1">
                  {entity.fields.map(f => (
                    <HStack key={f.name} gap="xs" className="items-center">
                      <svg width={12} height={12}><AvlFieldType x={6} y={6} kind={FIELD_TYPE_MAP[f.type] ?? 'string'} size={4} /></svg>
                      {editable ? (
                        <>
                          <Input
                            defaultValue={f.name}
                            className="flex-1 text-[11px] font-mono h-6"
                            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                              if (e.target.value !== f.name) {
                                handleUpdateField(f.name, { name: e.target.value });
                              }
                            }}
                          />
                          <Select
                            value={f.type}
                            options={FIELD_TYPE_OPTIONS}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdateField(f.name, { type: e.target.value })}
                            className="w-20 text-[10px] h-6"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveField(f.name)}
                            className="shrink-0 p-0.5 h-6 w-6"
                          >
                            <Icon name="x" size="xs" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Typography variant="small" className="text-[11px] font-mono flex-1">{f.name}</Typography>
                          <Typography variant="small" className="text-muted-foreground text-[10px]">{f.type}</Typography>
                          {f.required && <Typography variant="small" className="text-primary text-[9px]">{t('req')}</Typography>}
                        </>
                      )}
                    </HStack>
                  ))}
                </Box>
                {editable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddField}
                    className="mt-2 text-[11px] w-full"
                  >
                    <Icon name="plus" size="xs" className="mr-1" />
                    {t('Add Field')}
                  </Button>
                )}
              </Box>
            )}

            {/* Service Mode Toggle (service behaviors only) */}
            {editable && !selectedPattern && !isExpanded && node.layer === 'Services' && (
              <Box className="px-4 py-3 border-b border-border/40">
                <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">{t('Service Mode')}</Typography>
                <HStack gap="sm" className="items-center">
                  <Button
                    variant={hasRenderUi ? 'primary' : 'ghost'}
                    size="sm"
                    className="flex-1 text-[11px]"
                    onClick={() => {
                      if (!hasRenderUi) eventBus.emit('UI:SERVICE_MODE_TOGGLE', { orbitalName: node.orbitalName, standalone: true });
                    }}
                  >
                    <Icon name="monitor" size="xs" className="mr-1" />
                    {t('Standalone')}
                  </Button>
                  <Button
                    variant={hasRenderUi ? 'ghost' : 'primary'}
                    size="sm"
                    className="flex-1 text-[11px]"
                    onClick={() => {
                      if (hasRenderUi) eventBus.emit('UI:SERVICE_MODE_TOGGLE', { orbitalName: node.orbitalName, standalone: false });
                    }}
                  >
                    <Icon name="cpu" size="xs" className="mr-1" />
                    {t('Embedded')}
                  </Button>
                </HStack>
                <Typography variant="small" className="text-muted-foreground text-[10px] mt-1">
                  {hasRenderUi ? t('Renders its own UI') : t('Headless, wired to other behaviors')}
                </Typography>
              </Box>
            )}

            {/* Traits (orbital overview) */}
            {!selectedPattern && !isExpanded && traits.length > 0 && (
              <Box className="px-4 py-3 border-b border-border/40">
                <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">Traits</Typography>
                <Box className="flex flex-col gap-1">
                  {traits.map(t => (
                    <Box key={t.name} className="flex items-center gap-2">
                      <Typography variant="small" className="text-[11px] font-semibold">{t.name}</Typography>
                      <Typography variant="small" className="text-muted-foreground text-[10px]">{t.stateCount} states</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* State Transition */}
            {isExpanded && fromState && toState && (
              <Box className="px-4 py-3 border-b border-border/40">
                <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">Transition</Typography>
                <svg width="100%" height={44} viewBox="0 0 280 44">
                  <AvlState x={8} y={8} name={fromState} role={getStateRole(fromState) as StateRole} width={90} height={26} />
                  <line x1={104} y1={21} x2={158} y2={21} stroke="#1E293B" strokeWidth={2} markerEnd="url(#orb-arrow)" />
                  <AvlState x={164} y={8} name={toState} role={getStateRole(toState) as StateRole} width={90} height={26} />
                  <defs>
                    <marker id="orb-arrow" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto">
                      <path d="M0,0 L8,3 L0,6 Z" fill="#1E293B" />
                    </marker>
                  </defs>
                </svg>
                {traitName && (
                  <Typography variant="small" className="text-muted-foreground text-[11px]">
                    {traitName}{entityName ? ` on ${entityName}` : ''}
                  </Typography>
                )}
              </Box>
            )}

            {/* Trigger */}
            {isExpanded && transitionEvent && (
              <Box className="px-4 py-2 border-b border-border/40">
                <Box className="flex items-center gap-2">
                  <svg width={16} height={16}><AvlEvent x={8} y={8} size={12} /></svg>
                  <Typography variant="small" className="font-semibold text-[12px]">{transitionEvent}</Typography>
                </Box>
              </Box>
            )}

            {/* Guard (architect only — raw SExpression / boolean expression isn't designer-facing) */}
            {userType === 'architect' && (transition?.guard ?? guard ?? editable) && isExpanded && (
              <Box className="px-4 py-2 border-b border-border/40">
                <HStack gap="xs" className="items-center">
                  <svg width={16} height={16}><AvlGuard x={8} y={8} size={12} /></svg>
                  {editable ? (
                    <Input
                      defaultValue={formatExpression(transition?.guard ?? guard)}
                      placeholder={t('Guard expression')}
                      className="flex-1 text-[11px] font-mono h-6"
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleGuardChange(e.target.value)}
                    />
                  ) : (
                    <Typography variant="small" className="font-mono text-[11px] text-muted-foreground">
                      {formatExpression(transition?.guard ?? guard)}
                    </Typography>
                  )}
                </HStack>
              </Box>
            )}

            {/* Effects (architect only — raw effect list maps directly to the IR) */}
            {userType === 'architect' && (effectTypes.length > 0 || editable) && isExpanded && (
              <Box className="px-4 py-3 border-b border-border/40">
                <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">
                  {t('Effects')} ({effectTypes.length})
                </Typography>
                <Box className="flex flex-col gap-1.5">
                  {effectTypes.map((type, i) => {
                    const isKnown = KNOWN_EFFECTS.has(type);
                    const category = EFFECT_TYPE_TO_CATEGORY[type as AvlEffectType];
                    const catColor = category ? EFFECT_CATEGORY_COLORS[category] : undefined;
                    return (
                      <HStack key={i} gap="xs" className="items-center">
                        <Typography variant="small" className="text-muted-foreground text-[11px] w-4 text-right shrink-0">{i + 1}.</Typography>
                        {isKnown && (
                          <svg width={16} height={16}><AvlEffect x={8} y={8} effectType={type as AvlEffectType} size={6} showBackground /></svg>
                        )}
                        <Typography variant="small" className="text-[11px] flex-1" style={{ color: catColor?.color }}>
                          {effectSummary(type)}
                        </Typography>
                        {editable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveEffect(i)}
                            className="shrink-0 p-0.5 h-6 w-6"
                          >
                            <Icon name="x" size="xs" />
                          </Button>
                        )}
                      </HStack>
                    );
                  })}
                </Box>
                {editable && (
                  <AddEffectButton onAdd={handleAddEffect} />
                )}
              </Box>
            )}

            {/* Render-UI Source (architect only — raw SExpression tree) */}
            {userType === 'architect' && patterns.length > 0 && !selectedPattern && (
              <Box className="px-4 py-3">
                <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">render-ui</Typography>
                <Box className="bg-muted/20 rounded-md p-3 font-mono text-[11px] leading-relaxed overflow-x-auto">
                  {patterns.map((entry, i) => (
                    <Box key={i}>
                      <Typography variant="small" className="text-muted-foreground text-[10px]">slot: {entry.slot}</Typography>
                      <OrbPatternTree config={entry.pattern as Record<string, unknown>} depth={0} />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Add Effect dropdown button
// ---------------------------------------------------------------------------

function AddEffectButton({ onAdd }: { onAdd: (type: string) => void }): React.ReactElement {
  const [open, setOpen] = useState(false);
  const { t } = useTranslate();

  return (
    <Box className="relative mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(prev => !prev)}
        className="text-[11px] w-full"
      >
        <Icon name="plus" size="xs" className="mr-1" />
        {t('Add Effect')}
      </Button>
      {open && (
        <Box className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg overflow-hidden">
          {EFFECT_TYPE_OPTIONS.map(opt => (
            <Box
              key={opt.value}
              className="px-3 py-1.5 text-[11px] cursor-pointer hover:bg-muted/50 flex items-center gap-2"
              onClick={() => { onAdd(opt.value); setOpen(false); }}
            >
              {KNOWN_EFFECTS.has(opt.value) && (
                <svg width={14} height={14}><AvlEffect x={7} y={7} effectType={opt.value as AvlEffectType} size={5} showBackground /></svg>
              )}
              <Typography variant="small" className="text-[11px]">{opt.label}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Pattern tree renderer
// ---------------------------------------------------------------------------

function OrbPatternTree({ config, depth }: { config: Record<string, unknown>; depth: number }): React.ReactElement | null {
  if (!config || typeof config !== 'object') return null;
  const { type, children, ...props } = config;
  if (typeof type !== 'string') return null;

  const propEntries = Object.entries(props).filter(([k]) => k !== 'type');

  return (
    <Box style={{ paddingLeft: depth * 12 }}>
      <Typography variant="small" className="text-primary font-semibold text-[11px]">{type}</Typography>
      {propEntries.slice(0, 5).map(([key, val]) => {
        const display = typeof val === 'string'
          ? val.startsWith('@') ? <span className="text-purple-500">{val}</span> : `"${val}"`
          : Array.isArray(val) && typeof val[0] === 'string' && val[0].includes('/')
            ? <span className="text-amber-600">({val.join(' ')})</span>
            : String(val);
        return (
          <Box key={key} className="flex gap-1 text-[10px]">
            <span className="text-muted-foreground">{key}:</span>
            <span>{display}</span>
          </Box>
        );
      })}
      {Array.isArray(children) && children.map((child, i) => (
        <OrbPatternTree key={i} config={child as Record<string, unknown>} depth={depth + 1} />
      ))}
    </Box>
  );
}

OrbInspector.displayName = 'OrbInspector';

// ---------------------------------------------------------------------------
// Styles tab — variant/size editor
// ---------------------------------------------------------------------------

/**
 * Stopgap token contract per pattern. Phase-2 leftover until each
 * `@almadar/patterns` PatternEntry grows a real `tokenContract` field
 * sourced from @almadar/ui component analysis. Patterns missing here
 * render an empty list with a "no contract declared" note so the gap is
 * visible. Read by the Styles tab to show which CSS variables a pattern
 * consumes.
 */
const PHASE_2_TOKEN_FALLBACK: Record<string, string[]> = {
  button: ['--color-primary', '--color-primary-foreground', '--radius-md', '--shadow-sm'],
  badge: ['--color-primary', '--radius-full'],
  card: ['--color-card', '--color-border', '--radius-lg', '--shadow-main'],
  input: ['--color-input', '--color-border', '--radius-md'],
  typography: ['--color-foreground', '--color-muted-foreground'],
  divider: ['--color-border'],
  avatar: ['--radius-full', '--color-muted'],
  alert: ['--color-warning', '--color-success', '--color-danger', '--radius-md'],
  modal: ['--color-card', '--shadow-lg', '--radius-lg'],
  toast: ['--color-card', '--shadow-lg', '--radius-md'],
};

interface StylesTabProps {
  patternType: string | undefined;
  patternDef: ReturnType<typeof getPatternDefinition>;
  patternConfig: Record<string, unknown> | null;
  editable: boolean;
  onPropChange: (propName: string, value: EventPayloadValue) => void;
  themeManifest?: ThemeDefinition;
  /** Selection originates from the synthesized `__design_system__` schema. */
  isDesignSystem: boolean;
}

function StylesTab({ patternType, patternDef, patternConfig, editable, onPropChange, themeManifest, isDesignSystem }: StylesTabProps): React.ReactElement {
  const { t } = useTranslate();

  if (!patternType) {
    return (
      <Box className="p-4">
        <Typography variant="small" className="text-muted-foreground text-[11px]">
          {t('Select a pattern to view its style tokens.')}
        </Typography>
      </Box>
    );
  }

  const tier = patternDef?.category ?? 'Pattern';
  const tokens = PHASE_2_TOKEN_FALLBACK[patternType] ?? [];

  const variantEnum = patternDef?.propsSchema?.variant?.enumValues;
  const sizeEnum = patternDef?.propsSchema?.size?.enumValues;
  const currentVariant = patternConfig && typeof patternConfig.variant === 'string' ? patternConfig.variant : undefined;
  const currentSize = patternConfig && typeof patternConfig.size === 'string' ? patternConfig.size : undefined;

  return (
    <Box className="px-4 py-3 flex flex-col gap-4">
      {/* Header: pattern type + tier badge */}
      <Box className="flex items-center gap-2">
        <Typography variant="small" className="font-semibold text-[12px]">{patternType}</Typography>
        <Box
          className="rounded px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider"
          style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}
        >
          {tier}
        </Box>
      </Box>

      {/* Tokens this pattern consumes */}
      <Box>
        <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">
          {t('Tokens')}
        </Typography>
        {tokens.length === 0 ? (
          <Typography variant="small" className="text-muted-foreground text-[11px] italic">
            {t('No token contract declared for this pattern.')}
          </Typography>
        ) : (
          <Box className="flex flex-col gap-1">
            {tokens.map((token) => (
              <Box key={token} className="flex items-center gap-2">
                <Typography variant="small" className="font-mono text-[11px]">{token}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Variant */}
      {variantEnum && variantEnum.length > 0 && (
        <Box>
          <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">
            {t('Variant')}
          </Typography>
          <Box className="flex flex-wrap gap-1">
            {variantEnum.map((variant) => {
              const isActive = variant === currentVariant || (!currentVariant && variant === 'default');
              return (
                <Box
                  key={variant}
                  as={editable ? 'button' : 'div'}
                  onClick={editable ? () => onPropChange('variant', variant) : undefined}
                  className={`rounded px-2 py-0.5 text-[11px] font-mono ${editable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                    color: isActive ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)',
                  }}
                >
                  {variant}
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Size */}
      {sizeEnum && sizeEnum.length > 0 && (
        <Box>
          <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">
            {t('Size')}
          </Typography>
          <Box className="flex flex-wrap gap-1">
            {sizeEnum.map((size) => {
              const isActive = size === currentSize || (!currentSize && size === 'md');
              return (
                <Box
                  key={size}
                  as={editable ? 'button' : 'div'}
                  onClick={editable ? () => onPropChange('size', size) : undefined}
                  className={`rounded px-2 py-0.5 text-[11px] font-mono ${editable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                    color: isActive ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)',
                  }}
                >
                  {size}
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Project theme tokens (Design System tab only). Edits emit
          UI:PROP_CHANGE with propName `__token__.<group>.<key>` — the
          page-level dispatcher routes those to themeManifest.setToken. */}
      {isDesignSystem && themeManifest && editable && (
        <TokenEditorSection themeManifest={themeManifest} onPropChange={onPropChange} />
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Token editor (Design System tab only)
// ---------------------------------------------------------------------------

interface TokenEditorSectionProps {
  themeManifest: ThemeDefinition;
  onPropChange: (propName: string, value: EventPayloadValue) => void;
}

/** Theme-token categories the inspector exposes for editing. */
const TOKEN_GROUPS: readonly { group: 'colors' | 'radii' | 'spacing' | 'shadows'; label: string }[] = [
  { group: 'colors', label: 'Colors' },
  { group: 'radii', label: 'Radii' },
  { group: 'spacing', label: 'Spacing' },
  { group: 'shadows', label: 'Shadows' },
] as const;

function TokenEditorSection({ themeManifest, onPropChange }: TokenEditorSectionProps): React.ReactElement {
  const tokens = themeManifest.tokens ?? {};
  return (
    <Box className="flex flex-col gap-3 pt-2 border-t border-border/40">
      <Typography variant="small" className="text-[10px] uppercase tracking-wider text-muted-foreground">
        Project theme tokens
      </Typography>
      {TOKEN_GROUPS.map(({ group, label }) => {
        const entries = Object.entries(tokens[group] ?? {});
        if (entries.length === 0) return null;
        return (
          <Box key={group} className="flex flex-col gap-1.5">
            <Typography variant="small" className="text-[10px] font-mono text-muted-foreground">{label}</Typography>
            {entries.map(([key, value]) => (
              <TokenRow
                key={key}
                group={group}
                tokenKey={key}
                value={String(value)}
                isColor={group === 'colors'}
                onPropChange={onPropChange}
              />
            ))}
          </Box>
        );
      })}
    </Box>
  );
}

interface TokenRowProps {
  group: 'colors' | 'radii' | 'spacing' | 'shadows';
  tokenKey: string;
  value: string;
  isColor: boolean;
  onPropChange: (propName: string, value: EventPayloadValue) => void;
}

function TokenRow({ group, tokenKey, value, isColor, onPropChange }: TokenRowProps): React.ReactElement {
  return (
    <Box className="flex items-center gap-2">
      {isColor && (
        <Box
          className="w-4 h-4 rounded border border-border/40 shrink-0"
          style={{ backgroundColor: value }}
        />
      )}
      <Typography variant="small" className="font-mono text-[11px] text-muted-foreground w-24 shrink-0 truncate">
        {tokenKey}
      </Typography>
      <Input
        value={value}
        onChange={(e) => onPropChange(`__token__.${group}.${tokenKey}`, e.target.value)}
        className="flex-1 text-[11px] font-mono"
      />
    </Box>
  );
}
