/**
 * TileSprite Stories
 *
 * Storybook stories for the TileSprite component.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { TileSprite, TILE_SPRITES, TileType } from './TileSprite';
import { Box } from '../../../components/atoms/Box';
import { Typography } from '../../../components/atoms/Typography';

const meta: Meta<typeof TileSprite> = {
    title: 'Trait Wars/Atoms/TileSprite',
    component: TileSprite,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
    argTypes: {
        type: {
            control: 'select',
            options: Object.keys(TILE_SPRITES),
        },
        highlight: {
            control: 'select',
            options: ['none', 'valid', 'attack', 'selected'],
        },
        scale: {
            control: { type: 'range', min: 1, max: 6, step: 1 },
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        type: 'floorStone',
        scale: 3,
    },
};

export const FloorTypes: Story = {
    render: () => (
        <Box display="flex" className="gap-2 p-4 bg-gray-800 rounded-lg">
            {(['floorStone', 'floorDirt', 'floorWood', 'floorGrass', 'floorWater'] as TileType[]).map((type) => (
                <Box key={type} display="flex" className="flex-col items-center gap-2">
                    <TileSprite type={type} scale={3} />
                    <Typography variant="caption" className="text-white text-xs">
                        {type}
                    </Typography>
                </Box>
            ))}
        </Box>
    ),
};

export const HighlightStates: Story = {
    render: () => (
        <Box display="flex" className="gap-4 p-4 bg-gray-800 rounded-lg">
            {(['none', 'valid', 'attack', 'selected'] as const).map((highlight) => (
                <Box key={highlight} display="flex" className="flex-col items-center gap-2">
                    <TileSprite type="floorStone" highlight={highlight} scale={3} />
                    <Typography variant="caption" className="text-white text-xs">
                        {highlight}
                    </Typography>
                </Box>
            ))}
        </Box>
    ),
};

export const AllTileTypes: Story = {
    render: () => (
        <Box display="flex" className="flex-wrap gap-4 p-4 bg-gray-800 rounded-lg">
            {(Object.keys(TILE_SPRITES) as TileType[]).map((type) => (
                <Box key={type} display="flex" className="flex-col items-center gap-2">
                    <TileSprite type={type} scale={3} />
                    <Typography variant="caption" className="text-white text-xs">
                        {type}
                    </Typography>
                </Box>
            ))}
        </Box>
    ),
};

export const GridExample: Story = {
    render: () => (
        <Box display="grid" className="grid-cols-5 gap-1 p-4 bg-gray-800 rounded-lg">
            {Array.from({ length: 25 }).map((_, i) => {
                const types: TileType[] = ['floorStone', 'floorDirt', 'floorWood', 'floorGrass'];
                return <TileSprite key={i} type={types[i % types.length]} scale={2} />;
            })}
        </Box>
    ),
};
