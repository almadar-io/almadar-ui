'use client';

/**
 * OrbitalThemeProvider — runtime application of `OrbitalDefinition.theme`.
 *
 * Wraps an orbital's rendered subtree in a surface `Box` that sets the
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
 * A registry theme key (e.g. `"gazette-light"`) scopes that preset to the
 * subtree through `data-theme` on a wrapper that paints the theme's
 * background, so an orbital renders in its declared theme even inside a host
 * document running another one (playground picker, runtime-verify catalog).
 *
 * No-op when:
 * - `theme` is `undefined` (orbital declares no theme — parent cascades)
 * - `theme` is the legacy `"Alias.theme"` import form that didn't get inlined upstream
 *
 * @example
 * ```tsx
 * <OrbitalThemeProvider theme={orbital.theme}>
 *   <UISlotRenderer />
 * </OrbitalThemeProvider>
 * ```
 */

import React, { type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { isThemeRegistryKey, type ThemeRef } from '@almadar/core';
import { useTheme } from './ThemeContext';
import { themeTokensToCssVars, resolveThemeForRuntime } from '../lib/themeTokens';
import { Box } from '../components/core/atoms/Box';

export interface OrbitalThemeProviderProps {
  /** The `OrbitalDefinition.theme` value (inline definition or string ref). */
  theme?: ThemeRef;
  children: ReactNode;
}

// Both theme forms paint the orbital's own surface, so a themed orbital never
// shows the host document's background (playground, runtime-verify catalog).
const SURFACE = 'h-full min-h-full bg-background text-foreground';

export function OrbitalThemeProvider({ theme, children }: OrbitalThemeProviderProps): ReactElement {
  const resolved = resolveThemeForRuntime(theme);
  // useTheme provides the document-level resolved color mode. Per-orbital
  // overrides ride on top of that mode's variant.
  const { resolvedMode } = useTheme();

  if (isThemeRegistryKey(theme)) {
    return (
      <Box data-theme={theme} className={SURFACE}>
        {children}
      </Box>
    );
  }

  if (!resolved) {
    return <>{children}</>;
  }

  const vars = themeTokensToCssVars(resolved.tokens, resolvedMode, resolved.variants?.dark);

  // The CSSProperties cast is required because TS doesn't include `--var`
  // keys in the React CSS type. Plain `as` (not `as unknown as`) — matches
  // the project's no-unknown-cast rule.
  return (
    <Box data-orbital-theme={resolved.name} className={SURFACE} style={vars as CSSProperties}>
      {children}
    </Box>
  );
}

OrbitalThemeProvider.displayName = 'OrbitalThemeProvider';
