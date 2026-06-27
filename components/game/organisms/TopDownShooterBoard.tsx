'use client';

import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Asset, AssetUrl, EventEmit, EntityRow, FieldValue } from '@almadar/core';
import { createLogger } from '@almadar/logger';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { Box } from '../../core/atoms/Box';
import { Button } from '../../core/atoms/Button';
import { Typography } from '../../core/atoms/Typography';
import { VStack, HStack } from '../../core/atoms/Stack';
import { GameCanvas2D } from '../molecules/GameCanvas2D';
import { useImageCache } from './hooks/useImageCache';
import { boardEntity, num, str, rows } from './boardEntity';

const boardLog = createLogger('almadar:ui:game:top-down-shooter-board');

// =============================================================================
// Types
// =============================================================================

/** Per-kind sprite maps (organism owns asset choice; UI value DTO). */
type ShooterAssetManifest = {
    units?: Record<string, Asset>;
    features?: Record<string, Asset>;
    background?: Asset;
};

export interface ShooterPlayer {
    x: number;
    y: number;
}

export interface ShooterEnemy {
    id: string;
    x: number;
    y: number;
    hp: number;
}

export interface ShooterProjectile {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
}

export interface TopDownShooterBoardProps {
    /** Entity carrying all board state (player, enemies, projectiles, score, wave, lives, result). */
    entity?: EntityRow | readonly EntityRow[];
    /** Direct state — each takes priority over its entity-derived value. */
    player?: ShooterPlayer;
    enemies?: ShooterEnemy[];
    projectiles?: ShooterProjectile[];
    score?: number;
    wave?: number;
    lives?: number;
    result?: 'none' | 'won' | 'lost';
    /** Asset base-url + unit/feature sprite maps + background. */
    assetManifest?: ShooterAssetManifest;
    /** Canvas / arena dimensions in pixels. */
    width?: number;
    height?: number;
    /** Pixel draw-size of sprites. */
    spriteSize?: number;
    /** Closed-circuit event emits (UI:{event}). */
    moveEvent?: EventEmit<{ dx: number; dy: number }>;
    fireEvent?: EventEmit<{ tx: number; ty: number }>;
    playAgainEvent?: EventEmit<Record<string, never>>;
    gameEndEvent?: EventEmit<{ result: 'won' | 'lost' }>;
    className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 480;

function readPlayer(v: FieldValue | undefined): ShooterPlayer | undefined {
    if (v == null || typeof v !== 'object') return undefined;
    const o = v as { x?: FieldValue; y?: FieldValue };
    return { x: num(o.x), y: num(o.y) };
}

// =============================================================================
// Component
// =============================================================================

export function TopDownShooterBoard({
    entity,
    player: propPlayer,
    enemies: propEnemies,
    projectiles: propProjectiles,
    score: propScore,
    wave: propWave,
    lives: propLives,
    result: propResult,
    assetManifest: propAssetManifest,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    spriteSize = 32,
    moveEvent = 'MOVE',
    fireEvent = 'FIRE',
    playAgainEvent = 'PLAY_AGAIN',
    gameEndEvent = 'GAME_END',
    className,
}: TopDownShooterBoardProps): React.JSX.Element {
    const board = boardEntity(entity) ?? {};
    const eventBus = useEventBus();
    const { t } = useTranslate();

    const assetManifest =
        propAssetManifest ?? (board.assetManifest as ShooterAssetManifest | undefined);

    // ── State resolution: direct prop wins over entity-derived value ──────────
    const player: ShooterPlayer =
        propPlayer ?? readPlayer(board.player) ?? { x: width / 2, y: height - spriteSize };

    const enemies: ShooterEnemy[] = useMemo(
        () =>
            propEnemies ??
            rows(board.enemies).map(r => ({
                id: str(r.id),
                x: num(r.x),
                y: num(r.y),
                hp: num(r.hp, 1),
            })),
        [propEnemies, board.enemies],
    );

    const projectiles: ShooterProjectile[] = useMemo(
        () =>
            propProjectiles ??
            rows(board.projectiles).map(r => ({
                id: str(r.id),
                x: num(r.x),
                y: num(r.y),
                vx: num(r.vx),
                vy: num(r.vy),
            })),
        [propProjectiles, board.projectiles],
    );

    const score = propScore ?? num(board.score, 0);
    const wave = propWave ?? num(board.wave, 1);
    const lives = propLives ?? num(board.lives, 3);
    const result = (propResult ?? (str(board.result) || 'none')) as 'none' | 'won' | 'lost';

    // ── Sprite asset resolution + preload ─────────────────────────────────────
    const playerSprite = assetManifest?.units?.player?.url;
    const enemySprite = assetManifest?.units?.enemy?.url;
    const projectileSprite = assetManifest?.features?.projectile?.url;
    const backgroundSprite = assetManifest?.background;

    const spriteUrls = useMemo(
        () => [playerSprite, enemySprite, projectileSprite].filter((u): u is AssetUrl => u != null),
        [playerSprite, enemySprite, projectileSprite],
    );
    const { getImage } = useImageCache(spriteUrls);

    // Mutable draw inputs through a ref so the canvas RAF loop reads fresh values.
    const sceneRef = useRef({ player, enemies, projectiles, playerSprite, enemySprite, projectileSprite });
    sceneRef.current = { player, enemies, projectiles, playerSprite, enemySprite, projectileSprite };

    boardLog.debug('shooter-resolve', {
        player: { x: player.x, y: player.y },
        enemyCount: enemies.length,
        projectileCount: projectiles.length,
        wave,
        lives,
        result,
        hasPlayerSprite: playerSprite != null,
    });

    const onDraw = useCallback(
        (ctx: CanvasRenderingContext2D, _frame: number) => {
            const scene = sceneRef.current;
            // Background: drawn by the molecule when `backgroundImage` set; here we
            // paint a dark arena floor so the scene is never blank pre-load.
            ctx.fillStyle = '#10141c';
            ctx.fillRect(0, 0, width, height);

            const half = spriteSize / 2;

            // Projectiles
            for (const p of scene.projectiles) {
                const img = scene.projectileSprite ? getImage(scene.projectileSprite) : undefined;
                if (img) {
                    ctx.drawImage(img, p.x - half / 2, p.y - half / 2, spriteSize / 2, spriteSize / 2);
                } else {
                    ctx.fillStyle = '#ffd34d';
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, spriteSize / 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Enemies
            for (const e of scene.enemies) {
                const img = scene.enemySprite ? getImage(scene.enemySprite) : undefined;
                if (img) {
                    ctx.drawImage(img, e.x - half, e.y - half, spriteSize, spriteSize);
                } else {
                    ctx.fillStyle = '#e0524d';
                    ctx.fillRect(e.x - half, e.y - half, spriteSize, spriteSize);
                }
            }

            // Player
            const pImg = scene.playerSprite ? getImage(scene.playerSprite) : undefined;
            if (pImg) {
                ctx.drawImage(pImg, scene.player.x - half, scene.player.y - half, spriteSize, spriteSize);
            } else {
                ctx.fillStyle = '#4da3ff';
                ctx.beginPath();
                ctx.moveTo(scene.player.x, scene.player.y - half);
                ctx.lineTo(scene.player.x + half, scene.player.y + half);
                ctx.lineTo(scene.player.x - half, scene.player.y + half);
                ctx.closePath();
                ctx.fill();
            }
        },
        [getImage, width, height, spriteSize],
    );

    // ── Input: arrow/WASD move, space/click to fire ───────────────────────────
    const moveEventRef = useRef(moveEvent);
    moveEventRef.current = moveEvent;
    const fireEventRef = useRef(fireEvent);
    fireEventRef.current = fireEvent;
    const resultRef = useRef(result);
    resultRef.current = result;
    const playerRef = useRef(player);
    playerRef.current = player;

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent): void {
            if (resultRef.current !== 'none') return;
            let dx = 0;
            let dy = 0;
            switch (e.key) {
                case 'ArrowUp':
                case 'w': dy = -1; break;
                case 'ArrowDown':
                case 's': dy = 1; break;
                case 'ArrowLeft':
                case 'a': dx = -1; break;
                case 'ArrowRight':
                case 'd': dx = 1; break;
                case ' ': {
                    e.preventDefault();
                    const evt = fireEventRef.current;
                    if (evt) {
                        eventBus.emit(`UI:${evt}`, { tx: playerRef.current.x, ty: 0 });
                    }
                    return;
                }
                default: return;
            }
            e.preventDefault();
            const moveEvt = moveEventRef.current;
            if (moveEvt) {
                eventBus.emit(`UI:${moveEvt}`, { dx, dy });
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [eventBus]);

    const handleFireClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (result !== 'none') return;
            const evt = fireEventRef.current;
            if (!evt) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const tx = e.clientX - rect.left;
            const ty = e.clientY - rect.top;
            eventBus.emit(`UI:${evt}`, { tx, ty });
        },
        [result, eventBus],
    );

    const handlePlayAgain = useCallback(() => {
        if (playAgainEvent) {
            eventBus.emit(`UI:${playAgainEvent}`, {});
        }
    }, [playAgainEvent, eventBus]);

    // Emit GAME_END once when result settles to won/lost.
    const gameEndEmittedRef = useRef(false);
    useEffect(() => {
        if ((result === 'won' || result === 'lost') && gameEndEvent) {
            if (!gameEndEmittedRef.current) {
                gameEndEmittedRef.current = true;
                eventBus.emit(`UI:${gameEndEvent}`, { result });
            }
        } else {
            gameEndEmittedRef.current = false;
        }
    }, [result, gameEndEvent, eventBus]);

    const isGameOver = result === 'won' || result === 'lost';

    return (
        <VStack className={cn('top-down-shooter-board relative bg-background', className)} gap="none">
            {/* HUD bar */}
            <HStack className="px-4 py-2 border-b border-border bg-surface" gap="lg" align="center">
                <HStack gap="xs" align="center">
                    <Typography variant="small" color="muted">{t('shooter.score') ?? 'Score'}</Typography>
                    <Typography variant="body2" weight="bold" className="text-warning">{score}</Typography>
                </HStack>
                <HStack gap="xs" align="center">
                    <Typography variant="small" color="muted">{t('shooter.wave') ?? 'Wave'}</Typography>
                    <Typography variant="body2" weight="bold">{wave}</Typography>
                </HStack>
                <HStack gap="xs" align="center">
                    <Typography variant="small" color="muted">{t('shooter.lives') ?? 'Lives'}</Typography>
                    <Typography
                        variant="body2"
                        weight="bold"
                        className={lives <= 1 ? 'text-error' : 'text-success'}
                    >
                        {lives}
                    </Typography>
                </HStack>
            </HStack>

            {/* Arena canvas — composes the pure GameCanvas2D molecule */}
            <Box className="relative" onClick={handleFireClick}>
                <GameCanvas2D
                    width={width}
                    height={height}
                    backgroundImage={backgroundSprite}
                    onDraw={onDraw}
                />

                {isGameOver && (
                    <Box className="absolute inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm rounded-container">
                        <VStack className="text-center p-8" gap="lg">
                            <Typography
                                variant="h2"
                                className={cn(
                                    'text-4xl font-black tracking-widest uppercase',
                                    result === 'won' ? 'text-warning' : 'text-error',
                                )}
                            >
                                {result === 'won'
                                    ? (t('shooter.victory') ?? 'Victory!')
                                    : (t('shooter.defeat') ?? 'Defeat!')}
                            </Typography>
                            <Typography variant="body1" className="text-muted-foreground">
                                {result === 'won'
                                    ? (t('shooter.cleared') ?? `Cleared wave ${wave} — score ${score}`)
                                    : (t('shooter.overrun') ?? 'You were overrun.')}
                            </Typography>
                            <Button
                                variant="primary"
                                className="px-8 py-3 font-semibold"
                                onClick={handlePlayAgain}
                            >
                                {t('shooter.playAgain') ?? 'Play Again'}
                            </Button>
                        </VStack>
                    </Box>
                )}
            </Box>
        </VStack>
    );
}

TopDownShooterBoard.displayName = 'TopDownShooterBoard';

export default TopDownShooterBoard;
