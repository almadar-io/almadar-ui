'use client';
import * as React from 'react';
import { cn } from '../../../lib/cn';
import { WaypointMarker } from '../atoms/WaypointMarker';
import { ProgressBar } from '../../core/atoms/ProgressBar';
import { Typography } from '../../core/atoms/Typography';
import { Box } from '../../core/atoms/Box';
import { VStack } from '../../core/atoms/Stack';

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

const DEFAULT_QUESTS: Quest[] = [
  { id: 'q1', title: 'Reach the Ancient Ruins', progress: 1, maxProgress: 1, completed: true },
  { id: 'q2', title: 'Defeat the Shadow Guard', progress: 2, maxProgress: 5, active: true },
  { id: 'q3', title: 'Collect 3 Crystal Shards', progress: 0, maxProgress: 3, active: false },
];

export function QuestTracker({
  quests = DEFAULT_QUESTS,
  activeQuestId = 'q2',
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
              'flex items-start gap-3 rounded-container px-3 py-2 transition-colors',
              isActive && !isCompleted && 'bg-info/20 border border-info/50',
              isCompleted && 'bg-success/10 border border-success/30 opacity-70',
              !isActive && !isCompleted && 'bg-muted/30 border border-border/30',
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
                  isCompleted && 'line-through text-muted-foreground',
                  isActive && !isCompleted && 'text-info',
                  !isActive && !isCompleted && 'text-muted-foreground',
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
                className="text-muted-foreground mt-1"
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
