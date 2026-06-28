'use client';

/**
 * BehaviorComposeNode
 *
 * React Flow custom node for behavior-level composition.
 * Shows AvlBehaviorGlyph instead of live UI (OrbPreview).
 * Each behavior is one compact node with event handles for wiring.
 *
 * This is the compose-level node. Double-clicking drills into
 * the orbital-level view (OrbPreviewNode).
 */

import React, { useState, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Box } from '../../core/atoms/Box';
import { Typography } from '../../core/atoms/Typography';
import { Badge } from '../../core/atoms/Badge';
import { AvlBehaviorGlyph, type BehaviorGlyphChild, type BehaviorGlyphConnection, type BehaviorLevel } from './AvlBehaviorGlyph';
import type { BehaviorComposeNodeData, ConnectableEvent } from '../types/avl-behavior-compose-types';
import { formatPayloadTooltip, type PayloadField } from '../lib/wire-validation';
import type { AvlEffectType, AvlPersistenceKind } from '../types/avl-atom-types';
import { createLogger } from '@almadar/logger';

const behaviorHandleLog = createLogger('almadar:ui:nan-coord');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LAYER_COLORS: Record<string, string> = {
  Infrastructure: '#3B82F6',
  Services: '#F59E0B',
  'UI Patterns': '#8B5CF6',
  Game: '#22C55E',
  ML: '#EC4899',
  Domain: '#6366F1',
  Community: '#6B7280',
};

const NODE_WIDTH = 220;

const TARGET_HANDLE_STYLE: React.CSSProperties = {
  background: 'var(--color-primary)',
  width: 8,
  height: 8,
  border: '2px solid var(--color-card)',
};

function eventHandleStyle(source: ConnectableEvent): React.CSSProperties {
  const hint = Number.isFinite(source.positionHint) ? source.positionHint : 0.5;
  if (hint !== source.positionHint) {
    behaviorHandleLog.warn('behavior-compose-handle: non-finite positionHint on ConnectableEvent', {
      event: source.event,
      positionHint: source.positionHint,
    });
  }
  return {
    background: '#F97316',
    width: 10,
    height: 10,
    border: '2px solid var(--color-card)',
    top: `${hint * 100}%`,
    right: -5,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const BehaviorComposeNodeInner: React.FC<NodeProps> = (props) => {
  const data = props.data as BehaviorComposeNodeData;
  const [hovered, setHovered] = useState(false);
  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  const layerColor = data.layer ? LAYER_COLORS[data.layer] : undefined;
  const connectableEvents = data.connectableEvents ?? [];

  return (
    <Box
      className="rounded-lg border shadow-sm bg-card transition-all duration-200 overflow-hidden"
      style={{
        borderColor: hovered ? 'var(--color-primary)' : 'var(--color-border)',
        borderWidth: '1.5px',
        width: NODE_WIDTH,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Layer color band */}
      {layerColor && (
        <Box
          style={{ height: 3, backgroundColor: layerColor }}
          title={data.layer ?? undefined}
        />
      )}

      {/* Header - drag handle */}
      <Box className="flex items-center gap-2 px-3 py-1.5 border-b border-border/40 drag-handle cursor-grab">
        <Box className="flex flex-col min-w-0 flex-1">
          <Typography variant="small" className="font-semibold truncate leading-tight text-xs">
            {data.behaviorName}
          </Typography>
          <Typography variant="small" className="text-muted-foreground truncate text-xs leading-tight">
            {data.entityName}
          </Typography>
        </Box>
        <Badge variant="neutral" className="shrink-0">
          <Typography variant="caption" className="text-[9px] text-inherit">
            {data.level}
          </Typography>
        </Badge>
      </Box>

      {/* Glyph */}
      <Box className="flex items-center justify-center py-3">
        <AvlBehaviorGlyph
          name={data.behaviorName}
          level={data.level as BehaviorLevel | undefined}
          domain={data.domain ?? undefined}
          stateCount={data.stateCount}
          fieldCount={data.fieldCount ?? undefined}
          persistence={data.persistence as AvlPersistenceKind | undefined}
          effectTypes={data.effectTypes as AvlEffectType[] | undefined}
          children={data.children as BehaviorGlyphChild[] | undefined}
          connections={data.connections as BehaviorGlyphConnection[] | undefined}
          size="sm"
          showLabels={false}
        />
      </Box>

      {/* Event pills */}
      {connectableEvents.length > 0 && (
        <Box className="flex flex-wrap gap-0.5 px-2 pb-2">
          {connectableEvents.slice(0, 4).map((ev) => (
            <Box
              key={ev.event}
              className="rounded-full px-1.5 py-0 text-xs font-medium leading-tight"
              style={{
                backgroundColor: '#F9731615',
                color: '#F97316',
                border: '1px solid #F9731630',
              }}
              title={`${ev.event}${ev.payloadFields?.length ? ` ${formatPayloadTooltip(ev.payloadFields as PayloadField[])}` : ''}`}
            >
              {ev.event}
            </Box>
          ))}
          {connectableEvents.length > 4 && (
            <Box
              className="rounded-full px-1.5 py-0 text-xs font-medium leading-tight"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              +{connectableEvents.length - 4}
            </Box>
          )}
        </Box>
      )}

      {/* Footer: state count + layer tag */}
      <Box className="flex items-center justify-between px-2 pb-1.5">
        <Typography variant="small" className="text-muted-foreground text-[9px]">
          {data.stateCount} states
        </Typography>
        {data.layer && (
          <Badge variant="neutral" className="text-xs">
            <Typography variant="caption" className="text-xs text-inherit">
              {data.layer}
            </Typography>
          </Badge>
        )}
      </Box>

      {/* Target handle (left side) */}
      <Handle
        type="target"
        position={Position.Left}
        style={TARGET_HANDLE_STYLE}
      />

      {/* Source handles (right side, one per connectable event) */}
      {connectableEvents.map((ev) => (
        <Handle
          key={`event-${ev.event}`}
          id={`event-${ev.event}`}
          type="source"
          position={Position.Right}
          style={eventHandleStyle(ev)}
          title={`${ev.event}${ev.payloadFields?.length ? ` ${formatPayloadTooltip(ev.payloadFields as PayloadField[])}` : ''}`}
        />
      ))}
    </Box>
  );
};

export const BehaviorComposeNode = React.memo(BehaviorComposeNodeInner);
BehaviorComposeNode.displayName = 'BehaviorComposeNode';
