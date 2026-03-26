import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReactFlow, ReactFlowProvider, type Node, type Edge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { EventWireEdge } from './EventWireEdge';
import { OrbitalNode } from './OrbitalNode';

const nodeTypes = { orbitalNode: OrbitalNode };
const edgeTypes = { eventWireEdge: EventWireEdge };

const twoOrbitals: Node[] = [
  {
    id: 'cart',
    type: 'orbitalNode',
    position: { x: 20, y: 40 },
    data: {
      name: 'CartManager',
      entityName: 'CartItem',
      traitCount: 2,
      pageCount: 1,
      emits: ['CART_UPDATED'],
      listens: [],
    },
  },
  {
    id: 'checkout',
    type: 'orbitalNode',
    position: { x: 400, y: 40 },
    data: {
      name: 'CheckoutFlow',
      entityName: 'Order',
      traitCount: 3,
      pageCount: 2,
      emits: [],
      listens: ['CART_UPDATED'],
    },
  },
];

const meta: Meta = {
  title: 'Almadar UI/Molecules/Flow/EventWireEdge',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Compatible: Story = {
  render: () => {
    const edges: Edge[] = [
      {
        id: 'w1',
        source: 'cart',
        sourceHandle: 'emit-CART_UPDATED',
        target: 'checkout',
        targetHandle: 'listen-CART_UPDATED',
        type: 'eventWireEdge',
        data: { event: 'CART_UPDATED', compatible: true },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#F97316' },
      },
    ];
    return (
      <ReactFlowProvider>
        <div style={{ width: 800, height: 400 }}>
          <ReactFlow
            nodes={twoOrbitals}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
          />
        </div>
      </ReactFlowProvider>
    );
  },
};

export const Incompatible: Story = {
  render: () => {
    const edges: Edge[] = [
      {
        id: 'w1',
        source: 'cart',
        sourceHandle: 'emit-CART_UPDATED',
        target: 'checkout',
        targetHandle: 'listen-CART_UPDATED',
        type: 'eventWireEdge',
        data: { event: 'CART_UPDATED', compatible: false },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#EF4444' },
      },
    ];
    return (
      <ReactFlowProvider>
        <div style={{ width: 800, height: 400 }}>
          <ReactFlow
            nodes={twoOrbitals}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
          />
        </div>
      </ReactFlowProvider>
    );
  },
};
