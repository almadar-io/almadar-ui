/**
 * G-UI-018: every icon renders through Lucide (a stroke family). A theme
 * naming a fill family (`kiosk`: fa-solid, `terminal`: phosphor-fill) sets that
 * family's `--icon-stroke-width: 0`, which must not reach a Lucide glyph —
 * the token applies only when the theme's family is the one rendering.
 */
import React from 'react';
import { afterEach, describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Icon } from '../Icon';

function themed(family: string | null, stroke: string | null): void {
  const root = document.documentElement.style;
  if (family === null) root.removeProperty('--icon-family'); else root.setProperty('--icon-family', family);
  if (stroke === null) root.removeProperty('--icon-stroke-width'); else root.setProperty('--icon-stroke-width', stroke);
}

function strokeStyleOf(container: HTMLElement): string {
  return container.querySelector('svg')?.style.strokeWidth ?? '';
}

afterEach(() => themed(null, null));

describe('Icon stroke under a theme icon family', () => {
  it.each(['fa-solid', 'phosphor-fill'])('a %s theme does not zero the Lucide stroke', async (family) => {
    themed(family, '0');
    await new Promise((r) => setTimeout(r, 0));
    const { container } = render(<Icon name="flame" />);
    await waitFor(() => expect(strokeStyleOf(container)).not.toContain('--icon-stroke-width'));
  });

  it('control: a lucide theme still drives the stroke token', async () => {
    themed('lucide', '1.5');
    await new Promise((r) => setTimeout(r, 0));
    const { container } = render(<Icon name="flame" />);
    await waitFor(() => expect(strokeStyleOf(container)).toContain('--icon-stroke-width'));
  });

  it('edge: no theme family set keeps the token (the default family renders)', async () => {
    await new Promise((r) => setTimeout(r, 0));
    const { container } = render(<Icon name="flame" />);
    await waitFor(() => expect(strokeStyleOf(container)).toContain('--icon-stroke-width'));
  });

  it('edge: an explicit strokeWidth prop always wins', () => {
    themed('fa-solid', '0');
    const { container } = render(<Icon name="flame" strokeWidth={3} />);
    expect(container.querySelector('svg')?.getAttribute('stroke-width')).toBe('3');
  });
});
