'use client';
/**
 * NodePalette Component
 *
 * Draggable node type sidebar for a flow editor. Renders categories of
 * tiles that can be dragged onto a React Flow canvas. Each tile sets
 * `application/reactflow` data on the drag transfer so the canvas
 * `onDrop` handler knows which node type to create.
 *
 * This is a pure HTML component with no React Flow imports.
 */
import React, { useCallback } from 'react';
import { cn } from '../../../lib/cn';
import { Box } from '../../atoms/Box';
import { Typography } from '../../atoms/Typography';
import { VStack } from '../../atoms/Stack';
import { Icon } from '../../atoms/Icon';

export interface NodePaletteItem {
  /** Node type identifier set on the drag transfer. */
  type: string;
  /** Human-readable label shown on the tile. */
  label: string;
  /** Lucide icon name for the tile. */
  icon: string;
}

export interface NodePaletteCategory {
  /** Category heading. */
  name: string;
  /** Draggable items in this category. */
  items: NodePaletteItem[];
}

export interface NodePaletteProps {
  /** Grouped node types available for dragging. */
  categories: NodePaletteCategory[];
  /** Additional CSS classes on the outer container. */
  className?: string;
}

/**
 * Sidebar palette of draggable node tiles grouped by category.
 * Drag a tile onto a ReactFlow canvas to create that node type.
 */
export const NodePalette: React.FC<NodePaletteProps> = ({
  categories,
  className,
}) => {
  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
      event.dataTransfer.setData('application/reactflow', nodeType);
      event.dataTransfer.effectAllowed = 'move';
    },
    [],
  );

  return (
    <VStack gap="md" className={cn('p-3 select-none', className)}>
      {categories.map((cat) => (
        <VStack key={cat.name} gap="xs">
          <Typography
            variant="caption"
            className="font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {cat.name}
          </Typography>

          <Box className="grid grid-cols-2 gap-1.5">
            {cat.items.map((item) => (
              <Box
                key={item.type}
                draggable
                onDragStart={(e: React.DragEvent<HTMLDivElement>) =>
                  handleDragStart(e, item.type)
                }
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-md cursor-grab',
                  'border border-border bg-card hover:bg-accent/50',
                  'transition-colors duration-100',
                  'active:cursor-grabbing',
                )}
              >
                <Icon name={item.icon} size="sm" />
                <Typography variant="caption" className="text-center leading-tight">
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </VStack>
      ))}
    </VStack>
  );
};

NodePalette.displayName = 'NodePalette';
