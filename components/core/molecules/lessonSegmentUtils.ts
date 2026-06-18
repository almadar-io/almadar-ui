/**
 * Utility for lesson-segment parsing: splits a markdown string into alternating
 * markdown and fenced-code-block segments. Exported so SegmentRenderer and
 * BloomQuizBlock can reuse without circular imports.
 */

export type MarkdownSegment = { type: 'markdown'; content: string };
export type CodeSegment = { type: 'code'; language: string; content: string; runnable?: boolean };
export type MixedSegment = MarkdownSegment | CodeSegment;

/** Splits markdown content into markdown and fenced-code-block segments. */
export function parseMarkdownWithCodeBlocks(content: string): MixedSegment[] {
  const segments: MixedSegment[] = [];
  const codeBlockRegex = /```([\w-]+)?(?:\s+(run))?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const before = content.slice(lastIndex, match.index);
    if (before.trim()) {
      segments.push({ type: 'markdown', content: before });
    }

    const rawLanguage = match[1] ?? 'text';
    const runModifier = !!match[2];
    const suffixRunnable = rawLanguage.endsWith('-runnable');
    const runnable = runModifier || suffixRunnable;
    const baseLanguage = suffixRunnable ? rawLanguage.slice(0, -'-runnable'.length) || 'text' : rawLanguage;

    segments.push({ type: 'code', language: baseLanguage, content: match[3].trim(), runnable });
    lastIndex = codeBlockRegex.lastIndex;
  }

  const remaining = content.slice(lastIndex);
  if (remaining.trim()) {
    segments.push({ type: 'markdown', content: remaining });
  }

  return segments;
}
