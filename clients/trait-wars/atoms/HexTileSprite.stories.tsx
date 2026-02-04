import type { Meta, StoryObj } from '@storybook/react';
import { HexTileSprite, HEX_TILE_IMAGES } from './HexTileSprite';
import { PixelCharacterSprite } from './PixelCharacterSprite';
import { Box } from '../../../components/atoms/Box';
import { Typography } from '../../../components/atoms/Typography';

const meta: Meta<typeof HexTileSprite> = {
    title: 'Trait Wars/Atoms/HexTileSprite',
    component: HexTileSprite,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
    argTypes: {
        type: {
            control: 'select',
            options: Object.keys(HEX_TILE_IMAGES),
        },
        highlight: {
            control: 'select',
            options: ['none', 'valid', 'attack', 'selected', 'hover'],
        },
        scale: {
            control: { type: 'range', min: 0.3, max: 1.5, step: 0.1 },
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        type: 'grassPlain',
        highlight: 'none',
        scale: 0.6,
    },
};

export const AllTerrainTypes: Story = {
    render: () => (
        <Box className="p-6 bg-gray-900 rounded-lg space-y-6">
            <Typography variant="h6" className="text-white">
                🏔️ Hexagon Pack Terrain Tiles
            </Typography>

            {/* Grass */}
            <Box className="space-y-2">
                <Typography variant="caption" className="text-green-400 font-bold">🌿 Grass Terrain</Typography>
                <Box display="flex" className="gap-1 flex-wrap">
                    {Object.keys(HEX_TILE_IMAGES)
                        .filter(k => k.startsWith('grass'))
                        .map((type) => (
                            <HexTileSprite key={type} type={type as keyof typeof HEX_TILE_IMAGES} scale={0.4} />
                        ))
                    }
                </Box>
            </Box>

            {/* Dirt */}
            <Box className="space-y-2">
                <Typography variant="caption" className="text-amber-600 font-bold">🟤 Dirt Terrain</Typography>
                <Box display="flex" className="gap-1 flex-wrap">
                    {Object.keys(HEX_TILE_IMAGES)
                        .filter(k => k.startsWith('dirt'))
                        .map((type) => (
                            <HexTileSprite key={type} type={type as keyof typeof HEX_TILE_IMAGES} scale={0.4} />
                        ))
                    }
                </Box>
            </Box>

            {/* Stone */}
            <Box className="space-y-2">
                <Typography variant="caption" className="text-gray-400 font-bold">⛰️ Stone Terrain</Typography>
                <Box display="flex" className="gap-1 flex-wrap">
                    {Object.keys(HEX_TILE_IMAGES)
                        .filter(k => k.startsWith('stone'))
                        .map((type) => (
                            <HexTileSprite key={type} type={type as keyof typeof HEX_TILE_IMAGES} scale={0.4} />
                        ))
                    }
                </Box>
            </Box>

            {/* Sand */}
            <Box className="space-y-2">
                <Typography variant="caption" className="text-yellow-300 font-bold">🏜️ Sand Terrain</Typography>
                <Box display="flex" className="gap-1 flex-wrap">
                    {Object.keys(HEX_TILE_IMAGES)
                        .filter(k => k.startsWith('sand'))
                        .map((type) => (
                            <HexTileSprite key={type} type={type as keyof typeof HEX_TILE_IMAGES} scale={0.4} />
                        ))
                    }
                </Box>
            </Box>

            {/* Lava/Mars */}
            <Box className="space-y-2">
                <Typography variant="caption" className="text-red-400 font-bold">🔥 Lava/Mars Terrain</Typography>
                <Box display="flex" className="gap-1 flex-wrap">
                    {Object.keys(HEX_TILE_IMAGES)
                        .filter(k => k.startsWith('lava'))
                        .map((type) => (
                            <HexTileSprite key={type} type={type as keyof typeof HEX_TILE_IMAGES} scale={0.4} />
                        ))
                    }
                </Box>
            </Box>
        </Box>
    ),
};

export const HighlightStates: Story = {
    render: () => (
        <Box className="p-6 bg-gray-900 rounded-lg space-y-6">
            <Typography variant="h6" className="text-white">
                ✨ Highlight States
            </Typography>
            <Box display="flex" className="gap-4">
                {(['none', 'valid', 'attack', 'selected', 'hover'] as const).map((highlight) => (
                    <Box key={highlight} className="flex flex-col items-center gap-2">
                        <HexTileSprite
                            type="grassPlain"
                            highlight={highlight}
                            scale={0.6}
                        />
                        <Typography variant="caption" className={
                            highlight === 'valid' ? 'text-green-400' :
                                highlight === 'attack' ? 'text-red-400' :
                                    highlight === 'selected' ? 'text-yellow-400' :
                                        highlight === 'hover' ? 'text-white' :
                                            'text-gray-400'
                        }>
                            {highlight}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    ),
};

export const HexWithCharacter: Story = {
    render: () => (
        <Box className="p-6 bg-gray-900 rounded-lg space-y-6">
            <Typography variant="h6" className="text-white">
                🎮 Hex Tiles with Pixel Characters
            </Typography>
            <Typography variant="body2" className="text-gray-400">
                Combining high-fidelity hex tiles with 24×24 pixel character sprites
            </Typography>
            <Box display="flex" className="gap-4">
                {/* Player unit */}
                <Box className="relative">
                    <HexTileSprite type="grassPlain" scale={0.7} highlight="selected" />
                    <Box
                        className="absolute flex items-center justify-center"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -60%)',
                        }}
                    >
                        <PixelCharacterSprite type="robotTeal" team="player" scale={2} />
                    </Box>
                </Box>

                {/* Enemy unit */}
                <Box className="relative">
                    <HexTileSprite type="dirtPlain" scale={0.7} highlight="attack" />
                    <Box
                        className="absolute flex items-center justify-center"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -60%)',
                        }}
                    >
                        <PixelCharacterSprite type="robotRed" team="enemy" scale={2} />
                    </Box>
                </Box>

                {/* Valid move */}
                <Box className="relative">
                    <HexTileSprite type="grassTrees" scale={0.7} highlight="valid" />
                </Box>

                {/* Neutral */}
                <Box className="relative">
                    <HexTileSprite type="stonePlain" scale={0.7} />
                </Box>
            </Box>
        </Box>
    ),
};

export const HexGrid: Story = {
    render: () => {
        const SCALE = 0.5;
        const HEX_W = 120 * SCALE;
        const HEX_H = 140 * SCALE;
        const ROW_OFFSET = HEX_W * 0.5; // Offset for odd rows
        const VERTICAL_SPACING = HEX_H * 0.75; // Hexes overlap vertically

        const grid = [
            ['grassTrees', 'grassPlain', 'grassPlain', 'grassRocks', 'grassPlain'],
            ['grassPlain', 'grassPlain', 'dirtPlain', 'grassPlain', 'grassTrees'],
            ['stonePlain', 'grassPlain', 'grassPlain', 'grassPlain', 'dirtPath'],
            ['stoneMountain', 'dirtRocks', 'sandPlain', 'grassPlain', 'grassPlain'],
        ];

        return (
            <Box className="p-6 bg-gray-900 rounded-lg">
                <Typography variant="h6" className="text-white mb-4">
                    🗺️ Hex Grid Map (5×4)
                </Typography>
                <Box
                    className="relative"
                    style={{
                        width: HEX_W * 5 + ROW_OFFSET,
                        height: VERTICAL_SPACING * 4 + HEX_H * 0.25,
                    }}
                >
                    {grid.map((row, rowIdx) => (
                        row.map((tile, colIdx) => (
                            <Box
                                key={`${rowIdx}-${colIdx}`}
                                className="absolute"
                                style={{
                                    left: colIdx * HEX_W + (rowIdx % 2 === 1 ? ROW_OFFSET : 0),
                                    top: rowIdx * VERTICAL_SPACING,
                                }}
                            >
                                <HexTileSprite
                                    type={tile as keyof typeof HEX_TILE_IMAGES}
                                    scale={SCALE}
                                    highlight={
                                        rowIdx === 1 && colIdx === 1 ? 'selected' :
                                            rowIdx === 1 && colIdx === 2 ? 'valid' :
                                                rowIdx === 2 && colIdx === 3 ? 'attack' :
                                                    'none'
                                    }
                                />
                            </Box>
                        ))
                    ))}
                </Box>
            </Box>
        );
    },
};

export const BattleScene: Story = {
    render: () => {
        const SCALE = 0.55;
        const HEX_W = 120 * SCALE;
        const HEX_H = 140 * SCALE;
        const ROW_OFFSET = HEX_W * 0.5;
        const VERTICAL_SPACING = HEX_H * 0.75;

        // Unit positions
        const units: Array<{
            row: number;
            col: number;
            character: string;
            team: 'player' | 'enemy';
        }> = [
                { row: 0, col: 1, character: 'robotTeal', team: 'player' },
                { row: 1, col: 0, character: 'alienYellow', team: 'player' },
                { row: 2, col: 3, character: 'robotRed', team: 'enemy' },
                { row: 1, col: 4, character: 'robotGray', team: 'enemy' },
            ];

        const grid = [
            ['grassPlain', 'grassPlain', 'grassRocks', 'dirtPlain', 'stonePlain'],
            ['grassTrees', 'grassPlain', 'grassPlain', 'dirtRocks', 'lavaPlain'],
            ['grassPlain', 'grassPlain', 'stoneBoulders', 'grassPlain', 'grassPlain'],
        ];

        return (
            <Box className="p-6 bg-gray-900 rounded-lg">
                <Typography variant="h6" className="text-white mb-2">
                    ⚔️ Battle Scene Demo
                </Typography>
                <Typography variant="body2" className="text-gray-400 mb-4">
                    Hex grid terrain + Pixel character sprites
                </Typography>
                <Box
                    className="relative bg-gray-800 p-4 rounded-lg"
                    style={{
                        width: HEX_W * 5 + ROW_OFFSET + 16,
                        height: VERTICAL_SPACING * 3 + HEX_H * 0.35 + 16,
                    }}
                >
                    {grid.map((row, rowIdx) => (
                        row.map((tile, colIdx) => {
                            const unit = units.find(u => u.row === rowIdx && u.col === colIdx);
                            const isSelected = rowIdx === 0 && colIdx === 1;
                            const isValidMove = (rowIdx === 0 && colIdx === 2) || (rowIdx === 1 && colIdx === 1);
                            const isAttack = rowIdx === 1 && colIdx === 4;

                            return (
                                <Box
                                    key={`${rowIdx}-${colIdx}`}
                                    className="absolute"
                                    style={{
                                        left: colIdx * HEX_W + (rowIdx % 2 === 1 ? ROW_OFFSET : 0) + 8,
                                        top: rowIdx * VERTICAL_SPACING + 8,
                                    }}
                                >
                                    <HexTileSprite
                                        type={tile as keyof typeof HEX_TILE_IMAGES}
                                        scale={SCALE}
                                        highlight={
                                            isSelected ? 'selected' :
                                                isValidMove ? 'valid' :
                                                    isAttack ? 'attack' :
                                                        'none'
                                        }
                                    />
                                    {unit && (
                                        <Box
                                            className="absolute flex items-center justify-center"
                                            style={{
                                                top: '40%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                            }}
                                        >
                                            <PixelCharacterSprite
                                                type={unit.character as any}
                                                team={unit.team}
                                                scale={1.8}
                                                state={isSelected ? 'attacking' : 'idle'}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            );
                        })
                    ))}
                </Box>
                <Box className="mt-4 flex gap-4">
                    <Typography variant="caption" className="text-yellow-400">● Selected</Typography>
                    <Typography variant="caption" className="text-green-400">● Valid Move</Typography>
                    <Typography variant="caption" className="text-red-400">● Attack Target</Typography>
                </Box>
            </Box>
        );
    },
};
