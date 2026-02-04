/**
 * TraitIcon Stories
 *
 * Storybook stories for the TraitIcon atom.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { TraitIcon, TraitName } from './TraitIcon';
import { Box } from '../../../components/atoms/Box';

const meta: Meta<typeof TraitIcon> = {
    title: 'Trait Wars/Atoms/TraitIcon',
    component: TraitIcon,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        traitName: {
            control: 'select',
            options: ['attacker', 'defender', 'healer', 'mover', 'summoner', 'special'],
        },
        state: {
            control: 'select',
            options: ['ready', 'active', 'cooldown', 'disabled'],
        },
        size: {
            control: 'select',
            options: ['xs', 'sm', 'md', 'lg', 'xl'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Attacker: Story = {
    args: {
        traitName: 'attacker',
        state: 'ready',
    },
};

export const Defender: Story = {
    args: {
        traitName: 'defender',
        state: 'ready',
    },
};

export const Healer: Story = {
    args: {
        traitName: 'healer',
        state: 'ready',
    },
};

export const Mover: Story = {
    args: {
        traitName: 'mover',
        state: 'ready',
    },
};

export const Summoner: Story = {
    args: {
        traitName: 'summoner',
        state: 'ready',
    },
};

export const Active: Story = {
    args: {
        traitName: 'attacker',
        state: 'active',
    },
};

export const Cooldown: Story = {
    args: {
        traitName: 'defender',
        state: 'cooldown',
        cooldownTurns: 2,
    },
};

export const Disabled: Story = {
    args: {
        traitName: 'healer',
        state: 'disabled',
    },
};

export const Equipped: Story = {
    args: {
        traitName: 'attacker',
        state: 'ready',
        isEquipped: true,
    },
};

export const AllTraits: Story = {
    render: () => (
        <Box display="flex" className="gap-4">
            {(['attacker', 'defender', 'healer', 'mover', 'summoner', 'special'] as TraitName[]).map((trait) => (
                <TraitIcon key={trait} traitName={trait} state="ready" size="lg" />
            ))}
        </Box>
    ),
};

export const AllStates: Story = {
    render: () => (
        <Box display="flex" className="gap-4">
            <TraitIcon traitName="attacker" state="ready" size="lg" />
            <TraitIcon traitName="attacker" state="active" size="lg" />
            <TraitIcon traitName="attacker" state="cooldown" cooldownTurns={3} size="lg" />
            <TraitIcon traitName="attacker" state="disabled" size="lg" />
        </Box>
    ),
};
