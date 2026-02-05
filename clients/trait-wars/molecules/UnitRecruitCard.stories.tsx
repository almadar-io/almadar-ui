import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { UnitRecruitCard, UnitRecruitCardProps } from './UnitRecruitCard';
import { Box, VStack } from '@almadar/ui';
import { RobotUnitType } from '../assets';

/**
 * UnitRecruitCard displays a recruitable unit with portrait, stats, cost, and controls.
 */
const meta: Meta<typeof UnitRecruitCard> = {
    title: 'Trait Wars/Molecules/UnitRecruitCard',
    component: UnitRecruitCard,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
    argTypes: {
        tier: {
            control: { type: 'range', min: 1, max: 4 },
        },
        available: {
            control: { type: 'range', min: 0, max: 10 },
        },
    },
};

export default meta;
type Story = StoryObj<typeof UnitRecruitCard>;

// Sample unit data
const SAMPLE_UNITS: Array<{
    id: string;
    name: string;
    unitType: RobotUnitType;
    tier: number;
    attack: number;
    defense: number;
    health: number;
    movement: number;
    goldCost: number;
    resonanceCost?: number;
    fallbackIcon: string;
}> = [
        { id: 'worker', name: 'Worker', unitType: 'worker', tier: 1, attack: 2, defense: 1, health: 8, movement: 4, goldCost: 50, fallbackIcon: '⚙️' },
        { id: 'guardian', name: 'Guardian', unitType: 'guardian', tier: 2, attack: 5, defense: 8, health: 25, movement: 3, goldCost: 200, resonanceCost: 5, fallbackIcon: '🛡️' },
        { id: 'resonator', name: 'Resonator', unitType: 'resonator', tier: 3, attack: 8, defense: 4, health: 18, movement: 5, goldCost: 500, resonanceCost: 15, fallbackIcon: '🔮' },
        { id: 'prime', name: 'Prime', unitType: 'prime', tier: 4, attack: 15, defense: 12, health: 50, movement: 4, goldCost: 1500, resonanceCost: 50, fallbackIcon: '👑' },
    ];

export const Tier1Worker: Story = {
    args: {
        ...SAMPLE_UNITS[0],
        available: 5,
        recruitCount: 0,
    },
};

export const Tier2Guardian: Story = {
    args: {
        ...SAMPLE_UNITS[1],
        available: 3,
        recruitCount: 1,
    },
};

export const Tier3Resonator: Story = {
    args: {
        ...SAMPLE_UNITS[2],
        available: 2,
        recruitCount: 0,
    },
};

export const Tier4Prime: Story = {
    args: {
        ...SAMPLE_UNITS[3],
        available: 1,
        recruitCount: 0,
    },
};

export const Disabled: Story = {
    args: {
        ...SAMPLE_UNITS[1],
        available: 3,
        recruitCount: 0,
        disabled: true,
    },
};

// Interactive story with state
const InteractiveRecruitCard = () => {
    const [counts, setCounts] = useState<Record<string, number>>({});

    return (
        <Box className="w-80 bg-slate-800 p-4 rounded-lg">
            <VStack className="gap-3">
                {SAMPLE_UNITS.map((unit) => (
                    <UnitRecruitCard
                        key={unit.id}
                        {...unit}
                        available={5}
                        recruitCount={counts[unit.id] || 0}
                        onIncrement={() => setCounts((p) => ({ ...p, [unit.id]: Math.min(5, (p[unit.id] || 0) + 1) }))}
                        onDecrement={() => setCounts((p) => ({ ...p, [unit.id]: Math.max(0, (p[unit.id] || 0) - 1) }))}
                        onRecruit={() => {
                            alert(`Recruiting ${counts[unit.id]} ${unit.name}(s)!`);
                            setCounts((p) => ({ ...p, [unit.id]: 0 }));
                        }}
                    />
                ))}
            </VStack>
        </Box>
    );
};

export const AllTiers: Story = {
    render: () => <InteractiveRecruitCard />,
};
