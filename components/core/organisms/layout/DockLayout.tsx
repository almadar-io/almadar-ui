'use client';
/**
 * DockLayout Component
 *
 * Lean multi-region app frame: far-left rail, collapsible/resizable sidebar,
 * required main, collapsible/resizable bottom panel, slim status bar, and a
 * collapsible right secondary sidebar. Resizable boundaries are delegated to
 * SplitPane (same directory) — DockLayout owns no drag/resize math itself.
 *
 * sidebarWidth/bottomPanelHeight are SplitPane ratio values (0-100), not
 * pixels: they pass straight through to SplitPane's `ratio` contract so the
 * boundary math stays owned by SplitPane.
 */
import React from "react";
import { Box } from "../../atoms/Box";
import { HStack, VStack } from "../../atoms/Stack";
import { cn } from "../../../../lib/cn";
import { SplitPane } from "./SplitPane";

export interface DockLayoutProps {
  /** Fixed-width far-left vertical strip (e.g. an icon nav rail). */
  rail?: React.ReactNode;
  /** Collapsible, resizable left sidebar. */
  sidebar?: React.ReactNode;
  /** Required center region. */
  main: React.ReactNode;
  /** Collapsible, resizable-height bottom panel. */
  bottomPanel?: React.ReactNode;
  /** Slim strip pinned to the bottom of the frame, below the bottom panel. */
  statusBar?: React.ReactNode;
  /** Collapsible right sidebar. */
  secondarySidebar?: React.ReactNode;

  /** Width of `rail` in pixels. @default 56 */
  railWidth?: number;
  /** Width of `secondarySidebar` in pixels (fixed — not resizable). @default 280 */
  secondarySidebarWidth?: number;

  /** Whether `sidebar` is collapsed. @default false */
  sidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
  /** Sidebar size as a SplitPane ratio (0-100, percentage of the sidebar/main split). @default 20 */
  sidebarWidth?: number;
  onSidebarWidthChange?: (width: number) => void;
  /** Minimum sidebar size in pixels, forwarded to SplitPane's `minSize`. @default 160 */
  sidebarMinSize?: number;

  /** Whether `bottomPanel` is collapsed. @default false */
  bottomPanelCollapsed?: boolean;
  onBottomPanelCollapsedChange?: (collapsed: boolean) => void;
  /** Bottom panel size as a SplitPane ratio (0-100, percentage given to the panel). @default 30 */
  bottomPanelHeight?: number;
  onBottomPanelHeightChange?: (height: number) => void;
  /** Minimum bottom panel size in pixels, forwarded to SplitPane's `minSize`. @default 120 */
  bottomPanelMinSize?: number;

  /** Whether `secondarySidebar` is collapsed. @default false */
  secondarySidebarCollapsed?: boolean;
  onSecondarySidebarCollapsedChange?: (collapsed: boolean) => void;

  /** Additional CSS classes on the root frame. */
  className?: string;
  railClassName?: string;
  sidebarClassName?: string;
  mainClassName?: string;
  bottomPanelClassName?: string;
  statusBarClassName?: string;
  secondarySidebarClassName?: string;
}

/**
 * DockLayout - multi-region app frame (rail + sidebar + main + bottom panel
 * + status bar + secondary sidebar), composed from SplitPane for the two
 * resizable boundaries.
 */
export const DockLayout: React.FC<DockLayoutProps> = ({
  rail,
  sidebar,
  main,
  bottomPanel,
  statusBar,
  secondarySidebar,
  railWidth = 56,
  secondarySidebarWidth = 280,
  sidebarCollapsed = false,
  sidebarWidth = 20,
  onSidebarWidthChange,
  sidebarMinSize = 160,
  bottomPanelCollapsed = false,
  bottomPanelHeight = 30,
  onBottomPanelHeightChange,
  bottomPanelMinSize = 120,
  secondarySidebarCollapsed = false,
  className,
  railClassName,
  sidebarClassName,
  mainClassName,
  bottomPanelClassName,
  statusBarClassName,
  secondarySidebarClassName,
}) => {
  const showSidebar = Boolean(sidebar) && !sidebarCollapsed;
  const showBottomPanel = Boolean(bottomPanel) && !bottomPanelCollapsed;
  const showSecondarySidebar = Boolean(secondarySidebar) && !secondarySidebarCollapsed;

  const centerRow = (
    <HStack gap="none" className="flex-1 min-h-0 min-w-0">
      {/* No `h-full` on flex-grown children: height:100% resolves against
          centerRow's non-definite (flex-grown) height and collapses to
          content height — `min-h-0` + the HStack's items-stretch size it. */}
      <Box className={cn("flex-1 min-w-0 min-h-0 overflow-auto", mainClassName)}>
        {main}
      </Box>
      {showSecondarySidebar && (
        <Box
          className={cn(
            "flex-shrink-0 h-full overflow-auto border-l border-border",
            secondarySidebarClassName,
          )}
          style={{ width: secondarySidebarWidth }}
        >
          {secondarySidebar}
        </Box>
      )}
    </HStack>
  );

  const sidebarAndCenter = showSidebar ? (
    <SplitPane
      direction="horizontal"
      ratio={sidebarWidth}
      onRatioChange={onSidebarWidthChange}
      minSize={sidebarMinSize}
      resizable
      left={<Box className={cn("h-full overflow-auto", sidebarClassName)}>{sidebar}</Box>}
      right={centerRow}
      className="flex-1 min-h-0 min-w-0"
    />
  ) : (
    centerRow
  );

  const body = (
    <HStack gap="none" className="flex-1 min-h-0 min-w-0">
      {rail && (
        <Box
          className={cn(
            "flex-shrink-0 min-h-0 overflow-auto border-r border-border",
            railClassName,
          )}
          style={{ width: railWidth }}
        >
          {rail}
        </Box>
      )}
      {sidebarAndCenter}
    </HStack>
  );

  const bodyPlusBottom = showBottomPanel ? (
    <SplitPane
      direction="vertical"
      ratio={100 - bottomPanelHeight}
      onRatioChange={(topRatio) => onBottomPanelHeightChange?.(100 - topRatio)}
      minSize={bottomPanelMinSize}
      resizable
      left={body}
      right={
        <Box
          className={cn(
            "h-full overflow-auto border-t border-border",
            bottomPanelClassName,
          )}
        >
          {bottomPanel}
        </Box>
      }
      className="flex-1 min-h-0"
    />
  ) : (
    body
  );

  return (
    <VStack gap="none" className={cn("w-full h-full overflow-hidden", className)}>
      {bodyPlusBottom}
      {statusBar && (
        <Box
          className={cn(
            "flex-shrink-0 border-t border-border bg-background",
            statusBarClassName,
          )}
        >
          {statusBar}
        </Box>
      )}
    </VStack>
  );
};

DockLayout.displayName = "DockLayout";

export default DockLayout;
