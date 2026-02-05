import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { HexGameBoard, HexBoardTile } from './HexGameBoard';
import { HexUnit } from './HexGameTile';
import { HexTileType } from '../atoms/HexTileSprite';
import { Box } from '@almadar/ui';
import { Typography } from '@almadar/ui';

const meta: Meta<typeof HexGameBoard> = {
    title: 'Trait Wars/Organisms/HexGameBoard',
    component: HexGameBoard,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample tile map
const generateTileMap = (width: number, height: number): HexBoardTile[] => {
    const tiles: HexBoardTile[] = [];
    const terrainTypes: HexTileType[] = ['grassPlain', 'grassTrees', 'grassRocks', 'dirtPlain', 'stonePlain'];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Add some variety
            let terrain: HexTileType = terrainTypes[0];
            if ((x + y) % 7 === 0) terrain = terrainTypes[4]; // stonePlain
            else if ((x + y) % 5 === 0) terrain = terrainTypes[1]; // grassTrees
            else if ((x * y) % 4 === 0) terrain = terrainTypes[3]; // dirtPlain
            else if (x % 3 === 0) terrain = terrainTypes[2]; // grassRocks

            tiles.push({ x, y, terrain });
        }
    }
    return tiles;
};


// Sample units
const sampleUnits: (HexUnit & { position: { x: number; y: number } })[] = [
    {
        id: 'player-1',
        name: 'Knight',
        characterType: 'robotTeal',
        team: 'player',
        state: 'idle',
        traitState: 'idle',
        health: 100,
        maxHealth: 100,
        position: { x: 1, y: 1 },
    },
    {
        id: 'player-2',
        name: 'Mage',
        characterType: 'alienYellow',
        team: 'player',
        state: 'idle',
        traitState: 'preparing',
        health: 80,
        maxHealth: 80,
        position: { x: 0, y: 2 },
    },
    {
        id: 'enemy-1',
        name: 'Skeleton',
        characterType: 'robotGray',
        team: 'enemy',
        state: 'idle',
        traitState: 'defending',
        health: 60,
        maxHealth: 80,
        position: { x: 4, y: 1 },
    },
    {
        id: 'enemy-2',
        name: 'Demon',
        characterType: 'robotRed',
        team: 'enemy',
        state: 'idle',
        traitState: 'attacking',
        health: 120,
        maxHealth: 120,
        position: { x: 5, y: 2 },
    },
];

export const Default: Story = {
    args: {
        tiles: generateTileMap(6, 4),
        units: sampleUnits,
        scale: 0.5,
        showCoordinates: false,
    },
};

export const WithCoordinates: Story = {
    args: {
        tiles: generateTileMap(6, 4),
        units: sampleUnits,
        scale: 0.5,
        showCoordinates: true,
    },
};

export const LargeScale: Story = {
    args: {
        tiles: generateTileMap(5, 3),
        units: sampleUnits.slice(0, 2),
        scale: 0.7,
        showCoordinates: false,
    },
};

export const InteractiveDemo: Story = {
    render: () => {
        const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
        const [units, setUnits] = useState(sampleUnits);
        const [log, setLog] = useState<string[]>([]);

        const addLog = (msg: string) => {
            setLog(prev => [msg, ...prev].slice(0, 5));
        };

        // Calculate valid moves for selected unit
        const selectedUnit = units.find(u => u.id === selectedUnitId);
        const validMoves = selectedUnit ? [
            { x: selectedUnit.position.x + 1, y: selectedUnit.position.y },
            { x: selectedUnit.position.x - 1, y: selectedUnit.position.y },
            { x: selectedUnit.position.x, y: selectedUnit.position.y + 1 },
            { x: selectedUnit.position.x, y: selectedUnit.position.y - 1 },
        ].filter(pos => pos.x >= 0 && pos.y >= 0 && pos.x < 6 && pos.y < 4) : [];

        // Find attack targets (enemy units adjacent to selected unit)
        const attackTargets = selectedUnit?.team === 'player'
            ? units
                .filter(u => u.team === 'enemy')
                .filter(u => {
                    const dx = Math.abs(u.position.x - selectedUnit.position.x);
                    const dy = Math.abs(u.position.y - selectedUnit.position.y);
                    return dx <= 1 && dy <= 1 && (dx + dy) > 0;
                })
                .map(u => u.position)
            : [];

        const handleUnitClick = (unitId: string) => {
            const unit = units.find(u => u.id === unitId);
            if (unit?.team === 'player') {
                setSelectedUnitId(unitId === selectedUnitId ? null : unitId);
                addLog(`Selected: ${unit.name}`);
            } else if (unit?.team === 'enemy' && selectedUnit) {
                // Attack enemy
                addLog(`${selectedUnit.name} attacks ${unit.name}!`);
                setUnits(prev => prev.map(u =>
                    u.id === unit.id ? { ...u, health: Math.max(0, u.health - 20), state: 'wounded' as const } : u
                ));
            }
        };

        const handleTileClick = (x: number, y: number) => {
            if (selectedUnit && validMoves.some(m => m.x === x && m.y === y)) {
                // Move unit
                addLog(`${selectedUnit.name} moves to (${x}, ${y})`);
                setUnits(prev => prev.map(u =>
                    u.id === selectedUnitId ? { ...u, position: { x, y } } : u
                ));
                setSelectedUnitId(null);
            }
        };

        return (
            <Box className="p-4 bg-gray-900 rounded-lg">
                <Typography variant="h6" className="text-white mb-4">
                    ⚔️ Interactive Hex Battle Demo
                </Typography>
                <Typography variant="body2" className="text-gray-400 mb-4">
                    Click player units (blue) to select, then click valid moves (green) or enemies (red) to attack
                </Typography>

                <HexGameBoard
                    tiles={generateTileMap(6, 4)}
                    units={units}
                    selectedUnitId={selectedUnitId}
                    validMoves={validMoves}
                    attackTargets={attackTargets}
                    onUnitClick={handleUnitClick}
                    onTileClick={handleTileClick}
                    scale={0.55}
                />

                {/* Action log */}
                <Box className="mt-4 p-3 bg-gray-800 rounded-lg max-h-32 overflow-auto">
                    <Typography variant="caption" className="text-gray-400 font-bold block mb-2">
                        📜 Combat Log
                    </Typography>
                    {log.length === 0 ? (
                        <Typography variant="caption" className="text-gray-500 italic">
                            Click a unit to begin...
                        </Typography>
                    ) : (
                        log.map((entry, i) => (
                            <Typography key={i} variant="caption" className="text-gray-300 block">
                                {entry}
                            </Typography>
                        ))
                    )}
                </Box>

                {/* Legend */}
                <Box display="flex" className="mt-4 gap-4">
                    <Box display="flex" className="items-center gap-2">
                        <Box className="w-3 h-3 rounded-full bg-blue-500" />
                        <Typography variant="caption" className="text-gray-400">Player</Typography>
                    </Box>
                    <Box display="flex" className="items-center gap-2">
                        <Box className="w-3 h-3 rounded-full bg-red-500" />
                        <Typography variant="caption" className="text-gray-400">Enemy</Typography>
                    </Box>
                    <Box display="flex" className="items-center gap-2">
                        <Box className="w-3 h-3 rounded-full bg-green-400" />
                        <Typography variant="caption" className="text-gray-400">Valid Move</Typography>
                    </Box>
                    <Box display="flex" className="items-center gap-2">
                        <Box className="w-3 h-3 rounded-full bg-yellow-400" />
                        <Typography variant="caption" className="text-gray-400">Selected</Typography>
                    </Box>
                </Box>
            </Box>
        );
    },
};

export const BattleScenario: Story = {
    render: () => {
        // Custom battle map
        const battleTiles: HexBoardTile[] = [
            // Row 0 - Player spawn
            { x: 0, y: 0, terrain: 'grassPlain' },
            { x: 1, y: 0, terrain: 'grassPlain' },
            { x: 2, y: 0, terrain: 'grassTrees' },
            { x: 3, y: 0, terrain: 'stoneBoulders' },
            { x: 4, y: 0, terrain: 'grassPlain' },
            { x: 5, y: 0, terrain: 'grassPlain' },
            // Row 1
            { x: 0, y: 1, terrain: 'grassPlain' },
            { x: 1, y: 1, terrain: 'grassRocks' },
            { x: 2, y: 1, terrain: 'dirtPlain' },
            { x: 3, y: 1, terrain: 'dirtPlain' },
            { x: 4, y: 1, terrain: 'grassRocks' },
            { x: 5, y: 1, terrain: 'grassPlain' },
            // Row 2 - Middle battleground
            { x: 0, y: 2, terrain: 'grassTrees' },
            { x: 1, y: 2, terrain: 'grassPlain' },
            { x: 2, y: 2, terrain: 'stonePlain' },
            { x: 3, y: 2, terrain: 'stonePlain' },
            { x: 4, y: 2, terrain: 'grassPlain' },
            { x: 5, y: 2, terrain: 'grassTrees' },
            // Row 3 - Enemy spawn
            { x: 0, y: 3, terrain: 'lavaPlain' },
            { x: 1, y: 3, terrain: 'dirtRocks' },
            { x: 2, y: 3, terrain: 'dirtPlain' },
            { x: 3, y: 3, terrain: 'dirtPlain' },
            { x: 4, y: 3, terrain: 'dirtRocks' },
            { x: 5, y: 3, terrain: 'lavaPlain' },
        ];

        const battleUnits: (HexUnit & { position: { x: number; y: number } })[] = [
            // Player team
            {
                id: 'knight', name: 'Sir Roland', characterType: 'robotTeal',
                team: 'player', state: 'idle', traitState: 'idle',
                health: 100, maxHealth: 100, position: { x: 1, y: 0 },
            },
            {
                id: 'mage', name: 'Archmage Lyra', characterType: 'alienYellow',
                team: 'player', state: 'casting', traitState: 'casting',
                health: 60, maxHealth: 60, position: { x: 0, y: 1 },
            },
            {
                id: 'healer', name: 'Sister Mercy', characterType: 'robotPink',
                team: 'player', state: 'idle', traitState: 'preparing',
                health: 50, maxHealth: 50, position: { x: 2, y: 1 },
            },
            // Enemy team
            {
                id: 'demon-lord', name: 'Demon Lord', characterType: 'robotRed',
                team: 'enemy', state: 'attacking', traitState: 'attacking',
                health: 150, maxHealth: 150, position: { x: 3, y: 3 },
            },
            {
                id: 'skeleton-1', name: 'Skeleton Warrior', characterType: 'robotGray',
                team: 'enemy', state: 'defending', traitState: 'defending',
                health: 40, maxHealth: 80, position: { x: 4, y: 2 },
            },
            {
                id: 'skeleton-2', name: 'Skeleton Archer', characterType: 'robotGrayAlt',
                team: 'enemy', state: 'idle', traitState: 'idle',
                health: 60, maxHealth: 60, position: { x: 5, y: 3 },
            },
        ];

        return (
            <Box className="p-6 bg-gray-900 rounded-lg">
                <Typography variant="h5" className="text-white mb-2">
                    🏰 Battle for the Dark Citadel
                </Typography>
                <Typography variant="body2" className="text-gray-400 mb-4">
                    The heroes face the Demon Lord's forces on the volcanic plains...
                </Typography>
                <HexGameBoard
                    tiles={battleTiles}
                    units={battleUnits}
                    selectedUnitId="knight"
                    validMoves={[{ x: 1, y: 1 }, { x: 2, y: 0 }]}
                    attackTargets={[]}
                    scale={0.6}
                />
            </Box>
        );
    },
};
