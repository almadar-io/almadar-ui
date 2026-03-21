import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlApplication } from './AvlApplication';

const svgDecorator = (Story: React.ComponentType) => (
  <svg viewBox="0 0 300 200" width={300} height={200} xmlns="http://www.w3.org/2000/svg">
    <Story />
  </svg>
);

const meta: Meta<typeof AvlApplication> = {
  title: 'Avl/Atoms/AvlApplication',
  component: AvlApplication,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  decorators: [svgDecorator],
  argTypes: {
    x: { control: 'number' },
    y: { control: 'number' },
    width: { control: 'number' },
    height: { control: 'number' },
    label: { control: 'text' },
    color: { control: 'color' },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { x: 10, y: 10, width: 280, height: 180 },
};

export const Labeled: Story = {
  args: { x: 10, y: 10, width: 280, height: 180, label: 'MyApp' },
};
