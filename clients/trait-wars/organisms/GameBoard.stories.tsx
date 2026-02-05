/**
 * GameBoard Stories
 * 
 * Storybook stories for the GameBoard organism.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { GameBoard } from './GameBoard';
import { GameState, createInitialGameState, GameUnit } from '../types/game';
import { Box } from '@almadar/ui';

const meta: Meta<typeof GameBoard> = {
    title: 'Trait Wars/Organisms/GameBoard',
    component: GameBoard,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample units for demo
const sampleUnits: GameUnit[] = [
    {
        id: 'player-knight',
        name: 'Sir Galahad',
        characterType: 'knight',
        team: 'player',
        position: { x: 1, y: 3 },
        health: 100,
        maxHealth: 100,
        movement: 2,
        attack: 15,
        defense: 10,
        traits: [{ name: 'Berserker', currentState: 'idle', states: ['idle', 'defending', 'enraged'], cooldown: 0 }],
    },
    {
        id: 'player-mage',
        name: 'Merlin',
        characterType: 'mage',
        team: 'player',
        position: { x: 2, y: 4 },
        health: 60,
        maxHealth: 60,
        movement: 1,
        attack: 20,
        defense: 5,
        traits: [{ name: 'Spellweaver', currentState: 'preparing', states: ['preparing', 'casting', 'recovering'], cooldown: 0 }],
    },
    {
        id: 'player-healer',
        name: 'Sister Mary',
        characterType: 'healer',
        team: 'player',
        position: { x: 0, y: 4 },
        health: 50,
        maxHealth: 50,
        movement: 2,
        attack: 5,
        defense: 3,
        traits: [{ name: 'Divine Grace', currentState: 'ready', states: ['ready', 'channeling', 'cooldown'], cooldown: 0 }],
    },
    {
        id: 'enemy-skeleton',
        name: 'Bone Warrior',
        characterType: 'skeleton',
        team: 'enemy',
        position: { x: 4, y: 1 },
        health: 40,
        maxHealth: 40,
        movement: 2,
        attack: 12,
        defense: 5,
        traits: [{ name: 'Undead', currentState: 'idle', states: ['idle', 'attacking'], cooldown: 0 }],
    },
    {
        id: 'enemy-zombie',
        name: 'Shambler',
        characterType: 'zombie',
        team: 'enemy',
        position: { x: 5, y: 2 },
        health: 60,
        maxHealth: 60,
        movement: 1,
        attack: 10,
        defense: 8,
        traits: [{ name: 'Undead', currentState: 'idle', states: ['idle', 'attacking'], cooldown: 0 }],
    },
    {
        id: 'enemy-ghost',
        name: 'Phantom',
        characterType: 'ghost',
        team: 'enemy',
        position: { x: 6, y: 0 },
        health: 30,
        maxHealth: 30,
        movement: 3,
        attack: 8,
        defense: 2,
        traits: [{ name: 'Ethereal', currentState: 'hidden', states: ['hidden', 'attacking'], cooldown: 0 }],
    },
];

// Interactive demo with state
function InteractiveDemo() {
    const [gameState, setGameState] = useState<GameState>(() =>
        createInitialGameState(8, 6, sampleUnits)
    );

    return (
        <Box className="p-4">
            <GameBoard
                gameState={gameState}
                onStateChange={setGameState}
                tileSize={48}
            />
        </Box>
    );
}

export const Interactive: Story = {
    render: () => <InteractiveDemo />,
};

// Static display - use first 3 units with adjusted positions for smaller board
export const StaticBoard: Story = {
    render: () => {
        const staticUnits: GameUnit[] = [
            { ...sampleUnits[0], position: { x: 1, y: 2 } },
            { ...sampleUnits[1], position: { x: 2, y: 2 } },
            { ...sampleUnits[2], position: { x: 0, y: 2 } },
        ];
        return (
            <GameBoard
                gameState={createInitialGameState(6, 4, staticUnits)}
                tileSize={48}
            />
        );
    },
};

// Larger board
export const LargeBoard: Story = {
    render: () => {
        const [gameState, setGameState] = useState<GameState>(() =>
            createInitialGameState(10, 8, sampleUnits)
        );
        return (
            <GameBoard
                gameState={gameState}
                onStateChange={setGameState}
                tileSize={40}
            />
        );
    },
};

// Small tiles
export const CompactBoard: Story = {
    render: () => {
        const [gameState, setGameState] = useState<GameState>(() =>
            createInitialGameState(8, 6, sampleUnits)
        );
        return (
            <GameBoard
                gameState={gameState}
                onStateChange={setGameState}
                tileSize={32}
            />
        );
    },
};
