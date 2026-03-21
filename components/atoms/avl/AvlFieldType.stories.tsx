import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlFieldType } from './AvlFieldType';
import type { AvlFieldTypeKind } from './types';

const svgDecorator = (Story: React.ComponentType) => (
  <svg viewBox="0 0 200 200" width={200} height={200} xmlns="http://www.w3.org/2000/svg">
    <Story />
  </svg>
);

const meta: Meta<typeof AvlFieldType> = {
  title: 'Avl/Atoms/AvlFieldType',
  component: AvlFieldType,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  decorators: [svgDecorator],
  argTypes: {
    x: { control: 'number' },
    y: { control: 'number' },
    kind: {
      control: 'select',
      options: ['string', 'number', 'boolean', 'date', 'enum', 'object', 'array'],
    },
    size: { control: { type: 'range', min: 3, max: 20 } },
    label: { control: 'text' },
    color: { control: 'color' },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const StringType: Story = {
  args: { x: 100, y: 100, kind: 'string', size: 8, label: 'string' },
};

export const NumberType: Story = {
  args: { x: 100, y: 100, kind: 'number', size: 8, label: 'number' },
};

export const BooleanType: Story = {
  args: { x: 100, y: 100, kind: 'boolean', size: 8, label: 'boolean' },
};

const allTypes: AvlFieldTypeKind[] = ['string', 'number', 'boolean', 'date', 'enum', 'object', 'array'];

export const AllTypes: Story = {
  render: () => (
    <svg viewBox="0 0 250 60" width={250} height={60} xmlns="http://www.w3.org/2000/svg">
      {allTypes.map((kind, i) => (
        <AvlFieldType key={kind} x={34 + i * 26} y={20} kind={kind} size={8} label={kind} />
      ))}
    </svg>
  ),
};
