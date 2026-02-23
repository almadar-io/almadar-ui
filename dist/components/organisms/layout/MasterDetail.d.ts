/**
 * MasterDetail Component
 *
 * Classic master-detail pattern with a list on the left
 * and selected item detail on the right.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */
import React from "react";
export interface MasterDetailProps {
    /** Master panel content (usually a list) */
    master: React.ReactNode;
    /** Detail panel content */
    detail: React.ReactNode;
    /** Content shown when nothing is selected */
    emptyDetail?: React.ReactNode;
    /** Whether an item is currently selected */
    hasSelection?: boolean;
    /** Width of master panel (e.g., '350px', '30%') */
    masterWidth?: string;
    /** Additional CSS classes */
    className?: string;
    /** Class for master pane */
    masterClassName?: string;
    /** Class for detail pane */
    detailClassName?: string;
}
/**
 * MasterDetail - List + detail split layout
 */
export declare const MasterDetail: React.FC<MasterDetailProps>;
export default MasterDetail;
