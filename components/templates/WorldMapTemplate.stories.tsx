import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { WorldMapTemplate } from './WorldMapTemplate';
import type { MapHero, MapHex, WorldMapSlotContext } from './WorldMapTemplate';
import type { IsometricFeature } from '../organisms/game/types/isometric';

// =============================================================================
// MOCK DATA
// =============================================================================

function generateWorldHexes(w = 10, h = 8): MapHex[] {
    const terrains = ['grass', 'forest', 'plains', 'mountain', 'swamp'];
    const hexes: MapHex[] = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const t = terrains[(x * 3 + y * 7) % terrains.length];
            hexes.push({
                x,
                y,
                terrain: t,
                passable: t !== 'mountain',
                feature: (x === 3 && y === 2) ? 'goldMine'
                    : (x === 7 && y === 1) ? 'resonanceCrystal'
                        : (x === 5 && y === 5) ? 'castle'
                            : undefined,
                featureData: (x === 3 && y === 2) ? { resourceType: 'gold', resourceAmount: 300 }
                    : (x === 7 && y === 1) ? { resourceType: 'resonance', resourceAmount: 150 }
                        : (x === 5 && y === 5) ? { castleId: 'castle-1' }
                            : undefined,
            });
        }
    }
    return hexes;
}

const MOCK_HEROES: MapHero[] = [
    { id: 'hero-1', name: 'Sir Kaelen', owner: 'player', position: { x: 1, y: 1 }, movement: 4, level: 5 },
    { id: 'hero-2', name: 'Lady Lumina', owner: 'player', position: { x: 2, y: 5 }, movement: 3, level: 3 },
    { id: 'enemy-1', name: 'Overlord Vexx', owner: 'enemy', position: { x: 8, y: 3 }, movement: 3, level: 6 },
    { id: 'enemy-2', name: 'Dread Scout', owner: 'enemy', position: { x: 6, y: 6 }, movement: 5, level: 2 },
];

const MOCK_FEATURES: IsometricFeature[] = [
    { x: 3, y: 2, type: 'goldMine' },
    { x: 7, y: 1, type: 'resonanceCrystal' },
    { x: 5, y: 5, type: 'castle' },
];

// =============================================================================
// META
// =============================================================================

const meta: Meta<typeof WorldMapTemplate> = {
    title: 'Templates/Game/WorldMapTemplate',
    component: WorldMapTemplate,
    parameters: { layout: 'fullscreen' },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// SLOT HELPERS
// =============================================================================

function DefaultHeader(ctx: WorldMapSlotContext) {
    return (
        <div style={{
            padding: 16,
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to right, #0f172a, #1e293b)',
        }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 22 }}>🗺️</span>
                <h3 style={{ margin: 0 }}>Strategic World Map</h3>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <span style={{ color: '#f1c40f' }}>🪙 1200</span>
                <span style={{ color: '#a855f7' }}>🔮 450</span>
                {ctx.selectedHero && (
                    <span style={{
                        padding: '2px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        background: '#10b981',
                        color: '#fff',
                    }}>
                        {ctx.selectedHero.name} — {ctx.validMoves.length} moves
                    </span>
                )}
            </div>
        </div>
    );
}

function DefaultSidePanel(ctx: WorldMapSlotContext) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {ctx.selectedHero && (
                <div style={{ padding: 12, borderRadius: 8, border: '1px solid #10b981', background: '#10b98115' }}>
                    <h4 style={{ margin: 0, color: '#10b981' }}>{ctx.selectedHero.name}</h4>
                    <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0' }}>
                        Level {ctx.selectedHero.level ?? '?'} — Movement: {ctx.selectedHero.movement}
                    </p>
                </div>
            )}
            <div>
                <h4 style={{ margin: '0 0 8px' }}>Your Heroes</h4>
                {['hero-1', 'hero-2'].map(id => {
                    const h = MOCK_HEROES.find(h => h.id === id)!;
                    return (
                        <div
                            key={id}
                            onClick={() => ctx.selectHero(id)}
                            style={{
                                padding: 8,
                                borderRadius: 6,
                                marginBottom: 4,
                                cursor: 'pointer',
                                border: ctx.selectedHero?.id === id ? '1px solid #10b981' : '1px solid #333',
                                background: ctx.selectedHero?.id === id ? '#10b98120' : 'transparent',
                            }}
                        >
                            <span style={{ fontWeight: 600 }}>{h.name}</span>
                            <span style={{ float: 'right', fontSize: 12, color: h.movement > 0 ? '#10b981' : '#666' }}>
                                {h.movement} moves
                            </span>
                        </div>
                    );
                })}
            </div>
            <hr />
            <div>
                <h4 style={{ margin: '0 0 8px', color: '#ef4444' }}>Enemy Heroes</h4>
                {['enemy-1', 'enemy-2'].map(id => {
                    const h = MOCK_HEROES.find(h => h.id === id)!;
                    return (
                        <div key={id} style={{ padding: 8, borderRadius: 6, marginBottom: 4, border: '1px solid #ef444444', background: '#ef444410' }}>
                            <span style={{ fontWeight: 600, color: '#ef4444' }}>{h.name}</span>
                            <span style={{ float: 'right', fontSize: 12, color: '#888' }}>Lv {h.level}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// =============================================================================
// STORIES
// =============================================================================

export const Default: Story = {
    args: {
        hexes: generateWorldHexes(),
        heroes: MOCK_HEROES,
        features: MOCK_FEATURES,
        scale: 0.4,
        header: DefaultHeader,
        sidePanel: DefaultSidePanel,
        onHeroSelect: (id) => console.log('Selected hero:', id),
        onHeroMove: (id, x, y) => console.log('Move hero:', id, x, y),
    },
};

export const MinimalNoSlots: Story = {
    args: {
        hexes: generateWorldHexes(),
        heroes: MOCK_HEROES,
        features: MOCK_FEATURES,
        scale: 0.4,
    },
};

export const LargeMap: Story = {
    args: {
        hexes: generateWorldHexes(16, 12),
        heroes: [
            ...MOCK_HEROES,
            { id: 'hero-3', name: 'Sage Elara', owner: 'player', position: { x: 4, y: 9 }, movement: 2, level: 4 },
        ],
        features: [
            ...MOCK_FEATURES,
            { x: 10, y: 6, type: 'portal' },
            { x: 13, y: 9, type: 'treasure' },
        ],
        scale: 0.3,
        header: DefaultHeader,
        sidePanel: DefaultSidePanel,
    },
};
