'use client';
import * as React from 'react';
import { cn } from '../../../lib/cn';
import { Button } from '../../core/atoms/Button';
import { Box } from '../../core/atoms/Box';
import { Typography } from '../../core/atoms/Typography';
import { useEventBus } from '../../../hooks/useEventBus';
import type { IconInput } from '../../core/atoms';

export interface UnitCommand {
  /** Command label */
  label: string;
  /** Icon for the command button */
  icon?: IconInput;
  /** Event name to emit when clicked */
  event?: string;
  /** Whether the command is disabled */
  disabled?: boolean;
  /** Keyboard shortcut hint */
  hotkey?: string;
}

export interface UnitCommandBarProps {
  /** Available commands */
  commands: UnitCommand[];
  /** ID of the currently selected unit */
  selectedUnitId?: string;
  /** Additional CSS classes */
  className?: string;
}

const DEFAULT_COMMANDS: UnitCommand[] = [
  { label: 'Move', icon: 'move', event: 'MOVE', hotkey: 'M' },
  { label: 'Attack', icon: 'sword', event: 'ATTACK', hotkey: 'A' },
  { label: 'Defend', icon: 'shield', event: 'DEFEND', hotkey: 'D' },
  { label: 'Wait', icon: 'clock', event: 'WAIT', hotkey: 'W' },
];

export function UnitCommandBar({
  commands = DEFAULT_COMMANDS,
  selectedUnitId = 'unit-1',
  className,
}: UnitCommandBarProps) {
  const eventBus = useEventBus();

  const handleCommand = React.useCallback(
    (event?: string) => {
      if (event) {
        eventBus.emit(event, { unitId: selectedUnitId });
      }
    },
    [eventBus, selectedUnitId]
  );

  return (
    <Box
      className={cn(
        'flex items-center gap-1.5 rounded-container bg-[var(--color-card)]/90 border border-border backdrop-blur-sm px-2 py-1.5',
        className
      )}
    >
      {commands.map((command, i) => (
        <Box key={i} className="flex flex-col items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            disabled={command.disabled}
            leftIcon={command.icon}
            onClick={() => handleCommand(command.event)}
          >
            {command.label}
          </Button>
          {command.hotkey && (
            <Typography
              variant="caption"
              className="text-muted-foreground text-xs font-mono"
            >
              {command.hotkey}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}

UnitCommandBar.displayName = 'UnitCommandBar';
