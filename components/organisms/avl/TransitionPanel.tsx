'use client';

/**
 * TransitionPanel
 *
 * Shows the .orb transition details for a selected node in FlowCanvas.
 * Built entirely with AVL primitives (AvlState, AvlEvent, AvlGuard,
 * AvlEffect, AvlFieldType) so the developer learns the visual language
 * while reading the code behind a screen.
 *
 * Renders in a side panel that appears when a node is clicked at Level 2.
 */

import React, { useContext } from 'react';
import type { Expression } from '@almadar/core';
import { Box } from '../../atoms/Box';
import { Typography } from '../../atoms/Typography';
import { AvlState } from '../../atoms/avl/AvlState';
import { AvlEvent } from '../../atoms/avl/AvlEvent';
import { AvlGuard } from '../../atoms/avl/AvlGuard';
import { AvlEffect } from '../../atoms/avl/AvlEffect';
import { getStateRole, type StateRole, type AvlEffectType, EFFECT_TYPE_TO_CATEGORY, EFFECT_CATEGORY_COLORS } from '../../atoms/avl/types';
import type { PreviewNodeData } from '../../molecules/avl/avl-preview-types';
import { PatternSelectionContext } from '../../molecules/avl/OrbPreviewNode';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatExpression(expr: unknown): string {
  if (!expr) return '';
  if (typeof expr === 'string') return expr;
  if (Array.isArray(expr)) {
    return `(${expr.map(formatExpression).join(' ')})`;
  }
  return String(expr);
}

const KNOWN_EFFECTS: Set<string> = new Set([
  'render-ui', 'set', 'persist', 'fetch', 'emit', 'navigate',
  'notify', 'call-service', 'spawn', 'despawn', 'do', 'if', 'log',
]);

function effectSummary(eff: { type: string; args: unknown[] }): string {
  switch (eff.type) {
    case 'render-ui': return `render-ui ${(eff.args[0] as string) ?? 'main'}`;
    case 'set': return `set ${(eff.args[0] as string) ?? ''}`;
    case 'fetch': return `fetch ${(eff.args[0] as string) ?? ''}`;
    case 'emit': return `emit ${(eff.args[0] as string) ?? ''}`;
    case 'persist': return `persist ${(eff.args[0] as string) ?? ''} ${(eff.args[1] as string) ?? ''}`;
    case 'navigate': return `navigate ${(eff.args[0] as string) ?? ''}`;
    case 'call-service': return `call-service ${(eff.args[0] as string) ?? ''}`;
    case 'notify': return `notify ${(eff.args[0] as string) ?? ''}`;
    default: return eff.type;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface TransitionPanelProps {
  node: PreviewNodeData;
  onClose: () => void;
}

export function TransitionPanel({ node, onClose }: TransitionPanelProps): React.ReactElement {
  const fromState = (node.fromState as string) ?? 'unknown';
  const toState = (node.toState as string) ?? 'unknown';
  const event = (node.transitionEvent as string) ?? 'INIT';
  const guard = node.guard as Expression | null | undefined;
  const effects = (node.effectTypes ?? []) as string[];
  const entityName = (node.entityName as string) ?? '';
  const traitName = (node.traitName as string) ?? '';

  // Get full effects from patterns (render-ui entries give us the pattern tree)
  const patterns = node.patterns ?? [];

  // Reconstruct effect list from effectTypes
  const effectEntries = effects.map(type => ({ type, args: [] as unknown[] }));

  const fromRole = getStateRole(fromState) as StateRole;
  const toRole = getStateRole(toState) as StateRole;
  const { selected: selectedPattern } = useContext(PatternSelectionContext);

  return (
    <Box
      className="flex flex-col bg-card border-l border-border overflow-y-auto"
      style={{ width: 340 }}
    >
      {/* Header */}
      <Box className="flex items-center justify-between px-4 py-3 border-b border-border">
        <Typography variant="small" className="font-semibold">
          {selectedPattern ? 'Element Inspector' : 'Transition Detail'}
        </Typography>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground text-sm cursor-pointer bg-transparent border-none p-1"
          aria-label="Close panel"
        >
          &times;
        </button>
      </Box>

      {/* Selected element inspector */}
      {selectedPattern && (
        <Box className="px-4 py-3 border-b border-border bg-primary/5">
          <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">
            Selected Element
          </Typography>
          <Box className="flex items-center gap-2 mb-2">
            <Box
              className="rounded px-2 py-0.5 text-[11px] font-mono font-semibold"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-primary-foreground)',
              }}
            >
              {selectedPattern.patternType}
            </Box>
            {selectedPattern.patternId && (
              <Typography variant="small" className="text-muted-foreground text-[10px] font-mono">
                #{selectedPattern.patternId}
              </Typography>
            )}
          </Box>
          {selectedPattern.sourceTrait && (
            <Typography variant="small" className="text-muted-foreground text-[10px]">
              from trait: {selectedPattern.sourceTrait}
            </Typography>
          )}
        </Box>
      )}

      {/* State transition: AVL State atoms */}
      <Box className="px-4 py-3 border-b border-border/40">
        <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">
          State Transition
        </Typography>
        <svg width="100%" height={50} viewBox="0 0 300 50">
          <AvlState x={10} y={10} name={fromState} role={fromRole} width={100} height={28} />
          <line x1={118} y1={24} x2={170} y2={24} stroke="#1E293B" strokeWidth={2} markerEnd="url(#arrow-head)" />
          <AvlState x={178} y={10} name={toState} role={toRole} width={100} height={28} />
          <defs>
            <marker id="arrow-head" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill="#1E293B" />
            </marker>
          </defs>
        </svg>
        {traitName && (
          <Typography variant="small" className="text-muted-foreground text-[11px] mt-1">
            Trait: {traitName} {entityName ? `on ${entityName}` : ''}
          </Typography>
        )}
      </Box>

      {/* Trigger: AVL Event atom */}
      <Box className="px-4 py-3 border-b border-border/40">
        <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">
          Trigger
        </Typography>
        <Box className="flex items-center gap-2">
          <svg width={20} height={20}>
            <AvlEvent x={10} y={10} size={16} />
          </svg>
          <Typography variant="small" className="font-semibold">
            {event}
          </Typography>
        </Box>
      </Box>

      {/* Guard: AVL Guard atom */}
      {guard && (
        <Box className="px-4 py-3 border-b border-border/40">
          <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">
            Guard
          </Typography>
          <Box className="flex items-center gap-2">
            <svg width={20} height={20}>
              <AvlGuard x={10} y={10} size={16} />
            </svg>
            <Typography variant="small" className="font-mono text-[11px]">
              {formatExpression(guard)}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Effects: AVL Effect atoms */}
      <Box className="px-4 py-3 border-b border-border/40">
        <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">
          Effects ({effectEntries.length})
        </Typography>
        <Box className="flex flex-col gap-2">
          {effectEntries.map((eff, i) => {
            const isKnown = KNOWN_EFFECTS.has(eff.type);
            const category = EFFECT_TYPE_TO_CATEGORY[eff.type as AvlEffectType];
            const catColor = category ? EFFECT_CATEGORY_COLORS[category] : undefined;
            return (
              <Box key={i} className="flex items-center gap-2">
                <Typography variant="small" className="text-muted-foreground text-[11px] w-4 text-right shrink-0">
                  {i + 1}.
                </Typography>
                {isKnown ? (
                  <svg width={18} height={18}>
                    <AvlEffect x={9} y={9} effectType={eff.type as AvlEffectType} size={7} showBackground />
                  </svg>
                ) : (
                  <Box className="w-[18px] h-[18px] rounded-full bg-muted/30" />
                )}
                <Typography variant="small" className="text-[12px]" style={{ color: catColor?.color }}>
                  {effectSummary(eff)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Pattern tree (render-ui source) */}
      {patterns.length > 0 && (
        <Box className="px-4 py-3">
          <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">
            render-ui source
          </Typography>
          <Box className="bg-muted/20 rounded-md p-3 font-mono text-[11px] leading-relaxed overflow-x-auto">
            {patterns.map((entry, i) => (
              <Box key={i}>
                <Typography variant="small" className="text-muted-foreground text-[10px]">
                  slot: {entry.slot}
                </Typography>
                <PatternTree config={entry.pattern as Record<string, unknown>} depth={0} />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Pattern tree renderer (shows the .orb pattern structure)
// ---------------------------------------------------------------------------

function PatternTree({ config, depth }: { config: Record<string, unknown>; depth: number }): React.ReactElement | null {
  if (!config || typeof config !== 'object') return null;
  const { type, children, ...props } = config;
  if (typeof type !== 'string') return null;

  const indent = depth * 12;
  const propEntries = Object.entries(props).filter(([k]) => k !== 'type');

  return (
    <Box style={{ paddingLeft: indent }}>
      <Typography variant="small" className="text-primary font-semibold text-[11px]">
        {type}
      </Typography>
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
        <PatternTree key={i} config={child as Record<string, unknown>} depth={depth + 1} />
      ))}
    </Box>
  );
}

TransitionPanel.displayName = 'TransitionPanel';
