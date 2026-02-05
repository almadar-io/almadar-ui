/**
 * CharacterSprite Stories
 *
 * Showcases the isometric character sprites in "Illuminated Manuscript Futurism" style.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { CharacterSprite } from './CharacterSprite';

const meta: Meta<typeof CharacterSprite> = {
    title: 'Trait Wars/Atoms/CharacterSprite',
    component: CharacterSprite,
    parameters: {
        layout: 'centered',
        backgrounds: {
            default: 'dark',
            values: [
                { name: 'dark', value: '#1a1a2e' },
                { name: 'parchment', value: '#f4e4c1' },
            ],
        },
    },
    argTypes: {
        type: {
            control: 'select',
            options: ['hero', 'caregiver', 'explorer', 'sage', 'shadowLegion', 'emperor'],
            description: 'Character archetype to display',
        },
        scale: {
            control: { type: 'range', min: 0.1, max: 0.5, step: 0.05 },
            description: 'Size multiplier',
        },
        team: {
            control: 'select',
            options: ['player', 'enemy', 'neutral'],
            description: 'Team color tint',
        },
        state: {
            control: 'select',
            options: ['idle', 'attacking', 'defending', 'casting', 'wounded'],
            description: 'Visual state',
        },
    },
};

export default meta;
type Story = StoryObj<typeof CharacterSprite>;

export const Hero: Story = {
    args: {
        type: 'hero',
        scale: 0.25,
        team: 'player',
        state: 'idle',
    },
};

export const Caregiver: Story = {
    args: {
        type: 'caregiver',
        scale: 0.25,
        team: 'player',
        state: 'idle',
    },
};

export const Explorer: Story = {
    args: {
        type: 'explorer',
        scale: 0.25,
        team: 'player',
        state: 'idle',
    },
};

export const Sage: Story = {
    args: {
        type: 'sage',
        scale: 0.25,
        team: 'player',
        state: 'casting',
    },
};

export const ShadowLegion: Story = {
    args: {
        type: 'shadowLegion',
        scale: 0.25,
        team: 'enemy',
        state: 'idle',
    },
};

export const Emperor: Story = {
    args: {
        type: 'emperor',
        scale: 0.25,
        team: 'enemy',
        state: 'idle',
    },
};

export const AllCharacters: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', padding: '20px' }}>
            <CharacterSprite type="hero" scale={0.2} team="player" />
            <CharacterSprite type="caregiver" scale={0.2} team="player" />
            <CharacterSprite type="explorer" scale={0.2} team="player" />
            <CharacterSprite type="sage" scale={0.2} team="player" />
            <CharacterSprite type="shadowLegion" scale={0.2} team="enemy" />
            <CharacterSprite type="emperor" scale={0.2} team="enemy" />
        </div>
    ),
};
