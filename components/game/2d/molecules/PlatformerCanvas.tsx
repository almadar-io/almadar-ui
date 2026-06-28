import * as React from 'react';
import { useRef, useEffect, useCallback, useState } from 'react';
import type { AssetUrl, EventEmit } from '@almadar/core';
import { createLogger } from '@almadar/logger';
import { cn } from '../../../../lib/cn';
import type { ActiveEffect } from '../../shared/isometricTypes';

const canvasLog = createLogger('almadar:ui:game:platformer-canvas');
import { useEventBus } from '../../../../hooks/useEventBus';
import { bindCanvasCapture, updateAssetStatus } from '../../../../lib/verificationRegistry';
import { useRenderInterpolation } from '../../../../hooks/useRenderInterpolation';

// ── Types ──────────────────────────────────────────────────────────

export interface PlatformerPlatform {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: 'ground' | 'platform' | 'hazard' | 'goal';
}

export interface PlatformerPlayer {
  x: number;
  y: number;
  width?: number;
  height?: number;
  vx?: number;
  vy?: number;
  grounded?: boolean;
  facingRight?: boolean;
}

export interface PlatformerCanvasProps {
  /** Player state data */
  player?: PlatformerPlayer;
  /** Static platforms / level geometry */
  platforms?: readonly PlatformerPlatform[];
  /** World dimensions */
  worldWidth?: number;
  worldHeight?: number;
  /** Canvas display size */
  canvasWidth?: number;
  canvasHeight?: number;
  /** Camera follows player */
  followCamera?: boolean;
  /** Background color */
  bgColor?: string;
  /** Player sprite image URL */
  playerSprite?: AssetUrl;
  /** Map of platform type to tile sprite URL */
  tileSprites?: Record<string, AssetUrl>;
  /** Background image URL */
  backgroundImage?: AssetUrl;
  /** Base URL prefix for asset URLs */
  assetBaseUrl?: AssetUrl;
  /** Event names for keyboard controls */
  leftEvent?: EventEmit<{ direction: number }>;
  rightEvent?: EventEmit<{ direction: number }>;
  jumpEvent?: EventEmit<Record<string, never>>;
  stopEvent?: EventEmit<Record<string, never>>;
  /** Active visual effects (key, world x/y, ttl) — drawn after the player */
  effects?: ActiveEffect[];
  /** Additional CSS classes */
  className?: string;
}

// ── Colors ─────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  ground: '#4a7c59',
  platform: '#7c6b4a',
  hazard: '#c0392b',
  goal: '#f1c40f',
};

const PLAYER_COLOR = '#3498db';
const PLAYER_EYE_COLOR = '#ffffff';
const SKY_GRADIENT_TOP = '#1a1a2e';
const SKY_GRADIENT_BOTTOM = '#16213e';
const GRID_COLOR = 'rgba(255, 255, 255, 0.03)';

// ── Component ──────────────────────────────────────────────────────

export function PlatformerCanvas({
  player,
  platforms = [
    { x: 0, y: 368, width: 800, height: 32, type: 'ground' },
    { x: 150, y: 280, width: 160, height: 16, type: 'platform' },
    { x: 420, y: 220, width: 160, height: 16, type: 'platform' },
    { x: 620, y: 300, width: 140, height: 16, type: 'platform' },
  ],
  worldWidth = 800,
  worldHeight = 400,
  canvasWidth = 800,
  canvasHeight = 400,
  followCamera = true,
  bgColor = "#5c94fc",
  playerSprite,
  tileSprites,
  backgroundImage = "",
  assetBaseUrl,
  leftEvent = 'MOVE_LEFT',
  rightEvent = 'MOVE_RIGHT',
  jumpEvent = 'JUMP',
  stopEvent = 'STOP',
  effects = [],
  className,
}: PlatformerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const eventBus = useEventBus();
  const keysRef = useRef<Set<string>>(new Set());
  const lastPlatCountRef = useRef<number>(-1);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Load an image and cache it; trigger re-render when it loads
  const loadImage = useCallback((url: string): HTMLImageElement | null => {
    if (!url.startsWith('http') && !assetBaseUrl) return null;
    const fullUrl = url.startsWith('http') ? url : `${assetBaseUrl}${url}`;
    const cached = imageCache.current.get(fullUrl);
    if (cached?.complete && cached.naturalWidth > 0) {
      if (!loadedImages.has(fullUrl)) {
        setLoadedImages((prev) => new Set(prev).add(fullUrl));
      }
      return cached;
    }
    if (!cached) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = fullUrl;
      img.onload = () => {
        setLoadedImages((prev) => new Set(prev).add(fullUrl));
        updateAssetStatus(fullUrl, 'loaded');
      };
      img.onerror = () => { updateAssetStatus(fullUrl, 'failed'); };
      imageCache.current.set(fullUrl, img);
      updateAssetStatus(fullUrl, 'pending');
    }
    return null;
  }, [assetBaseUrl, loadedImages]);

  // -- Verification bridge: register canvas frame capture --
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    bindCanvasCapture(() => canvas.toDataURL('image/png'));
    return () => { bindCanvasCapture(() => null); };
  }, []);

  // Resolve player with defaults
  const resolvedPlayer: PlatformerPlayer = player ?? {
    x: 80,
    y: 336,
    width: 32,
    height: 48,
    vx: 0,
    vy: 0,
    grounded: true,
    facingRight: true,
  };

  // ── Interpolation ──────────────────────────────────────────────
  // Keeps a live ref to the authoritative player so the rAF draw
  // closure always reads the latest value without re-subscribing.
  const playerRef = useRef<PlatformerPlayer>(resolvedPlayer);
  playerRef.current = resolvedPlayer;

  const interp = useRenderInterpolation<{ id: string; x: number; y: number }>();

  // Push a new snapshot whenever the authoritative player position changes.
  useEffect(() => {
    interp.onSnapshot([{ id: 'player', x: resolvedPlayer.x, y: resolvedPlayer.y }]);
  }, [resolvedPlayer.x, resolvedPlayer.y]);

  // Stable refs for props consumed inside the rAF draw closure.
  const propsRef = useRef({
    platforms, worldWidth, worldHeight, canvasWidth, canvasHeight,
    followCamera, bgColor, playerSprite, tileSprites, backgroundImage, assetBaseUrl, effects,
  });
  propsRef.current = {
    platforms, worldWidth, worldHeight, canvasWidth, canvasHeight,
    followCamera, bgColor, playerSprite, tileSprites, backgroundImage, assetBaseUrl, effects,
  };

  // ── Keyboard handler ───────────────────────────────────────────

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (keysRef.current.has(e.code)) return;
    keysRef.current.add(e.code);

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        eventBus.emit(`UI:${leftEvent}`, { direction: -1 });
        break;
      case 'ArrowRight':
      case 'KeyD':
        eventBus.emit(`UI:${rightEvent}`, { direction: 1 });
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        eventBus.emit(`UI:${jumpEvent}`, {});
        e.preventDefault();
        break;
    }
  }, [eventBus, leftEvent, rightEvent, jumpEvent]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current.delete(e.code);

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
      case 'ArrowRight':
      case 'KeyD':
        eventBus.emit(`UI:${stopEvent}`, {});
        break;
    }
  }, [eventBus, stopEvent]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // ── Canvas setup (dpr scaling) — runs only when dimensions change ──

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);
  }, [canvasWidth, canvasHeight]);

  // ── rAF draw loop — 60fps, uses interpolated player position ──

  useEffect(() => {
    const drawFrame = (positions: Map<string, { x: number; y: number }>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const {
        platforms: plats, worldWidth: ww, worldHeight: wh,
        canvasWidth: cw, canvasHeight: ch, followCamera: fc,
        bgColor: bg, playerSprite: pSprite, tileSprites: tSprites,
        backgroundImage: bgImg, effects: fxList,
      } = propsRef.current;

      const auth = playerRef.current;
      const interped = positions.get('player');
      const px = interped?.x ?? auth.x;
      const py = interped?.y ?? auth.y;

      // Camera offset (follow player)
      let camX = 0;
      let camY = 0;
      if (fc) {
        camX = Math.max(0, Math.min(px - cw / 2, ww - cw));
        camY = Math.max(0, Math.min(py - ch / 2 - 50, wh - ch));
      }

      // Log once whenever the platform count changes (e.g. seeded → empty or
      // empty → level) so we can see what reached the canvas, plus the camera.
      const shouldDiag = plats.length !== lastPlatCountRef.current;
      if (shouldDiag) {
        lastPlatCountRef.current = plats.length;
        canvasLog.debug('draw:platforms', {
          platformCount: plats.length,
          camX, camY,
          plat0: JSON.stringify(plats[0]),
          plat2: JSON.stringify(plats[2]),
          tSpritesType: tSprites ? (tSprites instanceof Map ? 'Map' : typeof tSprites) : 'none',
          canvasW: canvas.width, canvasH: canvas.height,
          player: { x: px, y: py },
          worldWidth: ww, canvasWidth: cw, followCamera: fc,
        });
      }

      // Background
      const bgImage = bgImg ? loadImage(bgImg) : null;
      if (bgImage) {
        ctx.drawImage(bgImage, 0, 0, cw, ch);
      } else if (bg) {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, cw, ch);
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, ch);
        grad.addColorStop(0, SKY_GRADIENT_TOP);
        grad.addColorStop(1, SKY_GRADIENT_BOTTOM);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);
      }

      // Grid lines
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let gx = -camX % gridSize; gx < cw; gx += gridSize) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, ch);
        ctx.stroke();
      }
      for (let gy = -camY % gridSize; gy < ch; gy += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(cw, gy);
        ctx.stroke();
      }

      // Platforms
      for (const plat of plats) {
        const platX = plat.x - camX;
        const platY = plat.y - camY;
        const platType = plat.type ?? 'ground';
        const spriteUrl = tSprites?.[platType];
        const tileImg = spriteUrl ? loadImage(spriteUrl) : null;

        if (shouldDiag) {
          canvasLog.debug('plat:draw', {
            platType, platX, platY, w: plat.width, h: plat.height,
            branch: tileImg ? 'tile' : 'color',
            natW: tileImg?.naturalWidth, natH: tileImg?.naturalHeight,
            spriteUrl: spriteUrl ?? null,
          });
        }

        if (tileImg) {
          const tileW = tileImg.naturalWidth;
          const tileH = tileImg.naturalHeight;
          const scaleH = plat.height / tileH;
          const scaledW = tileW * scaleH;
          for (let tx = 0; tx < plat.width; tx += scaledW) {
            const drawW = Math.min(scaledW, plat.width - tx);
            const srcW = drawW / scaleH;
            ctx.drawImage(tileImg, 0, 0, srcW, tileH, platX + tx, platY, drawW, plat.height);
          }
        } else {
          const color = PLATFORM_COLORS[platType] ?? PLATFORM_COLORS.ground;
          ctx.fillStyle = color;
          ctx.fillRect(platX, platY, plat.width, plat.height);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fillRect(platX, platY, plat.width, 3);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(platX, platY + plat.height - 2, plat.width, 2);
          if (platType === 'hazard') {
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            for (let sx = platX; sx < platX + plat.width; sx += 12) {
              ctx.beginPath();
              ctx.moveTo(sx, platY);
              ctx.lineTo(sx + 6, platY + plat.height);
              ctx.stroke();
            }
          }
          if (platType === 'goal') {
            ctx.fillStyle = 'rgba(241, 196, 15, 0.5)';
            ctx.beginPath();
            ctx.arc(platX + plat.width / 2, platY - 10, 8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Player character (uses interpolated x/y; all other fields from auth)
      const pw = auth.width ?? 24;
      const ph = auth.height ?? 32;
      const ppx = px - camX;
      const ppy = py - camY;
      const facingRight = auth.facingRight ?? true;
      const playerImg = pSprite ? loadImage(pSprite) : null;

      if (playerImg) {
        ctx.save();
        if (!facingRight) {
          ctx.translate(ppx + pw, ppy);
          ctx.scale(-1, 1);
          ctx.drawImage(playerImg, 0, 0, pw, ph);
        } else {
          ctx.drawImage(playerImg, ppx, ppy, pw, ph);
        }
        ctx.restore();
      } else {
        ctx.fillStyle = PLAYER_COLOR;
        const radius = Math.min(pw, ph) * 0.25;
        ctx.beginPath();
        ctx.moveTo(ppx + radius, ppy);
        ctx.lineTo(ppx + pw - radius, ppy);
        ctx.quadraticCurveTo(ppx + pw, ppy, ppx + pw, ppy + radius);
        ctx.lineTo(ppx + pw, ppy + ph - radius);
        ctx.quadraticCurveTo(ppx + pw, ppy + ph, ppx + pw - radius, ppy + ph);
        ctx.lineTo(ppx + radius, ppy + ph);
        ctx.quadraticCurveTo(ppx, ppy + ph, ppx, ppy + ph - radius);
        ctx.lineTo(ppx, ppy + radius);
        ctx.quadraticCurveTo(ppx, ppy, ppx + radius, ppy);
        ctx.fill();

        const eyeY = ppy + ph * 0.3;
        const eyeSize = 3;
        const eyeOffsetX = facingRight ? pw * 0.55 : pw * 0.2;
        ctx.fillStyle = PLAYER_EYE_COLOR;
        ctx.beginPath();
        ctx.arc(ppx + eyeOffsetX, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ppx + eyeOffsetX + 7, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw ActiveEffect[] — world-space coords, faded by ttl
      for (const fx of fxList) {
        const fxScreenX = fx.x - camX;
        const fxScreenY = fx.y - camY;
        const alpha = Math.min(1, fx.ttl / 4);
        const prev = ctx.globalAlpha;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffe066';
        ctx.beginPath();
        ctx.arc(fxScreenX, fxScreenY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = prev;
      }
    };

    return interp.startLoop(drawFrame);
  // startLoop is stable (memoized with useCallback); loadImage changes when
  // loadedImages state flips, which re-starts the loop to pick up new sprites.
  }, [interp.startLoop, loadImage]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: canvasWidth, height: canvasHeight }}
      className={cn('block rounded-container border border-border/10', className)}
      data-testid="platformer-canvas"
      tabIndex={0}
    />
  );
}

PlatformerCanvas.displayName = 'PlatformerCanvas';
