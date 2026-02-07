/**
 * CanvasBattleTemplate Stories
 *
 * Canvas-based tactical battle with isometric terrain, robot unit sprites,
 * trait state viewers, and combat log.
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CanvasBattleTemplate, BattleUnit } from './CanvasBattleTemplate';
import { TraitWarsAssetProvider, DEFAULT_ASSET_MANIFEST } from '../assets';

const meta: Meta<typeof CanvasBattleTemplate> = {
    title: 'Trait Wars/Templates/CanvasBattleTemplate',
    component: CanvasBattleTemplate,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
        docs: {
            description: {
                component: 'Canvas-based isometric tactical battle with robot unit sprites, trait state machines, combat log, and phase-based turns.',
            },
        },
    },
    argTypes: {
        animationSpeed: {
            control: { type: 'range', min: 0.25, max: 5, step: 0.25 },
            description: 'Animation speed multiplier (1 = baseline, 2 = double)',
        },
    },
    decorators: [
        (Story) => (
            <TraitWarsAssetProvider manifest={DEFAULT_ASSET_MANIFEST}>
                <Story />
            </TraitWarsAssetProvider>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof CanvasBattleTemplate>;

// ============================================================================
// SAMPLE UNITS
// ============================================================================

const basicUnits: BattleUnit[] = [
    // Player units (left side)
    {
        id: 'p-worker-1',
        name: 'Worker Squad',
        unitType: 'worker',
        team: 'player',
        position: { x: 0, y: 1 },
        health: 60,
        maxHealth: 60,
        movement: 3,
        attack: 8,
        defense: 4,
        traits: [{
            name: 'Trust',
            currentState: 'idle',
            states: ['idle', 'believing', 'inspiring'],
            cooldown: 0,
        }],
    },
    {
        id: 'p-guardian-1',
        name: 'Guardian',
        unitType: 'guardian',
        team: 'player',
        position: { x: 0, y: 2 },
        health: 120,
        maxHealth: 120,
        movement: 2,
        attack: 12,
        defense: 10,
        traits: [{
            name: 'Defend',
            currentState: 'idle',
            states: ['idle', 'shielding', 'countering'],
            cooldown: 0,
        }],
    },
    {
        id: 'p-mender-1',
        name: 'Mender',
        unitType: 'mender',
        team: 'player',
        position: { x: 0, y: 3 },
        health: 45,
        maxHealth: 45,
        movement: 3,
        attack: 5,
        defense: 3,
        traits: [{
            name: 'Mend',
            currentState: 'idle',
            states: ['idle', 'scanning', 'diagnosing', 'healing'],
            cooldown: 0,
        }],
    },
    // Enemy units (right side)
    {
        id: 'e-scrapper-1',
        name: 'Scrapper',
        unitType: 'scrapper',
        team: 'enemy',
        position: { x: 6, y: 1 },
        health: 70,
        maxHealth: 70,
        movement: 3,
        attack: 10,
        defense: 5,
        traits: [{
            name: 'Disrupt',
            currentState: 'idle',
            states: ['idle', 'infiltrating', 'overloading', 'breaking'],
            cooldown: 0,
        }],
    },
    {
        id: 'e-breaker-1',
        name: 'Breaker',
        unitType: 'breaker',
        team: 'enemy',
        position: { x: 6, y: 2 },
        health: 100,
        maxHealth: 100,
        movement: 2,
        attack: 15,
        defense: 8,
        traits: [{
            name: 'Berserker',
            currentState: 'idle',
            states: ['idle', 'defending', 'enraged', 'exhausted'],
            cooldown: 0,
        }],
    },
    {
        id: 'e-conductor-1',
        name: 'Conductor',
        unitType: 'conductor',
        team: 'enemy',
        position: { x: 6, y: 3 },
        health: 150,
        maxHealth: 150,
        movement: 2,
        attack: 18,
        defense: 12,
        traits: [{
            name: 'Command',
            currentState: 'idle',
            states: ['idle', 'assessing', 'directing', 'coordinating'],
            cooldown: 0,
        }],
    },
];

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default battle scenario: 3v3 with robot units
 */
export const Default: Story = {
    args: {
        initialUnits: basicUnits,
        boardWidth: 7,
        boardHeight: 5,
        scale: 0.45,
        animationSpeed: 2,
    },
};

/**
 * Larger battlefield with more units
 */
const largeUnits: BattleUnit[] = [
    // Player army
    {
        id: 'p-worker-1', name: 'Workers', unitType: 'worker', team: 'player',
        position: { x: 0, y: 1 }, health: 60, maxHealth: 60, movement: 3, attack: 8, defense: 4,
        traits: [{ name: 'Trust', currentState: 'idle', states: ['idle', 'believing', 'inspiring'], cooldown: 0 }],
    },
    {
        id: 'p-guardian-1', name: 'Guardian', unitType: 'guardian', team: 'player',
        position: { x: 0, y: 2 }, health: 120, maxHealth: 120, movement: 2, attack: 12, defense: 10,
        traits: [{ name: 'Defend', currentState: 'idle', states: ['idle', 'shielding', 'countering'], cooldown: 0 }],
    },
    {
        id: 'p-resonator-1', name: 'Resonator', unitType: 'resonator', team: 'player',
        position: { x: 0, y: 3 }, health: 90, maxHealth: 90, movement: 2, attack: 16, defense: 6,
        traits: [{ name: 'Spellweaver', currentState: 'preparing', states: ['preparing', 'casting', 'recovering'], cooldown: 0 }],
    },
    {
        id: 'p-strider-1', name: 'Strider', unitType: 'strider', team: 'player',
        position: { x: 1, y: 0 }, health: 50, maxHealth: 50, movement: 5, attack: 10, defense: 3,
        traits: [{ name: 'Endure', currentState: 'idle', states: ['idle', 'scavenging', 'adapting', 'surviving'], cooldown: 0 }],
    },
    {
        id: 'p-prime-1', name: 'Prime', unitType: 'prime', team: 'player',
        position: { x: 1, y: 4 }, health: 200, maxHealth: 200, movement: 2, attack: 25, defense: 15,
        traits: [{ name: 'Command', currentState: 'idle', states: ['idle', 'assessing', 'directing', 'coordinating'], cooldown: 0 }],
    },
    // Enemy army
    {
        id: 'e-scrapper-1', name: 'Scrappers', unitType: 'scrapper', team: 'enemy',
        position: { x: 8, y: 1 }, health: 70, maxHealth: 70, movement: 3, attack: 10, defense: 5,
        traits: [{ name: 'Disrupt', currentState: 'idle', states: ['idle', 'infiltrating', 'overloading', 'breaking'], cooldown: 0 }],
    },
    {
        id: 'e-breaker-1', name: 'Breaker', unitType: 'breaker', team: 'enemy',
        position: { x: 8, y: 2 }, health: 100, maxHealth: 100, movement: 2, attack: 15, defense: 8,
        traits: [{ name: 'Berserker', currentState: 'idle', states: ['idle', 'defending', 'enraged', 'exhausted'], cooldown: 0 }],
    },
    {
        id: 'e-glitch-1', name: 'Glitch', unitType: 'glitch', team: 'enemy',
        position: { x: 8, y: 3 }, health: 80, maxHealth: 80, movement: 3, attack: 14, defense: 4,
        traits: [{ name: 'Disrupt', currentState: 'idle', states: ['idle', 'infiltrating', 'overloading', 'breaking'], cooldown: 0 }],
    },
    {
        id: 'e-archivist-1', name: 'Archivist', unitType: 'archivist', team: 'enemy',
        position: { x: 7, y: 0 }, health: 130, maxHealth: 130, movement: 2, attack: 12, defense: 10,
        traits: [{ name: 'Guardian', currentState: 'ready', states: ['ready', 'shielding'], cooldown: 0 }],
    },
    {
        id: 'e-conductor-1', name: 'Conductor', unitType: 'conductor', team: 'enemy',
        position: { x: 7, y: 4 }, health: 150, maxHealth: 150, movement: 2, attack: 18, defense: 12,
        traits: [{ name: 'Command', currentState: 'idle', states: ['idle', 'assessing', 'directing', 'coordinating'], cooldown: 0 }],
    },
];

export const LargeBattle: Story = {
    args: {
        initialUnits: largeUnits,
        boardWidth: 9,
        boardHeight: 5,
        scale: 0.4,
        animationSpeed: 2,
    },
};

/**
 * Small skirmish: 2v2
 */
export const Skirmish: Story = {
    args: {
        initialUnits: [
            {
                id: 'p1', name: 'Forger', unitType: 'forger', team: 'player',
                position: { x: 0, y: 1 }, health: 85, maxHealth: 85, movement: 2, attack: 14, defense: 7,
                traits: [{ name: 'Mend', currentState: 'idle', states: ['idle', 'scanning', 'diagnosing', 'healing'], cooldown: 0 }],
            },
            {
                id: 'p2', name: 'Strider', unitType: 'strider', team: 'player',
                position: { x: 0, y: 2 }, health: 50, maxHealth: 50, movement: 5, attack: 10, defense: 3,
                traits: [{ name: 'Endure', currentState: 'idle', states: ['idle', 'scavenging', 'adapting', 'surviving'], cooldown: 0 }],
            },
            {
                id: 'e1', name: 'Scrapper', unitType: 'scrapper', team: 'enemy',
                position: { x: 4, y: 1 }, health: 70, maxHealth: 70, movement: 3, attack: 10, defense: 5,
                traits: [{ name: 'Disrupt', currentState: 'idle', states: ['idle', 'infiltrating', 'overloading', 'breaking'], cooldown: 0 }],
            },
            {
                id: 'e2', name: 'Glitch', unitType: 'glitch', team: 'enemy',
                position: { x: 4, y: 2 }, health: 80, maxHealth: 80, movement: 3, attack: 14, defense: 4,
                traits: [{ name: 'Berserker', currentState: 'idle', states: ['idle', 'defending', 'enraged', 'exhausted'], cooldown: 0 }],
            },
        ],
        boardWidth: 5,
        boardHeight: 4,
        scale: 0.55,
        animationSpeed: 2,
    },
};

/**
 * Dungeon theme: stone floors, barrels, crates, pillars
 */
export const DungeonBattle: Story = {
    args: {
        initialUnits: basicUnits,
        boardWidth: 8,
        boardHeight: 6,
        mapTheme: 'dungeon',
        scale: 0.4,
        animationSpeed: 2,
    },
};

/**
 * Outdoor theme: dirt and grass terrain with mountain obstacles
 */
export const OutdoorBattle: Story = {
    args: {
        initialUnits: basicUnits,
        boardWidth: 8,
        boardHeight: 6,
        mapTheme: 'outdoor',
        scale: 0.4,
        animationSpeed: 2,
    },
};

/**
 * Castle theme: stone tile floors with columns and barrels
 */
export const CastleBattle: Story = {
    args: {
        initialUnits: basicUnits,
        boardWidth: 8,
        boardHeight: 6,
        mapTheme: 'castle',
        scale: 0.4,
        animationSpeed: 2,
    },
};

/**
 * All tier units showcase (robots only)
 */
export const AllTiers: Story = {
    args: {
        initialUnits: [
            // Tier 1
            { id: 'p-worker', name: 'Worker (T1)', unitType: 'worker', team: 'player', position: { x: 0, y: 0 }, health: 60, maxHealth: 60, movement: 3, attack: 8, defense: 4, traits: [{ name: 'Trust', currentState: 'idle', states: ['idle', 'believing', 'inspiring'], cooldown: 0 }] },
            { id: 'p-scrapper', name: 'Scrapper (T1)', unitType: 'scrapper', team: 'player', position: { x: 0, y: 1 }, health: 70, maxHealth: 70, movement: 3, attack: 10, defense: 5, traits: [{ name: 'Endure', currentState: 'idle', states: ['idle', 'scavenging', 'adapting', 'surviving'], cooldown: 0 }] },
            { id: 'p-mender', name: 'Mender (T1)', unitType: 'mender', team: 'player', position: { x: 0, y: 2 }, health: 45, maxHealth: 45, movement: 3, attack: 5, defense: 3, traits: [{ name: 'Mend', currentState: 'idle', states: ['idle', 'scanning', 'diagnosing', 'healing'], cooldown: 0 }] },
            // Tier 2
            { id: 'p-guardian', name: 'Guardian (T2)', unitType: 'guardian', team: 'player', position: { x: 0, y: 3 }, health: 120, maxHealth: 120, movement: 2, attack: 12, defense: 10, traits: [{ name: 'Defend', currentState: 'idle', states: ['idle', 'shielding', 'countering'], cooldown: 0 }] },
            { id: 'p-strider', name: 'Strider (T2)', unitType: 'strider', team: 'player', position: { x: 0, y: 4 }, health: 50, maxHealth: 50, movement: 5, attack: 10, defense: 3, traits: [{ name: 'Endure', currentState: 'idle', states: ['idle', 'scavenging', 'adapting', 'surviving'], cooldown: 0 }] },
            { id: 'p-breaker', name: 'Breaker (T2)', unitType: 'breaker', team: 'player', position: { x: 0, y: 5 }, health: 100, maxHealth: 100, movement: 2, attack: 15, defense: 8, traits: [{ name: 'Berserker', currentState: 'idle', states: ['idle', 'defending', 'enraged', 'exhausted'], cooldown: 0 }] },
            // Tier 3 + 4 as enemies
            { id: 'e-resonator', name: 'Resonator (T3)', unitType: 'resonator', team: 'enemy', position: { x: 8, y: 0 }, health: 90, maxHealth: 90, movement: 2, attack: 16, defense: 6, traits: [{ name: 'Spellweaver', currentState: 'preparing', states: ['preparing', 'casting', 'recovering'], cooldown: 0 }] },
            { id: 'e-forger', name: 'Forger (T3)', unitType: 'forger', team: 'enemy', position: { x: 8, y: 1 }, health: 85, maxHealth: 85, movement: 2, attack: 14, defense: 7, traits: [{ name: 'Mend', currentState: 'idle', states: ['idle', 'scanning', 'diagnosing', 'healing'], cooldown: 0 }] },
            { id: 'e-glitch', name: 'Glitch (T3)', unitType: 'glitch', team: 'enemy', position: { x: 8, y: 2 }, health: 80, maxHealth: 80, movement: 3, attack: 14, defense: 4, traits: [{ name: 'Disrupt', currentState: 'idle', states: ['idle', 'infiltrating', 'overloading', 'breaking'], cooldown: 0 }] },
            { id: 'e-archivist', name: 'Archivist (T4)', unitType: 'archivist', team: 'enemy', position: { x: 8, y: 3 }, health: 130, maxHealth: 130, movement: 2, attack: 12, defense: 10, traits: [{ name: 'Guardian', currentState: 'ready', states: ['ready', 'shielding'], cooldown: 0 }] },
            { id: 'e-conductor', name: 'Conductor (T4)', unitType: 'conductor', team: 'enemy', position: { x: 8, y: 4 }, health: 150, maxHealth: 150, movement: 2, attack: 18, defense: 12, traits: [{ name: 'Command', currentState: 'idle', states: ['idle', 'assessing', 'directing', 'coordinating'], cooldown: 0 }] },
            { id: 'e-prime', name: 'Prime (T4)', unitType: 'prime', team: 'enemy', position: { x: 8, y: 5 }, health: 200, maxHealth: 200, movement: 2, attack: 25, defense: 15, traits: [{ name: 'Command', currentState: 'idle', states: ['idle', 'assessing', 'directing', 'coordinating'], cooldown: 0 }] },
        ],
        boardWidth: 9,
        boardHeight: 6,
        scale: 0.4,
        animationSpeed: 2,
    },
};

/**
 * All units showcase: all 13 robots + 14 heroes + 4 villains + shadow-legion
 * Large 16×10 battlefield with every character type in the game.
 */
const defaultTrait = { name: 'Combat', currentState: 'idle', states: ['idle', 'active'], cooldown: 0 };

export const AllUnits: Story = {
    args: {
        initialUnits: [
            // === LEFT SIDE: Player heroes (14) + some robots ===
            // Heroes (row 0-6, col 0-1)
            { id: 'h-valence', name: 'Valence', heroId: 'valence', team: 'player', position: { x: 0, y: 0 }, health: 180, maxHealth: 180, movement: 5, attack: 20, defense: 12, traits: [defaultTrait] },
            { id: 'h-zahra', name: 'Zahra', heroId: 'zahra', team: 'player', position: { x: 0, y: 1 }, health: 140, maxHealth: 140, movement: 4, attack: 12, defense: 8, traits: [defaultTrait] },
            { id: 'h-hareth', name: 'Hareth', heroId: 'hareth', team: 'player', position: { x: 0, y: 2 }, health: 200, maxHealth: 200, movement: 6, attack: 22, defense: 14, traits: [defaultTrait] },
            { id: 'h-kael', name: 'Kael', heroId: 'kael', team: 'player', position: { x: 0, y: 3 }, health: 120, maxHealth: 120, movement: 7, attack: 16, defense: 6, traits: [defaultTrait] },
            { id: 'h-samira', name: 'Samira', heroId: 'samira', team: 'player', position: { x: 0, y: 4 }, health: 160, maxHealth: 160, movement: 5, attack: 18, defense: 10, traits: [defaultTrait] },
            { id: 'h-omar', name: 'Omar', heroId: 'omar', team: 'player', position: { x: 0, y: 5 }, health: 150, maxHealth: 150, movement: 4, attack: 14, defense: 12, traits: [defaultTrait] },
            { id: 'h-layla', name: 'Layla', heroId: 'layla', team: 'player', position: { x: 0, y: 6 }, health: 130, maxHealth: 130, movement: 5, attack: 15, defense: 9, traits: [defaultTrait] },
            { id: 'h-jara', name: 'Jara', heroId: 'jara', team: 'player', position: { x: 1, y: 0 }, health: 170, maxHealth: 170, movement: 5, attack: 19, defense: 11, traits: [defaultTrait] },
            { id: 'h-rumi', name: 'Rumi', heroId: 'rumi', team: 'player', position: { x: 1, y: 1 }, health: 140, maxHealth: 140, movement: 4, attack: 20, defense: 7, traits: [defaultTrait] },
            { id: 'h-zain', name: 'Zain', heroId: 'zain', team: 'player', position: { x: 1, y: 2 }, health: 155, maxHealth: 155, movement: 6, attack: 21, defense: 8, traits: [defaultTrait] },
            { id: 'h-tariq', name: 'Tariq', heroId: 'tariq', team: 'player', position: { x: 1, y: 3 }, health: 165, maxHealth: 165, movement: 5, attack: 17, defense: 10, traits: [defaultTrait] },
            { id: 'h-fatima', name: 'Fatima', heroId: 'fatima', team: 'player', position: { x: 1, y: 4 }, health: 135, maxHealth: 135, movement: 4, attack: 22, defense: 9, traits: [defaultTrait] },
            { id: 'h-dr-aris', name: 'Dr. Aris', heroId: 'dr-aris', team: 'player', position: { x: 1, y: 5 }, health: 145, maxHealth: 145, movement: 3, attack: 25, defense: 6, traits: [defaultTrait] },
            { id: 'h-amir', name: 'Amir', heroId: 'amir', team: 'player', position: { x: 1, y: 6 }, health: 190, maxHealth: 190, movement: 5, attack: 23, defense: 13, traits: [defaultTrait] },
            // Player robots (col 2-3)
            { id: 'r-worker', name: 'Worker', unitType: 'worker', team: 'player', position: { x: 2, y: 0 }, health: 60, maxHealth: 60, movement: 3, attack: 8, defense: 4, traits: [defaultTrait] },
            { id: 'r-scrapper', name: 'Scrapper', unitType: 'scrapper', team: 'player', position: { x: 2, y: 1 }, health: 70, maxHealth: 70, movement: 3, attack: 10, defense: 5, traits: [defaultTrait] },
            { id: 'r-mender', name: 'Mender', unitType: 'mender', team: 'player', position: { x: 2, y: 2 }, health: 45, maxHealth: 45, movement: 3, attack: 5, defense: 3, traits: [defaultTrait] },
            { id: 'r-guardian', name: 'Guardian', unitType: 'guardian', team: 'player', position: { x: 2, y: 3 }, health: 120, maxHealth: 120, movement: 2, attack: 12, defense: 10, traits: [defaultTrait] },
            { id: 'r-strider', name: 'Strider', unitType: 'strider', team: 'player', position: { x: 2, y: 4 }, health: 50, maxHealth: 50, movement: 5, attack: 10, defense: 3, traits: [defaultTrait] },
            { id: 'r-breaker', name: 'Breaker', unitType: 'breaker', team: 'player', position: { x: 2, y: 5 }, health: 100, maxHealth: 100, movement: 2, attack: 15, defense: 8, traits: [defaultTrait] },
            { id: 'r-resonator', name: 'Resonator', unitType: 'resonator', team: 'player', position: { x: 2, y: 6 }, health: 90, maxHealth: 90, movement: 2, attack: 16, defense: 6, traits: [defaultTrait] },
            // === RIGHT SIDE: Enemy villains (4) + remaining robots + shadow-legion ===
            // Villains (col 15)
            { id: 'v-emperor', name: 'Emperor', heroId: 'emperor', team: 'enemy', position: { x: 15, y: 0 }, health: 300, maxHealth: 300, movement: 4, attack: 30, defense: 20, traits: [defaultTrait] },
            { id: 'v-tyrant', name: 'Tyrant', heroId: 'tyrant', team: 'enemy', position: { x: 15, y: 1 }, health: 250, maxHealth: 250, movement: 6, attack: 28, defense: 16, traits: [defaultTrait] },
            { id: 'v-destroyer', name: 'Destroyer', heroId: 'destroyer', team: 'enemy', position: { x: 15, y: 2 }, health: 220, maxHealth: 220, movement: 7, attack: 32, defense: 10, traits: [defaultTrait] },
            { id: 'v-deceiver', name: 'Deceiver', heroId: 'deceiver', team: 'enemy', position: { x: 15, y: 3 }, health: 180, maxHealth: 180, movement: 5, attack: 24, defense: 12, traits: [defaultTrait] },
            // Enemy robots (col 13-14)
            { id: 'er-forger', name: 'Forger', unitType: 'forger', team: 'enemy', position: { x: 13, y: 0 }, health: 85, maxHealth: 85, movement: 2, attack: 14, defense: 7, traits: [defaultTrait] },
            { id: 'er-glitch', name: 'Glitch', unitType: 'glitch', team: 'enemy', position: { x: 13, y: 1 }, health: 80, maxHealth: 80, movement: 3, attack: 14, defense: 4, traits: [defaultTrait] },
            { id: 'er-archivist', name: 'Archivist', unitType: 'archivist', team: 'enemy', position: { x: 13, y: 2 }, health: 130, maxHealth: 130, movement: 2, attack: 12, defense: 10, traits: [defaultTrait] },
            { id: 'er-conductor', name: 'Conductor', unitType: 'conductor', team: 'enemy', position: { x: 13, y: 3 }, health: 150, maxHealth: 150, movement: 2, attack: 18, defense: 12, traits: [defaultTrait] },
            { id: 'er-coordinator', name: 'Coordinator', unitType: 'coordinator', team: 'enemy', position: { x: 13, y: 4 }, health: 140, maxHealth: 140, movement: 2, attack: 16, defense: 11, traits: [defaultTrait] },
            { id: 'er-shadow', name: 'Shadow Legion', unitType: 'shadow-legion' as any, team: 'enemy', position: { x: 13, y: 5 }, health: 200, maxHealth: 200, movement: 3, attack: 22, defense: 14, traits: [defaultTrait] },
        ],
        boardWidth: 16,
        boardHeight: 7,
        scale: 0.3,
        animationSpeed: 2,
    },
};
