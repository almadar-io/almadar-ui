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
import { useEntitySchemaOptional } from "../../runtime/EntitySchemaContext";
import { TraitScopeProvider } from "../../providers/TraitScopeProvider";
import type { EntityRow, RenderItemLambda, ResolvedEntity } from "@almadar/core";
import type { AnyPatternConfig } from "@almadar/patterns";
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
import { useEventBus } from "../../hooks/useEventBus";
import { slotLog, refId } from "../../runtime/ui/slot-types";
import { cn } from "../../lib/cn";
import { ErrorBoundary } from "../molecules/ErrorBoundary";
import { createLogger } from "../../lib/logger";

const scopeWrapLog = createLogger("almadar:ui:scope-wrap");
import { Skeleton, type SkeletonVariant } from "../molecules/Skeleton";

// Shared renderer imports (synced from orbital-shared/design-system/renderer)
import { isKnownPattern, isPortalSlot, SLOT_DEFINITIONS } from "../../renderer";

// Pattern registry — single source of truth for pattern → component name resolution
import { getComponentForPattern as getComponentName } from "@almadar/patterns";

// Per-trait composition primitive — `@trait.X` bindings embedded in
// pattern children resolve to this component at render time. See
// `docs/Almadar_Std_Gaps.md` §3.8.
import { TraitFrame } from "../atoms/TraitFrame";

/**
 * `^@trait.<PascalName>$` — single-segment binding only. Multi-segment
 * forms (formerly `@trait.X.slot`) are rejected by the compiler at
 * validate time, so the runtime regex here matches the exact accepted
 * shape.
 */
const TRAIT_BINDING_RE = /^@trait\.([A-Z][A-Za-z0-9]*)$/;

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

// Form patterns whose `fields` should be enriched with entity field types
const FORM_PATTERNS = new Set([
  "form",
  "form-section",
  "inline-edit-form",
  "wizard-step",
]);

/**
 * Enrich form field definitions with entity schema type info.
 * Mirrors what the compiler does at build time (EntityFieldInfo injection).
 * At runtime, we read the entity schema from EntitySchemaContext.
 */
function enrichFormFields(
  fields: unknown[],
  entityDef: ResolvedEntity,
): unknown[] {
  const fieldMap = new Map(entityDef.fields.map((f) => [f.name, f]));

  return fields.map((field) => {
    if (typeof field === 'string') {
      // Simple string field name — look up entity field and build SchemaField
      const entityField = fieldMap.get(field);
      if (entityField) {
        const enriched: Record<string, unknown> = {
          name: field,
          label: field.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase()),
          type: entityField.type,
          required: entityField.required,
        };
        if (entityField.values && entityField.values.length > 0) {
          enriched.values = entityField.values;
        } else if (entityField.enumValues && entityField.enumValues.length > 0) {
          enriched.values = entityField.enumValues;
        }
        if (entityField.relation) {
          enriched.relation = entityField.relation;
        }
        return enriched;
      }
      return { name: field, label: field.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase()) };
    }

    if (field && typeof field === 'object' && !Array.isArray(field)) {
      const obj = field as Record<string, unknown>;
      const fieldName = (obj.name ?? obj.field) as string | undefined;
      if (!fieldName) return field;

      // Only enrich if type is not already specified
      if (obj.type || obj.inputType) return field;

      const entityField = fieldMap.get(fieldName);
      if (!entityField) return field;

      const enriched: Record<string, unknown> = { ...obj, type: entityField.type };
      if (entityField.required && !('required' in obj)) {
        enriched.required = true;
      }
      if (!obj.values && !obj.options) {
        if (entityField.values && entityField.values.length > 0) {
          enriched.values = entityField.values;
        } else if (entityField.enumValues && entityField.enumValues.length > 0) {
          enriched.values = entityField.enumValues;
        }
      }
      if (!obj.relation && entityField.relation) {
        enriched.relation = entityField.relation;
      }
      return enriched;
    }

    return field;
  });
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
  // Wrap with MaybeTraitScope so bare `UI:X` emits inside the slot (e.g.
  // form submit dispatching `UI:SAVE`) get qualified to
  // `UI:Orbital.Trait.X` via TraitScopeProvider — same contract as
  // SlotPortal's wrapping for the non-contained path. Without this wrap,
  // every cross-trait listener (subscribed under the qualified key) misses
  // the form-submit event in playground/builder previews (contained mode).
  const slotContent = (
    <MaybeTraitScope sourceTrait={content.sourceTrait}>
      <SlotContentRenderer content={content} onDismiss={onDismiss} />
    </MaybeTraitScope>
  );
  // Every mounted portal slot advertises `id="slot-{name}"` so VG1's portal
  // probe + any external selector sees the same anchor whether the runtime
  // drew the content inline (contained mode) or via a React portal. Before
  // this was set, modal contents painted but the probe couldn't locate the
  // slot — VG15 / runtime-path "modal not mounted" reports.
  const slotId = `slot-${slot}`;

  switch (slot) {
    case "modal":
      return (
        <Box
          id={slotId}
          className="absolute inset-0 z-50 flex items-start justify-center overflow-auto"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', paddingTop: '10%' }}
          onClick={onDismiss}
        >
          <Box
            bg="surface"
            border
            shadow="lg"
            rounded="md"
            className="pointer-events-auto w-full overflow-auto flex flex-col"
            style={{ minWidth: '520px', maxWidth: '700px', maxHeight: '80%' }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/*
              The header (with the X close button) always renders. Previously
              the entire header — INCLUDING the close affordance — was gated
              on `content.props.title` being truthy, so any pattern that
              didn't set a top-level `title` prop (e.g. a `stack` wrapper
              around a form) painted a modal with NO way to dismiss except
              clicking the overlay. The X also lacked `data-event` /
              `data-testid`, so click-path verifiers and any external
              automation couldn't find it. Now: title is optional but the
              X is structural, with the same data attributes the Modal
              molecule's X carries so the verifier maps clicks → CLOSE.
            */}
            <Box className={cn(
              "flex items-center p-4",
              content.props.title ? "justify-between border-b border-border" : "justify-end",
            )}>
              {content.props.title ? (
                <Typography variant="h3" className="text-lg font-semibold">
                  {String(content.props.title)}
                </Typography>
              ) : null}
              <Box
                as="button"
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={onDismiss}
                data-event="CLOSE"
                data-testid="action-CLOSE"
                aria-label="Close modal"
              >
                ✕
              </Box>
            </Box>
            <Box className="flex-1 overflow-auto p-4">
              {slotContent}
            </Box>
          </Box>
        </Box>
      );

    case "drawer":
      return (
        <Box
          id={slotId}
          className="absolute inset-0 z-50 overflow-hidden"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
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
            {/* Same rationale as the modal header above: the X is structural,
                title is optional, and the close button carries the
                CLOSE event-key data attributes so verifiers and automation
                can drive the close path. */}
            <Box className={cn(
              "flex items-center p-4",
              content.props.title ? "justify-between border-b border-border" : "justify-end",
            )}>
              {content.props.title ? (
                <Typography variant="h3" className="text-lg font-semibold">
                  {String(content.props.title)}
                </Typography>
              ) : null}
              <Box
                as="button"
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={onDismiss}
                data-event="CLOSE"
                data-testid="action-CLOSE"
                aria-label="Close drawer"
              >
                ✕
              </Box>
            </Box>
            <Box className="p-4">
              {slotContent}
            </Box>
          </Box>
        </Box>
      );

    case "toast":
      return (
        <Box id={slotId} className="absolute top-4 right-4 z-50">
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
          id={slotId}
          className="absolute inset-0 z-50 flex items-center justify-center overflow-auto"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={onDismiss}
        >
          <Box className="max-h-full overflow-auto" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            {slotContent}
          </Box>
        </Box>
      );

    case "center":
      return (
        <Box id={slotId} className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none overflow-auto">
          <Box className="pointer-events-auto max-h-full overflow-auto">
            {slotContent}
          </Box>
        </Box>
      );

    default:
      return <Box id={slotId}>{slotContent}</Box>;
  }
}

/**
 * Wrap a slot's rendered subtree in `TraitScopeProvider` when both the
 * source trait and its owning orbital can be resolved. The wrap is what
 * makes Button (and any pure component using `useEventBus`) emit the
 * qualified `UI:Orbital.Trait.EVENT` form that `useTraitStateMachine`
 * listens on. Without this wrap, runtime-path clicks dispatch bare
 * `UI:EVENT` keys and never reach the trait's state machine — which
 * was the runtime-side modal-not-mounting bug traced via
 * `[gap4-button-emit]` / `[gap4-bus-emit]`.
 *
 * Resolves orbital via `EntitySchemaContext.orbitalsByTrait`. When the
 * trait isn't in the map (e.g. compiled mode without the schema
 * context, or storybook), children render unwrapped — those callers
 * either don't need scope (storybook) or already get it from codegen.
 */
function MaybeTraitScope({
  sourceTrait,
  children,
}: { sourceTrait: string | undefined; children: React.ReactNode }): React.ReactElement {
  const schemaCtx = useEntitySchemaOptional();
  const orbital = sourceTrait !== undefined && schemaCtx !== null
    ? schemaCtx.orbitalsByTrait.get(sourceTrait)
    : undefined;
  const wrap = sourceTrait !== undefined && orbital !== undefined;
  scopeWrapLog.info('decide', {
    sourceTrait,
    schemaCtxPresent: schemaCtx !== null,
    orbitalsByTraitSize: schemaCtx?.orbitalsByTrait.size ?? 0,
    orbital,
    wrap,
  });
  if (wrap) {
    return (
      <TraitScopeProvider orbital={orbital!} trait={sourceTrait!}>
        {children}
      </TraitScopeProvider>
    );
  }
  return <>{children}</>;
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
  const eventBus = useEventBus();
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
            <MaybeTraitScope sourceTrait={sourceTrait}>{children}</MaybeTraitScope>
          </Box>
        );
      }
      return (
        <CompiledPortal slot={slot} className={className} pattern={pattern} sourceTrait={sourceTrait}>
          <MaybeTraitScope sourceTrait={sourceTrait}>{children}</MaybeTraitScope>
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
        <MaybeTraitScope sourceTrait={sourceTrait}>{children}</MaybeTraitScope>
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

  // Render content based on slot type. For interactive portal slots
  // (modal, drawer) the X / overlay click is a user dismiss, which the
  // owning trait usually models as a CLOSE/CANCEL transition. Emit both
  // standard close-style events on the eventBus so `useUIEvents` in the
  // trait hook dispatches them — without this, clicking X just clears
  // the slot DOM but the trait stays in `open` and any subsequent open
  // attempt no-ops because the state machine thinks it's already there.
  // Mirrors `ModalSlot.handleClose` (which has done it right all along).
  const handleDismiss = () => {
    if (slot === 'modal' || slot === 'drawer') {
      eventBus.emit('UI:CLOSE');
      eventBus.emit('UI:CANCEL');
    }
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

  // Inline slots — always wrapped in an ErrorBoundary so a pattern
  // component crashing (e.g. a data pattern that dereferences an
  // unpopulated entity prop) contains the failure to that slot instead
  // of blanking the whole preview. Optional Suspense wraps when the
  // consumer opts in for async data.
  const slotContent = (
    <SlotContentRenderer content={content} onDismiss={handleDismiss} />
  );

  const wrappedContent = suspenseConfig.enabled ? (
    <ErrorBoundary>
      <Suspense fallback={getSlotFallback(slot, suspenseConfig)}>
        {slotContent}
      </Suspense>
    </ErrorBoundary>
  ) : (
    <ErrorBoundary>{slotContent}</ErrorBoundary>
  );

  return (
    <Box
      id={`slot-${slot}`}
      className={cn("ui-slot", `ui-slot-${slot}`, className)}
      data-pattern={content.pattern}
      data-source-trait={content.sourceTrait}
    >
      <MaybeTraitScope sourceTrait={content.sourceTrait}>{wrappedContent}</MaybeTraitScope>
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
  const slotsBus = useUISlots();
  const eventBus = useEventBus();

  useEffect(() => {
    setPortalRoot(getOrCreatePortalRoot());
  }, []);

  // Keep theme in sync when the host page's theme changes
  useEffect(() => {
    if (portalRoot) getOrCreatePortalRoot();
  });

  // X / overlay click on an interactive portal slot is a user dismiss.
  // Emit UI:CLOSE + UI:CANCEL so the owning trait's `useUIEvents` hook
  // dispatches them and the state machine actually advances, mirroring
  // what ModalSlot does. Without this the X clears the DOM but the
  // trait stays in `open` and the next OPEN no-ops on a same-state
  // transition. See std-modal G27 / VG3 click-path "no state advanced".
  const handleDismiss = () => {
    if (slot === 'modal' || slot === 'drawer') {
      eventBus.emit('UI:CLOSE');
      eventBus.emit('UI:CANCEL');
    }
    slotsBus.clear(slot);
  };

  if (!portalRoot) return null;

  // Every mounted portal slot advertises `id="slot-{name}"` on the inner
  // content wrapper so external selectors (VG1 portal probe + any DOM
  // lookup keyed off the slot name) resolve regardless of the portal's
  // outer shell (Modal / Drawer / raw fixed Box). See VG15.
  const slotId = `slot-${slot}`;
  let wrapper: React.ReactElement;

  switch (slot) {
    case "modal":
      wrapper = (
        <Modal isOpen={true} onClose={handleDismiss} showCloseButton={true} size="lg">
          <Box
            id={slotId}
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
            id={slotId}
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
            id={slotId}
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
          id={slotId}
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

  // Every mounted portal slot advertises `id="slot-{name}"` on its wrapper
  // so the VG1 portal probe and any external selector resolve consistently
  // across contained mode, non-contained (this branch), and the compiled
  // path's CompiledPortal. See VG15.
  const slotId = `slot-${slot}`;
  const slotContent = (
    <MaybeTraitScope sourceTrait={content.sourceTrait}>
      <SlotContentRenderer content={content} onDismiss={onDismiss} />
    </MaybeTraitScope>
  );

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
          <Box id={slotId}>{slotContent}</Box>
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
          <Box id={slotId}>{slotContent}</Box>
        </Drawer>
      );
      break;

    case "toast":
      wrapper = (
        <Box id={slotId} className={cn("fixed z-50", getToastPosition(position))}>
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
          id={slotId}
          className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center"
          onClick={onDismiss}
        >
          <Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            {slotContent}
          </Box>
        </Box>
      );
      break;

    case "center":
      wrapper = (
        <Box id={slotId} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <Box className="pointer-events-auto">
            {slotContent}
          </Box>
        </Box>
      );
      break;

    default:
      wrapper = <Box id={slotId}>{slotContent}</Box>;
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
  /** Schema-compatible path for WYSIWYG drop targeting (e.g., "root.children.0"). */
  patternPath?: string;
}

/**
 * Recursively render nested pattern children.
 *
 * Takes an array of child pattern configurations and renders them recursively.
 * The `parentPath` parameter tracks the schema-compatible path for WYSIWYG drop targeting
 * (matches `navigatePatternPath()` format: "root.children.0.children.1").
 */
function renderPatternChildren(
  children:
    | Array<
        | { type: string; props?: Record<string, unknown>; _id?: string }
        | string
      >
    | undefined,
  onDismiss: () => void,
  parentId = "root",
  parentPath = "root",
  sourceTrait?: string,
): React.ReactNode {
  if (!children || !Array.isArray(children) || children.length === 0) {
    return null;
  }

  return children.map((child, index) => {
    // String children are `@trait.X` bindings in the interpreted path.
    // Substitute a `<TraitFrame>` — passive read-only lens on the
    // referenced trait's current render output. Non-matching strings
    // (unlikely here since pattern children are typed as objects, but
    // defensive) render as text via the React text-child path.
    if (typeof child === "string") {
      const match = TRAIT_BINDING_RE.exec(child);
      if (match) {
        const traitName = match[1];
        const key = `${parentId}-${index}-trait:${traitName}`;
        return <TraitFrame key={key} traitName={traitName} />;
      }
      // Non-binding string — treat as plain text so authors who want
      // literal strings inside a pattern's children (rare) still work.
      return <React.Fragment key={`${parentId}-${index}`}>{child}</React.Fragment>;
    }

    if (!child || typeof child !== "object") return null;

    const childId = `${parentId}-${index}`;
    const childPath = parentPath === 'root'
      ? `root.children.${index}`
      : `${parentPath}.children.${index}`;
    // Pattern configs may arrive in two shapes:
    // 1) Flat: `{type: "button", label, action, actionPayload, ...}` — the
    //    authoring form the compiler and `.lolo` emit.
    // 2) Nested: `{type: "button", props: {label, action, ...}, _id}` —
    //    the form produced by some IR transformations that lift props
    //    into a sidecar for node-id tracking.
    // Reading `child.props` alone silently drops everything in the flat
    // case — actionPayload included — which was the runtime-only VG31
    // DELETE cascade failure: the Confirm button rendered without
    // actionPayload, emitted `{}` on click, and Persistor's DO_DELETE
    // ran with no id.
    const { type: _childType, props: nestedProps, _id: _childNodeId, children: _childChildren, ...flatProps } = child as {
      type: string;
      props?: Record<string, unknown>;
      _id?: string;
      children?: unknown;
      [key: string]: unknown;
    };
    const resolvedProps: Record<string, unknown> = nestedProps !== undefined
      ? (nestedProps as Record<string, unknown>)
      : flatProps;
    // Preserve children — needed by pattern components that render
    // nested trees (stack, data-grid, form-section, etc). Nested-form
    // authors put `children` inside `props`; flat-form authors put it
    // at the top level. Either way it has to survive unwrapping.
    if (_childChildren !== undefined && nestedProps === undefined) {
      resolvedProps.children = _childChildren;
    }
    const childContent: SlotContent = {
      id: childId,
      pattern: child.type,
      props: resolvedProps,
      priority: 0,
      nodeId: child._id,
      // Inherit sourceTrait from the parent slot so nested patterns
      // (e.g. form-section inside a stack) can resolve entityDef via
      // the trait's linkedEntity for form-field enrichment.
      ...(sourceTrait !== undefined && { sourceTrait }),
    };

    return (
      <SlotContentRenderer
        key={childId}
        content={childContent}
        onDismiss={onDismiss}
        patternPath={childPath}
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
 * Detect the sExpression lambda form `["fn", argName, body]` that .lolo
 * authors use for per-row render props (DataGrid/DataList/Carousel
 * `renderItem`). Shape matches `RenderItemLambda` from `@almadar/core`:
 * head is the literal `"fn"`, second slot is the per-item argument name,
 * third slot is the pattern config to substitute and render. The
 * compiled path's codegen rewrites these into
 * `(item: T) => <JSX with @item.X substituted>` at build time; the
 * runtime path needs the same conversion or the component falls
 * through to its fields-based path with empty cards.
 */
function isFnFormLambda(value: unknown): value is RenderItemLambda {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value[0] === "fn" &&
    typeof value[1] === "string" &&
    value[2] !== null &&
    typeof value[2] === "object"
  );
}

/**
 * Walk a pattern body, replacing every `@<argName>.path.to.field` string
 * with the value at `path.to.field` of `arg`. Mirrors the compiler's
 * inline substitution for `renderItem` lambda bodies. Path lookup uses
 * dot-traversal; missing intermediate values resolve to `undefined`,
 * which is then stringified as `""` so consumers (Typography, Button
 * label, etc.) don't render the literal "undefined". Per `@almadar/core`'s
 * `RenderItemLambda` doc comment, the row arg is shaped as an
 * `EntityRow` (i.e. `Record<string, FieldValue>` with optional `id`).
 */
function resolveLambdaBindings(
  body: unknown,
  argName: string,
  arg: EntityRow,
): unknown {
  const prefix = `@${argName}.`;
  const lookup = (path: string): unknown => {
    let cur: unknown = arg;
    for (const seg of path.split(".")) {
      if (cur === null || cur === undefined) return undefined;
      if (typeof cur !== "object") return undefined;
      cur = (cur as Record<string, unknown>)[seg];
    }
    return cur;
  };
  if (typeof body === "string") {
    if (body === `@${argName}`) return arg;
    if (body.startsWith(prefix)) {
      const v = lookup(body.slice(prefix.length));
      return v === undefined || v === null ? "" : v;
    }
    return body;
  }
  if (Array.isArray(body)) {
    return body.map((b) => resolveLambdaBindings(b, argName, arg));
  }
  if (body !== null && typeof body === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
      out[k] = resolveLambdaBindings(v, argName, arg);
    }
    return out;
  }
  return body;
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
    } else if (isFnFormLambda(value)) {
      // sExpression lambda — convert to a per-item render-prop function.
      // DataGrid/DataList/Carousel call `props.renderItem(item, index)`
      // expecting a ReactNode; we resolve `@<argName>.X` bindings inside
      // the lambda body against `item` and feed the resulting pattern
      // tree back through SlotContentRenderer. Body shape is
      // `AnyPatternConfig` per `RenderItemLambda` in `@almadar/core`.
      const [, argName, body] = value;
      const lambdaBody: AnyPatternConfig = body;
      rendered[key] = (item: EntityRow, index: number): React.ReactNode => {
        const resolvedBody = resolveLambdaBindings(lambdaBody, argName, item);
        if (!isPatternConfig(resolvedBody)) {
          return null;
        }
        const childContent: SlotContent = {
          id: `lambda-${key}-${index}`,
          pattern: resolvedBody.type,
          props: Object.fromEntries(
            Object.entries(resolvedBody).filter(([k]) => k !== "type"),
          ),
          priority: 0,
        };
        return (
          <SlotContentRenderer content={childContent} onDismiss={onDismiss} />
        );
      };
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
  patternPath,
}: SlotContentRendererProps): React.ReactElement {
  // V2 (post-Phase-6): entity data arrives pre-resolved in `content.props.entity`
  // as a value (array or record). String-entity bindings — the EntityStore
  // fallback path — are gone; the compiler + runtime resolve bindings via
  // @payload.data / listener flows before handing props to this renderer.
  // If a stale `entity: "StringName"` literal is still present at render time
  // (e.g. non-migrated project content), dev-mode throws so the author fixes
  // the schema; prod silently renders nothing.
  const entityProp = content.props.entity;
  // Trace every render of every form-section so we can see whether
  // typing in the form causes the parent SlotContentRenderer to re-
  // render with a fresh entity reference (which would invalidate
  // Form's normalizedInitialData memo and reset typed values). Same
  // `almadar:ui:slot-render` namespace as the Slots/SlotBridge logs.
  if (content.pattern === 'form-section') {
    slotLog.debug('SlotContentRenderer:form-section-render', {
      contentId: content.id,
      sourceTrait: content.sourceTrait,
      entityRefId: refId(entityProp),
      entityIsObject: entityProp !== null && typeof entityProp === 'object' && !Array.isArray(entityProp),
    });
  }
  if (typeof entityProp === 'string' && entityProp.length > 0) {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
      throw new Error(
        `[UISlotRenderer] Received string 'entity: "${entityProp}"' at render time. The V2 flow requires pre-resolved data; declare a fetch success listener and pass 'entity: @payload.data'. See docs/Almadar_Entity_V2_Plan.md §6.`,
      );
    }
  }

  // Entity schema for form field type enrichment (optional — only available in runtime mode)
  const schemaCtx = useEntitySchemaOptional();
  // Two lookup paths:
  //   1. Legacy V1: entityProp is a string entity-name → look up directly.
  //   2. V2: entityProp is the resolved row/array (from @payload.row /
  //      @payload.data) → look up via the source trait's linkedEntity
  //      (projected from ResolvedTraitBinding by EntitySchemaProvider).
  // Without (2), form-section's `fields` enrichment never fires for
  // entity-bound forms in the V2 flow, and enum fields render as plain
  // text inputs instead of `<Select>`. Closes VR3.
  let entityDef: ResolvedEntity | undefined;
  if (typeof entityProp === 'string' && entityProp.length > 0 && schemaCtx) {
    entityDef = schemaCtx.entities.get(entityProp);
  } else if (schemaCtx && content.sourceTrait !== undefined) {
    const linkedEntity = schemaCtx.traitLinkedEntities.get(content.sourceTrait);
    if (linkedEntity !== undefined) {
      entityDef = schemaCtx.entities.get(linkedEntity);
    }
  }

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

    // Render children recursively (pass patternPath for WYSIWYG drop targeting).
    // Inherit sourceTrait from the parent so nested patterns (e.g. a
    // form-section inside a stack) can resolve entityDef via the trait's
    // linkedEntity. Without this, only the top-level slot pattern carries
    // sourceTrait and form enrichment skips for every nested form.
    const myPath = patternPath ?? 'root';
    const renderedChildren = hasChildren
      ? renderPatternChildren(childrenConfig, onDismiss, content.id, myPath, content.sourceTrait)
      : undefined;

    // Extract props without the children config (we pass rendered children instead)
    const { children: _childrenConfig, ...restProps } = content.props;

    // Recursively render any named props that are pattern configs
    const renderedProps = renderPatternProps(restProps, onDismiss);

    // Replace entity string with reactive store data. When the caller
    // already passed a pre-resolved array or single object via `entity`,
    // it flows through `renderedProps` untouched (no renderer action
    // needed). The string branch is the deprecated path.
    //
    // Auto-generate fields from entity records when not specified — this
    // is what the compiled app gets from the compiler, but the runtime
    // needs to derive at render time since the schema pattern may omit
    // field definitions.
    // V2: entity data flows through content.props.entity directly (pre-resolved
    // from @payload.data or value prop). No more store hydration.
    const finalProps: Record<string, unknown> = renderedProps;
    const resolvedItems: readonly unknown[] | null = Array.isArray(
      finalProps.entity,
    )
      ? (finalProps.entity as readonly unknown[])
      : null;
    if (
      resolvedItems &&
      resolvedItems.length > 0 &&
      !finalProps.fields &&
      !finalProps.columns
    ) {
      const sample = resolvedItems[0] as Record<string, unknown>;
      if (sample && typeof sample === 'object') {
        const keys = Object.keys(sample).filter((k) => k !== 'id' && k !== '_id');
        finalProps.fields = keys.map((k, i) => ({ name: k, variant: i === 0 ? 'h4' : 'body' }));
      }
    }

    // Form field type enrichment: inject entity field types into form SchemaFields.
    // Mirrors what the compiler does at build time (EntityFieldInfo injection).
    const isFormPattern = FORM_PATTERNS.has(content.pattern)
      || content.pattern.includes('form');
    if (isFormPattern && entityDef && Array.isArray(finalProps.fields)) {
      finalProps.fields = enrichFormFields(finalProps.fields as unknown[], entityDef);
      // V2: edit-form initialData comes pre-bound via `initialData: @payload.data`
      // instead of being hydrated from the entity store.
    }

    const acceptsChildren = PATTERNS_WITH_CHILDREN.has(content.pattern);
    return (
      <Box
        className="slot-content"
        data-pattern={content.pattern}
        data-id={content.id}
        data-node-id={content.nodeId}
        data-source-trait={content.sourceTrait}
        data-pattern-path={myPath}
        data-pattern-type={content.pattern}
        data-accepts-children={acceptsChildren ? 'true' : undefined}
      >
        <PatternComponent {...finalProps}>
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
      data-node-id={content.nodeId}
      data-source-trait={content.sourceTrait}
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
      "ui-slot-renderer relative min-h-full",
      className,
    )}>
      {/* Layout slots: sidebar + main in a flex row */}
      <Box className="flex min-h-full">
        <UISlotComponent slot="sidebar" className="ui-slot-sidebar min-w-0 shrink-0" />
        <UISlotComponent slot="main" className="ui-slot-main flex-1 min-h-[200px]" />
      </Box>

      {/* Portal slots */}
      <UISlotComponent slot="modal" portal />
      <UISlotComponent slot="drawer" portal />
      <UISlotComponent slot="overlay" portal />
      <UISlotComponent slot="center" portal />
      <UISlotComponent slot="toast" portal position="top-right" />

      {/* HUD slots (optional, for games) - absolutely positioned over content */}
      {includeHud && (
        <>
          <UISlotComponent
            slot="hud-top"
            className={isContained
              ? "absolute top-0 left-0 right-0 z-40"
              : "fixed top-0 inset-x-0 z-40"}
          />
          <UISlotComponent
            slot="hud-bottom"
            className={isContained
              ? "absolute bottom-0 left-0 right-0 z-40"
              : "fixed bottom-0 inset-x-0 z-40"}
          />
        </>
      )}

      {/* Floating slot (optional) - absolutely positioned */}
      {includeFloating && (
        <UISlotComponent
          slot="floating"
          className={isContained ? "absolute top-2 left-2 z-50" : "fixed z-50"}
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
