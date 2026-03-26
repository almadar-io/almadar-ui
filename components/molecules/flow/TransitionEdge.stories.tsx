import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReactFlow, ReactFlowProvider, type Node, type Edge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TransitionEdge } from './TransitionEdge';
import { StateNode } from './StateNode';

const nodeTypes = { stateNode: StateNode };
const edgeTypes = { transitionEdge: TransitionEdge };

const baseNodes: Node[] = [
  { id: 'a', type: 'stateNode', position: { x: 80, y: 40 }, data: { name: 'Idle', isInitial: true } },
  { id: 'b', type: 'stateNode', position: { x: 350, y: 40 }, data: { name: 'Loading' } },
  { id: 'c', type: 'stateNode', position: { x: 350, y: 220 }, data: { name: 'Done', isTerminal: true } },
];

const meta: Meta = {
  title: 'Almadar UI/Molecules/Flow/TransitionEdge',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const edges: Edge[] = [
      {
        id: 'e1',
        source: 'a',
        target: 'b',
        type: 'transitionEdge',
        data: { event: 'SUBMIT' },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ];
    return (
      <ReactFlowProvider>
        <div style={{ width: 700, height: 350 }}>
          <ReactFlow nodes={baseNodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView />
        </div>
      </ReactFlowProvider>
    );
  },
};

export const WithGuard: Story = {
  render: () => {
    const edges: Edge[] = [
      {
        id: 'e1',
        source: 'a',
        target: 'b',
        type: 'transitionEdge',
        data: { event: 'SUBMIT', hasGuard: true },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ];
    return (
      <ReactFlowProvider>
        <div style={{ width: 700, height: 350 }}>
          <ReactFlow nodes={baseNodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView />
        </div>
      </ReactFlowProvider>
    );
  },
};

export const WithEffects: Story = {
  render: () => {
    const edges: Edge[] = [
      {
        id: 'e1',
        source: 'a',
        target: 'b',
        type: 'transitionEdge',
        data: { event: 'SUBMIT', hasEffects: true },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ];
    return (
      <ReactFlowProvider>
        <div style={{ width: 700, height: 350 }}>
          <ReactFlow nodes={baseNodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView />
        </div>
      </ReactFlowProvider>
    );
  },
};

export const FullGraph: Story = {
  render: () => {
    const edges: Edge[] = [
      {
        id: 'e1',
        source: 'a',
        target: 'b',
        type: 'transitionEdge',
        data: { event: 'SUBMIT', hasGuard: true, hasEffects: true },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: 'e2',
        source: 'b',
        target: 'c',
        type: 'transitionEdge',
        data: { event: 'SUCCESS', hasEffects: true },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: 'e3',
        source: 'b',
        target: 'a',
        type: 'transitionEdge',
        data: { event: 'RETRY' },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ];
    return (
      <ReactFlowProvider>
        <div style={{ width: 700, height: 400 }}>
          <ReactFlow nodes={baseNodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView />
        </div>
      </ReactFlowProvider>
    );
  },
};
