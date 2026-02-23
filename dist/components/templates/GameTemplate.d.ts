/**
 * GameTemplate
 *
 * A presentational template for game applications.
 * Includes a main game canvas/area, HUD overlay, and an optional debug sidebar.
 * **Atomic Design**: Composed using Box, Typography, and Layout molecules/atoms.
 */
import React from "react";
import type { TemplateProps } from "./types";
interface GameEntity {
    id: string;
    title?: string;
}
export interface GameTemplateProps extends TemplateProps<GameEntity> {
    /** Title of the game */
    title?: string;
    /** The main game canvas or content */
    children: React.ReactNode;
    /** HUD overlay content (scores, health, etc.) */
    hud?: React.ReactNode;
    /** Debug panel content */
    debugPanel?: React.ReactNode;
    /** Whether the debug panel is visible */
    showDebugPanel?: boolean;
    /** Game controls */
    controls?: {
        onPlay?: () => void;
        onPause?: () => void;
        onReset?: () => void;
        isPlaying?: boolean;
    };
    /** Additional class name */
    className?: string;
}
export declare const GameTemplate: React.FC<GameTemplateProps>;
export {};
