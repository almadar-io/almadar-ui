'use client';

/**
 * AvlTransitionScene - Zoom Level 4
 *
 * Shows a single transition in detail as a vertical flow:
 * FromState -> Event card -> Guard -> Effects -> ToState
 *
 * Labels are placed in cards between arrow segments,
 * never overlapping the lines.
 */

import React from 'react';
import { AvlState } from '../../atoms/avl/AvlState';
import { AvlEffect } from '../../atoms/avl/AvlEffect';
import type { TransitionLevelData, ExprTreeNode } from './avl-schema-parser';

export interface AvlTransitionSceneProps {
  data: TransitionLevelData;
  color?: string;
}

const CX = 300;
const STATE_W = 120;
const STATE_H = 40;
const CARD_W = 140;

function mapEffectType(label: string): 'render-ui' | 'set' | 'persist' | 'fetch' | 'emit' | 'navigate' | 'notify' | 'call-service' | 'log' {
  const map: Record<string, 'render-ui' | 'set' | 'persist' | 'fetch' | 'emit' | 'navigate' | 'notify' | 'call-service' | 'log'> = {
    'render-ui': 'render-ui', set: 'set', persist: 'persist', fetch: 'fetch',
    emit: 'emit', navigate: 'navigate', notify: 'notify', 'call-service': 'call-service', log: 'log',
  };
  return map[label] ?? 'log';
}

function EffectNode({ node, x, y, color, id }: { node: ExprTreeNode; x: number; y: number; color: string; id: string }): React.ReactElement {
  if (node.type === 'operator') {
    const children = node.children ?? [];
    // Space children based on max label length to avoid overlap
    const maxLabelLen = Math.max(...children.map(c => c.label.length), 4);
    const childSpacing = Math.max(90, maxLabelLen * 8 + 20);
    const totalW = (children.length - 1) * childSpacing;
    const startX = x - totalW / 2;

    return (
      <g>
        {/* Operator card */}
        <rect x={x - 30} y={y - 10} width={60} height={20} rx={4} fill="var(--color-surface, white)" stroke={color} strokeWidth={0.8} />
        <AvlEffect x={x - 16} y={y} effectType={mapEffectType(node.label)} size={10} color={color} />
        <text x={x + 2} y={y + 4} fill={color} fontSize={9} fontWeight="500">{node.label}</text>

        {/* Children */}
        {children.map((child, i) => {
          const cx = startX + i * childSpacing;
          const cy = y + 40;
          return (
            <g key={`${id}-${i}`}>
              <line x1={x} y1={y + 10} x2={cx} y2={cy - 10} stroke={color} strokeWidth={0.8} opacity={0.3} />
              <EffectNode node={child} x={cx} y={cy} color={color} id={`${id}-${i}`} />
            </g>
          );
        })}
      </g>
    );
  }

  // Leaf node (literal or binding)
  const isBinding = node.type === 'binding';
  return (
    <g>
      <circle cx={x} cy={y} r={isBinding ? 6 : 5} fill={isBinding ? 'none' : color} opacity={isBinding ? 1 : 0.15}
        stroke={color} strokeWidth={1} strokeDasharray={isBinding ? '2 1.5' : 'none'} />
      <text x={x} y={y + 16} textAnchor="middle" fill={color} fontSize={8} opacity={0.7}>{node.label}</text>
    </g>
  );
}

export const AvlTransitionScene: React.FC<AvlTransitionSceneProps> = ({
  data,
  color = 'var(--color-primary)',
}) => {
  // Vertical flow layout with cards between arrow segments
  let curY = 30;

  // From state
  const fromY = curY;
  curY += STATE_H;

  // Arrow segment 1
  const arrow1Start = curY;
  curY += 15;

  // Event card
  const eventY = curY;
  const eventH = 24;
  curY += eventH + 8;

  // Guard card (optional)
  const guardY = curY;
  const hasGuard = !!data.guard;
  if (hasGuard) {
    curY += 24 + 8;
  }

  // Arrow segment 2
  curY += 15;

  // Effects section
  const effectsY = curY;
  const hasEffects = data.effects.length > 0;
  const effectsH = hasEffects ? 80 : 0;
  if (hasEffects) curY += effectsH + 8;

  // Slots section
  const slotsY = curY;
  const hasSlots = data.slotTargets.length > 0;
  const slotsH = hasSlots ? 30 : 0;
  if (hasSlots) curY += slotsH + 8;

  // Arrow segment 3
  curY += 15;

  // To state
  const toY = curY;
  curY += STATE_H;

  // Center vertically in 400px viewBox
  const totalH = curY;
  const offsetY = Math.max(0, (400 - totalH) / 2);

  return (
    <g transform={`translate(0,${offsetY})`}>
      {/* Arrow marker */}
      <defs>
        <marker id="transArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} opacity={0.5} />
        </marker>
      </defs>

      {/* From state */}
      <AvlState x={CX - STATE_W / 2} y={fromY} width={STATE_W} height={STATE_H} name={data.from} isInitial color={color} />

      {/* Arrow segment: from -> event */}
      <line x1={CX} y1={fromY + STATE_H} x2={CX} y2={eventY - 2} stroke={color} strokeWidth={1.5} opacity={0.4} markerEnd="url(#transArrow)" />

      {/* Event card */}
      <rect x={CX - CARD_W / 2} y={eventY} width={CARD_W} height={eventH} rx={5}
        fill="var(--color-surface, white)" stroke={color} strokeWidth={1} />
      <text x={CX} y={eventY + 15} textAnchor="middle" fill={color} fontSize={13} fontWeight="700">
        {data.event}
      </text>

      {/* Guard card */}
      {hasGuard && data.guard && (
        <g>
          <line x1={CX} y1={eventY + eventH} x2={CX} y2={guardY - 2} stroke={color} strokeWidth={1} opacity={0.3} />
          <rect x={CX - 50} y={guardY} width={100} height={20} rx={4}
            fill="var(--color-surface, white)" stroke={color} strokeWidth={0.8} opacity={0.9} />
          <text x={CX - 6} y={guardY + 14} textAnchor="middle" fill={color} fontSize={10}>
            {data.guard.label}
          </text>
          {/* Diamond indicator */}
          <polygon
            points={`${CX - 40},${guardY + 10} ${CX - 46},${guardY + 10 - 5} ${CX - 40},${guardY + 10 - 10} ${CX - 34},${guardY + 10 - 5}`}
            fill={color} opacity={0.2} stroke={color} strokeWidth={0.8}
          />
        </g>
      )}

      {/* Arrow segment: event/guard -> effects */}
      <line
        x1={CX}
        y1={hasGuard ? guardY + 20 : eventY + eventH}
        x2={CX}
        y2={hasEffects ? effectsY - 8 : (hasSlots ? slotsY - 8 : toY - 2)}
        stroke={color} strokeWidth={1.5} opacity={0.4}
        markerEnd="url(#transArrow)"
      />

      {/* Effects section */}
      {hasEffects && (
        <g>
          <text x={CX} y={effectsY - 2} textAnchor="middle" fill={color} fontSize={9} fontWeight="600" opacity={0.5}>
            EFFECTS
          </text>
          {data.effects.map((effect, i) => {
            const effectSpacing = 130;
            const effectX = CX - ((data.effects.length - 1) * effectSpacing) / 2 + i * effectSpacing;
            return <EffectNode key={`eff-${i}`} node={effect} x={effectX} y={effectsY + 20} color={color} id={`eff-${i}`} />;
          })}
        </g>
      )}

      {/* Slot targets */}
      {hasSlots && (
        <g>
          {hasEffects && (
            <line x1={CX} y1={effectsY + effectsH - 10} x2={CX} y2={slotsY - 4} stroke={color} strokeWidth={1} opacity={0.3} />
          )}
          <text x={CX} y={slotsY - 2} textAnchor="middle" fill={color} fontSize={9} fontWeight="600" opacity={0.5}>
            SLOTS
          </text>
          {data.slotTargets.map((slot, i) => {
            const sx = CX - ((data.slotTargets.length - 1) * 90) / 2 + i * 90;
            return (
              <g key={`slot-${i}`}>
                <rect x={sx - 35} y={slotsY + 4} width={70} height={20} rx={4}
                  fill={color} opacity={0.08} stroke={color} strokeWidth={0.8} />
                <text x={sx} y={slotsY + 17} textAnchor="middle" fill={color} fontSize={9}>
                  {slot.name}: {slot.pattern}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* Arrow segment: effects/slots -> to state */}
      {(hasEffects || hasSlots) && (
        <line
          x1={CX}
          y1={hasSlots ? slotsY + slotsH : effectsY + effectsH - 10}
          x2={CX}
          y2={toY - 2}
          stroke={color} strokeWidth={1.5} opacity={0.4}
          markerEnd="url(#transArrow)"
        />
      )}

      {/* To state */}
      <AvlState x={CX - STATE_W / 2} y={toY} width={STATE_W} height={STATE_H} name={data.to} color={color} />
    </g>
  );
};

AvlTransitionScene.displayName = 'AvlTransitionScene';
