/**
 * TraitWarsGame Stories
 * 
 * Complete game template demonstration.
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { TraitWarsGame } from './TraitWarsGame';
import { GameUnit } from '../types/game';
import { Box } from '@almadar/ui';

const meta: Meta<typeof TraitWarsGame> = {
    title: 'Trait Wars/Templates/TraitWarsGame',
    component: TraitWarsGame,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Full game with all features
const standardUnits: GameUnit[] = [
    // Player team
    {
        id: 'player-knight',
        name: 'Sir Galahad',
        characterType: 'knight',
        team: 'player',
        position: { x: 1, y: 3 },
        health: 100,
        maxHealth: 100,
        movement: 2,
        attack: 15,
        defense: 10,
        traits: [{ name: 'Berserker', currentState: 'idle', states: ['idle', 'defending', 'enraged', 'exhausted'], cooldown: 0 }],
    },
    {
        id: 'player-mage',
        name: 'Merlin',
        characterType: 'mage',
        team: 'player',
        position: { x: 0, y: 4 },
        health: 60,
        maxHealth: 60,
        movement: 1,
        attack: 25,
        defense: 3,
        traits: [{ name: 'Spellweaver', currentState: 'preparing', states: ['preparing', 'casting', 'recovering'], cooldown: 0 }],
    },
    {
        id: 'player-healer',
        name: 'Sister Mary',
        characterType: 'healer',
        team: 'player',
        position: { x: 2, y: 4 },
        health: 50,
        maxHealth: 50,
        movement: 2,
        attack: 5,
        defense: 5,
        traits: [{ name: 'Divine Grace', currentState: 'ready', states: ['ready', 'channeling', 'cooldown'], cooldown: 0 }],
    },
    // Enemy team
    {
        id: 'enemy-warrior',
        name: 'Dark Knight',
        characterType: 'warrior',
        team: 'enemy',
        position: { x: 6, y: 1 },
        health: 90,
        maxHealth: 90,
        movement: 2,
        attack: 12,
        defense: 12,
        traits: [{ name: 'Berserker', currentState: 'defending', states: ['idle', 'defending', 'enraged', 'exhausted'], cooldown: 0 }],
    },
    {
        id: 'enemy-skeleton',
        name: 'Bone Mage',
        characterType: 'skeleton',
        team: 'enemy',
        position: { x: 7, y: 2 },
        health: 45,
        maxHealth: 45,
        movement: 1,
        attack: 20,
        defense: 2,
        traits: [{ name: 'Spellweaver', currentState: 'preparing', states: ['preparing', 'casting', 'recovering'], cooldown: 0 }],
    },
    {
        id: 'enemy-ghost',
        name: 'Phantom',
        characterType: 'ghost',
        team: 'enemy',
        position: { x: 6, y: 3 },
        health: 35,
        maxHealth: 35,
        movement: 3,
        attack: 10,
        defense: 1,
        traits: [{ name: 'Ethereal', currentState: 'hidden', states: ['hidden', 'attacking'], cooldown: 0 }],
    },
];

export const FullGame: Story = {
    render: () => (
        <TraitWarsGame
            initialUnits={standardUnits}
            boardWidth={8}
            boardHeight={6}
            tileSize={48}
            showTutorial={true}
            onGameEnd={(result) => console.log('Game ended:', result)}
        />
    ),
};

// Tutorial scenario - 1v1
const tutorialUnits: GameUnit[] = [
    {
        id: 'player-knight',
        name: 'Your Knight',
        characterType: 'knight',
        team: 'player',
        position: { x: 1, y: 2 },
        health: 100,
        maxHealth: 100,
        movement: 2,
        attack: 15,
        defense: 10,
        traits: [{ name: 'Berserker', currentState: 'idle', states: ['idle', 'defending', 'enraged', 'exhausted'], cooldown: 0 }],
    },
    {
        id: 'enemy-skeleton',
        name: 'Training Dummy',
        characterType: 'skeleton',
        team: 'enemy',
        position: { x: 4, y: 2 },
        health: 30,
        maxHealth: 30,
        movement: 1,
        attack: 5,
        defense: 2,
        traits: [{ name: 'Undead', currentState: 'idle', states: ['idle', 'attacking'], cooldown: 0 }],
    },
];

// Simple tutorial (existing)
export const Tutorial: Story = {
    render: () => (
        <TraitWarsGame
            initialUnits={tutorialUnits}
            boardWidth={6}
            boardHeight={5}
            tileSize={56}
            showTutorial={true}
        />
    ),
};

// ============================================================================
// GUIDED TUTORIAL - Step-by-step instructions
// ============================================================================

import { useState } from 'react';
import { Typography } from '@almadar/ui';
import { Button } from '@almadar/ui';

interface TutorialStep {
    title: string;
    instruction: string;
    hint: string;
    highlight?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        title: '👋 Welcome to Trait Wars!',
        instruction: 'This game is about understanding enemy state machines to predict their moves.',
        hint: 'Click "Next" to begin the tutorial.',
    },
    {
        title: '👁️ Step 1: Observation Phase',
        instruction: 'Each turn starts with the OBSERVATION phase. Use this time to study enemy traits.',
        hint: 'Hover over the enemy "Training Dummy" to see its state machine!',
        highlight: 'enemy',
    },
    {
        title: '📊 Step 2: Reading State Machines',
        instruction: 'When you hover over an enemy, the left sidebar shows their trait\'s state machine. The current state is highlighted.',
        hint: 'Look for the 🔮 prediction hints that show what events lead to what states.',
        highlight: 'sidebar',
    },
    {
        title: '🎯 Step 3: Planning Phase',
        instruction: 'Click "Next Phase" to enter PLANNING. Now you can select your units and choose actions.',
        hint: 'Click the "Next Phase" button in the left sidebar.',
        highlight: 'phase-button',
    },
    {
        title: '🏃 Step 4: Selecting Your Unit',
        instruction: 'Click on "Your Knight" (the blue unit) to select it.',
        hint: 'Green tiles show where you can move. Red highlights show attack targets.',
        highlight: 'player-unit',
    },
    {
        title: '⚔️ Step 5: Moving and Attacking',
        instruction: 'Click a green tile to move, or click an adjacent enemy to attack. Move closer to the Training Dummy!',
        hint: 'You need to be adjacent (next to) an enemy to attack them.',
        highlight: 'valid-moves',
    },
    {
        title: '🔥 Step 6: Trait Transitions',
        instruction: 'When you attack, traits may change! Watch the combat log for state changes like "idle → attacking".',
        hint: 'The Berserker trait becomes "enraged" when HP drops below 50% - more damage but becomes exhausted!',
        highlight: 'combat-log',
    },
    {
        title: '⏰ Step 7: Tick Phase',
        instruction: 'After Execution, the TICK phase processes cooldowns. Some states transition automatically on TICK.',
        hint: '"exhausted" → "idle" happens on TICK. Time your attacks for when enemies are exhausted!',
        highlight: 'tick',
    },
    {
        title: '🏆 Step 8: Victory Condition',
        instruction: 'Defeat all enemies to win! Use your knowledge of their traits to outmaneuver them.',
        hint: 'Now defeat the Training Dummy to complete the tutorial!',
    },
];

function GuidedTutorialGame() {
    const [currentStep, setCurrentStep] = useState(0);
    const [showOverlay, setShowOverlay] = useState(true);
    const step = TUTORIAL_STEPS[currentStep];
    const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

    return (
        <Box className="relative">
            {/* Tutorial overlay */}
            {showOverlay && (
                <Box className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-transparent p-4">
                    <Box className="max-w-2xl mx-auto bg-gray-800 rounded-xl p-6 border-2 border-yellow-500 shadow-2xl">
                        {/* Step counter */}
                        <Box className="flex items-center justify-between mb-4">
                            <Typography variant="caption" className="text-yellow-400">
                                Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                            </Typography>
                            <Box className="flex gap-1">
                                {TUTORIAL_STEPS.map((_, i) => (
                                    <Box
                                        key={i}
                                        className={`w-2 h-2 rounded-full ${i <= currentStep ? 'bg-yellow-400' : 'bg-gray-600'}`}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* Title */}
                        <Typography variant="h5" className="text-white font-bold mb-3">
                            {step.title}
                        </Typography>

                        {/* Instruction */}
                        <Typography variant="body1" className="text-gray-300 mb-4">
                            {step.instruction}
                        </Typography>

                        {/* Hint box */}
                        <Box className="bg-blue-900/50 border border-blue-500/50 rounded-lg p-3 mb-4">
                            <Typography variant="body2" className="text-blue-300">
                                💡 <strong>Hint:</strong> {step.hint}
                            </Typography>
                        </Box>

                        {/* Navigation */}
                        <Box className="flex justify-between">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                disabled={currentStep === 0}
                            >
                                ← Previous
                            </Button>
                            <Box className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setShowOverlay(false)}
                                >
                                    Hide Tutorial
                                </Button>
                                {!isLastStep ? (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => setCurrentStep(currentStep + 1)}
                                    >
                                        Next →
                                    </Button>
                                ) : (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => setShowOverlay(false)}
                                    >
                                        Start Playing! 🎮
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Show tutorial button when hidden */}
            {!showOverlay && (
                <Box className="fixed top-4 right-4 z-50">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowOverlay(true)}
                    >
                        📖 Show Tutorial
                    </Button>
                </Box>
            )}

            {/* The actual game */}
            <TraitWarsGame
                initialUnits={tutorialUnits}
                boardWidth={6}
                boardHeight={5}
                tileSize={56}
                showTutorial={true}
            />
        </Box>
    );
}

export const GuidedTutorial: Story = {
    render: () => <GuidedTutorialGame />,
    parameters: {
        docs: {
            description: {
                story: 'An interactive step-by-step tutorial that teaches you how to play Trait Wars.',
            },
        },
    },
};

// Boss battle
const bossUnits: GameUnit[] = [
    {
        id: 'player-knight',
        name: 'Vanguard',
        characterType: 'knight',
        team: 'player',
        position: { x: 2, y: 5 },
        health: 120,
        maxHealth: 120,
        movement: 2,
        attack: 18,
        defense: 15,
        traits: [{ name: 'Berserker', currentState: 'idle', states: ['idle', 'defending', 'enraged', 'exhausted'], cooldown: 0 }],
    },
    {
        id: 'player-mage',
        name: 'Archmage',
        characterType: 'mage',
        team: 'player',
        position: { x: 1, y: 6 },
        health: 70,
        maxHealth: 70,
        movement: 1,
        attack: 30,
        defense: 5,
        traits: [{ name: 'Spellweaver', currentState: 'preparing', states: ['preparing', 'casting', 'recovering'], cooldown: 0 }],
    },
    {
        id: 'player-healer',
        name: 'High Priest',
        characterType: 'healer',
        team: 'player',
        position: { x: 3, y: 6 },
        health: 60,
        maxHealth: 60,
        movement: 2,
        attack: 8,
        defense: 8,
        traits: [{ name: 'Divine Grace', currentState: 'ready', states: ['ready', 'channeling', 'cooldown'], cooldown: 0 }],
    },
    {
        id: 'boss-demon',
        name: '🔥 DEMON LORD 🔥',
        characterType: 'demon',
        team: 'enemy',
        position: { x: 4, y: 1 },
        health: 250,
        maxHealth: 250,
        movement: 1,
        attack: 35,
        defense: 20,
        traits: [{ name: 'Berserker', currentState: 'idle', states: ['idle', 'defending', 'enraged', 'exhausted'], cooldown: 0 }],
    },
];

export const BossBattle: Story = {
    render: () => (
        <TraitWarsGame
            initialUnits={bossUnits}
            boardWidth={8}
            boardHeight={8}
            tileSize={44}
            showTutorial={false}
        />
    ),
};

// No tutorial - experienced mode
export const ExperiencedMode: Story = {
    render: () => (
        <TraitWarsGame
            initialUnits={standardUnits}
            boardWidth={8}
            boardHeight={6}
            tileSize={48}
            showTutorial={false}
        />
    ),
};
