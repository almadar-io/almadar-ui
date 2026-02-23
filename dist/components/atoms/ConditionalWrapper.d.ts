/**
 * ConditionalWrapper Atom Component
 *
 * A wrapper component that conditionally renders its children based on
 * S-expression evaluation. Used for dynamic field visibility in inspection forms.
 */
import React from 'react';
import { type SExpr } from '@almadar/evaluator';
/**
 * Context for conditional evaluation
 */
export interface ConditionalContext {
    formValues: Record<string, unknown>;
    globalVariables: Record<string, unknown>;
    localVariables?: Record<string, unknown>;
    entity?: Record<string, unknown>;
}
export interface ConditionalWrapperProps {
    /** The S-expression condition to evaluate */
    condition?: SExpr;
    /** Context for evaluating the condition */
    context: ConditionalContext;
    /** Children to render when condition is true (or when no condition is provided) */
    children: React.ReactNode;
    /** Optional fallback to render when condition is false */
    fallback?: React.ReactNode;
    /** Whether to animate the transition (uses CSS transitions) */
    animate?: boolean;
}
/**
 * ConditionalWrapper conditionally renders children based on S-expression evaluation.
 *
 * Supported bindings:
 * - @entity.formValues.fieldId - Access form field values
 * - @entity.globalVariables.HG_VAR - Access global inspection variables
 * - @entity.localVariables.H_VAR - Access document-local variables
 * - @state - Current state machine state
 * - @now - Current timestamp
 *
 * @example
 * // Simple condition - show field when another field equals a value
 * <ConditionalWrapper
 *   condition={["=", "@entity.formValues.vehicleType", "commercial"]}
 *   context={{ formValues: { vehicleType: "commercial" }, globalVariables: {} }}
 * >
 *   <Input name="commercialLicenseNumber" />
 * </ConditionalWrapper>
 *
 * @example
 * // With fallback - show message when condition not met
 * <ConditionalWrapper
 *   condition={[">=", "@entity.formValues.loadWeight", 3500]}
 *   context={formContext}
 *   fallback={<Typography variant="small">Load weight must be at least 3500kg</Typography>}
 * >
 *   <HeavyVehicleFields />
 * </ConditionalWrapper>
 *
 * @example
 * // Using global variables for cross-form conditions
 * <ConditionalWrapper
 *   condition={["=", "@entity.globalVariables.HG_POTROSNIKI", "DA"]}
 *   context={{ formValues: {}, globalVariables: { HG_POTROSNIKI: "DA" } }}
 * >
 *   <PriceMarkingSection />
 * </ConditionalWrapper>
 */
export declare const ConditionalWrapper: React.FC<ConditionalWrapperProps>;
