'use client';

/**
 * TraitCardNode — React Flow node for the `trait-expanded` view level.
 *
 * Renders one card per trait of a single orbital. The card body shows
 * the trait's state-machine flow chart (states + transitions, laid out
 * by ELK) via the existing `AvlTraitScene` organism. Clicking a
 * transition arc drills into L4 transition detail.
 *
 * Left edge has one target handle per `listens[]` event; right edge
 * has one source handle per `emits[]` event. Edges produced by
 * `orbitalToTraitGraph` connect emit handles to listen handles where
 * the event names match within the same orbital.
 *
 * Transition clicks bubble through `TraitCardSelectionContext`
 * (mirrors `PatternSelectionContext` in `OrbPreviewNode`). FlowCanvas
 * wraps the canvas in a provider that translates the context callback
 * into its `onNodeClick({ level: 'transition', ... })` prop.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { OrbitalSchema } from '@almadar/core';
import type { PreviewNodeData } from './avl-preview-types';
import { Box } from '../../core/atoms/Box';
import { HStack, VStack } from '../../core/atoms/Stack';
import { Typography } from '../../core/atoms/Typography';
import { Badge } from '../../core/atoms/Badge';
import { AvlTraitScene } from '../organisms/AvlTraitScene';
import { parseTraitLevel } from '../organisms/avl-schema-parser';
import { useTranslate } from '../../../hooks/useTranslate';

// ---------------------------------------------------------------------------
// Selection context
// ---------------------------------------------------------------------------

export interface TraitCardTransitionClick {
  orbitalName: string;
  traitName: string;
  transitionEvent: string;
  fromState: string;
  toState: string;
  index: number;
}

export interface TraitCardSelectionContextValue {
  selectTransition: (sel: TraitCardTransitionClick) => void;
}

export const TraitCardSelectionContext = createContext<TraitCardSelectionContextValue>({
  selectTransition: () => { /* no-op default; FlowCanvas wraps consumers */ },
});

// ---------------------------------------------------------------------------
// Node component
// ---------------------------------------------------------------------------

const CARD_WIDTH = 540;
const SCENE_WIDTH = 600;
const SCENE_HEIGHT = 400;

const TraitCardNodeInner: React.FC<NodeProps> = (props) => {
  const data = props.data as PreviewNodeData;
  const { t } = useTranslate();
  const { selectTransition } = useContext(TraitCardSelectionContext);

  const orbitalName = data.orbitalName;
  const traitName = data.traitName ?? '';
  const linkedEntity = data.linkedEntity ?? '';
  const transitions = data.transitions ?? [];
  const emits = data.emits ?? [];
  const listens = data.listens ?? [];
  const fullSchema = data._fullSchema as OrbitalSchema | undefined;

  // Parse the trait-level data the same way the old cosmic L3 did, so
  // the embedded `AvlTraitScene` gets the ELK-laid-out states +
  // transitions + emit/listen swim lanes it expects.
  const traitLevelData = useMemo(() => {
    if (!fullSchema) return null;
    return parseTraitLevel(fullSchema, orbitalName, traitName);
  }, [fullSchema, orbitalName, traitName]);

  return (
    <Box
      className="bg-card border-2 border-border rounded-lg shadow-md p-4"
      style={{ width: CARD_WIDTH, position: 'relative' }}
    >
      {listens.map((event, i) => (
        <Handle
          key={`listen-${event}`}
          type="target"
          position={Position.Left}
          id={`listen-${event}`}
          style={{ top: `${((i + 1) / (listens.length + 1)) * 100}%` }}
          aria-label={t('avl.listensFor', { event })}
        />
      ))}
      {emits.map((event, i) => (
        <Handle
          key={`emit-${event}`}
          type="source"
          position={Position.Right}
          id={`emit-${event}`}
          style={{ top: `${((i + 1) / (emits.length + 1)) * 100}%` }}
          aria-label={t('avl.emits', { event })}
        />
      ))}

      <VStack gap="sm">
        <HStack gap="xs" justify="between" align="center">
          <Typography variant="h6" weight="semibold">{traitName}</Typography>
          {linkedEntity ? <Badge variant="secondary">{linkedEntity}</Badge> : null}
        </HStack>

        {traitLevelData ? (
          // `nodrag` + `nowheel` tell xyflow to skip its drag/wheel
          // handlers on this element, so transition-arc clicks inside
          // the SVG actually reach React's onClick handlers instead of
          // being swallowed by the node-drag behavior. `nopan` keeps the
          // ReactFlow canvas from panning when the user scrolls or
          // pans within the trait card.
          <svg
            viewBox={`0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`}
            className="nodrag nopan nowheel"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          >
            <AvlTraitScene
              data={traitLevelData}
              onTransitionClick={(idx) => {
                const t = transitions[idx];
                if (!t) return;
                selectTransition({
                  orbitalName,
                  traitName,
                  transitionEvent: t.event,
                  fromState: t.fromState,
                  toState: t.toState,
                  index: idx,
                });
              }}
            />
          </svg>
        ) : (
          <Typography variant="small" color="muted">{t('avl.noStateMachine')}</Typography>
        )}
      </VStack>
    </Box>
  );
};

export const TraitCardNode = React.memo(TraitCardNodeInner);
TraitCardNode.displayName = 'TraitCardNode';
