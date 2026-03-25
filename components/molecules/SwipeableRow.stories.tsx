'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SwipeableRow } from './SwipeableRow';
import { HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Box } from '../atoms/Box';
import { Icon } from '../atoms/Icon';

const meta: Meta<typeof SwipeableRow> = {
  title: 'Molecules/SwipeableRow',
  component: SwipeableRow,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    threshold: { control: { type: 'number', min: 40, max: 200 } },
  },
  decorators: [
    (Story) => (
      <Box className="w-96">
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    rightActions: [
      {
        label: 'Delete',
        icon: 'trash',
        variant: 'danger',
        event: 'DELETE_ITEM',
        eventPayload: { id: '1' },
      },
    ],
    itemData: { id: '1', title: 'Shopping list item' },
    children: (
      <HStack
        align="center"
        gap="sm"
        className="p-4 border-b border-border"
      >
        <Icon name="shopping-cart" size="md" />
        <Typography variant="body1">
          Swipe me left to reveal delete
        </Typography>
      </HStack>
    ),
  },
};

export const BothSides: Story = {
  args: {
    leftActions: [
      {
        label: 'Pin',
        icon: 'pin',
        variant: 'primary',
        event: 'PIN_ITEM',
        eventPayload: { id: '2' },
      },
    ],
    rightActions: [
      {
        label: 'Delete',
        icon: 'trash',
        variant: 'danger',
        event: 'DELETE_ITEM',
        eventPayload: { id: '2' },
      },
      {
        label: 'Archive',
        icon: 'archive',
        variant: 'secondary',
        event: 'ARCHIVE_ITEM',
        eventPayload: { id: '2' },
      },
    ],
    itemData: { id: '2', title: 'Email subject line' },
    children: (
      <HStack
        align="center"
        gap="sm"
        className="p-4 border-b border-border"
      >
        <Icon name="mail" size="md" />
        <Box className="flex-1 min-w-0">
          <Typography variant="body1" truncate>
            Swipe right to pin, left to delete or archive
          </Typography>
          <Typography variant="caption" color="muted">
            Both directions have actions
          </Typography>
        </Box>
      </HStack>
    ),
  },
};

function InteractiveDemo() {
  const items = [
    { id: '1', title: 'Buy groceries', icon: 'shopping-cart' },
    { id: '2', title: 'Schedule meeting', icon: 'calendar' },
    { id: '3', title: 'Review pull request', icon: 'git-pull-request' },
  ];

  return (
    <Box border rounded="md" className="overflow-hidden">
      {items.map((item) => (
        <SwipeableRow
          key={item.id}
          rightActions={[
            {
              label: 'Delete',
              icon: 'trash',
              variant: 'danger',
              event: 'DELETE_ITEM',
              eventPayload: { id: item.id },
            },
          ]}
          leftActions={[
            {
              label: 'Done',
              icon: 'check',
              variant: 'primary',
              event: 'COMPLETE_ITEM',
              eventPayload: { id: item.id },
            },
          ]}
          itemData={{ id: item.id, title: item.title }}
        >
          <HStack
            align="center"
            gap="sm"
            className="p-4 border-b border-border"
          >
            <Icon name={item.icon} size="md" />
            <Typography variant="body1">{item.title}</Typography>
          </HStack>
        </SwipeableRow>
      ))}
    </Box>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};
