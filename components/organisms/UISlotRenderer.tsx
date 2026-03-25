'use client';
 
/**
 * UISlotRenderer Component
 *
 * Renders all UI slots. This is the central component that displays
 * content rendered by traits via render_ui effects.
 *
 * Slots are rendered as:
 * - Layout slots: Inline in the page flow (main, sidebar)
 * - Portal slots: Rendered via portals (modal, drawer, toast, etc.)
 * - HUD slots: Fixed position overlays (hud-top, hud-bottom)
 *
 * @packageDocumentation
 */

import React, { Suspense, createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  useUISlots,
  type UISlot,
  type SlotContent,
} from "../../context/UISlotContext";
import { Modal } from "../molecules/Modal";
import { Drawer } from "../molecules/Drawer";
import { Toast } from "../molecules/Toast";
import { Box } from "../atoms/Box";
import { Typography } from "../atoms/Typography";
import { cn } from "../../lib/cn";
import { ErrorBoundary } from "../molecules/ErrorBoundary";
import { Skeleton, type SkeletonVariant } from "../molecules/Skeleton";

// Shared renderer imports (synced from orbital-shared/design-system/renderer)
import { isKnownPattern, isPortalSlot, SLOT_DEFINITIONS } from "../../renderer";

// Pattern registry — single source of truth for pattern → component name resolution
import { getComponentForPattern as getComponentName } from "@almadar/patterns";

// ============================================================================
// Suspense Configuration Context
// ============================================================================

export interface SuspenseConfig {
  /** Enable Suspense boundaries around slot content */
  enabled: boolean;
  /** Custom fallback per slot, overrides default Skeleton variant */
  slotFallbacks?: Partial<Record<UISlot, React.ReactNode>>;
}

const SuspenseConfigContext = createContext<SuspenseConfig>({ enabled: false });

// ============================================================================
// Slot Containment Context
// ============================================================================

/**
 * When true, portal slots render inline with absolute positioning instead of
 * via createPortal with fixed positioning. This keeps all content contained
 * within the UISlotRenderer's bounds (used by playground/builder previews).
 */
const SlotContainedContext = createContext<boolean>(false);

/**
 * Provider for Suspense configuration.
 * When enabled, each UI slot is wrapped in `<ErrorBoundary><Suspense>`.
 */
export function SuspenseConfigProvider({
  config,
  children,
}: {
  config: SuspenseConfig;
  children: React.ReactNode;
}) {
  return React.createElement(
    SuspenseConfigContext.Provider,
    { value: config },
    children,
  );
}
SuspenseConfigProvider.displayName = 'SuspenseConfigProvider';

/** Map slot names to the best Skeleton variant */
const SLOT_SKELETON_MAP: Partial<Record<UISlot, SkeletonVariant>> = {
  main: 'table',
  sidebar: 'card',
  modal: 'form',
  drawer: 'form',
};

function getSlotFallback(slot: UISlot, config: SuspenseConfig): React.ReactNode {
  if (config.slotFallbacks?.[slot]) return config.slotFallbacks[slot];
  const variant = SLOT_SKELETON_MAP[slot] ?? 'text';
  return <Skeleton variant={variant} />;
}

// Component registry — auto-generated from @almadar/patterns component-mapping.json
// Regenerate: npx tsx tools/almadar-pattern-sync/generate-component-registry.ts
import { COMPONENT_REGISTRY } from "./component-registry.generated";

// Legacy imports kept for direct use in slot wrappers below (used by non-registry code)
import { DataTable } from "./DataTable";
// ============================================================================
// Component Registry (auto-generated, imported from component-registry.generated.ts)
// ============================================================================

/**
 * Get the React component for a pattern type.
 * Uses @almadar/patterns component-mapping.json (auto-generated, single source of truth)
 * to resolve pattern type → component name, then looks up in COMPONENT_REGISTRY.
 *
 * NOTE: getComponentName() returns the full mapping entry object
 * { component, importPath, category } despite its `string | null` type signature.
 * We extract .component to get the actual component name string.
 */
function getComponentForPattern(
  patternType: string
): React.ComponentType<any> | null {
  const mapping = getComponentName(patternType);
  if (!mapping) {
    return null;
  }
  // Extract the component name from the mapping entry
  const name = typeof mapping === 'string'
    ? mapping
    : (mapping as unknown as { component: string }).component;
  if (!name) return null;
  return COMPONENT_REGISTRY[name] ?? null;
}

// Patterns that support nested children
const PATTERNS_WITH_CHILDREN = new Set([
  "stack",
  "vstack",
  "hstack",
  "box",
  "grid",
  "center",
  "card",
  "tooltip",
  "popover",
  "container",
  "simple-grid",
  "custom",
  "dashboard-layout",
  "game-shell",
  "scaled-diagram",
  "master-detail",
  "form-field",
  "form-section",
  "form",
  "accordion",
  "tabs",
  "tab-content",
  "collapsible",
  "alert",
  "dialog",
]);

// ============================================================================
// Slot Component
// ============================================================================

interface UISlotComponentProps {
  slot: UISlot;
  portal?: boolean;
  position?:
    | "left"
    | "right"
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left";
  className?: string;
  draggable?: boolean;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
  /** Compiled mode: render children directly instead of resolving from context */
  children?: React.ReactNode;
  /** Pattern type for data-pattern attribute (compiled mode) */
  pattern?: string;
  /** Source trait name for data-source-trait attribute (compiled mode) */
  sourceTrait?: string;
}

/**
 * Render portal slot content inline with absolute positioning (contained mode).
 * Used by playground/builder previews to keep all content within the preview box.
 * Mirrors SlotPortal's wrapper logic but uses absolute instead of fixed positioning.
 */
function renderContainedPortal(
  slot: UISlot,
  content: SlotContent,
  onDismiss: () => void,
): React.ReactElement {
  const slotContent = <SlotContentRenderer content={content} onDismiss={onDismiss} />;

  switch (slot) {
    case "modal":
      // Skip the Modal component (it uses fixed positioning internally).
      // Build the dialog chrome inline with absolute positioning.
      return (
        <Box
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-auto"
          onClick={onDismiss}
        >
          <Box
            bg="surface"
            border
            shadow="lg"
            rounded="md"
            className="pointer-events-auto max-w-[calc(100%-2rem)] max-h-full overflow-auto flex flex-col"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {content.props.title ? (
              <Box className="flex items-center justify-between p-4 border-b border-border">
                <Typography variant="h3" className="text-lg font-semibold">
                  {String(content.props.title)}
                </Typography>
                <Box
                  as="button"
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={onDismiss}
                >
                  ✕
                </Box>
              </Box>
            ) : null}
            <Box className="flex-1 overflow-auto p-4">
              {slotContent}
            </Box>
          </Box>
        </Box>
      );

    case "drawer":
      // Skip the Drawer component (it uses fixed positioning internally).
      // Build drawer chrome inline with absolute positioning.
      return (
        <Box
          className="absolute inset-0 z-50 bg-black/50 overflow-hidden"
          onClick={onDismiss}
        >
          <Box
            bg="surface"
            className={cn(
              "absolute top-0 bottom-0 w-80 max-w-[80%] overflow-auto pointer-events-auto",
              (content.props.position as string) === "left" ? "left-0" : "right-0",
            )}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {content.props.title ? (
              <Box className="flex items-center justify-between p-4 border-b border-border">
                <Typography variant="h3" className="text-lg font-semibold">
                  {String(content.props.title)}
                </Typography>
                <Box
                  as="button"
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={onDismiss}
                >
                  ✕
                </Box>
              </Box>
            ) : null}
            <Box className="p-4">
              {slotContent}
            </Box>
          </Box>
        </Box>
      );

    case "toast":
      return (
        <Box className="absolute top-4 right-4 z-50">
          <Toast
            variant={
              (content.props.variant as "success" | "error" | "warning" | "info") ?? "info"
            }
            title={content.props.title as string | undefined}
            message={(content.props.message as string) ?? ""}
            onDismiss={onDismiss}
          />
        </Box>
      );

    case "overlay":
      return (
        <Box
          className="absolute inset-0 z-50 bg-foreground/50 flex items-center justify-center overflow-auto"
          onClick={onDismiss}
        >
          <Box className="max-h-full overflow-auto" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            {slotContent}
          </Box>
        </Box>
      );

    case "center":
      return (
        <Box className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none overflow-auto">
          <Box className="pointer-events-auto max-h-full overflow-auto">
            {slotContent}
          </Box>
        </Box>
      );

    default:
      return slotContent;
  }
}

/**
 * Individual slot renderer.
 *
 * Handles different slot types with appropriate wrappers.
 */
function UISlotComponent({
  slot,
  portal = false,
  position,
  className,
  children,
  pattern,
  sourceTrait,
}: UISlotComponentProps): React.ReactElement | null {
  const { slots, clear } = useUISlots();
  const suspenseConfig = useContext(SuspenseConfigContext);
  const contained = useContext(SlotContainedContext);
  const content = slots[slot];

  // Compiled mode: children provided directly, skip context resolution
  if (children !== undefined) {
    // "clear" pattern means dismiss/hide the slot, render nothing
    if (pattern === "clear") {
      return null;
    }

    // Portal slots (modal, drawer, toast): render through a portal with proper wrapper
    // In contained mode, use inline rendering with absolute positioning
    if (isPortalSlot(slot)) {
      if (contained) {
        return (
          <Box
            id={`slot-${slot}`}
            className={cn("ui-slot", `ui-slot-${slot}`, className)}
            data-pattern={pattern}
            data-source-trait={sourceTrait}
          >
            {children}
          </Box>
        );
      }
      return (
        <CompiledPortal slot={slot} className={className} pattern={pattern} sourceTrait={sourceTrait}>
          {children}
        </CompiledPortal>
      );
    }

    return (
      <Box
        id={`slot-${slot}`}
        className={cn("ui-slot", `ui-slot-${slot}`, className)}
        data-pattern={pattern}
        data-source-trait={sourceTrait}
      >
        {children}
      </Box>
    );
  }

  // Handle empty slot
  if (!content) {
    // For non-portal slots, render an empty placeholder
    if (!portal) {
      return (
        <Box
          id={`slot-${slot}`}
          className={cn("ui-slot", `ui-slot-${slot}`, className)}
        />
      );
    }
    return null;
  }

  // Render content based on slot type
  const handleDismiss = () => {
    clear(slot);
  };

  // Portal-based slots
  if (portal) {
    // In contained mode, render inline with absolute positioning
    if (contained) {
      return renderContainedPortal(slot, content, handleDismiss);
    }
    return (
      <SlotPortal
        slot={slot}
        content={content}
        position={position}
        onDismiss={handleDismiss}
      />
    );
  }

  // Inline slots — optionally wrapped in Suspense + ErrorBoundary
  const slotContent = (
    <SlotContentRenderer content={content} onDismiss={handleDismiss} />
  );

  const wrappedContent = suspenseConfig.enabled ? (
    <ErrorBoundary>
      <Suspense fallback={getSlotFallback(slot, suspenseConfig)}>
        {slotContent}
      </Suspense>
    </ErrorBoundary>
  ) : slotContent;

  return (
    <Box
      id={`slot-${slot}`}
      className={cn("ui-slot", `ui-slot-${slot}`, className)}
      data-pattern={content.pattern}
      data-source-trait={content.sourceTrait}
    >
      {wrappedContent}
    </Box>
  );
}

// ============================================================================
// Portal root helper — shared by SlotPortal and CompiledPortal
// ============================================================================

/**
 * Find or create the portal root element, inheriting theme from the page.
 * Portal content renders outside the React tree on document.body, so it
 * needs the data-theme attribute for CSS variable resolution and a high
 * z-index to paint above the host page (e.g. Docusaurus navbar).
 */
function getOrCreatePortalRoot(): HTMLElement {
  let root = document.getElementById("ui-slot-portal-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "ui-slot-portal-root";
    // High z-index stacking context so portal content paints above host page
    root.style.position = "relative";
    root.style.zIndex = "9999";
    document.body.appendChild(root);
  }
  // Sync data-theme from the Almadar themed element so CSS variables resolve.
  // Prefer compound theme names (e.g. "wireframe-light") over simple ones
  // ("light"/"dark") which may come from the host page (e.g. Docusaurus).
  const themed =
    document.querySelector('[data-theme*="-"]') ??
    document.querySelector("[data-theme]");
  if (themed) {
    const theme = themed.getAttribute("data-theme");
    if (theme && root.getAttribute("data-theme") !== theme) {
      root.setAttribute("data-theme", theme);
    }
  }
  return root;
}

// ============================================================================
// Compiled Portal — wraps compiled children in portal for modal/drawer/toast
// ============================================================================

interface CompiledPortalProps {
  slot: UISlot;
  className?: string;
  pattern?: string;
  sourceTrait?: string;
  children: React.ReactNode;
}

function CompiledPortal({ slot, className, pattern, sourceTrait, children }: CompiledPortalProps): React.ReactElement | null {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const eventBus = useUISlots();

  useEffect(() => {
    setPortalRoot(getOrCreatePortalRoot());
  }, []);

  // Keep theme in sync when the host page's theme changes
  useEffect(() => {
    if (portalRoot) getOrCreatePortalRoot();
  });

  const handleDismiss = () => {
    eventBus.clear(slot);
  };

  if (!portalRoot) return null;

  let wrapper: React.ReactElement;

  switch (slot) {
    case "modal":
      wrapper = (
        <Modal isOpen={true} onClose={handleDismiss} showCloseButton={true} size="lg">
          <Box
            className={cn("ui-slot", `ui-slot-${slot}`, className)}
            data-pattern={pattern}
            data-source-trait={sourceTrait}
          >
            {children}
          </Box>
        </Modal>
      );
      break;

    case "drawer":
      wrapper = (
        <Drawer isOpen={true} onClose={handleDismiss} position="right">
          <Box
            className={cn("ui-slot", `ui-slot-${slot}`, className)}
            data-pattern={pattern}
            data-source-trait={sourceTrait}
          >
            {children}
          </Box>
        </Drawer>
      );
      break;

    case "toast":
      wrapper = (
        <Box className="fixed top-4 right-4 z-50">
          <Box
            className={cn("ui-slot", `ui-slot-${slot}`, className)}
            data-pattern={pattern}
            data-source-trait={sourceTrait}
          >
            {children}
          </Box>
        </Box>
      );
      break;

    default:
      wrapper = (
        <Box
          className={cn("ui-slot", `ui-slot-${slot}`, className)}
          data-pattern={pattern}
          data-source-trait={sourceTrait}
        >
          {children}
        </Box>
      );
  }

  return createPortal(wrapper, portalRoot);
}

// ============================================================================
// Portal Renderer
// ============================================================================

interface SlotPortalProps {
  slot: UISlot;
  content: SlotContent;
  position?: string;
  onDismiss: () => void;
  className?: string;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

function SlotPortal({
  slot,
  content,
  position,
  onDismiss,
}: SlotPortalProps): React.ReactElement | null {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalRoot(getOrCreatePortalRoot());
  }, []);

  // Keep theme in sync when the host page's theme changes
  useEffect(() => {
    if (portalRoot) getOrCreatePortalRoot();
  });

  if (!portalRoot) return null;

  // Render slot-specific wrapper
  let wrapper: React.ReactElement;

  switch (slot) {
    case "modal":
      wrapper = (
        <Modal
          isOpen={true}
          onClose={onDismiss}
          title={content.props.title as string | undefined}
          size={
            content.props.size as "sm" | "md" | "lg" | "xl" | "full" | undefined
          }
        >
          <SlotContentRenderer content={content} onDismiss={onDismiss} />
        </Modal>
      );
      break;

    case "drawer":
      wrapper = (
        <Drawer
          isOpen={true}
          onClose={onDismiss}
          title={content.props.title as string | undefined}
          position={(content.props.position as "left" | "right") ?? "right"}
          width={content.props.width as string | undefined}
        >
          <SlotContentRenderer content={content} onDismiss={onDismiss} />
        </Drawer>
      );
      break;

    case "toast":
      wrapper = (
        <Box className={cn("fixed z-50", getToastPosition(position))}>
          <Toast
            variant={
              (content.props.variant as
                | "success"
                | "error"
                | "warning"
                | "info") ?? "info"
            }
            title={content.props.title as string | undefined}
            message={(content.props.message as string) ?? ""}
            onDismiss={onDismiss}
          />
        </Box>
      );
      break;

    case "overlay":
      wrapper = (
        <Box
          className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center"
          onClick={onDismiss}
        >
          <Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <SlotContentRenderer content={content} onDismiss={onDismiss} />
          </Box>
        </Box>
      );
      break;

    case "center":
      wrapper = (
        <Box className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <Box className="pointer-events-auto">
            <SlotContentRenderer content={content} onDismiss={onDismiss} />
          </Box>
        </Box>
      );
      break;

    default:
      wrapper = <SlotContentRenderer content={content} onDismiss={onDismiss} />;
  }

  return createPortal(wrapper, portalRoot);
}

function getToastPosition(position?: string): string {
  switch (position) {
    case "top-left":
      return "top-4 left-4";
    case "top-right":
      return "top-4 right-4";
    case "bottom-left":
      return "bottom-4 left-4";
    case "bottom-right":
      return "bottom-4 right-4";
    default:
      return "top-4 right-4";
  }
}

// ============================================================================
// Content Renderer
// ============================================================================

interface SlotContentRendererProps {
  content: SlotContent;
  onDismiss: () => void;
  className?: string;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

/**
 * Recursively render nested pattern children.
 *
 * Takes an array of child pattern configurations and renders them recursively.
 */
function renderPatternChildren(
  children:
    | Array<{ type: string; props?: Record<string, unknown> }>
    | undefined,
  onDismiss: () => void,
  parentId = "root",
): React.ReactNode {
  if (!children || !Array.isArray(children) || children.length === 0) {
    return null;
  }

  return children.map((child, index) => {
    if (!child || typeof child !== "object") return null;

    const childId = `${parentId}-${index}`;
    const childContent: SlotContent = {
      id: childId,
      pattern: child.type,
      props: child.props ?? {},
      priority: 0,
    };

    return (
      <SlotContentRenderer
        key={childId}
        content={childContent}
        onDismiss={onDismiss}
      />
    );
  });
}

/**
 * Check if a value looks like a pattern config object (has a `type` string field).
 */
function isPatternConfig(value: unknown): value is { type: string; [key: string]: unknown } {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "type" in value &&
    typeof (value as Record<string, unknown>).type === "string"
  );
}

/**
 * Recursively render any named props that contain pattern config objects.
 * E.g., flip-card's `front` and `back` props are pattern configs that need
 * to be converted to React elements before being passed to the component.
 */
function renderPatternProps(
  props: Record<string, unknown>,
  onDismiss: () => void,
): Record<string, unknown> {
  const rendered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (key === "children") {
      rendered[key] = value;
    } else if (isPatternConfig(value)) {
      const childContent: SlotContent = {
        id: `prop-${key}`,
        pattern: value.type,
        props: Object.fromEntries(
          Object.entries(value).filter(([k]) => k !== "type"),
        ),
        priority: 0,
      };
      rendered[key] = (
        <SlotContentRenderer content={childContent} onDismiss={onDismiss} />
      );
    } else {
      rendered[key] = value;
    }
  }
  return rendered;
}

/**
 * Renders the actual content of a slot.
 *
 * Dynamically renders pattern components from the registry.
 * For layout patterns with `hasChildren`, recursively renders nested patterns.
 * For all patterns, named props containing pattern configs are also rendered.
 */
function SlotContentRenderer({
  content,
  onDismiss,
}: SlotContentRendererProps): React.ReactElement {
  const PatternComponent = getComponentForPattern(content.pattern);

  // If we have a registered component, render it with props
  if (PatternComponent) {
    // Check if this pattern has children to render.
    // Any pattern with children array in props gets recursive rendering.
    // The PATTERNS_WITH_CHILDREN set is kept as a fast-path hint but
    // we also check for actual children presence to avoid missing any.
    const childrenConfig = content.props.children as
      | Array<{ type: string; props?: Record<string, unknown> }>
      | undefined;
    const hasChildren = PATTERNS_WITH_CHILDREN.has(content.pattern)
      || (Array.isArray(childrenConfig) && childrenConfig.length > 0);

    // Render children recursively
    const renderedChildren = hasChildren
      ? renderPatternChildren(childrenConfig, onDismiss, content.id)
      : undefined;

    // Extract props without the children config (we pass rendered children instead)
    const { children: _childrenConfig, ...restProps } = content.props;

    // Recursively render any named props that are pattern configs
    const renderedProps = renderPatternProps(restProps, onDismiss);

    return (
      <Box
        className="slot-content"
        data-pattern={content.pattern}
        data-id={content.id}
      >
        <PatternComponent {...renderedProps}>
          {renderedChildren}
        </PatternComponent>
      </Box>
    );
  }

  // Fallback for unknown patterns - show placeholder
  return (
    <Box
      className="slot-content"
      data-pattern={content.pattern}
      data-id={content.id}
    >
      {(content.props.children as React.ReactNode) ?? (
        <Box className="p-4 text-sm text-muted-foreground border border-dashed border-border rounded">
          Unknown pattern: {content.pattern}
          {content.sourceTrait && (
            <Typography variant="small" className="ml-2">(from {content.sourceTrait})</Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export interface UISlotRendererProps {
  /** Include HUD slots */
  includeHud?: boolean;
  /** HUD positioning mode: 'fixed' (default, viewport-relative) or 'inline' (container-relative, uses sticky) */
  hudMode?: 'fixed' | 'inline';
  /** Include floating slot */
  includeFloating?: boolean;
  /** Additional class name for the container */
  className?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /**
   * Enable Suspense boundaries around each slot.
   * When true, each inline slot is wrapped in `<ErrorBoundary><Suspense>` with
   * Skeleton fallbacks. Opt-in — existing isLoading prop pattern still works.
   */
  suspense?: boolean | SuspenseConfig;
}

/**
 * Main UI Slot Renderer component.
 *
 * Renders all slot containers. Place this in your page/layout component.
 *
 * @example
 * ```tsx
 * function PageLayout() {
 *   return (
 *     <div className="page-layout">
 *       <UISlotRenderer />
 *     </div>
 *   );
 * }
 * ```
 */
export function UISlotRenderer({
  includeHud = false,
  hudMode = 'fixed',
  includeFloating = false,
  className,
  suspense,
}: UISlotRendererProps): React.ReactElement {
  const isContained = hudMode === 'inline';
  const suspenseConfig: SuspenseConfig =
    suspense === true ? { enabled: true } :
    suspense && typeof suspense === 'object' ? suspense :
    { enabled: false };

  const content = (
    <Box className={cn(
      "ui-slot-renderer",
      isContained && "relative",
      className,
    )}>
      {/* Layout slots */}
      <UISlotComponent slot="sidebar" className="ui-slot-sidebar" />
      <UISlotComponent slot="main" className="ui-slot-main flex-1" />

      {/* Portal slots */}
      <UISlotComponent slot="modal" portal />
      <UISlotComponent slot="drawer" portal />
      <UISlotComponent slot="overlay" portal />
      <UISlotComponent slot="center" portal />
      <UISlotComponent slot="toast" portal position="top-right" />

      {/* HUD slots (optional, for games) */}
      {includeHud && (
        <>
          <UISlotComponent
            slot="hud-top"
            className={isContained
              ? "sticky top-0 inset-x-0 z-40"
              : "fixed top-0 inset-x-0 z-40"}
          />
          <UISlotComponent
            slot="hud-bottom"
            className={isContained
              ? "sticky bottom-0 inset-x-0 z-40"
              : "fixed bottom-0 inset-x-0 z-40"}
          />
        </>
      )}

      {/* Floating slot (optional) */}
      {includeFloating && (
        <UISlotComponent
          slot="floating"
          className={isContained ? "absolute z-50" : "fixed z-50"}
          draggable
        />
      )}
    </Box>
  );

  // Wrap with SlotContainedContext + optional SuspenseConfigProvider
  let wrapped = content;

  if (suspenseConfig.enabled) {
    wrapped = (
      <SuspenseConfigProvider config={suspenseConfig}>
        {wrapped}
      </SuspenseConfigProvider>
    );
  }

  if (isContained) {
    wrapped = (
      <SlotContainedContext.Provider value={true}>
        {wrapped}
      </SlotContainedContext.Provider>
    );
  }

  return wrapped;
}

UISlotRenderer.displayName = "UISlotRenderer";

// ============================================================================
// Exports
// ============================================================================

export { UISlotComponent, SlotContentRenderer };
