import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReactFlow, ReactFlowProvider, type Node, type Edge } from '@xyflow/react';
import { AvlEventWireEdge, type AvlEventWireEdgeData } from './AvlEventWireEdge';

const meta: Meta = {
  title: 'Avl/Molecules/AvlEventWireEdge',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const nodes: Node[] = [
  { id: 'cart', position: { x: 0, y: 100 }, data: { label: 'Cart' } },
  { id: 'orders', position: { x: 350, y: 100 }, data: { label: 'Orders' } },
];

const edges: Edge<AvlEventWireEdgeData>[] = [
  {
    id: 'ew1',
    source: 'cart',
    target: 'orders',
    type: 'eventWire',
    data: { event: 'CHECKOUT_DONE', compatible: true },
  },
];

export const Compatible: Story = {
  render: () => (
    <div style={{ width: 550, height: 300 }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          edgeTypes={{ eventWire: AvlEventWireEdge }}
          fitView
          proOptions={{ hideAttribution: true }}
        />
      </ReactFlowProvider>
    </div>
  ),
};

export const Incompatible: Story = {
  render: () => (
    <div style={{ width: 550, height: 300 }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={[{ ...edges[0], data: { event: 'CHECKOUT_DONE', compatible: false } }]}
          edgeTypes={{ eventWire: AvlEventWireEdge }}
          fitView
          proOptions={{ hideAttribution: true }}
        />
      </ReactFlowProvider>
    </div>
  ),
};
