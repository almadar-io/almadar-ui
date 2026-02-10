/**
 * CanvasEffect Component
 *
 * Renders animated visual effects as DOM overlays on the canvas.
 * Maps combat action types to particle/flash effects that play
 * at a specified position and auto-dismiss.
 *
 * Pattern: canvas-effect
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { cn } from '../../../lib/cn';
import { Box } from '../../atoms/Box';

/** Combat action types for visual effects */
export type CombatActionType =
    | 'melee'
    | 'ranged'
    | 'magic'
    | 'heal'
    | 'buff'
    | 'debuff'
    | 'shield'
    | 'aoe'
    | 'critical';

export interface CanvasEffectProps {
    /** The type of combat action to visualise */
    actionType: CombatActionType;
    /** Screen-space X position (center of the effect) */
    x: number;
    /** Screen-space Y position (center of the effect) */
    y: number;
    /** Duration in ms before auto-dismiss (default 800) */
    duration?: number;
    /** Optional intensity multiplier (1 = normal) */
    intensity?: number;
    /** Callback when the effect animation completes */
    onComplete?: () => void;
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
}

const ACTION_CONFIG: Record<CombatActionType, { emoji: string; color: string; label: string }> = {
    melee: { emoji: '⚔️', color: 'var(--color-error)', label: 'Slash' },
    ranged: { emoji: '🏹', color: 'var(--color-warning)', label: 'Arrow' },
    magic: { emoji: '✨', color: 'var(--color-primary)', label: 'Spell' },
    heal: { emoji: '💚', color: 'var(--color-success)', label: 'Heal' },
    buff: { emoji: '⬆️', color: 'var(--color-info)', label: 'Buff' },
    debuff: { emoji: '⬇️', color: 'var(--color-warning)', label: 'Debuff' },
    shield: { emoji: '🛡️', color: 'var(--color-info)', label: 'Shield' },
    aoe: { emoji: '💥', color: 'var(--color-error)', label: 'Explosion' },
    critical: { emoji: '🔥', color: 'var(--color-error)', label: 'Critical' },
};

export function CanvasEffect({
    actionType,
    x,
    y,
    duration = 800,
    intensity = 1,
    onComplete,
    className,
}: CanvasEffectProps): JSX.Element | null {
    const [visible, setVisible] = useState(true);
    const [phase, setPhase] = useState<'enter' | 'active' | 'exit'>('enter');
    const timerRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        const enterTimer = setTimeout(() => setPhase('active'), 100);
        const exitTimer = setTimeout(() => setPhase('exit'), duration * 0.7);
        const doneTimer = setTimeout(() => {
            setVisible(false);
            onComplete?.();
        }, duration);

        timerRef.current = doneTimer;
        return () => {
            clearTimeout(enterTimer);
            clearTimeout(exitTimer);
            clearTimeout(doneTimer);
        };
    }, [duration, onComplete]);

    if (!visible) return null;

    const config = ACTION_CONFIG[actionType];
    const scaleVal = phase === 'enter' ? 0.3 : phase === 'active' ? intensity : 0.5;
    const opacity = phase === 'exit' ? 0 : 1;

    return (
        <Box
            className={cn(
                'fixed pointer-events-none z-50 flex items-center justify-center',
                'transition-all ease-out',
                className,
            )}
            style={{
                left: x,
                top: y,
                transform: `translate(-50%, -50%) scale(${scaleVal})`,
                opacity,
                transitionDuration: phase === 'enter' ? '100ms' : '300ms',
            }}
        >
            {/* Glow ring */}
            <Box
                className="absolute rounded-full animate-ping"
                style={{
                    width: 48 * intensity,
                    height: 48 * intensity,
                    backgroundColor: config.color,
                    opacity: 0.25,
                }}
            />
            {/* Icon */}
            <span
                className="relative text-3xl drop-shadow-lg"
                style={{ fontSize: `${2 * intensity}rem` }}
                role="img"
                aria-label={config.label}
            >
                {config.emoji}
            </span>
        </Box>
    );
}

CanvasEffect.displayName = 'CanvasEffect';

export default CanvasEffect;
