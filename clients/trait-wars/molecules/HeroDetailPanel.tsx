/**
 * HeroDetailPanel Molecule
 *
 * Condensed sidebar-friendly hero profile panel. Sections render conditionally
 * based on data availability — shows only what's provided.
 */

import React from 'react';
import { Box, Typography, HStack, VStack, Badge, Button, cn } from '@almadar/ui';
import { HeroAvatar } from '../atoms/HeroAvatar';
import { GameBar } from '../atoms/GameBar';
import { TraitSlot, TraitData } from './TraitSlot';
import { useAssetsOptional, DEFAULT_ASSET_MANIFEST, getGameUIPanelUrl } from '../assets';
import type { WorldMapHero, HeroEquippedTrait } from '../types/castle';

export interface HeroDetailPanelProps {
    /** Hero data (WorldMapHero with optional profile fields) */
    hero: WorldMapHero;
    /** Show movement and army info */
    showMovement?: boolean;
    /** Handler for level up action */
    onLevelUp?: () => void;
    /** Handler for "View Full Profile" */
    onViewProfile?: () => void;
    /** Additional CSS classes */
    className?: string;
}

const STAT_CONFIG: { key: string; label: string; colorClass: string }[] = [
    { key: 'attack', label: 'ATK', colorClass: 'text-error' },
    { key: 'defense', label: 'DEF', colorClass: 'text-info' },
    { key: 'speed', label: 'SPD', colorClass: 'text-accent' },
    { key: 'leadership', label: 'LDR', colorClass: 'text-[var(--tw-faction-resonator)]' },
];

/** Convert HeroEquippedTrait to TraitData for TraitSlot compatibility */
function toTraitData(t: HeroEquippedTrait): TraitData {
    return { id: t.id, name: t.name, category: t.category, description: t.description, iconType: t.iconType };
}

/**
 * HeroDetailPanel — sidebar-width hero profile with conditional sections.
 */
export function HeroDetailPanel({
    hero,
    showMovement = false,
    onLevelUp,
    onViewProfile,
    className,
}: HeroDetailPanelProps): JSX.Element {
    const manifest = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;
    const panelFrameUrl = getGameUIPanelUrl(manifest, 'panelFrame');

    const canLevelUp = hero.experience !== undefined
        && hero.experienceToNextLevel !== undefined
        && hero.experience >= hero.experienceToNextLevel;

    return (
        <Box
            className={cn('rounded-lg bg-card/80 p-4', className)}
            style={panelFrameUrl ? {
                borderImage: `url(${panelFrameUrl}) 80 fill / 20px / 0 stretch`,
                border: 'none',
                padding: '20px',
            } : undefined}
        >
            {/* Header: Avatar + Name + Archetype */}
            <HStack className="gap-3 items-start mb-3">
                <HeroAvatar
                    heroId={hero.id}
                    name={hero.name}
                    level={hero.level}
                    archetype={hero.archetype as any}
                    size="md"
                />
                <VStack className="gap-0 flex-1 min-w-0">
                    <Typography variant="h6" className="text-foreground truncate">
                        {hero.name}
                    </Typography>
                    {hero.title && (
                        <Typography variant="caption" className="text-muted-foreground italic truncate">
                            "{hero.title}"
                        </Typography>
                    )}
                    <Badge variant="secondary" size="sm" className="mt-1 w-fit">
                        {hero.archetype}
                    </Badge>
                </VStack>
            </HStack>

            {/* XP Bar */}
            {hero.experience !== undefined && hero.experienceToNextLevel !== undefined && (
                <Box className="mb-3">
                    <HStack className="justify-between mb-1">
                        <Typography variant="caption" className="text-muted-foreground">
                            Level {hero.level}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                            {hero.experience}/{hero.experienceToNextLevel} XP
                        </Typography>
                    </HStack>
                    <GameBar
                        type="xp"
                        value={hero.experience}
                        max={hero.experienceToNextLevel}
                        showLabel={false}
                        size="sm"
                    />
                    {canLevelUp && onLevelUp && (
                        <Box
                            className="mt-1 py-1 text-center text-xs font-medium bg-warning/20 border border-warning rounded text-warning cursor-pointer hover:bg-warning/30 transition-colors"
                            onClick={onLevelUp}
                        >
                            Level Up Available!
                        </Box>
                    )}
                </Box>
            )}

            {/* Stats Grid */}
            {hero.stats && (
                <Box className="mb-3">
                    {/* Health bar */}
                    <Box className="mb-2">
                        <HStack className="justify-between mb-1">
                            <Typography variant="caption" className="text-success font-medium">HP</Typography>
                            <Typography variant="caption" className="text-muted-foreground">
                                {hero.stats.health}/{hero.stats.maxHealth}
                            </Typography>
                        </HStack>
                        <GameBar
                            type="health"
                            value={hero.stats.health}
                            max={hero.stats.maxHealth}
                            showLabel={false}
                            size="sm"
                        />
                    </Box>
                    {/* Other stats in 2×2 grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {STAT_CONFIG.map(({ key, label, colorClass }) => (
                            <HStack key={key} className="justify-between">
                                <Typography variant="caption" className={cn('font-medium', colorClass)}>
                                    {label}
                                </Typography>
                                <Typography variant="caption" className="text-foreground/80">
                                    {hero.stats![key as keyof typeof hero.stats]}
                                </Typography>
                            </HStack>
                        ))}
                    </div>
                </Box>
            )}

            {/* Equipped Traits */}
            {hero.equippedTraits && hero.equippedTraits.length > 0 && (
                <Box className="mb-3">
                    <Typography variant="caption" className="text-muted-foreground mb-1 block">
                        Traits
                    </Typography>
                    <HStack className="gap-2 flex-wrap">
                        {hero.equippedTraits.map((trait, i) => (
                            <TraitSlot
                                key={i}
                                slotNumber={i + 1}
                                equippedTrait={trait ? toTraitData(trait) : undefined}
                                size="sm"
                            />
                        ))}
                        {/* Show empty slots if maxTraitSlots is provided */}
                        {hero.maxTraitSlots && hero.equippedTraits.length < hero.maxTraitSlots &&
                            Array.from({ length: hero.maxTraitSlots - hero.equippedTraits.length }).map((_, i) => (
                                <TraitSlot
                                    key={`empty-${i}`}
                                    slotNumber={hero.equippedTraits!.length + i + 1}
                                    size="sm"
                                />
                            ))
                        }
                    </HStack>
                </Box>
            )}

            {/* Movement & Army */}
            {showMovement && (
                <HStack className="gap-2 mb-3">
                    <Box className="flex-1 p-2 bg-background/50 rounded text-center">
                        <Typography variant="caption" className="text-muted-foreground block">Move</Typography>
                        <Typography variant="body1" className="text-primary font-bold">
                            {hero.movement}/{hero.maxMovement}
                        </Typography>
                    </Box>
                    <Box className="flex-1 p-2 bg-background/50 rounded text-center">
                        <Typography variant="caption" className="text-muted-foreground block">Army</Typography>
                        <Typography variant="body1" className="text-foreground font-bold">
                            {hero.army.length}
                        </Typography>
                    </Box>
                </HStack>
            )}

            {/* View Profile Button */}
            {onViewProfile && (
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onViewProfile}
                    className="w-full"
                >
                    View Full Profile
                </Button>
            )}
        </Box>
    );
}

HeroDetailPanel.displayName = 'HeroDetailPanel';

export default HeroDetailPanel;
