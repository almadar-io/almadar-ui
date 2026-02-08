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
    argTypes: {
        animationSpeed: {
            control: { type: 'range', min: 0.25, max: 5, step: 0.25 },
            description: 'Animation speed multiplier (1 = baseline, 2 = double)',
        },
        unitScale: {
            control: { type: 'range', min: 0.5, max: 3, step: 0.1 },
            description: 'Unit/hero draw size multiplier (1 = default)',
        },
        allowMoveAllHeroes: {
            control: 'boolean',
            description: 'Allow selecting and moving ALL heroes (including enemies)',
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
        title: 'The Resonant Architect',
        stats: { health: 85, maxHealth: 100, attack: 14, defense: 12, speed: 8, leadership: 16 },
        experience: 450,
        experienceToNextLevel: 1000,
        equippedTraits: [
            { id: 't1', name: 'Fortify', category: 'combat', description: 'Boosts defense by 20%' },
            { id: 't2', name: 'Inspire', category: 'support', description: 'Nearby allies gain +2 attack' },
            null,
        ],
        maxTraitSlots: 4,
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
        stats: { health: 60, maxHealth: 70, attack: 6, defense: 8, speed: 10, leadership: 12 },
        experience: 200,
        experienceToNextLevel: 500,
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
        stats: { health: 120, maxHealth: 120, attack: 22, defense: 18, speed: 6, leadership: 20 },
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
        animationSpeed: 2,
        unitScale: 2.5,
    },
};

function InteractiveWorldMap({ animationSpeed = 2, unitScale = 1, allowMoveAllHeroes = false }: { animationSpeed?: number; unitScale?: number; allowMoveAllHeroes?: boolean }) {
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
            animationSpeed={animationSpeed}
            unitScale={unitScale}
            allowMoveAllHeroes={allowMoveAllHeroes}
        />
    );
}

export const Interactive: Story = {
    args: { animationSpeed: 2, unitScale: 2.5, allowMoveAllHeroes: false },
    render: (args) => <InteractiveWorldMap animationSpeed={args.animationSpeed} unitScale={args.unitScale} allowMoveAllHeroes={args.allowMoveAllHeroes} />,
};

/**
 * Larger map with more features
 */
function LargeMapDemo({ animationSpeed = 2, unitScale = 1, allowMoveAllHeroes = false }: { animationSpeed?: number; unitScale?: number; allowMoveAllHeroes?: boolean }) {
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
        // === PLAYER HEROES (14) ===
        {
            id: 'valence', name: 'Unit 734 (Valence)', archetype: 'Architect', owner: 'player',
            position: { x: 2, y: 2 }, movement: 5, maxMovement: 5, level: 5, spriteId: 'valence',
            army: [
                { id: 'u-1', unitType: 'worker', name: 'Workers', tier: 1, count: 20, spriteId: 'worker' },
                { id: 'u-2', unitType: 'guardian', name: 'Guardians', tier: 2, count: 5, spriteId: 'guardian' },
            ],
            title: 'The Resonant Architect',
            stats: { health: 85, maxHealth: 100, attack: 14, defense: 12, speed: 8, leadership: 16 },
            experience: 450, experienceToNextLevel: 1000,
            equippedTraits: [
                { id: 't1', name: 'Fortify', category: 'combat', description: 'Boosts defense by 20%' },
                { id: 't2', name: 'Inspire', category: 'support', description: 'Nearby allies gain +2 attack' },
                null,
            ],
            maxTraitSlots: 4,
        },
        {
            id: 'zahra', name: 'Zahra', archetype: 'Healer', owner: 'player',
            position: { x: 3, y: 5 }, movement: 4, maxMovement: 4, level: 3, spriteId: 'zahra',
            army: [{ id: 'u-3', unitType: 'mender', name: 'Menders', tier: 1, count: 15, spriteId: 'mender' }],
            stats: { health: 60, maxHealth: 70, attack: 6, defense: 8, speed: 10, leadership: 12 },
            experience: 200, experienceToNextLevel: 500,
            equippedTraits: [
                { id: 't3', name: 'Mend', category: 'support', description: 'Heals adjacent ally each turn' },
            ],
            maxTraitSlots: 3,
        },
        {
            id: 'hareth', name: 'Captain Hareth', archetype: 'Commander', owner: 'player',
            position: { x: 6, y: 18 }, movement: 6, maxMovement: 6, level: 7, spriteId: 'hareth',
            army: [
                { id: 'u-4', unitType: 'guardian', name: 'Guardians', tier: 2, count: 12, spriteId: 'guardian' },
                { id: 'u-5', unitType: 'strider', name: 'Striders', tier: 2, count: 8, spriteId: 'strider' },
            ],
            title: 'Shield of the South',
            stats: { health: 110, maxHealth: 120, attack: 18, defense: 20, speed: 6, leadership: 22 },
            experience: 800, experienceToNextLevel: 1200,
            equippedTraits: [
                { id: 't4', name: 'Rally', category: 'support', description: 'Army gains +3 morale' },
                { id: 't5', name: 'Shield Wall', category: 'combat', description: '+5 defense to adjacent allies' },
            ],
            maxTraitSlots: 4,
        },
        {
            id: 'kael', name: 'Kael', archetype: 'Scout', owner: 'player',
            position: { x: 8, y: 3 }, movement: 7, maxMovement: 7, level: 4, spriteId: 'kael',
            army: [{ id: 'u-6', unitType: 'strider', name: 'Striders', tier: 2, count: 10, spriteId: 'strider' }],
            stats: { health: 50, maxHealth: 60, attack: 10, defense: 6, speed: 14, leadership: 8 },
            experience: 300, experienceToNextLevel: 600,
        },
        {
            id: 'samira', name: 'Samira', archetype: 'Tactician', owner: 'player',
            position: { x: 4, y: 10 }, movement: 5, maxMovement: 5, level: 6, spriteId: 'samira',
            army: [{ id: 'u-7', unitType: 'resonator', name: 'Resonators', tier: 3, count: 6, spriteId: 'resonator' }],
            stats: { health: 70, maxHealth: 80, attack: 16, defense: 14, speed: 9, leadership: 18 },
            experience: 600, experienceToNextLevel: 900,
            equippedTraits: [
                { id: 't6', name: 'Outmaneuver', category: 'utility', description: '+2 movement in open terrain' },
            ],
            maxTraitSlots: 4,
        },
        {
            id: 'omar', name: 'Omar', archetype: 'Engineer', owner: 'player',
            position: { x: 1, y: 14 }, movement: 4, maxMovement: 4, level: 5, spriteId: 'omar',
            army: [{ id: 'u-8', unitType: 'forger', name: 'Forgers', tier: 3, count: 4, spriteId: 'forger' }],
            stats: { health: 65, maxHealth: 75, attack: 8, defense: 16, speed: 6, leadership: 14 },
            experience: 500, experienceToNextLevel: 800,
        },
        {
            id: 'layla', name: 'Layla', archetype: 'Diplomat', owner: 'player',
            position: { x: 7, y: 8 }, movement: 5, maxMovement: 5, level: 4, spriteId: 'layla',
            army: [{ id: 'u-9', unitType: 'worker', name: 'Workers', tier: 1, count: 25, spriteId: 'worker' }],
            stats: { health: 55, maxHealth: 65, attack: 7, defense: 10, speed: 8, leadership: 20 },
            experience: 350, experienceToNextLevel: 600,
        },
        {
            id: 'jara', name: 'Jara', archetype: 'Warden', owner: 'player',
            position: { x: 5, y: 21 }, movement: 5, maxMovement: 5, level: 5, spriteId: 'jara',
            army: [{ id: 'u-10', unitType: 'guardian', name: 'Guardians', tier: 2, count: 8, spriteId: 'guardian' }],
            stats: { health: 90, maxHealth: 95, attack: 12, defense: 18, speed: 7, leadership: 14 },
            experience: 480, experienceToNextLevel: 800,
        },
        {
            id: 'rumi', name: 'Rumi', archetype: 'Mystic', owner: 'player',
            position: { x: 12, y: 6 }, movement: 4, maxMovement: 4, level: 6, spriteId: 'rumi',
            army: [{ id: 'u-11', unitType: 'resonator', name: 'Resonators', tier: 3, count: 5, spriteId: 'resonator' }],
            stats: { health: 55, maxHealth: 60, attack: 20, defense: 8, speed: 7, leadership: 16 },
            experience: 700, experienceToNextLevel: 900,
            equippedTraits: [
                { id: 't7', name: 'Resonance Burst', category: 'combat', description: 'AoE damage to nearby enemies' },
                { id: 't8', name: 'Meditation', category: 'passive', description: 'Regen 5 HP per turn' },
            ],
            maxTraitSlots: 4,
        },
        {
            id: 'zain', name: 'Zain', archetype: 'Striker', owner: 'player',
            position: { x: 9, y: 15 }, movement: 6, maxMovement: 6, level: 5, spriteId: 'zain',
            army: [{ id: 'u-12', unitType: 'breaker', name: 'Breakers', tier: 2, count: 7, spriteId: 'breaker' }],
            stats: { health: 60, maxHealth: 70, attack: 22, defense: 8, speed: 12, leadership: 10 },
            experience: 520, experienceToNextLevel: 800,
        },
        {
            id: 'tariq', name: 'Tariq', archetype: 'Vanguard', owner: 'player',
            position: { x: 3, y: 16 }, movement: 5, maxMovement: 5, level: 4, spriteId: 'tariq',
            army: [{ id: 'u-13', unitType: 'scrapper', name: 'Scrappers', tier: 1, count: 30, spriteId: 'scrapper' }],
            stats: { health: 75, maxHealth: 80, attack: 15, defense: 12, speed: 9, leadership: 16 },
            experience: 280, experienceToNextLevel: 600,
        },
        {
            id: 'fatima', name: 'Fatima', archetype: 'Sage', owner: 'player',
            position: { x: 13, y: 20 }, movement: 4, maxMovement: 4, level: 7, spriteId: 'fatima',
            army: [{ id: 'u-14', unitType: 'archivist', name: 'Archivists', tier: 4, count: 3, spriteId: 'archivist' }],
            title: 'Keeper of the Archive',
            stats: { health: 45, maxHealth: 50, attack: 24, defense: 10, speed: 5, leadership: 20 },
            experience: 900, experienceToNextLevel: 1200,
            equippedTraits: [
                { id: 't9', name: 'Knowledge', category: 'passive', description: '+50% XP gain' },
                { id: 't10', name: 'Archive Recall', category: 'utility', description: 'Reveal enemy stats' },
                { id: 't11', name: 'Wisdom', category: 'support', description: '+3 leadership to all heroes' },
            ],
            maxTraitSlots: 5,
        },
        {
            id: 'dr-aris', name: 'Dr. Aris', archetype: 'Scientist', owner: 'player',
            position: { x: 14, y: 10 }, movement: 3, maxMovement: 3, level: 8, spriteId: 'dr-aris',
            army: [{ id: 'u-15', unitType: 'glitch', name: 'Glitches', tier: 3, count: 5, spriteId: 'glitch' }],
            title: 'The Anomaly',
            stats: { health: 40, maxHealth: 45, attack: 28, defense: 6, speed: 4, leadership: 12 },
            experience: 1100, experienceToNextLevel: 1500,
            equippedTraits: [
                { id: 't12', name: 'Experiment', category: 'combat', description: 'Random powerful effect on attack' },
                { id: 't13', name: 'Glitch Field', category: 'utility', description: 'Enemies have 20% miss chance' },
            ],
            maxTraitSlots: 5,
        },
        {
            id: 'amir', name: 'Amir', archetype: 'Champion', owner: 'player',
            position: { x: 8, y: 22 }, movement: 5, maxMovement: 5, level: 6, spriteId: 'amir',
            army: [
                { id: 'u-16', unitType: 'conductor', name: 'Conductors', tier: 4, count: 2, spriteId: 'conductor' },
                { id: 'u-17', unitType: 'guardian', name: 'Guardians', tier: 2, count: 6, spriteId: 'guardian' },
            ],
            stats: { health: 100, maxHealth: 110, attack: 20, defense: 16, speed: 10, leadership: 18 },
            experience: 650, experienceToNextLevel: 900,
            equippedTraits: [
                { id: 't14', name: 'Valor', category: 'combat', description: '+5 attack when HP > 50%' },
            ],
            maxTraitSlots: 4,
        },
        // === ENEMY VILLAINS (4) ===
        {
            id: 'tyrant', name: 'The Static General', archetype: 'Tyrant', owner: 'enemy',
            position: { x: 27, y: 21 }, movement: 6, maxMovement: 6, level: 8, spriteId: 'tyrant',
            army: [
                { id: 'u-e1', unitType: 'scrapper', name: 'Scrappers', tier: 1, count: 30, spriteId: 'scrapper' },
                { id: 'u-e2', unitType: 'breaker', name: 'Breakers', tier: 2, count: 10, spriteId: 'breaker' },
            ],
            stats: { health: 130, maxHealth: 130, attack: 22, defense: 20, speed: 6, leadership: 24 },
        },
        {
            id: 'destroyer', name: 'The Destroyer', archetype: 'Berserker', owner: 'enemy',
            position: { x: 24, y: 4 }, movement: 7, maxMovement: 7, level: 6, spriteId: 'destroyer',
            army: [{ id: 'u-e3', unitType: 'scrapper', name: 'Scrappers', tier: 1, count: 40, spriteId: 'scrapper' }],
            stats: { health: 150, maxHealth: 150, attack: 30, defense: 10, speed: 8, leadership: 14 },
        },
        {
            id: 'emperor', name: 'The Emperor', archetype: 'Overlord', owner: 'enemy',
            position: { x: 26, y: 12 }, movement: 4, maxMovement: 4, level: 10, spriteId: 'emperor',
            army: [
                { id: 'u-e4', unitType: 'conductor', name: 'Conductors', tier: 4, count: 5, spriteId: 'conductor' },
                { id: 'u-e5', unitType: 'archivist', name: 'Archivists', tier: 4, count: 4, spriteId: 'archivist' },
            ],
            stats: { health: 100, maxHealth: 100, attack: 18, defense: 22, speed: 5, leadership: 30 },
        },
        {
            id: 'deceiver', name: 'The Deceiver', archetype: 'Trickster', owner: 'enemy',
            position: { x: 22, y: 17 }, movement: 5, maxMovement: 5, level: 9, spriteId: 'deceiver',
            army: [
                { id: 'u-e6', unitType: 'glitch', name: 'Glitches', tier: 3, count: 8, spriteId: 'glitch' },
                { id: 'u-e7', unitType: 'strider', name: 'Striders', tier: 2, count: 6, spriteId: 'strider' },
            ],
            stats: { health: 70, maxHealth: 80, attack: 24, defense: 12, speed: 12, leadership: 16 },
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
            animationSpeed={animationSpeed}
            unitScale={unitScale}
            allowMoveAllHeroes={allowMoveAllHeroes}
        />
    );
}

export const LargeMap: Story = {
    args: { animationSpeed: 2, unitScale: 2.5, allowMoveAllHeroes: true },
    render: (args) => <LargeMapDemo animationSpeed={args.animationSpeed} unitScale={args.unitScale} allowMoveAllHeroes={args.allowMoveAllHeroes} />,
};
