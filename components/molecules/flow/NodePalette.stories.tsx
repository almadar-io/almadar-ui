import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NodePalette, type NodePaletteCategory } from './NodePalette';

const sampleCategories: NodePaletteCategory[] = [
  {
    name: 'Structure',
    items: [
      { type: 'orbitalNode', label: 'Orbital', icon: 'orbit' },
      { type: 'stateNode', label: 'State', icon: 'circle' },
      { type: 'behaviorNode', label: 'Behavior', icon: 'workflow' },
    ],
  },
  {
    name: 'Logic',
    items: [
      { type: 'exprNode', label: 'Expression', icon: 'code' },
      { type: 'effectNode', label: 'Effect', icon: 'zap' },
    ],
  },
];

const meta: Meta<typeof NodePalette> = {
  title: 'Almadar UI/Molecules/Flow/NodePalette',
  component: NodePalette,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    categories: sampleCategories,
  },
};

export const SingleCategory: Story = {
  args: {
    categories: [
      {
        name: 'Nodes',
        items: [
          { type: 'stateNode', label: 'State', icon: 'circle' },
          { type: 'effectNode', label: 'Effect', icon: 'zap' },
          { type: 'exprNode', label: 'Expr', icon: 'code' },
          { type: 'orbitalNode', label: 'Orbital', icon: 'orbit' },
        ],
      },
    ],
  },
};

export const ManyCategories: Story = {
  args: {
    categories: [
      ...sampleCategories,
      {
        name: 'Data',
        items: [
          { type: 'entityNode', label: 'Entity', icon: 'database' },
          { type: 'fieldNode', label: 'Field', icon: 'columns' },
        ],
      },
      {
        name: 'Events',
        items: [
          { type: 'eventNode', label: 'Event', icon: 'radio' },
          { type: 'guardNode', label: 'Guard', icon: 'shield' },
        ],
      },
    ],
  },
};
