/**
 * ViolationAlert
 *
 * Displays inspection violations with law references and action types.
 * Used in inspection forms to show detected compliance violations.
 *
 * Action Types:
 * - measure: Corrective measure required (warning)
 * - admin: Administrative action (error)
 * - penalty: Penalty proceedings (error, severe)
 */
import React from "react";
export interface ViolationRecord {
    /** Unique violation identifier */
    id: string;
    /** Law reference (e.g., "ZVPOT-1") */
    law: string;
    /** Article reference (e.g., "14/1") */
    article: string;
    /** Violation message */
    message: string;
    /** Action type determines severity */
    actionType: "measure" | "admin" | "penalty";
    /** Administrative action reference (e.g., "ZVPOT-1 234/1-4") */
    adminAction?: string;
    /** Penalty action reference (e.g., "ZVPOT-1 240/1-9") */
    penaltyAction?: string;
    /** Field that triggered this violation */
    fieldId?: string;
    /** Tab/form where violation occurred */
    tabId?: string;
}
export interface ViolationAlertProps {
    /** Violation data */
    violation: ViolationRecord;
    /** Visual severity (derived from actionType if not specified) */
    severity?: "warning" | "error";
    /** Dismissible alert */
    dismissible?: boolean;
    /** Dismiss handler */
    onDismiss?: () => void;
    /** Navigate to the field that caused violation */
    onNavigateToField?: (fieldId: string) => void;
    /** Compact display mode */
    compact?: boolean;
    /** Additional CSS classes */
    className?: string;
}
export declare const ViolationAlert: React.FC<ViolationAlertProps>;
