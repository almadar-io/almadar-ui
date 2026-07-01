 
/**
 * StateArchitectBoard Organism
 *
 * Contains ALL game logic for the State Architect tier (ages 13+).
 * Kids design state machines via a visual graph editor, then run
 * them to see if the behavior matches the puzzle goal.
 *
 * @packageDocumentation
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { EventEmit, EntityRow, FieldValue } from '@almadar/core';
import { VStack, HStack, Box, Typography, Button } from '../../../core/atoms/index';
import { cn } from '../../../../lib/cn';
import { useEventBus } from '../../../../hooks/useEventBus';
import { useTranslate } from '../../../../hooks/useTranslate';
import { TraitStateViewer } from './TraitStateViewer';
import type { TraitStateMachineDefinition } from './TraitStateViewer';
import type { DisplayStateProps } from '../../../core/organisms/types';
import { StateNode } from './StateNode';
import { TransitionArrow } from './TransitionArrow';
import { VariablePanel } from './VariablePanel';
import { StateJsonView } from './StateJsonView';
import { boardEntity, str, rows } from '../../shared/boardEntity';

// =============================================================================
// Types — UI value DTOs (graph-editor / test descriptors; not entity data)
// =============================================================================

/** A kid-built transition in the visual graph editor (UI value DTO). */
export interface StateArchitectTransition {
    id: string;
    from: string;
    to: string;
    event: string;
    guardHint?: string;
}

/** A puzzle test case (UI value DTO). */
export interface TestCase {
    /** Sequence of events to fire */
    events: string[];
    /** Expected final state */
    expectedState: string;
    /** Description */
    label: string;
}

export interface StateArchitectBoardProps extends DisplayStateProps {
    /** Puzzle board-state entity (single row or array). The board reads
     *  `variables` / `states` / `transitions` / `testCases` etc. off the row. */
    entity?: EntityRow | readonly EntityRow[];
    /** Playback speed */
    stepDurationMs?: number;
    /** Emits UI:{testEvent} */
    testEvent?: EventEmit<Record<string, never>>;
    /** Emits UI:{completeEvent} with { success, passedTests } */
    completeEvent?: EventEmit<{ success: boolean; passedTests: number }>;
    /** Emits UI:{addTransitionEvent} — lolo handles ADD_TRANSITION */
    addTransitionEvent?: EventEmit<{ id: string; from: string; to: string; event: string }>;
    /** Emits UI:{removeTransitionEvent} — lolo handles REMOVE_TRANSITION */
    removeTransitionEvent?: EventEmit<{ id: string }>;
    /** Emits UI:{playAgainEvent} — lolo handles PLAY_AGAIN */
    playAgainEvent?: EventEmit<Record<string, never>>;
}

interface TestResult {
    label: string;
    passed: boolean;
    actualState: string;
    expectedState: string;
}

const ENCOURAGEMENT_KEYS = [
    'puzzle.tryAgain1',
    'puzzle.tryAgain2',
    'puzzle.tryAgain3',
];

// =============================================================================
// Layout helper — position states in a circle
// =============================================================================

function layoutStates(states: string[], width: number, height: number): Record<string, { x: number; y: number }> {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 60;
    const positions: Record<string, { x: number; y: number }> = {};
    states.forEach((state, i) => {
        const angle = (2 * Math.PI * i) / states.length - Math.PI / 2;
        positions[state] = {
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle),
        };
    });
    return positions;
}

// =============================================================================
// Component
// =============================================================================

let nextTransId = 100;

export function StateArchitectBoard({
    entity,
    stepDurationMs = 600,
    testEvent,
    completeEvent,
    addTransitionEvent,
    removeTransitionEvent,
    playAgainEvent,
    className,
}: StateArchitectBoardProps): React.JSX.Element | null {
    const { emit } = useEventBus();
    const { t } = useTranslate();
    const resolved = boardEntity(entity);
    const entityStates = (Array.isArray(resolved?.states) ? resolved.states : []) as string[];
    const initialState = str(resolved?.initialState);
    const entityName = str(resolved?.entityName);
    const availableEvents = (Array.isArray(resolved?.availableEvents) ? resolved.availableEvents : []) as string[];
    const testCases: TestCase[] = (Array.isArray(resolved?.testCases) ? resolved.testCases : []).map((item: FieldValue) => {
        const o: Record<string, FieldValue | undefined> = (typeof item === 'object' && item !== null && !Array.isArray(item)) ? item as Record<string, FieldValue | undefined> : {};
        const eventsField = o['events'];
        return {
            events: Array.isArray(eventsField) ? eventsField as string[] : [],
            expectedState: str(o['expectedState']),
            label: str(o['label']),
        };
    });
    const entityTransitions: StateArchitectTransition[] = (Array.isArray(resolved?.transitions) ? resolved.transitions : []).map((item: FieldValue) => {
        const o: Record<string, FieldValue | undefined> = (typeof item === 'object' && item !== null && !Array.isArray(item)) ? item as Record<string, FieldValue | undefined> : {};
        return {
            id: str(o['id']),
            from: str(o['from']),
            to: str(o['to']),
            event: str(o['event']),
            ...(o['guardHint'] ? { guardHint: str(o['guardHint']) } : {}),
        };
    });
    const entityVariables = rows(resolved?.variables);
    const transitions = entityTransitions;
    const attempts = typeof resolved?.attempts === 'number' ? resolved.attempts : 0;
    const entityResult = str(resolved?.result) || 'none';
    const isSuccess = entityResult === 'win';
    const [isTesting, setIsTesting] = useState(false);
    const [headerError, setHeaderError] = useState(false);
    const [currentState, setCurrentState] = useState(initialState);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [variables, setVariables] = useState<EntityRow[]>(() => [...entityVariables]);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // -- Adding a new transition (simplified UI) ------------------------------
    const [addingFrom, setAddingFrom] = useState<string | null>(null);

    useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    // -- Graph layout ---------------------------------------------------------
    const GRAPH_W = 500;
    const GRAPH_H = 400;
    const positions = useMemo(() => layoutStates(entityStates, GRAPH_W, GRAPH_H), [entityStates]);

    // -- Add transition -------------------------------------------------------

    const handleStateClick = useCallback((state: string) => {
        if (isTesting) return;

        if (addingFrom) {
            // Second click — create transition
            if (addingFrom !== state) {
                const event = availableEvents[0] || 'EVENT';
                const newTrans: StateArchitectTransition = {
                    id: `t-${nextTransId++}`,
                    from: addingFrom,
                    to: state,
                    event,
                };
                if (addTransitionEvent) emit(`UI:${addTransitionEvent}`, { id: newTrans.id, from: newTrans.from, to: newTrans.to, event: newTrans.event });
            }
            setAddingFrom(null);
        } else {
            setSelectedState(state);
        }
    }, [isTesting, addingFrom, availableEvents, addTransitionEvent, emit]);

    const handleStartAddTransition = useCallback(() => {
        if (!selectedState) return;
        setAddingFrom(selectedState);
    }, [selectedState]);

    const handleRemoveTransition = useCallback((transId: string) => {
        if (removeTransitionEvent) emit(`UI:${removeTransitionEvent}`, { id: transId });
    }, [removeTransitionEvent, emit]);

    // -- Build TraitStateMachineDefinition ------------------------------------

    const machine: TraitStateMachineDefinition = useMemo(() => ({
        name: entityName,
        description: str(resolved?.description),
        states: entityStates,
        currentState,
        transitions: transitions.map(t => ({
            from: t.from,
            to: t.to,
            event: t.event,
            guardHint: t.guardHint,
        })),
    }), [entityName, resolved, entityStates, currentState, transitions]);

    // -- Test runner ----------------------------------------------------------

    const handleTest = useCallback(() => {
        if (isTesting) return;
        if (testEvent) emit(`UI:${testEvent}`, {});

        setIsTesting(true);
        setTestResults([]);

        const results: TestResult[] = [];
        let testIdx = 0;

        const runNextTest = () => {
            if (testIdx >= testCases.length) {
                const allPassed = results.every(r => r.passed);
                setIsTesting(false);
                setTestResults(results);
                if (allPassed && completeEvent) {
                    emit(`UI:${completeEvent}`, {
                        success: true,
                        passedTests: results.filter(r => r.passed).length,
                    });
                }
                return;
            }

            const testCase = testCases[testIdx];
            if (!testCase) return;
            let state = initialState;

            for (const event of testCase.events) {
                const trans = transitions.find(t => t.from === state && t.event === event);
                if (trans) {
                    state = trans.to;
                }
            }

            setCurrentState(state);
            results.push({
                label: testCase.label,
                passed: state === testCase.expectedState,
                actualState: state,
                expectedState: testCase.expectedState,
            });

            testIdx++;
            timerRef.current = setTimeout(runNextTest, stepDurationMs);
        };

        timerRef.current = setTimeout(runNextTest, stepDurationMs);
    }, [isTesting, transitions, testCases, initialState, stepDurationMs, testEvent, completeEvent, emit]);

    const handleTryAgain = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsTesting(false);
        setCurrentState(initialState);
        setTestResults([]);
    }, [initialState]);

    const handleReset = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsTesting(false);
        setCurrentState(initialState);
        setTestResults([]);
        setVariables([...entityVariables]);
        setSelectedState(null);
        setAddingFrom(null);
        if (playAgainEvent) emit(`UI:${playAgainEvent}`, {});
    }, [initialState, entityVariables, playAgainEvent, emit]);

    // -- Code view data -------------------------------------------------------

    const codeData = useMemo(() => ({
        name: entityName,
        states: entityStates,
        initialState,
        transitions: transitions.map(t => ({
            from: t.from,
            to: t.to,
            event: t.event,
            ...(t.guardHint ? { guard: t.guardHint } : {}),
        })),
    }), [entityName, entityStates, initialState, transitions]);

    if (!resolved) return null;

    const theme = (resolved.theme ?? undefined) as { background?: string; accentColor?: string } | undefined;
    const themeBackground = theme?.background;
    const headerImage = str(resolved.headerImage);
    const hint = str(resolved.hint);

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

            {/* Title */}
            <VStack gap="xs">
                <Typography variant="h4" className="text-foreground">
                    {str(resolved.title)}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                    {str(resolved.description)}
                </Typography>
                <HStack className="items-center p-2 rounded bg-warning/10 border border-warning/30" gap="xs">
                    <Typography variant="caption" className="text-warning font-bold">
                        {t('game.hint') + ':'}
                    </Typography>
                    <Typography variant="caption" className="text-foreground">
                        {hint}
                    </Typography>
                </HStack>
            </VStack>

            <HStack className="flex-wrap items-start" gap="lg">
                {/* Graph editor */}
                <VStack gap="sm" className="flex-1 min-w-[300px]">
                    <HStack className="items-center justify-between">
                        <Typography variant="body2" className="text-muted-foreground font-medium">
                            {t('stateArchitect.graph')}
                        </Typography>
                        {addingFrom && (
                            <Typography variant="caption" className="text-accent animate-pulse">
                                {t('stateArchitect.clickTarget', { state: addingFrom || '' })}
                            </Typography>
                        )}
                    </HStack>
                    <Box
                        position="relative"
                        className="rounded-container border border-border bg-background overflow-hidden"
                        style={{ width: GRAPH_W, height: GRAPH_H }}
                    >
                        {/* SVG arrows */}
                        <svg
                            width={GRAPH_W}
                            height={GRAPH_H}
                            className="absolute inset-0"
                            style={{ pointerEvents: 'none' }}
                        >
                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-border)" />
                                </marker>
                                <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-primary)" />
                                </marker>
                            </defs>
                            {transitions.map(t => {
                                const fromPos = positions[t.from];
                                const toPos = positions[t.to];
                                if (!fromPos || !toPos) return null;
                                const isActive = t.from === currentState;
                                return (
                                    <TransitionArrow
                                        key={t.id}
                                        from={fromPos}
                                        to={toPos}
                                        eventLabel={t.event}
                                        guardHint={t.guardHint}
                                        isActive={isActive}
                                    />
                                );
                            })}
                        </svg>

                        {/* State nodes */}
                        {entityStates.map(state => (
                            <StateNode
                                key={state}
                                name={state}
                                position={positions[state]}
                                isCurrent={state === currentState}
                                isSelected={state === selectedState}
                                isInitial={state === initialState}
                                onClick={() => handleStateClick(state)}
                            />
                        ))}
                    </Box>

                    {/* Graph controls */}
                    {!isTesting && (
                        <HStack gap="sm">
                            <Button
                                variant="ghost"
                                onClick={handleStartAddTransition}
                                disabled={!selectedState}
                            >
                                {selectedState ? t('stateArchitect.addTransition', { state: selectedState }) : t('stateArchitect.addTransitionPrompt')}
                            </Button>
                        </HStack>
                    )}

                    {/* Transition list */}
                    {transitions.length > 0 && (
                        <VStack gap="xs" className="p-3 rounded-container bg-muted/50 border border-border">
                            <Typography variant="caption" className="text-muted-foreground font-medium">
                                {t('stateArchitect.transitions', { count: transitions.length }) + ':'}
                            </Typography>
                            {transitions.map(t => (
                                <HStack key={t.id} className="items-center text-xs" gap="xs">
                                    <Typography variant="caption" className="text-foreground">
                                        {t.from}
                                    </Typography>
                                    <Typography variant="caption" className="text-muted-foreground">
                                        {'\u2014['}
                                    </Typography>
                                    <Typography variant="caption" className="text-accent font-medium">
                                        {t.event}
                                    </Typography>
                                    <Typography variant="caption" className="text-muted-foreground">
                                        {']\u2192'}
                                    </Typography>
                                    <Typography variant="caption" className="text-success">
                                        {t.to}
                                    </Typography>
                                    {t.guardHint && (
                                        <Typography variant="caption" className="text-warning">
                                            ({t.guardHint})
                                        </Typography>
                                    )}
                                    {!isTesting && (
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleRemoveTransition(t.id)}
                                            className="text-xs ml-auto"
                                        >
                                            {'\u00D7'}
                                        </Button>
                                    )}
                                </HStack>
                            ))}
                        </VStack>
                    )}
                </VStack>

                {/* Side panel */}
                <VStack gap="sm" className="w-[280px] shrink-0">
                    {/* Full state viewer */}
                    <TraitStateViewer trait={machine} variant="full" size="sm" />

                    {/* Variables */}
                    <VariablePanel
                        entityName={entityName}
                        variables={variables}
                    />

                    {/* Test results */}
                    {testResults.length > 0 && (
                        <VStack className="p-3 rounded-container bg-card border border-border" gap="xs">
                            <Typography variant="body2" className="text-muted-foreground font-medium">
                                {t('stateArchitect.testResults') + ':'}
                            </Typography>
                            {testResults.map((r, i) => (
                                <HStack key={i} className="items-center text-xs" gap="xs">
                                    <Typography variant="caption" className={r.passed ? 'text-success' : 'text-error'}>
                                        {r.passed ? '\u2714' : '\u2717'}
                                    </Typography>
                                    <Typography variant="caption" className="text-foreground flex-1">
                                        {r.label}
                                    </Typography>
                                    {!r.passed && (
                                        <Typography variant="caption" className="text-error">
                                            {t('stateArchitect.gotState', { state: r.actualState })}
                                        </Typography>
                                    )}
                                </HStack>
                            ))}
                        </VStack>
                    )}

                    {/* Code view */}
                    {resolved.showCodeView !== false && (
                        <StateJsonView data={codeData} label="View Code" />
                    )}
                </VStack>
            </HStack>

            {/* Result feedback */}
            {isSuccess && (
                <Box className="p-4 rounded-container bg-success/20 border border-success text-center">
                    <Typography variant="h5" className="text-success">
                        {str(resolved.successMessage) || t('stateArchitect.allPassed')}
                    </Typography>
                </Box>
            )}
            {!isTesting && !isSuccess && testResults.some(r => !r.passed) && (
                <VStack gap="sm">
                    <Box className="p-4 rounded-container bg-warning/10 border border-warning/30 text-center">
                        <Typography variant="body1" className="text-foreground font-medium">
                            {t(ENCOURAGEMENT_KEYS[Math.min(attempts - 1, ENCOURAGEMENT_KEYS.length - 1)] ?? ENCOURAGEMENT_KEYS[0])}
                        </Typography>
                    </Box>
                    {!isSuccess && attempts >= 2 && Boolean(str(resolved?.hint)) && (
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
                {!isTesting && !isSuccess && testResults.some(r => !r.passed) ? (
                    <Button variant="primary" onClick={handleTryAgain}>
                        {'\uD83D\uDD04 ' + t('puzzle.tryAgainButton')}
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        onClick={handleTest}
                        disabled={isTesting}
                    >
                        {'\u25B6 ' + t('game.runTests')}
                    </Button>
                )}
                <Button variant="ghost" onClick={handleReset}>
                    {'\u21BA ' + t('game.reset')}
                </Button>
            </HStack>
        </VStack>
    );
}

StateArchitectBoard.displayName = 'StateArchitectBoard';

export default StateArchitectBoard;
