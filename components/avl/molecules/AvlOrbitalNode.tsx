'use client';

/**
 * AvlOrbitalNode — Single React Flow node type for the unified AVL canvas.
 *
 * Reads the current ZoomBand from context and renders the appropriate
 * sub-component: SystemNode, ModuleCard, BehaviorView, or DetailView.
 *
 * Using a single node type (instead of switching types per zoom band)
 * prevents React from unmounting/remounting nodes on zoom changes.
 */

import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { useZoomBand } from './avl-zoom-band';
import { SystemNode } from './SystemNode';
import { ModuleCard } from './ModuleCard';
import { BehaviorView } from './BehaviorView';
import { DetailView } from './DetailView';
import type { AvlNodeData } from './avl-canvas-types';

export const AvlOrbitalNode: React.FC<NodeProps> = (props) => {
  const band = useZoomBand();
  const data = props.data as AvlNodeData;

  switch (band) {
    case 'system':
      return <SystemNode data={data} />;
    case 'module':
      return <ModuleCard data={data} />;
    case 'behavior':
      return <BehaviorView data={data} />;
    case 'detail':
      return <DetailView data={data} />;
  }
};

AvlOrbitalNode.displayName = 'AvlOrbitalNode';
