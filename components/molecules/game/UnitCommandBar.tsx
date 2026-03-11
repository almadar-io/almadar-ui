'use client';
import * as React from 'react';
import { cn } from '../../../lib/cn';
import { Button } from '../../atoms/Button';
import { Box } from '../../atoms/Box';
import { Typography } from '../../atoms/Typography';
import { useEventBus } from '../../../hooks/useEventBus';

export interface UnitCommand {
  /** Command label */
  label: string;
  /** Icon for the command button */
  icon?: React.ReactNode;
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

export function UnitCommandBar({
  commands,
  selectedUnitId,
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
        'flex items-center gap-1.5 rounded-lg bg-gray-900/90 border border-gray-700 backdrop-blur-sm px-2 py-1.5',
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
              className="text-gray-500 text-[10px] font-mono"
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
