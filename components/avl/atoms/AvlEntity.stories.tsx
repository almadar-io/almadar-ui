import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlEntity } from './AvlEntity';

const svgDecorator = (Story: React.ComponentType) => (
  <svg viewBox="0 0 200 200" width={200} height={200} xmlns="http://www.w3.org/2000/svg">
    <Story />
  </svg>
);

const meta: Meta<typeof AvlEntity> = {
  title: 'Avl/Atoms/AvlEntity',
  component: AvlEntity,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  decorators: [svgDecorator],
  argTypes: {
    x: { control: 'number' },
    y: { control: 'number' },
    r: { control: 'number' },
    fieldCount: { control: { type: 'range', min: 0, max: 20, step: 1 } },
    persistence: {
      control: 'select',
      options: ['persistent', 'runtime', 'singleton', 'instance'],
    },
    label: { control: 'text' },
    color: { control: 'color' },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { x: 100, y: 100, label: 'Todo' },
};

export const WithFields: Story = {
  args: { x: 100, y: 100, fieldCount: 6, label: 'User' },
};

export const Runtime: Story = {
  args: { x: 100, y: 100, fieldCount: 4, persistence: 'runtime', label: 'Session' },
};

export const Singleton: Story = {
  args: { x: 100, y: 100, fieldCount: 3, persistence: 'singleton', label: 'Config' },
};
