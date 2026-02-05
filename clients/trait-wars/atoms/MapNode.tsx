/**
 * MapNode Component
 *
 * Location marker on the world map representing cities, dungeons, resources, etc.
 */

import React from 'react';
import { Box, Typography, cn } from '@almadar/ui';

export type LocationType = 'city' | 'castle' | 'dungeon' | 'resource' | 'battle' | 'treasure' | 'portal';

export interface MapNodeProps {
    /** Unique identifier */
    id: string;
    /** Node type */
    type: LocationType;
    /** Display name */
    name: string;
    /** X coordinate (0-100%) */
    x: number;
    /** Y coordinate (0-100%) */
    y: number;
    /** Whether this node is currently selected */
    selected?: boolean;
    /** Whether this node has been visited */
    visited?: boolean;
    /** Whether this node is accessible */
    accessible?: boolean;
    /** Owner faction (for cities/castles) */
    owner?: 'player' | 'enemy' | 'neutral';
    /** Handler when node is clicked */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
}

const LOCATION_ICONS: Record<LocationType, string> = {
    city: '🏛️',
    castle: '🏰',
    dungeon: '⚔️',
    resource: '💎',
    battle: '⚡',
    treasure: '📦',
    portal: '🌀',
};

const LOCATION_COLORS: Record<LocationType, { bg: string; border: string }> = {
    city: { bg: 'rgba(168,85,247,0.3)', border: '#a855f7' },
    castle: { bg: 'rgba(234,179,8,0.3)', border: '#eab308' },
    dungeon: { bg: 'rgba(239,68,68,0.3)', border: '#ef4444' },
    resource: { bg: 'rgba(34,197,94,0.3)', border: '#22c55e' },
    battle: { bg: 'rgba(249,115,22,0.3)', border: '#f97316' },
    treasure: { bg: 'rgba(234,179,8,0.3)', border: '#eab308' },
    portal: { bg: 'rgba(59,130,246,0.3)', border: '#3b82f6' },
};

const OWNER_COLORS: Record<string, string> = {
    player: 'ring-green-500',
    enemy: 'ring-red-500',
    neutral: 'ring-gray-500',
};

/**
 * MapNode displays a location marker on the world map.
 */
export function MapNode({
    id,
    type,
    name,
    x,
    y,
    selected = false,
    visited = false,
    accessible = true,
    owner,
    onClick,
    className,
}: MapNodeProps): JSX.Element {
    const colors = LOCATION_COLORS[type];
    const icon = LOCATION_ICONS[type];

    return (
        <Box
            className={cn(
                'absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer',
                'transition-all duration-200 hover:scale-110',
                !accessible && 'opacity-50 cursor-not-allowed',
                selected && 'scale-125',
                className
            )}
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={accessible ? onClick : undefined}
        >
            {/* Node circle */}
            <Box
                className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    'border-2 shadow-lg',
                    owner && `ring-2 ${OWNER_COLORS[owner]}`,
                    selected && 'ring-4 ring-amber-400'
                )}
                style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                }}
            >
                <Typography variant="h4" className="text-2xl">
                    {icon}
                </Typography>
            </Box>

            {/* Visited indicator */}
            {visited && (
                <Box className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Typography variant="caption" className="text-white text-xs">✓</Typography>
                </Box>
            )}

            {/* Name label */}
            <Box className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
                <Typography
                    variant="caption"
                    className={cn(
                        'text-white text-xs px-1 py-0.5 rounded',
                        selected ? 'bg-amber-600' : 'bg-slate-800/80'
                    )}
                >
                    {name}
                </Typography>
            </Box>
        </Box>
    );
}

export default MapNode;
