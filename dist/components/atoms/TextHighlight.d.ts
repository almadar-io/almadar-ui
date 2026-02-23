/**
 * TextHighlight Atom Component
 *
 * A styled span component for highlighting text with annotations (questions or notes).
 * Uses different colors for different annotation types:
 * - Questions: Blue highlight
 * - Notes: Yellow highlight
 */
import React from "react";
export type HighlightType = "question" | "note";
export interface TextHighlightProps {
    /**
     * Type of highlight (determines color)
     */
    highlightType: HighlightType;
    /**
     * Whether the highlight is currently active/focused
     * @default false
     */
    isActive?: boolean;
    /**
     * Callback when highlight is clicked
     */
    onClick?: () => void;
    /**
     * Callback when highlight is hovered
     */
    onMouseEnter?: () => void;
    /**
     * Callback when hover ends
     */
    onMouseLeave?: () => void;
    /**
     * Unique ID for the annotation
     */
    annotationId?: string;
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Highlighted text content
     */
    children: React.ReactNode;
    /** Declarative event name — emits UI:{action} via eventBus on click */
    action?: string;
    /** Declarative hover event — emits UI:{hoverEvent} with { hovered: true/false } */
    hoverEvent?: string;
}
/**
 * TextHighlight component for rendering highlighted text annotations
 */
export declare const TextHighlight: React.FC<TextHighlightProps>;
