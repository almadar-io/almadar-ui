/**
 * HexGrid Stories
 *
 * Storybook stories for the HexGrid organism.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { HexGrid, HexTileEntity, GridUnit } from './HexGrid';
import { action } from 'storybook/actions';

const meta: Meta<typeof HexGrid> = {
    title: 'Trait Wars/Organisms/HexGrid',
    component: HexGrid,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        hexSize: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Generate a sample grid
const generateGrid = (width: number, height: number): HexTileEntity[] => {
    const tiles: HexTileEntity[] = [];
    const terrains = ['plains', 'forest', 'mountain', 'water', 'fortress'] as const;

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            tiles.push({
                x,
                y,
                terrain: terrains[Math.floor(Math.random() * 4)] || 'plains', // Less fortress
            });
        }
    }

    return tiles;
};

const sampleTiles: HexTileEntity[] = generateGrid(5, 4);

const sampleUnits: GridUnit[] = [
    { id: 'unit-1', position: { x: 1, y: 1 }, owner: 'player', unitType: 'knight' },
    { id: 'unit-2', position: { x: 3, y: 2 }, owner: 'enemy', unitType: 'mage' },
    { id: 'unit-3', position: { x: 2, y: 0 }, owner: 'player', unitType: 'archer' },
];

export const Default: Story = {
    args: {
        tiles: sampleTiles,
        units: sampleUnits,
        onTileClick: action('onTileClick'),
        onUnitClick: action('onUnitClick'),
    },
};

export const WithCoordinates: Story = {
    args: {
        tiles: sampleTiles,
        units: sampleUnits,
        showCoordinates: true,
        onTileClick: action('onTileClick'),
        onUnitClick: action('onUnitClick'),
    },
};

export const SmallHexes: Story = {
    args: {
        tiles: sampleTiles,
        units: sampleUnits,
        hexSize: 'sm',
        onTileClick: action('onTileClick'),
    },
};

export const LargeHexes: Story = {
    args: {
        tiles: sampleTiles,
        units: sampleUnits,
        hexSize: 'lg',
        showCoordinates: true,
        onTileClick: action('onTileClick'),
    },
};

export const WithValidMoves: Story = {
    args: {
        tiles: sampleTiles,
        units: sampleUnits,
        selectedUnit: sampleUnits[0],
        validMoves: [
            { x: 0, y: 1 },
            { x: 1, y: 0 },
            { x: 2, y: 1 },
            { x: 1, y: 2 },
        ],
        onTileClick: action('onTileClick'),
        onUnitClick: action('onUnitClick'),
    },
};

export const WithAttackTargets: Story = {
    args: {
        tiles: sampleTiles,
        units: sampleUnits,
        selectedUnit: sampleUnits[0],
        attackTargets: [{ x: 3, y: 2 }],
        onTileClick: action('onTileClick'),
        onUnitClick: action('onUnitClick'),
    },
};

export const EmptyGrid: Story = {
    args: {
        tiles: generateGrid(4, 3),
        units: [],
        showCoordinates: true,
        onTileClick: action('onTileClick'),
    },
};
