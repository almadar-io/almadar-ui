'use client';

/**
 * VisualNovelBoard
 *
 * Dialogue-scene game board: walks a dialogue graph node-by-node, rendering each
 * node's scene background + character portrait + speaker text + branching choices.
 * Composes the extended `DialogueBox` molecule; resolves every asset key against
 * the `assetManifest` prop (organism owns asset choice — no hardcoded URLs).
 */

import React, { useMemo, useCallback } from 'react';
import type { Asset, EventEmit, EntityRow } from '@almadar/core';
import { cn } from '../../../../lib/cn';
import { useEventBus } from '../../../../hooks/useEventBus';
import { Box } from '../../../core/atoms/Box';
import { Typography } from '../../../core/atoms/Typography';
import { VStack } from '../../../core/atoms/Stack';
import { Button } from '../../../core/atoms/Button';
import type { DisplayStateProps } from '../../../core/organisms/types';
import { DialogueBox, type DialogueChoice } from '../molecules/DialogueBox';
import { boardEntity, num, str, rows } from '../../shared/boardEntity';

// =============================================================================
// Types
// =============================================================================

/** Manifest of per-key scene + portrait maps (UI value DTO). */
type VisualNovelAssetManifest = {
    backgrounds?: Record<string, Asset>;
    portraits?: Record<string, Asset>;
};

export interface VisualNovelChoice {
    label: string;
    nextId: string;
}

export interface VisualNovelNode {
    id: string;
    speaker: string;
    text: string;
    backgroundKey?: string;
    portraitKey?: string;
    choices?: VisualNovelChoice[];
}

export interface VisualNovelBoardProps extends DisplayStateProps {
    entity?: EntityRow | readonly EntityRow[];
    /** Full dialogue graph. */
    nodes?: VisualNovelNode[];
    /** Id of the node currently displayed. */
    currentNodeId?: string;
    /** Asset base-url + scene/portrait sprite maps (organism owns asset choice). */
    assetManifest?: VisualNovelAssetManifest;
    /** Typewriter speed in ms per character (0 = instant). */
    typewriterSpeed?: number;
    /** Portrait draw-size multiplier. */
    portraitScale?: number;
    chooseEvent?: EventEmit<{ choiceIndex: number }>;
    advanceEvent?: EventEmit<Record<string, never>>;
    restartEvent?: EventEmit<Record<string, never>>;
    className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

const DEFAULT_NODES: VisualNovelNode[] = [
    {
        id: 'start',
        speaker: 'Narrator',
        text: 'The corridor stretches into shadow. A lone sentinel blocks your path.',
        backgroundKey: 'corridor',
        portraitKey: 'guide',
        choices: [
            { label: 'Approach the sentinel.', nextId: 'meet' },
            { label: 'Turn back.', nextId: 'retreat' },
        ],
    },
    {
        id: 'meet',
        speaker: 'Sentinel',
        text: 'You carry the old marks. Speak your purpose, traveler.',
        backgroundKey: 'forge',
        portraitKey: 'rival',
        choices: [
            { label: 'I seek the core.', nextId: 'end' },
            { label: 'I am only passing through.', nextId: 'retreat' },
        ],
    },
    {
        id: 'retreat',
        speaker: 'Narrator',
        text: 'You withdraw into the dark. The path will wait for braver feet.',
        backgroundKey: 'corridor',
        choices: [{ label: 'Begin again.', nextId: 'start' }],
    },
    {
        id: 'end',
        speaker: 'Sentinel',
        text: 'Then the way is open. Walk it well.',
        backgroundKey: 'core',
        portraitKey: 'rival',
        choices: [{ label: 'Begin again.', nextId: 'start' }],
    },
];

// =============================================================================
// Component
// =============================================================================

export function VisualNovelBoard({
    entity,
    nodes: propNodes,
    currentNodeId: propCurrentNodeId,
    assetManifest: propAssetManifest,
    typewriterSpeed = 30,
    portraitScale = 1,
    chooseEvent,
    advanceEvent,
    restartEvent,
    className,
}: VisualNovelBoardProps): React.JSX.Element {
    const board = boardEntity(entity) ?? {};
    const eventBus = useEventBus();

    const assetManifest =
        propAssetManifest ?? (board.assetManifest as VisualNovelAssetManifest | undefined);

    const entityNodes: VisualNovelNode[] = useMemo(
        () =>
            rows(board.nodes).map(r => ({
                id: str(r.id),
                speaker: str(r.speaker),
                text: str(r.text),
                backgroundKey: r.backgroundKey == null ? undefined : str(r.backgroundKey),
                portraitKey: r.portraitKey == null ? undefined : str(r.portraitKey),
                choices: rows(r.choices).map(c => ({
                    label: str(c.label),
                    nextId: str(c.nextId),
                })),
            })),
        [board.nodes],
    );
    const rawNodes = propNodes ?? entityNodes;
    const nodes: VisualNovelNode[] = rawNodes.length > 0 ? rawNodes : DEFAULT_NODES;

    const currentNodeId = propCurrentNodeId ?? (str(board.currentNodeId) || nodes[0]?.id);
    const currentNode = nodes.find(n => n.id === currentNodeId) ?? nodes[0];

    const backgroundImage = useMemo(
        () => assetManifest?.backgrounds?.[currentNode?.backgroundKey ?? ''],
        [assetManifest, currentNode?.backgroundKey],
    );
    const portraitUrl = useMemo(
        () => assetManifest?.portraits?.[currentNode?.portraitKey ?? ''],
        [assetManifest, currentNode?.portraitKey],
    );

    const dialogueChoices: DialogueChoice[] = useMemo(
        () => (currentNode?.choices ?? []).map(c => ({ text: c.label, next: c.nextId })),
        [currentNode?.choices],
    );

    const handleChoice = useCallback(
        (choice: DialogueChoice) => {
            const index = dialogueChoices.findIndex(c => c.next === choice.next && c.text === choice.text);
            if (chooseEvent) {
                eventBus.emit(`UI:${chooseEvent}`, { choiceIndex: index });
            }
        },
        [dialogueChoices, chooseEvent, eventBus],
    );

    const handleAdvance = useCallback(() => {
        if (advanceEvent) {
            eventBus.emit(`UI:${advanceEvent}`, {});
        }
    }, [advanceEvent, eventBus]);

    const handleRestart = useCallback(() => {
        if (restartEvent) {
            eventBus.emit(`UI:${restartEvent}`, {});
        }
    }, [restartEvent, eventBus]);

    if (!currentNode) {
        return (
            <VStack className={cn('visual-novel-board relative min-h-[600px] bg-background items-center justify-center', className)} gap="lg">
                <Typography variant="h3" color="muted">No dialogue nodes</Typography>
                <Button variant="primary" onClick={handleRestart}>Restart</Button>
            </VStack>
        );
    }

    return (
        <Box className={cn('visual-novel-board relative min-h-[600px] bg-background overflow-hidden', className)}>
            <DialogueBox
                dialogue={{
                    speaker: currentNode.speaker,
                    text: currentNode.text,
                    choices: dialogueChoices,
                }}
                typewriterSpeed={typewriterSpeed}
                position="bottom"
                backgroundImage={backgroundImage}
                portraitUrl={portraitUrl}
                portraitScale={portraitScale}
                onChoice={handleChoice}
                onAdvance={handleAdvance}
            />
        </Box>
    );
}

VisualNovelBoard.displayName = 'VisualNovelBoard';

export default VisualNovelBoard;
