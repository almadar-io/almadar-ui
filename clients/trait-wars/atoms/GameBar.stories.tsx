import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { GameBar } from './GameBar';
import { VStack, Typography, Box } from '@almadar/ui';

const meta: Meta<typeof GameBar> = {
    title: 'Trait Wars/Atoms/GameBar',
    component: GameBar,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    argTypes: {
        type: {
            control: 'select',
            options: ['health', 'xp', 'gold', 'resonance'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof GameBar>;

export const HealthBar: Story = {
    args: {
        type: 'health',
        value: 75,
        max: 100,
        size: 'md',
    },
    decorators: [(Story) => <Box className="w-64"><Story /></Box>],
};

export const XPBar: Story = {
    args: {
        type: 'xp',
        value: 450,
        max: 1000,
        size: 'md',
    },
    decorators: [(Story) => <Box className="w-64"><Story /></Box>],
};

export const GoldBar: Story = {
    args: {
        type: 'gold',
        value: 300,
        max: 500,
        size: 'sm',
    },
    decorators: [(Story) => <Box className="w-64"><Story /></Box>],
};

export const ResonanceBar: Story = {
    args: {
        type: 'resonance',
        value: 20,
        max: 50,
        size: 'md',
    },
    decorators: [(Story) => <Box className="w-64"><Story /></Box>],
};

export const Empty: Story = {
    args: {
        type: 'health',
        value: 0,
        max: 100,
        size: 'md',
    },
    decorators: [(Story) => <Box className="w-64"><Story /></Box>],
};

export const Full: Story = {
    args: {
        type: 'health',
        value: 100,
        max: 100,
        size: 'md',
    },
    decorators: [(Story) => <Box className="w-64"><Story /></Box>],
};

export const AllTypes: Story = {
    render: () => (
        <VStack className="gap-4 w-72">
            <Box>
                <Typography variant="caption" className="text-muted-foreground mb-1 block">Health</Typography>
                <GameBar type="health" value={65} max={100} />
            </Box>
            <Box>
                <Typography variant="caption" className="text-muted-foreground mb-1 block">XP</Typography>
                <GameBar type="xp" value={750} max={1000} />
            </Box>
            <Box>
                <Typography variant="caption" className="text-muted-foreground mb-1 block">Gold</Typography>
                <GameBar type="gold" value={230} max={500} />
            </Box>
            <Box>
                <Typography variant="caption" className="text-muted-foreground mb-1 block">Resonance</Typography>
                <GameBar type="resonance" value={15} max={50} />
            </Box>
        </VStack>
    ),
};

export const SmallSize: Story = {
    render: () => (
        <VStack className="gap-2 w-48">
            <GameBar type="health" value={80} max={100} size="sm" />
            <GameBar type="xp" value={300} max={1000} size="sm" />
            <GameBar type="gold" value={100} max={500} size="sm" />
            <GameBar type="resonance" value={10} max={50} size="sm" />
        </VStack>
    ),
};
