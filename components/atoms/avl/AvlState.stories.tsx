import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlState } from './AvlState';

const svgDecorator = (Story: React.ComponentType) => (
  <svg viewBox="0 0 200 200" width={200} height={200} xmlns="http://www.w3.org/2000/svg">
    <Story />
  </svg>
);

const meta: Meta<typeof AvlState> = {
  title: 'Avl/Atoms/AvlState',
  component: AvlState,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  decorators: [svgDecorator],
  argTypes: {
    x: { control: 'number' },
    y: { control: 'number' },
    name: { control: 'text' },
    isInitial: { control: 'boolean' },
    isTerminal: { control: 'boolean' },
    width: { control: 'number' },
    height: { control: 'number' },
    color: { control: 'color' },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { x: 50, y: 80, name: 'Idle' },
};

export const Initial: Story = {
  args: { x: 50, y: 80, name: 'Idle', isInitial: true },
};

export const Terminal: Story = {
  args: { x: 50, y: 80, name: 'Done', isTerminal: true },
};

export const Named: Story = {
  args: { x: 50, y: 80, name: 'Loading', width: 120 },
};

// ─── V2 Role-Based Color Variants ────────────────────────

export const InitialV2: Story = {
  args: { x: 50, y: 80, name: 'Idle', isInitial: true, role: 'initial' },
};

export const TerminalV2: Story = {
  args: { x: 50, y: 80, name: 'Done', isTerminal: true, role: 'terminal' },
};

export const HubV2: Story = {
  args: { x: 30, y: 80, name: 'HasItems', role: 'hub', transitionCount: 6 },
};

export const ErrorV2: Story = {
  args: { x: 50, y: 80, name: 'ErrorState', role: 'error' },
};

export const AllRoles: Story = {
  decorators: [
    (Story: React.ComponentType) => (
      <svg viewBox="0 0 500 100" width={500} height={100} xmlns="http://www.w3.org/2000/svg">
        <Story />
      </svg>
    ),
  ],
  render: () => (
    <g>
      <AvlState x={10} y={30} name="Idle" isInitial role="initial" />
      <AvlState x={130} y={30} name="Loading" role="default" />
      <AvlState x={250} y={30} name="Active" role="hub" transitionCount={5} />
      <AvlState x={380} y={30} name="Done" isTerminal role="terminal" />
    </g>
  ),
};
