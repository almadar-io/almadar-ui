'use client';
import * as React from 'react';
import { cn } from '../../../lib/cn';
import { TurnIndicator } from '../../atoms/game/TurnIndicator';
import { Button } from '../../atoms/Button';
import { Box } from '../../atoms/Box';
import { useEventBus } from '../../../hooks/useEventBus';

export interface TurnPanelAction {
  /** Action button label */
  label: string;
  /** Icon for the button */
  icon?: React.ReactNode;
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

export function TurnPanel({
  currentTurn,
  maxTurns,
  phase,
  activeTeam,
  actions,
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
        'flex items-center gap-3 rounded-lg bg-gray-900/90 border border-gray-700 backdrop-blur-sm px-3 py-2',
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
              leftIcon={action.icon}
              onClick={() => handleAction(action.event)}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
}

TurnPanel.displayName = 'TurnPanel';
