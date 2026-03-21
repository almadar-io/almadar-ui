import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlBindingRef } from './AvlBindingRef';

const svgDecorator = (Story: React.ComponentType) => (
  <svg viewBox="0 0 200 200" width={200} height={200} xmlns="http://www.w3.org/2000/svg">
    <Story />
  </svg>
);

const meta: Meta<typeof AvlBindingRef> = {
  title: 'Avl/Atoms/AvlBindingRef',
  component: AvlBindingRef,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  decorators: [svgDecorator],
  argTypes: {
    x: { control: 'number' },
    y: { control: 'number' },
    path: { control: 'text' },
    size: { control: { type: 'range', min: 6, max: 30 } },
    color: { control: 'color' },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { x: 100, y: 100, path: 'state' },
};

export const EntityPath: Story = {
  args: { x: 100, y: 100, path: 'entity.name', size: 16 },
};
