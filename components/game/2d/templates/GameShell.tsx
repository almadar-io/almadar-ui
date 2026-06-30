/**
 * GameShell
 *
 * A full-screen layout wrapper for game applications.
 * Replaces DashboardLayout for game clients — no sidebar nav, just full-viewport
 * rendering with an optional HUD overlay bar.
 *
 * Wrap game page content directly as children:
 *   <GameShell appName="TraitWars">
 *     <WorldMapPage />
 *   </GameShell>
 *
 * @generated pattern — can be customised per-game via props
 */

import React from "react";
import type { Asset } from "@almadar/core";
import { cn } from "../../../../lib/cn";
import { Box } from "../../../core/atoms/Box";
import { HStack } from "../../../core/atoms/Stack";
import { Typography } from "../../../core/atoms/Typography";

export interface GameShellProps {
    /** Application / game title shown in the HUD bar */
    appName?: string;
    /** Optional HUD content rendered above the main area */
    hud?: React.ReactNode;
    /** Extra class name on the root container */
    className?: string;
    /** Whether to show the minimal top bar (default: true) */
    showTopBar?: boolean;
    /** Game content rendered inside the full-screen area */
    children?: React.ReactNode;
    /** Background image for the shell/main area (e.g. Kenny panel frame). Falls back to CSS #0a0a0f. */
    backgroundAsset?: Asset;
    /** Background image for the HUD bar. Falls back to CSS #12121f surface color. */
    hudBackgroundAsset?: Asset;
}

/**
 * Full-viewport game shell layout.
 *
 * Renders children inside a full-height flex container.
 * An optional top bar shows the game title and can host HUD widgets.
 */
export const GameShell: React.FC<GameShellProps> = ({
    appName = "Game",
    hud,
    className,
    showTopBar = true,
    children,
    backgroundAsset,
    hudBackgroundAsset,
}) => {
    return (
        <Box
            display="flex"
            className={cn(
                "game-shell",
                "flex-col w-full h-screen overflow-hidden",
                className
            )}
            style={{
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                background: backgroundAsset
                    ? `url(${backgroundAsset.url}) center/cover no-repeat`
                    : "var(--color-background, #0a0a0f)",
                color: "var(--color-text, #e0e0e0)",
            }}
        >
            {/* Header region: title bar + HUD — both in normal flow, never overlapping the canvas */}
            {showTopBar && (
                <Box
                    className="game-shell__header"
                    style={{
                        flexShrink: 0,
                        background: hudBackgroundAsset
                            ? `url(${hudBackgroundAsset.url}) center/cover no-repeat`
                            : "var(--color-surface, #12121f)",
                        borderBottom: "1px solid var(--color-border, #2a2a3a)",
                    }}
                >
                    {/* Title strip */}
                    <HStack
                        align="center"
                        justify="between"
                        style={{ padding: "0.375rem 1rem" }}
                    >
                        <Typography
                            variant="h6"
                            style={{
                                fontWeight: 700,
                                letterSpacing: "0.02em",
                            }}
                        >
                            {appName}
                        </Typography>
                    </HStack>
                    {/* HUD bar — full-width row below the title, stays in normal flow */}
                    {hud && (
                        <Box className="game-shell__hud" style={{ width: "100%" }}>
                            {hud}
                        </Box>
                    )}
                </Box>
            )}

            {/* Main game area */}
            <Box
                className="game-shell__content"
                style={{
                    flex: 1,
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

GameShell.displayName = "GameShell";
