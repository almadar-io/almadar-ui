/**
 * GameTemplate
 *
 * A presentational template for game applications.
 * Includes a main game canvas/area, HUD overlay, and an optional debug sidebar.
 * **Atomic Design**: Composed using Box, Typography, and Layout molecules/atoms.
 */

import React from "react";
import { cn } from "../../../../lib/cn";
import { Box } from "../../../core/atoms/Box";
import { HStack } from "../../../core/atoms/Stack";
import { Typography } from "../../../core/atoms/Typography";
import { Button } from "../../../core/atoms/Button";
import type { TemplateProps } from "../../../core/templates/types";
import { getComponentForPattern } from "@almadar/patterns";
import type { SlotContent } from "../../../../hooks/useUISlots";
import type { JsonObject } from "@almadar/core";

// Lazy-require to avoid a module-graph cycle:
// component-registry.generated.ts imports GameTemplate, and UISlotRenderer
// imports component-registry.generated.ts. Requiring UISlotRenderer at the
// top of this file would close the cycle.
type SlotContentRendererCmp = React.ComponentType<{ content: SlotContent; onDismiss: () => void }>;
let _scr: SlotContentRendererCmp | null = null;
function getSlotContentRenderer(): SlotContentRendererCmp {
  if (_scr) return _scr;
  const mod = require("../../../core/organisms/UISlotRenderer") as { SlotContentRenderer: SlotContentRendererCmp };
  _scr = mod.SlotContentRenderer;
  return _scr;
}

/**
 * Guard that converts a plain `{ type, props? }` descriptor object into a
 * React element via the canonical SlotContentRenderer. If the value is
 * already a valid React element or a primitive, it passes through untouched.
 * Arrays are mapped element-by-element. This prevents React error #31 when
 * a runtime effect delivers descriptor objects instead of React elements.
 */
function resolveDescriptor(value: React.ReactNode, idPrefix: string): React.ReactNode {
  if (value === null || value === undefined) return value;
  if (React.isValidElement(value)) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value.map((item, i) => (
      <React.Fragment key={i}>{resolveDescriptor(item as React.ReactNode, `${idPrefix}-${i}`)}</React.Fragment>
    ));
  }
  if (typeof value === "object") {
    const rec = (value as object) as JsonObject;
    if (typeof rec.type === "string" && getComponentForPattern(rec.type) !== null) {
      const type = rec.type;
      const _id = typeof rec._id === "string" ? rec._id : undefined;
      const nestedProps = rec.props !== undefined && typeof rec.props === "object" && !Array.isArray(rec.props) && rec.props !== null
        ? (rec.props as SlotContent["props"])
        : undefined;
      const { type: _t, props: _p, _id: _d, ...flatRest } = rec;
      const resolvedProps = nestedProps !== undefined ? nestedProps : (flatRest as SlotContent["props"]);
      const content: SlotContent = { id: _id ?? idPrefix, pattern: type, props: resolvedProps, priority: 0 };
      const SCR = getSlotContentRenderer();
      return <SCR content={content} onDismiss={() => undefined} />;
    }
  }
  return null;
}

export interface GameControls {
  onPlay?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  isPlaying?: boolean;
}

export interface GameTemplateProps extends TemplateProps {
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
  controls?: GameControls;
  /** Additional class name */
  className?: string;
}

export const GameTemplate: React.FC<GameTemplateProps> = ({
  entity,
  title = "Game",
  children,
  hud,
  debugPanel,
  showDebugPanel = false,
  controls,
  className,
}) => {
  return (
    <Box
      display="flex"
      fullHeight
      className={cn("flex-col lg:flex-row", className)}
    >
      {/* Main Game Area */}
      <Box display="flex" className="flex-1 flex-col">
        {/* Header with title and controls */}
        <Box
          padding="md"
          border
          className="border-b-2 border-x-0 border-t-0 border-border flex items-center justify-between"
        >
          <Typography variant="h4">{title}</Typography>

          {controls && (
            <HStack gap="sm" align="center">
              {controls.isPlaying ? (
                <Button
                  variant="secondary"
                  size="sm"
                  icon="pause"
                  onClick={controls.onPause}
                >
                  Pause
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  icon="play"
                  onClick={controls.onPlay}
                >
                  Play
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                icon="rotate-ccw"
                onClick={controls.onReset}
              >
                Reset
              </Button>
            </HStack>
          )}
        </Box>

        {/* Game Canvas Area */}
        <Box
          position="relative"
          fullWidth
          className="flex-1 bg-muted"
        >
          {/* Main game content */}
          {resolveDescriptor(children, "gt-children")}

          {/* HUD Overlay */}
          {hud && (
            <Box
              position="absolute"
              className="top-0 left-0 right-0 pointer-events-none"
            >
              <Box padding="md" className="pointer-events-auto w-fit">
                {resolveDescriptor(hud, "gt-hud")}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Debug Sidebar */}
      {showDebugPanel && debugPanel && (
        <Box
          bg="surface"
          border
          shadow="sm"
          overflow="auto"
          className="w-full lg:w-80 lg:border-l-2 lg:border-t-0 border-t-2 border-border"
        >
          <Box
            padding="md"
            border
            className="border-b-2 border-x-0 border-t-0 border-border"
          >
            <Typography variant="h6">Debug Panel</Typography>
          </Box>
          <Box padding="md">{resolveDescriptor(debugPanel, "gt-debug")}</Box>
        </Box>
      )}
    </Box>
  );
};

GameTemplate.displayName = "GameTemplate";
