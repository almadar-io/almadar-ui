import type { Meta, StoryObj } from '@storybook/react';
import { UnitRoster, UnitData } from './UnitRoster';
import { Box, VStack, Typography } from '@almadar/ui';

const meta: Meta<typeof UnitRoster> = {
    title: 'Trait Wars/Organisms/UnitRoster',
    component: UnitRoster,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
};

export default meta;
type Story = StoryObj<typeof UnitRoster>;

const sampleUnits: UnitData[] = [
    { id: '1', name: 'Knight', characterType: 'knight', team: 'player', health: 100, maxHealth: 100, attack: 15, defense: 12, movement: 3, cost: 100, available: 5 },
    { id: '2', name: 'Mage', characterType: 'mage', team: 'player', health: 60, maxHealth: 60, attack: 20, defense: 5, movement: 4, cost: 150, available: 3 },
    { id: '3', name: 'Healer', characterType: 'healer', team: 'player', health: 50, maxHealth: 50, attack: 5, defense: 8, movement: 4, cost: 120, available: 4 },
    { id: '4', name: 'Archer', characterType: 'archer', team: 'player', health: 70, maxHealth: 70, attack: 18, defense: 6, movement: 5, cost: 130, available: 4 },
    { id: '5', name: 'Warrior', characterType: 'warrior', team: 'player', health: 120, maxHealth: 120, attack: 18, defense: 15, movement: 2, cost: 180, available: 2 },
    { id: '6', name: 'Rogue', characterType: 'rogue', team: 'player', health: 65, maxHealth: 65, attack: 22, defense: 4, movement: 6, cost: 140, available: 3 },
];

export const Default: Story = {
    args: {
        units: sampleUnits,
        columns: 3,
        onSelect: (unit) => console.log('Selected:', unit.name),
    },
};

export const WithSelection: Story = {
    args: {
        units: sampleUnits,
        selectedIds: ['1', '3'],
        maxSelect: 4,
        columns: 3,
    },
};

export const MaxSelected: Story = {
    args: {
        units: sampleUnits,
        selectedIds: ['1', '2', '3', '4'],
        maxSelect: 4,
        columns: 4,
    },
};

export const ArmyBuilder: Story = {
    render: () => (
        <VStack gap={4} className="max-w-3xl">
            <Typography variant="h3" className="text-white">Recruit Units</Typography>
            <Typography variant="body2" className="text-gray-400">
                Select up to 6 units for your army. Gold: 500
            </Typography>
            <UnitRoster
                units={sampleUnits}
                selectedIds={['1', '2']}
                maxSelect={6}
                columns={3}
                onSelect={(unit) => console.log('Add:', unit.name)}
                onDeselect={(unit) => console.log('Remove:', unit.name)}
            />
        </VStack>
    ),
};
