'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { EntityRow } from '@almadar/core';
import { SortableList } from './SortableList';
import { HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Box } from '../atoms/Box';
import { Icon } from '../atoms/Icon';

// Story-local demo shape. The component consumes the canonical
// `readonly EntityRow[]`; a `type` alias carries an implicit index signature
// so this sample data stays assignable to EntityRow.
type TaskItem = {
  id: string;
  title: string;
  icon: string;
};

const sampleItems: TaskItem[] = [
  { id: '1', title: 'Core/Molecules/SortableList', icon: 'file-text' },
  { id: '2', title: 'Update API documentation', icon: 'book' },
  { id: '3', title: 'Fix navigation bug', icon: 'bug' },
  { id: '4', title: 'Deploy staging build', icon: 'rocket' },
  { id: '5', title: 'Write unit tests', icon: 'test-tube' },
];

function renderTaskItem(item: EntityRow, index: number) {
  return (
    <HStack
      align="center"
      gap="sm"
      className="py-3 px-2 border-b border-border"
    >
      <Icon name={item.icon as string} size="sm" />
      <Typography variant="body2">
        {index + 1}. {item.title as string}
      </Typography>
    </HStack>
  );
}

const meta: Meta = {
  title: 'Core/Molecules/SortableList',
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box className="w-96" border rounded="md">
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <SortableList
      items={sampleItems}
      renderItem={renderTaskItem}
      reorderEvent="REORDER_TASKS"
    />
  ),
};

export const Interactive: Story = {
  render: () => (
    <Box>
      <Box padding="sm" bg="muted">
        <Typography variant="caption" color="muted">
          Drag the grip handles to reorder. Check the browser console for reorder events.
        </Typography>
      </Box>
      <SortableList
        items={sampleItems}
        renderItem={renderTaskItem}
        reorderEvent="REORDER_TASKS"
        reorderPayload={{ listId: 'main-tasks' }}
      />
    </Box>
  ),
};

export const RightHandle: Story = {
  render: () => (
    <SortableList
      items={sampleItems}
      renderItem={renderTaskItem}
      reorderEvent="REORDER_TASKS"
      dragHandlePosition="right"
    />
  ),
};
