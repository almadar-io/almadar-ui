/**
 * CharacterSprite Stories
 *
 * Storybook stories for the CharacterSprite component.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CharacterSprite, CHARACTER_SPRITES, CharacterType } from './CharacterSprite';
import { Box } from '../../../components/atoms/Box';
import { Typography } from '../../../components/atoms/Typography';

const meta: Meta<typeof CharacterSprite> = {
    title: 'Trait Wars/Atoms/CharacterSprite',
    component: CharacterSprite,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
    argTypes: {
        type: {
            control: 'select',
            options: Object.keys(CHARACTER_SPRITES),
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
            control: { type: 'range', min: 1, max: 6, step: 1 },
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        type: 'knight',
        scale: 3,
        team: 'neutral',
        state: 'idle',
    },
};

export const PlayerTeam: Story = {
    args: {
        type: 'mage',
        team: 'player',
        scale: 4,
    },
};

export const EnemyTeam: Story = {
    args: {
        type: 'skeleton',
        team: 'enemy',
        scale: 4,
    },
};

export const AttackingState: Story = {
    args: {
        type: 'warrior',
        state: 'attacking',
        scale: 4,
    },
};

export const AllCharacterTypes: Story = {
    render: () => (
        <Box display="flex" className="flex-wrap gap-4 p-4 bg-gray-800 rounded-lg">
            {(Object.keys(CHARACTER_SPRITES) as CharacterType[]).map((type) => (
                <Box key={type} display="flex" className="flex-col items-center gap-2">
                    <CharacterSprite type={type} scale={3} />
                    <Typography variant="caption" className="text-white text-xs">
                        {type}
                    </Typography>
                </Box>
            ))}
        </Box>
    ),
};

export const TeamComparison: Story = {
    render: () => (
        <Box display="flex" className="gap-8 p-4 bg-gray-800 rounded-lg">
            <Box display="flex" className="flex-col items-center gap-2">
                <CharacterSprite type="knight" team="player" scale={4} />
                <Typography variant="caption" className="text-blue-400">Player</Typography>
            </Box>
            <Box display="flex" className="flex-col items-center gap-2">
                <CharacterSprite type="knight" team="neutral" scale={4} />
                <Typography variant="caption" className="text-gray-400">Neutral</Typography>
            </Box>
            <Box display="flex" className="flex-col items-center gap-2">
                <CharacterSprite type="knight" team="enemy" scale={4} />
                <Typography variant="caption" className="text-red-400">Enemy</Typography>
            </Box>
        </Box>
    ),
};

export const StateComparison: Story = {
    render: () => (
        <Box display="flex" className="gap-4 p-4 bg-gray-800 rounded-lg">
            {(['idle', 'attacking', 'defending', 'casting', 'wounded'] as const).map((state) => (
                <Box key={state} display="flex" className="flex-col items-center gap-2">
                    <CharacterSprite type="mage" state={state} scale={4} />
                    <Typography variant="caption" className="text-white text-xs">
                        {state}
                    </Typography>
                </Box>
            ))}
        </Box>
    ),
};
