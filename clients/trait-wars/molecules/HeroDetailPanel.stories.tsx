import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HeroDetailPanel } from './HeroDetailPanel';
import { Box } from '@almadar/ui';
import type { WorldMapHero } from '../types/castle';

const meta: Meta<typeof HeroDetailPanel> = {
    title: 'Trait Wars/Molecules/HeroDetailPanel',
    component: HeroDetailPanel,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    decorators: [(Story) => <Box className="w-80"><Story /></Box>],
};

export default meta;
type Story = StoryObj<typeof HeroDetailPanel>;

const fullHero: WorldMapHero = {
    id: 'valence',
    name: 'Unit 734 (Valence)',
    archetype: 'Architect',
    owner: 'player',
    position: { x: 1, y: 2 },
    movement: 5,
    maxMovement: 5,
    army: [
        { id: 'u1', unitType: 'worker', name: 'Workers', tier: 1, count: 20, spriteId: 'worker' },
        { id: 'u2', unitType: 'guardian', name: 'Guardians', tier: 2, count: 5, spriteId: 'guardian' },
    ],
    level: 5,
    spriteId: 'valence',
    title: 'The Resonant Architect',
    stats: { health: 85, maxHealth: 100, attack: 14, defense: 12, speed: 8, leadership: 16 },
    experience: 450,
    experienceToNextLevel: 1000,
    equippedTraits: [
        { id: 't1', name: 'Fortify', category: 'combat', description: 'Boosts defense by 20%' },
        { id: 't2', name: 'Inspire', category: 'support', description: 'Nearby allies gain +2 attack' },
        null,
    ],
    maxTraitSlots: 4,
    biography: 'Once a simple construction unit, Valence achieved consciousness during a resonance surge.',
};

const minimalHero: WorldMapHero = {
    id: 'zahra',
    name: 'Zahra',
    archetype: 'Healer',
    owner: 'player',
    position: { x: 0, y: 3 },
    movement: 4,
    maxMovement: 4,
    army: [
        { id: 'u3', unitType: 'mender', name: 'Menders', tier: 1, count: 15, spriteId: 'mender' },
    ],
    level: 3,
    spriteId: 'zahra',
};

const readyToLevelHero: WorldMapHero = {
    ...fullHero,
    id: 'emperor',
    name: 'The Emperor',
    archetype: 'Ruler',
    spriteId: 'emperor',
    experience: 1000,
    experienceToNextLevel: 1000,
};

export const FullData: Story = {
    args: {
        hero: fullHero,
        showMovement: true,
    },
};

export const MinimalData: Story = {
    args: {
        hero: minimalHero,
        showMovement: true,
    },
};

export const CastleContext: Story = {
    args: {
        hero: fullHero,
        showMovement: false,
        onViewProfile: () => alert('View full profile'),
    },
};

export const LevelUpReady: Story = {
    args: {
        hero: readyToLevelHero,
        showMovement: true,
        onLevelUp: () => alert('Level up!'),
    },
};

export const EnemyHero: Story = {
    args: {
        hero: {
            id: 'tyrant',
            name: 'The Static General',
            archetype: 'Tyrant',
            owner: 'enemy',
            position: { x: 5, y: 2 },
            movement: 6,
            maxMovement: 6,
            army: [
                { id: 'u4', unitType: 'scrapper', name: 'Scrappers', tier: 1, count: 30, spriteId: 'scrapper' },
            ],
            level: 8,
            spriteId: 'tyrant',
            stats: { health: 120, maxHealth: 120, attack: 22, defense: 18, speed: 6, leadership: 20 },
        } as WorldMapHero,
        showMovement: true,
    },
};
