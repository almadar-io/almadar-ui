/**
 * CanvasBattleTemplate
 *
 * Tactical battle template using IsometricGameCanvas (canvas-based) with:
 * - Asset-loaded isometric terrain and robot unit sprites
 * - Phase-based turn system (observation → selection → movement → action → enemy_turn)
 * - TraitStateViewer hover tooltip showing unit stats and state machines
 * - CombatLog, DamagePopup, action buttons as DOM overlays
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Typography,
    Button,
    Badge,
    Card,
    cn,
} from '@almadar/ui';
import {
    IsometricGameCanvas,
    isoToScreen,
    TILE_WIDTH,
    TILE_HEIGHT,
    FLOOR_HEIGHT,
} from '../organisms/IsometricGameCanvas';
import type { IsometricTile, IsometricUnit, IsometricFeature } from '../organisms/IsometricGameCanvas';
import { CombatLog, CombatEvent, CombatEventType } from '../organisms/CombatLog';
import { TraitStateViewer, TraitStateMachineDefinition } from '../molecules/TraitStateViewer';
import { DamagePopup } from '../atoms/DamagePopup';
import {
    useAssetsOptional,
    DEFAULT_ASSET_MANIFEST,
    getTerrainSpriteUrl,
    getRobotUnitSpriteUrl,
    getHeroSpriteUrl,
    getGameUIEmblemUrl,
    getGameUIOverlayUrl,
    getGameUIPanelUrl,
    getGameUIButtonUrl,
    type TraitWarsAssetManifest,
    type GameUIEmblemType,
    type GameUIOverlayType,
    type TerrainType,
    type RobotUnitType,
} from '../assets';
import { useCanvasEffects } from '../organisms/useCanvasEffects';
import { useSpriteAnimations } from '../organisms/useSpriteAnimations';
import { getAllCharacterSheetUrls } from '../assets';
import type { CombatActionType } from '../types/effects';

// ============================================================================
// TYPES
// ============================================================================

export type BattlePhase = 'observation' | 'selection' | 'movement' | 'action' | 'enemy_turn' | 'game_over';

export interface BattleUnit {
    id: string;
    name: string;
    /** Robot unit type for sprite lookup (e.g., 'worker', 'guardian', 'prime') */
    unitType?: RobotUnitType;
    /** Hero/villain character ID for sprite sheet lookup (e.g., 'valence', 'tyrant') */
    heroId?: string;
    /** Direct sprite URL override */
    sprite?: string;
    team: 'player' | 'enemy';
    position: { x: number; y: number };
    health: number;
    maxHealth: number;
    movement: number;
    attack: number;
    defense: number;
    traits: {
        name: string;
        currentState: string;
        states: string[];
        cooldown: number;
    }[];
}

export interface BattleTile {
    x: number;
    y: number;
    terrain: string;
}

interface DamagePopupData {
    id: string;
    amount: number;
    screenX: number;
    screenY: number;
    type: 'physical' | 'magic' | 'heal' | 'critical';
}

// Map our internal log types to CombatEventType
const logTypeToCombatType: Record<string, CombatEventType> = {
    attack: 'attack',
    move: 'move',
    phase: 'special',
    defeat: 'death',
    heal: 'heal',
};

export interface CanvasBattleTemplateProps {
    /** Initial units for the battle */
    initialUnits: BattleUnit[];
    /** Map terrain tiles */
    mapTerrain?: BattleTile[];
    /** Board width in tiles */
    boardWidth?: number;
    /** Board height in tiles */
    boardHeight?: number;
    /** Map visual theme affecting floor and obstacle tiles */
    mapTheme?: 'dungeon' | 'outdoor' | 'castle';
    /** Canvas render scale */
    scale?: number;
    /** Animation speed multiplier. 1 = baseline, 2 = double speed. Default: 2 */
    animationSpeed?: number;
    /** Unit/hero draw size multiplier. Default: 1 */
    unitScale?: number;
    /** Game end callback */
    onGameEnd?: (result: 'victory' | 'defeat') => void;
    /** Additional CSS classes */
    className?: string;
}

// ============================================================================
// TRAIT TRANSITIONS
// ============================================================================

const TRAIT_TRANSITIONS: Record<string, { from: string; to: string; event: string }[]> = {
    'Berserker': [
        { from: 'idle', to: 'defending', event: 'DEFEND' },
        { from: 'idle', to: 'attacking', event: 'ATTACK' },
        { from: 'attacking', to: 'enraged', event: 'KILL' },
        { from: 'enraged', to: 'exhausted', event: 'END_TURN' },
        { from: 'exhausted', to: 'idle', event: 'RECOVER' },
        { from: 'defending', to: 'idle', event: 'END_TURN' },
    ],
    'Spellweaver': [
        { from: 'preparing', to: 'casting', event: 'CAST' },
        { from: 'casting', to: 'recovering', event: 'END_TURN' },
        { from: 'recovering', to: 'preparing', event: 'RECOVER' },
    ],
    'Guardian': [
        { from: 'ready', to: 'shielding', event: 'SHIELD' },
        { from: 'shielding', to: 'ready', event: 'END_TURN' },
    ],
    // Robot unit traits
    'Trust': [
        { from: 'idle', to: 'believing', event: 'HOPE' },
        { from: 'believing', to: 'inspiring', event: 'SHINE' },
        { from: 'inspiring', to: 'idle', event: 'RESET' },
    ],
    'Endure': [
        { from: 'idle', to: 'scavenging', event: 'FIND_SCRAP' },
        { from: 'scavenging', to: 'adapting', event: 'INTEGRATE' },
        { from: 'adapting', to: 'surviving', event: 'WITHSTAND' },
        { from: 'surviving', to: 'idle', event: 'REST' },
    ],
    'Mend': [
        { from: 'idle', to: 'scanning', event: 'START_SCAN' },
        { from: 'scanning', to: 'diagnosing', event: 'DIAGNOSE' },
        { from: 'diagnosing', to: 'healing', event: 'ACTIVATE_HEAL' },
        { from: 'healing', to: 'idle', event: 'COMPLETE' },
    ],
    'Defend': [
        { from: 'idle', to: 'shielding', event: 'SUMMON_SHIELD' },
        { from: 'shielding', to: 'countering', event: 'ABSORB_IMPACT' },
        { from: 'countering', to: 'idle', event: 'LOWER_SHIELD' },
    ],
    'Disrupt': [
        { from: 'idle', to: 'infiltrating', event: 'CONNECT' },
        { from: 'infiltrating', to: 'overloading', event: 'INJECT' },
        { from: 'overloading', to: 'breaking', event: 'SHATTER' },
        { from: 'breaking', to: 'idle', event: 'DISCONNECT' },
    ],
    'Command': [
        { from: 'idle', to: 'assessing', event: 'TACTICAL_VIEW' },
        { from: 'assessing', to: 'directing', event: 'ISSUE_ORDER' },
        { from: 'directing', to: 'coordinating', event: 'SYNC_SQUAD' },
        { from: 'coordinating', to: 'idle', event: 'STAND_DOWN' },
    ],
};

function triggerTraitEvent(unit: BattleUnit, event: string): BattleUnit {
    const trait = unit.traits[0];
    if (!trait) return unit;

    const transitions = TRAIT_TRANSITIONS[trait.name] || [];
    const transition = transitions.find(t => t.from === trait.currentState && t.event === event);

    if (transition) {
        return {
            ...unit,
            traits: [{
                ...trait,
                currentState: transition.to,
            }, ...unit.traits.slice(1)],
        };
    }
    return unit;
}

// ============================================================================
// MAP GENERATION
// ============================================================================

/** Obstacle feature placed on the battle map */
interface BattleObstacle {
    x: number;
    y: number;
    type: string;
    spriteUrl: string;
}

/** Theme-specific floor and obstacle tile configurations */
const BATTLE_THEME_CONFIG = {
    dungeon: {
        floorTiles: ['stoneInset_E', 'stone_E', 'planks_E', 'dirtTiles_E'],
        obstacleTypes: ['barrel_E', 'woodenCrate_E', 'stoneColumn_E'],
        edgeTerrain: 'mountain',
    },
    outdoor: {
        floorTiles: ['dirt_E', 'dirtTiles_E', 'planks_E'],
        obstacleTypes: ['mountain'],
        edgeTerrain: 'mountain',
    },
    castle: {
        floorTiles: ['stoneTile_E', 'stoneInset_E'],
        obstacleTypes: ['stoneColumn_E', 'barrel_E'],
        edgeTerrain: 'mountain',
    },
} as const;

function generateBattleMap(
    width: number,
    height: number,
    theme: 'dungeon' | 'outdoor' | 'castle' = 'dungeon'
): { tiles: BattleTile[]; obstacles: BattleObstacle[] } {
    const tiles: BattleTile[] = [];
    const obstacles: BattleObstacle[] = [];
    const config = BATTLE_THEME_CONFIG[theme];
    const { floorTiles, obstacleTypes, edgeTerrain } = config;

    // Collect interior positions for potential obstacle placement
    const interiorPositions: Array<{ x: number; y: number }> = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Edge tiles use edge terrain (impassable mountain walls)
            if ((x === 0 || x === width - 1) && Math.random() > 0.5) {
                tiles.push({ x, y, terrain: edgeTerrain });
            } else {
                // Pick a random floor tile from the theme
                const floorTile = floorTiles[Math.floor(Math.random() * floorTiles.length)];
                tiles.push({ x, y, terrain: floorTile });

                // Track interior (non-edge) positions for obstacle placement
                if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
                    interiorPositions.push({ x, y });
                }
            }
        }
    }

    // Place 3-5 obstacle features on random interior tiles
    const obstacleCount = 3 + Math.floor(Math.random() * 3); // 3 to 5
    const shuffled = interiorPositions.sort(() => Math.random() - 0.5);
    const obstaclePositions = shuffled.slice(0, Math.min(obstacleCount, shuffled.length));

    for (const pos of obstaclePositions) {
        const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

        // For outdoor theme, obstacles are terrain-based (mountain), mark tile impassable
        if (theme === 'outdoor') {
            const tileIdx = tiles.findIndex(t => t.x === pos.x && t.y === pos.y);
            if (tileIdx >= 0) {
                tiles[tileIdx] = { x: pos.x, y: pos.y, terrain: 'mountain' };
            }
        } else {
            // For dungeon/castle themes, create feature obstacles with Kenney sprite URLs
            const spriteUrl = `isometric-dungeon/Isometric/${obstacleType}.png`;
            obstacles.push({
                x: pos.x,
                y: pos.y,
                type: obstacleType.replace('_E', ''),
                spriteUrl,
            });
        }
    }

    return { tiles, obstacles };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CanvasBattleTemplate({
    initialUnits,
    mapTerrain,
    boardWidth = 8,
    boardHeight = 6,
    mapTheme = 'dungeon',
    scale = 0.45,
    animationSpeed = 2,
    unitScale = 1,
    onGameEnd,
    className,
}: CanvasBattleTemplateProps): JSX.Element {
    const assets = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;

    // Game state
    const [units, setUnits] = useState<BattleUnit[]>(initialUnits);
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
    const [currentPhase, setCurrentPhase] = useState<BattlePhase>('observation');
    const [currentTurn, setCurrentTurn] = useState(1);
    const [combatLog, setCombatLog] = useState<CombatEvent[]>([]);
    const [combatLogExpanded, setCombatLogExpanded] = useState(false);
    const [damagePopups, setDamagePopups] = useState<DamagePopupData[]>([]);
    const [gameResult, setGameResult] = useState<'victory' | 'defeat' | null>(null);

    // Tooltip follows cursor with hover delay
    const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Feature 4: Combat damage animation - screen shake + red flash
    const [isShaking, setIsShaking] = useState(false);
    const [showDamageFlash, setShowDamageFlash] = useState(false);

    // Generate map if not provided (with theme support)
    const generatedMap = useMemo(
        () => mapTerrain
            ? { tiles: mapTerrain, obstacles: [] as BattleObstacle[] }
            : generateBattleMap(boardWidth, boardHeight, mapTheme),
        [mapTerrain, boardWidth, boardHeight, mapTheme]
    );
    const battleTiles = generatedMap.tiles;
    const battleObstacles = generatedMap.obstacles;

    // Convert to IsometricTile[] with terrain sprites
    // Theme tiles use Kenney tile names directly, so try direct path first, then fallback to terrain type
    const isoTiles: IsometricTile[] = useMemo(() => {
        return battleTiles.map((tile) => {
            // If terrain name looks like a Kenney tile name (contains '_E'), resolve directly
            const isKenneyTile = tile.terrain.endsWith('_E');
            const terrainSprite = isKenneyTile
                ? `${assets.baseUrl}/isometric-dungeon/Isometric/${tile.terrain}.png`
                : getTerrainSpriteUrl(assets, tile.terrain as TerrainType);
            return {
                x: tile.x,
                y: tile.y,
                terrain: tile.terrain,
                terrainSprite,
            };
        });
    }, [battleTiles, assets]);

    // Convert obstacle features to IsometricFeature[] for canvas rendering
    const obstacleFeatures: IsometricFeature[] = useMemo(() => {
        return battleObstacles.map((obs) => ({
            x: obs.x,
            y: obs.y,
            type: obs.type,
            sprite: `${assets.baseUrl}/${obs.spriteUrl}`,
        }));
    }, [battleObstacles, assets]);

    // Convert BattleUnit[] to IsometricUnit[]
    const isoUnits: IsometricUnit[] = useMemo(() => {
        return units.filter(u => u.health > 0).map((unit) => ({
            id: unit.id,
            position: unit.position,
            name: unit.name,
            team: unit.team,
            health: unit.health,
            maxHealth: unit.maxHealth,
            unitType: unit.unitType,
            heroId: unit.heroId,
            sprite: unit.sprite || (unit.heroId ? getHeroSpriteUrl(assets, unit.heroId) : undefined) || (unit.unitType ? getRobotUnitSpriteUrl(assets, unit.unitType) : undefined),
            traits: unit.traits.map(t => ({
                name: t.name,
                currentState: t.currentState,
                states: t.states,
            })),
        }));
    }, [units, assets]);

    // Derived state
    const selectedUnit = useMemo(
        () => units.find(u => u.id === selectedUnitId) || null,
        [units, selectedUnitId]
    );

    const hoveredUnit = useMemo(() => {
        if (!hoveredTile) return null;
        return units.find(
            u => u.position.x === hoveredTile.x && u.position.y === hoveredTile.y && u.health > 0
        ) || null;
    }, [hoveredTile, units]);

    // Show tooltip after a short delay to avoid flickering between units
    useEffect(() => {
        if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
        if (hoveredUnit) {
            tooltipTimerRef.current = setTimeout(() => setTooltipVisible(true), 400);
        } else {
            setTooltipVisible(false);
        }
        return () => { if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current); };
    }, [hoveredUnit?.id]);

    const playerUnits = useMemo(() => units.filter(u => u.team === 'player' && u.health > 0), [units]);
    const enemyUnits = useMemo(() => units.filter(u => u.team === 'enemy' && u.health > 0), [units]);

    // Calculate valid moves
    const validMoves = useMemo(() => {
        if (!selectedUnit || currentPhase !== 'movement') return [];

        const moves: Array<{ x: number; y: number }> = [];
        const range = selectedUnit.movement;

        for (let dy = -range; dy <= range; dy++) {
            for (let dx = -range; dx <= range; dx++) {
                const nx = selectedUnit.position.x + dx;
                const ny = selectedUnit.position.y + dy;
                const distance = Math.abs(dx) + Math.abs(dy);

                if (distance > 0 && distance <= range &&
                    nx >= 0 && nx < boardWidth && ny >= 0 && ny < boardHeight) {
                    if (!units.some(u => u.position.x === nx && u.position.y === ny && u.health > 0)) {
                        moves.push({ x: nx, y: ny });
                    }
                }
            }
        }
        return moves;
    }, [selectedUnit, currentPhase, units, boardWidth, boardHeight]);

    // Calculate attack targets
    const attackTargets = useMemo(() => {
        if (!selectedUnit || currentPhase !== 'action') return [];

        return units
            .filter(u => u.team !== selectedUnit.team && u.health > 0)
            .filter(u => {
                const dx = Math.abs(u.position.x - selectedUnit.position.x);
                const dy = Math.abs(u.position.y - selectedUnit.position.y);
                return dx <= 1 && dy <= 1 && (dx + dy) > 0;
            })
            .map(u => u.position);
    }, [selectedUnit, currentPhase, units]);

    // Add combat log entry
    const addLog = useCallback((type: 'attack' | 'move' | 'phase' | 'defeat' | 'heal', message: string, value?: number) => {
        const combatType = logTypeToCombatType[type] || 'special';
        setCombatLog(prev => [...prev, {
            id: `log-${Date.now()}`,
            turn: currentTurn,
            type: combatType,
            message,
            timestamp: Date.now(),
            value,
        }].slice(-50));
    }, [currentTurn]);

    // Show damage popup at screen coordinates
    const maxY = Math.max(...battleTiles.map(t => t.y), 0);
    const baseOffsetX = (maxY + 1) * (TILE_WIDTH * scale / 2);

    // Canvas effects (particles, sequences, overlays)
    const {
        effectSpriteUrls,
        spawnCombatEffect,
        drawEffects,
        hasActiveEffects: effectsActive,
        screenShake: canvasScreenShake,
        screenFlash: canvasScreenFlash,
    } = useCanvasEffects({ manifest: assets, scale, baseOffsetX });

    // Sprite sheet animations
    const {
        syncUnits: syncSpriteAnimations,
        setUnitAnimation,
        resolveUnitFrame,
    } = useSpriteAnimations(assets, { speed: animationSpeed });

    // Preload sprite sheet images
    const spriteSheetUrls = useMemo(() => getAllCharacterSheetUrls(assets), [assets]);

    // ========================================================================
    // MOVEMENT ANIMATION — smooth tile-by-tile walk instead of teleporting
    // ========================================================================

    interface MovementAnim {
        unitId: string;
        from: { x: number; y: number };
        to: { x: number; y: number };
        elapsed: number;
        duration: number;
        onComplete: () => void;
    }

    const MOVE_SPEED_MS_PER_TILE = 300;
    const movementAnimRef = useRef<MovementAnim | null>(null);
    const [movingPositions, setMovingPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

    const startMoveAnimation = useCallback((
        unitId: string,
        from: { x: number; y: number },
        to: { x: number; y: number },
        onComplete: () => void,
    ) => {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const duration = dist * MOVE_SPEED_MS_PER_TILE;
        movementAnimRef.current = { unitId, from, to, elapsed: 0, duration, onComplete };
    }, []);

    // Visual isoUnits with interpolated positions for moving units
    const visualIsoUnits: IsometricUnit[] = useMemo(() => {
        if (movingPositions.size === 0) return isoUnits;
        return isoUnits.map((unit) => {
            const pos = movingPositions.get(unit.id);
            return pos ? { ...unit, position: pos } : unit;
        });
    }, [isoUnits, movingPositions]);

    const visualUnitsRef = useRef(visualIsoUnits);
    visualUnitsRef.current = visualIsoUnits;

    // Tick movement + sprite animations (~60fps)
    useEffect(() => {
        const interval = setInterval(() => {
            const anim = movementAnimRef.current;
            if (anim) {
                anim.elapsed += 16;
                const t = Math.min(anim.elapsed / anim.duration, 1);
                const eased = 1 - (1 - t) * (1 - t);
                const cx = anim.from.x + (anim.to.x - anim.from.x) * eased;
                const cy = anim.from.y + (anim.to.y - anim.from.y) * eased;

                if (t >= 1) {
                    movementAnimRef.current = null;
                    setMovingPositions((prev) => {
                        const next = new Map(prev);
                        next.delete(anim.unitId);
                        return next;
                    });
                    anim.onComplete();
                } else {
                    setMovingPositions((prev) => {
                        const next = new Map(prev);
                        next.set(anim.unitId, { x: cx, y: cy });
                        return next;
                    });
                }
            }

            syncSpriteAnimations(visualUnitsRef.current, 16);
        }, 16);
        return () => clearInterval(interval);
    }, [syncSpriteAnimations]);

    const showDamage = useCallback((tileX: number, tileY: number, amount: number, type: DamagePopupData['type']) => {
        const pos = isoToScreen(tileX, tileY, scale, baseOffsetX);
        const screenX = pos.x + TILE_WIDTH * scale / 2;
        const screenY = pos.y + FLOOR_HEIGHT * scale / 2;

        const id = `dmg-${Date.now()}-${Math.random()}`;
        setDamagePopups(prev => [...prev, { id, screenX, screenY, amount, type }]);
        setTimeout(() => {
            setDamagePopups(prev => prev.filter(p => p.id !== id));
        }, 1500);
    }, [scale, baseOffsetX]);

    // Trigger combat screen shake + red flash + canvas effects (must be before handleUnitClick)
    const triggerCombatEffect = useCallback((tileX: number, tileY: number, effectType: CombatActionType = 'hit') => {
        setIsShaking(true);
        setShowDamageFlash(true);
        setTimeout(() => setIsShaking(false), 300);
        setTimeout(() => setShowDamageFlash(false), 200);
        spawnCombatEffect(effectType, tileX, tileY);
    }, [spawnCombatEffect]);

    // Check game end
    const checkGameEnd = useCallback(() => {
        const playerAlive = units.filter(u => u.team === 'player' && u.health > 0);
        const enemyAlive = units.filter(u => u.team === 'enemy' && u.health > 0);

        if (playerAlive.length === 0) {
            setGameResult('defeat');
            setCurrentPhase('game_over');
            onGameEnd?.('defeat');
            addLog('defeat', 'All units defeated. Game Over!');
        } else if (enemyAlive.length === 0) {
            setGameResult('victory');
            setCurrentPhase('game_over');
            onGameEnd?.('victory');
            addLog('phase', 'Victory! All enemies defeated!');
        }
    }, [units, onGameEnd, addLog]);

    // Handle unit click
    const handleUnitClick = useCallback((unitId: string) => {
        const unit = units.find(u => u.id === unitId);
        if (!unit) return;

        if (currentPhase === 'observation' || currentPhase === 'selection') {
            if (unit.team === 'player') {
                setSelectedUnitId(unitId);
                setCurrentPhase('movement');
                addLog('phase', `Selected ${unit.name}`);
            }
        } else if (currentPhase === 'action' && selectedUnit) {
            if (unit.team === 'enemy' && attackTargets.some(t => t.x === unit.position.x && t.y === unit.position.y)) {
                const damage = Math.max(1, selectedUnit.attack - unit.defense);
                const newHealth = Math.max(0, unit.health - damage);

                setUnits(prev => prev.map(u =>
                    u.id === unit.id ? { ...u, health: newHealth } : u
                ));

                showDamage(unit.position.x, unit.position.y, damage, 'physical');
                triggerCombatEffect(unit.position.x, unit.position.y, 'melee');
                setUnitAnimation(selectedUnit.id, 'attack');
                setUnitAnimation(unit.id, 'hit');
                addLog('attack', `${selectedUnit.name} attacks ${unit.name} for ${damage} damage!`, damage);

                if (newHealth === 0) {
                    addLog('defeat', `${unit.name} has been defeated!`);
                    setUnitAnimation(unit.id, 'death');
                    spawnCombatEffect('death', unit.position.x, unit.position.y);
                    const updatedAttacker = triggerTraitEvent(selectedUnit, 'KILL');
                    setUnits(prev => prev.map(u => u.id === updatedAttacker.id ? updatedAttacker : u));
                }

                const endTurnUnit = triggerTraitEvent(selectedUnit, 'END_TURN');
                setUnits(prev => prev.map(u => u.id === endTurnUnit.id ? endTurnUnit : u));
                setSelectedUnitId(null);
                setCurrentPhase('observation');
                setCurrentTurn(t => t + 1);

                setTimeout(checkGameEnd, 100);
            }
        }
    }, [currentPhase, selectedUnit, attackTargets, units, addLog, showDamage, checkGameEnd, triggerCombatEffect, spawnCombatEffect]);

    // Handle tile click — starts animated walk, then transitions to action phase
    const handleTileClick = useCallback((x: number, y: number) => {
        if (currentPhase === 'movement' && selectedUnit) {
            // Block clicks while a movement animation is playing
            if (movementAnimRef.current) return;

            if (validMoves.some(m => m.x === x && m.y === y)) {
                const from = { ...selectedUnit.position };
                const to = { x, y };

                startMoveAnimation(selectedUnit.id, from, to, () => {
                    setUnits(prev => prev.map(u =>
                        u.id === selectedUnitId ? { ...u, position: { x, y } } : u
                    ));
                    addLog('move', `${selectedUnit.name} moves to (${x}, ${y})`);
                    setCurrentPhase('action');
                });
            }
        }
    }, [currentPhase, selectedUnit, selectedUnitId, validMoves, addLog, startMoveAnimation]);

    // End turn
    const handleEndTurn = useCallback(() => {
        if (selectedUnit) {
            const updatedUnit = triggerTraitEvent(selectedUnit, 'END_TURN');
            setUnits(prev => prev.map(u => u.id === updatedUnit.id ? updatedUnit : u));
        }
        setSelectedUnitId(null);
        setCurrentPhase('observation');
        setCurrentTurn(t => t + 1);
        addLog('phase', 'Turn ended');
    }, [selectedUnit, addLog]);

    // Cancel selection
    const handleCancel = useCallback(() => {
        setSelectedUnitId(null);
        setCurrentPhase('observation');
    }, []);

    // Feature 1: Mouse move handler for cursor-following tooltip
    const handleMouseMoveForTooltip = useCallback((e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }, []);

    // Phase display text
    const phaseText: Record<BattlePhase, string> = {
        observation: 'Observation Phase - Select a unit',
        selection: 'Selection Phase - Choose your unit',
        movement: 'Movement Phase - Click a green tile to move',
        action: 'Action Phase - Attack an adjacent enemy or end turn',
        enemy_turn: 'Enemy Turn',
        game_over: gameResult === 'victory' ? 'Victory!' : 'Defeat',
    };


    // Feature 4: Shake animation style (CSS shake + canvas particle shake)
    const shakeStyle: React.CSSProperties = isShaking ? {
        animation: 'battle-shake 0.3s ease-in-out',
    } : (canvasScreenShake.x !== 0 || canvasScreenShake.y !== 0) ? {
        transform: `translate(${canvasScreenShake.x}px, ${canvasScreenShake.y}px)`,
    } : {};

    return (
        <VStack gap="md" className={cn('p-4 bg-background rounded-xl min-h-[600px] relative', className)}>
            {/* Shake animation keyframes */}
            <style>{`
                @keyframes battle-shake {
                    0%, 100% { transform: translate(0, 0); }
                    10% { transform: translate(-3px, -2px); }
                    20% { transform: translate(3px, 1px); }
                    30% { transform: translate(-2px, 3px); }
                    40% { transform: translate(2px, -1px); }
                    50% { transform: translate(-3px, 2px); }
                    60% { transform: translate(3px, -2px); }
                    70% { transform: translate(-1px, 3px); }
                    80% { transform: translate(2px, -3px); }
                    90% { transform: translate(-2px, 1px); }
                }
            `}</style>

            {/* Header */}
            <HStack justify="between" align="center" className="w-full px-2">
                <VStack gap="xs">
                    <Typography variant="h5" className="text-primary font-bold">
                        Trait Wars: Isometric Battle
                    </Typography>
                    <Typography variant="body2" className="text-muted-foreground">
                        Turn {currentTurn} - {phaseText[currentPhase]}
                    </Typography>
                </VStack>

                <HStack gap="lg">
                    <VStack gap="none" align="center">
                        <HStack gap="xs" align="center">
                            {getGameUIEmblemUrl(assets, 'resonator')
                                ? <img src={getGameUIEmblemUrl(assets, 'resonator')} alt="Resonator" className="w-5 h-5 object-contain" />
                                : null}
                            <Typography variant="caption" className="text-[var(--tw-faction-resonator)]">Player</Typography>
                        </HStack>
                        <Typography variant="h6" className="text-foreground">{playerUnits.length}</Typography>
                    </VStack>
                    <VStack gap="none" align="center">
                        <HStack gap="xs" align="center">
                            {getGameUIEmblemUrl(assets, 'dominion')
                                ? <img src={getGameUIEmblemUrl(assets, 'dominion')} alt="Dominion" className="w-5 h-5 object-contain" />
                                : null}
                            <Typography variant="caption" className="text-[var(--tw-faction-dominion)]">Enemy</Typography>
                        </HStack>
                        <Typography variant="h6" className="text-foreground">{enemyUnits.length}</Typography>
                    </VStack>
                </HStack>
            </HStack>

            {/* Action Buttons (floating) */}
            {currentPhase !== 'game_over' && (
                <Box className="fixed bottom-6 right-6 z-50">
                    <HStack gap="sm">
                        {(currentPhase === 'movement' || currentPhase === 'action') && (
                            <Button
                                variant="secondary"
                                onClick={handleCancel}
                                size="lg"
                                className="shadow-xl text-foreground"
                                style={getGameUIButtonUrl(assets, 'secondary') ? {
                                    backgroundImage: `url(${getGameUIButtonUrl(assets, 'secondary')})`,
                                    backgroundSize: '100% 100%',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                } : undefined}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            onClick={handleEndTurn}
                            size="lg"
                            className="shadow-xl text-primary-foreground"
                            style={getGameUIButtonUrl(assets, 'primary') ? {
                                backgroundImage: `url(${getGameUIButtonUrl(assets, 'primary')})`,
                                backgroundSize: '100% 100%',
                                backgroundColor: 'transparent',
                                border: 'none',
                            } : undefined}
                        >
                            End Turn
                        </Button>
                    </HStack>
                </Box>
            )}

            {/* Combat Log (floating bottom-left) */}
            {currentPhase !== 'game_over' && (
                <Box className="fixed bottom-6 left-6 z-40">
                    {combatLogExpanded ? (
                        <Box className="relative">
                            <Box
                                className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center cursor-pointer hover:bg-muted text-muted-foreground text-xs"
                                onClick={() => setCombatLogExpanded(false)}
                            >
                                x
                            </Box>
                            <CombatLog
                                events={combatLog}
                                maxVisible={30}
                                autoScroll
                                className="w-[340px] max-h-[300px]"
                            />
                        </Box>
                    ) : (
                        <Box
                            className="px-4 py-2 rounded-full bg-card/90 border border-border cursor-pointer hover:bg-muted/90 shadow-lg backdrop-blur-sm transition-colors"
                            style={getGameUIPanelUrl(assets, 'tooltipFrame') ? {
                                borderImage: `url(${getGameUIPanelUrl(assets, 'tooltipFrame')}) 60 fill / 12px / 0 stretch`,
                                border: 'none',
                            } : undefined}
                            onClick={() => setCombatLogExpanded(true)}
                        >
                            <Typography variant="caption" className="text-foreground font-medium">
                                Combat Log ({combatLog.length})
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}

            {/* Main Content: Canvas + Tooltip */}
            <HStack gap="lg" align="start" flex className="w-full">
                <Box
                    className="relative flex-1"
                    style={shakeStyle}
                    onMouseMove={handleMouseMoveForTooltip}
                >
                    <VStack
                        gap="sm"
                        flex
                        className="relative"
                    >
                        {/* Feature 4: Red damage flash overlay */}
                        {showDamageFlash && (
                            <Box className="absolute inset-0 bg-error/20 z-20 pointer-events-none rounded-lg animate-out fade-out duration-200" />
                        )}
                        {/* Canvas effect screen flash overlay */}
                        {canvasScreenFlash && (
                            <Box
                                className="absolute inset-0 z-20 pointer-events-none rounded-lg"
                                style={{ backgroundColor: canvasScreenFlash.color, opacity: canvasScreenFlash.alpha }}
                            />
                        )}

                        {/* Action Hint Banners */}
                        {currentPhase === 'action' && attackTargets.length > 0 && (
                            <HStack justify="center" className="absolute -top-1 left-0 right-0 z-30 pointer-events-none">
                                <HStack gap="sm" align="center" className="bg-error/90 text-foreground px-4 py-2 rounded-lg shadow-lg animate-pulse">
                                    <Typography variant="body2" className="font-bold text-foreground">
                                        Click an enemy to attack!
                                    </Typography>
                                </HStack>
                            </HStack>
                        )}

                        {currentPhase === 'action' && attackTargets.length === 0 && (
                            <HStack justify="center" className="absolute -top-1 left-0 right-0 z-30">
                                <HStack gap="sm" align="center" className="bg-muted/95 text-foreground px-4 py-2 rounded-lg shadow-lg">
                                    <Typography variant="body2" className="text-foreground">
                                        No enemies in range.
                                    </Typography>
                                    <Button variant="primary" size="sm" onClick={handleEndTurn}>
                                        End Turn
                                    </Button>
                                </HStack>
                            </HStack>
                        )}

                        {/* Canvas Game Board */}
                        <IsometricGameCanvas
                            tiles={isoTiles}
                            units={visualIsoUnits}
                            features={obstacleFeatures}
                            selectedUnitId={selectedUnitId}
                            validMoves={validMoves}
                            attackTargets={attackTargets}
                            hoveredTile={hoveredTile}
                            onTileClick={handleTileClick}
                            onUnitClick={handleUnitClick}
                            onTileHover={(x, y) => setHoveredTile({ x, y })}
                            onTileLeave={() => setHoveredTile(null)}
                            scale={scale}
                            assetManifest={assets}
                            backgroundImage={assets.backgrounds?.battle ? `${assets.baseUrl}/${assets.backgrounds.battle}` : undefined}
                            onDrawEffects={drawEffects}
                            hasActiveEffects={effectsActive}
                            effectSpriteUrls={[...effectSpriteUrls, ...spriteSheetUrls]}
                            resolveUnitFrame={resolveUnitFrame}
                            unitScale={unitScale}
                        />

                        {/* Damage Popups (positioned over canvas) */}
                        {damagePopups.map(popup => (
                            <DamagePopup
                                key={popup.id}
                                amount={popup.amount}
                                type={popup.type}
                                x={popup.screenX}
                                y={popup.screenY}
                            />
                        ))}

                        {/* Unit Hover Tooltip with TraitStateViewer - follows cursor */}
                        {tooltipVisible && hoveredUnit && hoveredUnit.traits[0] && hoveredTile && (
                            <Box
                                className="absolute z-50 pointer-events-none animate-in fade-in duration-150"
                                style={{
                                    left: Math.min(mousePosition.x + 20, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 300),
                                    top: Math.max(mousePosition.y - 20, 0),
                                    maxWidth: 280,
                                }}
                            >
                                <Card
                                    variant="default"
                                    className={cn(
                                        "p-3 shadow-xl bg-background/95 backdrop-blur-sm min-w-[200px]",
                                        hoveredUnit.team === 'enemy' ? 'border border-[var(--tw-faction-dominion)]/50' : 'border border-[var(--tw-faction-resonator)]/50'
                                    )}
                                    style={getGameUIPanelUrl(assets, 'tooltipFrame') ? {
                                        borderImage: `url(${getGameUIPanelUrl(assets, 'tooltipFrame')}) 60 fill / 15px / 0 stretch`,
                                        border: 'none',
                                    } : undefined}
                                >
                                    <HStack gap="sm" className="mb-2">
                                        <Typography variant="caption" className={cn(
                                            "font-bold",
                                            hoveredUnit.team === 'enemy' ? 'text-[var(--tw-faction-dominion)]' : 'text-[var(--tw-faction-resonator)]'
                                        )}>
                                            {hoveredUnit.name}
                                        </Typography>
                                        {hoveredUnit.unitType && (
                                            <Badge variant="neutral" size="sm">{hoveredUnit.unitType}</Badge>
                                        )}
                                    </HStack>

                                    {/* Feature 2: Unit Portrait */}
                                    {(hoveredUnit.sprite || hoveredUnit.unitType) && (
                                        <Box className="flex justify-center mb-2">
                                            <img
                                                src={hoveredUnit.sprite || getRobotUnitSpriteUrl(assets, hoveredUnit.unitType as RobotUnitType)}
                                                alt={hoveredUnit.name}
                                                className="w-16 h-16 object-contain"
                                            />
                                        </Box>
                                    )}

                                    {/* Stats Row */}
                                    <HStack gap="md" className="text-xs mb-3 py-2 px-2 bg-card rounded">
                                        <VStack gap="none" align="center">
                                            <Typography variant="caption" className="text-muted-foreground">HP</Typography>
                                            <Typography variant="caption" className="text-foreground font-medium">
                                                {hoveredUnit.health}/{hoveredUnit.maxHealth}
                                            </Typography>
                                        </VStack>
                                        <VStack gap="none" align="center">
                                            <Typography variant="caption" className="text-muted-foreground">ATK</Typography>
                                            <Typography variant="caption" className="text-foreground font-medium">
                                                {hoveredUnit.attack}
                                            </Typography>
                                        </VStack>
                                        <VStack gap="none" align="center">
                                            <Typography variant="caption" className="text-muted-foreground">DEF</Typography>
                                            <Typography variant="caption" className="text-foreground font-medium">
                                                {hoveredUnit.defense}
                                            </Typography>
                                        </VStack>
                                    </HStack>

                                    {/* Trait State Machine Viewer */}
                                    <TraitStateViewer
                                        trait={{
                                            name: hoveredUnit.traits[0].name,
                                            states: hoveredUnit.traits[0].states,
                                            currentState: hoveredUnit.traits[0].currentState,
                                            transitions: TRAIT_TRANSITIONS[hoveredUnit.traits[0].name] || [],
                                            description: `${hoveredUnit.team === 'enemy' ? 'Enemy' : 'Player'} behavior`,
                                        }}
                                        size="sm"
                                        showTransitions={true}
                                    />
                                </Card>
                            </Box>
                        )}
                    </VStack>
                </Box>
            </HStack>

            {/* Legend */}
            {getGameUIPanelUrl(assets, 'divider')
                ? <img src={getGameUIPanelUrl(assets, 'divider')} alt="" className="w-full h-4 object-contain opacity-60 my-1" />
                : null}
            <HStack gap="lg" justify="center" className={cn("w-full py-2", !getGameUIPanelUrl(assets, 'divider') && "border-t border-border")}>
                <HStack gap="xs" align="center">
                    {getGameUIEmblemUrl(assets, 'resonator')
                        ? <img src={getGameUIEmblemUrl(assets, 'resonator')} alt="Resonator" className="w-4 h-4 object-contain" />
                        : <Box className="w-3 h-3 rounded-full bg-[var(--tw-faction-resonator)] border border-[var(--tw-faction-resonator)]/50" />}
                    <Typography variant="caption" className="text-muted-foreground">Player</Typography>
                </HStack>
                <HStack gap="xs" align="center">
                    {getGameUIEmblemUrl(assets, 'dominion')
                        ? <img src={getGameUIEmblemUrl(assets, 'dominion')} alt="Dominion" className="w-4 h-4 object-contain" />
                        : <Box className="w-3 h-3 rounded-full bg-[var(--tw-faction-dominion)] border border-[var(--tw-faction-dominion)]/50" />}
                    <Typography variant="caption" className="text-muted-foreground">Enemy</Typography>
                </HStack>
                <HStack gap="xs" align="center">
                    <Box className="w-3 h-3 rounded-full bg-primary border border-primary/50" />
                    <Typography variant="caption" className="text-muted-foreground">Selected</Typography>
                </HStack>
                <HStack gap="xs" align="center">
                    <Box className="w-3 h-3 rounded-full bg-success border border-success/50" />
                    <Typography variant="caption" className="text-muted-foreground">Move</Typography>
                </HStack>
                <HStack gap="xs" align="center">
                    <Box className="w-3 h-3 rounded-full bg-error border border-error/50" />
                    <Typography variant="caption" className="text-muted-foreground">Attack</Typography>
                </HStack>
            </HStack>

            {/* Feature 5: Victory/Defeat Screen Overlay */}
            {gameResult && (
                <Box className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-500 rounded-xl">
                    <VStack gap="lg" align="center" className="p-8">
                        {/* Result Title */}
                        {getGameUIOverlayUrl(assets, gameResult as GameUIOverlayType)
                            ? <img src={getGameUIOverlayUrl(assets, gameResult as GameUIOverlayType)} alt={gameResult} className="w-72 h-auto object-contain" />
                            : <>
                                <Typography
                                    variant="h2"
                                    className={cn(
                                        "font-black tracking-widest uppercase",
                                        gameResult === 'victory' ? 'text-[var(--tw-gold)]' : 'text-error'
                                    )}
                                >
                                    {gameResult === 'victory' ? 'Victory!' : 'Defeat'}
                                </Typography>
                                <Box className={cn(
                                    "w-48 h-1 rounded-full",
                                    gameResult === 'victory' ? 'bg-gradient-to-r from-transparent via-[var(--tw-gold)] to-transparent' : 'bg-gradient-to-r from-transparent via-error to-transparent'
                                )} />
                            </>
                        }

                        {/* Battle Stats */}
                        <Card
                            variant="default"
                            className="bg-card/90 border border-border p-6 min-w-[300px]"
                            style={getGameUIPanelUrl(assets, 'panelFrame') ? {
                                borderImage: `url(${getGameUIPanelUrl(assets, 'panelFrame')}) 80 fill / 20px / 0 stretch`,
                                border: 'none',
                                padding: '24px',
                            } : undefined}
                        >
                            <VStack gap="md">
                                <Typography variant="h6" className="text-secondary-foreground text-center font-semibold">Battle Summary</Typography>
                                <HStack justify="between" className="w-full">
                                    <Typography variant="body2" className="text-muted-foreground">Turns Played</Typography>
                                    <Typography variant="body2" className="text-foreground font-bold">{currentTurn}</Typography>
                                </HStack>
                                <HStack justify="between" className="w-full">
                                    <Typography variant="body2" className="text-muted-foreground">Units Remaining</Typography>
                                    <Typography variant="body2" className="text-[var(--tw-faction-resonator)] font-bold">{playerUnits.length}</Typography>
                                </HStack>
                                <HStack justify="between" className="w-full">
                                    <Typography variant="body2" className="text-muted-foreground">Enemies Defeated</Typography>
                                    <Typography variant="body2" className="text-[var(--tw-faction-dominion)] font-bold">
                                        {initialUnits.filter(u => u.team === 'enemy').length - enemyUnits.length}
                                    </Typography>
                                </HStack>
                                <HStack justify="between" className="w-full">
                                    <Typography variant="body2" className="text-muted-foreground">Combat Events</Typography>
                                    <Typography variant="body2" className="text-foreground font-bold">{combatLog.length}</Typography>
                                </HStack>
                            </VStack>
                        </Card>

                        {/* Action Buttons */}
                        <HStack gap="md">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => {
                                    // Reset game
                                    setUnits(initialUnits);
                                    setSelectedUnitId(null);
                                    setCurrentPhase('observation');
                                    setCurrentTurn(1);
                                    setCombatLog([]);
                                    setGameResult(null);
                                }}
                                className="text-primary-foreground px-8"
                                style={getGameUIButtonUrl(assets, 'primary') ? {
                                    backgroundImage: `url(${getGameUIButtonUrl(assets, 'primary')})`,
                                    backgroundSize: '100% 100%',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                } : undefined}
                            >
                                Play Again
                            </Button>
                        </HStack>
                    </VStack>
                </Box>
            )}
        </VStack>
    );
}

export default CanvasBattleTemplate;
