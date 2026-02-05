/**
 * BuildingGrid Stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BuildingGrid } from './BuildingGrid';
import { Building, Resources } from '../types/resources';
import { Box } from '@almadar/ui';

const meta: Meta<typeof BuildingGrid> = {
    title: 'Trait Wars/Organisms/BuildingGrid',
    component: BuildingGrid,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
};

export default meta;
type Story = StoryObj<typeof BuildingGrid>;

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
        cost: { gold: 200, wood: 50 },
    },
    {
        id: 'stables-1',
        type: 'stables',
        name: 'Stables',
        level: 0,
        maxLevel: 3,
        description: 'Recruit cavalry units.',
        cost: { gold: 400, wood: 100 },
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
    },
    {
        id: 'well-1',
        type: 'resonanceWell',
        name: 'Resonance Well',
        level: 3,
        maxLevel: 3,
        description: 'Generates resonance each turn.',
        cost: { gold: 500, crystal: 30 },
    },
];

const richResources: Resources = {
    gold: 10000,
    resonance: 500,
    traitShards: 100,
    wood: 300,
    stone: 200,
    crystal: 100,
};

const poorResources: Resources = {
    gold: 100,
    resonance: 10,
    traitShards: 0,
};

export const Default: Story = {
    args: {
        buildings: sampleBuildings,
        playerResources: richResources,
        onBuildingClick: (b) => console.log('Selected:', b.name),
        onBuild: (b) => console.log('Build:', b.name),
    },
    decorators: [
        (Story) => (
            <Box className="max-w-3xl">
                <Story />
            </Box>
        ),
    ],
};

export const LowResources: Story = {
    args: {
        buildings: sampleBuildings,
        playerResources: poorResources,
        onBuildingClick: (b) => console.log('Selected:', b.name),
        onBuild: (b) => console.log('Build:', b.name),
    },
    decorators: [
        (Story) => (
            <Box className="max-w-3xl">
                <Story />
            </Box>
        ),
    ],
};

export const WithSelection: Story = {
    args: {
        buildings: sampleBuildings,
        playerResources: richResources,
        selectedId: 'forge-1',
        onBuildingClick: (b) => console.log('Selected:', b.name),
        onBuild: (b) => console.log('Build:', b.name),
    },
    decorators: [
        (Story) => (
            <Box className="max-w-3xl">
                <Story />
            </Box>
        ),
    ],
};
