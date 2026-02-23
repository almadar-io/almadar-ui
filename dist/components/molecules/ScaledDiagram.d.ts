/**
 * ScaledDiagram Molecule
 *
 * Wraps a fixed-size diagram (like JazariStateMachine / StateMachineView)
 * and CSS-scales it to fit the parent container width.
 *
 * The diagram renders at its natural (large) size. We observe the content
 * element and once the diagram is measured we apply transform:scale() with
 * a corrected container height so surrounding layout flows correctly.
 *
 * Event Contract:
 * - No events emitted (layout-only wrapper)
 * - entityAware: false
 */
import React from 'react';
export interface ScaledDiagramProps {
    children: React.ReactNode;
    className?: string;
}
export declare const ScaledDiagram: React.FC<ScaledDiagramProps>;
