/**
 * themeTokens — runtime mirror of the orbital compiler's theme codegen.
 *
 * The compile path (orbital-rust/crates/orbital-shell-typescript/src/codegen/theme.rs)
 * reads `OrbitalDefinition.theme.tokens` and emits CSS custom-property
 * declarations into a `[data-theme="<name>-<mode>"]` block. The runtime
 * does not parse compiled CSS — it reads the same `tokens` object directly
 * and produces the same `{ '--color-primary': '…', '--radius-md': '…' }` map
 * that the compiler emits.
 *
 * Keeping the two paths byte-identical at the variable level is the contract:
 * editing tokens via the Studio Design System tab must produce the exact
 * same rendered result as editing them in source and running `orbital
 * compile`. The mapping rules here mirror `generate_tokens_css` /
 * `generate_tokens_css_dark` (theme.rs:122–351).
 *
 * Compile vs runtime difference (intentional):
 * - Compile emits the FULL set: schema overrides on top of defaults. This is
 *   needed because the compiled CSS replaces the theme entirely.
 * - Runtime emits ONLY the keys present in `tokens` (and `variants.dark`).
 *   Missing keys cascade from the parent `[data-theme]` rule on the document
 *   element. The provider scopes overrides to an orbital subtree without
 *   shadowing inherited defaults.
 *
 * @packageDocumentation
 */

import type { ThemeDefinition, ThemeTokens, ThemeVariant, ThemeRef } from '@almadar/core';

/** Resolved color mode. Mirrors `ThemeContext.resolvedMode`. */
export type ThemeMode = 'light' | 'dark';

/**
 * Convert `ThemeTokens` (+ optional dark variant) into a CSS custom-property
 * map keyed by variable name (e.g. `--color-primary`).
 *
 * Mapping rules (mirror theme.rs):
 * - `tokens.colors.<k>`     → `--color-<k>`
 * - `tokens.radii.<k>`      → `--radius-<k>`
 * - `tokens.spacing.<k>`    → `--space-<k>`
 * - `tokens.typography.<k>` → `--<k>` (keys already include their `font-`/
 *                                       `letter-`/`line-` prefix)
 * - `tokens.shadows.<k>`    → `--shadow-<k>` (schema key has no prefix)
 *
 * In `'dark'` mode, the `darkVariant` overrides are merged on top of the
 * base tokens per category — same precedence the Rust compiler uses
 * (`generate_tokens_css_dark`). Categories not present in `darkVariant` fall
 * back to the base tokens.
 */
export function themeTokensToCssVars(
  tokens: ThemeTokens,
  mode: ThemeMode = 'light',
  darkVariant?: ThemeVariant,
): Record<string, string> {
  const vars: Record<string, string> = {};
  const isDark = mode === 'dark';

  const pickColors = isDark && darkVariant?.colors ? darkVariant.colors : tokens.colors;
  if (pickColors) {
    for (const [key, value] of Object.entries(pickColors)) {
      vars[`--color-${key}`] = value;
    }
    // When dark variant supplies *some* colors but not all, layer base
    // tokens.colors under the variant (mirrors theme.rs:269-285 which
    // includes custom colors not present in dark defaults).
    if (isDark && darkVariant?.colors && tokens.colors) {
      for (const [key, value] of Object.entries(tokens.colors)) {
        const varName = `--color-${key}`;
        if (!(varName in vars)) vars[varName] = value;
      }
    }
  }

  const pickRadii = isDark && darkVariant?.radii ? darkVariant.radii : tokens.radii;
  if (pickRadii) {
    for (const [key, value] of Object.entries(pickRadii)) {
      vars[`--radius-${key}`] = value;
    }
  }

  const pickSpacing = isDark && darkVariant?.spacing ? darkVariant.spacing : tokens.spacing;
  if (pickSpacing) {
    for (const [key, value] of Object.entries(pickSpacing)) {
      vars[`--space-${key}`] = value;
    }
  }

  // Typography keys already carry their full prefix (font-family, font-size,
  // letter-spacing, line-height, …) per the compile-time contract.
  const pickTypography = isDark && darkVariant?.typography ? darkVariant.typography : tokens.typography;
  if (pickTypography) {
    for (const [key, value] of Object.entries(pickTypography)) {
      vars[`--${key}`] = value;
    }
  }

  // Shadows: schema key is bare (e.g. "main", "sm", "lg"); emit with prefix.
  const pickShadows = isDark && darkVariant?.shadows ? darkVariant.shadows : tokens.shadows;
  if (pickShadows) {
    for (const [key, value] of Object.entries(pickShadows)) {
      vars[`--shadow-${key}`] = value;
    }
  }

  return vars;
}

/**
 * `ThemeRef` is `ThemeDefinition | string`. When it's a string, it's an
 * unresolved import reference (e.g. `"Ocean.theme"`) that should have been
 * inlined by the compiler's import phase before runtime. If we still see a
 * string here, the upstream resolution path didn't run — return `undefined`
 * rather than guess. `OrbitalThemeProvider` falls through to passthrough.
 */
export function resolveThemeForRuntime(theme: ThemeRef | undefined): ThemeDefinition | undefined {
  if (theme === undefined) return undefined;
  if (typeof theme === 'string') return undefined;
  return theme;
}
