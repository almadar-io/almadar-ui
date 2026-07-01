/**
 * SimulationCanvas
 *
 * Pure renderer: paints the initial preset bodies and, when the `bodies` prop
 * is provided, interpolates externally-driven snapshots to 60fps.
 * Physics integration is owned by the LOLO animTick — this canvas does NOT
 * self-advance positions.
 */

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { cn } from '../../../../lib/cn';
import { Box } from '../../../core/atoms/index';
import { bindCanvasCapture } from '../../../../lib/verificationRegistry';
import type { PhysicsPreset, PhysicsBody } from '../../shared/lib/physicsTypes';
import { projectileMotion, pendulum, springOscillator } from '../../shared/lib/physicsPresets';
import { useRenderInterpolation } from '../../../../hooks/useRenderInterpolation';

export type PhysicsPresetId = 'mechanics-projectile' | 'mechanics-pendulum' | 'mechanics-spring';

const PRESET_BY_ID: Record<PhysicsPresetId, PhysicsPreset> = {
    'mechanics-projectile': projectileMotion,
    'mechanics-pendulum':   pendulum,
    'mechanics-spring':     springOscillator,
};

function resolvePreset(preset: PhysicsPresetId | PhysicsPreset): PhysicsPreset {
    if (typeof preset !== 'string') return preset;
    return PRESET_BY_ID[preset] ?? projectileMotion;
}

export interface SimulationCanvasProps {
    preset: PhysicsPresetId | PhysicsPreset;
    width?: number;
    height?: number;
    running: boolean;
    speed?: number;
    /** External model-authoritative body snapshots (~30Hz). When provided,
     *  the self-simulation loop is bypassed and positions are interpolated
     *  to 60fps between consecutive snapshots. */
    bodies?: readonly Pick<PhysicsBody, 'id' | 'x' | 'y'>[];
    className?: string;
}

export function SimulationCanvas({
    preset: presetProp,
    width = 600,
    height = 400,
    bodies: externalBodies,
    className,
}: SimulationCanvasProps): React.JSX.Element {
    const preset = useMemo(() => resolvePreset(presetProp), [presetProp]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bodiesRef = useRef<PhysicsBody[]>(structuredClone(preset.bodies));

    // Interpolation bridge — active only when externalBodies prop is provided.
    const interp = useRenderInterpolation<{ id: string; x: number; y: number }>();

    // Reset bodies when preset changes
    useEffect(() => {
        bodiesRef.current = structuredClone(preset.bodies);
    }, [preset]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const bodies = bodiesRef.current;

        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = preset.backgroundColor ?? '#1a1a2e';
        ctx.fillRect(0, 0, width, height);

        // Draw constraints/springs
        if (preset.constraints) {
            for (const c of preset.constraints) {
                const a = bodies[c.bodyA];
                const b = bodies[c.bodyB];
                if (a && b) {
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = '#533483';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([4, 4]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }
        }

        // Draw bodies
        for (const body of bodies) {
            ctx.beginPath();
            ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
            ctx.fillStyle = body.color ?? '#e94560';
            ctx.fill();

            // Velocity vector
            if (preset.showVelocity) {
                ctx.beginPath();
                ctx.moveTo(body.x, body.y);
                ctx.lineTo(body.x + body.vx * 0.1, body.y + body.vy * 0.1);
                ctx.strokeStyle = '#16213e';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }, [width, height, preset]);

    // Push external snapshots to the interpolation bridge.
    useEffect(() => {
        if (!externalBodies) return;
        interp.onSnapshot(externalBodies.map((b) => ({ id: b.id, x: b.x, y: b.y })));
    }, [externalBodies]);

    // Stable refs so the interpolated draw closure doesn't go stale.
    const presetRef = useRef(preset);
    presetRef.current = preset;
    const widthRef = useRef(width);
    widthRef.current = width;
    const heightRef = useRef(height);
    heightRef.current = height;

    // Interpolated rAF loop — used when externalBodies prop is present.
    useEffect(() => {
        if (!externalBodies) return;

        const drawInterpolated = (positions: Map<string, { x: number; y: number }>) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const bodies = bodiesRef.current;
            const p = presetRef.current;
            const w = widthRef.current;
            const h = heightRef.current;

            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = p.backgroundColor ?? '#1a1a2e';
            ctx.fillRect(0, 0, w, h);

            if (p.constraints) {
                for (const c of p.constraints) {
                    const a = bodies[c.bodyA];
                    const b = bodies[c.bodyB];
                    if (a && b) {
                        const aPos = positions.get(a.id) ?? a;
                        const bPos = positions.get(b.id) ?? b;
                        ctx.beginPath();
                        ctx.moveTo(aPos.x, aPos.y);
                        ctx.lineTo(bPos.x, bPos.y);
                        ctx.strokeStyle = '#533483';
                        ctx.lineWidth = 1;
                        ctx.setLineDash([4, 4]);
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }
                }
            }

            for (const body of bodies) {
                const pos = positions.get(body.id) ?? body;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, body.radius, 0, Math.PI * 2);
                ctx.fillStyle = body.color ?? '#e94560';
                ctx.fill();

                if (p.showVelocity) {
                    ctx.beginPath();
                    ctx.moveTo(pos.x, pos.y);
                    ctx.lineTo(pos.x + body.vx * 0.1, pos.y + body.vy * 0.1);
                    ctx.strokeStyle = '#16213e';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        };

        return interp.startLoop(drawInterpolated);
    }, [externalBodies !== undefined, interp.startLoop]);

    // Paint the initial preset bodies so the canvas is never blank on mount.
    useEffect(() => {
        draw();
    }, [draw]);

    // -- Verification bridge: register canvas frame capture --
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        bindCanvasCapture(() => canvas.toDataURL('image/png'));
        return () => { bindCanvasCapture(() => null); };
    }, []);

    return (
        <Box className={cn('flex justify-center', className)}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="rounded-container block max-w-full h-auto"
            />
        </Box>
    );
}

SimulationCanvas.displayName = 'SimulationCanvas';
