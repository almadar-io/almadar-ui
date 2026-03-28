'use client';

/**
 * BehaviorView — Full state machine for the behavior zoom band (1.0x-2.5x).
 *
 * Uses ELK layout from avl-elk-layout.ts. Renders AvlState, AvlTransitionLane,
 * and AvlSwimLane inside an inline SVG within a React Flow node.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AvlState } from '../../atoms/avl/AvlState';
import { AvlTransitionLane } from './AvlTransitionLane';
import { AvlSwimLane } from './AvlSwimLane';
import { CONNECTION_COLORS, type AvlEffectType } from '../../atoms/avl/types';
import { computeTraitLayout, edgePath, type ElkLayout } from './avl-elk-layout';
import type { AvlNodeData } from './avl-canvas-types';

export interface BehaviorViewProps {
  data: AvlNodeData;
}

const SWIM_GUTTER = 120;
const CENTER_W = 360;

export const BehaviorView: React.FC<BehaviorViewProps> = ({ data }) => {
  const [layout, setLayout] = useState<ElkLayout | null>(null);

  // Use the first trait's details for the behavior view
  const traitName = data.traits[0]?.name;
  const traitData = traitName ? data.traitDetails[traitName] : undefined;

  const dataKey = useMemo(() => JSON.stringify(traitData), [traitData]);

  useEffect(() => {
    if (!traitData) return;
    computeTraitLayout(traitData).then(setLayout).catch(console.error);
  }, [dataKey]);

  if (!traitData) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center text-[var(--color-muted-foreground)] text-sm">
        No trait data
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center text-[var(--color-muted-foreground)] text-sm">
        Computing layout...
      </div>
    );
  }

  const hasExternal = traitData.listenedEvents.length > 0 || traitData.emittedEvents.length > 0;
  const viewW = hasExternal ? SWIM_GUTTER + CENTER_W + SWIM_GUTTER : CENTER_W + 60;
  const machineOffsetX = hasExternal ? 0 : 30;

  const padding = 20;
  const availW = CENTER_W - padding * 2;
  const availH = 300;
  const scale = Math.min(1, availW / layout.width, availH / layout.height);
  const scaledH = layout.height * scale;
  const scaledW = layout.width * scale;
  const offsetX = padding + (availW - scaledW) / 2;
  const offsetY = 50 + (availH - scaledH) / 2;
  const machineHeight = scaledH + 100;

  const renderMachine = (
    <g>
      <text x={CENTER_W / 2} y={20} textAnchor="middle" fill="var(--color-foreground)" fontSize={18} fontWeight="700" fontFamily="inherit">
        {traitData.name}
      </text>
      <text x={CENTER_W / 2} y={36} textAnchor="middle" fill="var(--color-muted-foreground)" fontSize={11} opacity={0.5} fontFamily="inherit">
        on {traitData.linkedEntity}
      </text>

      <defs>
        <marker id="bvArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={CONNECTION_COLORS.forward.color} opacity={0.7} />
        </marker>
        <marker id="bvArrowBack" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={CONNECTION_COLORS.backward.color} opacity={0.5} />
        </marker>
      </defs>

      <g transform={`translate(${offsetX},${offsetY}) scale(${scale})`}>
        {layout.edges.map(edge => {
          const conn = edge.isSelf
            ? CONNECTION_COLORS.selfLoop
            : edge.isBackward
              ? CONNECTION_COLORS.backward
              : CONNECTION_COLORS.forward;
          const marker = edge.isBackward || edge.isSelf ? 'url(#bvArrowBack)' : 'url(#bvArrow)';

          return (
            <g key={edge.id}>
              <path
                d={edgePath(edge.points)}
                fill="none"
                stroke={conn.color}
                strokeWidth={conn.width}
                strokeDasharray={conn.dash === 'none' ? undefined : conn.dash}
                opacity={0.5}
                markerEnd={marker}
              />
              <AvlTransitionLane
                x={edge.labelX}
                y={edge.labelY}
                event={edge.event}
                guard={edge.guardExpr}
                effects={edge.effects.map(e => ({ type: e.type as AvlEffectType }))}
                width={edge.labelW}
                isBackward={edge.isBackward}
                isSelfLoop={edge.isSelf}
              />
            </g>
          );
        })}

        {layout.nodes.map(node => (
          <AvlState
            key={node.id}
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
            name={node.id}
            isInitial={node.isInitial}
            isTerminal={node.isTerminal}
            role={node.role}
            transitionCount={node.transitionCount}
          />
        ))}
      </g>
    </g>
  );

  const svgH = machineHeight + 20;

  if (!hasExternal) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
        <svg width={viewW} height={svgH} viewBox={`0 0 ${viewW} ${svgH}`}>
          <g transform={`translate(${machineOffsetX}, 0)`}>{renderMachine}</g>
        </svg>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
      <svg width={viewW} height={svgH} viewBox={`0 0 ${viewW} ${svgH}`}>
        <AvlSwimLane
          listenedEvents={traitData.listenedEvents}
          emittedEvents={traitData.emittedEvents}
          centerWidth={CENTER_W}
          height={machineHeight}
        >
          {renderMachine}
        </AvlSwimLane>
      </svg>
    </div>
  );
};

BehaviorView.displayName = 'BehaviorView';
