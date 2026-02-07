/**
 * CombatLog Organism
 *
 * Scrollable log of combat events with icons and colors.
 * Uses Box, Typography, Badge, and Icon components.
 */

import React, { useRef, useEffect } from 'react';
import { Sword, Shield, Heart, Move, Zap, LucideIcon } from 'lucide-react';
import {
  cn,
  Box,
  Typography,
  Badge,
  Card,
} from '@almadar/ui';
import { useAssetsOptional, DEFAULT_ASSET_MANIFEST, getGameUIPanelUrl } from '../assets';

export type CombatEventType = 'attack' | 'defend' | 'heal' | 'move' | 'special' | 'death' | 'spawn';

export interface CombatEvent {
    id: string;
    type: CombatEventType;
    message: string;
    timestamp: number;
    actorName?: string;
    targetName?: string;
    value?: number;
    turn?: number;
}

export interface CombatLogProps {
    /** Array of combat events */
    events: CombatEvent[];
    /** Maximum visible events */
    maxVisible?: number;
    /** Auto-scroll to latest */
    autoScroll?: boolean;
    /** Show timestamps */
    showTimestamps?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Title for the log */
    title?: string;
}

const eventIcons: Record<CombatEventType, LucideIcon> = {
    attack: Sword,
    defend: Shield,
    heal: Heart,
    move: Move,
    special: Zap,
    death: Sword,
    spawn: Zap,
};

const eventColors: Record<CombatEventType, string> = {
    attack: 'text-error',
    defend: 'text-info',
    heal: 'text-success',
    move: 'text-primary',
    special: 'text-[var(--tw-faction-resonator)]',
    death: 'text-muted-foreground',
    spawn: 'text-accent',
};

const eventBadgeVariants: Record<CombatEventType, 'danger' | 'primary' | 'success' | 'warning' | 'secondary'> = {
    attack: 'danger',
    defend: 'primary',
    heal: 'success',
    move: 'warning',
    special: 'secondary',
    death: 'secondary',
    spawn: 'secondary',
};

export function CombatLog({
    events,
    maxVisible = 50,
    autoScroll = true,
    showTimestamps = false,
    className,
    title = 'Combat Log',
}: CombatLogProps): JSX.Element {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new events arrive
    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events, autoScroll]);

    const visibleEvents = events.slice(-maxVisible);
    const manifest = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;
    const combatLogBgUrl = getGameUIPanelUrl(manifest, 'combatLogBg');

    return (
        <Card
            variant="default"
            className={cn('flex flex-col', className)}
            style={combatLogBgUrl ? {
                backgroundImage: `url(${combatLogBgUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            } : undefined}
        >
            {/* Header */}
            <Box
                padding="sm"
                border
                className="border-b-2 border-x-0 border-t-0 border-[var(--color-border)]"
            >
                <Box display="flex" className="items-center justify-between">
                    <Typography variant="body2" className="font-bold">
                        {title}
                    </Typography>
                    <Badge variant="neutral" size="sm">
                        {events.length} events
                    </Badge>
                </Box>
            </Box>

            {/* Event List */}
            <Box
                ref={scrollRef}
                overflow="auto"
                className="flex-1 max-h-64"
            >
                {visibleEvents.length === 0 ? (
                    <Box padding="md" className="text-center opacity-50">
                        <Typography variant="body2">No events yet</Typography>
                    </Box>
                ) : (
                    <Box padding="xs" className="space-y-1">
                        {visibleEvents.map((event) => {
                            const EventIcon = eventIcons[event.type];
                            const colorClass = eventColors[event.type];

                            return (
                                <Box
                                    key={event.id}
                                    display="flex"
                                    padding="xs"
                                    rounded="sm"
                                    className={cn(
                                        'items-start gap-2 hover:bg-[var(--color-muted)] transition-colors',
                                        event.type === 'death' && 'opacity-60'
                                    )}
                                >
                                    {/* Event Icon */}
                                    <Box className={cn('flex-shrink-0 mt-0.5', colorClass)}>
                                        <EventIcon className="h-4 w-4" />
                                    </Box>

                                    {/* Event Content */}
                                    <Box className="flex-1 min-w-0">
                                        <Typography variant="caption" className="block">
                                            {event.message}
                                        </Typography>

                                        {/* Value badge */}
                                        {event.value !== undefined && (
                                            <Badge
                                                variant={eventBadgeVariants[event.type]}
                                                size="sm"
                                                className="mt-1"
                                            >
                                                {event.type === 'heal' ? '+' : event.type === 'attack' ? '-' : ''}
                                                {event.value}
                                            </Badge>
                                        )}
                                    </Box>

                                    {/* Turn/Timestamp */}
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

export default CombatLog;
