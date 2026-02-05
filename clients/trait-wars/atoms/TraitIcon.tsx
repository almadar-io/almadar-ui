/**
 * TraitIcon Atom
 *
 * Displays a trait ability icon with state indicators (ready, active, cooldown).
 * Uses Box, Badge, and Icon components from the core design system.
 */

import React from 'react';
import { Sword, Shield, Heart, Move, Sparkles, Zap, LucideIcon } from 'lucide-react';
import {
  cn,
  Box,
  Badge,
  Icon,
  IconSize,
  Tooltip,
} from '@almadar/ui';

export type TraitState = 'ready' | 'active' | 'cooldown' | 'disabled';

export type TraitName = 'attacker' | 'defender' | 'healer' | 'mover' | 'summoner' | 'special';

export interface TraitIconProps {
    /** The trait name */
    traitName: TraitName;
    /** Current state of the trait */
    state?: TraitState;
    /** Cooldown turns remaining (for cooldown state) */
    cooldownTurns?: number;
    /** Size of the icon */
    size?: IconSize;
    /** Click handler */
    onClick?: () => void;
    /** Whether the trait is equipped */
    isEquipped?: boolean;
    /** Show tooltip with trait info */
    showTooltip?: boolean;
    /** Additional CSS classes */
    className?: string;
}

const traitIcons: Record<TraitName, LucideIcon> = {
    attacker: Sword,
    defender: Shield,
    healer: Heart,
    mover: Move,
    summoner: Sparkles,
    special: Zap,
};

const traitColors: Record<TraitName, string> = {
    attacker: 'text-[#ef4444]', // Red
    defender: 'text-[#3b82f6]', // Blue
    healer: 'text-[#22c55e]', // Green
    mover: 'text-[#f59e0b]', // Amber
    summoner: 'text-[#8b5cf6]', // Purple
    special: 'text-[#ec4899]', // Pink
};

const traitDescriptions: Record<TraitName, string> = {
    attacker: 'Strike enemies in range',
    defender: 'Block incoming damage',
    healer: 'Restore ally health',
    mover: 'Move across hexes',
    summoner: 'Spawn new units',
    special: 'Unique ability',
};

const stateStyles: Record<TraitState, string> = {
    ready: 'opacity-100',
    active: 'opacity-100 animate-pulse ring-2 ring-[#fbbf24]',
    cooldown: 'opacity-50 grayscale',
    disabled: 'opacity-30 grayscale cursor-not-allowed',
};

export function TraitIcon({
    traitName,
    state = 'ready',
    cooldownTurns,
    size = 'md',
    onClick,
    isEquipped = false,
    showTooltip = true,
    className,
}: TraitIconProps): JSX.Element {
    const TraitLucideIcon = traitIcons[traitName];
    const isClickable = state !== 'disabled' && state !== 'cooldown' && onClick;

    const iconContent = (
        <Box
            position="relative"
            display="inline-flex"
            rounded="md"
            padding="xs"
            border={isEquipped}
            bg={isEquipped ? 'surface' : 'transparent'}
            className={cn(
                'items-center justify-center transition-all duration-200',
                stateStyles[state],
                isClickable && 'cursor-pointer hover:scale-110 hover:bg-[var(--color-muted)]',
                className
            )}
            onClick={state !== 'disabled' && state !== 'cooldown' ? onClick : undefined}
        >
            <Icon
                icon={TraitLucideIcon}
                size={size}
                className={traitColors[traitName]}
            />

            {/* Cooldown overlay */}
            {state === 'cooldown' && cooldownTurns !== undefined && (
                <Box
                    position="absolute"
                    display="flex"
                    className="inset-0 items-center justify-center bg-black/50 rounded-md"
                >
                    <Badge variant="danger" size="sm">
                        {cooldownTurns}
                    </Badge>
                </Box>
            )}

            {/* Active indicator */}
            {state === 'active' && (
                <Box
                    position="absolute"
                    className="-top-1 -right-1"
                >
                    <Badge variant="warning" size="sm">
                        ⚡
                    </Badge>
                </Box>
            )}
        </Box>
    );

    if (showTooltip) {
        return (
            <Tooltip
                content={
                    <Box padding="xs">
                        <Box className="font-bold capitalize">{traitName}</Box>
                        <Box className="text-sm opacity-80">{traitDescriptions[traitName]}</Box>
                        {state === 'cooldown' && cooldownTurns && (
                            <Box className="text-sm text-[var(--color-warning)]">
                                Cooldown: {cooldownTurns} turns
                            </Box>
                        )}
                    </Box>
                }
            >
                {iconContent}
            </Tooltip>
        );
    }

    return iconContent;
}

TraitIcon.displayName = 'TraitIcon';

export default TraitIcon;
