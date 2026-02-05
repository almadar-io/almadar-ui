/**
 * ResourceBar Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ResourceBar } from './ResourceBar';
import { Resources } from '../types/resources';

const meta: Meta<typeof ResourceBar> = {
    title: 'Trait Wars/Molecules/ResourceBar',
    component: ResourceBar,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
};

export default meta;
type Story = StoryObj<typeof ResourceBar>;

const sampleResources: Resources = {
    gold: 5000,
    resonance: 150,
    traitShards: 25,
};

const extendedResources: Resources = {
    gold: 12500,
    resonance: 340,
    traitShards: 75,
    wood: 200,
    stone: 150,
    crystal: 45,
};

export const Default: Story = {
    args: {
        resources: sampleResources,
    },
};

export const Compact: Story = {
    args: {
        resources: sampleResources,
        compact: true,
    },
};

export const Extended: Story = {
    args: {
        resources: extendedResources,
        showExtended: true,
    },
};

export const ExtendedCompact: Story = {
    args: {
        resources: extendedResources,
        showExtended: true,
        compact: true,
    },
};

export const LowResources: Story = {
    args: {
        resources: {
            gold: 50,
            resonance: 5,
            traitShards: 0,
        },
    },
};

export const HighResources: Story = {
    args: {
        resources: {
            gold: 999999,
            resonance: 9999,
            traitShards: 500,
        },
    },
};
