/**
 * BattlefieldTemplate Stories
 *
 * Storybook stories for the BattlefieldTemplate.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { BattlefieldTemplate, MatchEntity } from './BattlefieldTemplate';
import { HexTileEntity, GridUnit } from '../organisms/HexGrid';
import { UnitEntity } from '../molecules/UnitCard';
import { CombatEvent } from '../organisms/CombatLog';
import { GameAction } from '../molecules/ActionMenu';
import { TraitDefinition } from '../organisms/TraitPanel';
import { action } from 'storybook/actions';

const meta: Meta<typeof BattlefieldTemplate> = {
    title: 'Trait Wars/Templates/BattlefieldTemplate',
    component: BattlefieldTemplate,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const match: MatchEntity = {
    id: 'match-1',
    phase: 'action',
    turnNumber: 5,
    currentPlayerId: 'player-1',
};

const players = [
    { id: 'player-1', name: 'Player', color: 'blue' as const },
    { id: 'player-2', name: 'Enemy', color: 'red' as const },
];

const tiles: HexTileEntity[] = [];
for (let x = 0; x < 6; x++) {
    for (let y = 0; y < 5; y++) {
        tiles.push({
            x,
            y,
            terrain: ['plains', 'forest', 'plains', 'water', 'mountain'][Math.floor(Math.random() * 5)] as 'plains',
        });
    }
}

const units: GridUnit[] = [
    { id: 'unit-1', position: { x: 1, y: 1 }, owner: 'player' },
    { id: 'unit-2', position: { x: 4, y: 3 }, owner: 'enemy' },
    { id: 'unit-3', position: { x: 2, y: 2 }, owner: 'player' },
];

const unitEntities: UnitEntity[] = [
    {
        id: 'unit-1',
        name: 'Knight Captain',
        health: 8,
        maxHealth: 10,
        attack: 5,
        defense: 3,
        movement: 2,
        owner: 'player',
        level: 5,
        equippedTraits: [
            { name: 'attacker', state: 'ready' },
            { name: 'defender', state: 'cooldown', cooldownTurns: 1 },
        ],
    },
    {
        id: 'unit-2',
        name: 'Dark Mage',
        health: 4,
        maxHealth: 6,
        attack: 7,
        defense: 1,
        movement: 3,
        owner: 'enemy',
        level: 4,
        equippedTraits: [{ name: 'summoner', state: 'ready' }],
    },
    {
        id: 'unit-3',
        name: 'Healer',
        health: 5,
        maxHealth: 5,
        attack: 2,
        defense: 2,
        movement: 3,
        owner: 'player',
        level: 3,
        equippedTraits: [{ name: 'healer', state: 'ready' }],
    },
];

const combatEvents: CombatEvent[] = [
    { id: '1', type: 'spawn', message: 'Knight Captain deployed', timestamp: Date.now() - 5000, turn: 1 },
    { id: '2', type: 'move', message: 'Knight Captain moved to (1,1)', timestamp: Date.now() - 4000, turn: 2 },
    { id: '3', type: 'attack', message: 'Knight attacks Dark Mage', timestamp: Date.now() - 3000, turn: 3, value: 5 },
    { id: '4', type: 'defend', message: 'Dark Mage defends', timestamp: Date.now() - 2000, turn: 4 },
    { id: '5', type: 'heal', message: 'Healer restores Knight', timestamp: Date.now() - 1000, turn: 5, value: 2 },
];

const availableActions: GameAction[] = [
    { id: 'attack', label: 'Attack' },
    { id: 'move', label: 'Move' },
    { id: 'defend', label: 'Defend' },
];

const availableTraits: TraitDefinition[] = [
    { name: 'attacker', displayName: 'Attacker', description: 'Strike enemies', cost: 50 },
    { name: 'defender', displayName: 'Defender', description: 'Block damage', cost: 40 },
    { name: 'healer', displayName: 'Healer', description: 'Heal allies', cost: 60 },
    { name: 'mover', displayName: 'Mover', description: 'Extra movement', cost: 30 },
];

export const Default: Story = {
    args: {
        match,
        currentPlayer: players[0],
        players,
        tiles,
        units,
        unitEntities,
        combatEvents,
        availableTraits,
        resources: 150,
        isYourTurn: true,
        onTileClick: action('onTileClick'),
        onUnitClick: action('onUnitClick'),
        onAction: action('onAction'),
        onEndTurn: action('onEndTurn'),
        onEquipTrait: action('onEquipTrait'),
        onUnequipTrait: action('onUnequipTrait'),
    },
};

export const WithSelectedUnit: Story = {
    args: {
        ...Default.args,
        selectedUnit: unitEntities[0],
        validMoves: [
            { x: 0, y: 1 },
            { x: 1, y: 0 },
            { x: 2, y: 1 },
        ],
        attackTargets: [{ x: 4, y: 3 }],
        availableActions,
    },
};

export const EnemyTurn: Story = {
    args: {
        ...Default.args,
        currentPlayer: players[1],
        isYourTurn: false,
    },
};

export const DebugMode: Story = {
    args: {
        ...Default.args,
        showDebug: true,
        selectedUnit: unitEntities[0],
        validMoves: [
            { x: 0, y: 1 },
            { x: 1, y: 0 },
        ],
    },
};
