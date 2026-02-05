/**
 * HexCell Stories
 *
 * Storybook stories for the HexCell atom.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { HexCell, TerrainType } from './HexCell';
import { Box } from '@almadar/ui';

const meta: Meta<typeof HexCell> = {
    title: 'Trait Wars/Atoms/HexCell',
    component: HexCell,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        terrain: {
            control: 'select',
            options: ['plains', 'forest', 'mountain', 'water', 'fortress'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Plains: Story = {
    args: {
        x: 0,
        y: 0,
        terrain: 'plains',
        showCoordinates: true,
    },
};

export const Forest: Story = {
    args: {
        x: 1,
        y: 0,
        terrain: 'forest',
        showCoordinates: true,
    },
};

export const Mountain: Story = {
    args: {
        x: 2,
        y: 0,
        terrain: 'mountain',
        showCoordinates: true,
    },
};

export const Water: Story = {
    args: {
        x: 3,
        y: 0,
        terrain: 'water',
        showCoordinates: true,
    },
};

export const Fortress: Story = {
    args: {
        x: 4,
        y: 0,
        terrain: 'fortress',
        showCoordinates: true,
    },
};

export const Selected: Story = {
    args: {
        x: 0,
        y: 0,
        terrain: 'plains',
        isSelected: true,
        showCoordinates: true,
    },
};

export const ValidMove: Story = {
    args: {
        x: 1,
        y: 1,
        terrain: 'plains',
        isValidMove: true,
        showCoordinates: true,
    },
};

export const AttackTarget: Story = {
    args: {
        x: 2,
        y: 1,
        terrain: 'plains',
        isAttackTarget: true,
        showCoordinates: true,
    },
};

export const AllTerrains: Story = {
    render: () => (
        <Box display="flex" className="gap-4">
            {(['plains', 'forest', 'mountain', 'water', 'fortress'] as TerrainType[]).map((terrain) => (
                <HexCell
                    key={terrain}
                    x={0}
                    y={0}
                    terrain={terrain}
                    showCoordinates={false}
                />
            ))}
        </Box>
    ),
};

export const Sizes: Story = {
    render: () => (
        <Box display="flex" className="gap-4 items-end">
            <HexCell x={0} y={0} terrain="plains" size="sm" />
            <HexCell x={0} y={0} terrain="plains" size="md" />
            <HexCell x={0} y={0} terrain="plains" size="lg" />
        </Box>
    ),
};
