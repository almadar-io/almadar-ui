/**
 * CanvasWorldMapTemplate Stories
 *
 * Canvas-based world map with isometric terrain, hero sprites, and features.
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CanvasWorldMapTemplate } from './CanvasWorldMapTemplate';
import { StrategicWorldMap, StrategicCastle, WorldMapHex, WorldMapHero, Resources } from '../types';
import { TraitWarsAssetProvider, DEFAULT_ASSET_MANIFEST } from '../assets';

const meta: Meta<typeof CanvasWorldMapTemplate> = {
    title: 'Trait Wars/Templates/CanvasWorldMapTemplate',
    component: CanvasWorldMapTemplate,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
        docs: {
            description: {
                component: 'Canvas-based isometric world map with asset-loaded sprites, hero movement, and strategic overlay panels.',
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
type Story = StoryObj<typeof CanvasWorldMapTemplate>;

// ============================================================================
// SAMPLE DATA
// ============================================================================

function generateHexGrid(width: number, height: number): WorldMapHex[] {
    const hexes: WorldMapHex[] = [];
    const terrains = ['grass', 'grass', 'grass', 'dirt', 'stone', 'grass'];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            hexes.push({
                x,
                y,
                terrain: terrains[Math.floor(Math.random() * terrains.length)] as any,
                movementCost: 1,
                passable: true,
            });
        }
    }

    // Water tiles (impassable)
    const waterHex1 = hexes.find(h => h.x === 3 && h.y === 2);
    if (waterHex1) { waterHex1.terrain = 'water'; waterHex1.passable = false; }
    const waterHex2 = hexes.find(h => h.x === 3 && h.y === 3);
    if (waterHex2) { waterHex2.terrain = 'water'; waterHex2.passable = false; }

    // Features
    const goldMine = hexes.find(h => h.x === 1 && h.y === 1);
    if (goldMine) { goldMine.feature = 'goldMine'; goldMine.featureData = { resourceType: 'gold', resourceAmount: 500 }; }

    const crystal = hexes.find(h => h.x === 4 && h.y === 1);
    if (crystal) { crystal.feature = 'resonanceCrystal'; crystal.featureData = { resourceType: 'resonance', resourceAmount: 50 }; }

    const treasure = hexes.find(h => h.x === 2 && h.y === 4);
    if (treasure) { treasure.feature = 'treasure'; treasure.featureData = { resourceType: 'gold', resourceAmount: 1000 }; }

    const playerCastle = hexes.find(h => h.x === 0 && h.y === 2);
    if (playerCastle) { playerCastle.feature = 'castle'; playerCastle.featureData = { castleId: 'resonator-citadel', owner: 'player' }; }

    const enemyCastle = hexes.find(h => h.x === 5 && h.y === 3);
    if (enemyCastle) { enemyCastle.feature = 'castle'; enemyCastle.featureData = { castleId: 'dominion-fortress', owner: 'enemy' }; }

    const portal = hexes.find(h => h.x === 3 && h.y === 0);
    if (portal) { portal.feature = 'portal'; }

    return hexes;
}

const sampleHeroes: WorldMapHero[] = [
    {
        id: 'valence',
        name: 'Unit 734 (Valence)',
        archetype: 'Architect',
        owner: 'player',
        position: { x: 1, y: 2 },
        movement: 5,
        maxMovement: 5,
        army: [
            { id: 'unit-1', unitType: 'worker', name: 'Workers', tier: 1, count: 20, spriteId: 'worker' },
            { id: 'unit-2', unitType: 'guardian', name: 'Guardians', tier: 2, count: 5, spriteId: 'guardian' },
        ],
        level: 5,
        spriteId: 'valence',
    },
    {
        id: 'zahra',
        name: 'Zahra',
        archetype: 'Healer',
        owner: 'player',
        position: { x: 0, y: 3 },
        movement: 4,
        maxMovement: 4,
        army: [
            { id: 'unit-3', unitType: 'mender', name: 'Menders', tier: 1, count: 15, spriteId: 'mender' },
        ],
        level: 3,
        spriteId: 'zahra',
    },
    {
        id: 'tyrant',
        name: 'The Static General',
        archetype: 'Tyrant',
        owner: 'enemy',
        position: { x: 5, y: 2 },
        movement: 6,
        maxMovement: 6,
        army: [
            { id: 'unit-4', unitType: 'scrapper', name: 'Scrappers', tier: 1, count: 30, spriteId: 'scrapper' },
            { id: 'unit-5', unitType: 'breaker', name: 'Breakers', tier: 2, count: 10, spriteId: 'breaker' },
        ],
        level: 8,
        spriteId: 'tyrant',
    },
];

const sampleCastles: StrategicCastle[] = [
    {
        id: 'resonator-citadel',
        name: 'Crystal Nexus',
        faction: 'resonator',
        owner: 'player',
        buildings: [],
        garrison: [],
        defense: 100,
        income: { gold: 500, resonance: 50, traitShards: 5 },
        buildingSlots: [],
    },
    {
        id: 'dominion-fortress',
        name: 'Iron Bastion',
        faction: 'dominion',
        owner: 'enemy',
        buildings: [],
        garrison: [],
        defense: 150,
        income: { gold: 700, resonance: 20, traitShards: 2 },
        buildingSlots: [],
    },
];

const sampleResources: Resources = {
    gold: 5000,
    resonance: 150,
    traitShards: 25,
};

const sampleWorldMap: StrategicWorldMap = {
    id: 'liberation-campaign',
    name: 'The Liberation - Act 1',
    width: 6,
    height: 5,
    hexes: generateHexGrid(6, 5),
    heroes: sampleHeroes,
    castles: sampleCastles,
    playerFaction: 'resonator',
    enemyFaction: 'dominion',
    turnNumber: 1,
    currentPlayer: 'player',
};

// ============================================================================
// STORIES
// ============================================================================

export const Default: Story = {
    args: {
        worldMap: sampleWorldMap,
        resources: sampleResources,
        selectedHeroId: 'valence',
        scale: 0.4,
    },
};

function InteractiveWorldMap() {
    const [worldMap, setWorldMap] = useState(sampleWorldMap);
    const [selectedHeroId, setSelectedHeroId] = useState<string | null>('valence');
    const [resources, setResources] = useState(sampleResources);

    const handleHeroMove = (heroId: string, toX: number, toY: number) => {
        setWorldMap((prev) => ({
            ...prev,
            heroes: prev.heroes.map((h) => {
                if (h.id === heroId) {
                    const distance = Math.max(Math.abs(h.position.x - toX), Math.abs(h.position.y - toY));
                    return {
                        ...h,
                        position: { x: toX, y: toY },
                        movement: Math.max(0, h.movement - distance),
                    };
                }
                return h;
            }),
        }));
    };

    const handleCollectResource = (x: number, y: number, type: string, amount: number) => {
        setResources((prev) => ({
            ...prev,
            [type]: (prev as any)[type] + amount,
        }));
        setWorldMap((prev) => ({
            ...prev,
            hexes: prev.hexes.map((h) =>
                h.x === x && h.y === y ? { ...h, feature: undefined, featureData: undefined } : h
            ),
        }));
    };

    const handleEndTurn = () => {
        setWorldMap((prev) => ({
            ...prev,
            turnNumber: prev.turnNumber + 1,
            heroes: prev.heroes.map((h) => ({ ...h, movement: h.maxMovement })),
        }));
    };

    return (
        <CanvasWorldMapTemplate
            worldMap={worldMap}
            resources={resources}
            selectedHeroId={selectedHeroId}
            onHeroSelect={setSelectedHeroId}
            onHeroMove={handleHeroMove}
            onEnterCastle={(id) => console.log('Enter castle:', id)}
            onCollectResource={handleCollectResource}
            onBattleEncounter={(a, d) => console.log('Battle:', a, 'vs', d)}
            onEndTurn={handleEndTurn}
            scale={0.4}
        />
    );
}

export const Interactive: Story = {
    render: () => <InteractiveWorldMap />,
};

/**
 * Larger map with more features
 */
function LargeMapDemo() {
    const largeHexes = (() => {
        const hexes: WorldMapHex[] = [];
        const terrains = ['grass', 'grass', 'dirt', 'stone', 'grass', 'grass', 'dirt'];

        for (let y = 0; y < 24; y++) {
            for (let x = 0; x < 30; x++) {
                hexes.push({
                    x, y,
                    terrain: terrains[Math.floor(Math.random() * terrains.length)] as any,
                    movementCost: 1,
                    passable: true,
                });
            }
        }

        // Helper to set hex props safely
        const setHex = (x: number, y: number, props: Partial<WorldMapHex>) => {
            const hex = hexes.find(h => h.x === x && h.y === y);
            if (hex) Object.assign(hex, props);
        };

        // === WATER RIVERS (3 rivers across the map) ===
        // River 1: vertical, x=10, y=4..14
        for (let y = 4; y <= 14; y++) setHex(10, y, { terrain: 'water', passable: false });
        // River 2: vertical, x=20, y=8..20
        for (let y = 8; y <= 20; y++) setHex(20, y, { terrain: 'water', passable: false });
        // River 3: horizontal, y=12, x=5..15
        for (let x = 5; x <= 15; x++) setHex(x, 12, { terrain: 'water', passable: false });

        // === STONE PATCHES (mountain ranges) ===
        for (let x = 13; x <= 16; x++) setHex(x, 3, { terrain: 'stone', movementCost: 3 });
        for (let x = 22; x <= 25; x++) setHex(x, 16, { terrain: 'stone', movementCost: 3 });
        for (let x = 3; x <= 5; x++) setHex(x, 18, { terrain: 'stone', movementCost: 3 });

        // === CASTLES (4 — spread across map) ===
        setHex(1, 1, { feature: 'castle', featureData: { castleId: 'player-hq', owner: 'player' } });
        setHex(28, 22, { feature: 'castle', featureData: { castleId: 'enemy-hq', owner: 'enemy' } });
        setHex(5, 20, { feature: 'castle', featureData: { castleId: 'player-outpost', owner: 'player' } });
        setHex(25, 3, { feature: 'castle', featureData: { castleId: 'enemy-outpost', owner: 'enemy' } });

        // === GOLD MINES (8) ===
        const goldMines = [[3, 3], [8, 7], [14, 5], [22, 9], [6, 15], [17, 18], [26, 14], [12, 21]];
        for (const [x, y] of goldMines) {
            setHex(x, y, { feature: 'goldMine', featureData: { resourceType: 'gold', resourceAmount: 500 } });
        }

        // === RESONANCE CRYSTALS (5) ===
        const crystals = [[7, 2], [18, 6], [24, 11], [11, 16], [2, 22]];
        for (const [x, y] of crystals) {
            setHex(x, y, { feature: 'resonanceCrystal', featureData: { resourceType: 'resonance', resourceAmount: 100 } });
        }

        // === TREASURES (4) ===
        const treasures = [[4, 9], [16, 10], [23, 19], [9, 22]];
        for (const [x, y] of treasures) {
            setHex(x, y, { feature: 'treasure', featureData: { resourceType: 'gold', resourceAmount: 2000 } });
        }

        // === SALVAGE YARDS (2) ===
        setHex(13, 14, { feature: 'salvageYard', featureData: { resourceType: 'traitShards', resourceAmount: 10 } });
        setHex(27, 7, { feature: 'salvageYard', featureData: { resourceType: 'traitShards', resourceAmount: 10 } });

        // === PORTALS (open + closed) ===
        setHex(0, 10, { feature: 'portal' });
        setHex(29, 13, { feature: 'portal' });
        setHex(15, 0, { feature: 'portalClosed' });
        setHex(15, 23, { feature: 'portalClosed' });

        // === POWER NODES (3) ===
        setHex(9, 4, { feature: 'powerNode' });
        setHex(21, 15, { feature: 'powerNode' });
        setHex(6, 19, { feature: 'powerNode' });

        // === DATA VAULTS (2) ===
        setHex(18, 2, { feature: 'dataVault' });
        setHex(12, 19, { feature: 'dataVault' });

        // === TRAIT CACHES (3) ===
        const caches = [[2, 7], [19, 20], [26, 5]];
        for (const [x, y] of caches) {
            setHex(x, y, { feature: 'traitCache', featureData: { resourceType: 'traitShards', resourceAmount: 15 } });
        }

        // === BATTLE MARKERS (3) ===
        setHex(11, 8, { feature: 'battleMarker' });
        setHex(22, 13, { feature: 'battleMarker' });
        setHex(8, 17, { feature: 'battleMarker' });

        return hexes;
    })();

    const largeHeroes: WorldMapHero[] = [
        {
            id: 'valence',
            name: 'Unit 734 (Valence)',
            archetype: 'Architect',
            owner: 'player',
            position: { x: 2, y: 2 },
            movement: 5,
            maxMovement: 5,
            army: [
                { id: 'unit-1', unitType: 'worker', name: 'Workers', tier: 1, count: 20, spriteId: 'worker' },
                { id: 'unit-2', unitType: 'guardian', name: 'Guardians', tier: 2, count: 5, spriteId: 'guardian' },
            ],
            level: 5,
            spriteId: 'valence',
        },
        {
            id: 'zahra',
            name: 'Zahra',
            archetype: 'Healer',
            owner: 'player',
            position: { x: 3, y: 5 },
            movement: 4,
            maxMovement: 4,
            army: [
                { id: 'unit-3', unitType: 'mender', name: 'Menders', tier: 1, count: 15, spriteId: 'mender' },
            ],
            level: 3,
            spriteId: 'zahra',
        },
        {
            id: 'hareth',
            name: 'Captain Hareth',
            archetype: 'Hero',
            owner: 'player',
            position: { x: 6, y: 18 },
            movement: 6,
            maxMovement: 6,
            army: [
                { id: 'unit-6', unitType: 'guardian', name: 'Guardians', tier: 2, count: 12, spriteId: 'guardian' },
                { id: 'unit-7', unitType: 'strider', name: 'Striders', tier: 2, count: 8, spriteId: 'strider' },
            ],
            level: 7,
            spriteId: 'hareth',
        },
        {
            id: 'tyrant',
            name: 'The Static General',
            archetype: 'Tyrant',
            owner: 'enemy',
            position: { x: 27, y: 21 },
            movement: 6,
            maxMovement: 6,
            army: [
                { id: 'unit-4', unitType: 'scrapper', name: 'Scrappers', tier: 1, count: 30, spriteId: 'scrapper' },
                { id: 'unit-5', unitType: 'breaker', name: 'Breakers', tier: 2, count: 10, spriteId: 'breaker' },
            ],
            level: 8,
            spriteId: 'tyrant',
        },
        {
            id: 'destroyer',
            name: 'The Destroyer',
            archetype: 'Berserker',
            owner: 'enemy',
            position: { x: 24, y: 4 },
            movement: 7,
            maxMovement: 7,
            army: [
                { id: 'unit-8', unitType: 'scrapper', name: 'Scrappers', tier: 1, count: 40, spriteId: 'scrapper' },
            ],
            level: 6,
            spriteId: 'destroyer',
        },
        {
            id: 'oracle',
            name: 'The Oracle',
            archetype: 'Seer',
            owner: 'enemy',
            position: { x: 21, y: 14 },
            movement: 4,
            maxMovement: 4,
            army: [
                { id: 'unit-9', unitType: 'mender', name: 'Menders', tier: 1, count: 10, spriteId: 'mender' },
                { id: 'unit-10', unitType: 'strider', name: 'Striders', tier: 2, count: 6, spriteId: 'strider' },
            ],
            level: 9,
            spriteId: 'oracle',
        },
    ];

    const largeCastles: StrategicCastle[] = [
        {
            id: 'player-hq',
            name: 'Crystal Nexus',
            faction: 'resonator',
            owner: 'player',
            buildings: [],
            garrison: [],
            defense: 100,
            income: { gold: 500, resonance: 50, traitShards: 5 },
            buildingSlots: [],
        },
        {
            id: 'enemy-hq',
            name: 'Iron Bastion',
            faction: 'dominion',
            owner: 'enemy',
            buildings: [],
            garrison: [],
            defense: 150,
            income: { gold: 700, resonance: 20, traitShards: 2 },
            buildingSlots: [],
        },
        {
            id: 'player-outpost',
            name: 'Southern Watch',
            faction: 'resonator',
            owner: 'player',
            buildings: [],
            garrison: [],
            defense: 60,
            income: { gold: 300, resonance: 30, traitShards: 3 },
            buildingSlots: [],
        },
        {
            id: 'enemy-outpost',
            name: 'Northern Reach',
            faction: 'dominion',
            owner: 'enemy',
            buildings: [],
            garrison: [],
            defense: 80,
            income: { gold: 400, resonance: 15, traitShards: 1 },
            buildingSlots: [],
        },
    ];

    const largeMap: StrategicWorldMap = {
        id: 'large-campaign',
        name: 'The Great Expanse',
        width: 30,
        height: 24,
        hexes: largeHexes,
        heroes: largeHeroes,
        castles: largeCastles,
        playerFaction: 'resonator',
        enemyFaction: 'dominion',
        turnNumber: 5,
        currentPlayer: 'player',
    };

    const [worldMap, setWorldMap] = useState(largeMap);
    const [selectedHeroId, setSelectedHeroId] = useState<string | null>('valence');
    const [resources, setResources] = useState({ gold: 12000, resonance: 500, traitShards: 60 });

    const handleHeroMove = (heroId: string, toX: number, toY: number) => {
        setWorldMap((prev) => ({
            ...prev,
            heroes: prev.heroes.map((h) => {
                if (h.id === heroId) {
                    const distance = Math.max(Math.abs(h.position.x - toX), Math.abs(h.position.y - toY));
                    return { ...h, position: { x: toX, y: toY }, movement: Math.max(0, h.movement - distance) };
                }
                return h;
            }),
        }));
    };

    const handleEndTurn = () => {
        setWorldMap((prev) => ({
            ...prev,
            turnNumber: prev.turnNumber + 1,
            heroes: prev.heroes.map((h) => ({ ...h, movement: h.maxMovement })),
        }));
    };

    return (
        <CanvasWorldMapTemplate
            worldMap={worldMap}
            resources={resources}
            selectedHeroId={selectedHeroId}
            onHeroSelect={setSelectedHeroId}
            onHeroMove={handleHeroMove}
            onEndTurn={handleEndTurn}
            scale={0.25}
        />
    );
}

export const LargeMap: Story = {
    render: () => <LargeMapDemo />,
};
