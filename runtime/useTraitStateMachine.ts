/**
 * useTraitStateMachine Hook
 *
 * Manages trait state machines with event-driven transitions.
 * Subscribes to eventBus events and executes effects when transitions occur.
 *
 * CONSOLIDATED RUNTIME:
 * - Uses StateMachineManager from @almadar/runtime for state management
 * - Uses the same state machine logic as the server runtime (OrbitalServerRuntime)
 * - Ensures consistent behavior between client preview and server execution
 *
 * SLOT MANAGEMENT:
 * - Collects all render-ui effects from a transition, groups by slot
 * - Sets each slot's patterns array atomically via SlotsActions
 * - No stacking logic, no priority system — transition produces complete slot content
 *
 * @packageDocumentation
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
// Use hooks from @almadar/ui
import { useEventBus } from '../hooks';
import { useFetchedDataContext } from '../providers';
import { isCircuitEvent } from '@almadar/core';
import type { PatternConfig } from '@almadar/core';
import {
    StateMachineManager,
    EffectExecutor,
    type TraitState,
    type TraitDefinition,
    type EffectHandlers,
    type BindingContext,
    type EffectContext,
} from '@almadar/runtime';
import { isEntityAwarePattern } from '@almadar/patterns';
import { createClientEffectHandlers } from './createClientEffectHandlers';
import type { ResolvedTraitBinding } from './types';
import type { SlotsActions, SlotPatternEntry, SlotSource } from './ui/SlotsContext';
import { useEntitySchema } from './EntitySchemaContext';

// ============================================================================
// Types
// ============================================================================

export type { TraitState };

export interface TraitStateMachineResult {
    /** Current state for each trait */
    traitStates: Map<string, TraitState>;
    /** Send an event to trigger a transition */
    sendEvent: (eventKey: string, payload?: Record<string, unknown>) => void;
    /** Get current state for a specific trait */
    getTraitState: (traitName: string) => TraitState | undefined;
    /** Check if a trait can handle an event from its current state */
    canHandleEvent: (traitName: string, eventKey: string) => boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert ResolvedTraitBinding to TraitDefinition for StateMachineManager
 */
function toTraitDefinition(binding: ResolvedTraitBinding): TraitDefinition {
    return {
        name: binding.trait.name,
        states: binding.trait.states,
        transitions: binding.trait.transitions,
        listens: binding.trait.listens,
    };
}

/**
 * Normalize event key - strip UI: prefix if present
 */
function normalizeEventKey(eventKey: string): string {
    return eventKey.startsWith('UI:') ? eventKey.slice(3) : eventKey;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export interface UseTraitStateMachineOptions {
    /** Callback invoked after each event is processed (for server forwarding) */
    onEventProcessed?: (eventKey: string, payload?: Record<string, unknown>) => void;
    /** Router navigate function for navigate effects */
    navigate?: (path: string, params?: Record<string, unknown>) => void;
    /** Notification function for notify effects */
    notify?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

/**
 * useTraitStateMachine - Manages state machines for multiple traits
 *
 * Uses the shared StateMachineManager for consistent behavior with server runtime.
 * Collects render-ui effects per transition and sets slot content atomically.
 */
export function useTraitStateMachine(
    traitBindings: ResolvedTraitBinding[],
    slotsActions: SlotsActions,
    options?: UseTraitStateMachineOptions
): TraitStateMachineResult {
    const eventBus = useEventBus();
    const { entities } = useEntitySchema();
    const fetchedDataContext = useFetchedDataContext();

    // Create StateMachineManager - shared with server runtime
    const manager = useMemo(() => {
        const traitDefs = traitBindings.map(toTraitDefinition);
        return new StateMachineManager(traitDefs);
    }, [traitBindings]);

    // Track state for React re-renders
    const [traitStates, setTraitStates] = useState<Map<string, TraitState>>(() => {
        return manager.getAllStates();
    });

    // Keep refs for callbacks to avoid stale closures
    const traitBindingsRef = useRef(traitBindings);
    const managerRef = useRef(manager);
    const slotsActionsRef = useRef(slotsActions);
    const optionsRef = useRef(options);

    useEffect(() => {
        traitBindingsRef.current = traitBindings;
    }, [traitBindings]);

    useEffect(() => {
        managerRef.current = manager;
        setTraitStates(manager.getAllStates());
    }, [manager]);

    useEffect(() => {
        slotsActionsRef.current = slotsActions;
    }, [slotsActions]);

    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    // Reinitialize when trait bindings change (e.g., page navigation)
    useEffect(() => {
        const newManager = managerRef.current;
        newManager.resetAll();
        setTraitStates(newManager.getAllStates());

        console.log('[TraitStateMachine] Reset states for page navigation:',
            Array.from(newManager.getAllStates().keys()).join(', '));
    }, [traitBindings]);

    /**
     * Process an event and trigger matching transitions.
     *
     * Uses the shared StateMachineManager for state transitions,
     * then executes effects. Render-ui effects are accumulated per slot
     * and flushed atomically after all effects execute.
     */
    const processEvent = useCallback((
        eventKey: string,
        payload?: Record<string, unknown>
    ) => {
        const normalizedEvent = normalizeEventKey(eventKey);
        const bindings = traitBindingsRef.current;
        const currentManager = managerRef.current;
        const actions = slotsActionsRef.current;

        console.log('[TraitStateMachine] Processing event:', normalizedEvent, 'payload:', payload);

        // Find the binding that matches each trait for linkedEntity info
        const bindingMap = new Map(bindings.map(b => [b.trait.name, b]));

        // Send event through StateMachineManager (shared runtime)
        const results = currentManager.sendEvent(normalizedEvent, payload);

        // Execute effects for each transition that occurred
        for (const { traitName, result } of results) {
            const binding = bindingMap.get(traitName);
            const traitState = currentManager.getState(traitName);

            if (!binding || !traitState) continue;

            if (result.executed && result.effects.length > 0) {
                console.log(
                    '[TraitStateMachine] Executing',
                    result.effects.length,
                    'effects for',
                    traitName,
                    '| linkedEntity:',
                    binding.linkedEntity,
                    '| transition:',
                    `${result.previousState} -> ${result.newState}`,
                    '| effects:',
                    JSON.stringify(result.effects),
                );

                // Get entity data for context from FetchedDataContext (server data)
                const linkedEntity = binding.linkedEntity || '';
                const entityId = payload?.entityId as string | undefined;
                const entityData = linkedEntity && entityId && fetchedDataContext
                    ? (fetchedDataContext.getById(linkedEntity, entityId) as Record<string, unknown>) || {}
                    : payload || {};

                // Accumulator for render-ui effects — grouped by slot
                const pendingSlots = new Map<string, SlotPatternEntry[]>();
                const slotSource: SlotSource = {
                    trait: binding.trait.name,
                    state: result.previousState,
                    transition: `${result.previousState}->${result.newState}`,
                    effects: result.effects,
                    traitDefinition: binding.trait,
                };

                // Build handlers using factory from @almadar/runtime
                const handlers = createClientEffectHandlers({
                    eventBus,
                    slotSetter: {
                        addPattern: (slot, pattern, props) => {
                            const existing = pendingSlots.get(slot) || [];
                            existing.push({ pattern: pattern as PatternConfig, props: props || {} });
                            pendingSlots.set(slot, existing);
                        },
                        clearSlot: (slot) => {
                            pendingSlots.set(slot, []);
                        },
                    },
                    navigate: optionsRef.current?.navigate,
                    notify: optionsRef.current?.notify,
                    enrichPattern: (pattern) => {
                        const enrichNode = (node: unknown): unknown => {
                            if (!node || typeof node !== 'object') return node;
                            const rec = node as Record<string, unknown>;
                            const nodeType = rec.type as string | undefined;

                            // Recursively enrich children first
                            let enriched = rec;
                            if (Array.isArray(rec.children)) {
                                const enrichedChildren = (rec.children as unknown[]).map(enrichNode);
                                enriched = { ...rec, children: enrichedChildren };
                            }

                            // Enrich this node if it's entity-aware
                            if (nodeType && isEntityAwarePattern(nodeType) && fetchedDataContext) {
                                if (typeof enriched.entity === 'string') {
                                    const records = fetchedDataContext.getData(enriched.entity as string);
                                    if (records.length > 0) {
                                        return { ...enriched, entity: records };
                                    }
                                } else if (!enriched.entity && linkedEntity) {
                                    const records = fetchedDataContext.getData(linkedEntity);
                                    if (records.length > 0) {
                                        return { ...enriched, entity: records };
                                    }
                                }
                            }

                            return enriched;
                        };
                        return enrichNode(pattern);
                    },
                });

                const bindingCtx: BindingContext = {
                    entity: entityData,
                    payload: payload || {},
                    state: result.previousState,
                };

                const effectContext: EffectContext = {
                    traitName: binding.trait.name,
                    state: result.previousState,
                    transition: `${result.previousState}->${result.newState}`,
                    linkedEntity,
                    entityId,
                };

                const executor = new EffectExecutor({ handlers, bindings: bindingCtx, context: effectContext });

                // executeAll is async — must await before flushing pendingSlots
                executor.executeAll(result.effects).then(() => {
                    console.log(
                        '[TraitStateMachine] After executeAll, pendingSlots:',
                        Object.fromEntries(pendingSlots.entries()),
                    );

                    // Flush accumulated slot content atomically
                    for (const [slot, patterns] of pendingSlots) {
                        if (patterns.length === 0) {
                            actions.clearSlot(slot);
                        } else {
                            actions.setSlotPatterns(slot, patterns, slotSource);
                        }
                    }
                }).catch((error: unknown) => {
                    console.error(
                        '[TraitStateMachine] Effect execution error:',
                        error,
                        '| effects:',
                        JSON.stringify(result.effects)
                    );
                });
            } else if (!result.executed) {
                // Log guard failures and missing transitions
                if (result.guardResult === false) {
                    console.log(
                        '[TraitStateMachine] Guard blocked transition:',
                        traitName,
                        result.previousState,
                        '->',
                        result.transition?.to
                    );
                } else if (!result.transition) {
                    if (isCircuitEvent(normalizedEvent)) {
                        console.warn(
                            `[CLOSED CIRCUIT VIOLATION] Trait "${traitName}" in state "${traitState.currentState}" received event "${normalizedEvent}" but has no transition to handle it.\n` +
                            `   This is likely a schema issue. To fix, add a transition:\n` +
                            `   { from: "${traitState.currentState}", to: "<target_state>", event: "${normalizedEvent}", effects: [...] }\n` +
                            `   Or ensure the previous action (that opened this UI) properly transitions back before emitting this event.`
                        );
                    } else {
                        console.log(
                            '[TraitStateMachine] No transition for',
                            traitName,
                            'from state:',
                            traitState.currentState,
                            'on event:',
                            normalizedEvent
                        );
                    }
                }
            }
        }

        // Sync React state from manager
        if (results.length > 0) {
            setTraitStates(currentManager.getAllStates());
        }

        // Forward event to server (dual execution model)
        const onEventProcessed = optionsRef.current?.onEventProcessed;
        if (onEventProcessed) {
            onEventProcessed(normalizedEvent, payload);
        }
    }, [entities, fetchedDataContext, eventBus]);

    /**
     * Public API to send an event
     */
    const sendEvent = useCallback((
        eventKey: string,
        payload?: Record<string, unknown>
    ) => {
        processEvent(eventKey, payload);
    }, [processEvent]);

    /**
     * Get current state for a specific trait
     */
    const getTraitState = useCallback((traitName: string): TraitState | undefined => {
        return managerRef.current.getState(traitName);
    }, []);

    /**
     * Check if any trait can handle an event from its current state
     */
    const canHandleEvent = useCallback((traitName: string, eventKey: string): boolean => {
        const normalizedEvent = normalizeEventKey(eventKey);
        return managerRef.current.canHandleEvent(traitName, normalizedEvent);
    }, []);

    // Subscribe to eventBus events
    useEffect(() => {
        const allEvents = new Set<string>();

        for (const binding of traitBindings) {
            for (const event of binding.trait.events) {
                allEvents.add(event.key);
            }
            for (const transition of binding.trait.transitions) {
                allEvents.add(transition.event);
            }
        }

        console.log('[TraitStateMachine] Subscribing to events:', Array.from(allEvents));

        const unsubscribes: Array<() => void> = [];

        for (const eventKey of allEvents) {
            if (eventKey === 'INIT' || eventKey === 'LOAD' || eventKey === '$MOUNT') {
                continue;
            }

            const unsub = eventBus.on(`UI:${eventKey}`, (event) => {
                console.log('[TraitStateMachine] Received event:', `UI:${eventKey}`, event);
                processEvent(eventKey, event.payload as Record<string, unknown>);
            });
            unsubscribes.push(unsub);
        }

        return () => {
            for (const unsub of unsubscribes) {
                unsub();
            }
        };
    }, [traitBindings, eventBus, processEvent]);

    return {
        traitStates,
        sendEvent,
        getTraitState,
        canHandleEvent,
    };
}

export default useTraitStateMachine;
