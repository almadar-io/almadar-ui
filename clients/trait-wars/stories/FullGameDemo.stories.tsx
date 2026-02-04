/**
 * Full Game Demo Story
 * 
 * Complete game experience with scenario selection and trait visibility.
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useCallback } from 'react';
import { Box } from '../../../components/atoms/Box';
import { Typography } from '../../../components/atoms/Typography';
import { Button } from '../../../components/atoms/Button';
import { GameBoardWithTraits, CombatLogEntry } from '../organisms/GameBoardWithTraits';
import { ScenarioSelector } from '../templates/ScenarioSelector';
import { GAME_SCENARIOS, GameScenario } from '../templates/scenarios';
import { GameState } from '../types/game';
import { cn } from '../../../lib/cn';

const meta: Meta = {
    title: 'Trait Wars/Full Game Demo',
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
};

export default meta;

// Menu screen
function MenuScreen({ onStart }: { onStart: (scenario: GameScenario) => void }) {
    const [selectedScenario, setSelectedScenario] = useState<GameScenario | null>(null);

    return (
        <Box className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 p-8">
            {/* Title */}
            <Box className="text-center mb-8">
                <Typography variant="h2" className="text-white font-bold mb-2">
                    ⚔️ TRAIT WARS ⚔️
                </Typography>
                <Typography variant="body1" className="text-gray-400">
                    A Strategy Game Powered by State Machines
                </Typography>
            </Box>

            {/* Scenario selector */}
            <Box className="max-w-2xl mx-auto mb-8">
                <ScenarioSelector
                    onSelectScenario={(s) => setSelectedScenario(s)}
                    selectedId={selectedScenario?.id}
                />
            </Box>

            {/* Start button */}
            {selectedScenario && (
                <Box className="text-center">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() => onStart(selectedScenario)}
                        className="px-8 py-4 text-xl"
                    >
                        ⚔️ BEGIN BATTLE ⚔️
                    </Button>
                </Box>
            )}

            {/* Instructions */}
            <Box className="mt-12 max-w-lg mx-auto bg-gray-800 rounded-lg p-4">
                <Typography variant="body2" className="text-white font-bold mb-2">
                    How to Play:
                </Typography>
                <ul className="text-gray-400 text-sm space-y-1">
                    <li>• <span className="text-blue-400">Click</span> a unit to select it</li>
                    <li>• <span className="text-green-400">Green tiles</span> show valid moves</li>
                    <li>• <span className="text-red-400">Red highlights</span> show attack targets</li>
                    <li>• <span className="text-yellow-400">Watch traits</span> change during combat!</li>
                </ul>
            </Box>
        </Box>
    );
}

// Game screen
function GameScreen({
    scenario,
    onBack
}: {
    scenario: GameScenario;
    onBack: () => void;
}) {
    const scenarioData = scenario.create();
    const [gameState, setGameState] = useState<GameState>(scenarioData.state);
    const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);
    const [showObjectives, setShowObjectives] = useState(true);

    const handleCombatLog = useCallback((entry: CombatLogEntry) => {
        setCombatLog(prev => [...prev, entry]);
    }, []);

    // Check win/lose conditions
    const playerUnits = Object.values(gameState.units).filter(u => u.team === 'player');
    const enemyUnits = Object.values(gameState.units).filter(u => u.team === 'enemy');
    const isVictory = enemyUnits.length === 0;
    const isDefeat = playerUnits.length === 0;

    return (
        <Box className="min-h-screen bg-gray-950">
            {/* Header */}
            <Box className="bg-gray-800 p-4 flex items-center justify-between">
                <Button variant="secondary" size="sm" onClick={onBack}>
                    ← Back to Menu
                </Button>
                <Typography variant="h6" className="text-white">
                    {scenario.name}
                </Typography>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowObjectives(!showObjectives)}
                >
                    {showObjectives ? 'Hide' : 'Show'} Objectives
                </Button>
            </Box>

            {/* Victory/Defeat overlay */}
            {(isVictory || isDefeat) && (
                <Box className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <Box className="text-center">
                        <Typography
                            variant="h2"
                            className={cn(
                                'font-bold mb-4',
                                isVictory ? 'text-green-400' : 'text-red-400'
                            )}
                        >
                            {isVictory ? '🏆 VICTORY! 🏆' : '💀 DEFEAT 💀'}
                        </Typography>
                        <Button variant="primary" onClick={onBack}>
                            Return to Menu
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Main content */}
            <Box className="flex">
                {/* Objectives panel */}
                {showObjectives && (
                    <Box className="w-64 bg-gray-800 p-4 border-r border-gray-700">
                        <Typography variant="body2" className="text-white font-bold mb-2">
                            📋 Objectives
                        </Typography>
                        <ul className="space-y-2">
                            {scenarioData.objectives.map((obj, i) => (
                                <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                                    <span className="text-yellow-400">•</span>
                                    {obj}
                                </li>
                            ))}
                        </ul>

                        <Box className="mt-4 pt-4 border-t border-gray-700">
                            <Typography variant="caption" className="text-gray-500">
                                {scenarioData.description}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Game board */}
                <Box className="flex-1 p-4">
                    <GameBoardWithTraits
                        gameState={gameState}
                        onStateChange={setGameState}
                        combatLog={combatLog}
                        onCombatLog={handleCombatLog}
                        tileSize={48}
                        showTraitPanel={true}
                    />
                </Box>
            </Box>
        </Box>
    );
}

// Main demo component
function TraitWarsDemo() {
    const [currentScenario, setCurrentScenario] = useState<GameScenario | null>(null);

    if (currentScenario) {
        return (
            <GameScreen
                scenario={currentScenario}
                onBack={() => setCurrentScenario(null)}
            />
        );
    }

    return <MenuScreen onStart={setCurrentScenario} />;
}

export const FullGame: StoryObj = {
    render: () => <TraitWarsDemo />,
};

// Direct scenarios
export const TutorialScenario: StoryObj = {
    render: () => {
        const scenario = GAME_SCENARIOS.find(s => s.id === 'tutorial')!;
        return (
            <Box className="p-4 bg-gray-950 min-h-screen">
                <GameScreen scenario={scenario} onBack={() => { }} />
            </Box>
        );
    },
};

export const BossBattle: StoryObj = {
    render: () => {
        const scenario = GAME_SCENARIOS.find(s => s.id === 'boss')!;
        return (
            <Box className="p-4 bg-gray-950 min-h-screen">
                <GameScreen scenario={scenario} onBack={() => { }} />
            </Box>
        );
    },
};
