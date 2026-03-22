'use client';

import React from 'react';
import { AvlState } from '../../atoms/avl/AvlState';
import { AvlTransition } from '../../atoms/avl/AvlTransition';
import { AvlEvent } from '../../atoms/avl/AvlEvent';
import { AvlGuard } from '../../atoms/avl/AvlGuard';
import { AvlEffect } from '../../atoms/avl/AvlEffect';
import type { AvlEffectType } from '../../atoms/avl/types';
import { ringPositions } from './avl-layout';

export interface AvlStateMachineState {
  name: string;
  isInitial?: boolean;
  isTerminal?: boolean;
}

export interface AvlStateMachineTransition {
  from: string;
  to: string;
  event?: string;
  guard?: string;
  effects?: AvlEffectType[];
}

export interface AvlStateMachineProps {
  states: AvlStateMachineState[];
  transitions: AvlStateMachineTransition[];
  className?: string;
  color?: string;
  animated?: boolean;
}

let avlSmId = 0;

export const AvlStateMachine: React.FC<AvlStateMachineProps> = ({
  states,
  transitions,
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  const ids = React.useMemo(() => {
    avlSmId += 1;
    const base = `avl-sm-${avlSmId}`;
    return { glow: `${base}-glow`, grad: `${base}-grad` };
  }, []);

  const cx = 300;
  const cy = 200;
  const r = 150;
  const stateWidth = 90;
  const stateHeight = 36;

  const positions = ringPositions(cx, cy, r, states.length);
  const stateIndex = new Map(states.map((s, i) => [s.name, i]));

  // Track which transitions share the same pair to offset them
  const pairCount = new Map<string, number>();
  const pairSeen = new Map<string, number>();
  for (const tr of transitions) {
    const key = [tr.from, tr.to].sort().join('|');
    pairCount.set(key, (pairCount.get(key) ?? 0) + 1);
  }

  return (
    <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <filter id={ids.glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={ids.grad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.1} />
          <stop offset="100%" stopColor={color} stopOpacity={0.05} />
        </linearGradient>
      </defs>

      {animated && (
        <style>{`
          @keyframes avl-sm-dash { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
        `}</style>
      )}

      {/* Background */}
      <circle cx={cx} cy={cy} r={r + 30} fill={`url(#${ids.grad})`} />

      {/* Self-transitions (loop-back arcs) */}
      {transitions.map((tr, i) => {
        if (tr.from !== tr.to) return null;
        const idx = stateIndex.get(tr.from);
        if (idx === undefined) return null;
        const pos = positions[idx];

        // Draw a loop arc above the state
        const loopR = 20;
        const loopY = pos.y - stateHeight / 2 - 4;
        const d = `M${pos.x - 14},${loopY} C${pos.x - 14},${loopY - loopR * 2} ${pos.x + 14},${loopY - loopR * 2} ${pos.x + 14},${loopY}`;

        return (
          <g key={`self-${i}`}>
            <path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              opacity={0.7}
              markerEnd={`url(#${ids.grad})`}
            />
            {tr.event && (
              <text
                x={pos.x}
                y={loopY - loopR * 2 + 4}
                textAnchor="middle"
                fill={color}
                fontSize={9}
                fontFamily="inherit"
                fontWeight="bold"
                opacity={0.8}
              >
                {tr.event}
              </text>
            )}
          </g>
        );
      })}

      {/* Transitions (non-self) */}
      {transitions.map((tr, i) => {
        if (tr.from === tr.to) return null; // handled above
        const fromIdx = stateIndex.get(tr.from);
        const toIdx = stateIndex.get(tr.to);
        if (fromIdx === undefined || toIdx === undefined) return null;

        const fp = positions[fromIdx];
        const tp = positions[toIdx];

        const dx = tp.x - fp.x;
        const dy = tp.y - fp.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = dx / dist;
        const ny = dy / dist;

        // Offset parallel transitions so they don't overlap
        const pairKey = [tr.from, tr.to].sort().join('|');
        const totalForPair = pairCount.get(pairKey) ?? 1;
        const seenIdx = pairSeen.get(pairKey) ?? 0;
        pairSeen.set(pairKey, seenIdx + 1);
        const pairOffset = totalForPair > 1 ? (seenIdx - (totalForPair - 1) / 2) * 24 : 0;

        const x1 = fp.x + nx * (stateWidth / 2 + 4);
        const y1 = fp.y + ny * (stateHeight / 2 + 4);
        const x2 = tp.x - nx * (stateWidth / 2 + 8);
        const y2 = tp.y - ny * (stateHeight / 2 + 8);

        // Place labels at 30% along the arc (near source), not at midpoint
        const t = 0.3;
        const labelX = x1 * (1 - t) + x2 * t;
        const labelY = y1 * (1 - t) + y2 * t;

        // Perpendicular offset (push labels outside the ring)
        const perpX = -ny * (20 + Math.abs(pairOffset));
        const perpY = nx * (20 + Math.abs(pairOffset));

        // Determine which side is "outside" the ring
        const midToCenter = Math.sqrt((labelX - cx) ** 2 + (labelY - cy) ** 2);
        const testX = labelX + perpX;
        const testY = labelY + perpY;
        const testToCenter = Math.sqrt((testX - cx) ** 2 + (testY - cy) ** 2);
        const outSign = testToCenter > midToCenter ? 1 : -1;

        const lx = labelX + perpX * outSign + (-ny) * pairOffset;
        const ly = labelY + perpY * outSign + nx * pairOffset;

        return (
          <g key={`tr-${i}`}>
            <AvlTransition
              x1={x1 + (-ny) * pairOffset}
              y1={y1 + nx * pairOffset}
              x2={x2 + (-ny) * pairOffset}
              y2={y2 + nx * pairOffset}
              curved={states.length > 2}
              curveAwayFrom={{ x: cx, y: cy }}
              color={color}
              opacity={0.7}
            />
            {/* Event label placed outside the ring */}
            {tr.event && (
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                fill={color}
                fontSize={9}
                fontFamily="inherit"
                fontWeight="bold"
                opacity={0.8}
              >
                {tr.event}
              </text>
            )}
            {/* Guard label below event */}
            {tr.guard && (
              <text
                x={lx}
                y={ly + 12}
                textAnchor="middle"
                fill={color}
                fontSize={8}
                fontFamily="inherit"
                opacity={0.6}
              >
                [{tr.guard}]
              </text>
            )}
            {/* Effect icons in a row below */}
            {tr.effects?.map((eff, j) => (
              <AvlEffect
                key={j}
                x={lx + (j - ((tr.effects?.length ?? 1) - 1) / 2) * 14}
                y={ly + (tr.guard ? 22 : 12)}
                effectType={eff}
                size={5}
                color={color}
                opacity={0.7}
              />
            ))}
          </g>
        );
      })}

      {/* States */}
      {states.map((state, i) => {
        const pos = positions[i];
        return (
          <AvlState
            key={state.name}
            x={pos.x - stateWidth / 2}
            y={pos.y - stateHeight / 2}
            width={stateWidth}
            height={stateHeight}
            name={state.name}
            isInitial={state.isInitial}
            isTerminal={state.isTerminal}
            color={color}
          />
        );
      })}
    </svg>
  );
};

AvlStateMachine.displayName = 'AvlStateMachine';
