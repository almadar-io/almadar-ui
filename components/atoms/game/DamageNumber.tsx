import * as React from 'react';
import { cn } from '../../../lib/cn';

export interface DamageNumberProps {
  /** The damage/heal value to display */
  value: number;
  /** Type of number display */
  type?: 'damage' | 'heal' | 'crit' | 'miss';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

const typeStyles = {
  damage: 'text-red-500 font-bold',
  heal: 'text-green-500 font-bold',
  crit: 'text-orange-400 font-extrabold',
  miss: 'text-gray-400 italic',
};

const floatKeyframes = `
@keyframes damageFloat {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  20% { transform: translateY(-8px) scale(1.1); }
  100% { opacity: 0; transform: translateY(-32px) scale(0.8); }
}
`;

export function DamageNumber({
  value,
  type = 'damage',
  size = 'md',
  className,
}: DamageNumberProps) {
  const displayText = type === 'miss' ? 'MISS' : type === 'heal' ? `+${value}` : `${value}`;

  return (
    <>
      <style>{floatKeyframes}</style>
      <span
        className={cn(
          'inline-block font-mono select-none pointer-events-none',
          sizeMap[size],
          typeStyles[type],
          className
        )}
        style={{ animation: 'damageFloat 1s ease-out forwards' }}
      >
        {displayText}
      </span>
    </>
  );
}

DamageNumber.displayName = 'DamageNumber';
