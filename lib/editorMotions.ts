/**
 * Pure vim-flavored editor motion module. No DOM — `CodeBlock.tsx` drives a
 * real `<textarea>` selection through this (Almadar Studio V4 §14 plan, P1
 * E2); this module only computes offsets and text.
 *
 * Caret convention: an integer offset in `[0, text.length]`, a gap position
 * (matches `textarea.selectionStart`) — except `word-end` and `line-end`,
 * which land ON the index of their target character (vim's `e`/`$` block-
 * cursor convention), so `motionRange` widens those by one to make an
 * operator's range inclusive of that char.
 */

export type EditorMotion =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'word-forward'
  | 'word-back'
  | 'word-end'
  | 'line-start'
  | 'line-end'
  | 'first-nonblank'
  | 'doc-start'
  | 'doc-end'
  | 'paragraph-forward'
  | 'paragraph-back'
  | 'line'
  | 'selection';

export type EditorOperator = 'delete' | 'yank' | 'change';

interface Line {
  start: number;
  /** Index of the line's `\n`, or `text.length` for the last line — never includes the `\n` itself. */
  end: number;
}

interface Word {
  start: number;
  end: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeLines(text: string): Line[] {
  const lines: Line[] = [];
  let start = 0;
  for (let i = 0; i <= text.length; i++) {
    if (i === text.length || text[i] === '\n') {
      lines.push({ start, end: i });
      start = i + 1;
    }
  }
  return lines;
}

function lineIndexAt(lines: Line[], pos: number): number {
  for (let i = 0; i < lines.length; i++) {
    if (pos <= lines[i].end) return i;
  }
  return lines.length - 1;
}

/** Vim word = `\w+` (identifier run) or `\S+` (other non-space run); `\s` (incl. `\n`) separates. */
function findWords(text: string): Word[] {
  const words: Word[] = [];
  const re = /\w+|\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    words.push({ start: m.index, end: m.index + m[0].length });
  }
  return words;
}

function nextWordStart(text: string, pos: number): number {
  for (const w of findWords(text)) {
    if (w.start > pos) return w.start;
  }
  return text.length;
}

function prevWordStart(text: string, pos: number): number {
  let result = 0;
  for (const w of findWords(text)) {
    if (w.start < pos) result = w.start;
    else break;
  }
  return result;
}

function nextWordEnd(text: string, pos: number): number {
  for (const w of findWords(text)) {
    const lastChar = w.end - 1;
    if (lastChar > pos) return lastChar;
  }
  return text.length > 0 ? text.length - 1 : 0;
}

function firstNonBlank(text: string, line: Line): number {
  let i = line.start;
  while (i < line.end && (text[i] === ' ' || text[i] === '\t')) i++;
  return i;
}

function nextParagraphBoundary(lines: Line[], fromLineIdx: number, textLength: number): number {
  for (let i = fromLineIdx + 1; i < lines.length; i++) {
    if (lines[i].start === lines[i].end) return lines[i].start;
  }
  return textLength;
}

function prevParagraphBoundary(lines: Line[], fromLineIdx: number): number {
  for (let i = fromLineIdx - 1; i >= 0; i--) {
    if (lines[i].start === lines[i].end) return lines[i].start;
  }
  return 0;
}

/** New caret offset after applying `motion` `count` times. `line`/`selection` are range-only — caret is unchanged. */
export function applyMotion(text: string, caret: number, motion: EditorMotion, count: number): number {
  const n = Math.max(1, count);
  const lines = computeLines(text);
  const lineIdx = lineIndexAt(lines, caret);
  const line = lines[lineIdx];

  switch (motion) {
    case 'left':
      return clamp(caret - n, line.start, line.end);
    case 'right':
      return clamp(caret + n, line.start, line.end);
    case 'up': {
      // Sticky column: the target column is fixed from the ORIGINAL caret,
      // not re-derived after each intermediate line (matches vim `nj`).
      const col = caret - line.start;
      const targetIdx = clamp(lineIdx - n, 0, lines.length - 1);
      const target = lines[targetIdx];
      return clamp(target.start + col, target.start, target.end);
    }
    case 'down': {
      const col = caret - line.start;
      const targetIdx = clamp(lineIdx + n, 0, lines.length - 1);
      const target = lines[targetIdx];
      return clamp(target.start + col, target.start, target.end);
    }
    case 'word-forward': {
      let pos = caret;
      for (let i = 0; i < n; i++) pos = nextWordStart(text, pos);
      return pos;
    }
    case 'word-back': {
      let pos = caret;
      for (let i = 0; i < n; i++) pos = prevWordStart(text, pos);
      return pos;
    }
    case 'word-end': {
      let pos = caret;
      for (let i = 0; i < n; i++) pos = nextWordEnd(text, pos);
      return pos;
    }
    case 'line-start':
      return line.start;
    case 'line-end':
      return line.end > line.start ? line.end - 1 : line.start;
    case 'first-nonblank':
      return firstNonBlank(text, line);
    case 'doc-start':
      return 0;
    case 'doc-end':
      return text.length;
    case 'paragraph-forward': {
      let pos = caret;
      for (let i = 0; i < n; i++) {
        pos = nextParagraphBoundary(lines, lineIndexAt(lines, pos), text.length);
      }
      return pos;
    }
    case 'paragraph-back': {
      let pos = caret;
      for (let i = 0; i < n; i++) {
        pos = prevParagraphBoundary(lines, lineIndexAt(lines, pos));
      }
      return pos;
    }
    case 'line':
    case 'selection':
      return caret;
    default: {
      const _exhaustive: never = motion;
      return _exhaustive;
    }
  }
}

/** The `[start, end)` range an operator acts on for `motion`. */
export function motionRange(
  text: string,
  caret: number,
  motion: EditorMotion,
  count: number,
  selection?: [number, number],
): [number, number] {
  if (motion === 'selection') {
    if (!selection) return [caret, caret];
    return [Math.min(selection[0], selection[1]), Math.max(selection[0], selection[1])];
  }

  const lines = computeLines(text);

  if (motion === 'line') {
    const n = Math.max(1, count);
    const startIdx = lineIndexAt(lines, caret);
    const endIdx = clamp(startIdx + n - 1, 0, lines.length - 1);
    const start = lines[startIdx].start;
    const rawEnd = lines[endIdx].end;
    // Include the trailing `\n` when one exists, so `dd` removes the whole line.
    const end = rawEnd < text.length ? rawEnd + 1 : rawEnd;
    return [start, end];
  }

  const newCaret = applyMotion(text, caret, motion, count);
  let start = Math.min(caret, newCaret);
  let end = Math.max(caret, newCaret);

  if (motion === 'word-end' || motion === 'line-end') {
    // applyMotion lands ON the target char; widen by one to include it.
    end = Math.min(Math.max(start, newCaret) + 1, text.length);
  } else if (motion === 'word-forward' && newCaret > caret) {
    // vim `dw`: a word-forward that would cross into the next line stops at
    // the end of the current line instead of swallowing its `\n`.
    const startLine = lineIndexAt(lines, caret);
    const endLine = lineIndexAt(lines, newCaret);
    if (endLine !== startLine) {
      end = lines[startLine].end;
    }
  }

  return [start, end];
}

/** Apply `operator` over `range`. `delete`/`change` remove and store; `yank` only stores. */
export function applyOperator(
  text: string,
  range: [number, number],
  operator: EditorOperator,
  register: string,
): { text: string; caret: number; register: string } {
  const start = clamp(range[0], 0, text.length);
  const end = clamp(range[1], start, text.length);
  const removed = text.slice(start, end);

  if (operator === 'yank') {
    return { text, caret: start, register: removed };
  }

  // 'delete' and 'change' both remove; the caller switches to INSERT mode for 'change'.
  return { text: text.slice(0, start) + text.slice(end), caret: start, register: removed };
}
