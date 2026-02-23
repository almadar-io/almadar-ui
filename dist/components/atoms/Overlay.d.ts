/**
 * Overlay Atom Component
 *
 * A fixed backdrop for modals and drawers.
 */
import React from "react";
export interface OverlayProps {
    isVisible?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    blur?: boolean;
    /** Declarative event name — emits UI:{action} via eventBus on click */
    action?: string;
}
export declare const Overlay: React.FC<OverlayProps>;
export default Overlay;
