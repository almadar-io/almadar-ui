import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlEvent } from './AvlEvent';

const svgDecorator = (Story: React.ComponentType) => (
  <svg viewBox="0 0 200 200" width={200} height={200} xmlns="http://www.w3.org/2000/svg">
    <Story />
  </svg>
);

const meta: Meta<typeof AvlEvent> = {
  title: 'Avl/Atoms/AvlEvent',
  component: AvlEvent,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  decorators: [svgDecorator],
  argTypes: {
    x: { control: 'number' },
    y: { control: 'number' },
    size: { control: 'number' },
    label: { control: 'text' },
    color: { control: 'color' },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { x: 100, y: 100, size: 20 },
};

export const Small: Story = {
  args: { x: 100, y: 100, size: 12 },
};

export const Labeled: Story = {
  args: { x: 100, y: 100, size: 20, label: 'CLICK' },
};
