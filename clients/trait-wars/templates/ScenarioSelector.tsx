/**
 * Scenario Selector Component
 * 
 * UI for selecting and starting different game scenarios.
 */

import React from 'react';
import {
  Box,
  Typography,
  Button,
  cn,
} from '@almadar/ui';
import { GAME_SCENARIOS, GameScenario } from './scenarios';

export interface ScenarioSelectorProps {
    /** Called when a scenario is selected */
    onSelectScenario: (scenario: GameScenario) => void;
    /** Currently selected scenario ID */
    selectedId?: string;
    /** Additional CSS classes */
    className?: string;
}

const difficultyColors = {
    tutorial: 'bg-green-500/20 text-green-400 border-green-500',
    easy: 'bg-blue-500/20 text-blue-400 border-blue-500',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
    hard: 'bg-orange-500/20 text-orange-400 border-orange-500',
    boss: 'bg-red-500/20 text-red-400 border-red-500',
};

const difficultyLabels = {
    tutorial: '📖 Tutorial',
    easy: '🌱 Easy',
    medium: '⚔️ Medium',
    hard: '🔥 Hard',
    boss: '👹 Boss',
};

export function ScenarioSelector({
    onSelectScenario,
    selectedId,
    className,
}: ScenarioSelectorProps): JSX.Element {
    return (
        <Box className={cn('flex flex-col gap-4', className)}>
            <Typography variant="h5" className="text-white font-bold">
                Select Scenario
            </Typography>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GAME_SCENARIOS.map((scenario) => (
                    <Box
                        key={scenario.id}
                        display="flex"
                        className={cn(
                            'flex-col p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
                            'hover:scale-102 hover:shadow-lg',
                            selectedId === scenario.id
                                ? 'border-yellow-400 bg-yellow-400/10'
                                : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                        )}
                        onClick={() => onSelectScenario(scenario)}
                    >
                        {/* Header */}
                        <Box display="flex" className="items-center justify-between mb-2">
                            <Typography variant="body1" className="text-white font-bold">
                                {scenario.name}
                            </Typography>
                            <Box
                                className={cn(
                                    'px-2 py-0.5 rounded-full text-xs font-medium border',
                                    difficultyColors[scenario.difficulty]
                                )}
                            >
                                {difficultyLabels[scenario.difficulty]}
                            </Box>
                        </Box>

                        {/* Description */}
                        <Typography variant="caption" className="text-gray-400">
                            {scenario.description}
                        </Typography>

                        {/* Play button */}
                        {selectedId === scenario.id && (
                            <Button
                                variant="primary"
                                size="sm"
                                className="mt-3 w-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectScenario(scenario);
                                }}
                            >
                                ▶ Start Battle
                            </Button>
                        )}
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

export default ScenarioSelector;
