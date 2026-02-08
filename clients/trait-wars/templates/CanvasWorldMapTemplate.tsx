/**
 * CanvasWorldMapTemplate
 *
 * Strategic world map using IsometricGameCanvas (canvas-based) with:
 * - Asset-loaded isometric terrain, hero sprites, and feature sprites
 * - Resource nodes, castles, and portals rendered on canvas
 * - Hero movement and encounters
 * - DOM overlays: ResourceBar, hero info panel, hex tooltip
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Box, Typography, HStack, VStack, Button, Badge, Card, cn } from '@almadar/ui';
import {
    IsometricGameCanvas,
    isoToScreen,
    TILE_WIDTH,
    TILE_HEIGHT,
    FLOOR_HEIGHT,
} from '../organisms/IsometricGameCanvas';
import type { IsometricTile, IsometricUnit, IsometricFeature } from '../organisms/IsometricGameCanvas';
import { ResourceBar } from '../molecules/ResourceBar';
import {
    Resources,
    StrategicWorldMap,
    WorldMapHex,
    WorldMapHero,
    HexFeatureType,
    CASTLE_FACTIONS,
    isInMovementRange,
} from '../types';
import {
    useAssetsOptional,
    DEFAULT_ASSET_MANIFEST,
    getHeroPortraitUrl,
    getTerrainVariantUrl,
    getHeroSpriteUrl,
    getWorldMapFeatureUrl,
    getIsometricCastleUrl,
    getAllCharacterSheetUrls,
    getGameUIEmblemUrl,
    getGameUIPanelUrl,
    getGameUIButtonUrl,
    type TraitWarsAssetManifest,
    type GameUIEmblemType,
    type WorldMapFeatureType,
    type TerrainType,
} from '../assets';
import { HeroDetailPanel } from '../molecules/HeroDetailPanel';
import { useSpriteAnimations } from '../organisms/useSpriteAnimations';

// ============================================================================
// TYPES
// ============================================================================

export interface CanvasWorldMapTemplateProps {
    /** Complete world map data */
    worldMap: StrategicWorldMap;
    /** Player resources */
    resources: Resources;
    /** Current selected hero */
    selectedHeroId?: string | null;
    /** Handler when hero is selected */
    onHeroSelect?: (heroId: string) => void;
    /** Handler when hero moves */
    onHeroMove?: (heroId: string, toX: number, toY: number) => void;
    /** Handler for entering castle */
    onEnterCastle?: (castleId: string) => void;
    /** Handler for collecting resource */
    onCollectResource?: (x: number, y: number, resourceType: string, amount: number) => void;
    /** Handler for battle encounter */
    onBattleEncounter?: (attackerId: string, defenderId: string) => void;
    /** Handler for end turn */
    onEndTurn?: () => void;
    /** Canvas render scale */
    scale?: number;
    /** Animation speed multiplier. 1 = baseline, 2 = double speed. Default: 2 */
    animationSpeed?: number;
    /** Unit/hero draw size multiplier. 1 = base, 2.5 = default. Default: 2.5 */
    unitScale?: number;
    /** Allow selecting and moving ALL heroes (including enemies). For testing/Storybook. Default: false */
    allowMoveAllHeroes?: boolean;
    /** Additional CSS classes */
    className?: string;
}

// Feature labels for tooltip
const FEATURE_LABELS: Record<HexFeatureType, string> = {
    none: '',
    goldMine: 'Gold Mine',
    resonanceCrystal: 'Resonance Crystal',
    traitCache: 'Trait Cache',
    salvageYard: 'Salvage Yard',
    portal: 'Portal',
    treasure: 'Treasure',
    castle: 'Castle',
    battleMarker: 'Battle Site',
    hero: 'Hero',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CanvasWorldMapTemplate({
    worldMap,
    resources,
    selectedHeroId,
    onHeroSelect,
    onHeroMove,
    onEnterCastle,
    onCollectResource,
    onBattleEncounter,
    onEndTurn,
    scale = 0.4,
    animationSpeed = 2,
    unitScale = 2.5,
    allowMoveAllHeroes = false,
    className,
}: CanvasWorldMapTemplateProps): JSX.Element {
    const assets = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;
    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

    // Sprite sheet animations
    const { syncUnits: syncSpriteAnimations, resolveUnitFrame } = useSpriteAnimations(assets, { speed: animationSpeed });
    const spriteSheetUrls = useMemo(() => getAllCharacterSheetUrls(assets), [assets]);

    // Selected hero
    const selectedHero = useMemo(() => {
        return worldMap.heroes.find((h) => h.id === selectedHeroId);
    }, [worldMap.heroes, selectedHeroId]);

    // Convert world map hexes to isometric tiles
    const tiles: IsometricTile[] = useMemo(() => {
        return worldMap.hexes.map((hex) => ({
            x: hex.x,
            y: hex.y,
            terrain: hex.terrain,
            terrainSprite: getTerrainVariantUrl(assets, hex.terrain as TerrainType, hex.x, hex.y),
        }));
    }, [worldMap.hexes, assets]);

    // Convert heroes to isometric units (base positions from worldMap)
    const baseUnits: IsometricUnit[] = useMemo(() => {
        return worldMap.heroes.map((hero) => ({
            id: hero.id,
            position: hero.position,
            name: hero.name,
            team: hero.owner === 'enemy' ? 'enemy' as const : 'player' as const,
            health: 100,
            maxHealth: 100,
            heroId: hero.spriteId || hero.id,
            sprite: getHeroSpriteUrl(assets, hero.spriteId || hero.id),
        }));
    }, [worldMap.heroes, assets]);

    // ========================================================================
    // MOVEMENT ANIMATION — smooth tile-by-tile walk instead of teleporting
    // ========================================================================

    interface MovementAnim {
        heroId: string;
        from: { x: number; y: number };
        to: { x: number; y: number };
        elapsed: number;
        duration: number;
        /** Callbacks to fire once the walk reaches its destination */
        onComplete: () => void;
    }

    const MOVE_SPEED_MS_PER_TILE = 300; // ms to traverse one tile
    const movementAnimRef = useRef<MovementAnim | null>(null);
    const [movingPositions, setMovingPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

    /** Start an animated walk from `from` to `to`. */
    const startMoveAnimation = useCallback((
        heroId: string,
        from: { x: number; y: number },
        to: { x: number; y: number },
        onComplete: () => void,
    ) => {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const duration = dist * MOVE_SPEED_MS_PER_TILE;
        movementAnimRef.current = { heroId, from, to, elapsed: 0, duration, onComplete };
    }, []);

    // Tick movement animation alongside sprite animations (~60fps)
    useEffect(() => {
        const interval = setInterval(() => {
            const anim = movementAnimRef.current;
            if (anim) {
                anim.elapsed += 16;
                const t = Math.min(anim.elapsed / anim.duration, 1);
                // Ease-out for natural deceleration
                const eased = 1 - (1 - t) * (1 - t);
                const cx = anim.from.x + (anim.to.x - anim.from.x) * eased;
                const cy = anim.from.y + (anim.to.y - anim.from.y) * eased;

                if (t >= 1) {
                    // Animation complete — snap to destination and fire callback
                    movementAnimRef.current = null;
                    setMovingPositions((prev) => {
                        const next = new Map(prev);
                        next.delete(anim.heroId);
                        return next;
                    });
                    anim.onComplete();
                } else {
                    setMovingPositions((prev) => {
                        const next = new Map(prev);
                        next.set(anim.heroId, { x: cx, y: cy });
                        return next;
                    });
                }
            }

            // Sync sprite animations with the visual units (uses interpolated positions)
            syncSpriteAnimations(unitsRef.current, 16);
        }, 16);
        return () => clearInterval(interval);
    }, [syncSpriteAnimations]);

    // Units with interpolated positions for moving heroes
    const units: IsometricUnit[] = useMemo(() => {
        if (movingPositions.size === 0) return baseUnits;
        return baseUnits.map((unit) => {
            const pos = movingPositions.get(unit.id);
            return pos ? { ...unit, position: pos } : unit;
        });
    }, [baseUnits, movingPositions]);

    // Keep a mutable ref to units so the setInterval can read current values
    const unitsRef = useRef(units);
    unitsRef.current = units;

    // Convert hex features to isometric features
    const features: IsometricFeature[] = useMemo(() => {
        return worldMap.hexes
            .filter((hex) => hex.feature && hex.feature !== 'none' && hex.feature !== 'hero')
            .map((hex) => {
                // Map feature type to world map feature asset type
                const featureTypeMap: Record<string, WorldMapFeatureType> = {
                    goldMine: 'goldMine',
                    resonanceCrystal: 'resonanceCrystal',
                    traitCache: 'traitCache',
                    salvageYard: 'salvageYard',
                    portal: 'portal',
                    portalClosed: 'portalClosed',
                    treasure: 'treasure',
                    treasureOpen: 'treasureOpen',
                    battleMarker: 'battleMarker',
                    fogOfWar: 'fogOfWar',
                    powerNode: 'powerNode',
                    dataVault: 'dataVault',
                };

                // Resolve sprite: castles use isometric castle assets, others use feature map
                let sprite: string | undefined;
                if (hex.feature === 'castle') {
                    const faction = hex.featureData?.owner === 'enemy' ? 'dominion' : 'resonator';
                    sprite = assets ? getIsometricCastleUrl(assets, faction as any) : undefined;
                } else {
                    const assetType = featureTypeMap[hex.feature!];
                    sprite = assetType ? getWorldMapFeatureUrl(assets, assetType) : undefined;
                }

                return {
                    x: hex.x,
                    y: hex.y,
                    type: hex.feature!,
                    sprite,
                };
            });
    }, [worldMap.hexes, assets]);

    // Valid moves for selected hero
    const validMoves = useMemo(() => {
        if (!selectedHero || selectedHero.movement <= 0) return [];

        const moves: Array<{ x: number; y: number }> = [];
        worldMap.hexes.forEach((hex) => {
            if (!hex.passable) return;
            if (hex.x === selectedHero.position.x && hex.y === selectedHero.position.y) return;

            if (isInMovementRange(selectedHero.position, { x: hex.x, y: hex.y }, selectedHero.movement)) {
                const occupyingHero = worldMap.heroes.find(
                    (h) => h.position.x === hex.x && h.position.y === hex.y && h.owner === selectedHero.owner
                );
                if (!occupyingHero) {
                    moves.push({ x: hex.x, y: hex.y });
                }
            }
        });
        return moves;
    }, [selectedHero, worldMap.hexes, worldMap.heroes]);

    // Attack targets (enemy heroes in range)
    const attackTargets = useMemo(() => {
        if (!selectedHero || selectedHero.movement <= 0) return [];

        return worldMap.heroes
            .filter((h) => h.owner !== selectedHero.owner)
            .filter((h) => isInMovementRange(selectedHero.position, h.position, selectedHero.movement))
            .map((h) => h.position);
    }, [selectedHero, worldMap.heroes]);

    // Handle tile click — starts animated walk, fires callbacks on arrival
    const handleTileClick = useCallback((x: number, y: number) => {
        const hex = worldMap.hexes.find((h) => h.x === x && h.y === y);
        if (!hex) return;

        // Don't allow clicks while a movement animation is playing
        if (movementAnimRef.current) return;

        if (selectedHero && validMoves.some((m) => m.x === x && m.y === y)) {
            const from = { ...selectedHero.position };
            const to = { x, y };

            startMoveAnimation(selectedHero.id, from, to, () => {
                // Fire the logical move after the walk animation completes
                onHeroMove?.(selectedHero.id, x, y);

                if (hex.feature === 'castle' && hex.featureData?.castleId) {
                    onEnterCastle?.(hex.featureData.castleId);
                } else if (hex.feature && ['goldMine', 'resonanceCrystal', 'traitCache', 'salvageYard', 'treasure'].includes(hex.feature)) {
                    onCollectResource?.(x, y, hex.featureData?.resourceType || 'gold', hex.featureData?.resourceAmount || 100);
                }
            });
            return;
        }

        // Check for enemy hero battle
        const enemyHero = worldMap.heroes.find(
            (h) => h.position.x === x && h.position.y === y && h.owner === 'enemy'
        );
        if (selectedHero && enemyHero && attackTargets.some((t) => t.x === x && t.y === y)) {
            onBattleEncounter?.(selectedHero.id, enemyHero.id);
        }
    }, [worldMap.hexes, worldMap.heroes, selectedHero, validMoves, attackTargets, startMoveAnimation, onHeroMove, onEnterCastle, onCollectResource, onBattleEncounter]);

    // Handle unit click
    const handleUnitClick = useCallback((unitId: string) => {
        const hero = worldMap.heroes.find((h) => h.id === unitId);
        if (hero && (hero.owner === 'player' || allowMoveAllHeroes)) {
            onHeroSelect?.(unitId);
        }
    }, [worldMap.heroes, onHeroSelect, allowMoveAllHeroes]);

    // Hovered hex info
    const hoveredHexInfo = useMemo(() => {
        if (!hoveredTile) return null;
        const hex = worldMap.hexes.find((h) => h.x === hoveredTile.x && h.y === hoveredTile.y);
        if (!hex) return null;
        const hero = worldMap.heroes.find((h) => h.position.x === hoveredTile.x && h.position.y === hoveredTile.y);
        const castle = hex.feature === 'castle'
            ? worldMap.castles.find((c) => c.id === hex.featureData?.castleId)
            : null;
        return { hex, hero, castle };
    }, [hoveredTile, worldMap]);

    // Calculate tooltip position from tile coordinates
    const maxY = Math.max(...worldMap.hexes.map(h => h.y), 0);
    const baseOffsetX = (maxY + 1) * (TILE_WIDTH * scale / 2);

    return (
        <Box className={cn('min-h-screen bg-gradient-to-b from-background via-card to-background', className)}>
            {/* Top Bar */}
            <Box className="p-4 bg-background/90 border-b border-border">
                <HStack justify="between" className="max-w-7xl mx-auto">
                    <HStack className="gap-4 items-center">
                        <Typography variant="h4" className="text-primary">
                            {worldMap.name}
                        </Typography>
                        <Badge variant="default" className="bg-primary text-primary-foreground">
                            Turn {worldMap.turnNumber}
                        </Badge>
                    </HStack>
                    <HStack className="gap-4 items-center">
                        <ResourceBar resources={resources} compact />
                        <Button
                            onClick={onEndTurn}
                            className="bg-primary hover:bg-[var(--color-primary-hover)] text-primary-foreground font-bold"
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
                </HStack>
            </Box>

            {/* Main Content */}
            <HStack className="h-[calc(100vh-72px)]">
                {/* Map Area */}
                <Box className="flex-1 overflow-auto p-4">
                    <Box className="relative">
                        <IsometricGameCanvas
                            tiles={tiles}
                            units={units}
                            features={features}
                            selectedUnitId={selectedHeroId}
                            validMoves={validMoves}
                            attackTargets={attackTargets}
                            hoveredTile={hoveredTile}
                            onTileClick={handleTileClick}
                            onUnitClick={handleUnitClick}
                            onTileHover={(x, y) => setHoveredTile({ x, y })}
                            onTileLeave={() => setHoveredTile(null)}
                            scale={scale}
                            assetManifest={assets}
                            backgroundImage={assets.backgrounds?.worldMap ? `${assets.baseUrl}/${assets.backgrounds.worldMap}` : undefined}
                            effectSpriteUrls={spriteSheetUrls}
                            resolveUnitFrame={resolveUnitFrame}
                            unitScale={unitScale}
                        />

                        {/* Hover Tooltip (positioned over canvas) */}
                        {hoveredHexInfo && hoveredTile && (
                            <Box
                                className="absolute z-50 pointer-events-none animate-in fade-in duration-150"
                                style={{
                                    left: (() => {
                                        const pos = isoToScreen(hoveredTile.x, hoveredTile.y, scale, baseOffsetX);
                                        return pos.x + TILE_WIDTH * scale / 2 + 20;
                                    })(),
                                    top: (() => {
                                        const pos = isoToScreen(hoveredTile.x, hoveredTile.y, scale, baseOffsetX);
                                        return pos.y + FLOOR_HEIGHT * scale / 2;
                                    })(),
                                }}
                            >
                                <Card
                                    variant="default"
                                    className="p-3 shadow-xl bg-background/95 backdrop-blur-sm border border-border min-w-[180px]"
                                    style={getGameUIPanelUrl(assets, 'tooltipFrame') ? {
                                        borderImage: `url(${getGameUIPanelUrl(assets, 'tooltipFrame')}) 60 fill / 15px / 0 stretch`,
                                        border: 'none',
                                    } : undefined}
                                >
                                    <Typography variant="body2" className="text-foreground font-bold mb-1">
                                        {hoveredHexInfo.hex.feature && hoveredHexInfo.hex.feature !== 'none'
                                            ? FEATURE_LABELS[hoveredHexInfo.hex.feature]
                                            : `${hoveredHexInfo.hex.terrain.charAt(0).toUpperCase() + hoveredHexInfo.hex.terrain.slice(1)}`}
                                    </Typography>
                                    <Typography variant="caption" className="text-muted-foreground block">
                                        ({hoveredTile.x}, {hoveredTile.y})
                                    </Typography>
                                    {hoveredHexInfo.hex.featureData?.resourceAmount && (
                                        <Typography variant="body2" className="text-success mt-1">
                                            +{hoveredHexInfo.hex.featureData.resourceAmount} {hoveredHexInfo.hex.featureData.resourceType}
                                        </Typography>
                                    )}
                                    {hoveredHexInfo.hero && (
                                        <Box className="mt-2 p-2 bg-card rounded">
                                            <Typography variant="body2" className={hoveredHexInfo.hero.owner === 'player' ? 'text-[var(--tw-faction-resonator)]' : 'text-[var(--tw-faction-dominion)]'}>
                                                {hoveredHexInfo.hero.name} (Lv {hoveredHexInfo.hero.level})
                                            </Typography>
                                            <Typography variant="caption" className="text-muted-foreground">
                                                Army: {hoveredHexInfo.hero.army.reduce((sum, u) => sum + u.count, 0)} units
                                            </Typography>
                                        </Box>
                                    )}
                                    {hoveredHexInfo.castle && (
                                        <Box className="mt-2 p-2 bg-card rounded">
                                            <Typography variant="body2" className="text-primary">
                                                {hoveredHexInfo.castle.name}
                                            </Typography>
                                            <Typography variant="caption" className="text-muted-foreground">
                                                {CASTLE_FACTIONS[hoveredHexInfo.castle.faction].name}
                                            </Typography>
                                        </Box>
                                    )}
                                </Card>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Info Panel */}
                <Box
                    className="w-80 bg-card/90 border-l border-border p-4 overflow-y-auto"
                    style={getGameUIPanelUrl(assets, 'panelFrame') ? {
                        borderImage: `url(${getGameUIPanelUrl(assets, 'panelFrame')}) 80 fill / 20px / 0 stretch`,
                        border: 'none',
                        padding: '24px',
                    } : undefined}
                >
                    {/* Selected Hero */}
                    {selectedHero && (
                        <HeroDetailPanel hero={selectedHero} showMovement className="mb-4" />
                    )}

                    {/* Player Heroes List */}
                    <Box className="mb-4">
                        <HStack className="gap-2 items-center mb-2">
                            {getGameUIEmblemUrl(assets, 'resonator') && <img src={getGameUIEmblemUrl(assets, 'resonator')} alt="Resonator" className="w-5 h-5 object-contain" />}
                            <Typography variant="h6" className="text-primary">Your Heroes</Typography>
                        </HStack>
                        <VStack className="gap-2">
                            {worldMap.heroes
                                .filter((h) => h.owner === 'player')
                                .map((hero) => (
                                    <Box
                                        key={hero.id}
                                        className={cn(
                                            'p-3 rounded-lg cursor-pointer transition-colors border',
                                            hero.id === selectedHeroId
                                                ? 'bg-[var(--tw-faction-resonator)]/20 border-[var(--tw-faction-resonator)]'
                                                : 'bg-card border-border hover:bg-muted'
                                        )}
                                        onClick={() => onHeroSelect?.(hero.id)}
                                    >
                                        <HStack className="gap-2 items-center">
                                            <Box className="w-8 h-8 rounded overflow-hidden border border-[var(--tw-faction-resonator)] bg-background">
                                                {getHeroPortraitUrl(assets, hero.id) ? (
                                                    <img
                                                        src={getHeroPortraitUrl(assets, hero.id)}
                                                        alt={hero.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Box className="w-full h-full flex items-center justify-center text-sm">🦸</Box>
                                                )}
                                            </Box>
                                            <Typography variant="body2" className="text-foreground flex-1">
                                                {hero.name}
                                            </Typography>
                                            <Badge variant="default" className={hero.movement > 0 ? 'bg-success' : 'bg-muted'}>
                                                {hero.movement}
                                            </Badge>
                                        </HStack>
                                    </Box>
                                ))}
                        </VStack>
                    </Box>

                    {/* Divider between hero lists */}
                    {worldMap.heroes.some((h) => h.owner === 'enemy') && getGameUIPanelUrl(assets, 'divider')
                        ? <img src={getGameUIPanelUrl(assets, 'divider')} alt="" className="w-full h-4 object-contain opacity-60 my-2" />
                        : worldMap.heroes.some((h) => h.owner === 'enemy') && <Box className="w-full h-px bg-border my-2" />}

                    {/* Enemy Heroes */}
                    {worldMap.heroes.some((h) => h.owner === 'enemy') && (
                        <Box className="mb-4">
                            <HStack className="gap-2 items-center mb-2">
                                {getGameUIEmblemUrl(assets, 'dominion') && <img src={getGameUIEmblemUrl(assets, 'dominion')} alt="Dominion" className="w-5 h-5 object-contain" />}
                                <Typography variant="h6" className="text-[var(--tw-faction-dominion)]">Enemy Heroes</Typography>
                            </HStack>
                            <VStack className="gap-2">
                                {worldMap.heroes
                                    .filter((h) => h.owner === 'enemy')
                                    .map((hero) => (
                                        <Box
                                            key={hero.id}
                                            className={cn(
                                                'p-3 rounded-lg border',
                                                allowMoveAllHeroes ? 'cursor-pointer' : '',
                                                hero.id === selectedHeroId && allowMoveAllHeroes
                                                    ? 'bg-[var(--tw-faction-dominion)]/20 border-[var(--tw-faction-dominion)]'
                                                    : 'bg-[var(--tw-faction-dominion)]/10 border-[var(--tw-faction-dominion)]/50',
                                                allowMoveAllHeroes ? 'hover:bg-[var(--tw-faction-dominion)]/20' : '',
                                            )}
                                            onClick={allowMoveAllHeroes ? () => onHeroSelect?.(hero.id) : undefined}
                                        >
                                            <HStack className="gap-2 items-center">
                                                <Box className="w-8 h-8 rounded overflow-hidden border border-[var(--tw-faction-dominion)] bg-background">
                                                    {getHeroPortraitUrl(assets, hero.id) ? (
                                                        <img
                                                            src={getHeroPortraitUrl(assets, hero.id)}
                                                            alt={hero.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Box className="w-full h-full flex items-center justify-center text-sm">👹</Box>
                                                    )}
                                                </Box>
                                                <Typography variant="body2" className="text-[var(--tw-faction-dominion)] flex-1">
                                                    {hero.name}
                                                </Typography>
                                                {allowMoveAllHeroes && (
                                                    <Badge variant="default" className={hero.movement > 0 ? 'bg-success' : 'bg-muted'}>
                                                        {hero.movement}
                                                    </Badge>
                                                )}
                                            </HStack>
                                        </Box>
                                    ))}
                            </VStack>
                        </Box>
                    )}

                    {/* Instructions */}
                    <Box className="mt-6 p-3 bg-background/50 rounded border border-border">
                        <Typography variant="caption" className="text-muted-foreground block mb-1">Instructions</Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                            Click a hero to select, then click a highlighted tile to move. Green = valid moves, Red = enemies.
                        </Typography>
                    </Box>
                </Box>
            </HStack>
        </Box>
    );
}

export default CanvasWorldMapTemplate;
