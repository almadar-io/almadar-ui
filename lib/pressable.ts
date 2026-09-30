'use client';
/**
 * pressableProps — props that make a non-button surface (a card, a row, a cell)
 * an operable control: `role="button"`, a tab stop, and Enter/Space activation
 * (WAI-ARIA APG button). Without a handler it returns nothing, so a surface is
 * only ever a control when it declares an action. A plain function, not a
 * hook, so row loops can call it. Enter/Space dispatch a real
 * click, so the surface's `onClick` receives the same MouseEvent either way.
 */
import type React from 'react';

function clickElement(el: Element): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

export interface PressableProps<T extends Element = HTMLElement> {
  role?: 'button';
  tabIndex?: number;
  'aria-disabled'?: true;
  onClick?: (e: React.MouseEvent<T>) => void;
  onKeyDown?: (e: React.KeyboardEvent<T>) => void;
}

export function pressableProps<T extends Element = HTMLElement>(
  onPress: ((e: React.MouseEvent<T>) => void) | undefined,
  options: { disabled?: boolean } = {},
): PressableProps<T> {
  if (!onPress) return {};
  const { disabled = false } = options;
  return {
    role: 'button',
    tabIndex: disabled ? -1 : 0,
    ...(disabled ? { 'aria-disabled': true as const } : undefined),
    onClick: (e) => {
      if (!disabled) onPress(e);
    },
    onKeyDown: (e) => {
      if (disabled || e.target !== e.currentTarget) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        clickElement(e.currentTarget);
      }
    },
  };
}

export interface RowActivationProps<T extends Element = HTMLElement> {
  tabIndex?: number;
  onClick?: (e: React.MouseEvent<T>) => void;
  onKeyDown?: (e: React.KeyboardEvent<T>) => void;
}

/**
 * A clickable table/list row keeps its own role (`row`), so it cannot become a
 * button; it gets a tab stop and Enter activation instead, dispatching the
 * same click.
 */
export function rowActivationProps<T extends Element = HTMLElement>(
  onActivate: ((e: React.MouseEvent<T>) => void) | undefined,
): RowActivationProps<T> {
  if (!onActivate) return {};
  return {
    tabIndex: 0,
    onClick: onActivate,
    onKeyDown: (e) => {
      if (e.target !== e.currentTarget || e.key !== 'Enter') return;
      e.preventDefault();
      clickElement(e.currentTarget);
    },
  };
}
