import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { Box, Typography, VStack, HStack, Badge } from '../components';
import { useDraggable } from './useDraggable';
import { useDropZone } from './useDropZone';
import type { DraggablePayload } from './useDraggable';

/**
 * DnD Hooks Demo
 *
 * Demonstrates useDraggable and useDropZone working together.
 * Drag pattern tiles from the source panel onto the drop zone.
 */

function DragDropDemo(): React.ReactElement {
  const [dropped, setDropped] = useState<Array<{ kind: string; type: string }>>([]);

  const buttonDrag = useDraggable({
    payload: { kind: 'pattern', data: { type: 'button' } },
  });
  const cardDrag = useDraggable({
    payload: { kind: 'pattern', data: { type: 'card' } },
  });
  const stackDrag = useDraggable({
    payload: { kind: 'pattern', data: { type: 'stack' } },
  });
  const behaviorDrag = useDraggable({
    payload: { kind: 'behavior', data: { type: 'std-cart', name: 'Cart' } },
  });

  const patternZone = useDropZone({
    accepts: ['pattern'],
    onDrop: (payload: DraggablePayload) => {
      setDropped(prev => [...prev, { kind: payload.kind, type: payload.data.type as string }]);
    },
  });

  const anyZone = useDropZone({
    accepts: ['pattern', 'behavior'],
    onDrop: (payload: DraggablePayload) => {
      setDropped(prev => [...prev, { kind: payload.kind, type: (payload.data.type ?? payload.data.name) as string }]);
    },
  });

  return (
    <HStack gap="lg" className="p-4">
      {/* Drag sources */}
      <VStack gap="sm" className="w-48">
        <Typography variant="small" className="font-semibold">Drag Sources</Typography>
        <Box {...buttonDrag.dragProps} className={`p-3 border rounded cursor-grab ${buttonDrag.isDragging ? 'opacity-50' : ''}`}>
          <Typography variant="small">Button (pattern)</Typography>
        </Box>
        <Box {...cardDrag.dragProps} className={`p-3 border rounded cursor-grab ${cardDrag.isDragging ? 'opacity-50' : ''}`}>
          <Typography variant="small">Card (pattern)</Typography>
        </Box>
        <Box {...stackDrag.dragProps} className={`p-3 border rounded cursor-grab ${stackDrag.isDragging ? 'opacity-50' : ''}`}>
          <Typography variant="small">Stack (pattern)</Typography>
        </Box>
        <Box {...behaviorDrag.dragProps} className={`p-3 border rounded cursor-grab ${behaviorDrag.isDragging ? 'opacity-50' : ''}`}>
          <Typography variant="small">Cart (behavior)</Typography>
        </Box>
      </VStack>

      {/* Drop zones */}
      <VStack gap="sm" className="flex-1">
        <Typography variant="small" className="font-semibold">Drop Zones</Typography>
        <Box
          {...patternZone.dropProps}
          className={`p-6 border-2 border-dashed rounded min-h-[120px] ${patternZone.isOver ? 'border-primary bg-primary/5' : 'border-border'}`}
        >
          <Typography variant="small" color="muted">Patterns only</Typography>
        </Box>
        <Box
          {...anyZone.dropProps}
          className={`p-6 border-2 border-dashed rounded min-h-[120px] ${anyZone.isOver ? 'border-primary bg-primary/5' : 'border-border'}`}
        >
          <Typography variant="small" color="muted">Patterns + Behaviors</Typography>
        </Box>

        {/* Log */}
        {dropped.length > 0 && (
          <VStack gap="xs">
            <Typography variant="small" className="font-semibold">Dropped:</Typography>
            {dropped.map((item, i) => (
              <HStack key={i} gap="xs" className="items-center">
                <Badge variant={item.kind === 'pattern' ? 'default' : 'neutral'}>
                  <Typography variant="caption" className="text-inherit">{item.kind}</Typography>
                </Badge>
                <Typography variant="small">{item.type}</Typography>
              </HStack>
            ))}
          </VStack>
        )}
      </VStack>
    </HStack>
  );
}

const meta: Meta = {
  title: 'Hooks/DragAndDrop',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

export const DragAndDropDemo: Story = {
  render: () => <DragDropDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates useDraggable (drag sources) and useDropZone (drop targets) working together. Drag pattern tiles from left to drop zones on right. The "Patterns only" zone rejects behavior drops.',
      },
    },
  },
};
