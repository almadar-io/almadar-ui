'use client';

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import type { Asset, EventEmit, EntityRow } from '@almadar/core';
import { cn } from '../../../../lib/cn';
import { useEventBus } from '../../../../hooks/useEventBus';
import { Box } from '../../../core/atoms/Box';
import { Typography } from '../../../core/atoms/Typography';
import { VStack } from '../../../core/atoms/Stack';
import { Button } from '../../../core/atoms/Button';
import type { DisplayStateProps } from '../../../core/organisms/types';
import { DialogueBubble } from '../atoms/DialogueBubble';
import { ChoiceButton } from '../atoms/ChoiceButton';
import { boardEntity, str, rows } from '../../shared/boardEntity';

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
    const portraitAsset = useMemo(
        () => assetManifest?.portraits?.[currentNode?.portraitKey ?? ''],
        [assetManifest, currentNode?.portraitKey],
    );

    // Typewriter state
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const textRef = useRef(currentNode?.text ?? '');
    const charIndexRef = useRef(0);

    useEffect(() => {
        const fullText = currentNode?.text ?? '';
        textRef.current = fullText;
        charIndexRef.current = 0;
        if (typewriterSpeed === 0) {
            setDisplayedText(fullText);
            setIsTyping(false);
        } else {
            setDisplayedText('');
            setIsTyping(true);
        }
    }, [currentNode?.id, typewriterSpeed]);

    useEffect(() => {
        if (!isTyping || typewriterSpeed === 0) return;
        const interval = setInterval(() => {
            if (charIndexRef.current < textRef.current.length) {
                charIndexRef.current++;
                setDisplayedText(textRef.current.slice(0, charIndexRef.current));
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, typewriterSpeed);
        return () => clearInterval(interval);
    }, [isTyping, typewriterSpeed]);

    const skipTypewriter = useCallback(() => {
        if (isTyping) {
            charIndexRef.current = textRef.current.length;
            setDisplayedText(textRef.current);
            setIsTyping(false);
        }
    }, [isTyping]);

    const handleChoice = useCallback(
        (index: number) => {
            if (chooseEvent) {
                eventBus.emit(`UI:${chooseEvent}`, { choiceIndex: index });
            }
        },
        [chooseEvent, eventBus],
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

    const handleContainerClick = useCallback(() => {
        if (isTyping) {
            skipTypewriter();
        } else if (!currentNode?.choices?.length) {
            handleAdvance();
        }
    }, [isTyping, skipTypewriter, currentNode?.choices, handleAdvance]);

    if (!currentNode) {
        return (
            <VStack className={cn('visual-novel-board relative min-h-[600px] bg-background items-center justify-center', className)} gap="lg">
                <Typography variant="h3" color="muted">No dialogue nodes</Typography>
                <Button variant="primary" onClick={handleRestart}>Restart</Button>
            </VStack>
        );
    }

    return (
        <Box
            className={cn('visual-novel-board relative min-h-[600px] bg-background overflow-hidden', className)}
            onClick={handleContainerClick}
        >
            {/* Scene background */}
            {backgroundImage && (
                <div
                    className="absolute inset-0 z-0 bg-center bg-cover bg-no-repeat"
                    style={{ backgroundImage: `url(${backgroundImage.url})` }}
                    aria-hidden="true"
                />
            )}

            {/* Large character portrait */}
            {portraitAsset && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 bottom-0 z-10 pointer-events-none flex items-end"
                    style={{ height: `${60 * portraitScale}vh` }}
                >
                    <img
                        src={portraitAsset.url}
                        alt={currentNode.speaker}
                        className="h-full w-auto object-contain drop-shadow-2xl"
                    />
                </div>
            )}

            {/* Dialogue panel at bottom */}
            <div className="absolute left-0 right-0 bottom-0 z-20 mx-4 mb-4">
                <div className={cn(
                    'rounded-container border-2 overflow-hidden',
                    backgroundImage
                        ? 'bg-black/80 backdrop-blur-sm border-white/20'
                        : 'bg-card/95 border-border',
                )}>
                    <DialogueBubble
                        speaker={currentNode.speaker}
                        text={displayedText + (isTyping ? '▌' : '')}
                        portrait={portraitAsset}
                        position="bottom"
                        className="border-0 rounded-none bg-transparent backdrop-blur-none"
                    />

                    {/* Choices */}
                    {!isTyping && (currentNode.choices?.length ?? 0) > 0 && (
                        <div className="px-4 pb-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                            {currentNode.choices!.map((choice, index) => (
                                <ChoiceButton
                                    key={choice.nextId}
                                    text={choice.label}
                                    index={index + 1}
                                    onClick={() => handleChoice(index)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Continue indicator (no choices) */}
                    {!isTyping && !currentNode.choices?.length && (
                        <div className="px-4 pb-3 text-muted-foreground text-sm animate-pulse">
                            Press click to continue...
                        </div>
                    )}
                </div>
            </div>
        </Box>
    );
}

VisualNovelBoard.displayName = 'VisualNovelBoard';

export default VisualNovelBoard;
