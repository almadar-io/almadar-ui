import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { RichBlockEditor, type RichBlock } from './RichBlockEditor';
import { VStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Box } from '../atoms/Box';

const meta: Meta<typeof RichBlockEditor> = {
  title: 'Core/Molecules/RichBlockEditor',
  component: RichBlockEditor,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleBlocks: RichBlock[] = [
  {
    id: 'b1',
    type: 'heading-1',
    content: 'Building a block editor',
  },
  {
    id: 'b2',
    type: 'paragraph',
    content:
      'This is a Notion-style block editor scaffold. Each line is a block; the toolbar inserts new blocks of any type at the end.',
  },
  {
    id: 'b3',
    type: 'heading-2',
    content: 'Highlights',
  },
  {
    id: 'b4',
    type: 'bullet-list',
    children: [
      { id: 'li-1', type: 'paragraph', content: 'Per-block hover affordances' },
      { id: 'li-2', type: 'paragraph', content: 'Turn-into menu for type changes' },
      { id: 'li-3', type: 'paragraph', content: 'No heavy editor dependency' },
    ],
  },
  {
    id: 'b5',
    type: 'quote',
    content: 'The simplest possible thing that could work.',
  },
];

export const Empty: Story = {
  args: {},
};

export const WithInitialContent: Story = {
  args: {
    initialBlocks: sampleBlocks,
  },
};

export const ReadOnly: Story = {
  args: {
    initialBlocks: [
      ...sampleBlocks,
      {
        id: 'b6',
        type: 'code',
        content: 'function hello() {\n  return "world";\n}',
        metadata: { language: 'typescript' },
      },
      { id: 'b7', type: 'divider' },
      {
        id: 'b8',
        type: 'image',
        metadata: {
          url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
          caption: 'A workspace photo',
        },
      },
    ],
    readOnly: true,
    showToolbar: false,
  },
};

function InteractiveEditor() {
  const [blocks, setBlocks] = useState<RichBlock[]>([
    {
      id: 'i1',
      type: 'heading-2',
      content: 'Live editor',
    },
    {
      id: 'i2',
      type: 'paragraph',
      content: 'Edits flow back through onChange. Block count and block types are mirrored below.',
    },
    {
      id: 'i3',
      type: 'numbered-list',
      children: [
        { id: 'i3-a', type: 'paragraph', content: 'First step' },
        { id: 'i3-b', type: 'paragraph', content: 'Second step' },
      ],
    },
  ]);

  return (
    <VStack gap="md">
      <RichBlockEditor initialBlocks={blocks} onChange={setBlocks} />
      <Box className="rounded-md border border-border bg-muted/40 p-3">
        <Typography variant="caption" className="text-muted-foreground">
          Block count: {blocks.length} — Types:{' '}
          {blocks.map((b) => b.type).join(', ')}
        </Typography>
      </Box>
    </VStack>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveEditor />,
};
