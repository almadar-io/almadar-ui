/**
 * GameShell
 *
 * A full-screen layout wrapper for game applications.
 * Replaces DashboardLayout for game clients — no sidebar nav, just full-viewport
 * rendering with an optional HUD overlay bar.
 *
 * Used as a React Router layout route element:
 *   <Route element={<GameShell appName="TraitWars" />}>
 *     <Route index element={<WorldMapPage />} />
 *     ...
 *   </Route>
 *
 * @generated pattern — can be customised per-game via props
 */
import React from "react";
export interface GameShellProps {
    /** Application / game title shown in the HUD bar */
    appName?: string;
    /** Optional HUD content rendered above the main area */
    hud?: React.ReactNode;
    /** Extra class name on the root container */
    className?: string;
    /** Whether to show the minimal top bar (default: true) */
    showTopBar?: boolean;
}
/**
 * Full-viewport game shell layout.
 *
 * Renders child routes via `<Outlet />` inside a full-height flex container.
 * An optional top bar shows the game title and can host HUD widgets.
 */
export declare const GameShell: React.FC<GameShellProps>;
