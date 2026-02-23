/**
 * StateMachineView - Reusable State Machine Visualizer
 *
 * A hybrid DOM/SVG component for visualizing state machines.
 * Uses SVG for arrow paths, DOM for tooltips.
 *
 * Moved from projects/builder to @almadar/ui for reuse across projects.
 *
 * BUNDLING: When multiple transitions exist between the same states (same direction),
 * they are bundled into a single arrow with a badge showing the count.
 * Hovering shows all events and their effects in a detailed tooltip.
 *
 * Events Emitted:
 * - UI:STATE_CLICK - When a state node is clicked
 * - UI:TRANSITION_CLICK - When a transition bundle is clicked
 */
import React from 'react';
import type { DomLayoutData, DomStateNode, DomTransitionLabel, VisualizerConfig } from '../../lib/visualizer/index.js';
import type { EntityDisplayProps } from './types';
/** Bundled transitions between same from→to states */
export interface TransitionBundle {
    id: string;
    from: string;
    to: string;
    labels: DomTransitionLabel[];
    isBidirectional: boolean;
    isReverse: boolean;
}
export interface StateMachineViewProps extends EntityDisplayProps {
    layoutData: DomLayoutData;
    /** Custom state node renderer — when provided, replaces the default circle nodes */
    renderStateNode?: (state: DomStateNode, config: VisualizerConfig) => React.ReactNode;
}
export declare const StateMachineView: React.FC<StateMachineViewProps>;
export { StateMachineView as DomStateMachineVisualizer };
export { StateMachineView as OrbitalStateMachineView };
