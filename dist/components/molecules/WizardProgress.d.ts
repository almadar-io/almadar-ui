/**
 * WizardProgress Component
 *
 * Step progress indicator for multi-step wizards.
 * Shows current step, completed steps, and allows navigation to completed steps.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */
import React from "react";
/**
 * Step info needed by WizardProgress.
 * Compatible with WizardContainer's WizardStep (subset of fields).
 */
export interface WizardProgressStep {
    /** Step identifier */
    id: string;
    /** Step title */
    title: string;
    /** Step description (optional) */
    description?: string;
}
export interface WizardProgressProps {
    /** Step definitions (compatible with WizardContainer's WizardStep) */
    steps: WizardProgressStep[];
    /** Current step index (0-based) */
    currentStep: number;
    /** Callback when a completed step is clicked */
    onStepClick?: (stepIndex: number) => void;
    /** Allow clicking on completed steps to navigate back */
    allowNavigation?: boolean;
    /** Compact mode (smaller, no titles) */
    compact?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Declarative step click event — emits UI:{stepClickEvent} with { stepIndex } */
    stepClickEvent?: string;
}
/**
 * WizardProgress - Step progress indicator
 */
export declare const WizardProgress: React.FC<WizardProgressProps>;
export default WizardProgress;
