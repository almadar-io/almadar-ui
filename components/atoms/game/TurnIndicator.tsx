import * as React from 'react';
import { cn } from '../../../lib/cn';

export interface TurnIndicatorProps {
  /** Current turn number */
  currentTurn: number;
  /** Maximum number of turns */
  maxTurns?: number;
  /** Name of the active team */
  activeTeam?: string;
  /** Current phase label */
  phase?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: { wrapper: 'text-xs gap-1.5 px-2 py-0.5', dot: 'w-1.5 h-1.5' },
  md: { wrapper: 'text-sm gap-2 px-3 py-1', dot: 'w-2 h-2' },
  lg: { wrapper: 'text-base gap-2.5 px-4 py-1.5', dot: 'w-2.5 h-2.5' },
};

export function TurnIndicator({
  currentTurn,
  maxTurns,
  activeTeam,
  phase,
  size = 'md',
  className,
}: TurnIndicatorProps) {
  const sizes = sizeMap[size];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg',
        'bg-gray-800/80 border border-gray-600 font-medium text-white',
        sizes.wrapper,
        className
      )}
    >
      <span className="font-bold tabular-nums">
        Turn {currentTurn}
        {maxTurns != null && <span className="text-gray-400">/{maxTurns}</span>}
      </span>

      {phase && (
        <>
          <span className="text-gray-600">|</span>
          <span className="text-gray-300">{phase}</span>
        </>
      )}

      {activeTeam && (
        <>
          <span className="text-gray-600">|</span>
          <span className={cn('rounded-full bg-green-500/20', sizes.dot)} />
          <span className="text-green-400">{activeTeam}</span>
        </>
      )}
    </div>
  );
}

TurnIndicator.displayName = 'TurnIndicator';
