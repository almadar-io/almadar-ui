'use client';

/**
 * AvlExplain — the hover/focus explanation every AVL mark shares: the built-in
 * description in a tooltip, or, when the author annotated the mark, a popover
 * with the note above the built-in description.
 */

import React from 'react';
import { Tooltip } from '../../core/molecules/Tooltip';
import { Popover } from '../../core/molecules/Popover';
import { Box } from '../../core/atoms/Box';
import { VStack } from '../../core/atoms/Stack';
import { Typography } from '../../core/atoms/Typography';
import type { AvlNote } from '../../../lib/avl-annotations';

export interface AvlExplainProps {
  /** Built-in lines (name first). */
  lines: readonly string[];
  /** Author note; when present the explanation opens as a popover. */
  note?: AvlNote;
  children: React.ReactElement;
}

export const AvlExplain: React.FC<AvlExplainProps> = ({ lines, note, children }) => {
  if (note !== undefined) {
    return (
      <Popover
        trigger="hover"
        position="top"
        content={
          <VStack gap="xs" className="max-w-xs">
            {note.title ? <Typography variant="small" weight="semibold">{note.title}</Typography> : null}
            <Typography variant="small">{note.body}</Typography>
            <Box className="border-t border-border pt-1">
              {lines.map((line, i) => (
                <Typography key={i} variant="caption" color={i === 0 ? 'inherit' : 'muted'} weight={i === 0 ? 'semibold' : 'normal'}>{line}</Typography>
              ))}
            </Box>
          </VStack>
        }
      >
        {children}
      </Popover>
    );
  }
  if (lines.length === 0) return children;
  return (
    <Tooltip
      position="top"
      content={
        <VStack gap="none">
          {lines.map((line, i) => (
            <Box key={i} as="span" className={i === 0 ? 'font-semibold' : 'opacity-80'}>{line}</Box>
          ))}
        </VStack>
      }
    >
      {children}
    </Tooltip>
  );
};

AvlExplain.displayName = 'AvlExplain';
