'use client';
/**
 * `svg-stage` — the SVG host for the `svg-draw-*` family (DOM-rendered 2D boards).
 *
 * The flat-grid counterpart of `canvas-2d`: instead of painting `draw-*`
 * descriptors through the Painter2D seam, it mounts real SVG DOM — `svg-draw-shape`,
 * `svg-draw-group`, `svg-draw-text`, `svg-draw-shape-layer` children composed in
 * `.lolo`. Deliberately simpler than Canvas2D: no camera, no painter seam, no
 * minimap, no gestures hook — plain pointer handlers on the `<svg>`.
 *
 * Children read `SvgStageContext.tileSize` to convert grid-cell units to viewBox
 * units; outside a stage the context defaults to 1 (raw viewBox units).
 *
 * Interaction mirrors Canvas2D: pointer-up (with a 5px drag guard) emits
 * `tileClickEvent` `{ x, y }` in cell coordinates, hover emits `tileHoverEvent`,
 * leave emits `tileLeaveEvent` `{}`; `keyMap`/`keyUpMap` map `e.code` to semantic
 * `UI:*` events on window-scoped listeners.
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { EventEmit } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';

/** Grid-cell → viewBox-unit scale for the `svg-draw-*` children. */
export const SvgStageContext = React.createContext<{ tileSize: number }>({ tileSize: 1 });

export interface SvgStageProps {
    /** Grid width in cells. */
    cols: number;
    /** Grid height in cells. */
    rows: number;
    /** ViewBox units per cell (default 32); viewBox is `0 0 cols*tileSize rows*tileSize`. */
    tileSize?: number;
    /** Background rect fill (default `var(--color-background)`). */
    background?: string;
    /** Emitted as `UI:<event>` with `{ x, y }` cell coords on pointer up (<5px drag). */
    tileClickEvent?: EventEmit<{ x: number; y: number }>;
    /** Emitted as `UI:<event>` with `{ x, y }` cell coords on pointer move. */
    tileHoverEvent?: EventEmit<{ x: number; y: number }>;
    /** Emitted as `UI:<event>` with `{}` when the pointer leaves the stage. */
    tileLeaveEvent?: EventEmit<Record<string, never>>;
    /** Keyboard → semantic events: `e.code` → event name, emitted as `UI:<event>` with `{}`. */
    keyMap?: Record<string, string>;
    /** Keyup counterpart of `keyMap`. */
    keyUpMap?: Record<string, string>;
    /** Additional CSS classes */
    className?: string;
    children?: React.ReactNode;
}

export function SvgStage({
    cols,
    rows,
    tileSize = 32,
    background = 'var(--color-background)',
    tileClickEvent,
    tileHoverEvent,
    tileLeaveEvent,
    keyMap,
    keyUpMap,
    className,
    children,
}: SvgStageProps): React.JSX.Element {
    const eventBus = useEventBus();
    const svgRef = useRef<SVGSVGElement>(null);
    const pointerDownRef = useRef<{ clientX: number; clientY: number } | null>(null);

    // Client px → cell coord via the rendered rect + the xMidYMid-meet scale/offset.
    const cellFromClient = useCallback((clientX: number, clientY: number): { x: number; y: number } | null => {
        const svg = svgRef.current;
        if (!svg) return null;
        const rect = svg.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return null;
        const vbW = cols * tileSize;
        const vbH = rows * tileSize;
        const meet = Math.min(rect.width / vbW, rect.height / vbH);
        const offsetX = (rect.width - vbW * meet) / 2;
        const offsetY = (rect.height - vbH * meet) / 2;
        const svgX = (clientX - rect.left - offsetX) / meet;
        const svgY = (clientY - rect.top - offsetY) / meet;
        return {
            x: Math.min(Math.max(Math.floor(svgX / tileSize), 0), cols - 1),
            y: Math.min(Math.max(Math.floor(svgY / tileSize), 0), rows - 1),
        };
    }, [cols, rows, tileSize]);

    const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
        pointerDownRef.current = { clientX: e.clientX, clientY: e.clientY };
    }, []);

    const handlePointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
        const down = pointerDownRef.current;
        pointerDownRef.current = null;
        if (!tileClickEvent) return;
        if (down && Math.hypot(e.clientX - down.clientX, e.clientY - down.clientY) > 5) return;
        const cell = cellFromClient(e.clientX, e.clientY);
        if (cell) eventBus.emit(`UI:${tileClickEvent}`, cell);
    }, [cellFromClient, tileClickEvent, eventBus]);

    const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
        if (!tileHoverEvent) return;
        const cell = cellFromClient(e.clientX, e.clientY);
        if (cell) eventBus.emit(`UI:${tileHoverEvent}`, cell);
    }, [cellFromClient, tileHoverEvent, eventBus]);

    const handlePointerLeave = useCallback(() => {
        pointerDownRef.current = null;
        if (tileLeaveEvent) eventBus.emit(`UI:${tileLeaveEvent}`, {});
    }, [tileLeaveEvent, eventBus]);

    // Keyboard → semantic events via keyMap/keyUpMap (device-agnostic input layer).
    useEffect(() => {
        if (!keyMap && !keyUpMap) return;
        const onDown = (e: KeyboardEvent) => {
            const ev = keyMap?.[e.code];
            if (ev) { eventBus.emit(`UI:${ev}`, {}); e.preventDefault(); }
        };
        const onUp = (e: KeyboardEvent) => {
            const ev = keyUpMap?.[e.code];
            if (ev) eventBus.emit(`UI:${ev}`, {});
        };
        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup', onUp);
        return () => {
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
        };
    }, [keyMap, keyUpMap, eventBus]);

    // Visible affordance only (delivery above is window-scoped): a keyboard-driven
    // board's stage should read as the focused surface as soon as it mounts.
    useEffect(() => {
        if (!keyMap && !keyUpMap) return;
        svgRef.current?.focus();
    }, [keyMap, keyUpMap]);

    const stageContext = useMemo(() => ({ tileSize }), [tileSize]);

    return (
        <svg
            ref={svgRef}
            data-testid="svg-stage"
            viewBox={`0 0 ${cols * tileSize} ${rows * tileSize}`}
            preserveAspectRatio="xMidYMid meet"
            className={cn('block h-full w-full', className)}
            tabIndex={keyMap || keyUpMap ? 0 : undefined}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
        >
            <rect width={cols * tileSize} height={rows * tileSize} fill={background} />
            <SvgStageContext.Provider value={stageContext}>
                {children}
            </SvgStageContext.Provider>
        </svg>
    );
}

SvgStage.displayName = 'SvgStage';

export default SvgStage;
