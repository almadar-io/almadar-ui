import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { BattleTemplate } from './BattleTemplate';
import type { BattleUnit, BattleSlotContext } from './BattleTemplate';
import type { IsometricTile } from '../organisms/game/types/isometric';

// =============================================================================
// MOCK DATA
// =============================================================================

/** Generate a simple 8×6 dungeon grid */
function generateMockTiles(w = 8, h = 6): IsometricTile[] {
    const tiles: IsometricTile[] = [];
    const terrains = ['stone_floor', 'cobblestone', 'dirt'];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            tiles.push({
                x,
                y,
                terrain: terrains[(x + y) % terrains.length],
            });
        }
    }
    return tiles;
}

const MOCK_UNITS: BattleUnit[] = [
    {
        id: 'hero-1',
        name: 'Iron Sentinel',
        team: 'player',
        position: { x: 1, y: 2 },
        health: 80,
        maxHealth: 100,
        movement: 3,
        attack: 12,
        defense: 6,
    },
    {
        id: 'hero-2',
        name: 'Crystal Mage',
        team: 'player',
        position: { x: 2, y: 4 },
        health: 60,
        maxHealth: 60,
        movement: 2,
        attack: 18,
        defense: 3,
    },
    {
        id: 'enemy-1',
        name: 'Dark Golem',
        team: 'enemy',
        position: { x: 5, y: 1 },
        health: 100,
        maxHealth: 100,
        movement: 2,
        attack: 10,
        defense: 8,
    },
    {
        id: 'enemy-2',
        name: 'Shadow Stalker',
        team: 'enemy',
        position: { x: 6, y: 3 },
        health: 50,
        maxHealth: 50,
        movement: 4,
        attack: 14,
        defense: 4,
    },
];

// =============================================================================
// META
// =============================================================================

const meta: Meta<typeof BattleTemplate> = {
    title: 'Templates/Game/BattleTemplate',
    component: BattleTemplate,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// SLOT HELPERS
// =============================================================================

function DefaultHeader(ctx: BattleSlotContext) {
    const phaseColors: Record<string, string> = {
        observation: '#6366f1',
        selection: '#f59e0b',
        movement: '#10b981',
        action: '#ef4444',
        enemy_turn: '#a855f7',
        game_over: '#6b7280',
    };
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>⚔️ Tactical Battle</h3>
                <span
                    style={{
                        padding: '2px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        background: phaseColors[ctx.phase] ?? '#999',
                        color: '#fff',
                    }}
                >
                    {ctx.phase.toUpperCase().replace('_', ' ')}
                </span>
                <span style={{ fontSize: 13, color: '#888' }}>Turn {ctx.turn}</span>
            </div>
            {ctx.selectedUnit && (
                <span style={{ fontSize: 13, color: '#10b981' }}>
                    Selected: {ctx.selectedUnit.name} (HP {ctx.selectedUnit.health}/{ctx.selectedUnit.maxHealth})
                </span>
            )}
        </div>
    );
}

function DefaultSidebar(ctx: BattleSlotContext) {
    return (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ margin: 0 }}>🗡️ Combat Log</h4>
            <div style={{ fontSize: 13, color: '#888' }}>
                <p>Turn {ctx.turn} — {ctx.phase}</p>
                <p>Players alive: {ctx.playerUnits.length}</p>
                <p>Enemies alive: {ctx.enemyUnits.length}</p>
            </div>
            <hr />
            <h4 style={{ margin: 0 }}>Units</h4>
            {[...ctx.playerUnits, ...ctx.enemyUnits].map(u => (
                <div
                    key={u.id}
                    style={{
                        padding: 8,
                        borderRadius: 6,
                        border: '1px solid #333',
                        fontSize: 12,
                        background: u.team === 'player' ? '#10b98120' : '#ef444420',
                    }}
                >
                    <strong>{u.name}</strong>
                    <span style={{ float: 'right' }}>{u.health}/{u.maxHealth} HP</span>
                </div>
            ))}
        </div>
    );
}

// =============================================================================
// STORIES
// =============================================================================

export const Default: Story = {
    args: {
        initialUnits: MOCK_UNITS,
        tiles: generateMockTiles(),
        scale: 0.45,
        header: DefaultHeader,
        sidebar: DefaultSidebar,
    },
};

export const MinimalNoSlots: Story = {
    args: {
        initialUnits: MOCK_UNITS,
        tiles: generateMockTiles(),
        scale: 0.45,
    },
};

export const LargeMap: Story = {
    args: {
        initialUnits: [
            ...MOCK_UNITS,
            {
                id: 'hero-3',
                name: 'Storm Knight',
                team: 'player',
                position: { x: 3, y: 6 },
                health: 90,
                maxHealth: 90,
                movement: 3,
                attack: 15,
                defense: 5,
            },
            {
                id: 'enemy-3',
                name: 'Plague Drone',
                team: 'enemy',
                position: { x: 9, y: 2 },
                health: 40,
                maxHealth: 40,
                movement: 5,
                attack: 8,
                defense: 2,
            },
        ],
        tiles: generateMockTiles(12, 8),
        boardWidth: 12,
        boardHeight: 8,
        scale: 0.35,
        header: DefaultHeader,
        sidebar: DefaultSidebar,
    },
};
