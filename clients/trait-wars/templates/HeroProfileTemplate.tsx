/**
 * HeroProfileTemplate Component
 *
 * Full hero profile with stats, equipped traits, and level progress.
 * Main template for hero management screen.
 */

import React from 'react';
import { Box, Typography, HStack, VStack, Badge, ProgressBar, cn } from '@almadar/ui';
import { HeroAvatar } from '../atoms/HeroAvatar';
import { TraitSlot, TraitData } from '../molecules/TraitSlot';

export interface HeroStats {
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    speed: number;
    leadership: number;
}

export interface HeroData {
    id: string;
    name: string;
    title?: string;
    archetype: string;
    level: number;
    experience: number;
    experienceToNextLevel: number;
    stats: HeroStats;
    equippedTraits: (TraitData | null)[];
    maxTraitSlots: number;
    biography?: string;
}

export interface HeroProfileTemplateProps {
    /** Hero data to display */
    hero: HeroData;
    /** Available traits for equipping */
    availableTraits?: TraitData[];
    /** Whether in edit mode */
    editMode?: boolean;
    /** Handler for trait slot click */
    onTraitSlotClick?: (slotIndex: number) => void;
    /** Handler for trait removal */
    onTraitRemove?: (slotIndex: number) => void;
    /** Handler for level up action */
    onLevelUp?: () => void;
    /** Additional CSS classes */
    className?: string;
}

/**
 * HeroProfileTemplate displays a complete hero profile with all stats and traits.
 */
export function HeroProfileTemplate({
    hero,
    editMode = false,
    onTraitSlotClick,
    onTraitRemove,
    onLevelUp,
    className,
}: HeroProfileTemplateProps): JSX.Element {
    const expProgress = (hero.experience / hero.experienceToNextLevel) * 100;
    const canLevelUp = hero.experience >= hero.experienceToNextLevel;

    return (
        <Box
            className={cn(
                'p-6 bg-gradient-to-br from-card to-background rounded-xl border border-border',
                className
            )}
        >
            {/* Header: Avatar + Name + Level */}
            <HStack gap="lg" align="start">
                <HeroAvatar
                    heroId={hero.id}
                    name={hero.name}
                    level={hero.level}
                    archetype={hero.archetype as any}
                    size="xl"
                />

                <VStack gap="sm" className="flex-1">
                    <HStack justify="between" className="w-full">
                        <VStack gap="none">
                            <Typography variant="h2" className="text-foreground">
                                {hero.name}
                            </Typography>
                            {hero.title && (
                                <Typography variant="body2" className="text-muted-foreground italic">
                                    "{hero.title}"
                                </Typography>
                            )}
                        </VStack>
                        <Badge variant="secondary" size="lg">
                            {hero.archetype}
                        </Badge>
                    </HStack>

                    {/* Experience Bar */}
                    <VStack gap="xs" className="w-full">
                        <HStack justify="between" className="w-full">
                            <Typography variant="caption" className="text-muted-foreground">
                                Level {hero.level}
                            </Typography>
                            <Typography variant="caption" className="text-muted-foreground">
                                {hero.experience} / {hero.experienceToNextLevel} XP
                            </Typography>
                        </HStack>
                        <ProgressBar value={expProgress} variant="warning" size="sm" className="w-full" />
                        {canLevelUp && onLevelUp && (
                            <Box
                                className="mt-1 px-3 py-1 bg-warning/20 border border-warning rounded text-warning text-sm cursor-pointer hover:bg-warning/30 transition-colors text-center"
                                onClick={onLevelUp}
                            >
                                ✨ Level Up Available!
                            </Box>
                        )}
                    </VStack>
                </VStack>
            </HStack>

            {/* Stats Section */}
            <Box className="mt-6 p-4 bg-card/50 rounded-lg">
                <Typography variant="h5" className="text-foreground mb-3">Stats</Typography>
                <div className="grid grid-cols-3 gap-4">
                    <StatItem label="Health" value={hero.stats.health} max={hero.stats.maxHealth} color="green" />
                    <StatItem label="Attack" value={hero.stats.attack} color="red" />
                    <StatItem label="Defense" value={hero.stats.defense} color="blue" />
                    <StatItem label="Speed" value={hero.stats.speed} color="cyan" />
                    <StatItem label="Leadership" value={hero.stats.leadership} color="purple" />
                </div>
            </Box>

            {/* Trait Slots Section */}
            <Box className="mt-6">
                <HStack justify="between" className="mb-3">
                    <Typography variant="h5" className="text-foreground">Equipped Traits</Typography>
                    {editMode && (
                        <Typography variant="caption" className="text-muted-foreground">
                            Click slots to equip/change traits
                        </Typography>
                    )}
                </HStack>
                <HStack gap="sm" wrap>
                    {Array.from({ length: hero.maxTraitSlots }).map((_, index) => {
                        const trait = hero.equippedTraits[index];
                        const isLocked = index >= 2 + Math.floor(hero.level / 5); // Unlock every 5 levels
                        const unlockLevel = 2 + ((index - 2) * 5);

                        return (
                            <TraitSlot
                                key={index}
                                slotNumber={index + 1}
                                equippedTrait={trait || undefined}
                                locked={isLocked}
                                unlockLevel={isLocked ? unlockLevel : undefined}
                                size="lg"
                                onClick={editMode && !isLocked ? () => onTraitSlotClick?.(index) : undefined}
                                onRemove={editMode && trait ? () => onTraitRemove?.(index) : undefined}
                            />
                        );
                    })}
                </HStack>
            </Box>

            {/* Biography */}
            {hero.biography && (
                <Box className="mt-6 p-4 bg-card/30 rounded-lg border-l-4 border-warning/50">
                    <Typography variant="body2" className="text-foreground/80 italic">
                        {hero.biography}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

function StatItem({ label, value, max, color }: { label: string; value: number; max?: number; color: string }) {
    const colorClasses: Record<string, string> = {
        green: 'text-success',
        red: 'text-error',
        blue: 'text-info',
        cyan: 'text-accent',
        purple: 'text-[var(--tw-faction-resonator)]',
    };

    return (
        <VStack align="center" gap="xs">
            <Typography variant="caption" className="text-muted-foreground/70">{label}</Typography>
            <Typography variant="h4" className={colorClasses[color]}>
                {max ? `${value}/${max}` : value}
            </Typography>
        </VStack>
    );
}

export default HeroProfileTemplate;
