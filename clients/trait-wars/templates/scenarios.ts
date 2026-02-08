/**
 * Game Scenario Templates
 * 
 * Pre-configured game scenarios for different play styles and tutorials.
 */

import { GameState, GameUnit, createInitialGameState } from '../types/game';

// Tutorial scenario - Simple 1v1 introduction
export function createTutorialScenario(): { state: GameState; description: string; objectives: string[] } {
    const units: GameUnit[] = [
        {
            id: 'tutorial-knight',
            name: 'Your Knight',
            characterType: 'hero',
            team: 'player',
            position: { x: 1, y: 2 },
            health: 100,
            maxHealth: 100,
            movement: 2,
            attack: 15,
            defense: 10,
            traits: [{
                name: 'Berserker',
                currentState: 'idle',
                states: ['idle', 'defending', 'enraged', 'exhausted'],
                cooldown: 0
            }],
        },
        {
            id: 'tutorial-skeleton',
            name: 'Training Dummy',
            characterType: 'orphan',
            team: 'enemy',
            position: { x: 4, y: 2 },
            health: 30,
            maxHealth: 30,
            movement: 1,
            attack: 5,
            defense: 2,
            traits: [{
                name: 'Undead',
                currentState: 'idle',
                states: ['idle', 'attacking'],
                cooldown: 0
            }],
        },
    ];

    return {
        state: createInitialGameState(6, 5, units),
        description: 'Learn the basics of Trait Wars by defeating a training dummy.',
        objectives: [
            '1. Click your Knight to select it',
            '2. Move adjacent to the skeleton (green tiles)',
            '3. Attack the skeleton (red highlight)',
            '4. Watch the trait state change!',
        ],
    };
}

// Skirmish scenario - 3v3 balanced battle
export function createSkirmishScenario(): { state: GameState; description: string; objectives: string[] } {
    const units: GameUnit[] = [
        // Player team
        {
            id: 'player-knight',
            name: 'Sir Galahad',
            characterType: 'hero',
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
            characterType: 'magician',
            team: 'player',
            position: { x: 0, y: 4 },
            health: 60,
            maxHealth: 60,
            movement: 1,
            attack: 25,
            defense: 3,
            traits: [{ name: 'Spellweaver', currentState: 'preparing', states: ['preparing', 'casting', 'recovering'], cooldown: 0 }],
        },
        {
            id: 'player-healer',
            name: 'Sister Mary',
            characterType: 'caregiver',
            team: 'player',
            position: { x: 2, y: 4 },
            health: 50,
            maxHealth: 50,
            movement: 2,
            attack: 5,
            defense: 5,
            traits: [{ name: 'Divine Grace', currentState: 'ready', states: ['ready', 'channeling', 'cooldown'], cooldown: 0 }],
        },
        // Enemy team
        {
            id: 'enemy-warrior',
            name: 'Dark Knight',
            characterType: 'ruler',
            team: 'enemy',
            position: { x: 6, y: 1 },
            health: 90,
            maxHealth: 90,
            movement: 2,
            attack: 12,
            defense: 12,
            traits: [{ name: 'Berserker', currentState: 'defending', states: ['idle', 'defending', 'enraged', 'exhausted'], cooldown: 0 }],
        },
        {
            id: 'enemy-skeleton',
            name: 'Bone Mage',
            characterType: 'orphan',
            team: 'enemy',
            position: { x: 7, y: 2 },
            health: 45,
            maxHealth: 45,
            movement: 1,
            attack: 20,
            defense: 2,
            traits: [{ name: 'Spellweaver', currentState: 'preparing', states: ['preparing', 'casting', 'recovering'], cooldown: 0 }],
        },
        {
            id: 'enemy-ghost',
            name: 'Phantom',
            characterType: 'innocent',
            team: 'enemy',
            position: { x: 6, y: 3 },
            health: 35,
            maxHealth: 35,
            movement: 3,
            attack: 10,
            defense: 1,
            traits: [{ name: 'Ethereal', currentState: 'hidden', states: ['hidden', 'attacking'], cooldown: 0 }],
        },
    ];

    return {
        state: createInitialGameState(8, 6, units),
        description: 'A balanced 3v3 skirmish. Use your traits wisely!',
        objectives: [
            'Defeat all enemy units',
            'Keep at least one unit alive',
            'Bonus: Win without losing any units',
        ],
    };
}

// Boss battle scenario - Team vs powerful boss
export function createBossBattleScenario(): { state: GameState; description: string; objectives: string[] } {
    const units: GameUnit[] = [
        // Player team
        {
            id: 'player-knight',
            name: 'Vanguard',
            characterType: 'hero',
            team: 'player',
            position: { x: 2, y: 4 },
            health: 120,
            maxHealth: 120,
            movement: 2,
            attack: 18,
            defense: 15,
            traits: [{ name: 'Berserker', currentState: 'idle', states: ['idle', 'defending', 'enraged', 'exhausted'], cooldown: 0 }],
        },
        {
            id: 'player-mage',
            name: 'Archmage',
            characterType: 'magician',
            team: 'player',
            position: { x: 1, y: 5 },
            health: 70,
            maxHealth: 70,
            movement: 1,
            attack: 30,
            defense: 5,
            traits: [{ name: 'Spellweaver', currentState: 'preparing', states: ['preparing', 'casting', 'recovering'], cooldown: 0 }],
        },
        {
            id: 'player-healer',
            name: 'High Priest',
            characterType: 'caregiver',
            team: 'player',
            position: { x: 3, y: 5 },
            health: 60,
            maxHealth: 60,
            movement: 2,
            attack: 8,
            defense: 8,
            traits: [{ name: 'Divine Grace', currentState: 'ready', states: ['ready', 'channeling', 'cooldown'], cooldown: 0 }],
        },
        {
            id: 'player-archer',
            name: 'Sharpshooter',
            characterType: 'explorer',
            team: 'player',
            position: { x: 0, y: 4 },
            health: 55,
            maxHealth: 55,
            movement: 2,
            attack: 22,
            defense: 3,
            traits: [{ name: 'Spellweaver', currentState: 'preparing', states: ['preparing', 'casting', 'recovering'], cooldown: 0 }],
        },
        // BOSS
        {
            id: 'boss-demon',
            name: '🔥 DEMON LORD 🔥',
            characterType: 'emperor',
            team: 'enemy',
            position: { x: 4, y: 1 },
            health: 300,
            maxHealth: 300,
            movement: 1,
            attack: 35,
            defense: 20,
            traits: [{
                name: 'Berserker',
                currentState: 'idle',
                states: ['idle', 'defending', 'enraged', 'exhausted'],
                cooldown: 0
            }],
        },
    ];

    return {
        state: createInitialGameState(8, 7, units),
        description: 'Face the mighty Demon Lord! Work together to bring down this powerful foe.',
        objectives: [
            'Defeat the Demon Lord (300 HP)',
            'Coordinate attacks when boss is exhausted',
            'Use healing to sustain your team',
            'Watch for enraged state - increased damage!',
        ],
    };
}

// Survival scenario - Endless waves
export function createSurvivalScenario(): { state: GameState; description: string; objectives: string[]; waveConfig: WaveConfig } {
    const units: GameUnit[] = [
        {
            id: 'player-knight',
            name: 'Last Stand',
            characterType: 'hero',
            team: 'player',
            position: { x: 4, y: 4 },
            health: 150,
            maxHealth: 150,
            movement: 2,
            attack: 20,
            defense: 15,
            traits: [{ name: 'Berserker', currentState: 'idle', states: ['idle', 'defending', 'enraged', 'exhausted'], cooldown: 0 }],
        },
    ];

    return {
        state: createInitialGameState(9, 9, units),
        description: 'Survive as many waves as possible!',
        objectives: [
            'Survive Wave 1: 2 Skeletons',
            'Survive Wave 2: 3 Zombies',
            'Survive Wave 3: 2 Ghosts + 1 Skeleton',
            'Endless: Waves get harder each time!',
        ],
        waveConfig: {
            currentWave: 1,
            enemiesPerWave: [2, 3, 3, 4, 5],
            enemyTypes: ['orphan', 'shadowLegion', 'innocent'],
        },
    };
}


export interface WaveConfig {
    currentWave: number;
    enemiesPerWave: number[];
    enemyTypes: string[];
}

// Scenario collection
export interface GameScenario {
    id: string;
    name: string;
    description: string;
    difficulty: 'tutorial' | 'easy' | 'medium' | 'hard' | 'boss';
    create: () => { state: GameState; description: string; objectives: string[] };
}

export const GAME_SCENARIOS: GameScenario[] = [
    {
        id: 'tutorial',
        name: 'Tutorial: First Steps',
        description: 'Learn the basics of combat and traits',
        difficulty: 'tutorial',
        create: createTutorialScenario,
    },
    {
        id: 'skirmish',
        name: 'Skirmish: 3v3 Battle',
        description: 'A balanced team battle',
        difficulty: 'medium',
        create: createSkirmishScenario,
    },
    {
        id: 'boss',
        name: 'Boss: Demon Lord',
        description: 'Face the mighty Demon Lord',
        difficulty: 'boss',
        create: createBossBattleScenario,
    },
    {
        id: 'survival',
        name: 'Survival: Last Stand',
        description: 'Survive endless waves',
        difficulty: 'hard',
        create: () => {
            const result = createSurvivalScenario();
            return { state: result.state, description: result.description, objectives: result.objectives };
        },
    },
];
