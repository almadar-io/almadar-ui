'use client';
import * as React from 'react';
import { cn } from '../../../lib/cn';
import { WaypointMarker } from '../../atoms/game/WaypointMarker';
import { ProgressBar } from '../../atoms/ProgressBar';
import { Typography } from '../../atoms/Typography';
import { Box } from '../../atoms/Box';
import { VStack } from '../../atoms/Stack';

export interface Quest {
  id: string;
  title: string;
  progress: number;
  maxProgress: number;
  active?: boolean;
  completed?: boolean;
}

export interface QuestTrackerProps {
  /** Array of quests to display */
  quests: Quest[];
  /** ID of the currently active quest */
  activeQuestId?: string;
  /** Additional CSS classes */
  className?: string;
}

export function QuestTracker({
  quests,
  activeQuestId,
  className,
}: QuestTrackerProps) {
  return (
    <VStack gap="sm" className={className}>
      {quests.map((quest) => {
        const isActive = quest.active ?? quest.id === activeQuestId;
        const isCompleted = quest.completed ?? false;

        return (
          <Box
            key={quest.id}
            className={cn(
              'flex items-start gap-3 rounded-lg px-3 py-2 transition-colors',
              isActive && !isCompleted && 'bg-blue-900/20 border border-blue-800/50',
              isCompleted && 'bg-green-900/10 border border-green-800/30 opacity-70',
              !isActive && !isCompleted && 'bg-gray-800/30 border border-gray-700/30',
            )}
          >
            <Box className="flex-shrink-0 pt-0.5">
              <WaypointMarker
                active={isActive && !isCompleted}
                completed={isCompleted}
                size="sm"
              />
            </Box>

            <Box className="flex-1 min-w-0">
              <Typography
                variant="body2"
                className={cn(
                  'font-medium truncate',
                  isCompleted && 'line-through text-gray-500',
                  isActive && !isCompleted && 'text-blue-300',
                  !isActive && !isCompleted && 'text-gray-300',
                )}
              >
                {quest.title}
              </Typography>

              <Box className="mt-1.5">
                <ProgressBar
                  value={quest.progress}
                  max={quest.maxProgress}
                  variant={isCompleted ? 'success' : isActive ? 'primary' : 'default'}
                  size="sm"
                />
              </Box>

              <Typography
                variant="caption"
                className="text-gray-500 mt-1"
              >
                {quest.progress} / {quest.maxProgress}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </VStack>
  );
}

QuestTracker.displayName = 'QuestTracker';
