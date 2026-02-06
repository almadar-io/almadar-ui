import React, { useState, useCallback } from 'react';
import { Box, Typography } from '@almadar/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { IsometricGameCanvas, type IsometricTile, type IsometricUnit, type IsometricFeature } from './IsometricGameCanvas';

const meta: Meta<typeof IsometricGameCanvas> = {
    title: 'Trait Wars/Organisms/IsometricGameCanvas',
    component: IsometricGameCanvas,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
        docs: {
            description: {
                component: 'Canvas-based isometric game board for Trait Wars. Replaces DOM-based HexGameBoard with pixel-perfect rendering.'
            }
        }
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Sample Data Generators
// =============================================================================

function generateGridTiles(width: number, height: number): IsometricTile[] {
    const tiles: IsometricTile[] = [];
    const terrains = ['grass', 'dirt', 'stone', 'forest', 'sand'];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Create varied terrain pattern
            const terrainIndex = (x + y) % terrains.length;
            tiles.push({
                x,
                y,
                terrain: terrains[terrainIndex]
            });
        }
    }
    return tiles;
}

// =============================================================================
// Stories
// =============================================================================

/**
 * Basic isometric grid with fallback colored diamonds
 */
export const Default: Story = {
    args: {
        tiles: generateGridTiles(5, 5),
        scale: 0.4
    }
};

/**
 * Grid with debug mode showing coordinates
 */
export const DebugMode: Story = {
    args: {
        tiles: generateGridTiles(4, 4),
        scale: 0.5,
        debug: true
    }
};

/**
 * Grid with valid moves and attack targets
 */
export const WithHighlights: Story = {
    args: {
        tiles: generateGridTiles(6, 6),
        scale: 0.4,
        validMoves: [
            { x: 2, y: 2 },
            { x: 2, y: 3 },
            { x: 3, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 1 }
        ],
        attackTargets: [
            { x: 4, y: 4 },
            { x: 3, y: 4 }
        ]
    }
};

/**
 * Grid with units (fallback rendering)
 */
export const WithUnits: Story = {
    args: {
        tiles: generateGridTiles(6, 6),
        scale: 0.4,
        units: [
            {
                id: 'hero1',
                position: { x: 1, y: 1 },
                name: 'Valence',
                team: 'player',
                health: 100,
                maxHealth: 100
            },
            {
                id: 'hero2',
                position: { x: 2, y: 3 },
                name: 'Zahra',
                team: 'player',
                health: 75,
                maxHealth: 100
            },
            {
                id: 'enemy1',
                position: { x: 4, y: 4 },
                name: 'Static General',
                team: 'enemy',
                health: 150,
                maxHealth: 150
            }
        ],
        selectedUnitId: 'hero1'
    }
};

/**
 * Grid with features
 */
export const WithFeatures: Story = {
    args: {
        tiles: generateGridTiles(6, 6),
        scale: 0.4,
        features: [
            { x: 0, y: 0, type: 'gold_mine' },
            { x: 5, y: 5, type: 'crystal' },
            { x: 3, y: 1, type: 'portal' },
            { x: 1, y: 4, type: 'treasure' }
        ]
    }
};

/**
 * Interactive grid with click and hover
 */
export const InteractiveDemo: Story = {
    render: () => {
        const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
        const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
        const tiles = generateGridTiles(6, 6);

        return (
            <Box className="p-4 bg-gray-900 rounded-lg">
                <Typography variant="h6" className="text-white mb-2">
                    🎮 Interactive Isometric Canvas
                </Typography>
                <Typography variant="body2" className="text-gray-400 mb-4">
                    Click: {selectedTile ? `(${selectedTile.x}, ${selectedTile.y})` : 'None'} |
                    Hover: {hoveredTile ? `(${hoveredTile.x}, ${hoveredTile.y})` : 'None'}
                </Typography>
                <IsometricGameCanvas
                    tiles={tiles}
                    scale={0.4}
                    hoveredTile={hoveredTile}
                    onTileClick={(x, y) => setSelectedTile({ x, y })}
                    onTileHover={(x, y) => setHoveredTile({ x, y })}
                    onTileLeave={() => setHoveredTile(null)}
                />
            </Box>
        );
    }
};

/**
 * Larger map for world view
 */
export const LargeWorldMap: Story = {
    args: {
        tiles: generateGridTiles(10, 10),
        scale: 0.35,
        units: [
            { id: 'p1', position: { x: 2, y: 2 }, name: 'Valence', team: 'player', health: 100, maxHealth: 100 },
            { id: 'p2', position: { x: 3, y: 4 }, name: 'Zahra', team: 'player', health: 80, maxHealth: 100 },
            { id: 'e1', position: { x: 7, y: 7 }, name: 'The Static General', team: 'enemy', health: 200, maxHealth: 200 }
        ],
        features: [
            { x: 0, y: 0, type: 'gold_mine' },
            { x: 9, y: 0, type: 'crystal' },
            { x: 0, y: 9, type: 'portal' },
            { x: 9, y: 9, type: 'treasure' },
            { x: 5, y: 5, type: 'battle' }
        ]
    }
};

/**
 * Interactive World Map Demo with unit movement
 */
export const WorldMapWithMovement: Story = {
    render: () => {
        const [selectedUnit, setSelectedUnit] = useState<string | null>('p1');
        const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
        const [units, setUnits] = useState<IsometricUnit[]>([
            { id: 'p1', position: { x: 2, y: 2 }, name: 'Valence', team: 'player', health: 100, maxHealth: 100 },
            { id: 'p2', position: { x: 3, y: 4 }, name: 'Zahra', team: 'player', health: 80, maxHealth: 100 },
            { id: 'e1', position: { x: 7, y: 7 }, name: 'The Static General', team: 'enemy', health: 200, maxHealth: 200 }
        ]);

        const tiles = generateGridTiles(8, 8);

        const features: IsometricFeature[] = [
            { x: 0, y: 0, type: 'gold_mine' },
            { x: 7, y: 0, type: 'crystal' },
            { x: 0, y: 7, type: 'portal' },
            { x: 7, y: 7, type: 'treasure' }
        ];

        // Calculate valid moves (adjacent tiles)
        const selectedUnitData = units.find(u => u.id === selectedUnit);
        const validMoves: { x: number; y: number }[] = [];
        if (selectedUnitData && selectedUnitData.team === 'player') {
            const { x, y } = selectedUnitData.position;
            const directions = [
                { x: 0, y: -1 }, { x: 0, y: 1 },
                { x: -1, y: 0 }, { x: 1, y: 0 },
                { x: -1, y: -1 }, { x: 1, y: 1 }
            ];
            directions.forEach(d => {
                const nx = x + d.x;
                const ny = y + d.y;
                if (tiles.some(t => t.x === nx && t.y === ny) &&
                    !units.some(u => u.position.x === nx && u.position.y === ny)) {
                    validMoves.push({ x: nx, y: ny });
                }
            });
        }

        const handleTileClick = useCallback((x: number, y: number) => {
            if (!selectedUnit) return;
            const unit = units.find(u => u.id === selectedUnit);
            if (!unit || unit.team !== 'player') return;

            // Check if valid move
            const isValidMove = validMoves.some(m => m.x === x && m.y === y);
            if (isValidMove) {
                setUnits(prev => prev.map(u =>
                    u.id === selectedUnit ? { ...u, position: { x, y } } : u
                ));
            }
        }, [selectedUnit, units, validMoves]);

        const handleUnitClick = useCallback((unitId: string) => {
            setSelectedUnit(unitId);
        }, []);

        return (
            <Box className="p-4 bg-gray-900 rounded-lg">
                <Typography variant="h6" className="text-white mb-2">
                    🗺️ World Map Navigation
                </Typography>
                <Box display="flex" className="items-center gap-4 mb-4">
                    <Typography variant="body2" className="text-white">
                        Selected: {selectedUnitData?.name || 'None'}
                    </Typography>
                    <Typography variant="body2" className="text-gray-500">
                        Hover: {hoveredTile ? `(${hoveredTile.x}, ${hoveredTile.y})` : '-'}
                    </Typography>
                </Box>
                <IsometricGameCanvas
                    tiles={tiles}
                    units={units}
                    features={features}
                    scale={0.4}
                    selectedUnitId={selectedUnit}
                    validMoves={validMoves}
                    hoveredTile={hoveredTile}
                    onTileClick={handleTileClick}
                    onUnitClick={handleUnitClick}
                    onTileHover={(x, y) => setHoveredTile({ x, y })}
                    onTileLeave={() => setHoveredTile(null)}
                />
            </Box>
        );
    }
};

/**
 * Smaller tactical battle board
 */
export const TacticalBattle: Story = {
    render: () => {
        const [selectedUnit, setSelectedUnit] = useState<string | null>('p1');

        const tiles = generateGridTiles(7, 5);
        const units: IsometricUnit[] = [
            // Player units (left side)
            { id: 'p1', position: { x: 0, y: 1 }, name: 'Knight', team: 'player', health: 100, maxHealth: 100 },
            { id: 'p2', position: { x: 0, y: 2 }, name: 'Archer', team: 'player', health: 60, maxHealth: 60 },
            { id: 'p3', position: { x: 0, y: 3 }, name: 'Mage', team: 'player', health: 45, maxHealth: 45 },
            // Enemy units (right side)
            { id: 'e1', position: { x: 6, y: 1 }, name: 'Orc', team: 'enemy', health: 120, maxHealth: 120 },
            { id: 'e2', position: { x: 6, y: 2 }, name: 'Goblin', team: 'enemy', health: 40, maxHealth: 40 },
            { id: 'e3', position: { x: 6, y: 3 }, name: 'Troll', team: 'enemy', health: 200, maxHealth: 200 }
        ];

        // Valid moves for selected unit
        const selectedUnitData = units.find(u => u.id === selectedUnit);
        const validMoves = selectedUnitData?.team === 'player' && selectedUnitData.position.x === 0
            ? [{ x: 1, y: selectedUnitData.position.y }]
            : [];

        return (
            <Box className="p-4 bg-gray-900 rounded-lg">
                <Typography variant="h6" className="text-white mb-2">
                    ⚔️ Tactical Battle Arena
                </Typography>
                <Typography variant="body2" className="text-gray-400 mb-4">
                    Click units to select them. Green tiles show valid moves.
                </Typography>
                <IsometricGameCanvas
                    tiles={tiles}
                    units={units}
                    scale={0.5}
                    selectedUnitId={selectedUnit}
                    validMoves={validMoves}
                    onUnitClick={(unitId) => setSelectedUnit(unitId)}
                />
            </Box>
        );
    }
};
