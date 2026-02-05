import type { Meta, StoryObj } from '@storybook/react';
import { HexTraitWarsGame, HexGameUnit } from './HexTraitWarsGame';
import { HexBoardTile } from '../organisms/HexGameBoard';
import { HexTileType } from '../atoms/HexTileSprite';
import { Box } from '@almadar/ui';
import { Typography } from '@almadar/ui';

const meta: Meta<typeof HexTraitWarsGame> = {
    title: 'Trait Wars/Templates/HexTraitWarsGame',
    component: HexTraitWarsGame,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// SAMPLE UNITS
// ============================================================================

const createPlayerUnits = (): HexGameUnit[] => [
    {
        id: 'player-knight',
        name: 'Sir Roland',
        characterType: 'robotTeal',
        team: 'player',
        state: 'idle',
        traitState: 'idle',
        health: 100,
        maxHealth: 100,
        position: { x: 1, y: 2 },
        movement: 2,
        attack: 18,
        defense: 12,
        traits: [{
            name: 'Berserker',
            currentState: 'idle',
            states: ['idle', 'defending', 'enraged', 'exhausted'],
            cooldown: 0,
        }],
    },
    {
        id: 'player-mage',
        name: 'Archmage Lyra',
        characterType: 'alienYellow',
        team: 'player',
        state: 'idle',
        traitState: 'preparing',
        health: 60,
        maxHealth: 60,
        position: { x: 0, y: 3 },
        movement: 1,
        attack: 25,
        defense: 5,
        traits: [{
            name: 'Spellweaver',
            currentState: 'preparing',
            states: ['preparing', 'casting', 'recovering'],
            cooldown: 0,
        }],
    },
    {
        id: 'player-healer',
        name: 'Sister Mercy',
        characterType: 'robotPink',
        team: 'player',
        state: 'idle',
        traitState: 'ready',
        health: 50,
        maxHealth: 50,
        position: { x: 2, y: 3 },
        movement: 2,
        attack: 8,
        defense: 6,
        traits: [{
            name: 'Guardian',
            currentState: 'ready',
            states: ['ready', 'shielding'],
            cooldown: 0,
        }],
    },
];

const createEnemyUnits = (): HexGameUnit[] => [
    {
        id: 'enemy-warrior',
        name: 'Dark Knight',
        characterType: 'robotGray',
        team: 'enemy',
        state: 'idle',
        traitState: 'defending',
        health: 90,
        maxHealth: 90,
        position: { x: 6, y: 1 },
        movement: 2,
        attack: 15,
        defense: 14,
        traits: [{
            name: 'Berserker',
            currentState: 'defending',
            states: ['idle', 'defending', 'enraged', 'exhausted'],
            cooldown: 0,
        }],
    },
    {
        id: 'enemy-mage',
        name: 'Shadow Mage',
        characterType: 'robotRed',
        team: 'enemy',
        state: 'idle',
        traitState: 'preparing',
        health: 55,
        maxHealth: 55,
        position: { x: 7, y: 2 },
        movement: 1,
        attack: 22,
        defense: 4,
        traits: [{
            name: 'Spellweaver',
            currentState: 'preparing',
            states: ['preparing', 'casting', 'recovering'],
            cooldown: 0,
        }],
    },
    {
        id: 'enemy-scout',
        name: 'Shadow Scout',
        characterType: 'robotGrayAlt',
        team: 'enemy',
        state: 'idle',
        traitState: 'idle',
        health: 40,
        maxHealth: 40,
        position: { x: 5, y: 3 },
        movement: 3,
        attack: 12,
        defense: 3,
        traits: [{
            name: 'Berserker',
            currentState: 'idle',
            states: ['idle', 'defending', 'enraged', 'exhausted'],
            cooldown: 0,
        }],
    },
];

// ============================================================================
// SAMPLE MAPS
// ============================================================================

const createBattlefieldMap = (): HexBoardTile[] => {
    const tiles: HexBoardTile[] = [];
    const width = 8;
    const height = 5;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let terrain: HexTileType = 'grassPlain';

            // Create interesting terrain
            if (x === 0 || x === width - 1) {
                terrain = Math.random() > 0.5 ? 'stonePlain' : 'grassTrees';
            } else if (y === 0 || y === height - 1) {
                terrain = Math.random() > 0.7 ? 'grassRocks' : 'grassPlain';
            } else if (x === 3 && y === 2) {
                terrain = 'stoneBoulders';
            } else if (x === 4 && y === 2) {
                terrain = 'stoneBoulders';
            } else if (Math.random() > 0.85) {
                terrain = 'grassTrees';
            }

            tiles.push({ x, y, terrain });
        }
    }
    return tiles;
};

const createVolcanicMap = (): HexBoardTile[] => {
    const tiles: HexBoardTile[] = [];
    const width = 8;
    const height = 5;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let terrain: HexTileType = 'dirtPlain';

            // Lava edges
            if (y === 0 || y === height - 1) {
                terrain = 'lavaPlain';
            }
            // Rocky center
            else if (x === 3 || x === 4) {
                terrain = Math.random() > 0.5 ? 'stonePlain' : 'dirtRocks';
            }
            // Random lava pools
            else if (Math.random() > 0.9) {
                terrain = 'lavaPlain';
            }
            // Stone outcrops
            else if (Math.random() > 0.8) {
                terrain = 'stoneRocks';
            }

            tiles.push({ x, y, terrain });
        }
    }
    return tiles;
};

// ============================================================================
// STORIES
// ============================================================================

export const Default: Story = {
    args: {
        initialUnits: [...createPlayerUnits(), ...createEnemyUnits()],
        boardWidth: 8,
        boardHeight: 5,
        hexScale: 0.55,
    },
};

export const WithCustomMap: Story = {
    args: {
        initialUnits: [...createPlayerUnits(), ...createEnemyUnits()],
        mapTerrain: createBattlefieldMap(),
        boardWidth: 8,
        boardHeight: 5,
        hexScale: 0.55,
    },
};

export const VolcanicBattle: Story = {
    render: () => {
        const playerUnits: HexGameUnit[] = [
            {
                id: 'player-tank',
                name: 'Flame Guard',
                characterType: 'robotTeal',
                team: 'player',
                state: 'idle',
                traitState: 'defending',
                health: 120,
                maxHealth: 120,
                position: { x: 1, y: 2 },
                movement: 2,
                attack: 15,
                defense: 18,
                traits: [{ name: 'Guardian', currentState: 'ready', states: ['ready', 'shielding'], cooldown: 0 }],
            },
            {
                id: 'player-dps',
                name: 'Lava Striker',
                characterType: 'alienYellow',
                team: 'player',
                state: 'idle',
                traitState: 'idle',
                health: 70,
                maxHealth: 70,
                position: { x: 2, y: 3 },
                movement: 2,
                attack: 28,
                defense: 8,
                traits: [{ name: 'Berserker', currentState: 'idle', states: ['idle', 'defending', 'enraged', 'exhausted'], cooldown: 0 }],
            },
        ];

        const bossUnit: HexGameUnit = {
            id: 'boss-demon',
            name: '🔥 INFERNAL LORD 🔥',
            characterType: 'robotRed',
            team: 'enemy',
            state: 'attacking',
            traitState: 'attacking',
            health: 250,
            maxHealth: 250,
            position: { x: 5, y: 2 },
            movement: 1,
            attack: 35,
            defense: 20,
            traits: [{ name: 'Berserker', currentState: 'idle', states: ['idle', 'defending', 'enraged', 'exhausted'], cooldown: 0 }],
        };

        return (
            <Box className="p-4">
                <Box className="mb-4 text-center">
                    <Typography variant="h4" className="text-red-400 font-bold">
                        🌋 Volcanic Showdown 🌋
                    </Typography>
                    <Typography variant="body2" className="text-gray-400">
                        Defeat the Infernal Lord in his volcanic lair!
                    </Typography>
                </Box>
                <HexTraitWarsGame
                    initialUnits={[...playerUnits, bossUnit]}
                    mapTerrain={createVolcanicMap()}
                    boardWidth={8}
                    boardHeight={5}
                    hexScale={0.6}
                />
            </Box>
        );
    },
};

export const Tutorial: Story = {
    render: () => {
        const tutorialUnits: HexGameUnit[] = [
            {
                id: 'tutorial-knight',
                name: 'Your Knight',
                characterType: 'robotTeal',
                team: 'player',
                state: 'idle',
                traitState: 'idle',
                health: 100,
                maxHealth: 100,
                position: { x: 1, y: 2 },
                movement: 3,
                attack: 20,
                defense: 10,
                traits: [{ name: 'Berserker', currentState: 'idle', states: ['idle', 'defending', 'enraged', 'exhausted'], cooldown: 0 }],
            },
            {
                id: 'tutorial-target',
                name: 'Training Dummy',
                characterType: 'robotGray',
                team: 'enemy',
                state: 'idle',
                traitState: 'idle',
                health: 30,
                maxHealth: 30,
                position: { x: 4, y: 2 },
                movement: 0,
                attack: 1,
                defense: 0,
                traits: [{ name: 'Guardian', currentState: 'ready', states: ['ready', 'shielding'], cooldown: 0 }],
            },
        ];

        return (
            <Box className="p-4">
                <Box className="mb-4 p-4 bg-blue-900/30 border border-blue-500 rounded-lg">
                    <Typography variant="h6" className="text-blue-300 mb-2">
                        📖 Tutorial: Learn the Basics
                    </Typography>
                    <Typography variant="body2" className="text-gray-300">
                        1. <strong>Click your Knight</strong> (blue team) to select it<br />
                        2. <strong>Click a green tile</strong> to move towards the enemy<br />
                        3. <strong>Click the red enemy</strong> when adjacent to attack<br />
                        4. Watch the <strong>trait state</strong> change in the side panel!
                    </Typography>
                </Box>
                <HexTraitWarsGame
                    initialUnits={tutorialUnits}
                    boardWidth={6}
                    boardHeight={5}
                    hexScale={0.6}
                />
            </Box>
        );
    },
};

export const FullScale: Story = {
    render: () => {
        const allUnits = [...createPlayerUnits(), ...createEnemyUnits()];

        return (
            <Box className="min-h-screen bg-gray-950 p-6">
                <HexTraitWarsGame
                    initialUnits={allUnits}
                    mapTerrain={createBattlefieldMap()}
                    boardWidth={8}
                    boardHeight={5}
                    hexScale={0.65}
                />
            </Box>
        );
    },
};
