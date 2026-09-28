import { describe, it, expect } from 'vitest';
import { NODE_STATE_COLOR, EDGE_STATE_COLOR } from '../AlgoGraphCanvas';

const LITERAL = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i;

describe('AlgoGraphCanvas state palettes hold no literal color', () => {
  it('NODE_STATE_COLOR maps every AlgoGraphNodeState to a theme token', () => {
    const expected = {
      unvisited: 'var(--color-muted-foreground)',
      frontier: 'var(--color-warning)',
      current: 'var(--color-primary)',
      visited: 'var(--color-success)',
      goal: 'var(--color-accent)',
      path: 'var(--color-info)',
    };
    expect(NODE_STATE_COLOR).toEqual(expected);
    for (const c of Object.values(NODE_STATE_COLOR)) expect(c, c).not.toMatch(LITERAL);
  });

  it('EDGE_STATE_COLOR maps every AlgoGraphEdgeState to a theme token', () => {
    const expected = {
      default: 'var(--color-border)',
      tree: 'var(--color-success)',
      relaxed: 'var(--color-warning)',
      candidate: 'var(--color-primary)',
      path: 'var(--color-info)',
    };
    expect(EDGE_STATE_COLOR).toEqual(expected);
    for (const c of Object.values(EDGE_STATE_COLOR)) expect(c, c).not.toMatch(LITERAL);
  });
});
