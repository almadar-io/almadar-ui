/**
 * HexTileSprite Stories
 *
 * Showcases the isometric terrain tiles in "Illuminated Manuscript Futurism" style.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { HexTileSprite } from './HexTileSprite';

const meta: Meta<typeof HexTileSprite> = {
    title: 'Trait Wars/Atoms/HexTileSprite',
    component: HexTileSprite,
    parameters: {
        layout: 'centered',
        backgrounds: {
            default: 'dark',
            values: [
                { name: 'dark', value: '#1a1a2e' },
                { name: 'sepia', value: '#2d2d1f' },
            ],
        },
    },
    argTypes: {
        type: {
            control: 'select',
            options: ['plains', 'forest', 'mountain', 'water', 'fortress', 'castle'],
            description: 'Terrain type to display',
        },
        scale: {
            control: { type: 'range', min: 0.2, max: 1.0, step: 0.1 },
            description: 'Size multiplier',
        },
        highlight: {
            control: 'select',
            options: ['none', 'valid', 'attack', 'selected', 'hover'],
            description: 'Highlight state',
        },
    },
};

export default meta;
type Story = StoryObj<typeof HexTileSprite>;

export const Plains: Story = {
    args: {
        type: 'plains',
        scale: 0.5,
        highlight: 'none',
    },
};

export const Forest: Story = {
    args: {
        type: 'forest',
        scale: 0.5,
        highlight: 'none',
    },
};

export const Mountain: Story = {
    args: {
        type: 'mountain',
        scale: 0.5,
        highlight: 'none',
    },
};

export const Water: Story = {
    args: {
        type: 'water',
        scale: 0.5,
        highlight: 'none',
    },
};

export const Fortress: Story = {
    args: {
        type: 'fortress',
        scale: 0.5,
        highlight: 'none',
    },
};

export const AllTerrains: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '20px' }}>
            <div style={{ textAlign: 'center' }}>
                <HexTileSprite type="plains" scale={0.4} />
                <p style={{ color: '#fff', marginTop: '8px' }}>Plains</p>
            </div>
            <div style={{ textAlign: 'center' }}>
                <HexTileSprite type="forest" scale={0.4} />
                <p style={{ color: '#fff', marginTop: '8px' }}>Forest</p>
            </div>
            <div style={{ textAlign: 'center' }}>
                <HexTileSprite type="mountain" scale={0.4} />
                <p style={{ color: '#fff', marginTop: '8px' }}>Mountain</p>
            </div>
            <div style={{ textAlign: 'center' }}>
                <HexTileSprite type="water" scale={0.4} />
                <p style={{ color: '#fff', marginTop: '8px' }}>Water</p>
            </div>
            <div style={{ textAlign: 'center' }}>
                <HexTileSprite type="fortress" scale={0.4} />
                <p style={{ color: '#fff', marginTop: '8px' }}>Fortress</p>
            </div>
        </div>
    ),
};

export const HighlightStates: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '20px' }}>
            <div style={{ textAlign: 'center' }}>
                <HexTileSprite type="plains" scale={0.4} highlight="none" />
                <p style={{ color: '#fff', marginTop: '8px' }}>None</p>
            </div>
            <div style={{ textAlign: 'center' }}>
                <HexTileSprite type="plains" scale={0.4} highlight="valid" />
                <p style={{ color: '#fff', marginTop: '8px' }}>Valid</p>
            </div>
            <div style={{ textAlign: 'center' }}>
                <HexTileSprite type="plains" scale={0.4} highlight="attack" />
                <p style={{ color: '#fff', marginTop: '8px' }}>Attack</p>
            </div>
            <div style={{ textAlign: 'center' }}>
                <HexTileSprite type="plains" scale={0.4} highlight="selected" />
                <p style={{ color: '#fff', marginTop: '8px' }}>Selected</p>
            </div>
            <div style={{ textAlign: 'center' }}>
                <HexTileSprite type="plains" scale={0.4} highlight="hover" />
                <p style={{ color: '#fff', marginTop: '8px' }}>Hover</p>
            </div>
        </div>
    ),
};
