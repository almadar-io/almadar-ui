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

import type {
  DensityTokens,
  ElevationTokens,
  GeometryTokens,
  IconographyTokens,
  MotionIntent,
  MotionTokens,
  ThemeDefinition,
  ThemeRef,
  ThemeTokens,
  ThemeVariant,
  TypeIntent,
  TypeScaleTokens,
  TypeSizeKey,
  TypeWeight,
} from '@almadar/core';

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

  // Layer 1 skin axes (density / typeScale / motion / iconography / elevation / geometry).
  // Cascade: per category, prefer darkVariant.<axis> if Some in dark mode, else base tokens.<axis>.
  // Mirrors orbital-shell-typescript/src/codegen/theme.rs `emit_skin_axes_dark`. Round-trip
  // tests in packages/almadar-ui/test/theme-roundtrip/ gate parity.
  const pickDensity = isDark && darkVariant?.density ? darkVariant.density : tokens.density;
  emitDensity(pickDensity, vars);

  const pickTypeScale = isDark && darkVariant?.typeScale ? darkVariant.typeScale : tokens.typeScale;
  emitTypeScale(pickTypeScale, vars);

  const pickMotion = isDark && darkVariant?.motion ? darkVariant.motion : tokens.motion;
  emitMotion(pickMotion, vars);

  const pickIconography = isDark && darkVariant?.iconography ? darkVariant.iconography : tokens.iconography;
  emitIconography(pickIconography, vars);

  const pickElevation = isDark && darkVariant?.elevation ? darkVariant.elevation : tokens.elevation;
  emitElevation(pickElevation, vars);

  const pickGeometry = isDark && darkVariant?.geometry ? darkVariant.geometry : tokens.geometry;
  emitGeometry(pickGeometry, vars);

  return vars;
}

// =============================================================================
// Skin axis emitters — byte-for-byte mirrors of orbital-shell-typescript theme.rs
// =============================================================================

function emitDensity(density: DensityTokens | undefined, vars: Record<string, string>): void {
  if (!density) return;
  if (density.spacing) {
    const s = density.spacing;
    const pairs: ReadonlyArray<[string, string | undefined]> = [
      ['0', s.space0], ['1', s.space1], ['2', s.space2], ['3', s.space3],
      ['4', s.space4], ['5', s.space5], ['6', s.space6], ['7', s.space7],
      ['8', s.space8], ['9', s.space9], ['10', s.space10], ['11', s.space11],
      ['12', s.space12],
    ];
    for (const [k, v] of pairs) {
      if (v !== undefined) vars[`--space-${k}`] = v;
    }
  }
  const pairs: ReadonlyArray<[string, string | undefined]> = [
    ['button-height-sm', density.buttonHeightSm],
    ['button-height-md', density.buttonHeightMd],
    ['button-height-lg', density.buttonHeightLg],
    ['input-height-sm', density.inputHeightSm],
    ['input-height-md', density.inputHeightMd],
    ['input-height-lg', density.inputHeightLg],
    ['row-height-compact', density.rowHeightCompact],
    ['row-height-normal', density.rowHeightNormal],
    ['row-height-spacious', density.rowHeightSpacious],
    ['card-padding-sm', density.cardPaddingSm],
    ['card-padding-md', density.cardPaddingMd],
    ['card-padding-lg', density.cardPaddingLg],
    ['dialog-padding', density.dialogPadding],
    ['section-gap', density.sectionGap],
  ];
  for (const [k, v] of pairs) {
    if (v !== undefined) vars[`--${k}`] = v;
  }
}

function typeSizeKeyStr(k: TypeSizeKey): string {
  return k;
}

function typeWeightStr(w: TypeWeight): string {
  return w;
}

function emitTypeIntent(name: string, intent: TypeIntent, vars: Record<string, string>): void {
  const sizeKey = typeSizeKeyStr(intent.size);
  const weight = typeWeightStr(intent.weight);
  vars[`--intent-${name}-size`] = `var(--text-${sizeKey})`;
  vars[`--intent-${name}-weight`] = `var(--font-weight-${weight})`;
  vars[`--intent-${name}-leading`] = `var(--leading-${sizeKey})`;
}

function emitTypeScale(ts: TypeScaleTokens | undefined, vars: Record<string, string>): void {
  if (!ts) return;
  if (ts.displayFamily !== undefined) vars['--font-family-display'] = ts.displayFamily;
  if (ts.bodyFamily !== undefined) vars['--font-family-body'] = ts.bodyFamily;
  if (ts.monoFamily !== undefined) vars['--font-family-mono'] = ts.monoFamily;
  if (ts.scale) {
    const s = ts.scale;
    const pairs: ReadonlyArray<[string, { size: string; lineHeight: string } | undefined]> = [
      ['xs', s.xs], ['sm', s.sm], ['base', s.base], ['lg', s.lg], ['xl', s.xl],
      ['2xl', s['2xl']], ['3xl', s['3xl']], ['4xl', s['4xl']],
      ['display-1', s['display-1']], ['display-2', s['display-2']],
    ];
    for (const [k, entry] of pairs) {
      if (entry !== undefined) {
        vars[`--text-${k}`] = entry.size;
        vars[`--leading-${k}`] = entry.lineHeight;
      }
    }
  }
  if (ts.intents) {
    const i = ts.intents;
    if (i.headingMajor) emitTypeIntent('heading-major', i.headingMajor, vars);
    if (i.headingMinor) emitTypeIntent('heading-minor', i.headingMinor, vars);
    if (i.bodyEmphasis) emitTypeIntent('body-emphasis', i.bodyEmphasis, vars);
    if (i.bodyDefault) emitTypeIntent('body-default', i.bodyDefault, vars);
    if (i.bodyQuiet) emitTypeIntent('body-quiet', i.bodyQuiet, vars);
    if (i.caption) emitTypeIntent('caption', i.caption, vars);
    if (i.numeric) emitTypeIntent('numeric', i.numeric, vars);
  }
}

function emitMotionIntent(name: string, intent: MotionIntent, vars: Record<string, string>): void {
  vars[`--intent-${name}-duration`] = `var(--duration-${intent.duration})`;
  vars[`--intent-${name}-easing`] = `var(--easing-${intent.easing})`;
}

function emitMotion(m: MotionTokens | undefined, vars: Record<string, string>): void {
  if (!m) return;
  if (m.durations) {
    const d = m.durations;
    const pairs: ReadonlyArray<[string, string | undefined]> = [
      ['instant', d.instant], ['fast', d.fast], ['normal', d.normal],
      ['slow', d.slow], ['dramatic', d.dramatic],
    ];
    for (const [k, v] of pairs) {
      if (v !== undefined) vars[`--duration-${k}`] = v;
    }
  }
  if (m.easings) {
    const e = m.easings;
    const pairs: ReadonlyArray<[string, string | undefined]> = [
      ['linear', e.linear], ['standard', e.standard],
      ['emphasized', e.emphasized], ['spring', e.spring],
    ];
    for (const [k, v] of pairs) {
      if (v !== undefined) vars[`--easing-${k}`] = v;
    }
  }
  if (m.intents) {
    const i = m.intents;
    if (i.enter) emitMotionIntent('enter', i.enter, vars);
    if (i.exit) emitMotionIntent('exit', i.exit, vars);
    if (i.hover) emitMotionIntent('hover', i.hover, vars);
    if (i.press) emitMotionIntent('press', i.press, vars);
    if (i.expand) emitMotionIntent('expand', i.expand, vars);
    if (i.transition) emitMotionIntent('transition', i.transition, vars);
  }
}

function emitIconography(i: IconographyTokens | undefined, vars: Record<string, string>): void {
  if (!i) return;
  if (i.family !== undefined) vars['--icon-family'] = i.family;
  if (i.strokeWidth !== undefined) vars['--icon-stroke-width'] = i.strokeWidth;
  if (i.defaultSize !== undefined) vars['--icon-default-size'] = i.defaultSize;
}

function emitElevation(e: ElevationTokens | undefined, vars: Record<string, string>): void {
  if (!e) return;
  if (e.cardElevation !== undefined) vars['--elevation-card'] = e.cardElevation;
  if (e.popoverElevation !== undefined) vars['--elevation-popover'] = e.popoverElevation;
  if (e.dialogElevation !== undefined) vars['--elevation-dialog'] = e.dialogElevation;
  if (e.toastElevation !== undefined) vars['--elevation-toast'] = e.toastElevation;
}

function emitGeometry(g: GeometryTokens | undefined, vars: Record<string, string>): void {
  if (!g) return;
  if (g.radiusContainer !== undefined) vars['--radius-container'] = g.radiusContainer;
  if (g.radiusInteractive !== undefined) vars['--radius-interactive'] = g.radiusInteractive;
  if (g.radiusPill !== undefined) vars['--radius-pill'] = g.radiusPill;
  if (g.borderHairline !== undefined) vars['--border-hairline'] = g.borderHairline;
  if (g.borderStandard !== undefined) vars['--border-standard'] = g.borderStandard;
  if (g.borderHeavy !== undefined) vars['--border-heavy'] = g.borderHeavy;
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
