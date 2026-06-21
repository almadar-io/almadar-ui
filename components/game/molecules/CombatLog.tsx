/**
 * CombatLog Component
 *
 * Scrollable log of combat events with icons and colors.
 * Generalized from Trait Wars — removed asset manifest coupling.
 */

import React, { useRef, useEffect } from 'react';
import { Sword, Shield, Heart, Move, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Box, Typography, Badge, Card } from '../../core/atoms';
import { cn } from '../../../lib/cn';

export type CombatLogEventType = 'attack' | 'defend' | 'heal' | 'move' | 'special' | 'death' | 'spawn';

export interface CombatEvent {
    id: string;
    type: CombatLogEventType;
    message: string;
    timestamp: number;
    actorName?: string;
    targetName?: string;
    value?: number;
    turn?: number;
}

export interface CombatLogProps {
    events: CombatEvent[];
    maxVisible?: number;
    autoScroll?: boolean;
    showTimestamps?: boolean;
    title?: string;
    className?: string;
}

const eventIcons: Record<CombatLogEventType, LucideIcon> = {
    attack: Sword,
    defend: Shield,
    heal: Heart,
    move: Move,
    special: Zap,
    death: Sword,
    spawn: Zap,
};

const eventColors: Record<CombatLogEventType, string> = {
    attack: 'text-error',
    defend: 'text-info',
    heal: 'text-success',
    move: 'text-primary',
    special: 'text-warning',
    death: 'text-muted-foreground',
    spawn: 'text-accent',
};

const eventBadgeVariants: Record<CombatLogEventType, 'danger' | 'primary' | 'success' | 'warning' | 'secondary'> = {
    attack: 'danger',
    defend: 'primary',
    heal: 'success',
    move: 'warning',
    special: 'secondary',
    death: 'secondary',
    spawn: 'secondary',
};

const DEFAULT_COMBAT_EVENTS: CombatEvent[] = [
    { id: 'e1', type: 'spawn', message: 'Shadow Guard entered the field.', timestamp: 0, turn: 1 },
    { id: 'e2', type: 'move', message: 'Hero moved to (3, 4).', timestamp: 1, actorName: 'Hero', turn: 1 },
    { id: 'e3', type: 'attack', message: 'Hero attacked Shadow Guard.', timestamp: 2, actorName: 'Hero', targetName: 'Shadow Guard', value: 18, turn: 2 },
    { id: 'e4', type: 'defend', message: 'Shadow Guard blocked 5 damage.', timestamp: 3, actorName: 'Shadow Guard', value: 5, turn: 2 },
    { id: 'e5', type: 'heal', message: 'Hero used Health Potion.', timestamp: 4, actorName: 'Hero', value: 25, turn: 3 },
];

export function CombatLog({
    events = DEFAULT_COMBAT_EVENTS,
    maxVisible = 50,
    autoScroll = true,
    showTimestamps = false,
    className,
    title = 'Combat Log',
}: CombatLogProps): React.JSX.Element {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events, autoScroll]);

    const safeEvents = events ?? [];
    const visibleEvents = safeEvents.slice(-maxVisible);

    return (
        <Card variant="default" className={cn('flex flex-col', className)}>
            <Box padding="sm" border className="border-b-2 border-x-0 border-t-0 border-border">
                <Box display="flex" className="items-center justify-between">
                    <Typography variant="body2" className="font-bold">{title}</Typography>
                    <Badge variant="neutral" size="sm">{safeEvents.length} events</Badge>
                </Box>
            </Box>
            <Box ref={scrollRef} overflow="auto" className="flex-1 max-h-64">
                {visibleEvents.length === 0 ? (
                    <Box padding="md" className="text-center opacity-50">
                        <Typography variant="body2">No events yet</Typography>
                    </Box>
                ) : (
                    <Box padding="xs" className="space-y-1">
                        {visibleEvents.map((event) => {
                            const eventType = (event.type && event.type in eventIcons) ? event.type : 'attack';
                            const EventIcon = eventIcons[eventType];
                            const colorClass = eventColors[eventType];
                            return (
                                <Box key={event.id} display="flex" padding="xs" rounded="sm"
                                    className={cn('items-start gap-2 hover:bg-muted transition-colors', eventType === 'death' && 'opacity-60')}>
                                    <Box className={cn('flex-shrink-0 mt-0.5', colorClass)}>
                                        <EventIcon className="h-4 w-4" />
                                    </Box>
                                    <Box className="flex-1 min-w-0">
                                        <Typography variant="caption" className="block">{event.message}</Typography>
                                        {event.value !== undefined && (
                                            <Badge variant={eventBadgeVariants[eventType]} size="sm" className="mt-1">
                                                {eventType === 'heal' ? '+' : eventType === 'attack' ? '-' : ''}{event.value}
                                            </Badge>
                                        )}
                                    </Box>
                                    {(event.turn || showTimestamps) && (
                                        <Box className="flex-shrink-0">
                                            <Typography variant="caption" className="opacity-40">
                                                {event.turn ? `T${event.turn}` : ''}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Box>
        </Card>
    );
}

CombatLog.displayName = 'CombatLog';
