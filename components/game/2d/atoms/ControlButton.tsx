'use client';
import * as React from 'react';
import type { EventKey, Asset } from "@almadar/core";
import { cn } from '../../../../lib/cn';
import { useEventBus } from '../../../../hooks/useEventBus';
import { resolveIcon, type IconInput } from '../../../core/atoms/Icon';

export interface ControlButtonProps {
  /** Sprite asset — takes precedence over icon when provided */
  assetUrl?: Asset;
  /** Button label text */
  label?: string;
  /** Icon component or emoji */
  icon?: IconInput;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | string;
  /** Shape variant */
  shape?: 'circle' | 'rounded' | 'square' | string;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'ghost' | string;
  /** Called when button is pressed */
  onPress?: () => void;
  /** Called when button is released */
  onRelease?: () => void;
  /** Declarative event name emitted on press via useEventBus */
  pressEvent?: EventKey;
  /** Declarative event name emitted on release via useEventBus */
  releaseEvent?: EventKey;
  /** Whether the button is currently pressed */
  pressed?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-base',
  lg: 'w-18 h-18 text-lg',
  xl: 'w-24 h-24 text-xl',
};

const shapeMap = {
  circle: 'rounded-full',
  rounded: 'rounded-interactive',
  square: 'rounded-interactive',
};

const variantMap = {
  primary: 'bg-primary text-primary-foreground border-primary hover:bg-primary-hover',
  secondary: 'bg-secondary text-secondary-foreground border-border hover:bg-secondary-hover',
  ghost: 'bg-transparent text-foreground border-border hover:bg-muted',
};

const DEFAULT_ASSET_URL: Asset = {
  url: 'https://almadar-kflow-assets.web.app/shared/effects/particles/circle_01.png',
  role: 'effect',
  category: 'effect',
};

export function ControlButton({
  assetUrl = DEFAULT_ASSET_URL,
  label,
  icon,
  size = 'md',
  shape = 'circle',
  variant = 'secondary',
  onPress,
  onRelease,
  pressEvent,
  releaseEvent,
  pressed,
  disabled,
  className,
}: ControlButtonProps) {
  const eventBus = useEventBus();
  const [isPressed, setIsPressed] = React.useState(false);
  const actualPressed = pressed ?? isPressed;

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (disabled) return;
      setIsPressed(true);
      if (pressEvent) eventBus.emit(`UI:${pressEvent}`, {});
      onPress?.();
    },
    [disabled, pressEvent, eventBus, onPress]
  );

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (disabled) return;
      setIsPressed(false);
      if (releaseEvent) eventBus.emit(`UI:${releaseEvent}`, {});
      onRelease?.();
    },
    [disabled, releaseEvent, eventBus, onRelease]
  );

  const handlePointerLeave = React.useCallback(
    (e: React.PointerEvent) => {
      if (isPressed) {
        setIsPressed(false);
        if (releaseEvent) eventBus.emit(`UI:${releaseEvent}`, {});
        onRelease?.();
      }
    },
    [isPressed, releaseEvent, eventBus, onRelease]
  );

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        'flex items-center justify-center border-2 font-bold',
        'select-none touch-none',
        'transition-all duration-100',
        'active:scale-95',
        sizeMap[size as keyof typeof sizeMap] ?? sizeMap.md,
        shapeMap[shape as keyof typeof shapeMap] ?? shapeMap.circle,
        variantMap[variant as keyof typeof variantMap] ?? variantMap.secondary,
        actualPressed && 'scale-95 brightness-110 border-foreground',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {assetUrl ? (
        <img
          src={assetUrl.url}
          alt=""
          width={24}
          height={24}
          style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
          className="flex-shrink-0"
        />
      ) : icon ? (
        <span className="text-2xl">
          {typeof icon === 'string'
            ? /^[a-zA-Z0-9-]+$/.test(icon)
              ? (() => { const I = resolveIcon(icon); return I ? <I className="w-6 h-6" /> : null; })()
              : icon
            : (() => { const I = icon; return <I className="w-6 h-6" />; })()}
        </span>
      ) : label ? (
        <span>{label}</span>
      ) : null}
    </button>
  );
}

ControlButton.displayName = 'ControlButton';
