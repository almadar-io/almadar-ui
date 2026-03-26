import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { FlowMinimap, MINIMAP_COLORS } from './FlowMinimap';
import { Typography } from '../Typography';
import { Box } from '../Box';

const meta: Meta<typeof FlowMinimap> = {
  title: 'Almadar UI/Atoms/Flow/FlowMinimap',
  component: FlowMinimap,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyWrapper: Story = {
  args: {
    children: React.createElement(
      Box,
      { className: 'w-48 h-32 flex items-center justify-center' },
      React.createElement(Typography, { variant: 'caption', className: 'text-muted-foreground' }, 'MiniMap placeholder'),
    ),
  },
};

export const WithColorConfig: Story = {
  render: () =>
    React.createElement(
      Box,
      { className: 'space-y-2' },
      React.createElement(
        FlowMinimap,
        { className: 'w-48 h-32' },
        React.createElement(
          Box,
          { className: 'w-full h-full flex items-center justify-center' },
          React.createElement(Typography, { variant: 'caption', className: 'text-muted-foreground' }, 'MiniMap area'),
        ),
      ),
      React.createElement(
        Box,
        { className: 'text-xs space-y-1' },
        React.createElement(Typography, { variant: 'caption' }, `nodeColor: ${MINIMAP_COLORS.nodeColor}`),
        React.createElement(Typography, { variant: 'caption' }, `maskColor: ${MINIMAP_COLORS.maskColor}`),
        React.createElement(Typography, { variant: 'caption' }, `nodeStrokeColor: ${MINIMAP_COLORS.nodeStrokeColor}`),
      ),
    ),
};
