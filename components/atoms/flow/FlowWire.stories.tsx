import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { FlowWire } from './FlowWire';

/**
 * FlowWire stories render inside a small SVG viewport so the path is visible.
 */
const SvgDecorator = (Story: React.FC) =>
  React.createElement('svg', { width: 300, height: 120, viewBox: '0 0 300 120' }, React.createElement(Story));

const CURVE = 'M 20 60 C 100 10, 200 110, 280 60';

const meta: Meta<typeof FlowWire> = {
  title: 'Almadar UI/Atoms/Flow/FlowWire',
  component: FlowWire,
  decorators: [SvgDecorator],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    wireType: { control: 'select', options: ['transition', 'event', 'data', 'guard'] },
    status: { control: 'select', options: ['valid', 'invalid', 'pending'] },
    animated: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Transition: Story = {
  args: { wireType: 'transition', d: CURVE },
};

export const EventWire: Story = {
  args: { wireType: 'event', d: CURVE },
};

export const DataWire: Story = {
  args: { wireType: 'data', d: CURVE },
};

export const InvalidWire: Story = {
  args: { wireType: 'transition', status: 'invalid', d: CURVE },
};

export const PendingAnimated: Story = {
  args: { wireType: 'guard', status: 'pending', animated: true, d: CURVE },
};
