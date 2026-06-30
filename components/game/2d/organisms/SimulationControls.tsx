/**
 * SimulationControls
 *
 * Play/pause/step/reset controls with speed and parameter sliders.
 */

import React from 'react';
import { useEventBus } from '../../../../hooks/useEventBus';
import type { Asset, EventEmit } from '@almadar/core';
import { HStack, VStack, Button, Typography } from '../../../core/atoms/index';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { GameIcon } from '../atoms/GameIcon';

export interface SimulationParameter {
    value: number;
    min: number;
    max: number;
    step: number;
    label: string;
}

export interface SimulationControlsProps {
    running: boolean;
    speed: number;
    parameters: Record<string, SimulationParameter>;
    onPlay?: () => void;
    onPause?: () => void;
    onStep?: () => void;
    onReset?: () => void;
    onSpeedChange?: (speed: number) => void;
    onParameterChange?: (name: string, value: number) => void;
    /** Emits UI:{playEvent} on play */
    playEvent?: EventEmit<Record<string, never>>;
    /** Emits UI:{pauseEvent} on pause */
    pauseEvent?: EventEmit<Record<string, never>>;
    /** Emits UI:{stepEvent} on step */
    stepEvent?: EventEmit<Record<string, never>>;
    /** Emits UI:{resetEvent} on reset */
    resetEvent?: EventEmit<Record<string, never>>;
    /** Emits UI:{speedChangeEvent} with { speed } on speed change */
    speedChangeEvent?: EventEmit<{ speed: number }>;
    /** Emits UI:{parameterChangeEvent} with { name, value } on parameter change */
    parameterChangeEvent?: EventEmit<{ name: string; value: number }>;
    /** Optional per-semantic-key asset overrides for icons (play/pause/step/reset). */
    assetManifest?: { ui?: Record<string, Asset> };
    className?: string;
}

export function SimulationControls({
    running,
    speed,
    parameters,
    onPlay,
    onPause,
    onStep,
    onReset,
    onSpeedChange,
    onParameterChange,
    playEvent,
    pauseEvent,
    stepEvent,
    resetEvent,
    speedChangeEvent,
    parameterChangeEvent,
    assetManifest,
    className,
}: SimulationControlsProps): React.JSX.Element {
    const eventBus = useEventBus();
    const ui = assetManifest?.ui;
    const handlePlay = () => { if (playEvent) eventBus.emit(`UI:${playEvent}`, {}); onPlay?.(); };
    const handlePause = () => { if (pauseEvent) eventBus.emit(`UI:${pauseEvent}`, {}); onPause?.(); };
    const handleStep = () => { if (stepEvent) eventBus.emit(`UI:${stepEvent}`, {}); onStep?.(); };
    const handleReset = () => { if (resetEvent) eventBus.emit(`UI:${resetEvent}`, {}); onReset?.(); };
    const handleSpeedChange = (s: number) => { if (speedChangeEvent) eventBus.emit(`UI:${speedChangeEvent}`, { speed: s }); onSpeedChange?.(s); };
    const handleParameterChange = (name: string, value: number) => { if (parameterChangeEvent) eventBus.emit(`UI:${parameterChangeEvent}`, { name, value }); onParameterChange?.(name, value); };
    return (
        <VStack gap="md" className={className}>
            <HStack gap="sm" align="center">
                {running ? (
                    <Button size="sm" variant="secondary" onClick={handlePause}>
                        <GameIcon icon={Pause} assetUrl={ui?.['pause']} size="sm" />
                        Pause
                    </Button>
                ) : (
                    <Button size="sm" variant="primary" onClick={handlePlay}>
                        <GameIcon icon={Play} assetUrl={ui?.['play']} size="sm" />
                        Play
                    </Button>
                )}
                <Button size="sm" variant="ghost" onClick={handleStep} disabled={running}>
                    <GameIcon icon={SkipForward} assetUrl={ui?.['step']} size="sm" />
                    Step
                </Button>
                <Button size="sm" variant="ghost" onClick={handleReset}>
                    <GameIcon icon={RotateCcw} assetUrl={ui?.['reset']} size="sm" />
                    Reset
                </Button>
            </HStack>

            <VStack gap="xs">
                <Typography variant="caption" color="muted">Speed: {speed.toFixed(1)}x</Typography>
                <input
                    type="range"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={speed}
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    className="w-full"
                />
            </VStack>

            {Object.entries(parameters).map(([name, param]) => (
                <VStack key={name} gap="xs">
                    <Typography variant="caption" color="muted">
                        {param.label}: {param.value.toFixed(2)}
                    </Typography>
                    <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={param.value}
                        onChange={(e) => handleParameterChange(name, parseFloat(e.target.value))}
                        className="w-full"
                    />
                </VStack>
            ))}
        </VStack>
    );
}

SimulationControls.displayName = 'SimulationControls';
