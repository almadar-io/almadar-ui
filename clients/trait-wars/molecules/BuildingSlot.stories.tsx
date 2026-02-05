import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BuildingSlot, BuildingSlotProps } from './BuildingSlot';
import { Box, HStack } from '@almadar/ui';

/**
 * BuildingSlot displays a castle building with sprite and level indicator.
 */
const meta: Meta<typeof BuildingSlot> = {
    title: 'Trait Wars/Molecules/BuildingSlot',
    component: BuildingSlot,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        buildingType: {
            control: 'select',
            options: ['townHall', 'barracks', 'arcaneTower', 'traitForge', 'resonanceWell', 'treasury', 'marketplace', 'library', 'portal'],
        },
        level: {
            control: { type: 'range', min: 0, max: 5 },
        },
        maxLevel: {
            control: { type: 'range', min: 1, max: 5 },
        },
    },
};

export default meta;
type Story = StoryObj<typeof BuildingSlot>;

// Fallback icons for buildings when no manifest
const BUILDING_ICONS: Record<string, string> = {
    townHall: '🏛️',
    barracks: '⚔️',
    arcaneTower: '🗼',
    traitForge: '🔥',
    resonanceWell: '💧',
    treasury: '💰',
    marketplace: '🏪',
    library: '📚',
    portal: '🌀',
};

export const Default: Story = {
    args: {
        buildingType: 'townHall',
        name: 'Town Hall',
        level: 2,
        maxLevel: 3,
        fallbackIcon: BUILDING_ICONS.townHall,
    },
};

export const Unbuilt: Story = {
    args: {
        buildingType: 'arcaneTower',
        name: 'Arcane Tower',
        level: 0,
        maxLevel: 3,
        fallbackIcon: BUILDING_ICONS.arcaneTower,
    },
};

export const Selected: Story = {
    args: {
        buildingType: 'traitForge',
        name: 'Trait Forge',
        level: 1,
        maxLevel: 3,
        isSelected: true,
        fallbackIcon: BUILDING_ICONS.traitForge,
    },
};

export const AllBuildings: Story = {
    render: () => (
        <Box className="bg-slate-900 p-6 rounded-lg">
            <HStack className="gap-4 flex-wrap">
                {Object.entries(BUILDING_ICONS).map(([type, icon]) => (
                    <Box key={type} className="w-24 h-24">
                        <BuildingSlot
                            buildingType={type as any}
                            name={type.replace(/([A-Z])/g, ' $1').trim()}
                            level={Math.floor(Math.random() * 4)}
                            maxLevel={3}
                            fallbackIcon={icon}
                        />
                    </Box>
                ))}
            </HStack>
        </Box>
    ),
};
