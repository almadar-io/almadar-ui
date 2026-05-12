import * as React from 'react';
import { cn } from '../../../lib/cn';
import { resolveIcon } from '../Icon';

export interface ActionButtonProps {
  /** Button label text */
  label: string;
  /** Icon displayed before the label */
  icon?: React.ReactNode;
  /** Cooldown progress from 0 (ready) to 1 (full cooldown) */
  cooldown?: number;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Keyboard hotkey to display as a badge */
  hotkey?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: { button: 'px-3 py-1.5 text-xs', hotkey: 'text-[9px] px-1', icon: 'text-xs' },
  md: { button: 'px-4 py-2 text-sm', hotkey: 'text-[10px] px-1.5', icon: 'text-sm' },
  lg: { button: 'px-5 py-2.5 text-base', hotkey: 'text-xs px-2', icon: 'text-base' },
};

const variantStyles = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover border-primary',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover border-border',
  danger: 'bg-error text-error-foreground hover:bg-error/90 border-error',
};

export function ActionButton({
  label,
  icon,
  cooldown = 0,
  disabled = false,
  hotkey,
  size = 'md',
  variant = 'primary',
  onClick,
  className,
}: ActionButtonProps) {
  const sizes = sizeMap[size];
  const onCooldown = cooldown > 0;
  const isDisabled = disabled || onCooldown;
  const cooldownDeg = Math.round(cooldown * 360);

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center gap-1.5 rounded-md border font-medium overflow-hidden transition-colors duration-150',
        sizes.button,
        variantStyles[variant],
        isDisabled && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      {onCooldown && (
        <div
          className="absolute inset-0 bg-foreground/40 pointer-events-none"
          style={{
            clipPath: `conic-gradient(from 0deg, transparent ${360 - cooldownDeg}deg, black ${360 - cooldownDeg}deg)`,
            WebkitClipPath: `conic-gradient(from 0deg, transparent ${360 - cooldownDeg}deg, black ${360 - cooldownDeg}deg)`,
            background: `conic-gradient(from 0deg, transparent ${360 - cooldownDeg}deg, rgba(0,0,0,0.6) ${360 - cooldownDeg}deg)`,
          }}
        />
      )}
      {icon && (
        <span className={cn('flex-shrink-0', sizes.icon)}>
          {typeof icon === 'string'
            ? (() => { const I = resolveIcon(icon); return I ? <I className="w-4 h-4" /> : null; })()
            : icon}
        </span>
      )}
      <span className="relative z-10">{label}</span>
      {hotkey && (
        <span
          className={cn(
            'absolute top-0.5 right-0.5 bg-foreground/30 text-primary-foreground rounded font-mono leading-tight',
            sizes.hotkey
          )}
        >
          {hotkey}
        </span>
      )}
    </button>
  );
}

ActionButton.displayName = 'ActionButton';
