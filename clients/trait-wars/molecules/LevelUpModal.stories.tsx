/**
 * LevelUpModal Stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LevelUpModal, LevelUpData, SkillChoice } from './LevelUpModal';
import { Box, Typography } from '@almadar/ui';

const meta: Meta<typeof LevelUpModal> = {
    title: 'Trait Wars/Molecules/LevelUpModal',
    component: LevelUpModal,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
};

export default meta;
type Story = StoryObj<typeof LevelUpModal>;

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

const leadershipSkill: SkillChoice = {
    id: 'inspiring-presence',
    name: 'Inspiring Presence',
    category: 'leadership',
    description: 'Increases maximum army size by 5 units',
    icon: '👑',
    bonus: '+5 Army Size',
};

const resonanceSkill: SkillChoice = {
    id: 'resonance-amplifier',
    name: 'Resonance Amplifier',
    category: 'resonance',
    description: 'Increases resonance energy regeneration by 20%',
    icon: '🔮',
    bonus: '+20% Regen',
};

const speedSkill: SkillChoice = {
    id: 'swift-tactics',
    name: 'Swift Tactics',
    category: 'speed',
    description: 'Your units act faster in combat initiative order',
    icon: '⚡',
    bonus: '+15% Speed',
};

const traitSkill: SkillChoice = {
    id: 'berserker-trait',
    name: 'Learn Berserker',
    category: 'trait',
    description: 'Unlocks the Berserker trait for your hero to equip',
    icon: '🔥',
    bonus: 'New Trait',
};

const levelUpData: LevelUpData = {
    heroId: 'emperor',
    heroName: 'The Emperor',
    archetype: 'ruler',
    newLevel: 5,
    statBonuses: {
        attack: 5,
        defense: 5,
        health: 10,
    },
    skillChoices: [attackSkill, defenseSkill],
};

export const Default: Story = {
    args: {
        levelUpData,
        isOpen: true,
        onChooseSkill: (id) => console.log('Chose skill:', id),
    },
};

export const LeadershipVsResonance: Story = {
    args: {
        levelUpData: {
            ...levelUpData,
            heroId: 'zahra',
            heroName: 'Zahra',
            archetype: 'caregiver',
            newLevel: 10,
            statBonuses: {
                leadership: 10,
                resonance: 20,
            },
            skillChoices: [leadershipSkill, resonanceSkill],
        },
        isOpen: true,
        onChooseSkill: (id) => console.log('Chose skill:', id),
    },
};

export const SpeedVsTrait: Story = {
    args: {
        levelUpData: {
            ...levelUpData,
            heroId: 'kael',
            heroName: 'Kael',
            archetype: 'orphan',
            newLevel: 7,
            statBonuses: {
                speed: 10,
                attack: 5,
            },
            skillChoices: [speedSkill, traitSkill],
        },
        isOpen: true,
        onChooseSkill: (id) => console.log('Chose skill:', id),
    },
};

export const InteractiveDemo: Story = {
    render: () => {
        const [isOpen, setIsOpen] = React.useState(false);
        const [chosenSkill, setChosenSkill] = React.useState<string | null>(null);

        return (
            <Box className="p-8 min-h-screen bg-slate-900">
                <Box className="text-center mb-8">
                    <Typography variant="h3" className="text-white mb-4">
                        Level Up Demo
                    </Typography>
                    <Box
                        className="inline-block px-6 py-3 bg-amber-500 text-black font-bold rounded-lg cursor-pointer hover:bg-amber-400 transition-colors"
                        onClick={() => setIsOpen(true)}
                    >
                        🎉 Level Up!
                    </Box>
                    {chosenSkill && (
                        <Typography variant="body1" className="text-green-400 mt-4">
                            You chose: {chosenSkill}
                        </Typography>
                    )}
                </Box>
                <LevelUpModal
                    levelUpData={levelUpData}
                    isOpen={isOpen}
                    onChooseSkill={(id) => {
                        setChosenSkill(id);
                        setIsOpen(false);
                    }}
                    onClose={() => setIsOpen(false)}
                />
            </Box>
        );
    },
};
