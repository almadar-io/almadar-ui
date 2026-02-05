/**
 * WorldMapTemplate Stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { WorldMapTemplate } from './WorldMapTemplate';
import { MapNodeData, Resources } from '../types/resources';

const meta: Meta<typeof WorldMapTemplate> = {
    title: 'Trait Wars/Templates/WorldMapTemplate',
    component: WorldMapTemplate,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
};

export default meta;
type Story = StoryObj<typeof WorldMapTemplate>;

const sampleNodes: MapNodeData[] = [
    // Player starting city
    { id: 'iram', type: 'city', name: 'Iram', x: 20, y: 50, visited: true, accessible: true, owner: 'player', connectedTo: ['mine-1', 'crossroads'] },
    // Resource nodes
    { id: 'mine-1', type: 'resource', name: 'Gold Mine', x: 15, y: 30, visited: true, accessible: true, connectedTo: ['iram'], resourceType: 'gold', resourceAmount: 100 },
    // Neutral crossroads
    { id: 'crossroads', type: 'battle', name: 'Crossroads', x: 40, y: 50, visited: false, accessible: true, connectedTo: ['iram', 'dungeon-1', 'enemy-castle'], enemyStrength: 50 },
    // Dungeon
    { id: 'dungeon-1', type: 'dungeon', name: 'Shadow Caverns', x: 55, y: 30, visited: false, accessible: true, connectedTo: ['crossroads', 'treasure-1'], enemyStrength: 100 },
    // Treasure
    { id: 'treasure-1', type: 'treasure', name: 'Ancient Vault', x: 70, y: 20, visited: false, accessible: false, connectedTo: ['dungeon-1'] },
    // Enemy castle
    { id: 'enemy-castle', type: 'castle', name: 'The Citadel', x: 75, y: 60, visited: false, accessible: true, owner: 'enemy', connectedTo: ['crossroads', 'portal-1'] },
    // Portal
    { id: 'portal-1', type: 'portal', name: 'Dimension Gate', x: 85, y: 80, visited: false, accessible: false, connectedTo: ['enemy-castle'] },
];

const sampleResources: Resources = {
    gold: 5000,
    resonance: 150,
    traitShards: 25,
};

const sampleHero = {
    id: 'valence',
    name: 'Unit 734 (Valence)',
    level: 5,
    archetype: 'Architect',
};

export const Default: Story = {
    args: {
        mapData: {
            id: 'campaign-1',
            name: 'The Liberation',
            nodes: sampleNodes,
            playerPosition: 'iram',
            turnNumber: 1,
        },
        playerHero: sampleHero,
        resources: sampleResources,
        onNodeSelect: (node) => console.log('Selected:', node.name),
        onMove: (nodeId) => console.log('Moving to:', nodeId),
        onEndTurn: () => console.log('End turn'),
    },
};

export const MidGame: Story = {
    args: {
        mapData: {
            id: 'campaign-1',
            name: 'The Liberation',
            nodes: sampleNodes.map((n) => ({
                ...n,
                visited: ['iram', 'mine-1', 'crossroads', 'dungeon-1'].includes(n.id),
                accessible: n.id !== 'portal-1',
            })),
            playerPosition: 'dungeon-1',
            turnNumber: 8,
        },
        playerHero: { ...sampleHero, level: 7 },
        resources: {
            gold: 12000,
            resonance: 320,
            traitShards: 45,
        },
        onNodeSelect: (node) => console.log('Selected:', node.name),
        onMove: (nodeId) => console.log('Moving to:', nodeId),
        onEndTurn: () => console.log('End turn'),
    },
};
