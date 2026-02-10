import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { CastleTemplate } from './CastleTemplate';
import type { CastleSlotContext } from './CastleTemplate';
import type { IsometricTile, IsometricFeature, IsometricUnit } from '../organisms/game/types/isometric';

// =============================================================================
// MOCK DATA
// =============================================================================

function generateCastleTiles(w = 10, h = 10): IsometricTile[] {
    const tiles: IsometricTile[] = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const isWall = x === 0 || y === 0 || x === w - 1 || y === h - 1;
            tiles.push({
                x,
                y,
                terrain: isWall ? 'stone_wall' : 'stone_floor',
                passable: !isWall,
            });
        }
    }
    return tiles;
}

const MOCK_FEATURES: IsometricFeature[] = [
    { x: 2, y: 2, type: 'townHall' },
    { x: 5, y: 2, type: 'barracks' },
    { x: 2, y: 5, type: 'arcaneTower' },
    { x: 5, y: 5, type: 'traitForge' },
    { x: 7, y: 3, type: 'marketplace' },
];

const MOCK_UNITS: IsometricUnit[] = [
    { id: 'guard-1', position: { x: 3, y: 4 }, name: 'Guard x5', team: 'player' },
    { id: 'guard-2', position: { x: 4, y: 6 }, name: 'Mage x2', team: 'player' },
    { id: 'hero', position: { x: 4, y: 8 }, name: 'Sir Kaelen', team: 'player' },
];

// =============================================================================
// META
// =============================================================================

const meta: Meta<typeof CastleTemplate> = {
    title: 'Templates/Game/CastleTemplate',
    component: CastleTemplate,
    parameters: { layout: 'fullscreen' },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// SLOT HELPERS
// =============================================================================

function DefaultHeader(_ctx: CastleSlotContext) {
    return (
        <div
            style={{
                padding: 16,
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(to right, #1a1a2e, #16213e)',
            }}
        >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 24 }}>🏰</span>
                <div>
                    <h3 style={{ margin: 0, color: '#f1c40f' }}>Stronghold of Light</h3>
                    <span style={{ fontSize: 12, color: '#888' }}>Resonator Faction</span>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ color: '#f1c40f' }}>🪙 1200</span>
                <span style={{ color: '#a855f7' }}>🔮 450</span>
                <span style={{ color: '#3b82f6' }}>💎 30</span>
            </div>
        </div>
    );
}

function DefaultSidePanel(ctx: CastleSlotContext) {
    const ICONS: Record<string, string> = {
        townHall: '🏛️', barracks: '⚔️', arcaneTower: '🗼', traitForge: '🔥', marketplace: '🏪',
    };
    return (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h4 style={{ margin: 0 }}>Buildings</h4>
            {ctx.selectedFeature ? (
                <div style={{ padding: 12, borderRadius: 8, border: '1px solid #555', background: '#222' }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>
                        {ICONS[ctx.selectedFeature.type] ?? '🏗️'} {ctx.selectedFeature.type}
                    </div>
                    <p style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>
                        Click to upgrade or manage this building.
                    </p>
                    <button
                        onClick={ctx.clearSelection}
                        style={{ marginTop: 8, padding: '4px 12px', borderRadius: 6, border: '1px solid #666', cursor: 'pointer' }}
                    >
                        Close
                    </button>
                </div>
            ) : (
                <p style={{ fontSize: 13, color: '#888' }}>Click a building on the courtyard to inspect it.</p>
            )}
            <hr />
            <h4 style={{ margin: 0 }}>Garrison</h4>
            <p style={{ fontSize: 13, color: '#888' }}>3 unit stacks stationed</p>
        </div>
    );
}

// =============================================================================
// STORIES
// =============================================================================

export const Default: Story = {
    args: {
        tiles: generateCastleTiles(),
        features: MOCK_FEATURES,
        units: MOCK_UNITS,
        scale: 0.45,
        header: DefaultHeader,
        sidePanel: DefaultSidePanel,
    },
};

export const MinimalNoSlots: Story = {
    args: {
        tiles: generateCastleTiles(),
        features: MOCK_FEATURES,
        units: MOCK_UNITS,
        scale: 0.45,
    },
};
