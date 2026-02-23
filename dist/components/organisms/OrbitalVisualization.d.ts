/**
 * OrbitalVisualization Component
 *
 * Visualizes KFlow schemas as atomic orbitals based on complexity.
 * Uses CSS 3D transforms for lightweight rendering without Three.js.
 *
 * Orbital Types (based on complexity score):
 * - 1s (1-3): Simple sphere - Red
 * - 2s (4-8): Larger sphere - Orange
 * - 2p (9-15): Dumbbell shape - Yellow
 * - 3s (16-25): Sphere with node - Green
 * - 3p (26-40): Complex dumbbell - Blue
 * - 3d (41-60): Cloverleaf - Indigo
 * - 4f (61+): Multi-lobe - Violet
 */
import React from "react";
export interface OrbitalVisualizationProps {
    /** Full KFlow schema object */
    schema?: {
        dataEntities?: unknown[];
        ui?: {
            pages?: {
                sections?: unknown[];
            }[];
        };
        traits?: unknown[];
    };
    /** Direct complexity override (1-100+) */
    complexity?: number;
    /** Size of the visualization */
    size?: "sm" | "md" | "lg" | "xl";
    /** Show complexity label */
    showLabel?: boolean;
    /** Animation enabled */
    animated?: boolean;
    /** Click handler */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
export declare const OrbitalVisualization: React.FC<OrbitalVisualizationProps>;
export default OrbitalVisualization;
