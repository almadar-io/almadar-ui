/**
 * MapNode Stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MapNode, LocationType } from './MapNode';
import { Box } from '@almadar/ui';

const meta: Meta<typeof MapNode> = {
    title: 'Trait Wars/Atoms/MapNode',
    component: MapNode,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
};

export default meta;
type Story = StoryObj<typeof MapNode>;

export const City: Story = {
    args: {
        id: 'city-1',
        type: 'city',
        name: 'Iram',
        x: 50,
        y: 50,
        owner: 'player',
    },
    decorators: [
        (Story) => (
            <Box className="relative w-64 h-64 bg-slate-800">
                <Story />
            </Box>
        ),
    ],
};

export const Castle: Story = {
    args: {
        id: 'castle-1',
        type: 'castle',
        name: 'The Citadel',
        x: 50,
        y: 50,
        owner: 'enemy',
    },
    decorators: [
        (Story) => (
            <Box className="relative w-64 h-64 bg-slate-800">
                <Story />
            </Box>
        ),
    ],
};

export const Dungeon: Story = {
    args: {
        id: 'dungeon-1',
        type: 'dungeon',
        name: 'Dark Cavern',
        x: 50,
        y: 50,
    },
    decorators: [
        (Story) => (
            <Box className="relative w-64 h-64 bg-slate-800">
                <Story />
            </Box>
        ),
    ],
};

export const AllTypes: Story = {
    render: () => {
        const types: LocationType[] = ['city', 'castle', 'dungeon', 'resource', 'battle', 'treasure', 'portal'];
        return (
            <Box className="relative w-[600px] h-[300px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg border border-slate-700">
                {types.map((type, i) => (
                    <MapNode
                        key={type}
                        id={`node-${type}`}
                        type={type}
                        name={type.charAt(0).toUpperCase() + type.slice(1)}
                        x={15 + i * 12}
                        y={50}
                        onClick={() => console.log('Clicked:', type)}
                    />
                ))}
            </Box>
        );
    },
};

export const SelectedNode: Story = {
    args: {
        id: 'selected-1',
        type: 'castle',
        name: 'Selected Castle',
        x: 50,
        y: 50,
        selected: true,
        owner: 'player',
    },
    decorators: [
        (Story) => (
            <Box className="relative w-64 h-64 bg-slate-800">
                <Story />
            </Box>
        ),
    ],
};

export const VisitedNode: Story = {
    args: {
        id: 'visited-1',
        type: 'treasure',
        name: 'Looted Chest',
        x: 50,
        y: 50,
        visited: true,
    },
    decorators: [
        (Story) => (
            <Box className="relative w-64 h-64 bg-slate-800">
                <Story />
            </Box>
        ),
    ],
};

export const InaccessibleNode: Story = {
    args: {
        id: 'locked-1',
        type: 'portal',
        name: 'Sealed Portal',
        x: 50,
        y: 50,
        accessible: false,
    },
    decorators: [
        (Story) => (
            <Box className="relative w-64 h-64 bg-slate-800">
                <Story />
            </Box>
        ),
    ],
};
