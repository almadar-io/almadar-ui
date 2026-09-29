'use client';

/**
 * SystemNode — one orbital on the system map (cosmic L1): name, entity and
 * its size (traits · pages · fields). Hovering shows what the host renders
 * for the orbital (its live screen), with Open traits (drill in), Open code
 * and Preview. `SystemBandNode` heads the connected / standalone bands.
 */

import React, { createContext, useContext, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { EventEmit } from '@almadar/core';
import { Box } from '../../core/atoms/Box';
import { HStack, VStack } from '../../core/atoms/Stack';
import { Typography } from '../../core/atoms/Typography';
import { Button } from '../../core/atoms/Button';
import { Popover } from '../../core/molecules/Popover';
import { AvlGlyph } from './AvlGlyph';
import { useTranslate } from '../../../hooks/useTranslate';
import type { PreviewNodeData } from '../../../lib/avl-preview-converter';

export interface SystemMapContextValue {
  /** Drill into the orbital's traits. */
  openTraits: (orbital: string) => void;
  /** What the hover shows for an orbital (e.g. its live screen); no hover card without it. */
  renderPreview?: (orbital: string) => React.ReactNode;
  /** Emits UI:{openCodeEvent} with { orbital }. */
  openCodeEvent?: EventEmit<{ orbital: string }>;
  /** Emits UI:{previewEvent} with { orbital }. */
  previewEvent?: EventEmit<{ orbital: string }>;
  /** The orbital to ring (the one the user came from). */
  highlighted?: string;
  /** Dependencies lens: a node was clicked (its id; clicking the selected one clears). */
  selectDependency?: (id: string) => void;
}

export const SystemMapContext = createContext<SystemMapContextValue>({ openTraits: () => undefined });

const HIDDEN_HANDLE = { opacity: 0, width: 1, height: 1, border: 0 };

const SystemNodeInner: React.FC<NodeProps> = ({ data }) => {
  const d = data as PreviewNodeData;
  const { t } = useTranslate();
  const map = useContext(SystemMapContext);
  const [open, setOpen] = useState(false);
  const orbital = d.orbitalName;
  const highlighted = map.highlighted === orbital;

  const chip = (
    <Box
      data-testid="avl-system-node"
      data-orbital={orbital}
      role="button"
      tabIndex={0}
      onClick={() => map.openTraits(orbital)}
      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') map.openTraits(orbital); }}
      className={`cursor-pointer rounded-lg border bg-card px-3 py-2.5 shadow-sm transition-shadow hover:shadow-md ${highlighted ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}
      style={{ width: 280, height: 88 }}
    >
      <Handle type="target" position={Position.Left} style={HIDDEN_HANDLE} isConnectable={false} />
      <Handle type="source" position={Position.Right} style={HIDDEN_HANDLE} isConnectable={false} />
      <HStack gap="sm" align="center" className="h-full min-w-0">
        <AvlGlyph kind="orbital" size="sm" showCaption={false} />
        <VStack gap="none" className="min-w-0 flex-1">
          <Box className="min-w-0" title={orbital}>
            <Typography variant="body1" weight="semibold" className="truncate">{orbital}</Typography>
          </Box>
          <Box className="min-w-0" title={d.entityName}>
            <Typography variant="caption" color="muted" className="truncate">{d.entityName}</Typography>
          </Box>
          <Box data-testid="avl-system-node-counts" className="min-w-0">
            <Typography variant="caption" color="muted" className="truncate">
              {t('avl.system.counts', { traits: d.traitCount ?? 0, pages: d.pageRoutes?.length ?? 0, fields: d.fieldCount ?? 0 })}
            </Typography>
          </Box>
        </VStack>
      </HStack>
    </Box>
  );

  if (!map.renderPreview) return chip;
  return (
    <Popover
      trigger="hover"
      position="right"
      showArrow={false}
      open={open}
      onOpenChange={setOpen}
      content={
        <Box data-testid="avl-system-preview">
        <VStack gap="sm" className="p-2">
          <VStack gap="none">
            <Typography variant="body2" weight="semibold">{orbital}</Typography>
            <Typography variant="caption" color="muted">
              {t('avl.system.counts', { traits: d.traitCount ?? 0, pages: d.pageRoutes?.length ?? 0, fields: d.fieldCount ?? 0 })}
            </Typography>
            {d.wireEvents && d.wireEvents.length > 0 ? (
              <Typography variant="caption" color="muted">{t('avl.system.exchanges', { events: d.wireEvents.join(', ') })}</Typography>
            ) : null}
          </VStack>
          {map.renderPreview(orbital)}
          <HStack gap="xs">
            <Button variant="primary" size="sm" rightIcon="chevron-right" onClick={() => { setOpen(false); map.openTraits(orbital); }} data-testid="avl-system-open-traits">
              {t('avl.system.openTraits')}
            </Button>
            {map.openCodeEvent ? (
              <Button variant="secondary" size="sm" leftIcon="code" action={map.openCodeEvent} actionPayload={{ orbital }} onClick={() => setOpen(false)}>
                {t('avl.system.openCode')}
              </Button>
            ) : null}
            {map.previewEvent ? (
              <Button variant="secondary" size="sm" leftIcon="maximize" action={map.previewEvent} actionPayload={{ orbital }} onClick={() => setOpen(false)}>
                {t('avl.system.preview')}
              </Button>
            ) : null}
          </HStack>
        </VStack>
        </Box>
      }
    >
      {chip}
    </Popover>
  );
};

export const SystemNode = React.memo(SystemNodeInner);
SystemNode.displayName = 'SystemNode';

const SystemBandNodeInner: React.FC<NodeProps> = ({ data }) => {
  const d = data as PreviewNodeData;
  const { t } = useTranslate();
  return (
    <Box data-testid={`avl-system-band-${d.bandKind}`} className="pointer-events-none whitespace-nowrap">
      <Typography variant="overline" color="muted">
        {t(d.bandKind === 'connected' ? 'avl.system.connected' : 'avl.system.standalone', { count: d.bandCount ?? 0 })}
      </Typography>
    </Box>
  );
};

export const SystemBandNode = React.memo(SystemBandNodeInner);
SystemBandNode.displayName = 'SystemBandNode';

const DEPENDENCY_ROLE_CLASS: Record<NonNullable<PreviewNodeData['dependencyRole']> | 'none', string> = {
  selected: 'border-primary bg-primary/25 text-foreground ring-2 ring-primary/40',
  upstream: 'border-primary bg-primary/10 text-foreground',
  downstream: 'border-warning bg-warning/10 text-foreground',
  both: 'border-primary bg-warning/10 text-foreground',
  dim: 'border-border bg-card text-muted-foreground opacity-40',
  none: 'border-border bg-card text-foreground',
};

const UNIT_STATUS_CLASS: Record<NonNullable<PreviewNodeData['unitStatus']>, string> = {
  ok: 'bg-success',
  degraded: 'bg-warning',
  down: 'bg-error',
  idle: 'bg-muted-foreground',
};

const DependencyNodeInner: React.FC<NodeProps> = ({ id, data }) => {
  const d = data as PreviewNodeData;
  const { t } = useTranslate();
  const map = useContext(SystemMapContext);
  return (
    <Box
      data-testid="avl-dependency-node"
      data-dependency={id}
      data-role={d.dependencyRole ?? 'none'}
      role="button"
      tabIndex={0}
      title={d.orbitalName}
      onClick={() => map.selectDependency?.(id)}
      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') map.selectDependency?.(id); }}
      className={`flex cursor-pointer items-center rounded-md border px-2.5 transition-colors ${DEPENDENCY_ROLE_CLASS[d.dependencyRole ?? 'none']}`}
      style={{ width: d.cardWidth ?? 220, height: 28 }}
    >
      {/* Wires leave and arrive on the side facing the other end (first of each type is the default). */}
      <Handle id="in-left" type="target" position={Position.Left} style={HIDDEN_HANDLE} isConnectable={false} />
      <Handle id="out-right" type="source" position={Position.Right} style={HIDDEN_HANDLE} isConnectable={false} />
      <Handle id="out-left" type="source" position={Position.Left} style={HIDDEN_HANDLE} isConnectable={false} />
      <Handle id="in-right" type="target" position={Position.Right} style={HIDDEN_HANDLE} isConnectable={false} />
      <Typography variant="small" className="truncate font-mono">
        {d.flowTraits === undefined
          ? d.orbitalName
          : [d.orbitalName, [
              d.flowTraits > 0 ? t(d.flowTraits === 1 ? 'avl.flow.traitsCountOne' : 'avl.flow.traitsCount', { count: d.flowTraits }) : null,
              (d.flowRenderPieces ?? 0) > 0 ? t(d.flowRenderPieces === 1 ? 'avl.flow.piecesCountOne' : 'avl.flow.piecesCount', { count: d.flowRenderPieces ?? 0 }) : null,
            ].filter((part) => part !== null).join(' + ')].join(' · ')}
      </Typography>
      {d.unitMetric !== undefined ? (
        <Typography variant="caption" color="muted" className="ml-auto shrink-0 pl-2 font-mono">{d.unitMetric}</Typography>
      ) : null}
      {d.unitStatus !== undefined ? (
        <Box
          data-testid="avl-unit-status"
          data-status={d.unitStatus}
          title={t(`avl.unit.status.${d.unitStatus}`)}
          className={`${d.unitMetric !== undefined ? 'ml-2' : 'ml-auto'} h-2 w-2 shrink-0 rounded-full ${UNIT_STATUS_CLASS[d.unitStatus]}`}
        />
      ) : null}
    </Box>
  );
};

export const DependencyNode = React.memo(DependencyNodeInner);
DependencyNode.displayName = 'DependencyNode';

const DependencyColumnNodeInner: React.FC<NodeProps> = ({ data }) => {
  const d = data as PreviewNodeData;
  const { t } = useTranslate();
  return (
    <Box data-testid={`avl-dependency-column-${d.dependencyColumn}`} className="pointer-events-none whitespace-nowrap">
      <Typography variant="overline" color="muted">{t(`avl.deps.column.${d.dependencyColumn ?? 'unknown'}`)}</Typography>
    </Box>
  );
};

export const DependencyColumnNode = React.memo(DependencyColumnNodeInner);
DependencyColumnNode.displayName = 'DependencyColumnNode';
