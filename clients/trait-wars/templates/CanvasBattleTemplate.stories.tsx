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
    },
};

/**
 * All tier units showcase
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
    },
};
