/** One line of a line-level diff between two texts. */
export interface LineDiffLine {
  type: 'added' | 'removed' | 'unchanged';
  beforeLineNumber?: number;
  afterLineNumber?: number;
  content: string;
}

const linesOf = (text: string): string[] => (text === '' ? [] : text.split('\n'));

/** Minimal LCS line diff — the one diff every diff view renders. Empty text has no lines. */
export function computeLineDiff(before: string, after: string): LineDiffLine[] {
  const beforeLines = linesOf(before);
  const afterLines = linesOf(after);
  const m = beforeLines.length;
  const n = afterLines.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = beforeLines[i] === afterLines[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const out: LineDiffLine[] = [];
  let i = 0;
  let j = 0;
  let bn = 1;
  let an = 1;
  while (i < m && j < n) {
    if (beforeLines[i] === afterLines[j]) {
      out.push({ type: 'unchanged', beforeLineNumber: bn++, afterLineNumber: an++, content: beforeLines[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: 'removed', beforeLineNumber: bn++, content: beforeLines[i++] });
    } else {
      out.push({ type: 'added', afterLineNumber: an++, content: afterLines[j++] });
    }
  }
  while (i < m) out.push({ type: 'removed', beforeLineNumber: bn++, content: beforeLines[i++] });
  while (j < n) out.push({ type: 'added', afterLineNumber: an++, content: afterLines[j++] });
  return out;
}
