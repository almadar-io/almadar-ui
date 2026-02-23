/**
 * SplitPane Component
 *
 * Two-pane resizable split layout for master-detail views,
 * dual-pane editors, and code + preview layouts.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */
import React from "react";
export interface SplitPaneProps {
    /** Direction of the split */
    direction?: "horizontal" | "vertical";
    /** Initial ratio (0-100, percentage of first pane) */
    ratio?: number;
    /** Minimum size of either pane in pixels */
    minSize?: number;
    /** Allow user resizing */
    resizable?: boolean;
    /** Content for the left/top pane */
    left: React.ReactNode;
    /** Content for the right/bottom pane */
    right: React.ReactNode;
    /** Additional CSS classes */
    className?: string;
    /** Class for left/top pane */
    leftClassName?: string;
    /** Class for right/bottom pane */
    rightClassName?: string;
}
/**
 * SplitPane - Two-pane resizable layout
 */
export declare const SplitPane: React.FC<SplitPaneProps>;
export default SplitPane;
