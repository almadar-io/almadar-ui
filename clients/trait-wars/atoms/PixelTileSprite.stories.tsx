import type { Meta, StoryObj } from '@storybook/react';
import { PixelTileSprite, PIXEL_TILE_SPRITES } from './PixelTileSprite';
import { Box } from '@almadar/ui';
import { Typography } from '@almadar/ui';

const meta: Meta<typeof PixelTileSprite> = {
    title: 'Trait Wars/Atoms/PixelTileSprite',
    component: PixelTileSprite,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
    argTypes: {
        type: {
            control: 'select',
            options: Object.keys(PIXEL_TILE_SPRITES),
        },
        highlight: {
            control: 'select',
            options: ['none', 'valid', 'attack', 'selected', 'hover'],
        },
        scale: {
            control: { type: 'range', min: 1, max: 6, step: 0.5 },
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        type: 'grassCenter',
        highlight: 'none',
        scale: 3,
    },
};

export const AllTiles: Story = {
    render: () => (
        <Box className="p-6 bg-gray-900 rounded-lg">
            <Typography variant="h6" className="text-white mb-4">
                🌍 All Pixel Platformer Tiles (18×18 sprites)
            </Typography>
            <Box display="grid" className="grid-cols-8 gap-2">
                {Object.entries(PIXEL_TILE_SPRITES).map(([type]) => (
                    <Box key={type} className="flex flex-col items-center gap-1">
                        <PixelTileSprite
                            type={type as keyof typeof PIXEL_TILE_SPRITES}
                            scale={2}
                        />
                        <Typography variant="caption" className="text-gray-500 text-[10px] text-center">
                            {type}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    ),
};

export const TerrainTypes: Story = {
    render: () => (
        <Box className="p-6 bg-gray-900 rounded-lg space-y-6">
            <Typography variant="h6" className="text-white">
                🏔️ Terrain Categories
            </Typography>

            {/* Grass */}
            <Box className="space-y-2">
                <Typography variant="caption" className="text-green-400 font-bold">Grass Tiles</Typography>
                <Box display="flex" className="gap-2">
                    {['grassFull', 'grassTopLeft', 'grassTop', 'grassTopRight', 'grassLeft', 'grassCenter', 'grassRight'].map((type) => (
                        <PixelTileSprite key={type} type={type as keyof typeof PIXEL_TILE_SPRITES} scale={2} />
                    ))}
                </Box>
            </Box>

            {/* Dirt */}
            <Box className="space-y-2">
                <Typography variant="caption" className="text-amber-400 font-bold">Dirt Tiles</Typography>
                <Box display="flex" className="gap-2">
                    {['dirtFull', 'dirtTopLeft', 'dirtTop', 'dirtTopRight', 'dirtLeft', 'dirtCenter', 'dirtRight'].map((type) => (
                        <PixelTileSprite key={type} type={type as keyof typeof PIXEL_TILE_SPRITES} scale={2} />
                    ))}
                </Box>
            </Box>

            {/* Stone & Wood */}
            <Box className="space-y-2">
                <Typography variant="caption" className="text-gray-400 font-bold">Stone & Wood</Typography>
                <Box display="flex" className="gap-2">
                    {['stoneBlock', 'stonePlatform', 'woodBlock', 'woodPlatform'].map((type) => (
                        <PixelTileSprite key={type} type={type as keyof typeof PIXEL_TILE_SPRITES} scale={2} />
                    ))}
                </Box>
            </Box>

            {/* Water & Ice */}
            <Box className="space-y-2">
                <Typography variant="caption" className="text-cyan-400 font-bold">Water & Ice</Typography>
                <Box display="flex" className="gap-2">
                    {['waterTop', 'waterFull', 'iceTop', 'iceFull', 'iceBlock'].map((type) => (
                        <PixelTileSprite key={type} type={type as keyof typeof PIXEL_TILE_SPRITES} scale={2} />
                    ))}
                </Box>
            </Box>

            {/* Special */}
            <Box className="space-y-2">
                <Typography variant="caption" className="text-red-400 font-bold">Special & Hazards</Typography>
                <Box display="flex" className="gap-2">
                    {['lava', 'spikes', 'chest', 'door'].map((type) => (
                        <PixelTileSprite key={type} type={type as keyof typeof PIXEL_TILE_SPRITES} scale={2} />
                    ))}
                </Box>
            </Box>

            {/* Decorations */}
            <Box className="space-y-2">
                <Typography variant="caption" className="text-purple-400 font-bold">Decorations</Typography>
                <Box display="flex" className="gap-2">
                    {['bush', 'tree', 'flower', 'mushroom', 'rock'].map((type) => (
                        <PixelTileSprite key={type} type={type as keyof typeof PIXEL_TILE_SPRITES} scale={2} />
                    ))}
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
            <Box display="flex" className="gap-6">
                {(['none', 'valid', 'attack', 'selected', 'hover'] as const).map((highlight) => (
                    <Box key={highlight} className="flex flex-col items-center gap-2">
                        <PixelTileSprite
                            type="grassCenter"
                            highlight={highlight}
                            scale={3}
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

export const GameBoard: Story = {
    render: () => (
        <Box className="p-6 bg-gray-900 rounded-lg space-y-4">
            <Typography variant="h6" className="text-white">
                🎮 Sample Game Board (6×4)
            </Typography>
            <Box
                display="grid"
                className="gap-0.5 bg-gray-800 p-2 rounded-lg border border-gray-700"
                style={{ gridTemplateColumns: 'repeat(6, 54px)' }}
            >
                {/* Row 0 */}
                <PixelTileSprite type="grassTopLeft" scale={3} />
                <PixelTileSprite type="grassTop" scale={3} />
                <PixelTileSprite type="grassTop" scale={3} />
                <PixelTileSprite type="waterTop" scale={3} />
                <PixelTileSprite type="grassTop" scale={3} />
                <PixelTileSprite type="grassTopRight" scale={3} />

                {/* Row 1 */}
                <PixelTileSprite type="grassLeft" scale={3} />
                <PixelTileSprite type="grassCenter" scale={3} highlight="selected" />
                <PixelTileSprite type="grassCenter" scale={3} highlight="valid" />
                <PixelTileSprite type="waterFull" scale={3} />
                <PixelTileSprite type="grassCenter" scale={3} highlight="attack" />
                <PixelTileSprite type="grassRight" scale={3} />

                {/* Row 2 */}
                <PixelTileSprite type="grassLeft" scale={3} />
                <PixelTileSprite type="grassCenter" scale={3} highlight="valid" />
                <PixelTileSprite type="stoneBlock" scale={3} />
                <PixelTileSprite type="stoneBlock" scale={3} />
                <PixelTileSprite type="grassCenter" scale={3} />
                <PixelTileSprite type="grassRight" scale={3} />

                {/* Row 3 */}
                <PixelTileSprite type="dirtTopLeft" scale={3} />
                <PixelTileSprite type="dirtTop" scale={3} />
                <PixelTileSprite type="dirtTop" scale={3} />
                <PixelTileSprite type="dirtTop" scale={3} />
                <PixelTileSprite type="dirtTop" scale={3} />
                <PixelTileSprite type="dirtTopRight" scale={3} />
            </Box>
            <Typography variant="body2" className="text-gray-400">
                Yellow = Selected | Green = Valid Move | Red = Attack Target
            </Typography>
        </Box>
    ),
};
