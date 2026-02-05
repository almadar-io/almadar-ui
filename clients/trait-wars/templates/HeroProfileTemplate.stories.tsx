import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HeroProfileTemplate, HeroData } from './HeroProfileTemplate';
import { LevelUpModal, LevelUpData, SkillChoice } from '../molecules/LevelUpModal';
import { Box, Typography } from '@almadar/ui';

const meta: Meta<typeof HeroProfileTemplate> = {
    title: 'Trait Wars/Templates/HeroProfileTemplate',
    component: HeroProfileTemplate,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
};

export default meta;
type Story = StoryObj<typeof HeroProfileTemplate>;

const sampleHero: HeroData = {
    id: 'emperor',
    name: 'The Emperor',
    title: 'The Illuminated Man',
    archetype: 'ruler',
    level: 7,
    experience: 2400,
    experienceToNextLevel: 3000,
    stats: {
        health: 150,
        maxHealth: 150,
        attack: 25,
        defense: 30,
        speed: 12,
        leadership: 50,
    },
    equippedTraits: [
        { id: 'imperial-command', name: 'Imperial Command', category: 'support', description: 'Boosts all ally stats' },
        { id: 'divine-protection', name: 'Divine Protection', category: 'passive', description: 'Reduces incoming damage' },
        null,
        null,
        null,
    ],
    maxTraitSlots: 5,
    biography: 'The Source Code made manifest. Ruler of Iram, keeper of the eternal flame. His word is law, his presence divine.',
};

export const Default: Story = {
    args: {
        hero: sampleHero,
    },
};

export const EditMode: Story = {
    args: {
        hero: sampleHero,
        editMode: true,
        onTraitSlotClick: (index) => console.log('Clicked slot:', index),
        onTraitRemove: (index) => console.log('Remove trait at:', index),
    },
};

export const LowLevel: Story = {
    args: {
        hero: {
            ...sampleHero,
            id: 'kael',
            name: 'Kael',
            title: 'The Survivor',
            archetype: 'orphan',
            level: 2,
            experience: 180,
            experienceToNextLevel: 300,
            stats: { health: 80, maxHealth: 80, attack: 12, defense: 15, speed: 10, leadership: 5 },
            equippedTraits: [
                { id: 'scrap-armor', name: 'Scrap Armor', category: 'passive' },
                null, null, null, null,
            ],
        },
    },
};

export const ReadyToLevelUp: Story = {
    args: {
        hero: {
            ...sampleHero,
            experience: 3000,
            experienceToNextLevel: 3000,
        },
        onLevelUp: () => console.log('Level up!'),
    },
};

// Interactive story with LevelUpModal
const attackSkill: SkillChoice = {
    id: 'offensive-mastery',
    name: 'Offensive Mastery',
    category: 'attack',
    description: 'Increases all damage dealt by your units by 10%',
    icon: '⚔️',
    bonus: '+10% Damage',
};

const defenseSkill: SkillChoice = {
    id: 'iron-will',
    name: 'Iron Will',
    category: 'defense',
    description: 'Reduces all incoming damage to your hero by 15%',
    icon: '🛡️',
    bonus: '+15% Defense',
};

export const LevelUpInteractive: Story = {
    render: () => {
        const [hero, setHero] = React.useState<HeroData>({
            ...sampleHero,
            experience: 3000,
            experienceToNextLevel: 3000,
        });
        const [showLevelUp, setShowLevelUp] = React.useState(false);
        const [chosenSkill, setChosenSkill] = React.useState<string | null>(null);

        const levelUpData: LevelUpData = {
            heroId: hero.id,
            heroName: hero.name,
            archetype: hero.archetype,
            newLevel: hero.level + 1,
            statBonuses: {
                attack: 5,
                defense: 5,
                health: 10,
            },
            skillChoices: [attackSkill, defenseSkill],
        };

        const handleLevelUp = () => {
            setShowLevelUp(true);
        };

        const handleChooseSkill = (skillId: string) => {
            setChosenSkill(skillId);
            setShowLevelUp(false);
            // Update hero to new level
            setHero({
                ...hero,
                level: hero.level + 1,
                experience: 0,
                experienceToNextLevel: 3500,
                stats: {
                    ...hero.stats,
                    attack: hero.stats.attack + 2,
                    defense: hero.stats.defense + 2,
                    health: hero.stats.health + 10,
                    maxHealth: hero.stats.maxHealth + 10,
                },
            });
        };

        return (
            <Box>
                <HeroProfileTemplate
                    hero={hero}
                    onLevelUp={handleLevelUp}
                />
                <LevelUpModal
                    levelUpData={levelUpData}
                    isOpen={showLevelUp}
                    onChooseSkill={handleChooseSkill}
                    onClose={() => setShowLevelUp(false)}
                />
                {chosenSkill && (
                    <Box className="fixed bottom-4 left-1/2 -translate-x-1/2 p-4 bg-green-800 rounded-lg">
                        <Typography variant="body1" className="text-white">
                            ✅ Learned: {chosenSkill === 'offensive-mastery' ? 'Offensive Mastery' : 'Iron Will'}
                        </Typography>
                    </Box>
                )}
            </Box>
        );
    },
};
