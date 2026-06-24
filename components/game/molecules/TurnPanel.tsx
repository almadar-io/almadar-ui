'use client';
import * as React from 'react';
import { cn } from '../../../lib/cn';
import { TurnIndicator } from '../atoms/TurnIndicator';
import { Button } from '../../core/atoms/Button';
import { Box } from '../../core/atoms/Box';
import { useEventBus } from '../../../hooks/useEventBus';
import type { IconInput } from '../../core/atoms';
import type { AssetUrl } from '@almadar/core';

export interface TurnPanelAction {
  /** Action button label */
  label: string;
  /** Sprite image URL — takes precedence over icon when provided */
  assetUrl?: AssetUrl;
  /** Icon for the button */
  icon?: IconInput;
  /** Event name to emit when clicked */
  event?: string;
  /** Whether the action is disabled */
  disabled?: boolean;
}

export interface TurnPanelProps {
  /** Current turn number */
  currentTurn: number;
  /** Maximum number of turns */
  maxTurns?: number;
  /** Current phase label */
  phase?: string;
  /** Active team name */
  activeTeam?: string;
  /** Action buttons to display */
  actions?: TurnPanelAction[];
  /** Additional CSS classes */
  className?: string;
}

const DEFAULT_TURN_ACTIONS: TurnPanelAction[] = [
  { label: 'End Turn', icon: 'skip-forward', event: 'END_TURN' },
  { label: 'Forfeit', icon: 'flag', event: 'FORFEIT', disabled: false },
];

export function TurnPanel({
  currentTurn = 3,
  maxTurns = 10,
  phase = 'Attack',
  activeTeam = 'Heroes',
  actions = DEFAULT_TURN_ACTIONS,
  className,
}: TurnPanelProps) {
  const eventBus = useEventBus();

  const handleAction = React.useCallback(
    (event?: string) => {
      if (event) {
        eventBus.emit(event, { turn: currentTurn, phase, activeTeam });
      }
    },
    [eventBus, currentTurn, phase, activeTeam]
  );

  return (
    <Box
      className={cn(
        'flex items-center gap-3 rounded-container bg-[var(--color-card)]/90 border border-border backdrop-blur-sm px-3 py-2',
        className
      )}
    >
      <TurnIndicator
        currentTurn={currentTurn}
        maxTurns={maxTurns}
        phase={phase}
        activeTeam={activeTeam}
      />

      {actions && actions.length > 0 && (
        <Box className="flex items-center gap-1.5 ml-auto">
          {actions.map((action, i) => (
            <Button
              key={i}
              variant="ghost"
              size="sm"
              disabled={action.disabled}
              leftIcon={action.assetUrl ? undefined : action.icon}
              onClick={() => handleAction(action.event)}
            >
              {action.assetUrl && (
                <img
                  src={action.assetUrl}
                  alt=""
                  width={14}
                  height={14}
                  style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
                  className="flex-shrink-0"
                />
              )}
              {action.label}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
}

TurnPanel.displayName = 'TurnPanel';
