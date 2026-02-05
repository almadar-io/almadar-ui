import type { Meta, StoryObj } from '@storybook/react-vite';
import { PixelCharacterSprite, PIXEL_CHARACTER_SPRITES, CHARACTER_TYPE_MAP } from './PixelCharacterSprite';
import { Box } from '@almadar/ui';
import { Typography } from '@almadar/ui';

const meta: Meta<typeof PixelCharacterSprite> = {
    title: 'Trait Wars/Atoms/PixelCharacterSprite',
    component: PixelCharacterSprite,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
    argTypes: {
        type: {
            control: 'select',
            options: Object.keys(PIXEL_CHARACTER_SPRITES),
        },
        team: {
            control: 'select',
            options: ['player', 'enemy', 'neutral'],
        },
        state: {
            control: 'select',
            options: ['idle', 'attacking', 'defending', 'casting', 'wounded'],
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
        type: 'robotTeal',
        team: 'neutral',
        state: 'idle',
        scale: 2,
    },
};

export const AllCharacters: Story = {
    render: () => (
        <Box className="p-6 bg-gray-900 rounded-lg">
            <Typography variant="h6" className="text-white mb-4">
                🤖 All Pixel Platformer Characters (24×24 sprites)
            </Typography>
            <Box display="grid" className="grid-cols-9 gap-4">
                {Object.keys(PIXEL_CHARACTER_SPRITES).map((type) => (
                    <Box key={type} className="flex flex-col items-center gap-2">
                        <PixelCharacterSprite
                            type={type as keyof typeof PIXEL_CHARACTER_SPRITES}
                            scale={2}
                        />
                        <Typography variant="caption" className="text-gray-400 text-xs text-center">
                            {type}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    ),
};

export const TeamColors: Story = {
    render: () => (
        <Box className="p-6 bg-gray-900 rounded-lg space-y-6">
            <Typography variant="h6" className="text-white">
                🎨 Team Color Variants
            </Typography>
            <Box display="flex" className="gap-8">
                {(['player', 'enemy', 'neutral'] as const).map((team) => (
                    <Box key={team} className="flex flex-col items-center gap-2">
                        <PixelCharacterSprite type="robotTeal" team={team} scale={3} />
                        <Typography
                            variant="caption"
                            className={
                                team === 'player' ? 'text-blue-400' :
                                    team === 'enemy' ? 'text-red-400' :
                                        'text-gray-400'
                            }
                        >
                            {team.toUpperCase()}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    ),
};

export const StateEffects: Story = {
    render: () => (
        <Box className="p-6 bg-gray-900 rounded-lg space-y-6">
            <Typography variant="h6" className="text-white">
                ⚔️ State Visual Effects
            </Typography>
            <Box display="flex" className="gap-6">
                {(['idle', 'attacking', 'defending', 'casting', 'wounded'] as const).map((state) => (
                    <Box key={state} className="flex flex-col items-center gap-2">
                        <PixelCharacterSprite
                            type="robotTeal"
                            team="player"
                            state={state}
                            scale={3}
                        />
                        <Typography variant="caption" className="text-gray-400 capitalize">
                            {state}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    ),
};

export const GameUnits: Story = {
    render: () => (
        <Box className="p-6 bg-gray-900 rounded-lg space-y-6">
            <Typography variant="h6" className="text-white">
                🎮 Game Unit Mappings (Legacy Type → Pixel Sprite)
            </Typography>
            <Typography variant="body2" className="text-gray-400 mb-4">
                These show how existing character types map to new sprites
            </Typography>
            <Box display="grid" className="grid-cols-3 gap-6">
                {/* Player Units */}
                <Box className="p-4 bg-blue-900/30 rounded-lg border border-blue-500/50">
                    <Typography variant="caption" className="text-blue-400 font-bold block mb-3">
                        👤 Player Units
                    </Typography>
                    <Box display="flex" className="flex-wrap gap-4">
                        {['knight', 'warrior', 'mage', 'healer', 'archer', 'rogue'].map((type) => (
                            <Box key={type} className="flex flex-col items-center gap-1">
                                <PixelCharacterSprite
                                    type={type as keyof typeof CHARACTER_TYPE_MAP}
                                    team="player"
                                    scale={2}
                                />
                                <Typography variant="caption" className="text-xs text-gray-400">
                                    {type}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Enemy Units */}
                <Box className="p-4 bg-red-900/30 rounded-lg border border-red-500/50">
                    <Typography variant="caption" className="text-red-400 font-bold block mb-3">
                        👹 Enemy Units
                    </Typography>
                    <Box display="flex" className="flex-wrap gap-4">
                        {['skeleton', 'zombie', 'ghost', 'demon', 'dragon', 'slime'].map((type) => (
                            <Box key={type} className="flex flex-col items-center gap-1">
                                <PixelCharacterSprite
                                    type={type as keyof typeof CHARACTER_TYPE_MAP}
                                    team="enemy"
                                    scale={2}
                                />
                                <Typography variant="caption" className="text-xs text-gray-400">
                                    {type}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Size Comparison */}
                <Box className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                    <Typography variant="caption" className="text-gray-300 font-bold block mb-3">
                        📏 Size Comparison
                    </Typography>
                    <Box display="flex" className="flex-wrap gap-4 items-end">
                        <Box className="flex flex-col items-center gap-1">
                            <PixelCharacterSprite type="robotTeal" scale={1} />
                            <Typography variant="caption" className="text-xs text-gray-500">
                                1× (24px)
                            </Typography>
                        </Box>
                        <Box className="flex flex-col items-center gap-1">
                            <PixelCharacterSprite type="robotTeal" scale={2} />
                            <Typography variant="caption" className="text-xs text-gray-500">
                                2× (48px)
                            </Typography>
                        </Box>
                        <Box className="flex flex-col items-center gap-1">
                            <PixelCharacterSprite type="robotTeal" scale={3} />
                            <Typography variant="caption" className="text-xs text-gray-500">
                                3× (72px)
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    ),
};
