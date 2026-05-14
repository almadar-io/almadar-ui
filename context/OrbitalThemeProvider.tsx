'use client';

/**
 * OrbitalThemeProvider — runtime application of `OrbitalDefinition.theme`.
 *
 * Wraps an orbital's rendered subtree in a wrapping `<div>` that sets the
 * CSS variables derived from `theme.tokens` (and `variants.dark` when the
 * resolved color mode is dark). Inline custom-property declarations on the
 * wrapper override any `[data-theme]` selector rule for the same variable
 * within the subtree, while letting unset variables cascade from the parent.
 *
 * Mapping is delegated to `themeTokensToCssVars`, which mirrors the Rust
 * compiler's `generate_tokens_css`. Compile-time and runtime produce the
 * same CSS variable map for the same `ThemeDefinition` input, so a Studio
 * Design System edit and an `orbital compile` of the same schema render
 * identically.
 *
 * No-op when:
 * - `theme` is `undefined` (orbital declares no theme — parent cascades)
 * - `theme` is a string ref that didn't get inlined upstream
 *
 * @example
 * ```tsx
 * <OrbitalThemeProvider theme={orbital.theme}>
 *   <UISlotRenderer />
 * </OrbitalThemeProvider>
 * ```
 */

import React, { type CSSProperties, type ReactElement, type ReactNode } from 'react';
import type { ThemeRef } from '@almadar/core';
import { useTheme } from './ThemeContext';
import { themeTokensToCssVars, resolveThemeForRuntime } from './themeTokens';

export interface OrbitalThemeProviderProps {
  /** The `OrbitalDefinition.theme` value (inline definition or string ref). */
  theme?: ThemeRef;
  children: ReactNode;
}

export function OrbitalThemeProvider({ theme, children }: OrbitalThemeProviderProps): ReactElement {
  const resolved = resolveThemeForRuntime(theme);
  // useTheme provides the document-level resolved color mode. Per-orbital
  // overrides ride on top of that mode's variant.
  const { resolvedMode } = useTheme();

  if (!resolved) {
    return <>{children}</>;
  }

  const vars = themeTokensToCssVars(resolved.tokens, resolvedMode, resolved.variants?.dark);

  // `display: contents` keeps the wrapper out of the layout flow — flex/grid
  // children of the parent still treat the orbital's content as direct
  // children. CSS custom properties cascade through `display: contents` to
  // descendants normally.
  // The CSSProperties cast is required because TS doesn't include `--var`
  // keys in the React CSS type. Plain `as` (not `as unknown as`) — matches
  // the project's no-unknown-cast rule.
  return (
    <div
      data-orbital-theme={resolved.name}
      style={{ display: 'contents', ...vars } as CSSProperties}
    >
      {children}
    </div>
  );
}

OrbitalThemeProvider.displayName = 'OrbitalThemeProvider';
