// @vitest-environment jsdom
/**
 * A schema's declared theme reaches the rendered subtree even when the host
 * document runs a different theme (playground picker, runtime-verify catalog).
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import type { ThemeDefinition } from '@almadar/core';
import { ThemeProvider } from '../ThemeContext';
import { OrbitalThemeProvider } from '../OrbitalThemeProvider';

function renderIn(theme: Parameters<typeof OrbitalThemeProvider>[0]['theme']) {
  return render(
    <ThemeProvider defaultTheme="minimalist" defaultMode="dark">
      <OrbitalThemeProvider theme={theme}>
        <span data-testid="leaf">content</span>
      </OrbitalThemeProvider>
    </ThemeProvider>,
  );
}

describe('OrbitalThemeProvider', () => {
  it('scopes a registry theme key to the subtree as its data-theme', () => {
    const { getByTestId } = renderIn('gazette-light');
    const scope = getByTestId('leaf').closest('[data-theme]');
    expect(scope?.getAttribute('data-theme')).toBe('gazette-light');
  });

  it('paints the scoped theme background so a light theme is legible inside a dark host', () => {
    const { getByTestId } = renderIn('gazette-light');
    const scope = getByTestId('leaf').closest('[data-theme="gazette-light"]');
    expect(scope?.className).toContain('bg-background');
    expect(scope?.className).toContain('text-foreground');
  });

  it('leaves the legacy "Alias.theme" import form alone (unresolved upstream, matches no selector)', () => {
    const { getByTestId } = renderIn('Ocean.theme');
    expect(getByTestId('leaf').closest('[data-theme="Ocean.theme"]')).toBeNull();
  });

  it('is a pass-through when the orbital declares no theme', () => {
    const { getByTestId } = renderIn(undefined);
    expect(getByTestId('leaf').closest('[data-orbital-theme]')).toBeNull();
    expect(getByTestId('leaf').closest('[data-theme]')?.getAttribute('data-theme')).not.toBe('gazette-light');
  });

  it('keeps applying an inline definition as CSS variables', () => {
    const inline: ThemeDefinition = { name: 'harbor', tokens: { colors: { primary: '#123456' } } };
    const { getByTestId } = renderIn(inline);
    const wrapper = getByTestId('leaf').closest('[data-orbital-theme="harbor"]') as HTMLElement | null;
    expect(wrapper).not.toBeNull();
    expect(wrapper?.style.getPropertyValue('--color-primary')).toBe('#123456');
  });
});
