'use client';
import * as React from 'react';
import type { EventEmit, Asset } from '@almadar/core';
import { cn } from '../../../../lib/cn';
import { useEventBus } from '../../../../hooks/useEventBus';
import { ControlButton } from '../atoms/ControlButton';
import type { IconInput } from '../../../core/atoms/index';

// ControlGrid unifies ActionButtons (arbitrary button sets) and DPad (directional pad).
// kind="actions" — configurable button set with press/release tracking (horizontal/vertical/diamond layout).
// kind="dpad"    — 4-direction pad (up/down/left/right) with optional diagonal support.

export type ControlGridKind = 'dpad' | 'actions';

export interface ControlGridButton {
  id: string;
  label?: string;
  icon?: IconInput;
  assetUrl?: Asset;
  variant?: 'primary' | 'secondary' | 'ghost' | string;
}

export type DPadDirection = 'up' | 'down' | 'left' | 'right';

export interface ControlGridProps {
  kind: ControlGridKind;
  /** action buttons (kind="actions") */
  buttons?: ControlGridButton[];
  /** Layout for kind="actions" */
  layout?: 'horizontal' | 'vertical' | 'diamond';
  /** Whether to include diagonal buttons (kind="dpad") */
  includeDiagonals?: boolean;
  /** Called when a button/direction is pressed or released */
  onAction?: (id: string, pressed: boolean) => void;
  /** Event-bus event emitted with `{ id, pressed }` on press/release */
  actionEvent?: EventEmit<{ id: string; pressed: boolean }>;
  /** Called when a direction is pressed or released (kind="dpad" convenience overload) */
  onDirection?: (direction: DPadDirection, pressed: boolean) => void;
  /** Event-bus event emitted with `{ direction, pressed }` (kind="dpad") */
  directionEvent?: EventEmit<{ direction: DPadDirection; pressed: boolean }>;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const sizeKey = { sm: 'sm' as const, md: 'md' as const, lg: 'lg' as const };

const layoutClass = {
  horizontal: 'flex flex-row gap-2',
  vertical: 'flex flex-col gap-2',
  diamond: 'grid grid-cols-3 gap-1',
};

const dpadSizeMap = {
  sm: { gap: 'gap-0.5', container: 'w-28' },
  md: { gap: 'gap-1', container: 'w-40' },
  lg: { gap: 'gap-1.5', container: 'w-52' },
};

const arrowIcons: Record<DPadDirection, string> = {
  up: '▲',
  down: '▼',
  left: '◀',
  right: '▶',
};

const DEFAULT_BUTTONS: ControlGridButton[] = [
  { id: 'jump', label: 'Jump', icon: 'chevron-up', variant: 'primary' },
  { id: 'attack', label: 'Attack', icon: 'sword', variant: 'secondary' },
  { id: 'dodge', label: 'Dodge', icon: 'wind', variant: 'ghost' },
];

export function ControlGrid({
  kind,
  buttons = DEFAULT_BUTTONS,
  layout = 'horizontal',
  includeDiagonals = false,
  onAction,
  actionEvent,
  onDirection,
  directionEvent,
  size = 'md',
  disabled,
  className,
}: ControlGridProps): React.JSX.Element {
  const eventBus = useEventBus();
  const [active, setActive] = React.useState<Set<string>>(new Set());

  const handlePress = React.useCallback(
    (id: string) => {
      setActive((prev) => new Set(prev).add(id));
      if (actionEvent) eventBus.emit(`UI:${actionEvent}`, { id, pressed: true });
      onAction?.(id, true);
      if (kind === 'dpad') {
        if (directionEvent) eventBus.emit(`UI:${directionEvent}`, { direction: id as DPadDirection, pressed: true });
        onDirection?.(id as DPadDirection, true);
      }
    },
    [kind, actionEvent, directionEvent, eventBus, onAction, onDirection],
  );

  const handleRelease = React.useCallback(
    (id: string) => {
      setActive((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (actionEvent) eventBus.emit(`UI:${actionEvent}`, { id, pressed: false });
      onAction?.(id, false);
      if (kind === 'dpad') {
        if (directionEvent) eventBus.emit(`UI:${directionEvent}`, { direction: id as DPadDirection, pressed: false });
        onDirection?.(id as DPadDirection, false);
      }
    },
    [kind, actionEvent, directionEvent, eventBus, onAction, onDirection],
  );

  if (kind === 'dpad') {
    const ds = dpadSizeMap[size];
    const dir = (d: DPadDirection) => (
      <ControlButton
        key={d}
        icon={arrowIcons[d]}
        size={sizeKey[size]}
        variant="secondary"
        pressed={active.has(d)}
        onPress={() => handlePress(d)}
        onRelease={() => handleRelease(d)}
        disabled={disabled}
      />
    );
    return (
      <div className={cn('inline-grid grid-cols-3', ds.gap, ds.container, className)}>
        <div />{dir('up')}<div />
        {dir('left')}
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 rounded-interactive bg-muted border-2 border-muted-foreground" />
        </div>
        {dir('right')}
        <div />{dir('down')}<div />
      </div>
    );
  }

  // kind="actions"
  if (layout === 'diamond' && buttons.length === 4) {
    const [top, right, bottom, left] = buttons;
    return (
      <div className={cn(layoutClass.diamond, className)}>
        <div />
        <ControlButton icon={top.icon} assetUrl={top.assetUrl} label={top.label} size={sizeKey[size]} variant={top.variant}
          pressed={active.has(top.id)} onPress={() => handlePress(top.id)} onRelease={() => handleRelease(top.id)} disabled={disabled} />
        <div />
        <ControlButton icon={left.icon} assetUrl={left.assetUrl} label={left.label} size={sizeKey[size]} variant={left.variant}
          pressed={active.has(left.id)} onPress={() => handlePress(left.id)} onRelease={() => handleRelease(left.id)} disabled={disabled} />
        <div />
        <ControlButton icon={right.icon} assetUrl={right.assetUrl} label={right.label} size={sizeKey[size]} variant={right.variant}
          pressed={active.has(right.id)} onPress={() => handlePress(right.id)} onRelease={() => handleRelease(right.id)} disabled={disabled} />
        <div />
        <ControlButton icon={bottom.icon} assetUrl={bottom.assetUrl} label={bottom.label} size={sizeKey[size]} variant={bottom.variant}
          pressed={active.has(bottom.id)} onPress={() => handlePress(bottom.id)} onRelease={() => handleRelease(bottom.id)} disabled={disabled} />
        <div />
      </div>
    );
  }

  return (
    <div className={cn(layoutClass[layout], className)}>
      {buttons.map((button) => (
        <ControlButton
          key={button.id}
          icon={button.icon}
          assetUrl={button.assetUrl}
          label={button.label}
          size={sizeKey[size]}
          variant={button.variant}
          pressed={active.has(button.id)}
          onPress={() => handlePress(button.id)}
          onRelease={() => handleRelease(button.id)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

ControlGrid.displayName = 'ControlGrid';
