import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { FlowNodeShell } from './FlowNodeShell';
import { Typography } from '../Typography';

const meta: Meta<typeof FlowNodeShell> = {
  title: 'Almadar UI/Atoms/Flow/FlowNodeShell',
  component: FlowNodeShell,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    selected: { control: 'boolean' },
    warning: { control: 'boolean' },
    headerColor: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultNode: Story = {
  args: {
    nodeType: 'Entity',
    headerColor: '#3B82F6',
    children: React.createElement(Typography, { variant: 'body2' }, 'User'),
  },
};

export const SelectedNode: Story = {
  args: {
    nodeType: 'Trait',
    headerColor: '#22C55E',
    selected: true,
    children: React.createElement(Typography, { variant: 'body2' }, 'auth-flow'),
  },
};

export const WarningNode: Story = {
  args: {
    nodeType: 'Page',
    headerColor: '#F59E0B',
    warning: true,
    children: React.createElement(Typography, { variant: 'body2' }, '/dashboard (missing guard)'),
  },
};
