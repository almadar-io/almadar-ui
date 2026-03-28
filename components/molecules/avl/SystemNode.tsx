'use client';

/**
 * SystemNode — Compact orbital node for the system zoom band (0.1x-0.4x).
 *
 * Renders miniature AVL primitives: entity glyph, field-type dots,
 * state chain (role-colored dots), and page squares.
 */

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { AvlEntity } from '../../atoms/avl/AvlEntity';
import { AvlFieldType } from '../../atoms/avl/AvlFieldType';
import { AvlState } from '../../atoms/avl/AvlState';
import { AvlPage } from '../../atoms/avl/AvlPage';
import { getStateRole } from '../../atoms/avl/types';
import type { AvlFieldTypeKind } from '../../atoms/avl/types';
import type { AvlNodeData } from './avl-canvas-types';

export interface SystemNodeProps {
  data: AvlNodeData;
}

/** Map a field type string from the parser to an AvlFieldTypeKind. */
function toFieldKind(type: string): AvlFieldTypeKind {
  const normalized = type.toLowerCase();
  if (['string', 'number', 'boolean', 'date', 'enum', 'object', 'array'].includes(normalized)) {
    return normalized as AvlFieldTypeKind;
  }
  return 'string';
}

export const SystemNode: React.FC<SystemNodeProps> = ({ data }) => {
  const { orbitalName, fields, traits, pages, persistence } = data;

  // Collect unique states across all traits for the state chain
  const allStates = traits.flatMap(t => {
    const detail = data.traitDetails[t.name];
    if (!detail) return [];
    return detail.states;
  });

  // Limit field dots and states for display at mini scale
  const fieldDots = fields.slice(0, 8);
  const stateChain = allStates.slice(0, 6);
  const pageDots = pages.slice(0, 3);

  // Compute max transition count for role detection
  const transitionCounts: Record<string, number> = {};
  for (const t of traits) {
    const detail = data.traitDetails[t.name];
    if (!detail) continue;
    for (const s of detail.states) transitionCounts[s.name] = 0;
    for (const tr of detail.transitions) {
      transitionCounts[tr.from] = (transitionCounts[tr.from] ?? 0) + 1;
      transitionCounts[tr.to] = (transitionCounts[tr.to] ?? 0) + 1;
    }
  }
  const maxTC = Math.max(...Object.values(transitionCounts), 0);

  return (
    <div
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 shadow-sm"
      style={{ minWidth: 160, maxWidth: 220 }}
    >
      {/* Handles for event wire connections */}
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-orange-400" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-orange-400" />

      {/* Row 1: Name + entity glyph + field type dots */}
      <div className="flex items-center gap-1.5 mb-1">
        <svg width={14} height={14} viewBox="0 0 20 20">
          <AvlEntity x={10} y={10} r={8} persistence={persistence as 'persistent' | 'runtime' | 'singleton' | 'instance'} />
        </svg>
        <span className="text-[11px] font-semibold text-[var(--color-foreground)] truncate flex-1">
          {orbitalName}
        </span>
      </div>

      {/* Row 2: Field type dots */}
      {fieldDots.length > 0 && (
        <svg width={fieldDots.length * 10 + 2} height={10} viewBox={`0 0 ${fieldDots.length * 10 + 2} 10`} className="mb-1">
          {fieldDots.map((f, i) => (
            <AvlFieldType key={f.name} x={i * 10 + 5} y={5} kind={toFieldKind(f.type)} size={4} />
          ))}
        </svg>
      )}

      {/* Row 3: State chain + page dots */}
      <div className="flex items-center gap-1">
        {stateChain.length > 0 && (
          <svg width={stateChain.length * 14 + 2} height={10} viewBox={`0 0 ${stateChain.length * 14 + 2} 10`}>
            {stateChain.map((s, i) => {
              const tc = transitionCounts[s.name] ?? 0;
              const role = getStateRole(s.name, s.isInitial, s.isTerminal, tc, maxTC);
              return (
                <React.Fragment key={s.name}>
                  <AvlState x={i * 14 + 1} y={1} width={10} height={8} name="" role={role} isInitial={s.isInitial} isTerminal={s.isTerminal} />
                  {i < stateChain.length - 1 && (
                    <line x1={i * 14 + 12} y1={5} x2={i * 14 + 15} y2={5} stroke="var(--color-border)" strokeWidth={0.5} />
                  )}
                </React.Fragment>
              );
            })}
          </svg>
        )}
        {pageDots.length > 0 && (
          <svg width={pageDots.length * 10} height={10} viewBox={`0 0 ${pageDots.length * 10} 10`}>
            {pageDots.map((p, i) => (
              <AvlPage key={p.name} x={i * 10 + 4} y={4} size={5} />
            ))}
          </svg>
        )}
      </div>
    </div>
  );
};

SystemNode.displayName = 'SystemNode';
