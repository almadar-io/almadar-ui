/**
 * GameShell — thin fullscreen game SURFACE.
 *
 * Contributes positioning + the game skin (Kenney font, 9-slice panel chrome, floating overlays)
 * and nothing else: the canvas fills the viewport underneath; composed atoms/molecules land in
 * overlay slots. `hud` floats top; `addons` floats bottom-right (action cluster). Dumb: props in,
 * layout out — no descriptor resolution, no runtime logic.
 */

import React from "react";
import type { Asset } from "@almadar/core";
import { cn } from "../../../../lib/cn";
import { Box } from "../../../core/atoms/Box";
import { Typography } from "../../../core/atoms/Typography";
import { AtlasPanel } from "../../../core/atoms/AtlasImage";

const FONT_BASE = "https://almadar-kflow-assets.web.app/shared/_shared/kenney-fonts/fonts";

const GAME_FONTS: Record<string, string> = {
    future: "Kenney Future",
    "future-narrow": "Kenney Future Narrow",
    pixel: "Kenney Pixel",
    blocks: "Kenney Blocks",
    mini: "Kenney Mini",
};

const FONT_FACES = `
@font-face { font-family: 'Kenney Future'; src: url('${FONT_BASE}/Kenney%20Future.ttf') format('truetype'); font-display: swap; }
@font-face { font-family: 'Kenney Future Narrow'; src: url('${FONT_BASE}/Kenney%20Future%20Narrow.ttf') format('truetype'); font-display: swap; }
@font-face { font-family: 'Kenney Pixel'; src: url('${FONT_BASE}/Kenney%20Pixel.ttf') format('truetype'); font-display: swap; }
@font-face { font-family: 'Kenney Blocks'; src: url('${FONT_BASE}/Kenney%20Blocks.ttf') format('truetype'); font-display: swap; }
@font-face { font-family: 'Kenney Mini'; src: url('${FONT_BASE}/Kenney%20Mini.ttf') format('truetype'); font-display: swap; }
.game-shell, .game-shell * { font-family: inherit; }
`;

export interface GameShellProps {
    /** Application / game title shown as a floating chip */
    appName?: string;
    /** Stat chips row — floats along the top edge */
    hud?: React.ReactNode;
    /** Action cluster — floats bottom-right (End Turn, Fire, Reset, …) */
    addons?: React.ReactNode;
    /** Movement controls — floats bottom-left (d-pad / control-grid). */
    controls?: React.ReactNode;
    /** Centered overlay layer (victory/defeat banners, dialogs). */
    overlay?: React.ReactNode;
    /** Extra class name on the root container */
    className?: string;
    /** Whether to show the title chip (default: true) */
    showTopBar?: boolean;
    /** Game content — fills the whole surface underneath the overlays */
    children?: React.ReactNode;
    /** Pattern slice tiled at low opacity across the surface (never cover-stretched). */
    backgroundAsset?: Asset;
    /** 9-sliced panel skin for the HUD chips row + title chip. */
    hudBackgroundAsset?: Asset;
    /** Game font key (future | future-narrow | pixel | blocks | mini) or a CSS font-family. */
    fontFamily?: string;
}

export const GameShell: React.FC<GameShellProps> = ({
    appName = "Game",
    hud,
    addons,
    controls,
    overlay,
    className,
    showTopBar = true,
    children,
    backgroundAsset,
    hudBackgroundAsset,
    fontFamily = "future",
}) => {
    const font = GAME_FONTS[fontFamily] ?? fontFamily;
    return (
        <Box
            className={cn("game-shell", className)}
            style={{
                position: "relative",
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                background: "var(--color-background, #0a0a0f)",
                color: "var(--color-text, #e0e0e0)",
                fontFamily: `'${font}', system-ui, sans-serif`,
            }}
        >
            <style>{FONT_FACES}</style>

            {/* Optional tiled pattern — subtle game-table texture, never a stretched slice. */}
            {backgroundAsset && (
                <AtlasPanel
                    asset={backgroundAsset}
                    mode="repeat"
                    aria-hidden
                    className="game-shell__bg"
                    style={{ position: "absolute", inset: 0, opacity: 0.18, zIndex: 0, display: "block" }}
                />
            )}

            {/* Game surface — the canvas owns the full viewport. */}
            <Box className="game-shell__content" style={{ position: "absolute", inset: 0, zIndex: 1 }}>
                {children}
            </Box>

            {/* Floating top overlay: title chip + HUD chips. */}
            {(showTopBar || hud) && (
                <Box
                    className="game-shell__top pointer-events-none"
                    style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        right: 12,
                        zIndex: 2,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                    }}
                >
                    {showTopBar && (
                        <AtlasPanel
                            asset={hudBackgroundAsset}
                            borderSlice={12}
                            borderWidth={10}
                            className="game-shell__title pointer-events-auto"
                            style={{
                                padding: "6px 16px",
                                background: hudBackgroundAsset ? undefined : "rgba(18, 18, 31, 0.85)",
                                borderRadius: hudBackgroundAsset ? undefined : 10,
                                boxShadow: "0 4px 14px rgba(0,0,0,0.45)",
                                flexShrink: 0,
                            }}
                        >
                            <Typography
                                as="span"
                                style={{
                                    fontWeight: 700,
                                    fontSize: "1.05rem",
                                    letterSpacing: "0.06em",
                                    textShadow: "0 2px 0 rgba(0,0,0,0.5)",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {appName}
                            </Typography>
                        </AtlasPanel>
                    )}
                    {hud && (
                        <Box className="game-shell__hud pointer-events-auto" style={{ flex: 1, minWidth: 0 }}>
                            {hud}
                        </Box>
                    )}
                </Box>
            )}

            {/* Floating bottom-left movement controls (d-pad / control-grid). */}
            {controls && (
                <Box
                    className="game-shell__controls pointer-events-auto"
                    style={{
                        position: "absolute",
                        left: 16,
                        bottom: 16,
                        zIndex: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 10,
                        filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.5))",
                    }}
                >
                    {controls}
                </Box>
            )}

            {/* Floating bottom-right action cluster. */}
            {addons && (
                <Box
                    className="game-shell__actions pointer-events-auto"
                    style={{
                        position: "absolute",
                        right: 16,
                        bottom: 16,
                        zIndex: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 10,
                        filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.5))",
                    }}
                >
                    {addons}
                </Box>
            )}

            {/* Centered overlay layer — banners/dialogs; container never blocks the canvas. */}
            {overlay && (
                <Box
                    className="game-shell__overlay pointer-events-none"
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Box className="pointer-events-auto">{overlay}</Box>
                </Box>
            )}
        </Box>
    );
};

GameShell.displayName = "GameShell";
