/**
 * CastleTemplate Stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CastleTemplate } from './CastleTemplate';
import { CastleData, Building, Resources } from '../types/resources';

const meta: Meta<typeof CastleTemplate> = {
    title: 'Trait Wars/Templates/CastleTemplate',
    component: CastleTemplate,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
};

export default meta;
type Story = StoryObj<typeof CastleTemplate>;

const sampleBuildings: Building[] = [
    {
        id: 'townhall-1',
        type: 'townHall',
        name: 'Town Hall',
        level: 2,
        maxLevel: 5,
        description: 'Main building. Unlocks other structures.',
        cost: { gold: 500 },
    },
    {
        id: 'barracks-1',
        type: 'barracks',
        name: 'Barracks',
        level: 1,
        maxLevel: 3,
        description: 'Recruit infantry units.',
        cost: { gold: 200 },
        income: { gold: 50, resonance: 0, traitShards: 0 },
    },
    {
        id: 'stables-1',
        type: 'stables',
        name: 'Stables',
        level: 0,
        maxLevel: 3,
        description: 'Recruit cavalry units.',
        cost: { gold: 400 },
    },
    {
        id: 'arcane-1',
        type: 'arcaneTower',
        name: 'Arcane Tower',
        level: 0,
        maxLevel: 3,
        description: 'Recruit mage units.',
        cost: { gold: 600, crystal: 50 },
    },
    {
        id: 'forge-1',
        type: 'traitForge',
        name: 'Trait Forge',
        level: 1,
        maxLevel: 5,
        description: 'Create and upgrade traits.',
        cost: { gold: 800, traitShards: 10 },
        income: { gold: 0, resonance: 20, traitShards: 2 },
    },
    {
        id: 'well-1',
        type: 'resonanceWell',
        name: 'Resonance Well',
        level: 2,
        maxLevel: 3,
        description: 'Generates resonance each turn.',
        cost: { gold: 500, crystal: 30 },
        income: { gold: 0, resonance: 50, traitShards: 0 },
    },
];

const sampleCastle: CastleData = {
    id: 'castle-iram',
    name: 'Citadel of Iram',
    owner: 'player',
    buildings: sampleBuildings,
    garrisonSize: 15,
    maxGarrison: 50,
    defense: 200,
};

const sampleResources: Resources = {
    gold: 5000,
    resonance: 150,
    traitShards: 25,
    wood: 100,
    stone: 80,
    crystal: 40,
};

export const Default: Story = {
    args: {
        castle: sampleCastle,
        resources: sampleResources,
        onBuild: (b, r) => console.log('Built:', b.name, 'Remaining:', r),
        onRecruit: (type, count) => console.log('Recruit:', type, count),
        onExit: () => console.log('Exit castle'),
    },
};

export const EmptyCastle: Story = {
    args: {
        castle: {
            ...sampleCastle,
            buildings: sampleBuildings.map((b) => ({ ...b, level: 0 })),
            garrisonSize: 0,
        },
        resources: {
            gold: 1000,
            resonance: 50,
            traitShards: 5,
        },
        onBuild: (b) => console.log('Built:', b.name),
        onExit: () => console.log('Exit castle'),
    },
};

export const FullyUpgraded: Story = {
    args: {
        castle: {
            ...sampleCastle,
            buildings: sampleBuildings.map((b) => ({ ...b, level: b.maxLevel })),
            garrisonSize: 50,
            maxGarrison: 50,
            defense: 500,
        },
        resources: {
            gold: 50000,
            resonance: 2000,
            traitShards: 200,
        },
        onExit: () => console.log('Exit castle'),
    },
};
