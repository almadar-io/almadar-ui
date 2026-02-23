/**
 * WizardNavigation Component
 *
 * Navigation buttons for multi-step wizards.
 * Includes Back, Next, and Complete buttons with proper state handling.
 *
 * Emits events via useEventBus for trait integration.
 * Uses wireframe theme styling (high contrast, sharp edges).
 */
import React from "react";
export interface WizardNavigationProps {
    /** Current step index (0-based) */
    currentStep: number;
    /** Total number of steps */
    totalSteps: number;
    /** Whether the current step is valid (enables Next/Complete) */
    isValid?: boolean;
    /** Show the Back button */
    showBack?: boolean;
    /** Show the Next button */
    showNext?: boolean;
    /** Show the Complete button (on last step) */
    showComplete?: boolean;
    /** Custom label for Back button */
    backLabel?: string;
    /** Custom label for Next button */
    nextLabel?: string;
    /** Custom label for Complete button */
    completeLabel?: string;
    /** Event to emit on Back click */
    onBack?: string;
    /** Event to emit on Next click */
    onNext?: string;
    /** Event to emit on Complete click */
    onComplete?: string;
    /** Direct callback for Back (alternative to event) */
    onBackClick?: () => void;
    /** Direct callback for Next (alternative to event) */
    onNextClick?: () => void;
    /** Direct callback for Complete (alternative to event) */
    onCompleteClick?: () => void;
    /** Compact mode (smaller padding) */
    compact?: boolean;
    /** Additional CSS classes */
    className?: string;
}
/**
 * WizardNavigation - Wizard navigation buttons
 */
export declare const WizardNavigation: React.FC<WizardNavigationProps>;
export default WizardNavigation;
