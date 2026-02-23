/**
 * LawReferenceTooltip Atom Component
 *
 * A specialized tooltip for displaying law references in inspection forms.
 * Shows law name, article number, and relevant clause text.
 */
import React from "react";
/**
 * Law reference definition
 */
export interface LawReference {
    /** Law identifier (e.g., "VVO", "TPED") */
    law: string;
    /** Full name of the law */
    lawName?: string;
    /** Article number (e.g., "§8", "Artikel 5") */
    article: string;
    /** Clause or paragraph text */
    clause?: string;
    /** Optional link to full law text */
    link?: string;
}
export interface LawReferenceTooltipProps {
    /** The law reference to display */
    reference: LawReference;
    /** Children element that triggers the tooltip */
    children: React.ReactNode;
    /** Tooltip position */
    position?: "top" | "bottom" | "left" | "right";
    /** Additional CSS classes */
    className?: string;
}
/**
 * LawReferenceTooltip displays legal references with structured formatting.
 *
 * @example
 * <LawReferenceTooltip
 *   reference={{
 *     law: "VVO",
 *     lawName: "Verkehrsverordnung",
 *     article: "§8 Abs. 3",
 *     clause: "Die zulässige Gesamtmasse darf 3500 kg nicht überschreiten."
 *   }}
 * >
 *   <Typography variant="small" className="text-blue-600 underline cursor-help">VVO §8</Typography>
 * </LawReferenceTooltip>
 */
export declare const LawReferenceTooltip: React.FC<LawReferenceTooltipProps>;
