/**
 * G-UI-008: shared-entity field defaults are classified call-vs-data by the ONE
 * registry-backed S-expression guard (the runtime's), never by a head-name test.
 */
import { describe, it, expect } from 'vitest';
import { evalFieldDefault } from '../hooks/circuit/useClientTicks';

describe('evalFieldDefault', () => {
  it('evaluates a computed default headed by a registered bare operator', () => {
    expect(evalFieldDefault(['+', 1, 2])).toBe(3);
  });

  it('evaluates a namespaced operator call', () => {
    expect(evalFieldDefault(['array/len', ['list', 1, 2, 3]])).toBe(3);
  });

  it('keeps literal data (non-operator head) verbatim', () => {
    expect(evalFieldDefault(['north', 'south'])).toEqual(['north', 'south']);
    expect(evalFieldDefault([{ x: 1 }])).toEqual([{ x: 1 }]);
  });

  it('surfaces an evaluation error instead of swallowing it into the raw tree', () => {
    expect(() => evalFieldDefault(['array/len'])).toThrow();
  });
});
