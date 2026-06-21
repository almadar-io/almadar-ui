 
/**
 * SequencerBoard Organism
 *
 * Contains ALL game logic for the Sequencer tier (ages 5-8).
 * Manages the action sequence, validates it, and animates Kekec
 * executing each step on the puzzle scene.
 *
 * Feedback-first UX:
 * - On failure: slots stay in place, each slot gets a green or red
 *   ring showing exactly which steps are correct and which need to change.
 * - Modifying a slot clears its individual feedback so the kid can re-try.
 * - After 3 failures a persistent hint appears above the sequence bar.
 * - "Reset" clears everything including attempts / hint.
 *
 * TraitStateViewer states use indexed labels ("1. Walk", "2. Jump") so that
 * repeated actions are correctly highlighted during playback.
 *
 * @packageDocumentation
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { EventEmit, EntityRow } from '@almadar/core';
import { VStack, HStack, Box, Typography, Button } from '../../../../core/atoms';
import { cn } from '../../../../../lib/cn';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { useTranslate } from '../../../../../hooks/useTranslate';
import { TraitStateViewer } from '../../TraitStateViewer';
import type { TraitStateMachineDefinition } from '../../TraitStateViewer';
import type { SlotItemData } from '../../TraitSlot';
import type { DisplayStateProps } from '../../../../core/organisms/types';
import { boardEntity, str, num } from '../../boardEntity';
import { SequenceBar } from './SequenceBar';
import { ActionPalette } from './ActionPalette';

// =============================================================================
// Types
// =============================================================================

export interface SequencerBoardProps extends DisplayStateProps {
    /** Puzzle board-state entity (single row or array). The board reads
     *  `availableActions` / `maxSlots` / `solutions` etc. off the row.
     *  `availableActions` carries `SlotItemData[]` (a UI drag-DTO, not entity
     *  data — it holds a non-FieldValue `stateMachine` member). */
    entity?: EntityRow | readonly EntityRow[];
    /** Category → color mapping */
    categoryColors?: Record<string, { bg: string; border: string }>;
    /** Playback speed in ms per step */
    stepDurationMs?: number;
    /** Emits UI:{playEvent} with { sequence: string[] } */
    playEvent?: EventEmit<{ sequence: string[] }>;
    /** Emits UI:{completeEvent} with { success: boolean } */
    completeEvent?: EventEmit<{ success: boolean; sequence: string[] }>;
    /** Emits UI:{placeEvent} with { slotIndex, actionId } when an action is dropped into a slot */
    placeEvent?: EventEmit<{ slotIndex: number; actionId: string }>;
    /** Emits UI:{removeEvent} with { slotIndex } when an action is removed from a slot */
    removeEvent?: EventEmit<{ slotIndex: number }>;
    /** Emits UI:{checkEvent} with { sequence } when the player submits the sequence */
    checkEvent?: EventEmit<{ sequence: string[] }>;
    /** Emits UI:{playAgainEvent} with {} on reset */
    playAgainEvent?: EventEmit<Record<string, never>>;
}

type PlayState = 'idle' | 'playing' | 'success';

/** Encouraging messages shown on failure, cycled through */
const ENCOURAGEMENT_KEYS = [
    'puzzle.tryAgain1',
    'puzzle.tryAgain2',
    'puzzle.tryAgain3',
];

/** Build a unique step label so indexOf() always finds the right step */
const stepLabel = (slot: SlotItemData | undefined, i: number): string =>
    slot ? `${i + 1}. ${slot.name}` : `Step ${i + 1}`;

// =============================================================================
// Helpers
// =============================================================================

/**
 * Returns per-slot feedback by comparing playerSeq against the best-matching
 * solution (the one with the most positionally-correct slots).
 */
function computeSlotFeedback(
    playerSeq: Array<string | undefined>,
    solutions: string[][],
): Array<'correct' | 'wrong'> {
    let bestSolution = solutions[0];
    let bestMatches = -1;
    for (const sol of solutions) {
        const matches = sol.filter((id, i) => id === playerSeq[i]).length;
        if (matches > bestMatches) {
            bestMatches = matches;
            bestSolution = sol;
        }
    }
    return playerSeq.map((id, i) =>
        id !== undefined && id === bestSolution[i] ? 'correct' : 'wrong',
    );
}

// =============================================================================
// Component
// =============================================================================

export function SequencerBoard({
    entity,
    categoryColors,
    stepDurationMs = 1000,
    playEvent,
    completeEvent,
    placeEvent,
    removeEvent,
    checkEvent,
    playAgainEvent,
    className,
}: SequencerBoardProps): React.JSX.Element | null {
    const { emit } = useEventBus();
    const { t } = useTranslate();
    const resolved = boardEntity(entity);
    const maxSlots = num(resolved?.maxSlots);
    const solutions = (Array.isArray(resolved?.solutions) ? resolved.solutions : []) as string[][];
    const availableActions = (Array.isArray(resolved?.availableActions) ? resolved.availableActions : []) as SlotItemData[];
    const allowDuplicates = resolved?.allowDuplicates !== false;
    const [headerError, setHeaderError] = useState(false);
    const [slots, setSlots] = useState<Array<SlotItemData | undefined>>(
        () => Array.from({ length: maxSlots }, () => undefined),
    );
    const [playState, setPlayState] = useState<PlayState>('idle');
    const [currentStep, setCurrentStep] = useState(-1);
    const [attempts, setAttempts] = useState(0);
    /** Per-slot green/red rings after a failed attempt. Cleared per-slot when modified. */
    const [slotFeedback, setSlotFeedback] = useState<Array<'correct' | 'wrong' | null>>(
        () => Array.from({ length: maxSlots }, () => null),
    );
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    // -- Slot handlers --------------------------------------------------------

    const handleSlotDrop = useCallback((index: number, item: SlotItemData) => {
        setSlots(prev => {
            const next = [...prev];
            next[index] = item;
            return next;
        });
        // Clear feedback only for the modified slot so correct slots stay green
        setSlotFeedback(prev => {
            const next = [...prev];
            next[index] = null;
            return next;
        });
        emit('UI:PLAY_SOUND', { key: 'drop_slot' });
        if (placeEvent) emit(`UI:${placeEvent}`, { slotIndex: index, actionId: item.id });
    }, [emit, placeEvent]);

    const handleSlotRemove = useCallback((index: number) => {
        setSlots(prev => {
            const next = [...prev];
            next[index] = undefined;
            return next;
        });
        setSlotFeedback(prev => {
            const next = [...prev];
            next[index] = null;
            return next;
        });
        emit('UI:PLAY_SOUND', { key: 'back' });
        if (removeEvent) emit(`UI:${removeEvent}`, { slotIndex: index });
    }, [emit, removeEvent]);

    // -- Reset ----------------------------------------------------------------

    const handleReset = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setSlots(Array.from({ length: maxSlots }, () => undefined));
        setPlayState('idle');
        setCurrentStep(-1);
        setAttempts(0);
        setSlotFeedback(Array.from({ length: maxSlots }, () => null));
        if (playAgainEvent) emit(`UI:${playAgainEvent}`, {});
    }, [maxSlots, playAgainEvent, emit]);

    // -- Playback -------------------------------------------------------------

    const filledSlots = slots.filter((s): s is SlotItemData => !!s);
    const canPlay = filledSlots.length > 0 && playState === 'idle';

    const handlePlay = useCallback(() => {
        if (!canPlay) return;

        // Clear any previous feedback before re-running
        setSlotFeedback(Array.from({ length: maxSlots }, () => null));
        emit('UI:PLAY_SOUND', { key: 'confirm' });

        const sequence = slots.map(s => s?.id || '');

        if (playEvent) {
            emit(`UI:${playEvent}`, { sequence });
        }

        setPlayState('playing');
        setCurrentStep(0);

        let step = 0;
        const advance = () => {
            step++;
            if (step >= maxSlots) {
                const playerSeq = slots.map(s => s?.id);
                const playerIds = slots.filter(Boolean).map(s => s?.id || '');
                const success = solutions.some(sol =>
                    sol.length === playerIds.length &&
                    sol.every((id, i) => id === playerIds[i]),
                );

                if (checkEvent) emit(`UI:${checkEvent}`, { sequence: playerIds });
                if (success) {
                    setPlayState('success');
                    setCurrentStep(-1);
                    emit('UI:PLAY_SOUND', { key: 'levelComplete' });
                    if (completeEvent) {
                        emit(`UI:${completeEvent}`, { success: true, sequence: playerIds });
                    }
                } else {
                    // Failure: compute per-slot feedback, stay in 'idle'
                    // so the kid can see the highlights and adjust immediately
                    setAttempts(prev => prev + 1);
                    const feedback = computeSlotFeedback(playerSeq, solutions);
                    setSlotFeedback(feedback);
                    setPlayState('idle');
                    setCurrentStep(-1);
                    emit('UI:PLAY_SOUND', { key: 'fail' });
                    // Chime for each correct slot
                    const correctCount = feedback.filter(f => f === 'correct').length;
                    for (let ci = 0; ci < correctCount; ci++) {
                        setTimeout(() => { emit('UI:PLAY_SOUND', { key: 'correctSlot' }); }, 300 + ci * 150);
                    }
                }
            } else {
                setCurrentStep(step);
                timerRef.current = setTimeout(advance, stepDurationMs);
            }
        };
        timerRef.current = setTimeout(advance, stepDurationMs);
    }, [canPlay, slots, maxSlots, solutions, stepDurationMs, playEvent, completeEvent, checkEvent, emit]);

    // -- TraitStateViewer definition ------------------------------------------
    //
    // Use indexed labels ("1. Walk", "2. Jump") so that LinearView's indexOf()
    // correctly highlights the active step even when the same action repeats.

    const machine: TraitStateMachineDefinition = {
        name: str(resolved?.title),
        description: str(resolved?.description),
        states: slots.map((s, i) => stepLabel(s, i)),
        currentState: currentStep >= 0
            ? stepLabel(slots[currentStep], currentStep)
            : '__idle__',
        transitions: slots.slice(0, -1).map((s, i) => ({
            from: stepLabel(s, i),
            to: stepLabel(slots[i + 1], i + 1),
            event: 'NEXT',
        })),
    };

    // -- Derived display state ------------------------------------------------

    const usedIds = !allowDuplicates
        ? slots.filter(Boolean).map(s => s?.id || '')
        : [];

    const hint = str(resolved?.hint);
    const showHint = attempts >= 3 && !!hint;
    const hasFeedback = slotFeedback.some(f => f !== null);
    const correctCount = slotFeedback.filter(f => f === 'correct').length;
    const encourageKey = ENCOURAGEMENT_KEYS[Math.min(attempts - 1, ENCOURAGEMENT_KEYS.length - 1)] ?? ENCOURAGEMENT_KEYS[0];

    if (!resolved) return null;

    const theme = (resolved.theme ?? undefined) as { background?: string; accentColor?: string } | undefined;
    const themeBackground = theme?.background;
    const headerImage = str(resolved.headerImage);

    return (
        <VStack
            className={cn('p-4 gap-6', className)}
            style={{
                backgroundImage: themeBackground ? `url(${themeBackground})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Header image */}
            {headerImage && !headerError ? (
                <Box className="w-full h-32 overflow-hidden rounded-container">
                    <img src={headerImage} alt="" onError={() => setHeaderError(true)} className="w-full h-full object-cover" />
                </Box>
            ) : headerImage && headerError ? (
                <Box className="w-full h-32 rounded-container bg-gradient-to-br from-muted to-accent opacity-60" />
            ) : null}

            {/* Title + description */}
            <VStack gap="xs">
                <Typography variant="h4" className="text-foreground">
                    {str(resolved.title)}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                    {str(resolved.description)}
                </Typography>
            </VStack>

            {/* Persistent hint after 3 failures */}
            {showHint && (
                <Box className="p-3 rounded-container bg-accent/10 border border-accent/30">
                    <HStack className="items-start" gap="xs">
                        <Typography variant="body2" className="text-accent font-bold shrink-0">
                            {'\uD83D\uDCA1 ' + t('game.hint') + ':'}
                        </Typography>
                        <Typography variant="body2" className="text-foreground">
                            {hint}
                        </Typography>
                    </HStack>
                </Box>
            )}

            {/* Linear state viewer — shows sequence progress during playback */}
            {filledSlots.length > 0 && (
                <TraitStateViewer trait={machine} variant="linear" size="md" />
            )}

            {/* Sequence bar with per-slot feedback rings */}
            <VStack gap="xs">
                <HStack className="items-center justify-between">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                        {t('sequencer.yourSequence') + ':'}
                    </Typography>
                    {/* Score summary after a failed attempt */}
                    {hasFeedback && playState === 'idle' && (
                        <Typography variant="caption" className="text-muted-foreground">
                            {`${correctCount}/${maxSlots} `}
                            {'\u2705'}
                        </Typography>
                    )}
                </HStack>
                <SequenceBar
                    slots={slots}
                    maxSlots={maxSlots}
                    onSlotDrop={handleSlotDrop}
                    onSlotRemove={handleSlotRemove}
                    playing={playState === 'playing'}
                    currentStep={currentStep}
                    categoryColors={categoryColors}
                    slotFeedback={slotFeedback}
                    size="lg"
                />
            </VStack>

            {/* Action palette — always visible when not playing */}
            {playState !== 'playing' && (
                <ActionPalette
                    actions={availableActions}
                    usedActionIds={usedIds}
                    allowDuplicates={allowDuplicates}
                    categoryColors={categoryColors}
                    label={t('sequencer.dragActions')}
                />
            )}

            {/* Encouraging message after failure — stays until next attempt */}
            {hasFeedback && playState === 'idle' && attempts > 0 && (
                <Box className="p-3 rounded-container bg-warning/10 border border-warning/30 text-center">
                    <Typography variant="body2" className="text-foreground">
                        {t(encourageKey)}
                    </Typography>
                </Box>
            )}

            {/* Success message */}
            {playState === 'success' && (
                <Box className="p-4 rounded-container bg-success/20 border border-success text-center">
                    <Typography variant="h5" className="text-success">
                        {str(resolved.successMessage) || t('sequencer.levelComplete')}
                    </Typography>
                </Box>
            )}

            {/* Controls */}
            <HStack gap="sm">
                <Button
                    variant="primary"
                    onClick={handlePlay}
                    disabled={!canPlay}
                >
                    {'\u25B6 ' + t('game.play')}
                </Button>
                <Button variant="ghost" onClick={handleReset}>
                    {'\u21BA ' + t('game.reset')}
                </Button>
            </HStack>
        </VStack>
    );
}

SequencerBoard.displayName = 'SequencerBoard';

export default SequencerBoard;
