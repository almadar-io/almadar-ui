/**
 * Content Segment Parsing Utilities
 *
 * Parses rich content with code blocks and quiz tags into structured
 * segments for rendering. Detects orbital schemas in JSON code blocks
 * and marks them for JazariStateMachine rendering.
 */
/** Segment types for content rendering */
export type ContentSegment = {
    type: 'markdown';
    content: string;
} | {
    type: 'code';
    language: string;
    content: string;
} | {
    type: 'orbital';
    language: string;
    content: string;
    schema: unknown;
} | {
    type: 'quiz';
    question: string;
    answer: string;
};
/**
 * Parse markdown content to extract code blocks.
 *
 * Splits markdown into segments of plain markdown and fenced code blocks.
 * JSON/orb code blocks containing orbital schemas are tagged as 'orbital'.
 */
export declare function parseMarkdownWithCodeBlocks(content: string | undefined | null): ContentSegment[];
/**
 * Parse content to extract all segments including quiz tags and code blocks.
 *
 * Supported tags:
 * - <question>q</question><answer>a</answer> — Quiz Q&A
 *
 * Also handles fenced code blocks (```language...```) with orbital detection.
 */
export declare function parseContentSegments(content: string | undefined | null): ContentSegment[];
