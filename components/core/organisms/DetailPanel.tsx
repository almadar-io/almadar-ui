'use client';
/**
 * DetailPanel Organism Component
 *
 * Composes atoms and molecules to create a professional detail view.
 *
 * Data is provided by the runtime via the `entity` prop.
 * Extends DisplayStateProps (see ./types.ts) and declares `entity?: EntityRow`.
 */

import React, { useCallback, useEffect, Suspense, lazy } from "react";
import type { EventPayload, EntityRow, FieldValue } from "@almadar/core";
import type { ItemActionPayload } from "@almadar/core/patterns";
import { ArrowLeft, FileText, X } from "lucide-react";
import type { IconInput } from "../atoms/Icon";
import {
  Card,
  Badge,
  Typography,
  Icon,
  Avatar,
  Button,
  Divider,
  ProgressBar,
} from "../atoms/index";
import { Box } from "../atoms/Box";
import { VStack, HStack } from "../atoms/Stack";
import { SimpleGrid } from "../molecules/SimpleGrid";
import { Menu } from "../molecules/Menu";
import { LoadingState } from "../molecules/LoadingState";
import { ErrorState } from "../molecules/ErrorState";
import { EmptyState } from "../molecules/EmptyState";
import { cn } from "../../../lib/cn";
import { humanizeFieldName, humanizeEnumValue } from "../../../lib/format";
import { getNestedValue } from "../../../lib/getNestedValue";
import { useEventBus } from "../../../hooks/useEventBus";
import { useTranslate } from "../../../hooks/useTranslate";
import { useNavStack } from "../../../providers/NavStackContext";
import { useRenderSlot } from "../../../providers/RenderSlotContext";
import type { DisplayStateProps } from "./types";
import type { RelationOption } from "../molecules/RelationSelect";
import { formatFileSize } from "../molecules/UploadDropZone";

function getBadgeVariant(
  fieldName: string,
  value: string,
): "default" | "success" | "warning" | "danger" | "info" {
  const name = fieldName.toLowerCase();
  const val = String(value).toLowerCase();

  if (name.includes("status")) {
    if (
      val.includes("complete") ||
      val.includes("done") ||
      val.includes("active")
    )
      return "success";
    if (val.includes("progress") || val.includes("pending")) return "warning";
    if (val.includes("block") || val.includes("cancel")) return "danger";
    return "info";
  }

  if (name.includes("priority")) {
    if (val.includes("high") || val.includes("urgent")) return "danger";
    if (val.includes("medium") || val.includes("normal")) return "warning";
    if (val.includes("low")) return "info";
  }

  return "default";
}

const formatFieldLabel = humanizeFieldName;

function formatFieldValue(value: FieldValue | undefined, fieldName: string): string {
  if (typeof value === "number") {
    if (
      fieldName.toLowerCase().includes("progress") ||
      fieldName.toLowerCase().includes("percent")
    ) {
      return `${value}%`;
    }
    if (
      fieldName.toLowerCase().includes("budget") ||
      fieldName.toLowerCase().includes("cost")
    ) {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  return String(value);
}

// Lazy-load react-markdown only when needed
const ReactMarkdown = lazy(() => import("react-markdown"));

/** Typed field definition from entity schema (name + type). */
interface TypedFieldDef {
  name: string;
  type: string;
}

/** Schema metadata for one display field, injected by the runtime's
 *  detail enrichment (UISlotRenderer) or the compiled path's codegen. */
export interface FieldMeta {
  type?: string;
  /** Closed vocabulary — a `.lolo` string union's `values` sidecar. */
  values?: readonly string[];
  /** Relation target entity name, when the field is relation-typed. */
  relation?: string;
  /** Relation options for display-name resolution (from `relationsData`,
   *  injected server-side by the runtime / bound by compiled codegen). */
  options?: readonly RelationOption[];
}

/**
 * Render a field value with rich content support based on entity field type.
 * Uses the schema-declared type (not regex heuristics) to decide rendering.
 */
function renderRichFieldValue(
  value: FieldValue | undefined,
  fieldName: string,
  fieldType?: string,
  meta?: FieldMeta,
): React.ReactNode {
  if (value === undefined || value === null) return "—";

  const str = String(value);

  switch (fieldType) {
    case "image":
    case "url": {
      // Only render as image if the URL looks like an image
      if (str.match(/\.(png|jpe?g|gif|svg|webp|avif)(\?|$)/i) || str.startsWith("data:image/")) {
        return (
          <Box className="mt-1 max-w-full">
            <img
              src={str}
              alt={formatFieldLabel(fieldName)}
              className="max-w-full max-h-64 rounded-md object-contain"
              loading="lazy"
            />
          </Box>
        );
      }
      if (fieldType === "url" && /^https?:\/\//i.test(str)) {
        return (
          <a
            href={str}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline break-all"
          >
            {str}
          </a>
        );
      }
      return str;
    }

    case "markdown":
    case "richtext":
      return (
        <Suspense fallback={<Typography variant="body" className="break-words">{str}</Typography>}>
          <Box
            className="prose prose-sm max-w-none"
            style={{
              color: 'var(--color-foreground)',
              '--tw-prose-body': 'var(--color-foreground)',
              '--tw-prose-headings': 'var(--color-foreground)',
              '--tw-prose-bold': 'var(--color-foreground)',
              '--tw-prose-links': 'var(--color-primary)',
              '--tw-prose-code': 'var(--color-foreground)',
              '--tw-prose-hr': 'var(--color-border)',
              '--tw-prose-quotes': 'var(--color-foreground)',
              '--tw-prose-quote-borders': 'var(--color-primary)',
              '--tw-prose-captions': 'var(--color-muted-foreground)',
              '--tw-prose-th-borders': 'var(--color-border)',
              '--tw-prose-td-borders': 'var(--color-border)',
            } as React.CSSProperties}
          >
            <ReactMarkdown>{str}</ReactMarkdown>
          </Box>
        </Suspense>
      );

    case "code":
      return (
        <Box className="mt-1 rounded-md bg-muted p-3 overflow-x-auto">
          <pre className="text-sm font-mono whitespace-pre-wrap break-words m-0">
            <code>{str}</code>
          </pre>
        </Box>
      );

    case "html":
      return (
        <Box
          className="mt-1 prose prose-sm max-w-none break-words"
          style={{
            color: 'var(--color-foreground)',
            '--tw-prose-body': 'var(--color-foreground)',
            '--tw-prose-headings': 'var(--color-foreground)',
            '--tw-prose-bold': 'var(--color-foreground)',
            '--tw-prose-links': 'var(--color-primary)',
            '--tw-prose-code': 'var(--color-foreground)',
            '--tw-prose-hr': 'var(--color-border)',
            '--tw-prose-quotes': 'var(--color-foreground)',
            '--tw-prose-quote-borders': 'var(--color-primary)',
            '--tw-prose-captions': 'var(--color-muted-foreground)',
            '--tw-prose-th-borders': 'var(--color-border)',
            '--tw-prose-td-borders': 'var(--color-border)',
          } as React.CSSProperties}
        >
          <Typography variant="body">{str}</Typography>
        </Box>
      );

    case "date":
    case "datetime":
    case "timestamp": {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
          ...(fieldType !== "date" ? { hour: "2-digit", minute: "2-digit" } : {}),
        });
      }
      return str;
    }

    case "money": {
      const n = typeof value === "number" ? value : Number(str);
      if (!isNaN(n)) {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: "USD",
        }).format(n);
      }
      return str;
    }

    case "relation": {
      // Resolve the stored foreign id to its display name via the injected
      // relation options (same {value, label} contract as Form's selects).
      const match = meta?.options?.find((opt) => opt.value === str);
      return match ? match.label : str;
    }

    case "file": {
      // A file field holds the canonical {name, url, mimeType, sizeBytes}
      // struct — render a download chip, never the raw object.
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        const file = value as { name?: string; url?: string; sizeBytes?: number };
        const label = typeof file.name === "string" && file.name ? file.name : "file";
        const size = typeof file.sizeBytes === "number" ? ` · ${formatFileSize(file.sizeBytes)}` : "";
        return (
          <a
            href={typeof file.url === "string" ? file.url : undefined}
            download={label}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-sm text-foreground no-underline hover:bg-accent"
          >
            <Icon icon={FileText} size="sm" className="text-muted-foreground" />
            {label}
            {size && (
              <Typography as="span" variant="caption" color="muted">
                {size}
              </Typography>
            )}
          </a>
        );
      }
      return str;
    }

    case "boolean": {
      if (typeof value === "boolean") return value ? "Yes" : "No";
      if (str === "true") return "Yes";
      if (str === "false") return "No";
      return str;
    }

    case "array": {
      if (Array.isArray(value) && value.length > 0) {
        return (
          <HStack gap="xs" wrap>
            {value.map((item, i) => (
              <Badge key={i} variant="default">
                {String(item)}
              </Badge>
            ))}
          </HStack>
        );
      }
      if (Array.isArray(value)) return "—";
      return str;
    }

    case "email":
      return (
        <a href={`mailto:${str}`} className="text-primary hover:underline break-all">
          {str}
        </a>
      );

    case "phone":
      return (
        <a href={`tel:${str}`} className="text-primary hover:underline">
          {str}
        </a>
      );

    default:
      // A field with a schema-declared closed vocabulary (a `.lolo` string
      // union) renders as a Badge — its value is a state, not prose.
      if (meta?.values && meta.values.length > 0 && meta.values.includes(str)) {
        return (
          <Badge variant={getBadgeVariant(fieldName, str)}>
            {humanizeEnumValue(str)}
          </Badge>
        );
      }
      return formatFieldValue(value, fieldName);
  }
}

export interface DetailField {
  label: string;
  value: React.ReactNode;
  icon?: IconInput;
  copyable?: boolean;
}

export interface DetailSection {
  title: string;
  fields: (DetailField | string)[];
}

/**
 * Action definition for DetailPanel
 */
export interface DetailPanelAction {
  label: string;
  icon?: IconInput;
  onClick?: () => void;
  /** Event to emit via event bus */
  event?: string;
  /** Navigation URL */
  navigatesTo?: string;
  /** Button variant (primary for main action, others for secondary) */
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

/**
 * Field definition for unified interface - can be a simple string, key/header
 * object, or typed object. `type`/`values`/`relation` on the {key, header}
 * shape are injected by the runtime's detail enrichment (UISlotRenderer) or
 * the compiled path's codegen — call sites keep authoring plain {key, header}.
 */
export type FieldDef =
  | string
  | { key: string; header?: string; type?: string; values?: readonly string[]; relation?: string }
  | { name: string; type: string; values?: readonly string[]; relation?: string };

/**
 * Normalize fields to simple string array
 */
function normalizeFieldDefs(fields: readonly FieldDef[] | undefined): string[] {
  if (!fields) return [];
  return fields.map((f) => {
    if (typeof f === "string") return f;
    if ("key" in f) return f.key;
    if ("name" in f) return f.name;
    return String(f);
  });
}

/**
 * Build a map of field name -> authored header, so a call site's `header`
 * survives into the rendered section instead of being re-derived from the key.
 */
function buildFieldLabelMap(fields: readonly FieldDef[] | undefined): Record<string, string> {
  const map: Record<string, string> = {};
  if (!fields) return map;
  for (const f of fields) {
    if (typeof f === "object" && "key" in f && f.header !== undefined && f.header !== "") {
      map[f.key] = f.header;
    }
  }
  return map;
}

/**
 * Build a map of field name -> field type from typed field definitions.
 * Reads `type` off BOTH object shapes — {name, type} and the enriched
 * {key, header, type} the runtime/compiled paths inject.
 */
function buildFieldTypeMap(fields: readonly FieldDef[] | undefined): Record<string, string> {
  const map: Record<string, string> = {};
  if (!fields) return map;
  for (const f of fields) {
    if (typeof f === "object" && f.type !== undefined) {
      map["name" in f ? f.name : f.key] = f.type;
    }
  }
  return map;
}

/**
 * Build a map of field name -> schema metadata (values vocabulary, relation
 * target) from enriched field definitions.
 */
function buildFieldMetaMap(fields: readonly FieldDef[] | undefined): Record<string, FieldMeta> {
  const map: Record<string, FieldMeta> = {};
  if (!fields) return map;
  for (const f of fields) {
    if (typeof f === "object" && (f.type !== undefined || f.values !== undefined || f.relation !== undefined)) {
      map["name" in f ? f.name : f.key] = { type: f.type, values: f.values, relation: f.relation };
    }
  }
  return map;
}

export interface DetailPanelStatus {
  label: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

/**
 * Props for DetailPanel — the generic read-only record detail view.
 *
 * @fieldsContract display
 */
export interface DetailPanelProps extends DisplayStateProps {
  /** RECORD-cardinality: renders ONE record (see body collapse below). */
  entity?: EntityRow;
  title?: string;
  subtitle?: string;
  status?: DetailPanelStatus;
  avatar?: React.ReactNode;
  sections?: readonly DetailSection[];
  /** Unified actions array - first action with variant='primary' is the main action */
  actions?: readonly DetailPanelAction[];
  /** Max inline action buttons before the rest collapse into a "⋯" overflow
   *  menu (mirrors DataGrid's maxInlineActions). Defaults to 2 — primary +
   *  secondary visible, the rest under the menu — so every detail panel
   *  carries the same action pattern. */
  maxInlineActions?: number;
  /**
   * Navigation-back affordance. Renders top-LEFT before the title (OS/back
   * convention — Almadar_UX §8.4), spatially separated from the right-aligned
   * action buttons + close X. Never inferred from actions[] labels.
   */
  backAction?: DetailPanelAction;
  footer?: React.ReactNode;
  slideOver?: boolean;

  /** Fields to display - accepts string[], {key, header}[], or DetailField[] */
  fields: readonly (FieldDef | DetailField)[];
  /** Alias for fields - backwards compatibility */
  fieldNames?: readonly string[];
  /** Initial data for edit mode (passed by compiler) */
  initialData?: EntityRow;
  /** Display mode (passed by compiler) */
  mode?: string;
  /** Panel position (for drawer/sidebar placement) */
  position?: "left" | "right";
  /** Panel width (CSS value, e.g., '400px', '50%') */
  width?: string;
  /** Display fields (alias for fields) */
  displayFields?: readonly string[];
  /** When false, hides the action buttons + overflow menu (and the close ×).
   *  Defaults to true. */
  showActions?: boolean;
  /** Relation display data: { fieldName: [{value, label}] } — injected
   *  server-side by the runtime (relation-option injection) or bound by
   *  compiled codegen; resolves stored foreign ids to display names. */
  relationsData?: Record<string, readonly RelationOption[]>;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  title: propTitle,
  subtitle,
  status,
  avatar,
  sections: propSections,
  actions,
  maxInlineActions = 2,
  backAction,
  footer,
  slideOver = false,
  showActions = true,
  className,
  entity,
  fields: propFields,
  fieldNames,
  initialData,
  isLoading = false,
  error,
  relationsData,
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();

  // Support fields and fieldNames (alias) - normalize to string array
  // Check if propFields contains FieldDef (string or {key}) or DetailField (has label/value)
  const isFieldDefArray = (
    arr: readonly (FieldDef | DetailField)[] | undefined,
  ): arr is readonly FieldDef[] => {
    if (!arr || arr.length === 0) return false;
    const first = arr[0];
    return (
      typeof first === "string" ||
      (typeof first === "object" && first !== null && ("key" in first || "name" in first))
    );
  };

  const effectiveFieldNames = isFieldDefArray(propFields)
    ? normalizeFieldDefs(propFields)
    : fieldNames;

  // Build field type map from typed field definitions
  const fieldTypeMap = isFieldDefArray(propFields)
    ? buildFieldTypeMap(propFields)
    : {};

  const fieldMetaMap = isFieldDefArray(propFields)
    ? buildFieldMetaMap(propFields)
    : {};

  const fieldLabelMap = isFieldDefArray(propFields)
    ? buildFieldLabelMap(propFields)
    : {};
  const labelFor = (field: string): string => fieldLabelMap[field] ?? formatFieldLabel(field);

  // Schema metadata + relation options merged per field for typed rendering.
  const metaFor = (field: string): FieldMeta | undefined => {
    const base = fieldMetaMap[field];
    const options = relationsData?.[field];
    if (!base && !options) return undefined;
    return { ...base, options };
  };

  // Handle action click with event bus and navigation support
  const handleActionClick = useCallback(
    (action: DetailPanelAction, data?: EventPayload) => {
      if (action.navigatesTo) {
        // Replace template variables in URL
        const url = action.navigatesTo.replace(/\{\{(\w+)\}\}/g, (_, key) =>
          String(data?.[key] ?? ""),
        );
        eventBus.emit('UI:NAVIGATE', { url, row: data });
        return;
      }
      if (action.event) {
        const payload: ItemActionPayload | EventPayload = data
          ? { id: data.id as string | number, row: data as ItemActionPayload['row'] }
          : {};
        eventBus.emit(`UI:${action.event}`, payload);
      }
      if (action.onClick) {
        action.onClick();
      }
    },
    [eventBus],
  );

  // entity is now the data itself (single record or first element of array)
  const entityRecord = Array.isArray(entity) ? entity[0] : entity;
  const data = entityRecord ?? initialData;

  let title = propTitle;
  // Use a mutable array for building sections, but accept readonly from props
  let sections: DetailSection[] | undefined = propSections
    ? [...propSections]
    : undefined;

  // Normalize data to EventPayload for indexing and payload propagation
  const normalizedData =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as EventPayload)
      : undefined;

  // Resolve string fields in sections using entity data
  if (sections && normalizedData) {
    sections = sections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => {
        if (typeof field === "string") {
          const value = getNestedValue(normalizedData, field) as FieldValue | undefined;
          return {
            label: labelFor(field),
            value: formatFieldValue(value, field),
          };
        }
        return field;
      }),
    }));
  }

  // Build sections from schema if provided
  if (normalizedData && effectiveFieldNames) {
    const primaryField = effectiveFieldNames[0];
    // Only the field actually consumed as the title is withheld from the body
    const titleDerivedFromPrimary = Boolean(
      !title && primaryField && normalizedData[primaryField],
    );
    if (titleDerivedFromPrimary) {
      title = String(normalizedData[primaryField]);
    }

    // Categorize fields
    const statusFields = effectiveFieldNames.filter(
      (f) =>
        f.toLowerCase().includes("status") ||
        f.toLowerCase().includes("priority"),
    );
    const progressFields = effectiveFieldNames.filter(
      (f) =>
        f.toLowerCase().includes("progress") ||
        f.toLowerCase().includes("percent"),
    );
    const metricFields = effectiveFieldNames.filter(
      (f) =>
        (f.toLowerCase().includes("budget") ||
          f.toLowerCase().includes("cost") ||
          f.toLowerCase().includes("count")) &&
        !progressFields.includes(f),
    );
    const dateFields = effectiveFieldNames.filter(
      (f) =>
        f.toLowerCase().includes("date") || f.toLowerCase().includes("time"),
    );
    const descriptionFields = effectiveFieldNames.filter(
      (f) =>
        f.toLowerCase().includes("description") ||
        f.toLowerCase().includes("note"),
    );
    const otherFields = effectiveFieldNames.filter(
      (f) =>
        (!titleDerivedFromPrimary || f !== primaryField) &&
        !statusFields.includes(f) &&
        !progressFields.includes(f) &&
        !metricFields.includes(f) &&
        !dateFields.includes(f) &&
        !descriptionFields.includes(f),
    );

    sections = [];

    // Overview section. Status/priority fields are DELIBERATELY withheld —
    // they already render as badges beside the title; repeating them as grid
    // rows showed the same value twice on 53 of 79 surveyed detail pages.
    if (otherFields.length > 0) {
      const overviewFields: DetailField[] = [];

      otherFields.forEach((field) => {
        const value = getNestedValue(normalizedData, field) as FieldValue | undefined;
        if (value !== undefined && value !== null) {
          overviewFields.push({
            label: labelFor(field),
            value: renderRichFieldValue(value, field, fieldTypeMap[field], metaFor(field)),
          });
        }
      });

      if (overviewFields.length > 0) {
        sections.push({ title: "Overview", fields: overviewFields });
      }
    }

    // Metrics section
    if (progressFields.length > 0 || metricFields.length > 0) {
      const metricsFields: DetailField[] = [];

      [...progressFields, ...metricFields].forEach((field) => {
        const value = getNestedValue(normalizedData, field) as FieldValue | undefined;
        if (value !== undefined && value !== null) {
          metricsFields.push({
            label: labelFor(field),
            value: renderRichFieldValue(value, field, fieldTypeMap[field], metaFor(field)),
          });
        }
      });

      if (metricsFields.length > 0) {
        sections.push({ title: "Metrics", fields: metricsFields });
      }
    }

    // Timeline section
    if (dateFields.length > 0) {
      const timelineFields: DetailField[] = [];

      dateFields.forEach((field) => {
        const value = getNestedValue(normalizedData, field) as FieldValue | undefined;
        if (value !== undefined && value !== null) {
          timelineFields.push({
            label: labelFor(field),
            value: renderRichFieldValue(value, field, fieldTypeMap[field], metaFor(field)),
          });
        }
      });

      if (timelineFields.length > 0) {
        sections.push({ title: "Timeline", fields: timelineFields });
      }
    }

    // Description section
    if (descriptionFields.length > 0) {
      const descFields: DetailField[] = [];

      descriptionFields.forEach((field) => {
        const value = getNestedValue(normalizedData, field) as FieldValue | undefined;
        if (value !== undefined && value !== null) {
          descFields.push({
            label: labelFor(field),
            value: renderRichFieldValue(value, field, fieldTypeMap[field], metaFor(field)),
          });
        }
      });

      if (descFields.length > 0) {
        sections.push({ title: "Details", fields: descFields });
      }
    }
  }

  // Feed the loaded record's title into the nav stack's current crumb, so a
  // cold-loaded/refreshed detail page reads like an in-app push ("Contracts
  // › Service Agreement", not "Contracts › Contract Detail"). Only from the
  // routed MAIN slot — a modal/drawer/slide-over must not relabel the page's
  // crumb — and a no-op outside a NavStackProvider (inert default API).
  const renderSlot = useRenderSlot();
  const navStack = useNavStack();
  const { setCurrentLabel } = navStack;
  const resolvedTitle = normalizedData ? title : undefined;
  useEffect(() => {
    if (renderSlot === "main" && !slideOver && resolvedTitle) {
      setCurrentLabel(resolvedTitle);
    }
  }, [renderSlot, slideOver, resolvedTitle, setCurrentLabel]);

  if (isLoading) {
    return (
      <LoadingState
        message={t('common.loading')}
        className={className}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title={t("error.loadingData")}
        message={error.message || t("error.genericLoad")}
        retryEvent="RETRY"
        className={className}
      />
    );
  }

  if (
    !normalizedData &&
    !isLoading &&
    effectiveFieldNames &&
    effectiveFieldNames.length > 0
  ) {
    return (
      <EmptyState
        title={t('error.notFound')}
        description="The requested item could not be found."
        className={className}
      />
    );
  }

  // Flatten all section fields into a single list (no section headings)
  const allFields: DetailField[] = [];
  if (sections) {
    for (const section of sections) {
      for (const field of section.fields) {
        if (typeof field === "string") {
          const value = (normalizedData ? getNestedValue(normalizedData, field) : undefined) as FieldValue | undefined;
          allFields.push({
            label: labelFor(field),
            value: renderRichFieldValue(value, field, fieldTypeMap[field], metaFor(field)),
          });
        } else {
          allFields.push(field);
        }
      }
    }
  }

  // The close × renders ONLY when the call site declares a close-matching
  // action — a routed detail page declares none and gets no dismiss
  // affordance (the shell's Back owns navigation there). Viewers,
  // slide-overs and modals keep their declared Close, wired to its event.
  const closeAction = actions?.find(
    (a) => a.event === "CLOSE" || a.event === "CANCEL" || a.label?.toLowerCase() === "close",
  );
  const otherActions = actions?.filter((a) => a !== closeAction) ?? [];

  const statusBadges = (
    <>
      {normalizedData && effectiveFieldNames &&
        effectiveFieldNames
          .filter(
            (f) =>
              f.toLowerCase().includes("status") ||
              f.toLowerCase().includes("priority"),
          )
          .map((field) => {
            const value = getNestedValue(normalizedData, field);
            if (!value) return null;
            return (
              <Badge
                key={field}
                variant={getBadgeVariant(field, String(value))}
              >
                {humanizeEnumValue(String(value))}
              </Badge>
            );
          })}
      {status && (
        <Badge variant={status.variant ?? "default"}>
          {status.label}
        </Badge>
      )}
    </>
  );

  const content = (
    <Card variant="elevated">
      <VStack gap="md" className="p-6">
        {/* One-row header: identity LEFT (back per OS convention, then
            avatar + title with its status badges + subtitle), actions RIGHT
            (inline up to maxInlineActions, rest in the ⋯ menu, gated ×). */}
        <HStack justify="between" align="start" gap="md">
          <HStack align="start" gap="sm" className="min-w-0">
            {backAction && (
              <Button
                variant={backAction.variant || "ghost"}
                size="sm"
                action={backAction.navigatesTo ? undefined : backAction.event}
                actionPayload={{ row: normalizedData }}
                onClick={backAction.navigatesTo ? () => handleActionClick(backAction, normalizedData) : undefined}
                icon={backAction.icon ?? ArrowLeft}
                data-testid={backAction.event ? `action-${backAction.event}` : "action-back"}
              >
                {backAction.label}
              </Button>
            )}
            {avatar}
            <VStack gap="xs" className="min-w-0">
              <HStack align="center" gap="sm" wrap>
                <Typography variant="h2" weight="bold">
                  {title || "Details"}
                </Typography>
                {statusBadges}
              </HStack>
              {subtitle && (
                <Typography variant="body" color="secondary">
                  {subtitle}
                </Typography>
              )}
            </VStack>
          </HStack>
          {showActions && (
            <HStack justify="end" align="center" gap="xs" className="shrink-0">
              {otherActions.slice(0, maxInlineActions).map((action, idx) => (
                <Button
                  key={idx}
                  variant={action.variant || "secondary"}
                  size="sm"
                  action={action.navigatesTo ? undefined : action.event}
                  actionPayload={{ row: normalizedData }}
                  onClick={action.navigatesTo ? () => handleActionClick(action, normalizedData) : undefined}
                  icon={action.icon}
                  data-testid={action.event ? `action-${action.event}` : undefined}
                  data-row-id={normalizedData?.id !== undefined ? String(normalizedData.id) : undefined}
                >
                  {action.label}
                </Button>
              ))}
              {otherActions.length > maxInlineActions && (
                <Menu
                  position="bottom-end"
                  trigger={
                    <Button variant="ghost" size="sm" aria-label={t('common.actions')} data-testid="action-overflow">
                      <Icon name="more-horizontal" size="xs" />
                    </Button>
                  }
                  items={otherActions.slice(maxInlineActions).map((action) => ({
                    // ONE firing path: onClick → handleActionClick (emits with
                    // the {id, row} payload). Passing `event` too would make
                    // Menu emit a second, payload-less copy of the same event.
                    label: action.label,
                    icon: action.icon,
                    variant: action.variant === "danger" ? ("danger" as const) : ("default" as const),
                    onClick: () => handleActionClick(action, normalizedData),
                  }))}
                />
              )}
              {closeAction && (
                <Button
                  variant="ghost"
                  size="sm"
                  action={closeAction.event}
                  actionPayload={{ row: normalizedData }}
                  onClick={closeAction.event ? undefined : () => handleActionClick(closeAction, normalizedData)}
                  icon={X}
                  data-testid={closeAction.event ? `action-${closeAction.event}` : "action-close"}
                />
              )}
            </HStack>
          )}
        </HStack>

        {/* Progress bars */}
        {normalizedData &&
          effectiveFieldNames &&
          effectiveFieldNames
            .filter(
              (f) =>
                f.toLowerCase().includes("progress") ||
                f.toLowerCase().includes("percent"),
            )
            .map((field) => {
              const value = getNestedValue(normalizedData, field);
              if (
                value === undefined ||
                value === null ||
                typeof value !== "number"
              )
                return null;
              return (
                <VStack key={field} gap="xs" className="w-full">
                  <HStack justify="between">
                    <Typography variant="small" color="secondary">
                      {formatFieldLabel(field)}
                    </Typography>
                    <Typography variant="small" weight="medium">
                      {value}%
                    </Typography>
                  </HStack>
                  <ProgressBar value={value} />
                </VStack>
              );
            })}

        {/* All fields in a flat grid (no section headings) */}
        {allFields.length > 0 && (
          <>
            <Divider />
            <SimpleGrid minChildWidth="250px" maxCols={2} gap="lg">
              {allFields.map((field, idx) => (
                <HStack key={idx} gap="sm" align="start">
                  {field.icon && (
                    <Icon
                      icon={field.icon}
                      size="md"
                      className="text-muted-foreground mt-1"
                    />
                  )}
                  <VStack gap="xs" flex className="min-w-0">
                    <Typography
                      variant="caption"
                      color="muted"
                      weight="medium"
                      className="uppercase tracking-wider"
                    >
                      {field.label}
                    </Typography>
                    <Typography variant="body" className="break-words">
                      {field.value || "—"}
                    </Typography>
                  </VStack>
                </HStack>
              ))}
            </SimpleGrid>
          </>
        )}

        {/* Footer */}
        {footer && (
          <>
            <Divider />
            {footer}
          </>
        )}
      </VStack>
    </Card>
  );

  return (
    <Box
      className={cn(
        slideOver &&
          "fixed inset-y-0 right-0 w-full max-w-2xl bg-card shadow-lg z-50 overflow-y-auto p-6",
        className,
      )}
    >
      {content}
    </Box>
  );
};

DetailPanel.displayName = "DetailPanel";
