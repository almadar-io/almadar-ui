/**
 * GameBoardWithTraits Stories
 * 
 * Storybook stories demonstrating trait visibility features.
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { GameBoardWithTraits, CombatLogEntry } from './GameBoardWithTraits';
import { GameState, createInitialGameState, GameUnit } from '../types/game';
import { Box } from '../../../components/atoms/Box';

const meta: Meta<typeof GameBoardWithTraits> = {
    title: 'Trait Wars/Organisms/GameBoardWithTraits',
    component: GameBoardWithTraits,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample units with traits
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
        traits: [{ name: 'Berserker', currentState: 'idle', states: ['idle', 'defending', 'enraged', 'exhausted'], cooldown: 0 }],
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

function InteractiveDemo() {
    const [gameState, setGameState] = useState<GameState>(() =>
        createInitialGameState(8, 6, sampleUnits)
    );
    const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);

    const handleCombatLog = (entry: CombatLogEntry) => {
        setCombatLog(prev => [...prev, entry]);
    };

    return (
        <Box className="p-4 min-h-screen bg-gray-950">
            <GameBoardWithTraits
                gameState={gameState}
                onStateChange={setGameState}
                combatLog={combatLog}
                onCombatLog={handleCombatLog}
                tileSize={48}
                showTraitPanel={true}
            />
        </Box>
    );
}

export const Interactive: Story = {
    render: () => <InteractiveDemo />,
};

// Without trait panel
function NoPanelDemo() {
    const [gameState, setGameState] = useState<GameState>(() =>
        createInitialGameState(8, 6, sampleUnits)
    );

    return (
        <Box className="p-4 bg-gray-950">
            <GameBoardWithTraits
                gameState={gameState}
                onStateChange={setGameState}
                tileSize={48}
                showTraitPanel={false}
            />
        </Box>
    );
}

export const WithoutTraitPanel: Story = {
    render: () => <NoPanelDemo />,
};

// Pre-combat scenario
function PreCombatDemo() {
    const combatUnits: GameUnit[] = [
        {
            id: 'player-knight',
            name: 'Sir Galahad',
            characterType: 'knight',
            team: 'player',
            position: { x: 2, y: 2 },
            health: 100,
            maxHealth: 100,
            movement: 2,
            attack: 15,
            defense: 10,
            traits: [{ name: 'Berserker', currentState: 'idle', states: ['idle', 'defending', 'enraged', 'exhausted'], cooldown: 0 }],
        },
        {
            id: 'enemy-skeleton',
            name: 'Bone Warrior',
            characterType: 'skeleton',
            team: 'enemy',
            position: { x: 3, y: 2 },
            health: 40,
            maxHealth: 40,
            movement: 2,
            attack: 12,
            defense: 5,
            traits: [{ name: 'Undead', currentState: 'idle', states: ['idle', 'attacking'], cooldown: 0 }],
        },
    ];

    const [gameState, setGameState] = useState<GameState>(() =>
        createInitialGameState(6, 4, combatUnits)
    );
    const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([
        { turn: 1, message: 'Battle begins!', type: 'state_change' },
    ]);

    return (
        <Box className="p-4 bg-gray-950">
            <GameBoardWithTraits
                gameState={gameState}
                onStateChange={setGameState}
                combatLog={combatLog}
                onCombatLog={(entry) => setCombatLog(prev => [...prev, entry])}
                tileSize={56}
            />
        </Box>
    );
}

export const CombatScenario: Story = {
    render: () => <PreCombatDemo />,
};
