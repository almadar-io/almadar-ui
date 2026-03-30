'use client';
import * as React from 'react';
import { cn } from '../../../lib/cn';
import { ComboCounter } from '../../atoms/game/ComboCounter';
import { StatBadge } from './StatBadge';
import { Card, CardContent } from '../../atoms/Card';
import { Box } from '../../atoms/Box';

export interface ScoreBoardProps {
  /** Current score */
  score: number;
  /** All-time high score */
  highScore?: number;
  /** Current combo count */
  combo?: number;
  /** Score multiplier */
  multiplier?: number;
  /** Current level */
  level?: number;
  /** Additional CSS classes */
  className?: string;
}

export function ScoreBoard({
  score: rawScore,
  highScore: rawHighScore,
  combo: rawCombo,
  multiplier: rawMultiplier,
  level: rawLevel,
  className,
}: ScoreBoardProps) {
  const score = rawScore ?? 0;
  const highScore = rawHighScore ?? 0;
  const combo = rawCombo ?? 0;
  const multiplier = rawMultiplier ?? 1;
  const level = rawLevel ?? 1;
  return (
    <Card
      className={cn(
        'bg-[var(--color-card)]/90 border-gray-700 backdrop-blur-sm',
        className
      )}
    >
      <CardContent className="p-3">
        <Box className="flex items-center gap-3 flex-wrap">
          <StatBadge
            label="Score"
            value={score}
            format="number"
            variant="primary"
            size="md"
          />

          {highScore != null && (
            <StatBadge
              label="Best"
              value={highScore}
              format="number"
              variant="warning"
              size="sm"
            />
          )}

          {multiplier != null && multiplier > 1 && (
            <StatBadge
              label="Multiplier"
              value={`x${multiplier.toFixed(1)}`}
              format="text"
              variant="success"
              size="sm"
            />
          )}

          {level != null && (
            <StatBadge
              label="Level"
              value={level}
              format="number"
              variant="default"
              size="sm"
            />
          )}

          {combo != null && combo > 0 && (
            <ComboCounter combo={combo} multiplier={multiplier} size="sm" />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

ScoreBoard.displayName = 'ScoreBoard';
