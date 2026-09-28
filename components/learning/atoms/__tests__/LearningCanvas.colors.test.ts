import { describe, it, expect, afterEach } from 'vitest';
import { TRACE_SERIES_COLORS, resolveColor } from '../LearningCanvas';

const LITERAL = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i;

describe('LearningCanvas TRACE_SERIES_COLORS', () => {
  it('holds no literal color', () => {
    expect(TRACE_SERIES_COLORS.length).toBeGreaterThan(0);
    for (const c of TRACE_SERIES_COLORS) expect(c, c).not.toMatch(LITERAL);
  });
});

// jsdom never substitutes var() into a computed shorthand property, so a
// live var()-resolves-to-a-real-color case cannot run under jsdom (see
// GraphCanvas.colors.test.ts for the same note). This suite covers the two
// paths jsdom CAN exercise for this function's contract.
describe('LearningCanvas resolveColor (converged onto resolveThemeColor)', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  // resolveColor only reads `ctx.canvas` — a minimal object typed as the real
  // interface, matching the Proxy-based mock in LearningCanvas.responsive.test.tsx.
  function fakeCtx(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    return { canvas } as CanvasRenderingContext2D;
  }

  it('returns the fallback when no color is given', () => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    expect(resolveColor(undefined, fakeCtx(canvas), 'var(--color-foreground)')).toBe(
      resolveColor('var(--color-foreground)', fakeCtx(canvas), 'var(--color-foreground)'),
    );
  });

  it('passes a literal color through unchanged', () => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    expect(resolveColor('#0f766e', fakeCtx(canvas), 'var(--color-foreground)')).toBe('#0f766e');
  });

  it('resolves an unresolved var() color by falling back to the (possibly token) fallback, never a guessed literal', () => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    // Neither the color nor the fallback token is defined in this scope, so both fail to
    // resolve — the result is the raw fallback expression, never a fabricated color.
    expect(resolveColor('var(--not-defined-a)', fakeCtx(canvas), 'var(--not-defined-b)')).toBe('var(--not-defined-b)');
  });
});
