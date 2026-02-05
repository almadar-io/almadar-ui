import type { Meta, StoryObj } from '@storybook/react';
import { HeroProfileTemplate, HeroData } from './HeroProfileTemplate';

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
