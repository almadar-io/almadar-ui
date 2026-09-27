import { describe, it, expect } from 'vitest';
import { computeLineDiff } from '../lineDiff';

describe('computeLineDiff', () => {
  it('an inserted line is one addition; the lines after it stay unchanged', () => {
    const diff = computeLineDiff('a\nb\nc', 'a\nX\nb\nc');
    expect(diff.map((l) => `${l.type}:${l.content}`)).toEqual(['unchanged:a', 'added:X', 'unchanged:b', 'unchanged:c']);
    expect(diff[2]).toMatchObject({ beforeLineNumber: 2, afterLineNumber: 3 });
  });

  it('a changed line is one removal then one addition', () => {
    const diff = computeLineDiff('title\nblue', 'title\ngreen');
    expect(diff.map((l) => l.type)).toEqual(['unchanged', 'removed', 'added']);
  });

  it('control: identical texts are all unchanged', () => {
    expect(computeLineDiff('a\nb', 'a\nb').every((l) => l.type === 'unchanged')).toBe(true);
  });

  it('edge: empty before is all additions; empty after is all removals', () => {
    expect(computeLineDiff('', 'x').map((l) => l.type)).toEqual(['added']);
    expect(computeLineDiff('x\ny', '').map((l) => l.type)).toEqual(['removed', 'removed']);
  });
});
