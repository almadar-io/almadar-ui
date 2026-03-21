import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlOperator } from './AvlOperator';
import type { AvlOperatorNamespace } from './types';

const svgDecorator = (Story: React.ComponentType) => (
  <svg viewBox="0 0 200 200" width={200} height={200} xmlns="http://www.w3.org/2000/svg">
    <Story />
  </svg>
);

const meta: Meta<typeof AvlOperator> = {
  title: 'Avl/Atoms/AvlOperator',
  component: AvlOperator,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  decorators: [svgDecorator],
  argTypes: {
    x: { control: 'number' },
    y: { control: 'number' },
    name: { control: 'text' },
    namespace: {
      control: 'select',
      options: ['arithmetic', 'comparison', 'logic', 'string', 'collection', 'time', 'control', 'async'],
    },
    size: { control: { type: 'range', min: 8, max: 30 } },
    color: { control: 'color' },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Arithmetic: Story = {
  args: { x: 100, y: 100, name: '+', namespace: 'arithmetic' },
};

export const Comparison: Story = {
  args: { x: 100, y: 100, name: '>', namespace: 'comparison' },
};

export const Logic: Story = {
  args: { x: 100, y: 100, name: 'and', namespace: 'logic' },
};

const allOperators: [string, AvlOperatorNamespace][] = [
  ['+', 'arithmetic'],
  ['>', 'comparison'],
  ['and', 'logic'],
  ['concat', 'string'],
  ['map', 'collection'],
  ['now', 'time'],
  ['if', 'control'],
  ['await', 'async'],
];

export const AllNamespaces: Story = {
  render: () => (
    <svg viewBox="0 0 220 120" width={220} height={120} xmlns="http://www.w3.org/2000/svg">
      {allOperators.map(([name, ns], i) => (
        <AvlOperator
          key={ns}
          x={30 + (i % 4) * 50}
          y={30 + Math.floor(i / 4) * 50}
          name={name}
          namespace={ns}
        />
      ))}
    </svg>
  ),
};
