import * as React from 'react';
import { useRef, useEffect, useCallback } from 'react';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { bindCanvasCapture, updateAssetStatus } from '../../../lib/verificationRegistry';

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
  playerSprite?: string;
  /** Map of platform type to tile sprite URL */
  tileSprites?: Record<string, string>;
  /** Background image URL */
  backgroundImage?: string;
  /** Base URL prefix for asset URLs */
  assetBaseUrl?: string;
  /** Event names for keyboard controls */
  leftEvent?: string;
  rightEvent?: string;
  jumpEvent?: string;
  stopEvent?: string;
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
  platforms = [],
  worldWidth = 800,
  worldHeight = 400,
  canvasWidth = 800,
  canvasHeight = 400,
  followCamera = true,
  bgColor,
  playerSprite,
  tileSprites,
  backgroundImage,
  assetBaseUrl = '',
  leftEvent = 'MOVE_LEFT',
  rightEvent = 'MOVE_RIGHT',
  jumpEvent = 'JUMP',
  stopEvent = 'STOP',
  className,
}: PlatformerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const eventBus = useEventBus();
  const keysRef = useRef<Set<string>>(new Set());
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Load an image and cache it
  const loadImage = useCallback((url: string): HTMLImageElement | null => {
    const fullUrl = url.startsWith('http') ? url : `${assetBaseUrl}${url}`;
    const cached = imageCache.current.get(fullUrl);
    if (cached?.complete && cached.naturalWidth > 0) return cached;
    if (!cached) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = fullUrl;
      img.onload = () => { updateAssetStatus(fullUrl, 'loaded'); };
      img.onerror = () => { updateAssetStatus(fullUrl, 'failed'); };
      imageCache.current.set(fullUrl, img);
      updateAssetStatus(fullUrl, 'pending');
    }
    return null;
  }, [assetBaseUrl]);

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
    x: 50,
    y: 300,
    width: 24,
    height: 32,
    vx: 0,
    vy: 0,
    grounded: false,
    facingRight: true,
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

  // ── Canvas rendering ───────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);

    // Camera offset (follow player)
    let camX = 0;
    let camY = 0;
    if (followCamera) {
      camX = Math.max(0, Math.min(resolvedPlayer.x - canvasWidth / 2, worldWidth - canvasWidth));
      camY = Math.max(0, Math.min(resolvedPlayer.y - canvasHeight / 2 - 50, worldHeight - canvasHeight));
    }

    // Background: image, solid color, or gradient
    const bgImg = backgroundImage ? loadImage(backgroundImage) : null;
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);
    } else if (bgColor) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      grad.addColorStop(0, SKY_GRADIENT_TOP);
      grad.addColorStop(1, SKY_GRADIENT_BOTTOM);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // Grid lines
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    const gridSize = 32;
    for (let gx = -camX % gridSize; gx < canvasWidth; gx += gridSize) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, canvasHeight);
      ctx.stroke();
    }
    for (let gy = -camY % gridSize; gy < canvasHeight; gy += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(canvasWidth, gy);
      ctx.stroke();
    }

    // Platforms
    for (const plat of platforms) {
      const px = plat.x - camX;
      const py = plat.y - camY;
      const platType = plat.type ?? 'ground';
      const spriteUrl = tileSprites?.[platType];
      const tileImg = spriteUrl ? loadImage(spriteUrl) : null;

      if (tileImg) {
        // Tile the sprite across the platform width
        const tileW = tileImg.naturalWidth;
        const tileH = tileImg.naturalHeight;
        const scaleH = plat.height / tileH;
        const scaledW = tileW * scaleH;
        for (let tx = 0; tx < plat.width; tx += scaledW) {
          const drawW = Math.min(scaledW, plat.width - tx);
          const srcW = drawW / scaleH;
          ctx.drawImage(tileImg, 0, 0, srcW, tileH, px + tx, py, drawW, plat.height);
        }
      } else {
        const color = PLATFORM_COLORS[platType] ?? PLATFORM_COLORS.ground;
        ctx.fillStyle = color;
        ctx.fillRect(px, py, plat.width, plat.height);

        // Top highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(px, py, plat.width, 3);

        // Bottom shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(px, py + plat.height - 2, plat.width, 2);

        // Hazard stripes
        if (platType === 'hazard') {
          ctx.strokeStyle = '#e74c3c';
          ctx.lineWidth = 2;
          for (let sx = px; sx < px + plat.width; sx += 12) {
            ctx.beginPath();
            ctx.moveTo(sx, py);
            ctx.lineTo(sx + 6, py + plat.height);
            ctx.stroke();
          }
        }

        // Goal sparkle
        if (platType === 'goal') {
          ctx.fillStyle = 'rgba(241, 196, 15, 0.5)';
          ctx.beginPath();
          ctx.arc(px + plat.width / 2, py - 10, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Player character
    const pw = resolvedPlayer.width ?? 24;
    const ph = resolvedPlayer.height ?? 32;
    const ppx = resolvedPlayer.x - camX;
    const ppy = resolvedPlayer.y - camY;
    const facingRight = resolvedPlayer.facingRight ?? true;
    const playerImg = playerSprite ? loadImage(playerSprite) : null;

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
      // Fallback: colored rectangle with eyes
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
  });

  return (
    <canvas
      ref={canvasRef}
      style={{ width: canvasWidth, height: canvasHeight }}
      className={cn('block rounded-lg border border-white/10', className)}
      data-testid="platformer-canvas"
      tabIndex={0}
    />
  );
}

PlatformerCanvas.displayName = 'PlatformerCanvas';
