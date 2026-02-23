/**
 * Avatar Atom Component
 *
 * A versatile avatar component supporting images, initials, icons, and status indicators.
 */
import React from "react";
import type { LucideIcon } from "lucide-react";
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarStatus = "online" | "offline" | "away" | "busy";
export interface AvatarProps {
    /**
     * Image source URL
     */
    src?: string;
    /**
     * Alt text for the image
     */
    alt?: string;
    /**
     * Full name - initials will be generated automatically
     */
    name?: string;
    /**
     * Initials to display (e.g., "JD" for John Doe)
     * If not provided but name is, initials will be auto-generated
     */
    initials?: string;
    /**
     * Icon to display when no image or initials
     */
    icon?: LucideIcon;
    /**
     * Size of the avatar
     * @default 'md'
     */
    size?: AvatarSize;
    /**
     * Status indicator
     */
    status?: AvatarStatus;
    /**
     * Badge content (e.g., notification count)
     */
    badge?: string | number;
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Click handler
     */
    onClick?: () => void;
    /** Declarative event name — emits UI:{action} via eventBus on click */
    action?: string;
    /** Payload to include with the action event */
    actionPayload?: Record<string, unknown>;
}
export declare const Avatar: React.FC<AvatarProps>;
