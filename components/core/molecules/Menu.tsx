'use client';
/**
 * Menu Molecule Component
 *
 * A dropdown menu component with items, icons, dividers, and sub-menus.
 * Uses theme-aware CSS variables for styling.
 */

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTapReveal } from "../../../hooks/useTapReveal";
import { Box } from "../atoms/Box";
import type { IconInput } from "../atoms/index";
import { Icon } from "../atoms/Icon";
import { Divider } from "../atoms/Divider";
import { Typography } from "../atoms/Typography";
import { Badge } from "../atoms/Badge";
import { cn } from "../../../lib/cn";
import { useEventBus } from "../../../hooks/useEventBus";
import { useTranslate } from "../../../hooks/useTranslate";

export interface MenuItem {
  /** Item ID (auto-generated from label if not provided) */
  id?: string;
  /** Item label */
  label: string;
  /** Item icon (Lucide icon name or component) */
  icon?: IconInput;
  /** Item badge */
  badge?: string | number;
  /** Disable item */
  disabled?: boolean;
  /** Item click handler */
  onClick?: () => void;
  /** Event name for pattern compatibility */
  event?: string;
  /** Variant for styling (pattern compatibility) */
  variant?: "default" | "danger";
  /** Sub-menu items */
  subMenu?: MenuItem[];
}

export type MenuPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end";

/**
 * Subset of props Menu's `React.cloneElement` injects into the trigger
 * child. Typing the clone target as `React.ReactElement<MenuTriggerProps>`
 * keeps the call totally — no `any`, no `unknown` — while letting
 * arbitrary additional props on the underlying element pass through.
 */
interface MenuTriggerProps {
  ref?: React.Ref<HTMLElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export interface MenuProps {
  /** Menu trigger element */
  trigger: React.ReactNode;
  /** Menu items */
  items: MenuItem[];
  /** Menu position */
  position?: MenuPosition;
  /** Additional CSS classes */
  className?: string;
  /** Optional slot rendered above the items. */
  header?: React.ReactNode;
  /** Optional slot rendered below the items. */
  footer?: React.ReactNode;
}

const MENU_GAP = 4;

// Compute fixed viewport coords for the dropdown panel given the trigger rect
// and the desired position. Returns inline style to apply to the portaled div.
function computeMenuStyle(
  position: string,
  triggerRect: DOMRect,
): React.CSSProperties {
  const isTop = position.startsWith("top");
  const isRight = position.endsWith("right") || position.endsWith("end");

  if (isTop) {
    return {
      top: triggerRect.top - MENU_GAP,
      transform: "translateY(-100%)",
      ...(isRight
        ? { right: window.innerWidth - triggerRect.right }
        : { left: triggerRect.left }),
    };
  }
  return {
    top: triggerRect.bottom + MENU_GAP,
    ...(isRight
      ? { right: window.innerWidth - triggerRect.right }
      : { left: triggerRect.left }),
  };
}

const menuContainerStyles = cn(
  "bg-card",
  "border-[length:var(--border-width)] border-border",
  "shadow-elevation-popover",
  "rounded-sm",
  "min-w-0 sm:min-w-[200px] max-w-[calc(100vw-1rem)] py-1",
);

// Submenu that portals to body and positions itself relative to the item row.
function SubMenu({
  items,
  itemRef,
  direction,
  eventBus,
}: {
  items: MenuItem[];
  itemRef: HTMLElement | null;
  direction: string;
  eventBus: ReturnType<typeof useEventBus>;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (itemRef) {
      setRect(itemRef.getBoundingClientRect());
    }
  }, [itemRef]);

  if (!rect) return null;

  const isRtl = direction === "rtl";
  const style: React.CSSProperties = {
    top: rect.top,
    ...(isRtl
      ? { right: window.innerWidth - rect.left }
      : { left: rect.right }),
  };

  const panel = (
    <div
      className={cn("fixed z-50", menuContainerStyles)}
      style={style}
    >
      {items.map((item, index) => {
        const isDivider = item.id === "divider" || item.label === "divider";
        const itemId =
          item.id ??
          `item-${item.label.toLowerCase().replace(/\s+/g, "-")}-${index}`;
        const isDanger = item.variant === "danger";

        if (isDivider) {
          return <Divider key={`divider-${index}`} className="my-1" />;
        }

        return (
          <Box
            key={itemId}
            as="button"
            onClick={() => {
              if (item.disabled) return;
              if (item.event) eventBus.emit(`UI:${item.event}`, { itemId, label: item.label });
              item.onClick?.();
            }}
            aria-disabled={item.disabled || undefined}
            data-testid={item.event ? `action-${item.event}` : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 text-start",
              "text-sm transition-colors",
              "hover:bg-muted focus:outline-none focus:bg-muted",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              item.disabled && "cursor-not-allowed",
              isDanger && "text-error hover:bg-error/10",
            )}
          >
            {item.icon &&
              (typeof item.icon === "string" ? (
                <Icon name={item.icon} size="sm" className="flex-shrink-0" />
              ) : (
                <Icon icon={item.icon} size="sm" className="flex-shrink-0" />
              ))}
            <Typography variant="small" className={cn("flex-1", isDanger && "text-red-600")}>
              {item.label}
            </Typography>
            {item.badge !== undefined && (
              <span className="ml-auto text-xs font-medium">{item.badge}</span>
            )}
          </Box>
        );
      })}
    </div>
  );

  return typeof document !== "undefined" ? createPortal(panel, document.body) : panel;
}

// One menu row. Submenus open on hover, which never fires on touch — so a tap
// opens the submenu through the SAME open path (`openSubMenu`) via `useTapReveal`.
function MenuItemRow({
  item,
  itemId,
  hasSubMenu,
  isDanger,
  direction,
  isSubMenuOpen,
  activeSubMenuRef,
  eventBus,
  onItemClick,
  openSubMenu,
}: {
  item: MenuItem;
  itemId: string;
  hasSubMenu: boolean;
  isDanger: boolean;
  direction: string;
  isSubMenuOpen: boolean;
  activeSubMenuRef: HTMLElement | null;
  eventBus: ReturnType<typeof useEventBus>;
  onItemClick: (item: MenuItem, itemId: string) => void;
  openSubMenu: (itemId: string, el: HTMLElement | null) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  const { triggerProps } = useTapReveal({
    enabled: hasSubMenu,
    onReveal: () => openSubMenu(itemId, rowRef.current),
    refs: [rowRef],
  });

  return (
    <Box>
      <Box
        ref={rowRef}
        as="button"
        onClick={() => onItemClick({ ...item, id: itemId }, itemId)}
        aria-disabled={item.disabled || undefined}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
          if (hasSubMenu) openSubMenu(itemId, e.currentTarget);
        }}
        onPointerDown={hasSubMenu ? triggerProps.onPointerDown : undefined}
        data-testid={item.event ? `action-${item.event}` : undefined}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-4 py-2 text-start",
          "text-sm transition-colors",
          "hover:bg-muted",
          "focus:outline-none focus:bg-muted",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          item.disabled && "cursor-not-allowed",
          isDanger && "text-error hover:bg-error/10",
        )}
      >
        <Box className="flex items-center gap-3 flex-1 min-w-0">
          {item.icon &&
            (typeof item.icon === "string" ? (
              <Icon name={item.icon} size="sm" className="flex-shrink-0" />
            ) : (
              <Icon icon={item.icon} size="sm" className="flex-shrink-0" />
            ))}
          <Typography
            variant="small"
            className={cn("flex-1", isDanger && "text-red-600")}
          >
            {item.label}
          </Typography>
          {item.badge !== undefined && (
            <Badge variant="default" size="sm">
              {item.badge}
            </Badge>
          )}
          {hasSubMenu && (
            <Icon
              name={direction === "rtl" ? "chevron-left" : "chevron-right"}
              size="sm"
              className="flex-shrink-0"
            />
          )}
        </Box>
      </Box>
      {hasSubMenu && isSubMenuOpen && item.subMenu && (
        <SubMenu
          items={item.subMenu}
          itemRef={activeSubMenuRef}
          direction={direction}
          eventBus={eventBus}
        />
      )}
    </Box>
  );
}

export const Menu: React.FC<MenuProps> = ({
  trigger,
  items,
  position = "bottom-left",
  className,
  header,
  footer,
}) => {
  const eventBus = useEventBus();
  const { direction } = useTranslate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [activeSubMenuRef, setActiveSubMenuRef] = useState<HTMLElement | null>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
    setActiveSubMenu(null);
    setActiveSubMenuRef(null);
  };

  const handleItemClick = (item: MenuItem, itemId: string) => {
    if (item.disabled) return;

    if (item.subMenu && item.subMenu.length > 0) {
      setActiveSubMenu(itemId);
    } else {
      if (item.event) eventBus.emit(`UI:${item.event}`, { itemId, label: item.label });
      item.onClick?.();
      setIsOpen(false);
    }
  };

  const openSubMenu = (itemId: string, el: HTMLElement | null) => {
    setActiveSubMenu(itemId);
    setActiveSubMenuRef(el);
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setActiveSubMenu(null);
        setActiveSubMenuRef(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // RTL: mirror the horizontal anchor
  const rtlMirror: Record<string, string> = {
    "top-left": "top-right", "top-right": "top-left",
    "bottom-left": "bottom-right", "bottom-right": "bottom-left",
    "top-start": "top-end", "top-end": "top-start",
    "bottom-start": "bottom-end", "bottom-end": "bottom-start",
  };
  const effectivePosition =
    direction === "rtl" ? (rtlMirror[position] ?? position) : position;

  // Wrap non-element trigger in a Typography inline span — atoms only.
  const triggerChild = React.isValidElement(trigger) ? (
    trigger
  ) : (
    <Typography variant="small" as="span">{trigger}</Typography>
  );

  const triggerElement = React.cloneElement(
    triggerChild as React.ReactElement<MenuTriggerProps>,
    {
      ref: triggerRef,
      onClick: handleToggle,
    },
  );

  const renderMenuItems = (menuItems: MenuItem[]) =>
    menuItems.map((item, index) => {
      const isDivider = item.id === "divider" || item.label === "divider";
      const itemId =
        item.id ??
        `item-${item.label.toLowerCase().replace(/\s+/g, "-")}-${index}`;
      const hasSubMenu = !!(item.subMenu && item.subMenu.length > 0);
      const isDanger = item.variant === "danger";

      if (isDivider) {
        return <Divider key={`divider-${index}`} className="my-1" />;
      }

      return (
        <MenuItemRow
          key={itemId}
          item={item}
          itemId={itemId}
          hasSubMenu={hasSubMenu}
          isDanger={isDanger}
          direction={direction}
          isSubMenuOpen={activeSubMenu === itemId}
          activeSubMenuRef={activeSubMenuRef}
          eventBus={eventBus}
          onItemClick={handleItemClick}
          openSubMenu={openSubMenu}
        />
      );
    });

  // Portal the dropdown to document.body with fixed coords so no ancestor
  // transform (ReactFlow viewport, catalog sidebar, PreviewFrame chrome) can
  // create a new containing block and trap the panel behind sibling layers.
  const panel = isOpen && triggerRect ? (
    <div
      ref={menuRef}
      className={cn("fixed z-50", menuContainerStyles, className)}
      style={computeMenuStyle(effectivePosition, triggerRect)}
      role="menu"
    >
      {header && <div className="px-4 py-2 border-b border-border">{header}</div>}
      {renderMenuItems(items)}
      {footer && <div className="px-4 py-2 border-t border-border">{footer}</div>}
    </div>
  ) : null;

  return (
    <>
      {triggerElement}
      {panel && typeof document !== "undefined"
        ? createPortal(panel, document.body)
        : panel}
    </>
  );
};

Menu.displayName = "Menu";
