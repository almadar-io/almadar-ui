/**
 * SimulationControls
 *
 * Play/pause/step/reset controls with speed and parameter sliders.
 */

import React from 'react';
import type { Asset } from '@almadar/core';
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
    onPlay: () => void;
    onPause: () => void;
    onStep: () => void;
    onReset: () => void;
    onSpeedChange: (speed: number) => void;
    onParameterChange: (name: string, value: number) => void;
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
    assetManifest,
    className,
}: SimulationControlsProps): React.JSX.Element {
    const ui = assetManifest?.ui;
    return (
        <VStack gap="md" className={className}>
            <HStack gap="sm" align="center">
                {running ? (
                    <Button size="sm" variant="secondary" onClick={onPause}>
                        <GameIcon icon={Pause} assetUrl={ui?.['pause']} size="sm" />
                        Pause
                    </Button>
                ) : (
                    <Button size="sm" variant="primary" onClick={onPlay}>
                        <GameIcon icon={Play} assetUrl={ui?.['play']} size="sm" />
                        Play
                    </Button>
                )}
                <Button size="sm" variant="ghost" onClick={onStep} disabled={running}>
                    <GameIcon icon={SkipForward} assetUrl={ui?.['step']} size="sm" />
                    Step
                </Button>
                <Button size="sm" variant="ghost" onClick={onReset}>
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
                    onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
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
                        onChange={(e) => onParameterChange(name, parseFloat(e.target.value))}
                        className="w-full"
                    />
                </VStack>
            ))}
        </VStack>
    );
}

SimulationControls.displayName = 'SimulationControls';
