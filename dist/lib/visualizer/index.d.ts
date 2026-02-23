/**
 * Orbital State Machine Visualizer
 *
 * Renders SVG diagrams from Orbital schemas and Trait definitions.
 * Can be used in documentation, IDE previews, and other tools.
 */
export interface VisualizerConfig {
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
export interface StateDefinition {
    name: string;
    isInitial?: boolean;
    isFinal?: boolean;
    description?: string;
}
export interface TransitionDefinition {
    from: string;
    to: string;
    event: string;
    guard?: unknown;
    effects?: unknown[];
}
export interface StateMachineDefinition {
    states: StateDefinition[];
    transitions: TransitionDefinition[];
}
export interface EntityDefinition {
    name: string;
    fields?: (string | {
        name: string;
    })[];
}
export interface RenderOptions {
    title?: string;
    entity?: EntityDefinition;
}
/** Position data for a state node in DOM layout */
export interface DomStateNode {
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
export interface DomTransitionPath {
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
export interface DomTransitionLabel {
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
export interface DomEntityBox {
    name: string;
    fields: string[];
    x: number;
    y: number;
    width: number;
    height: number;
}
/** Output effects box data */
export interface DomOutputsBox {
    outputs: string[];
    x: number;
    y: number;
    width: number;
    height: number;
}
/** Complete DOM layout data for rendering */
export interface DomLayoutData {
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
export declare const DEFAULT_CONFIG: VisualizerConfig;
declare function formatGuard(guard: unknown): string;
export declare function getEffectSummary(effects: unknown[]): string;
declare function extractOutputsFromTransitions(transitions: TransitionDefinition[]): string[];
/**
 * Render a state machine to an SVG string.
 * Works in both browser and Node.js environments.
 */
export declare function renderStateMachineToSvg(stateMachine: StateMachineDefinition, options?: RenderOptions, config?: VisualizerConfig): string;
/**
 * Extract state machine from various data formats (Trait, Orbital, or raw)
 */
export declare function extractStateMachine(data: unknown): StateMachineDefinition | null;
/**
 * Render a state machine to DOM layout data.
 * This is used by the DOM-based visualizer component for hybrid SVG/DOM rendering.
 * Unlike renderStateMachineToSvg, this returns structured data instead of an SVG string.
 */
export declare function renderStateMachineToDomData(stateMachine: StateMachineDefinition, options?: RenderOptions, config?: VisualizerConfig): DomLayoutData;
export { formatGuard, extractOutputsFromTransitions };
