'use client';
/**
 * DocSidebar Molecule Component
 *
 * A documentation navigation sidebar with collapsible category sections.
 * Composes from Box, VStack, HStack, Typography, and Icon atoms.
 */

import React, { useState } from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';
import { VStack } from '../atoms/Stack';
import { HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';

export interface DocSidebarItem {
  /** Display label */
  label: string;
  /** Navigation href */
  href?: string;
  /** Nested child items (makes this a collapsible category) */
  items?: DocSidebarItem[];
  /** Whether this item is currently active */
  active?: boolean;
}

export interface DocSidebarProps {
  /** Sidebar navigation items */
  items: DocSidebarItem[];
  /** Additional CSS classes */
  className?: string;
}

interface DocSidebarCategoryProps {
  item: DocSidebarItem;
  depth: number;
}

const DocSidebarCategory: React.FC<DocSidebarCategoryProps> = ({ item, depth }) => {
  const [expanded, setExpanded] = useState(
    () => item.items?.some(function hasActive(child: DocSidebarItem): boolean {
      if (child.active) return true;
      return child.items?.some(hasActive) ?? false;
    }) ?? false
  );

  if (item.items && item.items.length > 0) {
    return (
      <VStack gap="none">
        <HStack
          gap="sm"
          align="center"
          className={cn(
            'cursor-pointer select-none rounded-[var(--radius-sm)] px-2 py-1.5',
            'hover:bg-[var(--color-muted)]',
            depth > 0 && 'pl-4',
          )}
          onClick={() => setExpanded((prev) => !prev)}
          role="button"
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setExpanded((prev) => !prev);
            }
          }}
        >
          <Icon
            name={expanded ? 'chevron-down' : 'chevron-right'}
            size="xs"
            className="text-[var(--color-muted-foreground)] shrink-0"
          />
          <Typography
            variant="caption"
            className="text-xs uppercase tracking-wider text-[var(--color-muted-foreground)] font-semibold"
            as="span"
          >
            {item.label}
          </Typography>
        </HStack>

        {expanded && (
          <VStack gap="none" className="pl-4">
            {item.items.map((child, idx) => (
              <DocSidebarCategory key={idx} item={child} depth={depth + 1} />
            ))}
          </VStack>
        )}
      </VStack>
    );
  }

  return (
    <Box
      className={cn(
        'block rounded-[var(--radius-sm)] px-3 py-1.5 text-sm transition-colors no-underline cursor-pointer',
        'hover:bg-[var(--color-muted)]',
        depth > 0 && 'ml-2',
        item.active
          ? 'bg-[var(--color-primary)]/8 text-[var(--color-primary)] font-semibold'
          : 'text-[var(--color-muted-foreground)]',
      )}
      onClick={() => { if (item.href) window.location.href = item.href; }}
      role="link"
      tabIndex={0}
    >
      <Typography
        variant="body2"
        className={cn(
          item.active
            ? 'text-[var(--color-primary)] font-semibold'
            : 'text-[var(--color-muted-foreground)]',
        )}
        as="span"
      >
        {item.label}
      </Typography>
    </Box>
  );
};

export const DocSidebar: React.FC<DocSidebarProps> = ({
  items,
  className,
}) => {
  return (
    <Box
      className={cn('w-full', className)}
      role="navigation"
      aria-label="Documentation sidebar"
    >
      <VStack gap="xs">
        {items.map((item, idx) => (
          <DocSidebarCategory key={idx} item={item} depth={0} />
        ))}
      </VStack>
    </Box>
  );
};

DocSidebar.displayName = 'DocSidebar';
