'use client';

/**
 * ModuleCard — Structured card for the module zoom band (0.4x-1.0x).
 *
 * Renders AVL primitives inside a card container:
 * - Entity section: AvlEntity glyph + AvlPersistence + AvlFieldType grid
 * - Trait sections: MiniStateMachine per trait + AvlEffect icons + emit/listen indicators
 * - Pages section: AvlPage squares with route labels
 */

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { AvlEntity } from '../../atoms/avl/AvlEntity';
import { AvlFieldType } from '../../atoms/avl/AvlFieldType';
import { AvlPage } from '../../atoms/avl/AvlPage';
import { CONNECTION_COLORS, type AvlFieldTypeKind, type AvlPersistenceKind } from '../../atoms/avl/types';
import { MiniStateMachine } from './MiniStateMachine';
import type { AvlNodeData } from './avl-canvas-types';

export interface ModuleCardProps {
  data: AvlNodeData;
}

function toFieldKind(type: string): AvlFieldTypeKind {
  const normalized = type.toLowerCase();
  if (['string', 'number', 'boolean', 'date', 'enum', 'object', 'array'].includes(normalized)) {
    return normalized as AvlFieldTypeKind;
  }
  return 'string';
}

const PERSISTENCE_BORDER: Record<string, string> = {
  persistent: 'border-l-[3px] border-l-blue-500 border-solid',
  runtime: 'border-l-[3px] border-l-blue-500 border-dashed',
  singleton: 'border-l-[3px] border-l-blue-500 border-double',
  instance: 'border-l-[3px] border-l-blue-500 border-dotted',
};

const PERSISTENCE_ICON: Record<string, string> = {
  persistent: '\u26C1', // ⛁ cylinder
  runtime: '\u27F3',    // ⟳ cycle
  singleton: '\u25CE',  // ◎ double ring
  instance: '\u22A1',   // ⊡ box
};

export const ModuleCard: React.FC<ModuleCardProps> = ({ data }) => {
  const {
    orbitalName,
    entityName,
    persistence,
    fields,
    traits,
    pages,
    traitDetails,
    externalLinks,
  } = data;

  const cols = Math.min(3, Math.max(2, Math.ceil(fields.length / 3)));

  return (
    <div
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm overflow-hidden"
      style={{ minWidth: 280, maxWidth: 400 }}
    >
      {/* Handles for event wire connections */}
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-orange-400" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-orange-400" />

      {/* Header */}
      <div className="px-3 py-2 border-b border-[var(--color-border)]">
        <span className="text-[15px] font-bold text-[var(--color-foreground)]">{orbitalName}</span>
      </div>

      {/* Entity section */}
      <div className={`px-3 py-2 border-b border-[var(--color-border)] ${PERSISTENCE_BORDER[persistence] ?? ''}`}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <svg width={18} height={18} viewBox="0 0 20 20">
            <AvlEntity x={10} y={10} r={8} persistence={persistence as AvlPersistenceKind} />
          </svg>
          <span className="text-[13px] font-semibold text-[var(--color-foreground)]">{entityName}</span>
          <span className="ml-auto text-[10px] opacity-50" title={persistence}>
            {PERSISTENCE_ICON[persistence] ?? ''}
          </span>
        </div>

        {/* Field type grid */}
        {fields.length > 0 && (
          <div className={`grid gap-x-3 gap-y-0.5`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {fields.map(f => (
              <div key={f.name} className="flex items-center gap-1">
                <svg width={14} height={14} viewBox="0 0 16 16">
                  <AvlFieldType x={8} y={8} kind={toFieldKind(f.type)} size={6} />
                </svg>
                <span className="text-[10px] text-[var(--color-muted-foreground)] truncate">{f.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trait sections */}
      {traits.map(trait => {
        const detail = traitDetails[trait.name];
        const traitEmits = externalLinks.filter(l => l.direction === 'out' && l.traitName === trait.name);
        const traitListens = externalLinks.filter(l => l.direction === 'in' && l.traitName === trait.name);

        return (
          <div key={trait.name} className="px-3 py-2 border-b border-[var(--color-border)]">
            <div className="text-[12px] font-semibold text-[var(--color-foreground)] mb-1">{trait.name}</div>

            {/* Mini state machine */}
            {detail && <MiniStateMachine data={detail} className="mb-1" />}

            {/* Emit/Listen indicators */}
            {(traitEmits.length > 0 || traitListens.length > 0) && (
              <div className="flex items-center gap-2 text-[9px] mt-1">
                {traitListens.map(l => (
                  <span key={l.eventName} style={{ color: CONNECTION_COLORS.emitListen.color }}>
                    {'◀~~'} {l.eventName}
                  </span>
                ))}
                {traitListens.length > 0 && traitEmits.length > 0 && <span className="flex-1" />}
                {traitEmits.map(l => (
                  <span key={l.eventName} style={{ color: CONNECTION_COLORS.emitListen.color }} className="ml-auto">
                    {l.eventName} {'~~▶'}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Pages section */}
      {pages.length > 0 && (
        <div className="px-3 py-1.5 flex items-center gap-2 flex-wrap">
          {pages.map(p => (
            <div key={p.name} className="flex items-center gap-0.5">
              <svg width={10} height={10} viewBox="0 0 12 12">
                <AvlPage x={6} y={6} size={5} />
              </svg>
              <span className="text-[10px] font-mono text-[var(--color-muted-foreground)]">{p.route}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

ModuleCard.displayName = 'ModuleCard';
