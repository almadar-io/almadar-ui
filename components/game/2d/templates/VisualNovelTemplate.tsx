/**
 * VisualNovelTemplate
 *
 * Thin template wrapper: titled header + VisualNovelBoard.
 * All scene state is driven by the entity/props passed through from the orbital trait.
 */

import React from 'react';
import type { EntityRow, EventEmit } from '@almadar/core';
import { cn } from '../../../../lib/cn';
import { Box } from '../../../core/atoms/Box';
import { HStack } from '../../../core/atoms/Stack';
import { Typography } from '../../../core/atoms/Typography';
import type { TemplateProps } from '../../../core/templates/types';
import { VisualNovelBoard } from '../organisms/VisualNovelBoard';
import type { VisualNovelNode } from '../organisms/VisualNovelBoard';

export interface VisualNovelTemplateProps extends TemplateProps {
    title?: string;
    nodes?: VisualNovelNode[];
    currentNodeId?: string;
    typewriterSpeed?: number;
    portraitScale?: number;
    chooseEvent?: EventEmit<{ choiceIndex: number }>;
    advanceEvent?: EventEmit<Record<string, never>>;
    restartEvent?: EventEmit<Record<string, never>>;
    className?: string;
}

export function VisualNovelTemplate({
    entity,
    title = 'Visual Novel',
    nodes,
    currentNodeId,
    typewriterSpeed,
    portraitScale,
    chooseEvent,
    advanceEvent,
    restartEvent,
    className,
}: VisualNovelTemplateProps): React.JSX.Element {
    const resolved =
        entity && typeof entity === 'object' && !Array.isArray(entity)
            ? (entity as EntityRow)
            : undefined;

    return (
        <Box
            display="flex"
            fullHeight
            className={cn('visual-novel-template flex-col', className)}
        >
            {/* Header */}
            <HStack
                gap="sm"
                align="center"
                className="px-4 py-3 border-b-2 border-border bg-surface shrink-0"
            >
                <Typography variant="h4">{title}</Typography>
            </HStack>

            {/* Board fills remaining space */}
            <Box className="flex-1 relative overflow-hidden">
                <VisualNovelBoard
                    entity={resolved}
                    nodes={nodes}
                    currentNodeId={currentNodeId}
                    typewriterSpeed={typewriterSpeed}
                    portraitScale={portraitScale}
                    chooseEvent={chooseEvent}
                    advanceEvent={advanceEvent}
                    restartEvent={restartEvent}
                    className="h-full"
                />
            </Box>
        </Box>
    );
}

VisualNovelTemplate.displayName = 'VisualNovelTemplate';

export default VisualNovelTemplate;
