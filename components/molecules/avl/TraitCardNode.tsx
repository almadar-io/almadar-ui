'use client';

/**
 * TraitCardNode — React Flow node for the `trait-expanded` view level.
 *
 * Renders one card per trait of a single orbital. Header shows the trait
 * name + linked entity badge; body lists the trait's transitions as
 * clickable rows that drill into L4 transition detail; left edge has
 * one target handle per `listens[]` event; right edge has one source
 * handle per `emits[]` event. The edges produced by
 * `orbitalToTraitGraph` connect emit handles to listen handles where
 * the event names match.
 *
 * Transition-row clicks bubble through `TraitCardSelectionContext`
 * (mirrors `PatternSelectionContext` in `OrbPreviewNode`). FlowCanvas
 * wraps the canvas in a provider that translates the context callback
 * into its `onNodeClick({ level: 'transition', ... })` prop.
 */

import React, { createContext, useContext } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { PreviewNodeData } from './avl-preview-types';
import { Box } from '../../atoms/Box';
import { HStack, VStack } from '../../atoms/Stack';
import { Typography } from '../../atoms/Typography';
import { Button } from '../../atoms/Button';
import { Badge } from '../../atoms/Badge';

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

const CARD_WIDTH = 360;
const CARD_MIN_HEIGHT = 200;

const TraitCardNodeInner: React.FC<NodeProps> = (props) => {
  const data = props.data as PreviewNodeData;
  const { selectTransition } = useContext(TraitCardSelectionContext);

  const orbitalName = data.orbitalName;
  const traitName = data.traitName ?? '';
  const linkedEntity = data.linkedEntity ?? '';
  const transitions = data.transitions ?? [];
  const emits = data.emits ?? [];
  const listens = data.listens ?? [];

  return (
    <Box
      className="bg-card border-2 border-border rounded-lg shadow-md p-4"
      style={{ width: CARD_WIDTH, minHeight: CARD_MIN_HEIGHT, position: 'relative' }}
    >
      {listens.map((event, i) => (
        <Handle
          key={`listen-${event}`}
          type="target"
          position={Position.Left}
          id={`listen-${event}`}
          style={{ top: `${((i + 1) / (listens.length + 1)) * 100}%` }}
          aria-label={`listens for ${event}`}
        />
      ))}
      {emits.map((event, i) => (
        <Handle
          key={`emit-${event}`}
          type="source"
          position={Position.Right}
          id={`emit-${event}`}
          style={{ top: `${((i + 1) / (emits.length + 1)) * 100}%` }}
          aria-label={`emits ${event}`}
        />
      ))}

      <VStack gap="sm">
        <HStack gap="xs" justify="between" align="center">
          <Typography variant="h6" weight="semibold">{traitName}</Typography>
          {linkedEntity ? <Badge variant="secondary">{linkedEntity}</Badge> : null}
        </HStack>
        <VStack gap="xs">
          {transitions.length === 0 ? (
            <Typography variant="small" color="muted">No transitions</Typography>
          ) : (
            transitions.map((t, idx) => (
              <Button
                key={`${t.event}-${t.fromState}-${t.toState}-${idx}`}
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  selectTransition({
                    orbitalName,
                    traitName,
                    transitionEvent: t.event,
                    fromState: t.fromState,
                    toState: t.toState,
                    index: idx,
                  });
                }}
              >
                <Typography variant="small" weight="semibold">{t.event}</Typography>
                <Typography variant="small" color="muted">
                  {' · '}{t.fromState} → {t.toState}
                </Typography>
              </Button>
            ))
          )}
        </VStack>
      </VStack>
    </Box>
  );
};

export const TraitCardNode = React.memo(TraitCardNodeInner);
TraitCardNode.displayName = 'TraitCardNode';
