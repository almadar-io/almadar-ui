'use client';

/**
 * MiniStateMachine — Inline simplified state machine for the ModuleCard.
 *
 * Renders a compact left-to-right flow of AvlState nodes connected
 * by AvlTransition arrows, with AvlEffect icons below.
 * No ELK layout needed — uses simple horizontal positioning.
 */

import React from 'react';
import { AvlState } from '../../atoms/avl/AvlState';
import { AvlEffect } from '../../atoms/avl/AvlEffect';
import { getStateRole, type AvlEffectType } from '../../atoms/avl/types';
import type { TraitLevelData } from '../../organisms/avl/avl-schema-parser';

export interface MiniStateMachineProps {
  data: TraitLevelData;
  className?: string;
}

const NODE_W = 24;
const NODE_H = 16;
const GAP = 8;
const ARROW_W = 16;

export const MiniStateMachine: React.FC<MiniStateMachineProps> = ({ data, className }) => {
  const states = data.states;
  if (states.length === 0) return null;

  // Compute transition counts for role detection
  const transitionCounts: Record<string, number> = {};
  for (const s of states) transitionCounts[s.name] = 0;
  for (const t of data.transitions) {
    transitionCounts[t.from] = (transitionCounts[t.from] ?? 0) + 1;
    transitionCounts[t.to] = (transitionCounts[t.to] ?? 0) + 1;
  }
  const maxTC = Math.max(...Object.values(transitionCounts), 0);

  // Collect unique effect types
  const effectTypes = new Set<string>();
  for (const t of data.transitions) {
    for (const e of t.effects) effectTypes.add(e.type);
  }
  const effectList = Array.from(effectTypes).slice(0, 6);

  const totalW = states.length * NODE_W + (states.length - 1) * (GAP + ARROW_W + GAP);
  const svgW = Math.max(totalW + 4, 60);
  const svgH = NODE_H + (effectList.length > 0 ? 18 : 4);

  return (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className={className}>
      {states.map((s, i) => {
        const x = 2 + i * (NODE_W + GAP + ARROW_W + GAP);
        const tc = transitionCounts[s.name] ?? 0;
        const role = getStateRole(s.name, s.isInitial, s.isTerminal, tc, maxTC);

        return (
          <React.Fragment key={s.name}>
            <AvlState
              x={x}
              y={0}
              width={NODE_W}
              height={NODE_H}
              name=""
              role={role}
              isInitial={s.isInitial}
              isTerminal={s.isTerminal}
            />
            {/* Arrow to next state */}
            {i < states.length - 1 && (
              <g>
                <line
                  x1={x + NODE_W + GAP}
                  y1={NODE_H / 2}
                  x2={x + NODE_W + GAP + ARROW_W - 3}
                  y2={NODE_H / 2}
                  stroke="var(--color-muted-foreground)"
                  strokeWidth={1}
                  opacity={0.4}
                />
                <polygon
                  points={`${x + NODE_W + GAP + ARROW_W - 3},${NODE_H / 2 - 2.5} ${x + NODE_W + GAP + ARROW_W},${NODE_H / 2} ${x + NODE_W + GAP + ARROW_W - 3},${NODE_H / 2 + 2.5}`}
                  fill="var(--color-muted-foreground)"
                  opacity={0.4}
                />
              </g>
            )}
          </React.Fragment>
        );
      })}

      {/* Effect icons below */}
      {effectList.length > 0 && (
        <g>
          {effectList.map((et, i) => (
            <AvlEffect
              key={et}
              x={2 + i * 14}
              y={NODE_H + 4}
              effectType={et as AvlEffectType}
              size={10}
              showBackground
            />
          ))}
        </g>
      )}
    </svg>
  );
};

MiniStateMachine.displayName = 'MiniStateMachine';
