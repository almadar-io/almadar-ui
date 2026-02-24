import { ClassValue } from 'clsx';

/**
 * Orbital State Machine Visualizer
 *
 * Renders SVG diagrams from Orbital schemas and Trait definitions.
 * Can be used in documentation, IDE previews, and other tools.
 */
interface VisualizerConfig {
    nodeRadius: number;
    nodeSpacing: number;
    initialIndicatorOffset: number;
    arrowSize: number;
    colors: {
        background: string;
        node: string;
        nodeBorder: string;
        nodeText: string;
        initialNode: string;
        finalNode: string;
        arrow: string;
        arrowText: string;
        effectText: string;
        guardText: string;
        initial: string;
    };
    fonts: {
        node: string;
        event: string;
        effect: string;
    };
}
interface StateDefinition {
    name: string;
    isInitial?: boolean;
    isFinal?: boolean;
    description?: string;
}
interface TransitionDefinition {
    from: string;
    to: string;
    event: string;
    guard?: unknown;
    effects?: unknown[];
}
interface StateMachineDefinition {
    states: StateDefinition[];
    transitions: TransitionDefinition[];
}
interface EntityDefinition {
    name: string;
    fields?: (string | {
        name: string;
    })[];
}
interface RenderOptions {
    title?: string;
    entity?: EntityDefinition;
}
/** Position data for a state node in DOM layout */
interface DomStateNode {
    id: string;
    name: string;
    x: number;
    y: number;
    radius: number;
    isInitial: boolean;
    isFinal: boolean;
    description?: string;
}
/** Position data for a transition arrow */
interface DomTransitionPath {
    id: string;
    from: string;
    to: string;
    /** SVG path data for the curved arrow */
    pathData: string;
    /** Midpoint for label positioning */
    labelX: number;
    labelY: number;
}
/** Position data for a transition label with guard/effect details */
interface DomTransitionLabel {
    id: string;
    from: string;
    to: string;
    event: string;
    x: number;
    y: number;
    /** Human-readable guard text (e.g., "if amount > 100") */
    guardText?: string;
    /** Human-readable effect texts */
    effectTexts: string[];
    /** Whether this transition has details to show in tooltip */
    hasDetails: boolean;
}
/** Entity input box data */
interface DomEntityBox {
    name: string;
    fields: string[];
    x: number;
    y: number;
    width: number;
    height: number;
}
/** Output effects box data */
interface DomOutputsBox {
    outputs: string[];
    x: number;
    y: number;
    width: number;
    height: number;
}
/** Complete DOM layout data for rendering */
interface DomLayoutData {
    width: number;
    height: number;
    title?: string;
    states: DomStateNode[];
    paths: DomTransitionPath[];
    labels: DomTransitionLabel[];
    entity?: DomEntityBox;
    outputs?: DomOutputsBox;
    config: VisualizerConfig;
}
declare const DEFAULT_CONFIG: VisualizerConfig;
declare function formatGuard(guard: unknown): string;
declare function getEffectSummary(effects: unknown[]): string;
declare function extractOutputsFromTransitions(transitions: TransitionDefinition[]): string[];
/**
 * Render a state machine to an SVG string.
 * Works in both browser and Node.js environments.
 */
declare function renderStateMachineToSvg(stateMachine: StateMachineDefinition, options?: RenderOptions, config?: VisualizerConfig): string;
/**
 * Extract state machine from various data formats (Trait, Orbital, or raw)
 */
declare function extractStateMachine(data: unknown): StateMachineDefinition | null;
/**
 * Render a state machine to DOM layout data.
 * This is used by the DOM-based visualizer component for hybrid SVG/DOM rendering.
 * Unlike renderStateMachineToSvg, this returns structured data instead of an SVG string.
 */
declare function renderStateMachineToDomData(stateMachine: StateMachineDefinition, options?: RenderOptions, config?: VisualizerConfig): DomLayoutData;

/**
 * Content Segment Parsing Utilities
 *
 * Parses rich content with code blocks and quiz tags into structured
 * segments for rendering. Detects orbital schemas in JSON code blocks
 * and marks them for JazariStateMachine rendering.
 */
/** Segment types for content rendering */
type ContentSegment = {
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
declare function parseMarkdownWithCodeBlocks(content: string | undefined | null): ContentSegment[];
/**
 * Parse content to extract all segments including quiz tags and code blocks.
 *
 * Supported tags:
 * - <question>q</question><answer>a</answer> — Quiz Q&A
 *
 * Also handles fenced code blocks (```language...```) with orbital detection.
 */
declare function parseContentSegments(content: string | undefined | null): ContentSegment[];

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge to handle conflicts
 */
declare function cn(...inputs: ClassValue[]): string;

export { type ContentSegment as C, DEFAULT_CONFIG as D, type EntityDefinition as E, type RenderOptions as R, type StateDefinition as S, type TransitionDefinition as T, type VisualizerConfig as V, type DomEntityBox as a, type DomLayoutData as b, type DomOutputsBox as c, type DomStateNode as d, type DomTransitionLabel as e, type DomTransitionPath as f, type StateMachineDefinition as g, cn as h, extractOutputsFromTransitions as i, extractStateMachine as j, formatGuard as k, getEffectSummary as l, parseMarkdownWithCodeBlocks as m, renderStateMachineToSvg as n, parseContentSegments as p, renderStateMachineToDomData as r };
