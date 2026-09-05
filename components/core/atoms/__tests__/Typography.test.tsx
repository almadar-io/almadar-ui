/**
 * Typography Component Tests
 *
 * Covers the `min-w-0` pairing on `truncate`/`overflow`: SV4-6 (responsive
 * plugin/behavior panels) found that ellipsis/wrap silently did nothing when
 * Typography sat in a flex row next to a fixed-width control (a Switch, a
 * Badge) because the text's flex item never shrank below its content width.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Typography } from '../Typography';

describe('Typography', () => {
  it('does not add min-w-0 by default', () => {
    render(<Typography>plain text</Typography>);
    expect(screen.getByText('plain text').className).not.toContain('min-w-0');
  });

  it('pairs truncate with min-w-0 so it can shrink inside a flex row', () => {
    render(<Typography truncate>a very long name</Typography>);
    const el = screen.getByText('a very long name');
    expect(el.className).toContain('truncate');
    expect(el.className).toContain('min-w-0');
  });

  it('keeps the "truncate" class itself (not just its overflow-hidden/text-ellipsis parts) — regression: tailwind-merge previously dropped it, silently losing white-space:nowrap', () => {
    render(<Typography truncate>a very long name</Typography>);
    const classes = screen.getByText('a very long name').className.split(' ');
    expect(classes).toContain('truncate');
  });

  it('pairs a non-visible overflow mode with min-w-0', () => {
    render(<Typography overflow="wrap">wraps instead of overflowing</Typography>);
    const el = screen.getByText('wraps instead of overflowing');
    expect(el.className).toContain('break-words');
    expect(el.className).toContain('min-w-0');
  });

  it('does not add min-w-0 for overflow="visible"', () => {
    render(<Typography overflow="visible">visible text</Typography>);
    expect(screen.getByText('visible text').className).not.toContain('min-w-0');
  });

  it('clamp-2 also gets min-w-0', () => {
    render(<Typography overflow="clamp-2">clamped text</Typography>);
    const el = screen.getByText('clamped text');
    expect(el.className).toContain('line-clamp-2');
    expect(el.className).toContain('min-w-0');
  });
});
