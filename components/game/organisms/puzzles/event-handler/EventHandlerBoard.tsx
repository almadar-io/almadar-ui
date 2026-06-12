 
/**
 * EventHandlerBoard Organism
 *
 * Contains ALL game logic for the Event Handler tier (ages 9-12).
 * Kids click on world objects, set WHEN/THEN rules, and watch
 * event chains cascade during playback.
 *
 * Encourages experimentation: on failure, resets to editing so the kid
 * can try different rules. After 3 failures, shows a progressive hint.
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
import type { DisplayStateProps } from '../../../../core/organisms/types';
import { ObjectRulePanel } from './ObjectRulePanel';
import { EventLog, type EventLogEntry } from './EventLog';
import type { RuleDefinition } from './RuleEditor';
import {
    objId,
    objName,
    objIcon,
    objStates,
    objCurrentState,
    objRules,
} from './puzzleObject';
import { boardEntity, str, rows } from '../../boardEntity';

// =============================================================================
// Types
// =============================================================================

export interface EventHandlerBoardProps extends DisplayStateProps {
    /** Puzzle board-state entity (single row or array). The board reads
     *  `objects` / `triggerEvents` / `goalEvent` etc. off the row; the editable
     *  puzzle objects are themselves `EntityRow`s carried under `objects`. */
    entity?: EntityRow | readonly EntityRow[];
    /** Playback speed in ms per event */
    stepDurationMs?: number;
    /** Emits UI:{playEvent} */
    playEvent?: EventEmit<Record<string, never>>;
    /** Emits UI:{completeEvent} with { success } */
    completeEvent?: EventEmit<{ success: boolean }>;
}

type PlayState = 'editing' | 'playing' | 'success' | 'fail';

const ENCOURAGEMENT_KEYS = [
    'puzzle.tryAgain1',
    'puzzle.tryAgain2',
    'puzzle.tryAgain3',
];

// =============================================================================
// Component
// =============================================================================

export function EventHandlerBoard({
    entity,
    stepDurationMs = 800,
    playEvent,
    completeEvent,
    className,
}: EventHandlerBoardProps): React.JSX.Element | null {
    const { emit } = useEventBus();
    const { t } = useTranslate();
    const resolved = boardEntity(entity);
    const entityObjects = rows(resolved?.objects);
    const [objects, setObjects] = useState<EntityRow[]>(() => [...entityObjects]);
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(
        entityObjects[0] ? objId(entityObjects[0]) : null,
    );
    const [headerError, setHeaderError] = useState(false);
    const [playState, setPlayState] = useState<PlayState>('editing');
    const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
    const [attempts, setAttempts] = useState(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const logIdCounter = useRef(0);

    useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    const selectedObject = objects.find(o => objId(o) === selectedObjectId) || null;

    // -- Rule changes ---------------------------------------------------------

    const handleRulesChange = useCallback((objectId: string, rules: RuleDefinition[]) => {
        setObjects(prev => prev.map(o =>
            objId(o) === objectId ? { ...o, rules } : o,
        ));
    }, []);

    // -- Add log entry --------------------------------------------------------

    const addLogEntry = useCallback((icon: string, message: string, status: EventLogEntry['status'] = 'done') => {
        const id = `log-${logIdCounter.current++}`;
        setEventLog(prev => [...prev, { id, timestamp: Date.now(), icon, message, status }]);
    }, []);

    // -- Playback: simulate event chain ---------------------------------------

    const handlePlay = useCallback(() => {
        if (playState !== 'editing') return;
        if (playEvent) emit(`UI:${playEvent}`, {});

        setPlayState('playing');
        setEventLog([]);

        const allRules: Array<{ object: EntityRow; rule: RuleDefinition }> = [];
        objects.forEach(obj => {
            objRules(obj).forEach(rule => {
                allRules.push({ object: obj, rule });
            });
        });

        const triggers = (Array.isArray(resolved?.triggerEvents) ? resolved.triggerEvents : []) as string[];
        const goalEvent = str(resolved?.goalEvent);
        const eventQueue = [...triggers];
        const firedEvents = new Set<string>();
        let stepIdx = 0;
        let goalReached = false;

        const processNext = () => {
            if (eventQueue.length === 0 || stepIdx > 20) {
                if (goalReached) {
                    setPlayState('success');
                    if (completeEvent) {
                        emit(`UI:${completeEvent}`, { success: true });
                    }
                } else {
                    setAttempts(prev => prev + 1);
                    setPlayState('fail');
                    // Do NOT emit PUZZLE_COMPLETE on failure — kid keeps trying
                }
                return;
            }

            const currentEvent = eventQueue.shift()!;
            if (firedEvents.has(currentEvent)) {
                timerRef.current = setTimeout(processNext, 100);
                return;
            }
            firedEvents.add(currentEvent);

            const matching = allRules.filter(r => r.rule.whenEvent === currentEvent);

            if (matching.length === 0) {
                addLogEntry('\u26A1', t('eventHandler.noListeners', { event: currentEvent }), 'done');
            } else {
                matching.forEach(({ object, rule }) => {
                    addLogEntry(objIcon(object), t('eventHandler.heardEvent', { object: objName(object), event: currentEvent, action: rule.thenAction }), 'done');
                    eventQueue.push(rule.thenAction);
                    if (rule.thenAction === goalEvent) {
                        goalReached = true;
                    }
                });
            }

            if (currentEvent === goalEvent) {
                goalReached = true;
            }

            stepIdx++;
            timerRef.current = setTimeout(processNext, stepDurationMs);
        };

        if (triggers.length > 0) {
            addLogEntry('\uD83C\uDFAC', t('eventHandler.simulationStarted', { events: triggers.join(', ') }), 'active');
        }
        timerRef.current = setTimeout(processNext, stepDurationMs);
    }, [playState, objects, resolved, stepDurationMs, playEvent, completeEvent, emit, addLogEntry, t]);

    const handleTryAgain = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        // Keep the rules the kid set — just reset play state so they can tweak
        setPlayState('editing');
        setEventLog([]);
    }, []);

    const handleReset = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        const resetObjects = rows(resolved?.objects);
        setObjects([...resetObjects]);
        setPlayState('editing');
        setEventLog([]);
        setSelectedObjectId(resetObjects[0] ? objId(resetObjects[0]) : null);
        setAttempts(0);
    }, [resolved?.objects]);

    if (!resolved) return null;

    // -- Build compact viewers ------------------------------------------------

    const objectViewers = objects.map(obj => {
        const states = objStates(obj);
        const currentState = objCurrentState(obj);
        const machine: TraitStateMachineDefinition = {
            name: objName(obj),
            states,
            currentState,
            transitions: objRules(obj).map(r => ({
                from: currentState,
                to: states.find(s => s !== currentState) || currentState,
                event: r.whenEvent,
            })),
        };
        return { obj, machine };
    });

    const hint = str(resolved.hint);
    const showHint = attempts >= 3 && hint;
    const theme = (resolved.theme ?? undefined) as { background?: string; accentColor?: string } | undefined;
    const themeBackground = theme?.background;
    const headerImage = str(resolved.headerImage);
    const encourageKey = ENCOURAGEMENT_KEYS[Math.min(attempts - 1, ENCOURAGEMENT_KEYS.length - 1)] ?? ENCOURAGEMENT_KEYS[0];

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

            {/* Title + goal */}
            <VStack gap="xs">
                <Typography variant="h4" className="text-foreground">
                    {str(resolved.title)}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                    {str(resolved.description)}
                </Typography>
                <HStack className="items-center p-2 rounded bg-primary/10 border border-primary/30" gap="xs">
                    <Typography variant="caption" className="text-primary font-bold">
                        {t('game.goal') + ':'}
                    </Typography>
                    <Typography variant="caption" className="text-foreground">
                        {str(resolved.goalCondition)}
                    </Typography>
                </HStack>
            </VStack>

            {/* Object selectors + compact viewers */}
            <VStack gap="sm">
                <Typography variant="body2" className="text-muted-foreground font-medium">
                    {t('eventHandler.clickObject') + ':'}
                </Typography>
                <HStack className="flex-wrap" gap="sm">
                    {objectViewers.map(({ obj, machine }) => {
                        const oid = objId(obj);
                        return (
                        <Box
                            key={oid}
                            className={cn(
                                'p-3 rounded-container border-2 cursor-pointer transition-all hover:scale-105',
                                selectedObjectId === oid
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border bg-card hover:border-muted-foreground',
                            )}
                            onClick={() => setSelectedObjectId(oid)}
                        >
                            <VStack gap="xs" className="items-center min-w-[120px]">
                                <Typography variant="h5">{objIcon(obj)}</Typography>
                                <Typography variant="body2" className="text-foreground font-medium">
                                    {objName(obj)}
                                </Typography>
                                <TraitStateViewer trait={machine} variant="compact" size="sm" />
                            </VStack>
                        </Box>
                        );
                    })}
                </HStack>
            </VStack>

            {/* Selected object rule panel */}
            {selectedObject && (
                <ObjectRulePanel
                    object={selectedObject}
                    onRulesChange={handleRulesChange}
                    disabled={playState !== 'editing'}
                />
            )}

            {/* Event log during playback */}
            {eventLog.length > 0 && (
                <EventLog entries={eventLog} />
            )}

            {/* Result feedback */}
            {playState === 'success' && (
                <Box className="p-4 rounded-container bg-success/20 border border-success text-center">
                    <Typography variant="h5" className="text-success">
                        {str(resolved.successMessage) || t('eventHandler.chainComplete')}
                    </Typography>
                </Box>
            )}

            {playState === 'fail' && (
                <VStack gap="sm">
                    <Box className="p-4 rounded-container bg-warning/10 border border-warning/30 text-center">
                        <Typography variant="body1" className="text-foreground font-medium">
                            {t(encourageKey)}
                        </Typography>
                    </Box>
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
                </VStack>
            )}

            {/* Controls */}
            <HStack gap="sm">
                {playState === 'fail' ? (
                    <Button variant="primary" onClick={handleTryAgain}>
                        {'\uD83D\uDD04 ' + t('puzzle.tryAgainButton')}
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        onClick={handlePlay}
                        disabled={playState !== 'editing'}
                    >
                        {'\u25B6 ' + t('game.play')}
                    </Button>
                )}
                <Button variant="ghost" onClick={handleReset}>
                    {'\u21BA ' + t('game.reset')}
                </Button>
            </HStack>
        </VStack>
    );
}

EventHandlerBoard.displayName = 'EventHandlerBoard';

export default EventHandlerBoard;
