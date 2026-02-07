/**
 * LevelUpModal Component
 *
 * HoMM-style level-up modal presenting two skill choices.
 * Hero gains stat bonuses and chooses one of two offered skills/traits.
 */

import React from 'react';
import { Box, Typography, HStack, VStack, Badge, cn } from '@almadar/ui';
import { HeroAvatar } from '../atoms/HeroAvatar';

export interface SkillChoice {
    id: string;
    name: string;
    category: 'attack' | 'defense' | 'leadership' | 'resonance' | 'speed' | 'trait';
    description: string;
    icon: string;
    bonus?: string;
}

export interface LevelUpData {
    heroId: string;
    heroName: string;
    archetype: string;
    newLevel: number;
    statBonuses: {
        attack?: number;
        defense?: number;
        health?: number;
        speed?: number;
        leadership?: number;
        resonance?: number;
    };
    skillChoices: [SkillChoice, SkillChoice];
}

export interface LevelUpModalProps {
    /** Level up data */
    levelUpData: LevelUpData;
    /** Whether modal is visible */
    isOpen: boolean;
    /** Handler when skill is chosen */
    onChooseSkill: (skillId: string) => void;
    /** Handler to close modal */
    onClose?: () => void;
    /** Additional CSS classes */
    className?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    attack: { bg: 'rgba(192,64,64,0.2)', border: '#c04040', text: 'text-error' },
    defense: { bg: 'rgba(59,130,246,0.2)', border: '#3b82f6', text: 'text-info' },
    leadership: { bg: 'rgba(124,58,237,0.2)', border: '#7c3aed', text: 'text-[var(--tw-faction-resonator)]' },
    resonance: { bg: 'rgba(234,179,8,0.2)', border: '#eab308', text: 'text-primary' },
    speed: { bg: 'rgba(74,158,74,0.2)', border: '#4a9e4a', text: 'text-success' },
    trait: { bg: 'rgba(236,72,153,0.2)', border: '#ec4899', text: 'text-accent' },
};

/**
 * LevelUpModal displays a HoMM-style level-up screen with two skill choices.
 */
export function LevelUpModal({
    levelUpData,
    isOpen,
    onChooseSkill,
    onClose,
    className,
}: LevelUpModalProps): JSX.Element | null {
    if (!isOpen) return null;

    const { heroId, heroName, archetype, newLevel, statBonuses, skillChoices } = levelUpData;

    return (
        <div
            className={cn(
                'fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm',
                className
            )}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={onClose}
        >
            <Box
                className="relative max-w-2xl w-full mx-4 p-6 bg-gradient-to-b from-card to-background rounded-xl border-2 border-primary/50 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Golden glow effect */}
                <Box
                    position="absolute"
                    className="inset-0 rounded-xl pointer-events-none"
                    style={{
                        boxShadow: '0 0 60px rgba(234,179,8,0.3), inset 0 0 30px rgba(234,179,8,0.1)',
                    }}
                />

                {/* Header with Level Badge */}
                <VStack className="items-center mb-6 relative">
                    <Typography variant="h4" className="text-primary font-bold tracking-wide">
                        ✨ LEVEL UP! ✨
                    </Typography>
                    <HStack className="items-center mt-4 gap-4">
                        <HeroAvatar
                            heroId={heroId}
                            name={heroName}
                            level={newLevel}
                            archetype={archetype as any}
                            size="lg"
                        />
                        <VStack className="gap-1">
                            <Typography variant="h3" className="text-foreground">
                                {heroName}
                            </Typography>
                            <Typography variant="body2" className="text-muted-foreground">
                                has reached level
                            </Typography>
                            <Badge variant="default" size="lg" className="bg-primary text-primary-foreground font-bold text-lg px-4 py-1">
                                {newLevel}
                            </Badge>
                        </VStack>
                    </HStack>
                </VStack>

                {/* Stat Bonuses */}
                <Box className="mb-6 p-3 bg-muted/50 rounded-lg border border-border">
                    <Typography variant="caption" className="text-muted-foreground block mb-2 text-center">
                        Stat Bonuses
                    </Typography>
                    <HStack className="justify-center gap-4 flex-wrap">
                        {statBonuses.attack && (
                            <Badge className="bg-transparent border border-error text-error">
                                ⚔️ +{statBonuses.attack}% Attack
                            </Badge>
                        )}
                        {statBonuses.defense && (
                            <Badge className="bg-transparent border border-info text-info">
                                🛡️ +{statBonuses.defense}% Defense
                            </Badge>
                        )}
                        {statBonuses.health && (
                            <Badge className="bg-transparent border border-success text-success">
                                ❤️ +{statBonuses.health} Health
                            </Badge>
                        )}
                        {statBonuses.speed && (
                            <Badge className="bg-transparent border border-accent text-accent">
                                ⚡ +{statBonuses.speed}% Speed
                            </Badge>
                        )}
                        {statBonuses.leadership && (
                            <Badge className="bg-transparent border border-[var(--tw-faction-resonator)] text-[var(--tw-faction-resonator)]">
                                👑 +{statBonuses.leadership}% Leadership
                            </Badge>
                        )}
                        {statBonuses.resonance && (
                            <Badge className="bg-transparent border border-primary text-primary">
                                🔮 +{statBonuses.resonance} Resonance
                            </Badge>
                        )}
                    </HStack>
                </Box>

                {/* Skill Choice Section */}
                <Box className="mb-4">
                    <Typography variant="h5" className="text-foreground text-center mb-4">
                        Choose a Skill to Learn
                    </Typography>
                    <HStack className="gap-4 justify-center">
                        {skillChoices.map((skill, index) => {
                            const colors = CATEGORY_COLORS[skill.category] || CATEGORY_COLORS.trait;
                            return (
                                <Box
                                    key={skill.id}
                                    className={cn(
                                        'flex-1 max-w-xs p-4 rounded-lg cursor-pointer transition-all duration-200',
                                        'border-2 hover:scale-105 hover:shadow-lg'
                                    )}
                                    style={{
                                        backgroundColor: colors.bg,
                                        borderColor: colors.border,
                                    }}
                                    onClick={() => onChooseSkill(skill.id)}
                                >
                                    <VStack className="items-center gap-3">
                                        <Typography variant="h3" className="text-4xl">
                                            {skill.icon}
                                        </Typography>
                                        <Typography variant="h5" className={cn('font-bold', colors.text)}>
                                            {skill.name}
                                        </Typography>
                                        <Typography variant="body2" className="text-foreground/80 text-center">
                                            {skill.description}
                                        </Typography>
                                        {skill.bonus && (
                                            <Badge variant="default" className="bg-white/10">
                                                {skill.bonus}
                                            </Badge>
                                        )}
                                        <Box className="mt-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                                            <Typography variant="caption" className="text-foreground font-medium">
                                                Select
                                            </Typography>
                                        </Box>
                                    </VStack>
                                </Box>
                            );
                        })}
                    </HStack>
                </Box>

                {/* Close hint */}
                <Typography variant="caption" className="text-muted-foreground text-center block mt-4">
                    Click on a skill to choose it
                </Typography>
            </Box>
        </div>
    );
}

export default LevelUpModal;
