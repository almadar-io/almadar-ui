/**
 * GameUnit Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { GameUnit } from './GameUnit';
import { Box } from '../../../components/atoms/Box';
import { Typography } from '../../../components/atoms/Typography';

const meta: Meta<typeof GameUnit> = {
    title: 'Trait Wars/Molecules/GameUnit',
    component: GameUnit,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
    argTypes: {
        characterType: {
            control: 'select',
            options: ['knight', 'mage', 'rogue', 'archer', 'healer', 'warrior', 'skeleton', 'zombie', 'ghost', 'demon'],
        },
        team: {
            control: 'select',
            options: ['player', 'enemy', 'neutral'],
        },
        state: {
            control: 'select',
            options: ['idle', 'active', 'attacking', 'defending', 'casting', 'recovering', 'cooldown'],
        },
        variant: {
            control: 'select',
            options: ['card', 'compact', 'inline'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        name: 'Sir Knight',
        characterType: 'knight',
        team: 'player',
        state: 'idle',
        health: 80,
        maxHealth: 100,
    },
};

export const PlayerVsEnemy: Story = {
    render: () => (
        <Box display="flex" className="gap-4">
            <GameUnit
                name="Player Knight"
                characterType="knight"
                team="player"
                state="defending"
                health={75}
                maxHealth={100}
            />
            <GameUnit
                name="Enemy Skeleton"
                characterType="skeleton"
                team="enemy"
                state="attacking"
                health={40}
                maxHealth=
                {60}
            />
        </Box>
    ),
};

export const AllVariants: Story = {
    render: () => (
        <Box display="flex" className="flex-col gap-4">
            <Box>
                <Typography variant="caption" className="text-gray-400 mb-2 block">Card Variant</Typography>
                <GameUnit name="Mage" characterType="mage" team="player" state="casting" health={50} maxHealth={60} variant="card" />
            </Box>
            <Box>
                <Typography variant="caption" className="text-gray-400 mb-2 block">Compact Variant</Typography>
                <GameUnit name="Warrior" characterType="warrior" team="enemy" state="attacking" health={90} maxHealth={120} variant="compact" />
            </Box>
            <Box>
                <Typography variant="caption" className="text-gray-400 mb-2 block">Inline Variant</Typography>
                <GameUnit name="Healer" characterType="healer" team="player" state="idle" health={40} maxHealth={40} variant="inline" />
            </Box>
        </Box>
    ),
};

export const SelectedAndTargetable: Story = {
    render: () => (
        <Box display="flex" className="gap-4">
            <GameUnit
                name="Selected Unit"
                characterType="archer"
                team="player"
                state="active"
                health={55}
                maxHealth={70}
                isSelected
            />
            <GameUnit
                name="Targetable Enemy"
                characterType="demon"
                team="enemy"
                state="defending"
                health={100}
                maxHealth={150}
                isTargetable
            />
        </Box>
    ),
};

export const BattleFormation: Story = {
    render: () => (
        <Box display="flex" className="flex-col gap-4">
            <Typography variant="h6" className="text-white">Player Team</Typography>
            <Box display="flex" className="gap-2">
                <GameUnit name="Knight" characterType="knight" team="player" state="defending" health={90} maxHealth={100} variant="compact" />
                <GameUnit name="Mage" characterType="mage" team="player" state="casting" health={40} maxHealth={50} variant="compact" />
                <GameUnit name="Healer" characterType="healer" team="player" state="idle" health={35} maxHealth={40} variant="compact" />
            </Box>
            <Typography variant="h6" className="text-white mt-4">Enemy Team</Typography>
            <Box display="flex" className="gap-2">
                <GameUnit name="Skeleton" characterType="skeleton" team="enemy" state="attacking" health={30} maxHealth={40} variant="compact" />
                <GameUnit name="Zombie" characterType="zombie" team="enemy" state="idle" health={50} maxHealth={60} variant="compact" />
                <GameUnit name="Ghost" characterType="ghost" team="enemy" state="cooldown" health={25} maxHealth={30} variant="compact" />
            </Box>
        </Box>
    ),
};
