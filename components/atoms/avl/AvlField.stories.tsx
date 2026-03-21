import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlField } from './AvlField';

const svgDecorator = (Story: React.ComponentType) => (
  <svg viewBox="0 0 200 200" width={200} height={200} xmlns="http://www.w3.org/2000/svg">
    <Story />
  </svg>
);

const meta: Meta<typeof AvlField> = {
  title: 'Avl/Atoms/AvlField',
  component: AvlField,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  decorators: [svgDecorator],
  argTypes: {
    x: { control: 'number' },
    y: { control: 'number' },
    angle: { control: { type: 'range', min: 0, max: 6.28, step: 0.1 } },
    length: { control: { type: 'range', min: 10, max: 100 } },
    required: { control: 'boolean' },
    label: { control: 'text' },
    color: { control: 'color' },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { x: 100, y: 100, angle: 0, length: 40 },
};

export const Optional: Story = {
  args: { x: 100, y: 100, angle: Math.PI / 4, length: 40, required: false },
};

export const Labeled: Story = {
  args: { x: 100, y: 100, angle: 0, length: 40, label: 'name' },
};
