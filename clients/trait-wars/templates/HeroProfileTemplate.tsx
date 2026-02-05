/**
 * HeroProfileTemplate Component
 *
 * Full hero profile with stats, equipped traits, and level progress.
 * Main template for hero management screen.
 */

import React from 'react';
import { Box, Typography, HStack, VStack, Badge, Progress, cn } from '@almadar/ui';
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
                'p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700',
                className
            )}
        >
            {/* Header: Avatar + Name + Level */}
            <HStack gap={6} align="start">
                <HeroAvatar
                    heroId={hero.id}
                    name={hero.name}
                    level={hero.level}
                    archetype={hero.archetype as any}
                    size="xl"
                />

                <VStack gap={2} className="flex-1">
                    <HStack justify="between" className="w-full">
                        <VStack gap={0}>
                            <Typography variant="h2" className="text-white">
                                {hero.name}
                            </Typography>
                            {hero.title && (
                                <Typography variant="body2" className="text-gray-400 italic">
                                    "{hero.title}"
                                </Typography>
                            )}
                        </VStack>
                        <Badge variant="solid" colorScheme="purple" size="lg">
                            {hero.archetype}
                        </Badge>
                    </HStack>

                    {/* Experience Bar */}
                    <VStack gap={1} className="w-full">
                        <HStack justify="between" className="w-full">
                            <Typography variant="caption" className="text-gray-400">
                                Level {hero.level}
                            </Typography>
                            <Typography variant="caption" className="text-gray-400">
                                {hero.experience} / {hero.experienceToNextLevel} XP
                            </Typography>
                        </HStack>
                        <Progress value={expProgress} colorScheme="yellow" size="sm" className="w-full" />
                        {canLevelUp && onLevelUp && (
                            <Box
                                className="mt-1 px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded text-yellow-400 text-sm cursor-pointer hover:bg-yellow-500/30 transition-colors text-center"
                                onClick={onLevelUp}
                            >
                                ✨ Level Up Available!
                            </Box>
                        )}
                    </VStack>
                </VStack>
            </HStack>

            {/* Stats Section */}
            <Box className="mt-6 p-4 bg-slate-800/50 rounded-lg">
                <Typography variant="h5" className="text-white mb-3">Stats</Typography>
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
                    <Typography variant="h5" className="text-white">Equipped Traits</Typography>
                    {editMode && (
                        <Typography variant="caption" className="text-gray-400">
                            Click slots to equip/change traits
                        </Typography>
                    )}
                </HStack>
                <HStack gap={3} wrap="wrap">
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
                <Box className="mt-6 p-4 bg-slate-800/30 rounded-lg border-l-4 border-amber-500/50">
                    <Typography variant="body2" className="text-gray-300 italic">
                        {hero.biography}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

function StatItem({ label, value, max, color }: { label: string; value: number; max?: number; color: string }) {
    const colorClasses: Record<string, string> = {
        green: 'text-green-400',
        red: 'text-red-400',
        blue: 'text-blue-400',
        cyan: 'text-cyan-400',
        purple: 'text-purple-400',
    };

    return (
        <VStack align="center" gap={1}>
            <Typography variant="caption" className="text-gray-500">{label}</Typography>
            <Typography variant="h4" className={colorClasses[color]}>
                {max ? `${value}/${max}` : value}
            </Typography>
        </VStack>
    );
}

export default HeroProfileTemplate;
