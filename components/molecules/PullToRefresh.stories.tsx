'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PullToRefresh } from './PullToRefresh';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';

const meta: Meta<typeof PullToRefresh> = {
  title: 'Molecules/PullToRefresh',
  component: PullToRefresh,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    threshold: { control: { type: 'number', min: 30, max: 120, step: 10 } },
    refreshEvent: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems = [
  'Meeting with design team at 10:00',
  'Review pull request #342',
  'Deploy staging build',
  'Update sprint board',
  'Lunch with client',
  'Code review session',
  'Write unit tests for auth module',
  'Standup notes',
];

function SampleList() {
  return (
    <VStack gap="sm" className="p-4">
      <Typography variant="caption" className="text-muted-foreground">
        Pull down to refresh (touch device or mobile emulation)
      </Typography>
      {sampleItems.map((item, index) => (
        <Box
          key={index}
          padding="md"
          rounded="md"
          border
          bg="surface"
        >
          <Typography variant="body">{item}</Typography>
        </Box>
      ))}
    </VStack>
  );
}

export const Default: Story = {
  args: {
    refreshEvent: 'REFRESH_LIST',
    threshold: 60,
  },
  render: (args) => (
    <Box className="max-w-md mx-auto h-96 overflow-auto border border-border rounded-md">
      <PullToRefresh {...args}>
        <SampleList />
      </PullToRefresh>
    </Box>
  ),
};

export const Refreshing: Story = {
  args: {
    refreshEvent: 'REFRESH_DATA',
    threshold: 60,
  },
  render: (args) => (
    <Box className="max-w-md mx-auto h-96 overflow-auto border border-border rounded-md">
      <PullToRefresh {...args}>
        <VStack gap="sm" className="p-4">
          <Typography variant="caption" className="text-muted-foreground">
            Pull down on a touch device to see the spinner appear
          </Typography>
          {sampleItems.slice(0, 4).map((item, index) => (
            <Box
              key={index}
              padding="md"
              rounded="md"
              border
              bg="surface"
            >
              <Typography variant="body">{item}</Typography>
            </Box>
          ))}
        </VStack>
      </PullToRefresh>
    </Box>
  ),
};
