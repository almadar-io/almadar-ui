import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReactFlow, ReactFlowProvider, type Node, type Edge } from '@xyflow/react';
import { AvlTransitionEdge, type AvlTransitionEdgeData } from './AvlTransitionEdge';

const meta: Meta = {
  title: 'Avl/Molecules/AvlTransitionEdge',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const nodes: Node[] = [
  { id: 'a', position: { x: 0, y: 100 }, data: { label: 'Idle' } },
  { id: 'b', position: { x: 300, y: 100 }, data: { label: 'Active' } },
];

const edges: Edge<AvlTransitionEdgeData>[] = [
  {
    id: 'e1',
    source: 'a',
    target: 'b',
    type: 'transition',
    data: { event: 'ACTIVATE', hasGuard: true, hasEffects: true },
  },
];

export const Default: Story = {
  render: () => (
    <div style={{ width: 500, height: 300 }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          edgeTypes={{ transition: AvlTransitionEdge }}
          fitView
          proOptions={{ hideAttribution: true }}
        />
      </ReactFlowProvider>
    </div>
  ),
};
