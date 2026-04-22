/**
 * EventDispatcherTab - Fire events into the state machine from the debug panel
 *
 * Shows available transitions per trait based on current state,
 * lets users click to fire events, and displays a compact transition log.
 */

'use client';

import * as React from 'react';
import type { EventPayload } from '@almadar/core';
import type { TraitDebugInfo, TraitTransition } from '../../../../lib/traitRegistry';
import { Badge } from '../../../atoms/Badge';
import { Button } from '../../../atoms/Button';
import { Typography } from '../../../atoms/Typography';
import { Stack } from '../../../atoms/Stack';
import { EmptyState } from '../../../molecules/EmptyState';
import { useEventBus } from '../../../../hooks/useEventBus';

interface EventDispatcherTabProps {
    traits: TraitDebugInfo[];
    schema?: Record<string, unknown>;
}

interface TransitionLogEntry {
    traitName: string;
    event: string;
    from: string;
    to: string;
    timestamp: number;
}

/** Extract payload fields from schema event declarations for a given event name */
function extractPayloadFields(
    schema: Record<string, unknown> | undefined,
    eventName: string,
): Array<{ name: string; type: string }> {
    if (!schema) return [];
    const orbitals = schema.orbitals as Record<string, unknown>[] | undefined;
    if (!orbitals) return [];

    for (const orbital of orbitals) {
        const traits = (orbital.traits as Record<string, unknown>[]) ?? [];
        for (const trait of traits) {
            const sm = trait.stateMachine as Record<string, unknown> | undefined;
            if (!sm) continue;
            const events = (sm.events as Record<string, unknown>[]) ?? [];
            for (const evt of events) {
                if (evt.name !== eventName) continue;
                const payload = (evt.payload as Record<string, unknown>[]) ?? [];
                return payload.map((f) => ({
                    name: f.name as string,
                    type: (f.type as string) ?? 'string',
                }));
            }
        }
    }
    return [];
}

/** Build a minimal payload from field declarations */
function buildAutoPayload(
    fields: Array<{ name: string; type: string }>,
): EventPayload {
    const payload: EventPayload = {};
    for (const field of fields) {
        switch (field.type) {
            case 'number':
            case 'integer':
            case 'float':
                payload[field.name] = 1;
                break;
            case 'boolean':
                payload[field.name] = true;
                break;
            default:
                payload[field.name] = `test-${field.name}`;
                break;
        }
    }
    return payload;
}

/** Group available transitions by event name, dedup across traits */
function getAvailableEvents(
    traits: TraitDebugInfo[],
): Array<{ event: string; traits: string[]; transitions: Array<TraitTransition & { traitName: string }> }> {
    const eventMap = new Map<string, {
        traits: Set<string>;
        transitions: Array<TraitTransition & { traitName: string }>;
    }>();

    for (const trait of traits) {
        for (const t of trait.transitions) {
            if (t.from !== trait.currentState) continue;
            const existing = eventMap.get(t.event);
            if (existing) {
                existing.traits.add(trait.name);
                existing.transitions.push({ ...t, traitName: trait.name });
            } else {
                eventMap.set(t.event, {
                    traits: new Set([trait.name]),
                    transitions: [{ ...t, traitName: trait.name }],
                });
            }
        }
    }

    return Array.from(eventMap.entries()).map(([event, data]) => ({
        event,
        traits: Array.from(data.traits),
        transitions: data.transitions,
    }));
}

/** Get all events from all states (for showing disabled events) */
function getAllEvents(traits: TraitDebugInfo[]): Set<string> {
    const all = new Set<string>();
    for (const trait of traits) {
        for (const t of trait.transitions) {
            all.add(t.event);
        }
    }
    return all;
}

export function EventDispatcherTab({ traits, schema }: EventDispatcherTabProps) {
    const eventBus = useEventBus();
    const [log, setLog] = React.useState<TransitionLogEntry[]>([]);
    const prevStatesRef = React.useRef<Map<string, string>>(new Map());

    // Track state changes for the log
    React.useEffect(() => {
        for (const trait of traits) {
            const prev = prevStatesRef.current.get(trait.id);
            if (prev && prev !== trait.currentState) {
                setLog((l) => [
                    { traitName: trait.name, event: '?', from: prev, to: trait.currentState, timestamp: Date.now() },
                    ...l,
                ].slice(0, 5));
            }
            prevStatesRef.current.set(trait.id, trait.currentState);
        }
    }, [traits]);

    if (traits.length === 0) {
        return (
            <EmptyState
                title="No active traits"
                description="Traits will appear when the state machine initializes"
                className="py-8"
            />
        );
    }

    const availableEvents = getAvailableEvents(traits);
    const allEvents = getAllEvents(traits);
    const unavailableEvents = Array.from(allEvents).filter(
        (e) => !availableEvents.some((ae) => ae.event === e),
    );

    const handleFireEvent = (eventName: string) => {
        const payloadFields = extractPayloadFields(schema, eventName);
        const payload = payloadFields.length > 0 ? buildAutoPayload(payloadFields) : {};

        // Fire via EventBus with UI: prefix (the convention useTraitStateMachine listens for)
        eventBus.emit(`UI:${eventName}`, payload);
    };

    return (
        <div className="debug-tab debug-tab--dispatch">
            {/* Current state per trait */}
            <div className="mb-3">
                <Typography variant="small" weight="medium" className="text-gray-500 mb-1">
                    Active States
                </Typography>
                <div className="flex flex-wrap gap-1">
                    {traits.map((trait) => (
                        <Badge key={trait.id} variant="success" size="sm">
                            {trait.name}: {trait.currentState}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Available events (from current state) */}
            <div className="mb-3">
                <Typography variant="small" weight="medium" className="text-gray-500 mb-1">
                    Available Events
                </Typography>
                {availableEvents.length === 0 ? (
                    <Typography variant="small" className="text-gray-400 italic">
                        No transitions from current state
                    </Typography>
                ) : (
                    <Stack gap="xs">
                        {availableEvents.map(({ event, transitions }) => (
                            <div key={event} className="flex items-center gap-2">
                                <Button
                                    onClick={() => handleFireEvent(event)}
                                    variant="primary"
                                    size="sm"
                                    className="font-mono text-xs"
                                >
                                    {event}
                                </Button>
                                <Typography variant="small" className="text-gray-500">
                                    {transitions.map((t) => `${t.from} -> ${t.to}`).join(', ')}
                                </Typography>
                                {transitions.some((t) => t.guard) && (
                                    <Badge variant="warning" size="sm">guarded</Badge>
                                )}
                            </div>
                        ))}
                    </Stack>
                )}
            </div>

            {/* Unavailable events (from other states, shown as disabled) */}
            {unavailableEvents.length > 0 && (
                <div className="mb-3">
                    <Typography variant="small" weight="medium" className="text-gray-500 mb-1">
                        Other Events (not available from current state)
                    </Typography>
                    <div className="flex flex-wrap gap-1">
                        {unavailableEvents.map((event) => (
                            <Badge key={event} variant="default" size="sm" className="opacity-50">
                                {event}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Transition log */}
            {log.length > 0 && (
                <div>
                    <Typography variant="small" weight="medium" className="text-gray-500 mb-1">
                        Recent Transitions
                    </Typography>
                    <Stack gap="xs">
                        {log.map((entry, i) => (
                            <Typography key={i} variant="small" className="font-mono text-xs">
                                <span className="text-purple-400">{entry.traitName}</span>
                                {' '}
                                <span className="text-gray-500">{entry.from}</span>
                                {' -> '}
                                <span className="text-green-400">{entry.to}</span>
                            </Typography>
                        ))}
                    </Stack>
                </div>
            )}
        </div>
    );
}

EventDispatcherTab.displayName = 'EventDispatcherTab';
