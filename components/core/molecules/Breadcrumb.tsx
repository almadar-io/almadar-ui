'use client';
/**
 * Breadcrumb Molecule Component
 *
 * A breadcrumb navigation component with separators and icons.
 * Uses Button, Icon, and Typography atoms.
 */

import React from "react";
import type { EventKey } from "@almadar/core";
import { Icon } from "../atoms/Icon";
import type { IconInput } from "../atoms/index";
import { Typography } from "../atoms/Typography";
import { cn } from "../../../lib/cn";
import { useEventBus } from "../../../hooks/useEventBus";
import { useTranslate } from "../../../hooks/useTranslate";
import { useNavStack } from "../../../providers/NavStackContext";

export interface BreadcrumbItem {
  /**
   * Item label
   */
  label: string;

  /**
   * Item href (if provided, renders as link)
   */
  href?: string;

  /**
   * Item path (alias for href, for schema compatibility)
   */
  path?: string;

  /**
   * Item icon (canonical kebab-case name or LucideIcon component)
   */
  icon?: IconInput;

  /**
   * Click handler (if href not provided)
   */
  onClick?: () => void;

  /**
   * Is current page
   */
  isCurrent?: boolean;

  /** Event name to emit when clicked (for trait state machine integration) */
  event?: EventKey;
}

export interface BreadcrumbProps {
  /**
   * Breadcrumb items. Omit together with `fromNavStack` to render the
   * orbital-scoped navigation stack instead of an authored trail.
   */
  items?: BreadcrumbItem[];

  /**
   * Render the current orbital's navigation stack (NavStackProvider) as the
   * trail: one crumb per visited/declared level, last entry current. The
   * stack is client-session state both execution paths maintain; outside a
   * provider this renders nothing.
   */
  fromNavStack?: boolean;

  /**
   * Event emitted when a non-current crumb is clicked, with payload
   * `{ label, href, index }` — the trait handles it with
   * `(navigate ?href)`. Without it, stack crumbs navigate directly.
   */
  itemEvent?: EventKey;

  /**
   * Separator icon (canonical kebab-case name or LucideIcon component)
   */
  separator?: IconInput;

  /**
   * Maximum items to show (truncates with ellipsis)
   */
  maxItems?: number;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  fromNavStack = false,
  itemEvent,
  separator = "chevron-right",
  maxItems,
  className,
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const navStack = useNavStack();

  // Stack mode: derive the trail from the orbital-scoped navigation stack.
  // `path` carries the target href for the click payload / direct goTo;
  // deliberately NOT `href`, so crumbs render as buttons (SPA), never
  // full-reload anchors.
  const sourceItems: BreadcrumbItem[] = fromNavStack
    ? navStack.entries.map((entry, i) => ({
        label: entry.label,
        path: entry.href,
        isCurrent: i === navStack.entries.length - 1,
        event: itemEvent,
      }))
    : (items ?? []);

  if (fromNavStack && sourceItems.length === 0) return null;

  const displayItems =
    maxItems && sourceItems.length > maxItems
      ? [
          ...sourceItems.slice(0, 1),
          { label: "...", isCurrent: false } as BreadcrumbItem,
          ...sourceItems.slice(-maxItems + 1),
        ]
      : sourceItems;

  return (
    <nav
      aria-label={t('aria.breadcrumb')}
      className={cn("flex items-center gap-2", className)}
    >
      <ol className="flex items-center gap-2">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.label === "...";

          return (
            <li key={index} className="flex items-center gap-2">
              {isEllipsis ? (
                <Typography variant="small" color="muted">
                  {item.label}
                </Typography>
              ) : (item.href || item.path) && !item.event && !fromNavStack ? (
                <a
                  href={item.href || item.path}
                  className={cn(
                    "flex items-center gap-1.5 transition-colors",
                    isLast
                      ? "text-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.icon && (typeof item.icon === "string"
                    ? <Icon name={item.icon} size="sm" />
                    : <Icon icon={item.icon} size="sm" />
                  )}
                  <Typography
                    variant="small"
                    weight={isLast ? "medium" : "normal"}
                  >
                    {item.label}
                  </Typography>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const href = item.path ?? item.href;
                    if (item.event) {
                      eventBus.emit(`UI:${item.event}`, { label: item.label, href, index });
                    } else if (fromNavStack && href) {
                      // Stack crumbs without an event navigate directly
                      // through the provider (SPA in both paths).
                      navStack.goTo(href);
                    }
                    item.onClick?.();
                  }}
                  className={cn(
                    "flex items-center gap-1.5 transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isLast
                      ? "text-foreground font-bold cursor-default"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-current={isLast ? "page" : undefined}
                  disabled={isLast}
                >
                  {item.icon && (typeof item.icon === "string"
                    ? <Icon name={item.icon} size="sm" />
                    : <Icon icon={item.icon} size="sm" />
                  )}
                  <Typography
                    variant="small"
                    weight={isLast ? "medium" : "normal"}
                  >
                    {item.label}
                  </Typography>
                </button>
              )}

              {!isLast && (
                typeof separator === "string"
                  ? <Icon name={separator} size="sm" className="text-muted-foreground" />
                  : <Icon icon={separator} size="sm" className="text-muted-foreground" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumb.displayName = "Breadcrumb";