import { describe, it, expect } from 'vitest';
import { applyMotion, applyOperator, motionRange, type EditorMotion } from '../lib/editorMotions';

// Fixture indices (25 chars total):
//  0  h   6  w  11 \n  12 f  15 (sp)(sp) 17 b  20 \n 21 \n 22 b  25(end)
//  "hello world\nfoo  bar\n\nbaz"
//  line0 "hello world"  [0,11)   words: hello[0,5) world[6,11)
//  line1 "foo  bar"     [12,20)  words: foo[12,15) bar[17,20)
//  line2 ""             [21,21)  (blank line)
//  line3 "baz"          [22,25)  words: baz[22,25)
const TEXT = 'hello world\nfoo  bar\n\nbaz';

describe('applyMotion — left/right (stay within the current line)', () => {
  it.each([
    ['left', 8, 1, 7],
    ['left', 8, 2, 6],
    ['left', 0, 1, 0], // clamped at line start
    ['right', 8, 1, 9],
    ['right', 8, 2, 10],
    ['right', 10, 2, 11], // clamped at line end
  ] as const)('%s from %i count=%i -> %i', (motion, caret, count, expected) => {
    expect(applyMotion(TEXT, caret, motion, count)).toBe(expected);
  });
});

describe('applyMotion — up/down (sticky column)', () => {
  it('down keeps the original column, clamped to the shorter target line', () => {
    // caret=8 is 'r' in "world" (col 8 on line0)
    expect(applyMotion(TEXT, 8, 'down', 1)).toBe(20); // line1 has only 8 cols -> clamps to line end
  });

  it('down x2 lands on the blank line regardless of column', () => {
    expect(applyMotion(TEXT, 8, 'down', 2)).toBe(21);
  });

  it('up keeps the original column across a blank line', () => {
    // caret=23 is 'a' in "baz" (col 1 on line3)
    expect(applyMotion(TEXT, 23, 'up', 1)).toBe(21); // line2 is blank -> clamps to its only position
    expect(applyMotion(TEXT, 23, 'up', 2)).toBe(13); // line1 col 1 = 'o' of "foo"
  });
});

describe('applyMotion — word-forward / word-back (vim w/b)', () => {
  it.each([
    ['word-forward', 0, 1, 6],
    ['word-forward', 0, 2, 12],
    ['word-back', 12, 1, 6],
    ['word-back', 12, 2, 0],
  ] as const)('%s from %i count=%i -> %i', (motion, caret, count, expected) => {
    expect(applyMotion(TEXT, caret, motion, count)).toBe(expected);
  });

  it('word-forward past the last word lands at text end', () => {
    expect(applyMotion(TEXT, 22, 'word-forward', 1)).toBe(TEXT.length);
  });

  it('word-back before the first word lands at 0', () => {
    expect(applyMotion(TEXT, 2, 'word-back', 1)).toBe(0);
  });
});

describe('applyMotion — word-end (vim e)', () => {
  it.each([
    ['word-end', 0, 1, 4], // end of "hello" itself, not the next word
    ['word-end', 0, 2, 10], // end of "world"
    ['word-end', 4, 1, 10], // already on the end -> jumps to the next word's end
  ] as const)('%s from %i count=%i -> %i', (motion, caret, count, expected) => {
    expect(applyMotion(TEXT, caret, motion, count)).toBe(expected);
  });
});

describe('applyMotion — line-start / line-end / first-nonblank ($/0/^) on line 2', () => {
  // line1 = "foo  bar" (note the double space between foo and bar; it is
  // interior, not leading, so ^ and 0 agree here).
  const caret = 17; // 'b' of "bar"

  it('line-start (0) -> first column of the line', () => {
    expect(applyMotion(TEXT, caret, 'line-start', 1)).toBe(12);
  });

  it('line-end ($) -> last character of the line', () => {
    expect(applyMotion(TEXT, caret, 'line-end', 1)).toBe(19); // 'r'
  });

  it('first-nonblank (^) -> same as line-start when there is no leading whitespace', () => {
    expect(applyMotion(TEXT, caret, 'first-nonblank', 1)).toBe(12);
  });

  it('first-nonblank skips real leading whitespace', () => {
    const indented = '  foo';
    expect(applyMotion(indented, 4, 'first-nonblank', 1)).toBe(2);
  });

  it('line-end on an empty line stays at its (only) position', () => {
    expect(applyMotion(TEXT, 21, 'line-end', 1)).toBe(21);
  });
});

describe('applyMotion — doc-start / doc-end (gg / G equivalents)', () => {
  it.each([0, 8, 24])('doc-start from %i -> 0', (caret) => {
    expect(applyMotion(TEXT, caret, 'doc-start', 1)).toBe(0);
  });

  it.each([0, 8, 24])('doc-end from %i -> text.length', (caret) => {
    expect(applyMotion(TEXT, caret, 'doc-end', 1)).toBe(TEXT.length);
  });
});

describe('applyMotion — paragraph-forward / paragraph-back (blank-line boundary)', () => {
  it.each([
    ['paragraph-forward', 0, 1, 21],
    ['paragraph-forward', 0, 2, 25],
    ['paragraph-back', 23, 1, 21],
    ['paragraph-back', 23, 2, 0],
  ] as const)('%s from %i count=%i -> %i', (motion, caret, count, expected) => {
    expect(applyMotion(TEXT, caret, motion, count)).toBe(expected);
  });
});

describe('applyMotion — line/selection are range-only (caret unchanged)', () => {
  it.each(['line', 'selection'] as EditorMotion[])('%s leaves caret unchanged', (motion) => {
    expect(applyMotion(TEXT, 15, motion, 1)).toBe(15);
  });
});

describe('motionRange — dw (vim word-forward delete semantics)', () => {
  it('dw from 0 deletes "hello " including the trailing space before the next word', () => {
    const range = motionRange(TEXT, 0, 'word-forward', 1);
    expect(range).toEqual([0, 6]);
    const { text, register } = applyOperator(TEXT, range, 'delete', '');
    expect(text).toBe('world\nfoo  bar\n\nbaz');
    expect(register).toBe('hello ');
  });

  it('dw on the last word of a line stops at end-of-line, not crossing the newline', () => {
    // caret=6 = start of "world", the last word on line0
    const range = motionRange(TEXT, 6, 'word-forward', 1);
    expect(range).toEqual([6, 11]);
    const { text, register } = applyOperator(TEXT, range, 'delete', '');
    expect(text).toBe('hello \nfoo  bar\n\nbaz');
    expect(register).toBe('world');
  });
});

describe('motionRange — dd (vim line delete semantics)', () => {
  it('dd on line 2 removes "foo  bar\\n"', () => {
    const range = motionRange(TEXT, 15, 'line', 1);
    expect(range).toEqual([12, 21]);
    const { text, register } = applyOperator(TEXT, range, 'delete', '');
    expect(text).toBe('hello world\n\nbaz');
    expect(register).toBe('foo  bar\n');
  });

  it('2dd on line 2 also consumes the blank line after it', () => {
    const range = motionRange(TEXT, 15, 'line', 2);
    expect(range).toEqual([12, 22]);
    const { register } = applyOperator(TEXT, range, 'delete', '');
    expect(register).toBe('foo  bar\n\n');
  });
});

describe('motionRange — de / d$ (inclusive of the end char)', () => {
  it('de deletes through the end of the current word', () => {
    expect(motionRange(TEXT, 0, 'word-end', 1)).toEqual([0, 5]); // "hello"
  });

  it('d$ deletes through the end of the line', () => {
    expect(motionRange(TEXT, 17, 'line-end', 1)).toEqual([17, 20]); // "bar"
  });
});

describe('motionRange — selection', () => {
  it('uses the given [start,end) regardless of order', () => {
    expect(motionRange(TEXT, 0, 'selection', 1, [10, 4])).toEqual([4, 10]);
  });

  it('collapses to the caret when no selection is given', () => {
    expect(motionRange(TEXT, 5, 'selection', 1)).toEqual([5, 5]);
  });
});

describe('applyOperator', () => {
  it('yank stores the range and leaves the text untouched', () => {
    const range = motionRange(TEXT, 12, 'line', 1);
    const result = applyOperator(TEXT, range, 'yank', '');
    expect(result.text).toBe(TEXT);
    expect(result.caret).toBe(12);
    expect(result.register).toBe('foo  bar\n');
  });

  it('change removes the range exactly like delete (caller enters INSERT)', () => {
    const range: [number, number] = [0, 5];
    const del = applyOperator(TEXT, range, 'delete', '');
    const change = applyOperator(TEXT, range, 'change', '');
    expect(change).toEqual(del);
  });
});
