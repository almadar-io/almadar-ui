import { useAuthContext } from '../chunk-BKC4XU44.js';
export { ENTITY_EVENTS, useAgentChat, useAuthContext, useCompile, useConnectGitHub, useCreateEntity, useDeepAgentGeneration, useDeleteEntity, useDisconnectGitHub, useEntities, useEntitiesByType, useEntity as useEntityById, useEntityMutations, useExtensions, useFileEditor, useFileSystem, useGitHubBranches, useGitHubRepo, useGitHubRepos, useGitHubStatus, useInput, useOrbitalHistory, useOrbitalMutations, usePhysics, usePlayer, usePreview, useResolvedEntity, useSelectedEntity, useSendOrbitalEvent, useSingletonEntity, useUIEvents, useUpdateEntity, useValidation } from '../chunk-BKC4XU44.js';
import { DEFAULT_CONFIG, renderStateMachineToDomData, parseContentSegments } from '../chunk-N6DJVKZ6.js';
import '../chunk-XSEDIUM6.js';
import { VStack, HStack, Typography, Button, Icon, Box, Card, Avatar, Badge, SearchInput, Checkbox, Menu as Menu$1, Pagination, LoadingState, EmptyState, Modal, ErrorState, QuizBlock, CodeBlock, ScaledDiagram, MarkdownContent, Divider, ProgressBar, Stack, Select, Drawer, Toast, Tabs, Input, ThemeToggle, HealthBar, ScoreDisplay, StateIndicator, Container, EntityDisplayEvents } from '../chunk-LB3HXNAR.js';
export { Accordion, Card2 as ActionCard, Alert, Avatar, Badge, Box, Breadcrumb, Button, ButtonGroup, Card, CardBody, CardContent, CardFooter, CardGrid, CardHeader, CardTitle, Center, Checkbox, CodeBlock, ConditionalWrapper, Container, ControlButton, DataTable, DetailPanel, Divider, Drawer, EmptyState, EntityDisplayEvents, ErrorBoundary, ErrorState, FilterGroup, Flex, FloatingActionButton, Form, FormField, FormSectionHeader, Grid, HStack, Heading, HealthBar, Icon, Input, InputGroup, Label, LawReferenceTooltip, LoadingState, MarkdownContent, MasterDetail, Menu, Modal, Overlay, PageHeader, Pagination, Popover, ProgressBar, QuizBlock, Radio, RelationSelect, RepeatableFormSection, ScaledDiagram, ScoreDisplay, SearchInput, Select, SidePanel, SimpleGrid, Skeleton, SlotContentRenderer, Spacer, Spinner, Sprite, Stack, StatCard, StateIndicator, Switch, Tabs, Text, TextHighlight, Textarea, ThemeSelector, ThemeToggle, Toast, Tooltip, Typography, UISlotComponent, UISlotRenderer, VStack, ViolationAlert, WizardNavigation, WizardProgress, drawSprite } from '../chunk-LB3HXNAR.js';
import '../chunk-BTXQJGFB.js';
import { useTranslate } from '../chunk-PE2H3NAW.js';
export { EntityDataProvider, I18nProvider, createTranslate, entityDataKeys, parseQueryBinding, useEntity, useEntityDataAdapter, useEntityDetail, useEntityList, useEntityListSuspense, useEntitySuspense, useQuerySingleton, useTranslate } from '../chunk-PE2H3NAW.js';
import { useEventBus, useEventListener } from '../chunk-YXZM3WCF.js';
export { useEmitEvent, useEventBus, useEventListener } from '../chunk-YXZM3WCF.js';
export { DEFAULT_SLOTS, useUISlotManager } from '../chunk-7NEWMNNU.js';
import { cn, getNestedValue } from '../chunk-KKCVDUK7.js';
export { cn } from '../chunk-KKCVDUK7.js';
export { clearEntities, getAllEntities, getByType, getEntity, getSingleton, removeEntity, spawnEntity, updateEntity, updateSingleton } from '../chunk-N7MVUW4R.js';
import { __publicField } from '../chunk-PKBMQBKP.js';
import * as React42 from 'react';
import React42__default, { createContext, useState, useMemo, useCallback, useEffect, useRef, useContext } from 'react';
import { ChevronDown, X, Menu, ChevronRight, ChevronLeft, ArrowUp, ArrowDown, MoreVertical, Package, Check, AlertTriangle, Trash2, List as List$1, Printer, CheckCircle, XCircle, Play, RotateCcw, Send, Wrench, Bug, ArrowRight, Pause, SkipForward, Zap, Sword, Move, Heart, Shield, AlertCircle, Circle, Clock, CheckCircle2, Image as Image$1, Upload, ZoomIn, Eraser, FileText, ZoomOut, Download, Code, WrapText, Copy, Settings, Search, Bell, LogOut, Calendar, Pencil, Eye, MoreHorizontal, Minus, Plus } from 'lucide-react';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { createPortal } from 'react-dom';
import { useLocation, Link, Outlet } from 'react-router-dom';

var FormSection = ({
  title,
  description,
  children,
  collapsible = false,
  defaultCollapsed = false,
  card = false,
  columns = 1,
  className
}) => {
  const [collapsed, setCollapsed] = React42__default.useState(defaultCollapsed);
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  }[columns];
  const content = /* @__PURE__ */ jsxs(Fragment, { children: [
    (title || description) && /* @__PURE__ */ jsxs(VStack, { gap: "xs", className: "mb-4", children: [
      title && /* @__PURE__ */ jsxs(
        HStack,
        {
          justify: "between",
          align: "center",
          className: cn(collapsible && "cursor-pointer"),
          onClick: () => collapsible && setCollapsed(!collapsed),
          children: [
            /* @__PURE__ */ jsx(Typography, { variant: "h3", weight: "semibold", children: title }),
            collapsible && /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                onClick: () => setCollapsed(!collapsed),
                children: /* @__PURE__ */ jsx(
                  Icon,
                  {
                    icon: ChevronDown,
                    size: "sm",
                    className: cn(
                      "text-[var(--color-muted-foreground)] transition-transform",
                      collapsed && "rotate-180"
                    )
                  }
                )
              }
            )
          ]
        }
      ),
      description && /* @__PURE__ */ jsx(Typography, { variant: "small", color: "secondary", children: description })
    ] }),
    (!collapsible || !collapsed) && /* @__PURE__ */ jsx(Box, { className: cn("grid gap-4", gridClass), children })
  ] });
  if (card) {
    return /* @__PURE__ */ jsx(Card, { className: cn("p-6", className), children: content });
  }
  return /* @__PURE__ */ jsx(Box, { className, children: content });
};
FormSection.displayName = "FormSection";
var FormLayout = ({
  children,
  dividers = true,
  className
}) => {
  return /* @__PURE__ */ jsx(
    VStack,
    {
      gap: "lg",
      className: cn(
        dividers && "[&>*+*]:pt-8 [&>*+*]:border-t [&>*+*]:border-[var(--color-border)]",
        className
      ),
      children
    }
  );
};
FormLayout.displayName = "FormLayout";
var FormActions = ({
  children,
  sticky = false,
  align = "right",
  className
}) => {
  const alignClass = {
    left: "justify-start",
    right: "justify-end",
    between: "justify-between",
    center: "justify-center"
  }[align];
  return /* @__PURE__ */ jsx(
    HStack,
    {
      gap: "sm",
      align: "center",
      className: cn(
        "pt-6 border-t border-[var(--color-border)]",
        alignClass,
        sticky && "sticky bottom-0 bg-[var(--color-card)] py-4 -mx-6 px-6 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]",
        className
      ),
      children
    }
  );
};
FormActions.displayName = "FormActions";
var Header = ({
  logo,
  logoSrc,
  brandName = "KFlow",
  navigationItems,
  showMenuToggle = true,
  isMenuOpen = false,
  onMenuToggle,
  showSearch = false,
  searchPlaceholder,
  onSearch,
  userAvatar,
  userName,
  onUserClick,
  actions,
  sticky = true,
  variant = "mobile",
  onLogoClick,
  className
}) => {
  const { t } = useTranslate();
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("common.search");
  const userInitials = userAvatar?.initials || userName?.[0]?.toUpperCase() || "U";
  return /* @__PURE__ */ jsxs(
    Box,
    {
      as: "header",
      className: cn(
        "h-16 border-b border-[var(--color-border)]",
        "flex items-center px-4 justify-between bg-[var(--color-card)]",
        sticky && "sticky top-0 z-50",
        variant === "mobile" && "lg:hidden",
        className
      ),
      children: [
        /* @__PURE__ */ jsxs(HStack, { gap: "none", align: "center", className: "gap-3", children: [
          showMenuToggle && /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              onClick: onMenuToggle,
              className: "p-2 -ml-2 text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors",
              "aria-label": isMenuOpen ? "Close menu" : "Open menu",
              children: isMenuOpen ? /* @__PURE__ */ jsx(X, { size: 24 }) : /* @__PURE__ */ jsx(Menu, { size: 24 })
            }
          ),
          /* @__PURE__ */ jsxs(
            HStack,
            {
              gap: "none",
              align: "center",
              className: cn(
                "gap-2",
                onLogoClick && "cursor-pointer"
              ),
              onClick: onLogoClick,
              children: [
                logo ? typeof logo === "string" ? /* @__PURE__ */ jsx(Avatar, { src: logo, alt: brandName, size: "sm" }) : logo : logoSrc ? /* @__PURE__ */ jsx(Avatar, { src: logoSrc, alt: brandName, size: "sm" }) : null,
                brandName && /* @__PURE__ */ jsx(
                  Typography,
                  {
                    variant: "h5",
                    className: "text-lg font-bold text-[var(--color-foreground)]",
                    children: brandName
                  }
                )
              ]
            }
          )
        ] }),
        variant === "desktop" && navigationItems && navigationItems.length > 0 && /* @__PURE__ */ jsx(
          Box,
          {
            role: "navigation",
            className: "hidden md:flex items-center gap-1 flex-1 justify-center",
            children: navigationItems.map((item, index) => /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "ghost",
                onClick: item.onClick,
                className: cn(
                  "flex items-center gap-2 px-3 py-2 rounded-[var(--radius-lg)] transition-colors",
                  item.active ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                ),
                children: [
                  item.icon && /* @__PURE__ */ jsx(item.icon, { size: 18 }),
                  /* @__PURE__ */ jsx(Typography, { variant: "label", className: "font-medium", children: item.label }),
                  item.badge !== void 0 && /* @__PURE__ */ jsx(Badge, { variant: "danger", size: "sm", children: item.badge })
                ]
              },
              index
            ))
          }
        ),
        showSearch && /* @__PURE__ */ jsx(Box, { className: "hidden lg:block flex-1 max-w-md mx-4", children: /* @__PURE__ */ jsx(SearchInput, { placeholder: resolvedSearchPlaceholder, onSearch }) }),
        /* @__PURE__ */ jsxs(HStack, { gap: "none", align: "center", className: "gap-3", children: [
          actions,
          (userAvatar || userName) && /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              onClick: onUserClick,
              className: cn(
                "w-8 h-8 rounded-[var(--radius-full)] bg-[var(--color-primary)]/10 flex items-center justify-center",
                "text-[var(--color-primary)] font-bold text-xs",
                "hover:ring-2 hover:ring-[var(--color-ring)] transition-all",
                onUserClick && "cursor-pointer"
              ),
              children: userAvatar?.src ? /* @__PURE__ */ jsx(
                Avatar,
                {
                  src: userAvatar.src,
                  alt: userAvatar.alt || userName,
                  size: "sm"
                }
              ) : userInitials
            }
          )
        ] })
      ]
    }
  );
};
Header.displayName = "Header";
var Navigation = ({
  items,
  orientation = "horizontal",
  className
}) => {
  const renderNavigationItem = (item, hasSubMenu) => {
    if (hasSubMenu) {
      const menuItems = item.subMenu.map((subItem) => ({
        id: subItem.id,
        label: subItem.label,
        icon: subItem.icon,
        badge: subItem.badge,
        disabled: subItem.disabled,
        onClick: subItem.onClick
      }));
      return /* @__PURE__ */ jsx(
        Menu$1,
        {
          trigger: /* @__PURE__ */ jsxs(
            Button,
            {
              variant: item.isActive ? "primary" : "ghost",
              size: "sm",
              icon: item.icon,
              disabled: item.disabled,
              children: [
                item.label,
                item.badge !== void 0 && /* @__PURE__ */ jsx(Badge, { variant: "danger", size: "sm", children: item.badge })
              ]
            }
          ),
          items: menuItems,
          position: orientation === "horizontal" ? "bottom-left" : "bottom-right"
        },
        item.id
      );
    }
    return /* @__PURE__ */ jsxs(
      Button,
      {
        variant: item.isActive ? "primary" : "ghost",
        size: "sm",
        icon: item.icon,
        onClick: item.onClick,
        disabled: item.disabled,
        className: "relative",
        children: [
          item.label,
          item.badge !== void 0 && /* @__PURE__ */ jsx(Badge, { variant: "danger", size: "sm", className: "absolute -top-1 -right-1", children: item.badge })
        ]
      },
      item.id
    );
  };
  return /* @__PURE__ */ jsx(
    Box,
    {
      as: "nav",
      className: cn(
        "flex",
        orientation === "horizontal" ? "flex-row items-center gap-1" : "flex-col gap-1",
        className
      ),
      role: "navigation",
      children: items.map((item) => {
        const hasSubMenu = !!(item.subMenu && item.subMenu.length > 0);
        return renderNavigationItem(item, hasSubMenu);
      })
    }
  );
};
Navigation.displayName = "Navigation";
var paddingStyles = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
  xl: "p-8"
};
var variantStyles = {
  default: "",
  card: [
    "bg-[var(--color-card)]",
    "border-[length:var(--border-width)] border-[var(--color-border)]",
    "shadow-[var(--shadow-main)]",
    "rounded-[var(--radius-md)]"
  ].join(" "),
  bordered: [
    "border-[length:var(--border-width)] border-[var(--color-border)]",
    "rounded-[var(--radius-md)]"
  ].join(" "),
  filled: "bg-[var(--color-muted)] rounded-[var(--radius-md)]"
};
var Section = ({
  title,
  description,
  action,
  padding = "md",
  variant = "default",
  divider = false,
  className,
  children,
  headerClassName,
  contentClassName,
  as: Component = "section"
}) => {
  const hasHeader = title || description || action;
  return /* @__PURE__ */ jsxs(
    Component,
    {
      className: cn(
        paddingStyles[padding],
        variantStyles[variant],
        className
      ),
      children: [
        hasHeader && /* @__PURE__ */ jsxs(
          Box,
          {
            className: cn(
              "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4",
              divider && "pb-4 mb-4 border-b-[length:var(--border-width)] border-[var(--color-border)]",
              !divider && "mb-4",
              headerClassName
            ),
            children: [
              /* @__PURE__ */ jsxs(Box, { className: "flex-1 min-w-0", children: [
                title && /* @__PURE__ */ jsx(
                  Typography,
                  {
                    variant: "h4",
                    className: "text-[var(--color-foreground)] font-semibold",
                    children: title
                  }
                ),
                description && /* @__PURE__ */ jsx(
                  Typography,
                  {
                    variant: "body",
                    color: "muted",
                    className: "mt-1",
                    children: description
                  }
                )
              ] }),
              action && /* @__PURE__ */ jsx(Box, { className: "flex-shrink-0 flex items-center gap-2", children: action })
            ]
          }
        ),
        /* @__PURE__ */ jsx(Box, { className: contentClassName, children })
      ]
    }
  );
};
Section.displayName = "Section";
var SidebarNavItem = ({ item, collapsed }) => {
  const Icon3 = item.icon;
  const isActive = item.active ?? item.isActive;
  return /* @__PURE__ */ jsxs(
    Button,
    {
      variant: "ghost",
      onClick: item.onClick,
      className: cn(
        "w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-[var(--transition-fast)] group relative",
        "rounded-[var(--radius-sm)] border-[length:var(--border-width-thin)] border-transparent",
        isActive ? [
          "bg-[var(--color-foreground)] text-[var(--color-background)]",
          "font-medium shadow-[var(--shadow-sm)]",
          "border-[var(--color-border)] translate-x-1 -translate-y-0.5"
        ].join(" ") : [
          "text-[var(--color-foreground)]",
          "hover:bg-[var(--color-muted)] hover:border-[var(--color-border)]",
          "active:bg-[var(--color-foreground)] active:text-[var(--color-background)]"
        ].join(" ")
      ),
      title: collapsed ? item.label : void 0,
      children: [
        Icon3 && /* @__PURE__ */ jsx(
          Icon3,
          {
            size: 20,
            className: cn(
              "min-w-[20px] flex-shrink-0",
              isActive && "text-[var(--color-background)]"
            )
          }
        ),
        !collapsed && /* @__PURE__ */ jsx(Typography, { variant: "body", className: "font-medium truncate flex-1 text-left", children: item.label }),
        !collapsed && item.badge !== void 0 && /* @__PURE__ */ jsx(Badge, { variant: "danger", size: "sm", children: item.badge }),
        collapsed && /* @__PURE__ */ jsx(Box, { className: cn(
          "absolute left-full ml-2 px-2 py-1 text-xs opacity-0 group-hover:opacity-100",
          "pointer-events-none whitespace-nowrap z-50 transition-opacity",
          "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
          "border-[length:var(--border-width-thin)] border-[var(--color-border)]",
          "rounded-[var(--radius-sm)]"
        ), children: item.label })
      ]
    }
  );
};
var Sidebar = ({
  logo,
  logoSrc,
  brandName = "KFlow",
  items,
  userSection,
  footerContent,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapseChange,
  hideCollapseButton = false,
  showCloseButton = false,
  onClose,
  onLogoClick,
  className
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const collapsed = controlledCollapsed !== void 0 ? controlledCollapsed : internalCollapsed;
  const handleToggle = () => {
    const newCollapsed = !collapsed;
    if (controlledCollapsed === void 0) {
      setInternalCollapsed(newCollapsed);
    }
    onCollapseChange?.(newCollapsed);
  };
  return /* @__PURE__ */ jsxs(
    Box,
    {
      as: "aside",
      className: cn(
        "flex flex-col h-full",
        "bg-[var(--color-card)] border-r border-[var(--color-border)]",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64",
        className
      ),
      children: [
        /* @__PURE__ */ jsxs(Box, { className: "h-16 flex items-center justify-between px-4 border-b border-[var(--color-border)] flex-shrink-0", children: [
          /* @__PURE__ */ jsxs(
            Box,
            {
              className: cn(
                "flex items-center gap-3 cursor-pointer",
                collapsed && "justify-center w-full"
              ),
              onClick: onLogoClick,
              children: [
                logo ? typeof logo === "string" ? (
                  // eslint-disable-next-line almadar/no-raw-dom-elements -- semantic img with src/alt
                  /* @__PURE__ */ jsx("img", { src: logo, alt: brandName, className: "h-8 w-8" })
                ) : logo : logoSrc ? (
                  // eslint-disable-next-line almadar/no-raw-dom-elements -- semantic img with src/alt
                  /* @__PURE__ */ jsx("img", { src: logoSrc, alt: brandName, className: "h-8 w-8" })
                ) : /* @__PURE__ */ jsx(Box, { className: "h-8 w-8 bg-[var(--color-primary)] flex items-center justify-center rounded-[var(--radius-sm)]", children: /* @__PURE__ */ jsx(Typography, { variant: "small", className: "text-[var(--color-primary-foreground)] font-bold text-sm", children: "K" }) }),
                !collapsed && /* @__PURE__ */ jsx(Typography, { variant: "body", className: "text-xl font-bold text-[var(--color-foreground)]", children: brandName })
              ]
            }
          ),
          !hideCollapseButton && /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              onClick: handleToggle,
              className: cn(
                "p-1.5 hover:bg-[var(--color-muted)] text-[var(--color-foreground)] hidden lg:block",
                "rounded-[var(--radius-sm)]",
                collapsed && "mx-auto"
              ),
              title: collapsed ? "Expand Sidebar" : "Collapse Sidebar",
              children: collapsed ? /* @__PURE__ */ jsx(ChevronRight, { size: 18 }) : /* @__PURE__ */ jsx(ChevronLeft, { size: 18 })
            }
          ),
          showCloseButton && /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              onClick: onClose,
              className: "p-1.5 hover:bg-[var(--color-muted)] text-[var(--color-foreground)] lg:hidden rounded-[var(--radius-sm)]",
              "aria-label": "Close sidebar",
              children: /* @__PURE__ */ jsx(X, { size: 18 })
            }
          )
        ] }),
        /* @__PURE__ */ jsx(Box, { as: "nav", className: "flex-1 py-6 px-3 space-y-1 overflow-y-auto", children: items.map((item) => /* @__PURE__ */ jsx(
          SidebarNavItem,
          {
            item,
            collapsed
          },
          item.id
        )) }),
        (footerContent || userSection) && /* @__PURE__ */ jsxs(Box, { className: "p-3 border-t border-[var(--color-border)] space-y-1 flex-shrink-0", children: [
          /* @__PURE__ */ jsxs(Box, { className: cn(
            "flex items-center",
            collapsed ? "justify-center flex-col gap-4" : "justify-between px-2"
          ), children: [
            footerContent && /* @__PURE__ */ jsx(Box, { className: "flex items-center", children: footerContent }),
            userSection && /* @__PURE__ */ jsx(Box, { className: "flex items-center", children: userSection })
          ] }),
          collapsed && !hideCollapseButton && /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              onClick: handleToggle,
              className: "w-full flex justify-center p-2 mt-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] lg:hidden",
              children: /* @__PURE__ */ jsx(ChevronRight, { size: 20 })
            }
          )
        ] })
      ]
    }
  );
};
Sidebar.displayName = "Sidebar";
var gapStyles = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8"
};
var alignStyles = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch"
};
var ratioStyles = {
  "1:1": ["w-1/2", "w-1/2"],
  "1:2": ["w-1/3", "w-2/3"],
  "2:1": ["w-2/3", "w-1/3"],
  "1:3": ["w-1/4", "w-3/4"],
  "3:1": ["w-3/4", "w-1/4"],
  "1:4": ["w-1/5", "w-4/5"],
  "4:1": ["w-4/5", "w-1/5"],
  "2:3": ["w-2/5", "w-3/5"],
  "3:2": ["w-3/5", "w-2/5"]
};
var breakpointPrefixes = {
  sm: "sm:",
  md: "md:",
  lg: "lg:",
  xl: "xl:"
};
var Split = ({
  ratio = "1:1",
  gap = "md",
  reverse = false,
  stackOnMobile = true,
  stackBreakpoint = "md",
  align = "stretch",
  className,
  leftClassName,
  rightClassName,
  children
}) => {
  const [left, right] = children;
  const [leftRatio, rightRatio] = ratioStyles[ratio];
  const bp = breakpointPrefixes[stackBreakpoint];
  const leftWidth = stackOnMobile ? `w-full ${bp}${leftRatio}` : leftRatio;
  const rightWidth = stackOnMobile ? `w-full ${bp}${rightRatio}` : rightRatio;
  return /* @__PURE__ */ jsxs(
    Box,
    {
      className: cn(
        "flex",
        stackOnMobile ? `flex-col ${bp}flex-row` : "flex-row",
        reverse && `${bp}flex-row-reverse`,
        gapStyles[gap],
        alignStyles[align],
        className
      ),
      children: [
        /* @__PURE__ */ jsx(Box, { className: cn(leftWidth, leftClassName), children: left }),
        /* @__PURE__ */ jsx(Box, { className: cn(rightWidth, rightClassName), children: right })
      ]
    }
  );
};
Split.displayName = "Split";
var Table = ({
  columns,
  // EntityDisplayProps
  entity,
  data,
  className,
  isLoading,
  error,
  sortBy,
  sortDirection: entitySortDirection,
  searchValue,
  page,
  pageSize,
  totalCount,
  selectedIds,
  // Table-specific props
  selectable = false,
  sortable = false,
  sortColumn: sortColumnProp,
  sortDirection: sortDirectionProp,
  searchable = false,
  searchPlaceholder,
  paginated = false,
  currentPage: currentPageProp,
  totalPages: totalPagesProp,
  rowActions,
  emptyMessage,
  loading = false
}) => {
  const { t } = useTranslate();
  const eventBus = useEventBus();
  const resolvedEmptyMessage = emptyMessage ?? t("empty.noData");
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("common.search");
  const resolvedData = Array.isArray(data) ? data : Array.isArray(entity) ? entity : [];
  const resolvedSortColumn = sortColumnProp ?? sortBy;
  const resolvedSortDirection = sortDirectionProp ?? entitySortDirection ?? void 0;
  const resolvedCurrentPage = currentPageProp ?? page ?? 1;
  const resolvedTotalPages = totalPagesProp ?? (totalCount && pageSize ? Math.ceil(totalCount / pageSize) : 1);
  const selectedRows = selectedIds ? selectedIds.map(String) : [];
  const handleSort = (column) => {
    if (!sortable) return;
    const newDirection = resolvedSortColumn === column && resolvedSortDirection === "asc" ? "desc" : resolvedSortColumn === column && resolvedSortDirection === "desc" ? void 0 : "asc";
    if (newDirection) {
      eventBus.emit("UI:SORT", { field: column, direction: newDirection });
    } else {
      eventBus.emit("UI:SORT", { field: column, direction: "asc" });
    }
  };
  const handleSelectAll = (checked) => {
    if (!selectable) return;
    if (checked) {
      const allIds = resolvedData.map((row) => row.id ?? "");
      eventBus.emit("UI:SELECT", { ids: allIds });
    } else {
      eventBus.emit("UI:DESELECT", { ids: selectedRows });
    }
  };
  const handleSelectRow = (rowKey, checked) => {
    if (!selectable) return;
    if (checked) {
      eventBus.emit("UI:SELECT", { ids: [rowKey] });
    } else {
      eventBus.emit("UI:DESELECT", { ids: [rowKey] });
    }
  };
  const handlePageChange = (newPage) => {
    eventBus.emit("UI:PAGINATE", { page: newPage });
  };
  const handleSearch = (query) => {
    eventBus.emit("UI:SEARCH", { query });
  };
  const allSelected = selectable && resolvedData.length > 0 && resolvedData.every(
    (row) => selectedRows.includes(String(row.id))
  );
  return /* @__PURE__ */ jsxs(Box, { className: cn("w-full", className), children: [
    searchable && /* @__PURE__ */ jsx(Box, { className: "mb-4", children: /* @__PURE__ */ jsx(
      SearchInput,
      {
        placeholder: resolvedSearchPlaceholder,
        onSearch: handleSearch,
        className: "max-w-md"
      }
    ) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(Box, { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b-[length:var(--border-width)] border-[var(--color-table-border)]", children: [
        selectable && // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left bg-[var(--color-table-header)]", children: /* @__PURE__ */ jsx(
          Checkbox,
          {
            checked: allSelected,
            onChange: (e) => handleSelectAll(e.target.checked)
          }
        ) }),
        columns.map((column) => (
          // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed
          /* @__PURE__ */ jsx(
            "th",
            {
              className: cn(
                "px-4 py-3 text-left text-xs font-bold text-[var(--color-foreground)] uppercase tracking-wider bg-[var(--color-table-header)]",
                sortable && column.sortable && "cursor-pointer hover:bg-[var(--color-table-row-hover)]"
              ),
              style: { width: column.width },
              onClick: () => column.sortable && handleSort(column.key),
              children: /* @__PURE__ */ jsxs(HStack, { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Typography, { variant: "small", weight: "semibold", children: column.label }),
                sortable && column.sortable && resolvedSortColumn === column.key && /* @__PURE__ */ jsx(
                  Icon,
                  {
                    icon: resolvedSortDirection === "asc" ? ArrowUp : ArrowDown,
                    size: "sm"
                  }
                )
              ] })
            },
            column.key
          )
        )),
        rowActions && // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: loading || isLoading ? (
        // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed
        /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(
          "td",
          {
            colSpan: columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0),
            className: "px-4 py-8 text-center",
            children: /* @__PURE__ */ jsx(Typography, { variant: "body", color: "secondary", children: t("common.loading") })
          }
        ) })
      ) : resolvedData.length === 0 ? (
        // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed
        /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(
          "td",
          {
            colSpan: columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0),
            className: "px-4 py-8 text-center",
            children: /* @__PURE__ */ jsx(Typography, { variant: "body", color: "secondary", children: resolvedEmptyMessage })
          }
        ) })
      ) : resolvedData.map((row, index) => {
        const rowKey = String(row.id ?? index);
        const isSelected = selectedRows.includes(rowKey);
        return (
          // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed
          /* @__PURE__ */ jsxs(
            "tr",
            {
              className: cn(
                "border-b border-[var(--color-table-border)] last:border-b-0",
                "hover:bg-[var(--color-table-row-hover)]",
                isSelected && "bg-[var(--color-table-header)] font-medium"
              ),
              children: [
                selectable && // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    checked: isSelected,
                    onChange: (e) => handleSelectRow(rowKey, e.target.checked)
                  }
                ) }),
                columns.map((column) => (
                  // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: column.render ? column.render(row[column.key], row, index) : /* @__PURE__ */ jsx(Typography, { variant: "body", children: row[column.key]?.toString() || "-" }) }, column.key)
                )),
                rowActions && // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements needed
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsx(
                  Menu$1,
                  {
                    trigger: /* @__PURE__ */ jsx(
                      Button,
                      {
                        variant: "ghost",
                        size: "sm",
                        icon: MoreVertical,
                        children: "Actions"
                      }
                    ),
                    items: rowActions(row),
                    position: "bottom-right"
                  }
                ) })
              ]
            },
            rowKey
          )
        );
      }) })
    ] }) }) }),
    paginated && resolvedTotalPages > 1 && /* @__PURE__ */ jsx(Box, { className: "mt-4", children: /* @__PURE__ */ jsx(
      Pagination,
      {
        currentPage: resolvedCurrentPage,
        totalPages: resolvedTotalPages,
        onPageChange: handlePageChange
      }
    ) })
  ] });
};
Table.displayName = "Table";
function normalizeFields(fields) {
  if (!fields) return [];
  return fields.map((f) => typeof f === "string" ? f : f.key);
}
var STATUS_STYLES = {
  complete: {
    bg: "bg-[var(--color-success)]/10",
    text: "text-[var(--color-success)]",
    dot: "bg-[var(--color-success)] ring-4 ring-[var(--color-success)]/20",
    border: "border-[var(--color-success)]/30"
  },
  active: {
    bg: "bg-[var(--color-info)]/10",
    text: "text-[var(--color-info)]",
    dot: "bg-[var(--color-info)] ring-4 ring-[var(--color-info)]/20",
    border: "border-[var(--color-info)]/30"
  },
  pending: {
    bg: "bg-[var(--color-warning)]/10",
    text: "text-[var(--color-warning)]",
    dot: "bg-[var(--color-warning)] ring-4 ring-[var(--color-warning)]/20",
    border: "border-[var(--color-warning)]/30"
  },
  blocked: {
    bg: "bg-[var(--color-error)]/10",
    text: "text-[var(--color-error)]",
    dot: "bg-[var(--color-error)] ring-4 ring-[var(--color-error)]/20",
    border: "border-[var(--color-error)]/30"
  },
  high: {
    bg: "bg-[var(--color-warning)]/10",
    text: "text-[var(--color-warning)]",
    dot: "bg-[var(--color-warning)] ring-4 ring-[var(--color-warning)]/20",
    border: "border-[var(--color-warning)]/30"
  },
  medium: {
    bg: "bg-[var(--color-accent)]/10",
    text: "text-[var(--color-accent)]",
    dot: "bg-[var(--color-accent)] ring-4 ring-[var(--color-accent)]/20",
    border: "border-[var(--color-accent)]/30"
  },
  low: {
    bg: "bg-[var(--color-muted)]",
    text: "text-[var(--color-muted-foreground)]",
    dot: "bg-[var(--color-muted-foreground)] ring-4 ring-[var(--color-muted-foreground)]/20",
    border: "border-[var(--color-border)]"
  },
  default: {
    bg: "bg-[var(--color-muted)]",
    text: "text-[var(--color-muted-foreground)]",
    dot: "bg-[var(--color-muted-foreground)] ring-4 ring-[var(--color-muted-foreground)]/20",
    border: "border-[var(--color-border)]"
  }
};
function getStatusStyle(fieldName, value) {
  const val = String(value).toLowerCase();
  if (val.includes("complete") || val.includes("done"))
    return STATUS_STYLES.complete;
  if (val.includes("active") || val.includes("progress"))
    return STATUS_STYLES.active;
  if (val.includes("pending") || val.includes("waiting"))
    return STATUS_STYLES.pending;
  if (val.includes("block") || val.includes("cancel"))
    return STATUS_STYLES.blocked;
  if (val.includes("high") || val.includes("urgent")) return STATUS_STYLES.high;
  if (val.includes("medium") || val.includes("normal"))
    return STATUS_STYLES.medium;
  if (val.includes("low")) return STATUS_STYLES.low;
  return STATUS_STYLES.default;
}
function formatValue(value, fieldName) {
  if (typeof value === "number") {
    if (fieldName.toLowerCase().includes("progress") || fieldName.toLowerCase().includes("percent")) {
      return `${value}%`;
    }
    if (fieldName.toLowerCase().includes("budget") || fieldName.toLowerCase().includes("cost")) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
      }).format(value);
    }
    return value.toLocaleString();
  }
  if (value instanceof Date) {
    return value.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  }
  return String(value);
}
function formatFieldLabel(fieldName) {
  return fieldName.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).replace(/Id$/, "").trim();
}
var StatusBadge = ({
  value,
  fieldName
}) => {
  const style = getStatusStyle(fieldName, value);
  return /* @__PURE__ */ jsxs(
    Typography,
    {
      as: "span",
      className: cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-[var(--radius-full)] text-xs font-semibold tracking-wide",
        "border shadow-[var(--shadow-sm)] backdrop-blur-sm transition-colors",
        style.bg,
        style.text,
        style.border
      ),
      children: [
        /* @__PURE__ */ jsx(
          Typography,
          {
            as: "span",
            className: cn(
              "w-1.5 h-1.5 rounded-[var(--radius-full)] shadow-[var(--shadow-sm)]",
              style.dot
            )
          }
        ),
        value
      ]
    }
  );
};
var ProgressIndicator = ({ value }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  return /* @__PURE__ */ jsxs(Box, { className: "flex items-center gap-2 min-w-[100px]", children: [
    /* @__PURE__ */ jsx(Box, { className: "flex-1 h-1.5 bg-[var(--color-muted)] rounded-[var(--radius-full)] overflow-hidden", children: /* @__PURE__ */ jsx(
      Box,
      {
        className: cn(
          "h-full rounded-[var(--radius-full)] transition-all duration-500",
          clampedValue >= 100 ? "bg-[var(--color-success)]" : clampedValue >= 70 ? "bg-[var(--color-info)]" : clampedValue >= 40 ? "bg-[var(--color-warning)]" : "bg-[var(--color-muted-foreground)]"
        ),
        style: { width: `${clampedValue}%` }
      }
    ) }),
    /* @__PURE__ */ jsxs(
      Typography,
      {
        as: "span",
        className: "text-xs font-medium text-[var(--color-muted-foreground)] tabular-nums w-8 text-right",
        children: [
          clampedValue,
          "%"
        ]
      }
    )
  ] });
};
var List = ({
  entity,
  data,
  isLoading = false,
  error,
  selectable = false,
  selectedIds = [],
  itemActions,
  emptyMessage,
  className,
  renderItem: customRenderItem,
  fields,
  fieldNames,
  entityType
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const resolvedEmptyMessage = emptyMessage ?? t("empty.noData");
  const entityName = typeof entity === "string" ? entity : void 0;
  const effectiveFieldNames = normalizeFields(fields).length > 0 ? normalizeFields(fields) : fieldNames;
  const rawItems = useMemo(() => {
    const d = data ?? [];
    if (Array.isArray(d)) return d;
    if (d && typeof d === "object" && "id" in d) return [d];
    return [];
  }, [data]);
  const getItemActions = React42__default.useCallback(
    (item) => {
      if (!itemActions) return [];
      if (typeof itemActions === "function") {
        return itemActions(item);
      }
      return itemActions.map((action, idx) => ({
        id: `${item.id}-action-${idx}`,
        label: action.label,
        onClick: () => {
          if (action.navigatesTo) {
            const url = action.navigatesTo.replace(
              /\{\{(\w+)\}\}/g,
              (_, key) => String(item[key] || item.id || "")
            );
            eventBus.emit("UI:NAVIGATE", { url, row: item, entity: entityName });
            return;
          }
          if (action.event) {
            eventBus.emit(`UI:${action.event}`, {
              row: item,
              entity: entityName
            });
          }
        }
      }));
    },
    [itemActions, eventBus, entityName]
  );
  const normalizedItemActions = itemActions ? getItemActions : void 0;
  if (isLoading) {
    return /* @__PURE__ */ jsx(
      LoadingState,
      {
        message: `Loading ${entityType || "items"}...`,
        className
      }
    );
  }
  if (error) {
    return /* @__PURE__ */ jsx(
      EmptyState,
      {
        icon: Package,
        title: `Error loading ${entityType || "items"}`,
        description: error.message,
        className
      }
    );
  }
  const safeItems = Array.isArray(rawItems) ? rawItems.map((item, index) => {
    if (typeof item === "object" && item !== null) {
      const normalizedItem = {
        ...item,
        id: item.id || `item-${index}`
      };
      if (effectiveFieldNames && effectiveFieldNames.length > 0) {
        const firstField = effectiveFieldNames[0];
        const itemRecord = item;
        if (!normalizedItem.title && getNestedValue(itemRecord, firstField)) {
          normalizedItem.title = String(
            getNestedValue(itemRecord, firstField)
          );
        }
        normalizedItem._fields = effectiveFieldNames.reduce(
          (acc, field) => {
            const value = getNestedValue(itemRecord, field);
            if (value !== void 0 && value !== null) {
              acc[field] = value;
            }
            return acc;
          },
          {}
        );
      }
      return normalizedItem;
    }
    return { id: `item-${index}`, title: String(item) };
  }) : [];
  const handleSelect = (itemId, checked) => {
    if (!selectable) return;
    const currentIds = [...selectedIds].map(String);
    if (checked) {
      const newIds = [...currentIds, itemId];
      eventBus.emit(`UI:${EntityDisplayEvents.SELECT}`, { ids: newIds });
    } else {
      const newIds = currentIds.filter((id) => id !== itemId);
      eventBus.emit(`UI:${EntityDisplayEvents.DESELECT}`, { ids: newIds });
    }
  };
  const handleRowClick = (item) => {
    eventBus.emit("UI:VIEW", { row: item, entity: entityName });
  };
  const defaultRenderItem = (item, index, isLast) => {
    const isSelected = selectedIds.map(String).includes(item.id);
    const actions = normalizedItemActions ? normalizedItemActions(item) : [];
    actions.length > 0;
    const viewAction = actions.find(
      (a) => a.label.toLowerCase().includes("view") || a.label.toLowerCase() === "open"
    );
    const editAction = actions.find(
      (a) => a.label.toLowerCase().includes("edit")
    );
    const hasExplicitClick = !!(item.onClick || viewAction?.onClick);
    const handleClick = item.onClick || viewAction?.onClick || (() => handleRowClick(item));
    const primaryField = effectiveFieldNames?.[0];
    const statusField = effectiveFieldNames?.find(
      (f) => f.toLowerCase().includes("status")
    );
    const priorityField = effectiveFieldNames?.find(
      (f) => f.toLowerCase().includes("priority")
    );
    const progressField = effectiveFieldNames?.find(
      (f) => f.toLowerCase().includes("progress") || f.toLowerCase().includes("percent")
    );
    const dateFields = effectiveFieldNames?.filter(
      (f) => f.toLowerCase().includes("date") || f.toLowerCase().includes("due")
    ) || [];
    const metadataFields = effectiveFieldNames?.filter(
      (f) => f !== primaryField && f !== statusField && f !== priorityField && f !== progressField && !dateFields.includes(f)
    ).slice(0, 2) || [];
    const statusValue = statusField ? item._fields?.[statusField] : null;
    statusValue ? getStatusStyle(statusField, String(statusValue)) : null;
    const progressValue = progressField ? item._fields?.[progressField] : null;
    const hasProgress = typeof progressValue === "number";
    return /* @__PURE__ */ jsxs(Box, { children: [
      /* @__PURE__ */ jsxs(
        Box,
        {
          className: cn(
            "group flex items-center gap-5 px-6 py-5",
            "transition-all duration-300 ease-out",
            hasExplicitClick && "cursor-pointer",
            // Hover state
            "hover:bg-[var(--color-muted)]/80",
            // Selected state
            isSelected && "bg-[var(--color-primary)]/10 shadow-inner",
            item.disabled && "opacity-50 cursor-not-allowed grayscale"
          ),
          onClick: handleClick,
          children: [
            selectable && /* @__PURE__ */ jsx(Box, { className: "flex-shrink-0 pt-0.5", children: /* @__PURE__ */ jsx(
              Checkbox,
              {
                checked: isSelected,
                onChange: (e) => handleSelect(item.id, e.target.checked),
                onClick: (e) => e.stopPropagation(),
                className: cn(
                  "transition-transform active:scale-95",
                  isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-border)]"
                )
              }
            ) }),
            /* @__PURE__ */ jsxs(Box, { className: "flex-1 min-w-0 space-y-2.5", children: [
              /* @__PURE__ */ jsxs(HStack, { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx(
                  Typography,
                  {
                    as: "h3",
                    className: cn(
                      "text-[15px] font-semibold text-[var(--color-foreground)] truncate flex-1",
                      "tracking-tight leading-snug",
                      item.completed && "line-through text-[var(--color-muted-foreground)]"
                    ),
                    children: item.title || "Untitled"
                  }
                ),
                /* @__PURE__ */ jsxs(HStack, { className: "flex items-center gap-2 flex-shrink-0", children: [
                  !!statusValue && /* @__PURE__ */ jsx(
                    StatusBadge,
                    {
                      value: String(statusValue),
                      fieldName: statusField
                    }
                  ),
                  !!(priorityField && item._fields?.[priorityField]) && /* @__PURE__ */ jsx(
                    StatusBadge,
                    {
                      value: String(item._fields[priorityField]),
                      fieldName: priorityField
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs(HStack, { className: "flex items-center gap-6 text-[13px] font-medium text-[var(--color-muted-foreground)]", children: [
                dateFields.slice(0, 1).map((field) => {
                  const value = item._fields?.[field];
                  if (!value) return null;
                  return /* @__PURE__ */ jsxs(
                    Typography,
                    {
                      as: "span",
                      className: "flex items-center gap-2 text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)] transition-colors",
                      children: [
                        /* @__PURE__ */ jsx(Calendar, { className: "w-3.5 h-3.5" }),
                        /* @__PURE__ */ jsx(Typography, { as: "span", children: formatValue(value, field) })
                      ]
                    },
                    field
                  );
                }),
                metadataFields.map((field, i) => {
                  const value = item._fields?.[field];
                  if (value === void 0 || value === null) return null;
                  return /* @__PURE__ */ jsxs(
                    Typography,
                    {
                      as: "span",
                      className: "truncate flex items-center gap-1.5 text-[var(--color-muted-foreground)]",
                      children: [
                        /* @__PURE__ */ jsxs(Typography, { as: "span", className: "opacity-75", children: [
                          formatFieldLabel(field),
                          ":"
                        ] }),
                        /* @__PURE__ */ jsx(Typography, { as: "span", className: "text-[var(--color-foreground)]", children: formatValue(value, field) })
                      ]
                    },
                    field
                  );
                }),
                hasProgress && /* @__PURE__ */ jsx(Box, { className: "ml-auto", children: /* @__PURE__ */ jsx(ProgressIndicator, { value: progressValue }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(
              HStack,
              {
                className: cn(
                  "flex items-center gap-1 flex-shrink-0 transition-opacity duration-200",
                  "opacity-0 group-hover:opacity-100"
                ),
                children: [
                  editAction && /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "ghost",
                      onClick: (e) => {
                        e.stopPropagation();
                        editAction.onClick?.();
                      },
                      className: cn(
                        "p-2 rounded-[var(--radius-lg)] transition-all duration-200",
                        "hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]",
                        "text-[var(--color-muted-foreground)]",
                        "active:scale-95"
                      ),
                      title: editAction.label,
                      children: /* @__PURE__ */ jsx(Pencil, { className: "w-4 h-4" })
                    }
                  ),
                  viewAction && /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "ghost",
                      onClick: (e) => {
                        e.stopPropagation();
                        viewAction.onClick?.();
                      },
                      className: cn(
                        "p-2 rounded-[var(--radius-lg)] transition-all duration-200",
                        "hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                        "text-[var(--color-muted-foreground)]",
                        "active:scale-95"
                      ),
                      title: viewAction.label,
                      children: /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
                    }
                  ),
                  (() => {
                    const filteredActions = actions.filter(
                      (a) => !a.label.toLowerCase().includes("edit") && !a.label.toLowerCase().includes("view") && !a.label.toLowerCase().includes("open")
                    );
                    return filteredActions.length > 0 ? /* @__PURE__ */ jsx(
                      Menu$1,
                      {
                        trigger: /* @__PURE__ */ jsx(
                          Button,
                          {
                            variant: "ghost",
                            className: cn(
                              "p-2 rounded-[var(--radius-lg)] transition-all duration-200",
                              "hover:bg-[var(--color-muted)] hover:shadow-[var(--shadow-sm)]",
                              "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
                              "active:scale-95"
                            ),
                            children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "w-4 h-4" })
                          }
                        ),
                        items: filteredActions,
                        position: "bottom-right"
                      }
                    ) : null;
                  })(),
                  hasExplicitClick && /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-[var(--color-muted-foreground)]/50 group-hover:text-[var(--color-muted-foreground)] group-hover:translate-x-0.5 transition-all" })
                ]
              }
            )
          ]
        }
      ),
      !isLast && /* @__PURE__ */ jsx(Box, { className: "ml-[calc(1.5rem)] mr-6 border-b border-[var(--color-border)]/40" })
    ] }, item.id);
  };
  if (safeItems.length === 0) {
    return /* @__PURE__ */ jsx(
      EmptyState,
      {
        icon: Package,
        title: `No ${entityType || "items"} found`,
        description: resolvedEmptyMessage,
        className
      }
    );
  }
  return /* @__PURE__ */ jsx(
    Box,
    {
      className: cn(
        // Container with refined styling
        "bg-[var(--color-card)] backdrop-blur-sm",
        "rounded-[var(--radius-xl)]",
        // Increased rounding
        "border border-[var(--color-border)]",
        "shadow-[var(--shadow-lg)]",
        // Softer, improved shadow
        "overflow-hidden",
        className
      ),
      children: safeItems.map(
        (item, index) => customRenderItem ? customRenderItem(item, index) : defaultRenderItem(item, index, index === safeItems.length - 1)
      )
    }
  );
};
List.displayName = "List";
var variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: "bg-[var(--color-error)]",
    iconColor: "text-[var(--color-error-foreground)]",
    confirmVariant: "primary"
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-[var(--color-warning)]",
    iconColor: "text-[var(--color-warning-foreground)]",
    confirmVariant: "primary"
  },
  info: {
    icon: Check,
    iconBg: "bg-[var(--color-info)]",
    iconColor: "text-[var(--color-info-foreground)]",
    confirmVariant: "primary"
  },
  default: {
    icon: Check,
    iconBg: "bg-[var(--color-primary)]",
    iconColor: "text-[var(--color-primary-foreground)]",
    confirmVariant: "primary"
  }
};
var ConfirmDialog = ({
  isOpen = true,
  onClose = () => {
  },
  onConfirm = () => {
  },
  title,
  message,
  description,
  confirmText,
  confirmLabel,
  cancelText,
  cancelLabel,
  variant = "danger",
  size = "sm",
  isLoading = false,
  error: _error,
  entity: _entity,
  className
}) => {
  const config = variantConfig[variant];
  const { t } = useTranslate();
  const resolvedMessage = message ?? description ?? "";
  const resolvedConfirmText = confirmText ?? confirmLabel ?? t("dialog.confirm");
  const resolvedCancelText = cancelText ?? cancelLabel ?? t("dialog.cancel");
  const handleConfirm = () => {
    onConfirm();
  };
  return /* @__PURE__ */ jsx(
    Modal,
    {
      isOpen,
      onClose,
      size,
      showCloseButton: false,
      closeOnOverlayClick: !isLoading,
      closeOnEscape: !isLoading,
      className,
      footer: /* @__PURE__ */ jsxs(HStack, { className: "justify-end gap-3", children: [
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: onClose, disabled: isLoading, children: resolvedCancelText }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: config.confirmVariant,
            onClick: handleConfirm,
            disabled: isLoading,
            children: isLoading ? t("common.loading") : resolvedConfirmText
          }
        )
      ] }),
      children: /* @__PURE__ */ jsxs(HStack, { className: "gap-4", children: [
        /* @__PURE__ */ jsx(
          Box,
          {
            className: cn(
              "flex-shrink-0 w-12 h-12 flex items-center justify-center",
              config.iconBg
            ),
            children: /* @__PURE__ */ jsx(Icon, { icon: config.icon, size: "lg", className: config.iconColor })
          }
        ),
        /* @__PURE__ */ jsxs(Box, { className: "flex-1", children: [
          /* @__PURE__ */ jsx(Typography, { variant: "h5", className: "mb-2", children: title }),
          typeof resolvedMessage === "string" ? /* @__PURE__ */ jsx(
            Typography,
            {
              variant: "body2",
              className: "text-[var(--color-muted-foreground)]",
              children: resolvedMessage
            }
          ) : resolvedMessage
        ] })
      ] })
    }
  );
};
ConfirmDialog.displayName = "ConfirmDialog";
var WizardContainer = ({
  steps,
  currentStep: controlledStep,
  onStepChange,
  onComplete,
  showProgress = true,
  allowBack = true,
  compact = false,
  className,
  entity: _entity
  // Accept but don't use directly yet
}) => {
  const { t } = useTranslate();
  const [internalStep, setInternalStep] = useState(0);
  const normalizedControlledStep = (() => {
    if (controlledStep === void 0 || controlledStep === null)
      return void 0;
    if (typeof controlledStep === "number") return controlledStep;
    if (typeof controlledStep === "string") return parseInt(controlledStep, 10);
    const num = Number(controlledStep);
    return isNaN(num) ? void 0 : num;
  })();
  const currentStep = normalizedControlledStep !== void 0 ? normalizedControlledStep : internalStep;
  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const goToStep = useCallback(
    (stepIndex) => {
      if (stepIndex < 0 || stepIndex >= totalSteps) return;
      if (controlledStep === void 0) {
        setInternalStep(stepIndex);
      }
      onStepChange?.(stepIndex);
    },
    [controlledStep, totalSteps, onStepChange]
  );
  const handleNext = () => {
    if (currentStepData.isValid && !currentStepData.isValid()) {
      return;
    }
    if (isLastStep) {
      onComplete?.();
    } else {
      goToStep(currentStep + 1);
    }
  };
  const handleBack = () => {
    if (!isFirstStep && allowBack) {
      goToStep(currentStep - 1);
    }
  };
  return /* @__PURE__ */ jsxs(Box, { className: cn("flex flex-col h-full", className), children: [
    showProgress && /* @__PURE__ */ jsx(
      Box,
      {
        border: true,
        className: cn(
          "border-b-2 border-x-0 border-t-0 border-[var(--color-border)]",
          compact ? "px-4 py-2" : "px-6 py-4"
        ),
        children: /* @__PURE__ */ jsx(HStack, { gap: "sm", align: "center", className: "flex-wrap", children: steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const stepKey = step.id ?? step.tabId ?? `step-${index}`;
          const stepTitle = step.title ?? step.name ?? `Step ${index + 1}`;
          return /* @__PURE__ */ jsxs(React42__default.Fragment, { children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                onClick: () => isCompleted && allowBack && goToStep(index),
                disabled: !isCompleted || !allowBack,
                className: cn(
                  "w-8 h-8 flex items-center justify-center text-sm font-bold transition-colors",
                  "border-2 border-[var(--color-border)]",
                  isActive && "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
                  isCompleted && "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] cursor-pointer hover:bg-[var(--color-primary-hover)]",
                  !isActive && !isCompleted && "bg-[var(--color-card)] text-[var(--color-foreground)]"
                ),
                children: isCompleted ? /* @__PURE__ */ jsx(Icon, { icon: Check, size: "sm" }) : index + 1
              }
            ),
            /* @__PURE__ */ jsx(
              Box,
              {
                className: cn(
                  "hidden md:block",
                  isActive ? "text-[var(--color-foreground)] font-bold" : "text-[var(--color-muted-foreground)]"
                ),
                children: /* @__PURE__ */ jsx(
                  Typography,
                  {
                    variant: "small",
                    weight: isActive ? "bold" : "normal",
                    children: stepTitle
                  }
                )
              }
            ),
            index < totalSteps - 1 && /* @__PURE__ */ jsx(
              Box,
              {
                className: cn(
                  "flex-1 h-0.5",
                  index < currentStep ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"
                )
              }
            )
          ] }, stepKey);
        }) })
      }
    ),
    !compact && currentStepData && /* @__PURE__ */ jsxs(
      Box,
      {
        paddingX: "lg",
        paddingY: "md",
        border: true,
        className: "border-b-2 border-x-0 border-t-0 border-[var(--color-border)]",
        children: [
          /* @__PURE__ */ jsx(Typography, { variant: "h4", as: "h2", children: currentStepData.title ?? currentStepData.name ?? `Step ${currentStep + 1}` }),
          currentStepData.description && /* @__PURE__ */ jsx(
            Typography,
            {
              variant: "body2",
              className: "text-[var(--color-muted-foreground)] mt-1",
              children: currentStepData.description
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx(Box, { className: cn("flex-1 overflow-auto", compact ? "p-4" : "p-6"), children: currentStepData?.content }),
    /* @__PURE__ */ jsxs(
      Box,
      {
        border: true,
        className: cn(
          "border-t-2 border-x-0 border-b-0 border-[var(--color-border)] flex justify-between",
          compact ? "px-4 py-2" : "px-6 py-4"
        ),
        children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "secondary",
              onClick: handleBack,
              disabled: isFirstStep || !allowBack,
              children: [
                /* @__PURE__ */ jsx(Icon, { icon: ChevronLeft, size: "sm" }),
                t("wizard.back")
              ]
            }
          ),
          /* @__PURE__ */ jsx(HStack, { gap: "sm", align: "center", children: /* @__PURE__ */ jsx(
            Typography,
            {
              variant: "caption",
              className: "text-[var(--color-muted-foreground)]",
              children: t("wizard.stepOf", { current: String(currentStep + 1), total: String(steps.length) })
            }
          ) }),
          /* @__PURE__ */ jsxs(Button, { variant: "primary", onClick: handleNext, children: [
            isLastStep ? t("wizard.complete") : t("wizard.next"),
            !isLastStep && /* @__PURE__ */ jsx(Icon, { icon: ChevronRight, size: "sm" })
          ] })
        ]
      }
    )
  ] });
};
WizardContainer.displayName = "WizardContainer";
var ORBITAL_CONFIGS = {
  "1s": {
    type: "1s",
    name: "1s Orbital",
    color: "#C45B5B",
    glowColor: "rgba(196, 91, 91, 0.3)",
    lobes: 1,
    hasNode: false,
    scale: 0.6
  },
  "2s": {
    type: "2s",
    name: "2s Orbital",
    color: "#D4875B",
    glowColor: "rgba(212, 135, 91, 0.3)",
    lobes: 1,
    hasNode: false,
    scale: 0.8
  },
  "2p": {
    type: "2p",
    name: "2p Orbital",
    color: "#C9B458",
    glowColor: "rgba(201, 180, 88, 0.3)",
    lobes: 2,
    hasNode: false,
    scale: 1
  },
  "3s": {
    type: "3s",
    name: "3s Orbital",
    color: "#5BA87A",
    glowColor: "rgba(91, 168, 122, 0.3)",
    lobes: 1,
    hasNode: true,
    scale: 1
  },
  "3p": {
    type: "3p",
    name: "3p Orbital",
    color: "#5B8DC4",
    glowColor: "rgba(91, 141, 196, 0.3)",
    lobes: 2,
    hasNode: true,
    scale: 1.1
  },
  "3d": {
    type: "3d",
    name: "3d Orbital",
    color: "#6B5B8A",
    glowColor: "rgba(107, 91, 138, 0.3)",
    lobes: 4,
    hasNode: true,
    scale: 1.2
  },
  "4f": {
    type: "4f",
    name: "4f Orbital",
    color: "#8A5B9C",
    glowColor: "rgba(138, 91, 156, 0.3)",
    lobes: 6,
    hasNode: true,
    scale: 1.3
  }
};
var SIZE_MAP = {
  sm: 120,
  md: 200,
  lg: 300,
  xl: 400
};
function calculateComplexity(schema) {
  if (!schema) return 1;
  const entities = schema.dataEntities?.length || 0;
  const pages = schema.ui?.pages?.length || 0;
  const traits = schema.traits?.length || 0;
  const sections = schema.ui?.pages?.reduce(
    (acc, page) => acc + (page.sections?.length || 0),
    0
  ) || 0;
  return entities * 3 + pages * 2 + traits * 2 + sections * 1;
}
function getOrbitalType(complexity) {
  if (complexity <= 3) return "1s";
  if (complexity <= 8) return "2s";
  if (complexity <= 15) return "2p";
  if (complexity <= 25) return "3s";
  if (complexity <= 40) return "3p";
  if (complexity <= 60) return "3d";
  return "4f";
}
var OrbitalSphere = ({
  config,
  size,
  animated
}) => {
  const sphereSize = size * config.scale * 0.4;
  return /* @__PURE__ */ jsx(
    Box,
    {
      className: "absolute rounded-full",
      style: {
        width: sphereSize,
        height: sphereSize,
        background: `radial-gradient(circle at 30% 30%, ${config.color}dd, ${config.color}88 50%, ${config.color}44 100%)`,
        boxShadow: `
          inset -10px -10px 20px rgba(0,0,0,0.3),
          inset 5px 5px 15px rgba(255,255,255,0.2),
          0 0 ${size * 0.15}px ${config.glowColor},
          0 0 ${size * 0.3}px ${config.glowColor}
        `,
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        animation: animated ? "orbital-pulse 3s ease-in-out infinite" : void 0
      }
    }
  );
};
var DumbbellOrbital = ({
  config,
  size,
  animated,
  rotation = 0
}) => {
  const lobeSize = size * config.scale * 0.25;
  const offset = size * 0.18;
  return /* @__PURE__ */ jsxs(
    Box,
    {
      className: "absolute",
      style: {
        width: size,
        height: size,
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        animation: animated ? "orbital-rotate 8s linear infinite" : void 0
      },
      children: [
        /* @__PURE__ */ jsx(
          Box,
          {
            className: "absolute rounded-full",
            style: {
              width: lobeSize,
              height: lobeSize * 1.4,
              background: `radial-gradient(ellipse at 50% 30%, ${config.color}dd, ${config.color}66 70%, transparent 100%)`,
              boxShadow: `0 0 ${size * 0.1}px ${config.glowColor}`,
              left: "50%",
              top: `calc(50% - ${offset}px)`,
              transform: "translate(-50%, -100%)",
              borderRadius: "50% 50% 40% 40%"
            }
          }
        ),
        /* @__PURE__ */ jsx(
          Box,
          {
            className: "absolute rounded-full",
            style: {
              width: lobeSize,
              height: lobeSize * 1.4,
              background: `radial-gradient(ellipse at 50% 70%, ${config.color}dd, ${config.color}66 70%, transparent 100%)`,
              boxShadow: `0 0 ${size * 0.1}px ${config.glowColor}`,
              left: "50%",
              bottom: `calc(50% - ${offset}px)`,
              transform: "translate(-50%, 100%)",
              borderRadius: "40% 40% 50% 50%"
            }
          }
        ),
        config.hasNode && /* @__PURE__ */ jsx(
          Box,
          {
            className: "absolute rounded-[var(--radius-full)] bg-[var(--color-foreground)]",
            style: {
              width: size * 0.06,
              height: size * 0.06,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              boxShadow: `0 0 ${size * 0.05}px rgba(255,255,255,0.8)`
            }
          }
        )
      ]
    }
  );
};
var CloverleafOrbital = ({
  config,
  size,
  animated
}) => {
  const lobes = config.lobes;
  const angleStep = 360 / lobes;
  const lobeSize = size * 0.18;
  const lobeDistance = size * 0.22;
  return /* @__PURE__ */ jsxs(
    Box,
    {
      className: "absolute",
      style: {
        width: size,
        height: size,
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        animation: animated ? "orbital-rotate 12s linear infinite" : void 0
      },
      children: [
        Array.from({ length: lobes }).map((_, i) => {
          const angle = i * angleStep * (Math.PI / 180);
          const x = Math.cos(angle) * lobeDistance;
          const y = Math.sin(angle) * lobeDistance;
          return /* @__PURE__ */ jsx(
            Box,
            {
              className: "absolute rounded-full",
              style: {
                width: lobeSize,
                height: lobeSize * 1.3,
                background: `radial-gradient(ellipse at 50% 40%, ${config.color}dd, ${config.color}55 80%, transparent 100%)`,
                boxShadow: `0 0 ${size * 0.08}px ${config.glowColor}`,
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: `translate(-50%, -50%) rotate(${i * angleStep + 90}deg)`
              }
            },
            i
          );
        }),
        /* @__PURE__ */ jsx(
          Box,
          {
            className: "absolute rounded-[var(--radius-full)] bg-[var(--color-foreground)]",
            style: {
              width: size * 0.08,
              height: size * 0.08,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              boxShadow: `0 0 ${size * 0.06}px rgba(255,255,255,0.9)`
            }
          }
        )
      ]
    }
  );
};
var OrbitalVisualization = ({
  schema,
  complexity: overrideComplexity,
  size = "md",
  showLabel = true,
  animated = true,
  onClick,
  className = ""
}) => {
  const complexity = useMemo(() => {
    if (overrideComplexity !== void 0) return overrideComplexity;
    return calculateComplexity(schema);
  }, [schema, overrideComplexity]);
  const orbitalType = useMemo(() => getOrbitalType(complexity), [complexity]);
  const config = ORBITAL_CONFIGS[orbitalType];
  const pixelSize = SIZE_MAP[size];
  const renderOrbital = () => {
    switch (config.lobes) {
      case 1:
        return /* @__PURE__ */ jsx(OrbitalSphere, { config, size: pixelSize, animated });
      case 2:
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            DumbbellOrbital,
            {
              config,
              size: pixelSize,
              animated,
              rotation: 0
            }
          ),
          config.hasNode && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              DumbbellOrbital,
              {
                config,
                size: pixelSize * 0.7,
                animated,
                rotation: 60
              }
            ),
            /* @__PURE__ */ jsx(
              DumbbellOrbital,
              {
                config,
                size: pixelSize * 0.7,
                animated,
                rotation: 120
              }
            )
          ] })
        ] });
      case 4:
      case 6:
        return /* @__PURE__ */ jsx(
          CloverleafOrbital,
          {
            config,
            size: pixelSize,
            animated
          }
        );
      default:
        return /* @__PURE__ */ jsx(OrbitalSphere, { config, size: pixelSize, animated });
    }
  };
  return /* @__PURE__ */ jsxs(
    Box,
    {
      className: cn("relative flex flex-col items-center justify-center", className),
      style: { width: pixelSize, height: pixelSize + (showLabel ? 60 : 0) },
      onClick,
      role: onClick ? "button" : void 0,
      tabIndex: onClick ? 0 : void 0,
      children: [
        /* @__PURE__ */ jsxs(
          Box,
          {
            className: "relative",
            style: {
              width: pixelSize,
              height: pixelSize,
              perspective: pixelSize * 2,
              cursor: onClick ? "pointer" : "default"
            },
            children: [
              /* @__PURE__ */ jsx(
                Box,
                {
                  className: "absolute rounded-full opacity-30",
                  style: {
                    width: pixelSize * 0.8,
                    height: pixelSize * 0.8,
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
                    filter: "blur(20px)"
                  }
                }
              ),
              renderOrbital()
            ]
          }
        ),
        showLabel && /* @__PURE__ */ jsxs(Box, { className: "mt-4 text-center", children: [
          /* @__PURE__ */ jsx(Typography, { variant: "body", className: "text-lg font-semibold text-[var(--color-foreground)]", children: config.name }),
          /* @__PURE__ */ jsxs(Typography, { variant: "small", color: "muted", children: [
            "Complexity: ",
            complexity,
            " units"
          ] })
        ] }),
        /* @__PURE__ */ jsx("style", { children: `
        @keyframes orbital-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.9; }
        }

        @keyframes orbital-rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      ` })
      ]
    }
  );
};
OrbitalVisualization.displayName = "OrbitalVisualization";
var StateNode = ({ state, config }) => {
  const { t } = useTranslate();
  const size = state.radius * 2;
  let borderColor = config.colors.nodeBorder;
  let borderWidth = 2;
  if (state.isInitial) {
    borderColor = config.colors.initialNode;
    borderWidth = 3;
  } else if (state.isFinal) {
    borderColor = config.colors.finalNode;
    borderWidth = 3;
  }
  return /* @__PURE__ */ jsxs(
    Box,
    {
      className: "absolute flex items-center justify-center cursor-pointer transition-all hover:scale-105",
      style: {
        left: state.x - state.radius,
        top: state.y - state.radius,
        width: size,
        height: size,
        zIndex: 5
      },
      action: "STATE_CLICK",
      actionPayload: { stateName: state.name },
      title: state.description,
      children: [
        /* @__PURE__ */ jsxs(
          Box,
          {
            className: "absolute inset-0 rounded-full flex items-center justify-center",
            style: {
              backgroundColor: config.colors.node,
              border: `${borderWidth}px solid ${borderColor}`
            },
            children: [
              state.isFinal && /* @__PURE__ */ jsx(
                Box,
                {
                  className: "absolute rounded-full",
                  style: {
                    width: size - 12,
                    height: size - 12,
                    border: `2px solid ${borderColor}`
                  }
                }
              ),
              /* @__PURE__ */ jsx(
                Typography,
                {
                  variant: "label",
                  weight: "semibold",
                  align: "center",
                  className: "px-2",
                  style: {
                    color: config.colors.nodeText,
                    fontSize: "18px",
                    fontFamily: "Inter, sans-serif"
                  },
                  children: state.name
                }
              )
            ]
          }
        ),
        state.isInitial && /* @__PURE__ */ jsxs(
          "svg",
          {
            className: "absolute",
            style: {
              left: -45,
              top: "50%",
              transform: "translateY(-50%)",
              width: 40,
              height: 20
            },
            children: [
              /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx(
                "marker",
                {
                  id: "initial-arrow",
                  viewBox: "0 0 10 10",
                  refX: "8",
                  refY: "5",
                  markerWidth: "6",
                  markerHeight: "6",
                  orient: "auto",
                  children: /* @__PURE__ */ jsx("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: config.colors.initial })
                }
              ) }),
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M 0 10 L 35 10",
                  stroke: config.colors.initial,
                  strokeWidth: "2",
                  fill: "none",
                  markerEnd: "url(#initial-arrow)"
                }
              )
            ]
          }
        )
      ]
    }
  );
};
var TransitionBundleArrow = ({ bundle, states, bundleIndex, config, onClick, onHover }) => {
  const { t } = useTranslate();
  const groupRef = useRef(null);
  const fromState = states.find((s) => s.name === bundle.from);
  const toState = states.find((s) => s.name === bundle.to);
  if (!fromState || !toState) return null;
  const isSelfLoop = bundle.from === bundle.to;
  const dx = toState.x - fromState.x;
  const dy = toState.y - fromState.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (isSelfLoop) {
    const loopRadius = 50 + bundleIndex * 25;
    const loopDirection = bundleIndex % 2 === 0 ? -1 : 1;
    const startAngle = loopDirection === -1 ? -0.5 : 0.5;
    const endAngle = loopDirection === -1 ? 0.5 : -0.5;
    const startX2 = fromState.x + Math.cos(Math.PI / 2 * loopDirection + startAngle) * fromState.radius;
    const startY2 = fromState.y + Math.sin(Math.PI / 2 * loopDirection + startAngle) * fromState.radius;
    const endX2 = fromState.x + Math.cos(Math.PI / 2 * loopDirection + endAngle) * fromState.radius;
    const endY2 = fromState.y + Math.sin(Math.PI / 2 * loopDirection + endAngle) * fromState.radius;
    const isSingle2 = bundle.labels.length === 1;
    const labelText2 = isSingle2 ? bundle.labels[0].event : `${bundle.labels.length} events`;
    const bundleColor2 = isSingle2 ? config.colors.arrow : "var(--color-accent)";
    const labelWidth2 = labelText2.length * 9 + (isSingle2 ? 24 : 40);
    const cx = fromState.x;
    const cy = fromState.y + (fromState.radius + loopRadius) * loopDirection;
    const loopPath = `M ${startX2} ${startY2} A ${loopRadius} ${loopRadius} 0 1 ${loopDirection === -1 ? 1 : 0} ${endX2} ${endY2}`;
    const labelX2 = cx;
    const labelY2 = cy + loopRadius * loopDirection * 0.5;
    const uniqueMarkerId2 = `arrow-self-${bundle.id}`;
    const handleMouseEnter2 = () => {
      if (groupRef.current) {
        const rect = groupRef.current.getBoundingClientRect();
        onHover(bundle, rect.left + rect.width / 2, rect.top - 8);
      }
    };
    const handleMouseLeave2 = () => {
      onHover(null, 0, 0);
    };
    return /* @__PURE__ */ jsxs(
      "g",
      {
        ref: groupRef,
        className: "transition-bundle cursor-pointer",
        "data-bundle-id": bundle.id,
        onClick: () => onClick?.(bundle),
        onMouseEnter: handleMouseEnter2,
        onMouseLeave: handleMouseLeave2,
        style: { pointerEvents: "auto" },
        children: [
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx(
            "marker",
            {
              id: uniqueMarkerId2,
              viewBox: "0 0 10 10",
              refX: "8",
              refY: "5",
              markerWidth: "8",
              markerHeight: "8",
              orient: "auto",
              children: /* @__PURE__ */ jsx("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: bundleColor2 })
            }
          ) }),
          /* @__PURE__ */ jsx(
            "path",
            {
              d: loopPath,
              stroke: bundleColor2,
              strokeWidth: isSingle2 ? 1.5 : 2.5,
              fill: "none",
              markerEnd: `url(#${uniqueMarkerId2})`
            }
          ),
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: labelX2 - labelWidth2 / 2,
              y: labelY2 - 14,
              width: labelWidth2,
              height: 28,
              rx: isSingle2 ? 4 : 14,
              fill: isSingle2 ? config.colors.background : "var(--color-accent)",
              stroke: bundleColor2,
              strokeWidth: isSingle2 ? 1 : 0
            }
          ),
          /* @__PURE__ */ jsx(
            "text",
            {
              x: labelX2,
              y: labelY2 + 5,
              textAnchor: "middle",
              fill: isSingle2 ? config.colors.arrowText : "var(--color-accent-foreground)",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "13px",
              fontWeight: isSingle2 ? 600 : 700,
              children: labelText2
            }
          )
        ]
      }
    );
  }
  if (dist === 0) return null;
  const nx = dx / dist;
  const ny = dy / dist;
  const startX = fromState.x + nx * fromState.radius;
  const startY = fromState.y + ny * fromState.radius;
  const endX = toState.x - nx * (toState.radius + 8);
  const endY = toState.y - ny * (toState.radius + 8);
  const intermediateStates = states.filter((s) => {
    if (s.name === bundle.from || s.name === bundle.to) return false;
    const t2 = ((s.x - fromState.x) * dx + (s.y - fromState.y) * dy) / (dist * dist);
    if (t2 < 0.1 || t2 > 0.9) return false;
    const projX = fromState.x + t2 * dx;
    const projY = fromState.y + t2 * dy;
    const distToLine = Math.sqrt((s.x - projX) ** 2 + (s.y - projY) ** 2);
    return distToLine < s.radius + 80;
  });
  const baseCurveDirection = bundle.isReverse ? 1 : -1;
  const laneOffset = 55 + bundleIndex * 55;
  let avoidanceOffset = 0;
  if (intermediateStates.length > 0) {
    const midXObst = (fromState.x + toState.x) / 2;
    const midYObst = (fromState.y + toState.y) / 2;
    const perpDirX = -ny;
    const perpDirY = nx;
    let obstaclesAbove = 0;
    let obstaclesBelow = 0;
    intermediateStates.forEach((s) => {
      const relX = s.x - midXObst;
      const relY = s.y - midYObst;
      const perpDist = relX * perpDirX + relY * perpDirY;
      if (perpDist > 0) obstaclesAbove++;
      else obstaclesBelow++;
    });
    avoidanceOffset = obstaclesAbove > obstaclesBelow ? -100 : 100;
  }
  const baseOffset = bundle.isBidirectional ? 60 : 40;
  const curveAmount = (baseOffset + laneOffset) * baseCurveDirection + avoidanceOffset;
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const perpX = -ny * curveAmount;
  const perpY = nx * curveAmount;
  const controlX = midX + perpX;
  const controlY = midY + perpY;
  const isSingle = bundle.labels.length === 1;
  const labelText = isSingle ? bundle.labels[0].event : `${bundle.labels.length} events`;
  const labelWidth = labelText.length * 9 + (isSingle ? 24 : 40);
  const bundleColor = isSingle ? config.colors.arrow : "var(--color-accent)";
  const curveMidpoint = {
    x: 0.25 * startX + 0.5 * controlX + 0.25 * endX,
    y: 0.25 * startY + 0.5 * controlY + 0.25 * endY
  };
  const labelX = curveMidpoint.x;
  const labelY = curveMidpoint.y;
  const handleMouseEnter = useCallback(() => {
    if (groupRef.current) {
      const rect = groupRef.current.getBoundingClientRect();
      onHover(bundle, rect.left + rect.width / 2, rect.top - 8);
    }
  }, [bundle, onHover]);
  const handleMouseLeave = useCallback(() => {
    onHover(null, 0, 0);
  }, [onHover]);
  const uniqueMarkerId = `arrow-${bundle.id}`;
  const hasDetails = bundle.labels.some((l) => l.hasDetails);
  return /* @__PURE__ */ jsxs(
    "g",
    {
      ref: groupRef,
      className: "transition-bundle cursor-pointer",
      "data-bundle-id": bundle.id,
      onClick: () => onClick?.(bundle),
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      style: { pointerEvents: "auto" },
      children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx(
          "marker",
          {
            id: uniqueMarkerId,
            viewBox: "0 0 10 10",
            refX: "8",
            refY: "5",
            markerWidth: "8",
            markerHeight: "8",
            orient: "auto",
            children: /* @__PURE__ */ jsx("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: bundleColor })
          }
        ) }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`,
            stroke: bundleColor,
            strokeWidth: isSingle ? 1.5 : 2.5,
            fill: "none",
            markerEnd: `url(#${uniqueMarkerId})`
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: labelX - labelWidth / 2,
            y: labelY - 14,
            width: labelWidth,
            height: 28,
            rx: isSingle ? 4 : 14,
            fill: isSingle ? config.colors.background : "var(--color-accent)",
            stroke: bundleColor,
            strokeWidth: isSingle ? 1 : 0
          }
        ),
        /* @__PURE__ */ jsx(
          "text",
          {
            x: labelX,
            y: labelY + 5,
            textAnchor: "middle",
            fill: isSingle ? config.colors.arrowText : "var(--color-accent-foreground)",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "13px",
            fontWeight: isSingle ? 600 : 700,
            children: labelText
          }
        ),
        isSingle && hasDetails && /* @__PURE__ */ jsx(
          "circle",
          {
            cx: labelX + labelWidth / 2 - 6,
            cy: labelY - 10,
            r: 4,
            fill: config.colors.guardText
          }
        ),
        !isSingle && /* @__PURE__ */ jsx(
          "circle",
          {
            cx: labelX + labelWidth / 2 - 4,
            cy: labelY - 10,
            r: 8,
            fill: "var(--color-error)",
            stroke: "var(--color-error-foreground)",
            strokeWidth: 1
          }
        )
      ]
    }
  );
};
var BundleTooltip = ({ tooltip, config }) => {
  const { t } = useTranslate();
  if (!tooltip.visible || !tooltip.bundle) return null;
  const { bundle } = tooltip;
  const isSingle = bundle.labels.length === 1;
  const estimatedHeight = isSingle ? bundle.labels[0].guardText || bundle.labels[0].effectTexts.length > 0 ? 120 : 60 : Math.min(400, 80 + bundle.labels.length * 60);
  const wouldGoOffTop = tooltip.y - estimatedHeight < 20;
  const safeX = Math.max(200, Math.min(tooltip.x, window.innerWidth - 200));
  const safeY = wouldGoOffTop ? tooltip.y + 40 : tooltip.y;
  const transform = wouldGoOffTop ? "translateX(-50%)" : "translate(-50%, -100%)";
  return createPortal(
    /* @__PURE__ */ jsx(
      Box,
      {
        className: cn(
          "fixed z-50 animate-in fade-in-0 zoom-in-95 duration-150",
          tooltip.pinned ? "pointer-events-auto" : "pointer-events-none"
        ),
        style: {
          left: safeX,
          top: safeY,
          transform,
          maxHeight: "calc(100vh - 40px)",
          overflow: "auto"
        },
        children: /* @__PURE__ */ jsxs(
          Box,
          {
            className: "rounded-lg shadow-xl border px-4 py-3 max-w-lg relative bg-card",
            style: {
              borderColor: tooltip.pinned ? "var(--color-success)" : isSingle ? config.colors.nodeBorder : "var(--color-accent)",
              borderWidth: tooltip.pinned ? 2 : isSingle ? 1 : 2
            },
            children: [
              tooltip.pinned && /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  action: "TOOLTIP_CLOSE",
                  className: "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center hover:scale-110 transition-transform",
                  style: { backgroundColor: "var(--color-error)", padding: 0 },
                  title: "Close",
                  children: /* @__PURE__ */ jsx(Icon, { icon: X, size: "xs", style: { color: "var(--color-error-foreground)" } })
                }
              ),
              tooltip.pinned && /* @__PURE__ */ jsx(
                Box,
                {
                  className: "absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full",
                  style: { backgroundColor: "var(--color-success)" },
                  children: /* @__PURE__ */ jsx(Typography, { variant: "caption", weight: "semibold", style: { color: "var(--color-success-foreground)" }, children: "Pinned" })
                }
              ),
              !isSingle && /* @__PURE__ */ jsxs(
                HStack,
                {
                  gap: "sm",
                  align: "center",
                  className: "font-bold mb-3 pb-2 border-b",
                  style: {
                    color: "var(--color-accent-foreground)",
                    borderColor: "var(--color-border)"
                  },
                  children: [
                    /* @__PURE__ */ jsx(Typography, { variant: "large", style: { color: "var(--color-accent-foreground)" }, children: bundle.from }),
                    /* @__PURE__ */ jsx(Typography, { variant: "label", style: { color: "var(--color-muted-foreground)" }, children: "\u2192" }),
                    /* @__PURE__ */ jsx(Typography, { variant: "large", style: { color: "var(--color-accent-foreground)" }, children: bundle.to }),
                    /* @__PURE__ */ jsx(
                      Box,
                      {
                        className: "ml-2 px-2 py-0.5 rounded-full",
                        style: { backgroundColor: "var(--color-accent)" },
                        children: /* @__PURE__ */ jsxs(Typography, { variant: "caption", style: { color: "var(--color-accent-foreground)" }, children: [
                          bundle.labels.length,
                          " events"
                        ] })
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsx(VStack, { gap: "sm", children: bundle.labels.map((label, idx) => /* @__PURE__ */ jsxs(
                Box,
                {
                  className: !isSingle && idx > 0 ? "pt-2 border-t" : "",
                  style: { borderColor: "var(--color-border)" },
                  children: [
                    /* @__PURE__ */ jsxs(
                      Typography,
                      {
                        variant: "label",
                        weight: "semibold",
                        className: "mb-1",
                        style: {
                          color: config.colors.arrowText,
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: isSingle ? "14px" : "13px"
                        },
                        children: [
                          !isSingle && /* @__PURE__ */ jsx(Typography, { variant: "caption", as: "span", style: { color: "var(--color-muted-foreground)" }, children: "\u2022 " }),
                          label.event
                        ]
                      }
                    ),
                    label.guardText && /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "start", className: "ml-3 mb-0.5", children: [
                      /* @__PURE__ */ jsx(
                        Typography,
                        {
                          variant: "caption",
                          weight: "semibold",
                          style: { color: config.colors.guardText },
                          children: "if:"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        Typography,
                        {
                          variant: "caption",
                          style: { color: config.colors.guardText },
                          children: label.guardText
                        }
                      )
                    ] }),
                    label.effectTexts.length > 0 && /* @__PURE__ */ jsx(VStack, { gap: "none", className: "ml-3", children: label.effectTexts.map((effect, effIdx) => /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "start", children: [
                      /* @__PURE__ */ jsx(
                        Typography,
                        {
                          variant: "caption",
                          weight: "semibold",
                          style: { color: config.colors.effectText },
                          children: effIdx === 0 ? "\u2192" : " "
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        Typography,
                        {
                          variant: "caption",
                          style: { color: config.colors.effectText },
                          children: effect
                        }
                      )
                    ] }, effIdx)) })
                  ]
                },
                label.id
              )) })
            ]
          }
        )
      }
    ),
    document.body
  );
};
var EntityBox = ({ entity, config }) => {
  const { t } = useTranslate();
  return /* @__PURE__ */ jsxs(
    VStack,
    {
      gap: "none",
      className: "absolute rounded-lg border-2 p-3",
      style: {
        left: entity.x,
        top: entity.y,
        width: entity.width,
        height: entity.height,
        backgroundColor: config.colors.background,
        borderColor: "var(--color-info)",
        zIndex: 5
      },
      children: [
        /* @__PURE__ */ jsx(
          Typography,
          {
            variant: "label",
            weight: "semibold",
            align: "center",
            className: "mb-2",
            style: { color: "var(--color-info)", fontSize: "14px" },
            children: entity.name
          }
        ),
        entity.fields.map((field, idx) => /* @__PURE__ */ jsx(
          Typography,
          {
            variant: "caption",
            style: { color: "var(--color-muted-foreground)", fontFamily: "JetBrains Mono, monospace" },
            children: field
          },
          idx
        ))
      ]
    }
  );
};
var OutputsBox = ({ outputs, config }) => {
  const { t } = useTranslate();
  return /* @__PURE__ */ jsxs(
    VStack,
    {
      gap: "none",
      className: "absolute rounded-lg border-2 p-3",
      style: {
        left: outputs.x,
        top: outputs.y,
        width: outputs.width,
        height: outputs.height,
        backgroundColor: config.colors.background,
        borderColor: "var(--color-warning)",
        zIndex: 5
      },
      children: [
        /* @__PURE__ */ jsx(
          Typography,
          {
            variant: "caption",
            weight: "semibold",
            align: "center",
            className: "mb-2",
            style: { color: "var(--color-warning)", fontSize: "13px" },
            children: "External Effects"
          }
        ),
        outputs.outputs.map((output, idx) => /* @__PURE__ */ jsx(
          Typography,
          {
            variant: "caption",
            className: "mb-0.5",
            style: { color: "var(--color-foreground)", fontFamily: "Inter, sans-serif" },
            children: output
          },
          idx
        ))
      ]
    }
  );
};
var Legend = ({ config, y }) => {
  const { t } = useTranslate();
  const items = [
    { label: "Initial", color: config.colors.initialNode },
    { label: "Final", color: config.colors.finalNode },
    { label: "State", color: config.colors.nodeBorder },
    { label: "Multi-event", color: "var(--color-accent)" }
  ];
  return /* @__PURE__ */ jsx(
    HStack,
    {
      gap: "md",
      align: "center",
      className: "absolute",
      style: { left: 20, top: y, zIndex: 15 },
      children: items.map((item) => /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
        /* @__PURE__ */ jsx(
          Box,
          {
            className: "w-3 h-3 rounded-full",
            style: {
              backgroundColor: item.label === "Multi-event" ? item.color : config.colors.node,
              border: item.label !== "Multi-event" ? `2px solid ${item.color}` : "none"
            }
          }
        ),
        /* @__PURE__ */ jsx(
          Typography,
          {
            variant: "caption",
            style: { color: config.colors.arrowText },
            children: item.label
          }
        )
      ] }, item.label))
    }
  );
};
var StateMachineView = ({
  layoutData,
  renderStateNode,
  className = "",
  isLoading: _isLoading,
  error: _error
}) => {
  const { t } = useTranslate();
  const [tooltip, setTooltip] = useState({
    visible: false,
    pinned: false,
    x: 0,
    y: 0,
    bundle: null
  });
  const handleBundleHover = useCallback((bundle, x, y) => {
    if (tooltip.pinned) return;
    if (bundle) {
      setTooltip({ visible: true, pinned: false, x, y, bundle });
    } else {
      setTooltip((prev) => ({ ...prev, visible: false }));
    }
  }, [tooltip.pinned]);
  const handleBundleClick = useCallback((bundle) => {
    if (tooltip.pinned && tooltip.bundle?.id === bundle.id) {
      setTooltip((prev) => ({ ...prev, pinned: false, visible: false }));
    } else {
      const el = document.querySelector(`[data-bundle-id="${bundle.id}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTooltip({
          visible: true,
          pinned: true,
          x: rect.left + rect.width / 2,
          y: rect.top - 8,
          bundle
        });
      }
    }
  }, [tooltip.pinned, tooltip.bundle?.id]);
  const handleCloseTooltip = useCallback(() => {
    setTooltip((prev) => ({ ...prev, pinned: false, visible: false }));
  }, []);
  useEventListener("UI:TOOLTIP_CLOSE", handleCloseTooltip);
  const { width, height, title, states, labels, entity, outputs, config } = layoutData;
  const bundles = useMemo(() => {
    const bundleMap = {};
    labels.forEach((label) => {
      const key = `${label.from}->${label.to}`;
      if (!bundleMap[key]) bundleMap[key] = [];
      bundleMap[key].push(label);
    });
    const allPairs = new Set(Object.keys(bundleMap));
    return Object.entries(bundleMap).map(([key, bundleLabels]) => {
      const [from, to] = key.split("->");
      const reverseKey = `${to}->${from}`;
      const isBidirectional = allPairs.has(reverseKey);
      const isReverse = from > to;
      return {
        id: `bundle-${from}-${to}`,
        from,
        to,
        labels: bundleLabels,
        isBidirectional,
        isReverse
      };
    });
  }, [labels]);
  return /* @__PURE__ */ jsxs(
    Box,
    {
      className: cn("relative", className),
      style: {
        width,
        height,
        backgroundColor: config.colors.background,
        borderRadius: "8px"
      },
      children: [
        title && /* @__PURE__ */ jsx(
          Typography,
          {
            variant: "label",
            weight: "semibold",
            align: "center",
            className: "absolute",
            style: {
              left: 0,
              right: 0,
              top: 10,
              color: config.colors.nodeText,
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
              zIndex: 15
            },
            children: title
          }
        ),
        /* @__PURE__ */ jsxs(
          Box,
          {
            className: "absolute inset-0",
            style: { top: title ? 30 : 0 },
            children: [
              entity && /* @__PURE__ */ jsx(EntityBox, { entity, config }),
              states.map((state) => renderStateNode ? /* @__PURE__ */ jsx(React42__default.Fragment, { children: renderStateNode(state, config) }, state.id) : /* @__PURE__ */ jsx(
                StateNode,
                {
                  state,
                  config
                },
                state.id
              )),
              /* @__PURE__ */ jsx(
                "svg",
                {
                  className: "absolute inset-0",
                  width,
                  height: height - (title ? 30 : 0),
                  style: { overflow: "visible", zIndex: 20, pointerEvents: "none" },
                  children: bundles.map((bundle, idx) => /* @__PURE__ */ jsx(
                    TransitionBundleArrow,
                    {
                      bundle,
                      states,
                      bundleIndex: idx,
                      totalBundlesForPair: bundles.length,
                      config,
                      onClick: handleBundleClick,
                      onHover: handleBundleHover
                    },
                    bundle.id
                  ))
                }
              ),
              outputs && /* @__PURE__ */ jsx(OutputsBox, { outputs, config })
            ]
          }
        ),
        /* @__PURE__ */ jsx(Legend, { config, y: height - 25 }),
        /* @__PURE__ */ jsx(BundleTooltip, { tooltip, config })
      ]
    }
  );
};
StateMachineView.displayName = "StateMachineView";

// lib/jazari/svg-paths.ts
function gearTeethPath(cx, cy, innerRadius, outerRadius, numTeeth) {
  const parts = [];
  const angleStep = Math.PI * 2 / numTeeth;
  const halfTooth = angleStep * 0.25;
  for (let i = 0; i < numTeeth; i++) {
    const baseAngle = i * angleStep;
    const x0 = cx + innerRadius * Math.cos(baseAngle - halfTooth);
    const y0 = cy + innerRadius * Math.sin(baseAngle - halfTooth);
    const x1 = cx + outerRadius * Math.cos(baseAngle - halfTooth * 0.4);
    const y1 = cy + outerRadius * Math.sin(baseAngle - halfTooth * 0.4);
    const x2 = cx + outerRadius * Math.cos(baseAngle + halfTooth * 0.4);
    const y2 = cy + outerRadius * Math.sin(baseAngle + halfTooth * 0.4);
    const x3 = cx + innerRadius * Math.cos(baseAngle + halfTooth);
    const y3 = cy + innerRadius * Math.sin(baseAngle + halfTooth);
    if (i === 0) {
      parts.push(`M ${x0.toFixed(1)} ${y0.toFixed(1)}`);
    } else {
      parts.push(`L ${x0.toFixed(1)} ${y0.toFixed(1)}`);
    }
    parts.push(`L ${x1.toFixed(1)} ${y1.toFixed(1)}`);
    parts.push(`L ${x2.toFixed(1)} ${y2.toFixed(1)}`);
    parts.push(`L ${x3.toFixed(1)} ${y3.toFixed(1)}`);
  }
  parts.push("Z");
  return parts.join(" ");
}
var JAZARI_VISUALIZER_CONFIG = {
  ...DEFAULT_CONFIG,
  colors: {
    background: "var(--color-card)",
    node: "var(--color-card)",
    nodeBorder: "var(--color-border)",
    nodeText: "var(--color-foreground)",
    initialNode: "var(--color-success)",
    finalNode: "var(--color-error)",
    arrow: "var(--color-muted-foreground)",
    arrowText: "var(--color-foreground)",
    effectText: "var(--color-warning)",
    guardText: "var(--color-error)",
    initial: "var(--color-success)"
  },
  fonts: {
    node: "18px 'Noto Naskh Arabic', serif",
    event: "13px 'JetBrains Mono', monospace",
    effect: "12px 'JetBrains Mono', monospace"
  }
};
function extractTrait(schema, trait, traitIndex) {
  if (trait) return trait;
  if (!schema?.orbitals?.length) return null;
  for (const orbital of schema.orbitals) {
    const traits = orbital.traits ?? [];
    if (traitIndex < traits.length) {
      return traits[traitIndex];
    }
  }
  return null;
}
function extractEntityFields(schema) {
  if (!schema?.orbitals?.length) return [];
  const entity = schema.orbitals[0].entity;
  if (!entity?.fields) return [];
  return entity.fields.map((f) => f.name);
}
function toStateMachineDefinition(sm) {
  return {
    states: sm.states.map((s) => ({
      name: s.name,
      isInitial: s.isInitial,
      isFinal: s.isTerminal ?? s.isFinal
    })),
    transitions: sm.transitions.map((t) => ({
      from: t.from,
      to: t.to,
      event: t.event,
      guard: t.guard,
      effects: t.effects
    }))
  };
}
var GEAR_INNER_RADIUS = 0.6;
var GEAR_NUM_TEETH = 12;
var GEAR_TEETH_DEPTH = 7;
function renderJazariGearNode(state, config) {
  const outerR = state.radius * 0.5 + GEAR_TEETH_DEPTH;
  const innerR = state.radius * 0.5 - 2;
  const coreR = state.radius * 0.5 * GEAR_INNER_RADIUS;
  const fillColor = state.isInitial ? config.colors.initialNode : config.colors.nodeBorder;
  const teethD = gearTeethPath(state.radius, state.radius, innerR, outerR, GEAR_NUM_TEETH);
  const label = state.name.length > 10 ? `${state.name.slice(0, 9)}\u2026` : state.name;
  const fontSize = state.name.length > 7 ? 11 : 14;
  const size = state.radius * 2;
  return /* @__PURE__ */ jsx(
    Box,
    {
      className: "absolute",
      style: {
        left: state.x - state.radius,
        top: state.y - state.radius,
        width: size,
        height: size,
        zIndex: 5
      },
      action: "STATE_CLICK",
      actionPayload: { stateName: state.name },
      children: /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, children: [
        state.isInitial && /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("filter", { id: `jazari-glow-${state.name}`, children: [
          /* @__PURE__ */ jsx("feGaussianBlur", { stdDeviation: "3", result: "blur" }),
          /* @__PURE__ */ jsxs("feMerge", { children: [
            /* @__PURE__ */ jsx("feMergeNode", { in: "blur" }),
            /* @__PURE__ */ jsx("feMergeNode", { in: "SourceGraphic" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: teethD,
            fill: fillColor,
            fillOpacity: 0.2,
            stroke: fillColor,
            strokeWidth: 1.5,
            strokeDasharray: state.isFinal ? "4 3" : void 0,
            filter: state.isInitial ? `url(#jazari-glow-${state.name})` : void 0
          }
        ),
        /* @__PURE__ */ jsx(
          "circle",
          {
            cx: state.radius,
            cy: state.radius,
            r: coreR,
            fill: fillColor,
            fillOpacity: 0.15,
            stroke: fillColor,
            strokeWidth: 1,
            strokeDasharray: state.isFinal ? "4 3" : void 0
          }
        ),
        /* @__PURE__ */ jsx(
          "text",
          {
            x: state.radius,
            y: state.radius,
            textAnchor: "middle",
            dominantBaseline: "central",
            fill: config.colors.nodeText,
            fontSize,
            fontWeight: 600,
            fontFamily: "'Noto Naskh Arabic', serif",
            children: label
          }
        )
      ] })
    }
  );
}
var JazariStateMachine = ({
  schema,
  trait: traitProp,
  traitIndex = 0,
  entityFields: entityFieldsProp,
  direction = "ltr",
  className,
  isLoading = false,
  error = null
}) => {
  const { t } = useTranslate();
  const resolvedTrait = useMemo(
    () => extractTrait(schema, traitProp, traitIndex),
    [schema, traitProp, traitIndex]
  );
  const entityFields = useMemo(
    () => entityFieldsProp ?? extractEntityFields(schema),
    [entityFieldsProp, schema]
  );
  const layoutData = useMemo(() => {
    if (!resolvedTrait?.stateMachine) return null;
    const sm = toStateMachineDefinition(resolvedTrait.stateMachine);
    const entityDef = entityFields.length > 0 ? { name: "entity", fields: entityFields } : void 0;
    return renderStateMachineToDomData(
      sm,
      { title: resolvedTrait.name, entity: entityDef },
      JAZARI_VISUALIZER_CONFIG
    );
  }, [resolvedTrait, entityFields]);
  if (isLoading) {
    return /* @__PURE__ */ jsx(LoadingState, { message: "Loading state machine\u2026" });
  }
  if (error) {
    return /* @__PURE__ */ jsx(ErrorState, { message: error instanceof Error ? error.message : String(error) });
  }
  if (!resolvedTrait || !layoutData || layoutData.states.length === 0) {
    return /* @__PURE__ */ jsx(Box, { padding: "lg", className: cn("text-center", className), children: /* @__PURE__ */ jsx(Typography, { variant: "body", className: "opacity-60", children: "No state machine to visualize" }) });
  }
  return /* @__PURE__ */ jsx(
    StateMachineView,
    {
      layoutData,
      renderStateNode: renderJazariGearNode,
      className: cn("jazari-state-machine", className)
    }
  );
};
JazariStateMachine.displayName = "JazariStateMachine";
var ContentRenderer = ({
  content,
  segments: segmentsProp,
  direction,
  className
}) => {
  const { t: _t } = useTranslate();
  const segments = useMemo(
    () => segmentsProp ?? parseContentSegments(content),
    [segmentsProp, content]
  );
  if (segments.length === 0) return null;
  return /* @__PURE__ */ jsx(VStack, { gap: "md", className: cn("w-full", className), children: segments.map((segment, i) => {
    const key = `seg-${i}`;
    switch (segment.type) {
      case "markdown":
        return /* @__PURE__ */ jsx(
          MarkdownContent,
          {
            content: segment.content,
            direction
          },
          key
        );
      case "code":
        return /* @__PURE__ */ jsx(
          CodeBlock,
          {
            code: segment.content,
            language: segment.language
          },
          key
        );
      case "orbital": {
        const parsed = segment.schema;
        const schema = Array.isArray(parsed.orbitals) ? parsed : {
          orbitals: [{
            traits: [{
              name: "inline",
              stateMachine: parsed
            }]
          }]
        };
        return /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
          /* @__PURE__ */ jsx(
            CodeBlock,
            {
              code: segment.content,
              language: segment.language
            }
          ),
          /* @__PURE__ */ jsx(ScaledDiagram, { children: /* @__PURE__ */ jsx(
            JazariStateMachine,
            {
              schema,
              direction
            }
          ) })
        ] }, key);
      }
      case "quiz":
        return /* @__PURE__ */ jsx(
          QuizBlock,
          {
            question: segment.question,
            answer: segment.answer
          },
          key
        );
      default:
        return null;
    }
  }) });
};
ContentRenderer.displayName = "ContentRenderer";
var BookCoverPage = ({
  title,
  subtitle,
  author,
  coverImageUrl,
  direction,
  className
}) => {
  const { t } = useTranslate();
  return /* @__PURE__ */ jsxs(
    VStack,
    {
      gap: "lg",
      align: "center",
      justify: "center",
      className: cn(
        "min-h-[80vh] p-8 text-center",
        className
      ),
      style: { direction },
      children: [
        coverImageUrl && /* @__PURE__ */ jsx(
          Box,
          {
            className: "w-64 h-80 rounded-lg overflow-hidden shadow-xl",
            style: {
              backgroundImage: `url(${coverImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            },
            "aria-label": title,
            role: "img"
          }
        ),
        /* @__PURE__ */ jsxs(VStack, { gap: "sm", align: "center", className: "max-w-lg", children: [
          /* @__PURE__ */ jsx(Typography, { variant: "h1", className: "text-4xl font-bold", children: title }),
          subtitle && /* @__PURE__ */ jsx(
            Typography,
            {
              variant: "h2",
              className: "text-xl text-[var(--color-muted-foreground)]",
              children: subtitle
            }
          ),
          author && /* @__PURE__ */ jsx(
            Typography,
            {
              variant: "body",
              className: "text-[var(--color-muted-foreground)] mt-4",
              children: author
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "primary",
            size: "lg",
            action: "BOOK_START",
            className: "mt-8",
            children: /* @__PURE__ */ jsx(Typography, { variant: "body", children: t("book.startReading") })
          }
        )
      ]
    }
  );
};
BookCoverPage.displayName = "BookCoverPage";
var BookTableOfContents = ({
  parts,
  currentChapterId,
  direction,
  className
}) => {
  const { t } = useTranslate();
  return /* @__PURE__ */ jsxs(
    VStack,
    {
      gap: "lg",
      className: cn("p-8 max-w-2xl mx-auto", className),
      style: { direction },
      children: [
        /* @__PURE__ */ jsx(Typography, { variant: "h1", className: "text-3xl font-bold text-center mb-4", children: t("book.tableOfContents") }),
        parts.map((part, partIdx) => /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
          /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", children: [
            /* @__PURE__ */ jsx(Badge, { variant: "default", size: "sm", children: t("book.partNumber", { number: String(partIdx + 1) }) }),
            /* @__PURE__ */ jsx(Typography, { variant: "h3", className: "font-semibold", children: part.title })
          ] }),
          /* @__PURE__ */ jsx(VStack, { gap: "xs", className: direction === "rtl" ? "pr-6" : "pl-6", children: part.chapters.map((chapter) => {
            const isCurrent = chapter.id === currentChapterId;
            return /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                action: "BOOK_NAVIGATE",
                actionPayload: { chapterId: chapter.id },
                className: cn(
                  "justify-start text-left w-full",
                  direction === "rtl" && "text-right",
                  isCurrent && "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                ),
                children: /* @__PURE__ */ jsx(Box, { className: "truncate", children: /* @__PURE__ */ jsx(Typography, { variant: "body", children: chapter.title }) })
              },
              chapter.id
            );
          }) })
        ] }, partIdx))
      ]
    }
  );
};
BookTableOfContents.displayName = "BookTableOfContents";
var BookChapterView = ({
  chapter,
  direction,
  className
}) => {
  const { t: _t } = useTranslate();
  return /* @__PURE__ */ jsxs(
    VStack,
    {
      gap: "lg",
      className: cn("px-6 py-8 max-w-4xl mx-auto w-full", className),
      style: { direction },
      children: [
        /* @__PURE__ */ jsx(Typography, { variant: "h1", className: "text-3xl font-bold", children: chapter.title }),
        /* @__PURE__ */ jsx(Divider, {}),
        !!chapter.orbitalSchema && /* @__PURE__ */ jsx(ScaledDiagram, { children: /* @__PURE__ */ jsx(
          JazariStateMachine,
          {
            schema: chapter.orbitalSchema,
            direction
          }
        ) }),
        /* @__PURE__ */ jsx(ContentRenderer, { content: chapter.content, direction })
      ]
    }
  );
};
BookChapterView.displayName = "BookChapterView";
var BookNavBar = ({
  currentPage,
  totalPages,
  chapterTitle,
  direction,
  className
}) => {
  const { t } = useTranslate();
  const isRtl = direction === "rtl";
  const progress = totalPages > 1 ? currentPage / (totalPages - 1) * 100 : 0;
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;
  return /* @__PURE__ */ jsx(
    Box,
    {
      className: cn(
        "sticky bottom-0 bg-[var(--color-background)] border-t border-[var(--color-border)] print:hidden z-10",
        className
      ),
      style: { direction },
      children: /* @__PURE__ */ jsxs(HStack, { justify: "between", align: "center", className: "px-4 py-2", children: [
        /* @__PURE__ */ jsxs(HStack, { gap: "xs", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              action: "BOOK_SHOW_TOC",
              "aria-label": t("book.tableOfContents"),
              children: /* @__PURE__ */ jsx(List$1, { size: 18 })
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              action: "BOOK_PRINT",
              "aria-label": t("book.print"),
              children: /* @__PURE__ */ jsx(Printer, { size: 18 })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(Box, { className: "flex-1 mx-4 max-w-md", children: [
          chapterTitle && /* @__PURE__ */ jsx(
            Typography,
            {
              variant: "caption",
              className: "text-center block truncate text-[var(--color-muted-foreground)]",
              children: chapterTitle
            }
          ),
          /* @__PURE__ */ jsx(ProgressBar, { value: progress, size: "sm", variant: "primary" })
        ] }),
        /* @__PURE__ */ jsxs(HStack, { gap: "xs", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              action: "BOOK_PAGE_PREV",
              actionPayload: { pageIndex: currentPage },
              disabled: currentPage <= 0,
              "aria-label": t("book.previousPage"),
              children: /* @__PURE__ */ jsx(PrevIcon, { size: 18 })
            }
          ),
          /* @__PURE__ */ jsxs(Typography, { variant: "caption", className: "min-w-[3rem] text-center", children: [
            currentPage + 1,
            " / ",
            totalPages
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              action: "BOOK_PAGE_NEXT",
              actionPayload: { pageIndex: currentPage },
              disabled: currentPage >= totalPages - 1,
              "aria-label": t("book.nextPage"),
              children: /* @__PURE__ */ jsx(NextIcon, { size: 18 })
            }
          )
        ] })
      ] })
    }
  );
};
BookNavBar.displayName = "BookNavBar";

// components/organisms/book/types.ts
var IDENTITY_BOOK_FIELDS = {
  title: "title",
  subtitle: "subtitle",
  author: "author",
  coverImageUrl: "coverImageUrl",
  direction: "direction",
  parts: "parts",
  partTitle: "title",
  chapters: "chapters",
  chapterId: "id",
  chapterTitle: "title",
  chapterContent: "content",
  chapterOrbitalSchema: "orbitalSchema"
};
var AR_BOOK_FIELDS = {
  title: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646",
  subtitle: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646_\u0627\u0644\u0641\u0631\u0639\u064A",
  author: "\u0627\u0644\u0645\u0624\u0644\u0641",
  coverImageUrl: "\u0635\u0648\u0631\u0629_\u0627\u0644\u063A\u0644\u0627\u0641",
  direction: "\u0627\u0644\u0627\u062A\u062C\u0627\u0647",
  parts: "\u0627\u0644\u0623\u062C\u0632\u0627\u0621",
  partTitle: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646",
  chapters: "\u0627\u0644\u0641\u0635\u0648\u0644",
  chapterId: "\u0627\u0644\u0645\u0639\u0631\u0641",
  chapterTitle: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646",
  chapterContent: "\u0627\u0644\u0645\u062D\u062A\u0648\u0649",
  chapterOrbitalSchema: "\u0627\u0644\u0645\u062E\u0637\u0637_\u0627\u0644\u0645\u062F\u0627\u0631\u064A"
};
var FIELD_MAP_REGISTRY = {
  ar: AR_BOOK_FIELDS
};
function resolveFieldMap(fieldMap) {
  if (!fieldMap) return IDENTITY_BOOK_FIELDS;
  if (typeof fieldMap === "string") return FIELD_MAP_REGISTRY[fieldMap] ?? IDENTITY_BOOK_FIELDS;
  return fieldMap;
}
function get(obj, key) {
  return obj[key];
}
function mapBookData(raw, fields = IDENTITY_BOOK_FIELDS) {
  const rawParts = get(raw, fields.parts) ?? [];
  return {
    title: get(raw, fields.title) ?? "",
    subtitle: get(raw, fields.subtitle),
    author: get(raw, fields.author),
    coverImageUrl: get(raw, fields.coverImageUrl),
    direction: get(raw, fields.direction) ?? void 0,
    parts: rawParts.map((part) => {
      const rawChapters = get(part, fields.chapters) ?? [];
      return {
        title: get(part, fields.partTitle) ?? "",
        chapters: rawChapters.map((ch) => ({
          id: get(ch, fields.chapterId) ?? "",
          title: get(ch, fields.chapterTitle) ?? "",
          content: get(ch, fields.chapterContent) ?? "",
          orbitalSchema: get(ch, fields.chapterOrbitalSchema)
        }))
      };
    })
  };
}
function flattenChapters(book) {
  return book.parts.flatMap((part) => part.chapters);
}
var PRINT_STYLES = `
@media print {
  .book-viewer-page {
    overflow: visible !important;
    height: auto !important;
  }
}
@media (prefers-reduced-motion: reduce) {
  .book-viewer-page { transition: none !important; }
}
`;
var BookViewer = ({
  data,
  initialPage = 0,
  fieldMap,
  className
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const resolvedFieldMap = useMemo(() => resolveFieldMap(fieldMap), [fieldMap]);
  const book = useMemo(() => {
    const raw = data?.[0];
    if (!raw) return null;
    return mapBookData(raw, resolvedFieldMap);
  }, [data, resolvedFieldMap]);
  const direction = book?.direction ?? "ltr";
  const chapters = useMemo(() => book ? flattenChapters(book) : [], [book]);
  const totalPages = 2 + chapters.length;
  const navigateTo = useCallback(
    (page) => {
      const clamped = Math.max(0, Math.min(page, totalPages - 1));
      setCurrentPage(clamped);
      const chapterId = clamped >= 2 ? chapters[clamped - 2]?.id : void 0;
      eventBus.emit("UI:BOOK_PAGE_CHANGE", { pageIndex: clamped, chapterId });
    },
    [totalPages, chapters, eventBus]
  );
  useEffect(() => {
    const unsubs = [
      eventBus.on("UI:BOOK_START", () => navigateTo(1)),
      eventBus.on("UI:BOOK_SHOW_TOC", () => navigateTo(1)),
      eventBus.on("UI:BOOK_PAGE_PREV", () => navigateTo(currentPage - 1)),
      eventBus.on("UI:BOOK_PAGE_NEXT", () => navigateTo(currentPage + 1)),
      eventBus.on("UI:BOOK_PRINT", () => window.print()),
      eventBus.on("UI:BOOK_NAVIGATE", (event) => {
        const chapterId = event.payload?.chapterId;
        const idx = chapters.findIndex((ch) => ch.id === chapterId);
        if (idx >= 0) navigateTo(idx + 2);
      })
    ];
    return () => unsubs.forEach((fn) => fn());
  }, [eventBus, currentPage, navigateTo, chapters]);
  useEffect(() => {
    const id = "book-viewer-print-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = PRINT_STYLES;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);
  const currentChapterId = currentPage >= 2 ? chapters[currentPage - 2]?.id : void 0;
  const currentChapterTitle = currentPage >= 2 ? chapters[currentPage - 2]?.title : void 0;
  if (!book) return /* @__PURE__ */ jsx(EmptyState, { message: t("book.noData") });
  return /* @__PURE__ */ jsxs(VStack, { className: cn("relative h-full overflow-hidden bg-[var(--color-background)]", className), children: [
    /* @__PURE__ */ jsxs(
      Box,
      {
        className: "flex-1 overflow-y-auto overflow-x-hidden book-viewer-page",
        style: { direction },
        children: [
          /* @__PURE__ */ jsxs(Box, { className: "hidden print:block", children: [
            /* @__PURE__ */ jsx(
              BookCoverPage,
              {
                title: book.title,
                subtitle: book.subtitle,
                author: book.author,
                coverImageUrl: book.coverImageUrl,
                direction
              }
            ),
            /* @__PURE__ */ jsx(
              BookTableOfContents,
              {
                parts: book.parts,
                direction
              }
            ),
            chapters.map((chapter) => /* @__PURE__ */ jsx(
              BookChapterView,
              {
                chapter,
                direction
              },
              chapter.id
            ))
          ] }),
          /* @__PURE__ */ jsxs(Box, { className: "print:hidden", children: [
            currentPage === 0 && /* @__PURE__ */ jsx(
              BookCoverPage,
              {
                title: book.title,
                subtitle: book.subtitle,
                author: book.author,
                coverImageUrl: book.coverImageUrl,
                direction
              }
            ),
            currentPage === 1 && /* @__PURE__ */ jsx(
              BookTableOfContents,
              {
                parts: book.parts,
                currentChapterId,
                direction
              }
            ),
            currentPage >= 2 && chapters[currentPage - 2] && /* @__PURE__ */ jsx(
              BookChapterView,
              {
                chapter: chapters[currentPage - 2],
                direction
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      BookNavBar,
      {
        currentPage,
        totalPages,
        chapterTitle: currentPage === 0 ? book.title : currentPage === 1 ? t("book.tableOfContents") : currentChapterTitle,
        direction
      }
    )
  ] });
};
BookViewer.displayName = "BookViewer";
var SplitPane = ({
  direction = "horizontal",
  ratio: initialRatio = 50,
  minSize = 100,
  resizable = true,
  left,
  right,
  className,
  leftClassName,
  rightClassName
}) => {
  const [ratio, setRatio] = useState(initialRatio);
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const handleMouseDown = useCallback(
    (e) => {
      if (!resizable) return;
      e.preventDefault();
      isDragging.current = true;
      const handleMouseMove = (e2) => {
        if (!isDragging.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        let newRatio;
        if (direction === "horizontal") {
          const x = e2.clientX - rect.left;
          newRatio = x / rect.width * 100;
        } else {
          const y = e2.clientY - rect.top;
          newRatio = y / rect.height * 100;
        }
        const minRatio = minSize / (direction === "horizontal" ? rect.width : rect.height) * 100;
        const maxRatio = 100 - minRatio;
        newRatio = Math.max(minRatio, Math.min(maxRatio, newRatio));
        setRatio(newRatio);
      };
      const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [direction, minSize, resizable]
  );
  const isHorizontal = direction === "horizontal";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: containerRef,
      className: cn(
        "flex w-full h-full",
        isHorizontal ? "flex-row" : "flex-col",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn("overflow-auto", leftClassName),
            style: {
              [isHorizontal ? "width" : "height"]: `${ratio}%`,
              flexShrink: 0
            },
            children: left
          }
        ),
        resizable && /* @__PURE__ */ jsx(
          "div",
          {
            onMouseDown: handleMouseDown,
            className: cn(
              "flex-shrink-0 bg-[var(--color-border)] transition-colors",
              isHorizontal ? "w-1 cursor-col-resize hover:w-1.5 hover:bg-[var(--color-muted-foreground)]" : "h-1 cursor-row-resize hover:h-1.5 hover:bg-[var(--color-muted-foreground)]"
            )
          }
        ),
        /* @__PURE__ */ jsx("div", { className: cn("flex-1 overflow-auto", rightClassName), children: right })
      ]
    }
  );
};
SplitPane.displayName = "SplitPane";
var gapStyles2 = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6"
};
var columnStyles = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4"
};
var colSpanStyles = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4"
};
var rowSpanStyles = {
  1: "row-span-1",
  2: "row-span-2"
};
var DashboardGrid = ({
  columns = 3,
  gap = "md",
  cells,
  className
}) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "grid w-full",
        columnStyles[columns],
        gapStyles2[gap],
        className
      ),
      children: cells.map((cell) => /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(
            "border-2 border-[var(--color-border)] bg-[var(--color-card)]",
            colSpanStyles[cell.colSpan || 1],
            rowSpanStyles[cell.rowSpan || 1]
          ),
          children: cell.content
        },
        cell.id
      ))
    }
  );
};
DashboardGrid.displayName = "DashboardGrid";
var TabbedContainer = ({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  position = "top",
  className
}) => {
  const safeTabs = tabs || [];
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab || safeTabs[0]?.id || ""
  );
  const activeTab = controlledActiveTab !== void 0 ? controlledActiveTab : internalActiveTab;
  const handleTabChange = useCallback(
    (tabId) => {
      if (controlledActiveTab === void 0) {
        setInternalActiveTab(tabId);
      }
      onTabChange?.(tabId);
    },
    [controlledActiveTab, onTabChange]
  );
  const activeTabDef = safeTabs.find((tab) => tab.id === activeTab);
  const activeContent = activeTabDef?.content || (activeTabDef?.sectionId ? /* @__PURE__ */ jsxs("div", { className: "p-4 text-[var(--color-muted-foreground)]", children: [
    "Section: ",
    activeTabDef.sectionId
  ] }) : null);
  const isVertical = position === "left";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex w-full h-full",
        isVertical ? "flex-row" : "flex-col",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            role: "tablist",
            className: cn(
              "flex flex-shrink-0",
              isVertical ? "flex-col border-r-2 border-[var(--color-border)]" : "flex-row border-b-2 border-[var(--color-border)]"
            ),
            children: safeTabs.map((tab) => {
              const isActive = tab.id === activeTab;
              const isDisabled = tab.disabled;
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  role: "tab",
                  "aria-selected": isActive,
                  "aria-controls": `tabpanel-${tab.id}`,
                  "aria-disabled": isDisabled,
                  disabled: isDisabled,
                  onClick: () => !isDisabled && handleTabChange(tab.id),
                  className: cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    isActive ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]" : "bg-[var(--color-card)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]",
                    isVertical ? "justify-start" : "justify-center"
                  ),
                  children: [
                    /* @__PURE__ */ jsx(
                      Typography,
                      {
                        variant: "small",
                        weight: isActive ? "bold" : "normal",
                        color: "inherit",
                        children: tab.label
                      }
                    ),
                    tab.badge !== void 0 && /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: cn(
                          "px-1.5 py-0.5 text-xs font-medium rounded",
                          isActive ? "bg-[var(--color-primary-foreground)] text-[var(--color-primary)]" : "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                        ),
                        children: tab.badge
                      }
                    )
                  ]
                },
                tab.id
              );
            })
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            role: "tabpanel",
            id: `tabpanel-${activeTab}`,
            "aria-labelledby": `tab-${activeTab}`,
            className: "flex-1 overflow-auto",
            children: activeContent
          }
        )
      ]
    }
  );
};
TabbedContainer.displayName = "TabbedContainer";
function useImageCache(urls) {
  const cacheRef = useRef(/* @__PURE__ */ new Map());
  const loadingRef = useRef(/* @__PURE__ */ new Set());
  const [pendingCount, setPendingCount] = useState(0);
  useEffect(() => {
    const cache = cacheRef.current;
    const loading = loadingRef.current;
    let cancelled = false;
    const newUrls = urls.filter((url) => url && !cache.has(url) && !loading.has(url));
    if (newUrls.length === 0) return;
    setPendingCount((prev) => prev + newUrls.length);
    for (const url of newUrls) {
      loading.add(url);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (cancelled) return;
        cache.set(url, img);
        loading.delete(url);
        setPendingCount((prev) => Math.max(0, prev - 1));
      };
      img.onerror = () => {
        if (cancelled) return;
        loading.delete(url);
        setPendingCount((prev) => Math.max(0, prev - 1));
      };
      img.src = url;
    }
    return () => {
      cancelled = true;
    };
  }, [urls.join(",")]);
  const getImage = useCallback((url) => {
    return cacheRef.current.get(url);
  }, []);
  return {
    getImage,
    isLoaded: pendingCount === 0,
    pendingCount
  };
}
function useCamera() {
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });
  const targetCameraRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const handleMouseDown = useCallback((e) => {
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    if (e.button === 1 || e.button === 2) {
      e.preventDefault();
    }
  }, []);
  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);
  const handleMouseMove = useCallback((e, drawFn) => {
    if (!isDraggingRef.current) return false;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    dragDistanceRef.current += Math.abs(dx) + Math.abs(dy);
    cameraRef.current.x -= dx;
    cameraRef.current.y -= dy;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    targetCameraRef.current = null;
    drawFn?.();
    return dragDistanceRef.current > 5;
  }, []);
  const handleMouseLeave = useCallback(() => {
    isDraggingRef.current = false;
  }, []);
  const handleWheel = useCallback((e, drawFn) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    cameraRef.current.zoom = Math.max(0.5, Math.min(3, cameraRef.current.zoom * zoomDelta));
    drawFn?.();
  }, []);
  const screenToWorld = useCallback((clientX, clientY, canvas, viewportSize) => {
    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    const cam = cameraRef.current;
    const worldX = (screenX - viewportSize.width / 2) / cam.zoom + viewportSize.width / 2 + cam.x;
    const worldY = (screenY - viewportSize.height / 2) / cam.zoom + viewportSize.height / 2 + cam.y;
    return { x: worldX, y: worldY };
  }, []);
  const lerpToTarget = useCallback((t = 0.08) => {
    if (!targetCameraRef.current) return false;
    const cam = cameraRef.current;
    cam.x += (targetCameraRef.current.x - cam.x) * t;
    cam.y += (targetCameraRef.current.y - cam.y) * t;
    if (Math.abs(cam.x - targetCameraRef.current.x) < 0.5 && Math.abs(cam.y - targetCameraRef.current.y) < 0.5) {
      cam.x = targetCameraRef.current.x;
      cam.y = targetCameraRef.current.y;
      targetCameraRef.current = null;
    }
    return true;
  }, []);
  return {
    cameraRef,
    targetCameraRef,
    isDragging: () => isDraggingRef.current,
    dragDistance: () => dragDistanceRef.current,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleMouseLeave,
    handleWheel,
    screenToWorld,
    lerpToTarget
  };
}

// components/organisms/game/utils/isometric.ts
var TILE_WIDTH = 256;
var TILE_HEIGHT = 512;
var FLOOR_HEIGHT = 128;
var DIAMOND_TOP_Y = 374;
var FEATURE_COLORS = {
  goldMine: "#fbbf24",
  resonanceCrystal: "#a78bfa",
  traitCache: "#60a5fa",
  salvageYard: "#6b7280",
  portal: "#c084fc",
  castle: "#f59e0b",
  mountain: "#78716c",
  default: "#9ca3af"
};
function isoToScreen(tileX, tileY, scale, baseOffsetX) {
  const scaledTileWidth = TILE_WIDTH * scale;
  const scaledFloorHeight = FLOOR_HEIGHT * scale;
  const screenX = (tileX - tileY) * (scaledTileWidth / 2) + baseOffsetX;
  const screenY = (tileX + tileY) * (scaledFloorHeight / 2);
  return { x: screenX, y: screenY };
}
function screenToIso(screenX, screenY, scale, baseOffsetX) {
  const scaledTileWidth = TILE_WIDTH * scale;
  const scaledFloorHeight = FLOOR_HEIGHT * scale;
  const adjustedX = screenX - baseOffsetX;
  const tileX = (adjustedX / (scaledTileWidth / 2) + screenY / (scaledFloorHeight / 2)) / 2;
  const tileY = (screenY / (scaledFloorHeight / 2) - adjustedX / (scaledTileWidth / 2)) / 2;
  return { x: Math.round(tileX), y: Math.round(tileY) };
}
function IsometricCanvas({
  // Closed-circuit
  className,
  isLoading = false,
  error = null,
  entity,
  // Grid data
  tiles: tilesProp = [],
  units = [],
  features = [],
  // Interaction state
  selectedUnitId = null,
  validMoves = [],
  attackTargets = [],
  hoveredTile = null,
  // Event handlers
  onTileClick,
  onUnitClick,
  onTileHover,
  onTileLeave,
  // Declarative event props
  tileClickEvent,
  unitClickEvent,
  tileHoverEvent,
  tileLeaveEvent,
  // Rendering options
  scale = 0.4,
  debug = false,
  backgroundImage,
  showMinimap = true,
  enableCamera = true,
  unitScale = 1,
  // Asset resolution
  getTerrainSprite,
  getFeatureSprite,
  getUnitSprite,
  resolveUnitFrame,
  effectSpriteUrls = [],
  onDrawEffects,
  hasActiveEffects: hasActiveEffects2 = false,
  // Tuning
  diamondTopY: diamondTopYProp,
  // Remote asset loading
  assetBaseUrl,
  assetManifest
}) {
  const eventBus = useEventBus();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const minimapRef = useRef(null);
  const animTimeRef = useRef(0);
  const rafIdRef = useRef(0);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setViewportSize({
          width: entry.contentRect.width || 800,
          height: entry.contentRect.height || 600
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const sortedTiles = useMemo(() => {
    const tiles = [...tilesProp];
    tiles.sort((a, b) => {
      const depthA = a.x + a.y;
      const depthB = b.x + b.y;
      return depthA !== depthB ? depthA - depthB : a.y - b.y;
    });
    return tiles;
  }, [tilesProp]);
  const gridWidth = useMemo(() => {
    if (sortedTiles.length === 0) return 0;
    return Math.max(...sortedTiles.map((t) => t.x)) + 1;
  }, [sortedTiles]);
  const gridHeight = useMemo(() => {
    if (sortedTiles.length === 0) return 0;
    return Math.max(...sortedTiles.map((t) => t.y)) + 1;
  }, [sortedTiles]);
  const scaledTileWidth = TILE_WIDTH * scale;
  const scaledTileHeight = TILE_HEIGHT * scale;
  const scaledFloorHeight = FLOOR_HEIGHT * scale;
  const effectiveDiamondTopY = diamondTopYProp ?? DIAMOND_TOP_Y;
  const scaledDiamondTopY = effectiveDiamondTopY * scale;
  const baseOffsetX = useMemo(() => {
    return (gridHeight - 1) * (scaledTileWidth / 2);
  }, [gridHeight, scaledTileWidth]);
  const validMoveSet = useMemo(() => {
    return new Set(validMoves.map((p2) => `${p2.x},${p2.y}`));
  }, [validMoves]);
  const attackTargetSet = useMemo(() => {
    return new Set(attackTargets.map((p2) => `${p2.x},${p2.y}`));
  }, [attackTargets]);
  const resolveManifestUrl = useCallback((relativePath) => {
    if (!relativePath) return void 0;
    if (assetBaseUrl) return `${assetBaseUrl.replace(/\/$/, "")}${relativePath.startsWith("/") ? "" : "/"}${relativePath}`;
    return relativePath;
  }, [assetBaseUrl]);
  const spriteUrls = useMemo(() => {
    const urls = [];
    for (const tile of sortedTiles) {
      if (tile.terrainSprite) urls.push(tile.terrainSprite);
      else if (getTerrainSprite) {
        const url = getTerrainSprite(tile.terrain ?? "");
        if (url) urls.push(url);
      } else {
        const url = resolveManifestUrl(assetManifest?.terrains?.[tile.terrain ?? ""]);
        if (url) urls.push(url);
      }
    }
    for (const feature of features) {
      if (feature.sprite) urls.push(feature.sprite);
      else if (getFeatureSprite) {
        const url = getFeatureSprite(feature.type);
        if (url) urls.push(url);
      } else {
        const url = resolveManifestUrl(assetManifest?.features?.[feature.type]);
        if (url) urls.push(url);
      }
    }
    for (const unit of units) {
      if (unit.sprite) urls.push(unit.sprite);
      else if (getUnitSprite) {
        const url = getUnitSprite(unit);
        if (url) urls.push(url);
      } else if (unit.unitType) {
        const url = resolveManifestUrl(assetManifest?.units?.[unit.unitType]);
        if (url) urls.push(url);
      }
    }
    if (assetManifest?.effects) {
      for (const path of Object.values(assetManifest.effects)) {
        const url = resolveManifestUrl(path);
        if (url) urls.push(url);
      }
    }
    urls.push(...effectSpriteUrls);
    if (backgroundImage) urls.push(backgroundImage);
    return [...new Set(urls.filter(Boolean))];
  }, [sortedTiles, features, units, getTerrainSprite, getFeatureSprite, getUnitSprite, effectSpriteUrls, backgroundImage, assetManifest, resolveManifestUrl]);
  const { getImage } = useImageCache(spriteUrls);
  const {
    cameraRef,
    targetCameraRef,
    isDragging,
    dragDistance,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleMouseLeave,
    handleWheel,
    screenToWorld,
    lerpToTarget
  } = useCamera();
  const resolveTerrainSpriteUrl = useCallback((tile) => {
    return tile.terrainSprite || getTerrainSprite?.(tile.terrain ?? "") || resolveManifestUrl(assetManifest?.terrains?.[tile.terrain ?? ""]);
  }, [getTerrainSprite, assetManifest, resolveManifestUrl]);
  const resolveFeatureSpriteUrl = useCallback((featureType) => {
    return getFeatureSprite?.(featureType) || resolveManifestUrl(assetManifest?.features?.[featureType]);
  }, [getFeatureSprite, assetManifest, resolveManifestUrl]);
  const resolveUnitSpriteUrl = useCallback((unit) => {
    return unit.sprite || getUnitSprite?.(unit) || (unit.unitType ? resolveManifestUrl(assetManifest?.units?.[unit.unitType]) : void 0);
  }, [getUnitSprite, assetManifest, resolveManifestUrl]);
  const drawMinimap = useCallback(() => {
    if (!showMinimap) return;
    const miniCanvas = minimapRef.current;
    if (!miniCanvas || sortedTiles.length === 0) return;
    const mCtx = miniCanvas.getContext("2d");
    if (!mCtx) return;
    const mW = 150;
    const mH = 100;
    miniCanvas.width = mW;
    miniCanvas.height = mH;
    mCtx.clearRect(0, 0, mW, mH);
    const allScreenPos = sortedTiles.map((t) => isoToScreen(t.x, t.y, scale, baseOffsetX));
    const minX = Math.min(...allScreenPos.map((p2) => p2.x));
    const maxX = Math.max(...allScreenPos.map((p2) => p2.x + scaledTileWidth));
    const minY = Math.min(...allScreenPos.map((p2) => p2.y));
    const maxY = Math.max(...allScreenPos.map((p2) => p2.y + scaledTileHeight));
    const worldW = maxX - minX;
    const worldH = maxY - minY;
    const scaleM = Math.min(mW / worldW, mH / worldH) * 0.9;
    const offsetMx = (mW - worldW * scaleM) / 2;
    const offsetMy = (mH - worldH * scaleM) / 2;
    for (const tile of sortedTiles) {
      const pos = isoToScreen(tile.x, tile.y, scale, baseOffsetX);
      const mx = (pos.x - minX) * scaleM + offsetMx;
      const my = (pos.y - minY) * scaleM + offsetMy;
      const mTileW = scaledTileWidth * scaleM;
      const mFloorH = scaledFloorHeight * scaleM;
      mCtx.fillStyle = tile.terrain === "water" ? "#3b82f6" : tile.terrain === "mountain" ? "#78716c" : "#4ade80";
      mCtx.beginPath();
      mCtx.moveTo(mx + mTileW / 2, my);
      mCtx.lineTo(mx + mTileW, my + mFloorH / 2);
      mCtx.lineTo(mx + mTileW / 2, my + mFloorH);
      mCtx.lineTo(mx, my + mFloorH / 2);
      mCtx.closePath();
      mCtx.fill();
    }
    for (const unit of units) {
      if (!unit.position) continue;
      const pos = isoToScreen(unit.position.x, unit.position.y, scale, baseOffsetX);
      const mx = (pos.x + scaledTileWidth / 2 - minX) * scaleM + offsetMx;
      const my = (pos.y + scaledTileHeight / 2 - minY) * scaleM + offsetMy;
      mCtx.fillStyle = unit.team === "player" ? "#60a5fa" : unit.team === "enemy" ? "#f87171" : "#9ca3af";
      mCtx.beginPath();
      mCtx.arc(mx, my, 3, 0, Math.PI * 2);
      mCtx.fill();
    }
    const cam = cameraRef.current;
    const vLeft = (cam.x - minX) * scaleM + offsetMx;
    const vTop = (cam.y - minY) * scaleM + offsetMy;
    const vW = viewportSize.width / cam.zoom * scaleM;
    const vH = viewportSize.height / cam.zoom * scaleM;
    mCtx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    mCtx.lineWidth = 1;
    mCtx.strokeRect(vLeft, vTop, vW, vH);
  }, [showMinimap, sortedTiles, units, scale, baseOffsetX, scaledTileWidth, scaledTileHeight, scaledFloorHeight, viewportSize, cameraRef]);
  const draw = useCallback((animTime) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = viewportSize.width * dpr;
    canvas.height = viewportSize.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, viewportSize.width, viewportSize.height);
    if (backgroundImage) {
      const bgImg = getImage(backgroundImage);
      if (bgImg) {
        const cam2 = cameraRef.current;
        const patW = bgImg.naturalWidth;
        const patH = bgImg.naturalHeight;
        const startX = -(cam2.x % patW + patW) % patW;
        const startY = -(cam2.y % patH + patH) % patH;
        for (let y = startY - patH; y < viewportSize.height; y += patH) {
          for (let x = startX - patW; x < viewportSize.width; x += patW) {
            ctx.drawImage(bgImg, x, y);
          }
        }
      }
    } else {
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, viewportSize.width, viewportSize.height);
    }
    if (sortedTiles.length === 0) return;
    ctx.save();
    const cam = cameraRef.current;
    ctx.translate(viewportSize.width / 2, viewportSize.height / 2);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-viewportSize.width / 2 - cam.x, -viewportSize.height / 2 - cam.y);
    const visLeft = cam.x - viewportSize.width / cam.zoom;
    const visRight = cam.x + viewportSize.width * 2 / cam.zoom;
    const visTop = cam.y - viewportSize.height / cam.zoom;
    const visBottom = cam.y + viewportSize.height * 2 / cam.zoom;
    for (const tile of sortedTiles) {
      const pos = isoToScreen(tile.x, tile.y, scale, baseOffsetX);
      if (pos.x + scaledTileWidth < visLeft || pos.x > visRight || pos.y + scaledTileHeight < visTop || pos.y > visBottom) {
        continue;
      }
      const spriteUrl = resolveTerrainSpriteUrl(tile);
      const img = spriteUrl ? getImage(spriteUrl) : null;
      if (img) {
        ctx.drawImage(img, pos.x, pos.y, scaledTileWidth, scaledTileHeight);
      } else {
        const centerX = pos.x + scaledTileWidth / 2;
        const topY = pos.y + scaledDiamondTopY;
        ctx.fillStyle = tile.terrain === "water" ? "#3b82f6" : tile.terrain === "mountain" ? "#78716c" : tile.terrain === "stone" ? "#9ca3af" : "#4ade80";
        ctx.beginPath();
        ctx.moveTo(centerX, topY);
        ctx.lineTo(pos.x + scaledTileWidth, topY + scaledFloorHeight / 2);
        ctx.lineTo(centerX, topY + scaledFloorHeight);
        ctx.lineTo(pos.x, topY + scaledFloorHeight / 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      if (hoveredTile && hoveredTile.x === tile.x && hoveredTile.y === tile.y) {
        const centerX = pos.x + scaledTileWidth / 2;
        const topY = pos.y + scaledDiamondTopY;
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.beginPath();
        ctx.moveTo(centerX, topY);
        ctx.lineTo(pos.x + scaledTileWidth, topY + scaledFloorHeight / 2);
        ctx.lineTo(centerX, topY + scaledFloorHeight);
        ctx.lineTo(pos.x, topY + scaledFloorHeight / 2);
        ctx.closePath();
        ctx.fill();
      }
      const tileKey = `${tile.x},${tile.y}`;
      if (validMoveSet.has(tileKey)) {
        const centerX = pos.x + scaledTileWidth / 2;
        const topY = pos.y + scaledDiamondTopY;
        const pulse = 0.15 + 0.1 * Math.sin(animTime * 4e-3);
        ctx.fillStyle = `rgba(74, 222, 128, ${pulse})`;
        ctx.beginPath();
        ctx.moveTo(centerX, topY);
        ctx.lineTo(pos.x + scaledTileWidth, topY + scaledFloorHeight / 2);
        ctx.lineTo(centerX, topY + scaledFloorHeight);
        ctx.lineTo(pos.x, topY + scaledFloorHeight / 2);
        ctx.closePath();
        ctx.fill();
      }
      if (attackTargetSet.has(tileKey)) {
        const centerX = pos.x + scaledTileWidth / 2;
        const topY = pos.y + scaledDiamondTopY;
        const pulse = 0.2 + 0.15 * Math.sin(animTime * 5e-3);
        ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
        ctx.beginPath();
        ctx.moveTo(centerX, topY);
        ctx.lineTo(pos.x + scaledTileWidth, topY + scaledFloorHeight / 2);
        ctx.lineTo(centerX, topY + scaledFloorHeight);
        ctx.lineTo(pos.x, topY + scaledFloorHeight / 2);
        ctx.closePath();
        ctx.fill();
      }
      if (debug) {
        const centerX = pos.x + scaledTileWidth / 2;
        const centerY = pos.y + scaledFloorHeight / 2 + scaledDiamondTopY;
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.font = `${12 * scale * 2}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(`${tile.x},${tile.y}`, centerX, centerY + 4);
      }
    }
    const sortedFeatures = [...features].sort((a, b) => {
      const depthA = a.x + a.y;
      const depthB = b.x + b.y;
      return depthA !== depthB ? depthA - depthB : a.y - b.y;
    });
    for (const feature of sortedFeatures) {
      const pos = isoToScreen(feature.x, feature.y, scale, baseOffsetX);
      if (pos.x + scaledTileWidth < visLeft || pos.x > visRight || pos.y + scaledTileHeight < visTop || pos.y > visBottom) {
        continue;
      }
      const spriteUrl = feature.sprite || resolveFeatureSpriteUrl(feature.type);
      const img = spriteUrl ? getImage(spriteUrl) : null;
      const centerX = pos.x + scaledTileWidth / 2;
      const featureGroundY = pos.y + scaledDiamondTopY + scaledFloorHeight * 0.5;
      const isCastle = feature.type === "castle";
      const featureDrawH = isCastle ? scaledFloorHeight * 3.5 : scaledFloorHeight * 1.6;
      const maxFeatureW = isCastle ? scaledTileWidth * 1.8 : scaledTileWidth * 0.7;
      if (img) {
        const ar = img.naturalWidth / img.naturalHeight;
        let drawH = featureDrawH;
        let drawW = featureDrawH * ar;
        if (drawW > maxFeatureW) {
          drawW = maxFeatureW;
          drawH = maxFeatureW / ar;
        }
        const drawX = centerX - drawW / 2;
        const drawY = featureGroundY - drawH;
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      } else {
        const color = FEATURE_COLORS[feature.type] || FEATURE_COLORS.default;
        ctx.beginPath();
        ctx.arc(centerX, featureGroundY - 8 * scale, 16 * scale, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    const unitsWithPosition = units.filter((u) => !!u.position);
    const sortedUnits = [...unitsWithPosition].sort((a, b) => {
      const depthA = a.position.x + a.position.y;
      const depthB = b.position.x + b.position.y;
      return depthA !== depthB ? depthA - depthB : a.position.y - b.position.y;
    });
    for (const unit of sortedUnits) {
      const pos = isoToScreen(unit.position.x, unit.position.y, scale, baseOffsetX);
      if (pos.x + scaledTileWidth < visLeft || pos.x > visRight || pos.y + scaledTileHeight < visTop || pos.y > visBottom) {
        continue;
      }
      const isSelected = unit.id === selectedUnitId;
      const centerX = pos.x + scaledTileWidth / 2;
      const groundY = pos.y + scaledDiamondTopY + scaledFloorHeight * 0.5;
      const breatheOffset = 0.8 * scale * (1 + Math.sin(animTime * 2e-3 + (unit.position.x * 3.7 + unit.position.y * 5.3)));
      const unitSpriteUrl = resolveUnitSpriteUrl(unit);
      const img = unitSpriteUrl ? getImage(unitSpriteUrl) : null;
      const unitDrawH = scaledFloorHeight * 1.5 * unitScale;
      const maxUnitW = scaledTileWidth * 0.6 * unitScale;
      const ar = img ? img.naturalWidth / img.naturalHeight : 0.5;
      let drawH = unitDrawH;
      let drawW = unitDrawH * ar;
      if (drawW > maxUnitW) {
        drawW = maxUnitW;
        drawH = maxUnitW / ar;
      }
      if (unit.previousPosition && (unit.previousPosition.x !== unit.position.x || unit.previousPosition.y !== unit.position.y)) {
        const ghostPos = isoToScreen(unit.previousPosition.x, unit.previousPosition.y, scale, baseOffsetX);
        const ghostCenterX = ghostPos.x + scaledTileWidth / 2;
        const ghostGroundY = ghostPos.y + scaledDiamondTopY + scaledFloorHeight * 0.5;
        ctx.save();
        ctx.globalAlpha = 0.25;
        if (img) {
          ctx.drawImage(img, ghostCenterX - drawW / 2, ghostGroundY - drawH, drawW, drawH);
        } else {
          const color = unit.team === "player" ? "#3b82f6" : unit.team === "enemy" ? "#ef4444" : "#6b7280";
          ctx.beginPath();
          ctx.arc(ghostCenterX, ghostGroundY - 16 * scale, 20 * scale, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
        ctx.restore();
      }
      if (isSelected) {
        const ringAlpha = 0.6 + 0.3 * Math.sin(animTime * 4e-3);
        ctx.beginPath();
        ctx.ellipse(centerX, groundY, drawW / 2 + 4 * scale, 12 * scale, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 200, 255, ${ringAlpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      const frame = resolveUnitFrame?.(unit.id) ?? null;
      const frameImg = frame ? getImage(frame.sheetUrl) : null;
      if (frame && frameImg) {
        const frameAr = frame.sw / frame.sh;
        let fDrawH = unitDrawH;
        let fDrawW = unitDrawH * frameAr;
        if (fDrawW > maxUnitW) {
          fDrawW = maxUnitW;
          fDrawH = maxUnitW / frameAr;
        }
        const spriteY = groundY - fDrawH - (frame.applyBreathing ? breatheOffset : 0);
        ctx.save();
        if (unit.team) {
          ctx.shadowColor = unit.team === "player" ? "rgba(0, 150, 255, 0.6)" : "rgba(255, 50, 50, 0.6)";
          ctx.shadowBlur = 12 * scale;
        }
        if (frame.flipX) {
          ctx.translate(centerX, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(frameImg, frame.sx, frame.sy, frame.sw, frame.sh, -fDrawW / 2, spriteY, fDrawW, fDrawH);
        } else {
          ctx.drawImage(frameImg, frame.sx, frame.sy, frame.sw, frame.sh, centerX - fDrawW / 2, spriteY, fDrawW, fDrawH);
        }
        ctx.restore();
      } else if (img) {
        const spriteY = groundY - drawH - breatheOffset;
        if (unit.team) {
          ctx.save();
          ctx.shadowColor = unit.team === "player" ? "rgba(0, 150, 255, 0.6)" : "rgba(255, 50, 50, 0.6)";
          ctx.shadowBlur = 12 * scale;
          ctx.drawImage(img, centerX - drawW / 2, spriteY, drawW, drawH);
          ctx.restore();
        } else {
          ctx.drawImage(img, centerX - drawW / 2, spriteY, drawW, drawH);
        }
      } else {
        const color = unit.team === "player" ? "#3b82f6" : unit.team === "enemy" ? "#ef4444" : "#6b7280";
        ctx.beginPath();
        ctx.arc(centerX, groundY - 20 * scale - breatheOffset, 20 * scale, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      if (unit.name) {
        const labelBg = unit.team === "player" ? "rgba(59, 130, 246, 0.9)" : unit.team === "enemy" ? "rgba(239, 68, 68, 0.9)" : "rgba(107, 114, 128, 0.9)";
        ctx.font = `bold ${10 * scale * 2.5}px system-ui`;
        ctx.textAlign = "center";
        const textWidth = ctx.measureText(unit.name).width;
        const labelY = groundY + 14 * scale - breatheOffset;
        ctx.fillStyle = labelBg;
        ctx.beginPath();
        ctx.roundRect(centerX - textWidth / 2 - 6 * scale, labelY - 8 * scale, textWidth + 12 * scale, 16 * scale, 4 * scale);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.fillText(unit.name, centerX, labelY + 4 * scale);
      }
      if (unit.health !== void 0 && unit.maxHealth !== void 0) {
        const barWidth = 40 * scale;
        const barHeight = 6 * scale;
        const barX = centerX - barWidth / 2;
        const barY = groundY - drawH - 2 * scale - breatheOffset;
        const healthRatio = unit.health / unit.maxHealth;
        const barRadius = barHeight / 2;
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.beginPath();
        ctx.roundRect(barX, barY, barWidth, barHeight, barRadius);
        ctx.fill();
        if (healthRatio > 0) {
          const fillWidth = barWidth * healthRatio;
          const gradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
          if (healthRatio > 0.6) {
            gradient.addColorStop(0, "#4ade80");
            gradient.addColorStop(1, "#22c55e");
          } else if (healthRatio > 0.3) {
            gradient.addColorStop(0, "#fde047");
            gradient.addColorStop(1, "#eab308");
          } else {
            gradient.addColorStop(0, "#f87171");
            gradient.addColorStop(1, "#ef4444");
          }
          ctx.fillStyle = gradient;
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(barX, barY, fillWidth, barHeight, barRadius);
          ctx.clip();
          ctx.fillRect(barX, barY, fillWidth, barHeight);
          ctx.restore();
        }
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barWidth, barHeight, barRadius);
        ctx.stroke();
      }
    }
    onDrawEffects?.(ctx, animTime, getImage);
    ctx.restore();
    drawMinimap();
  }, [
    sortedTiles,
    units,
    features,
    selectedUnitId,
    scale,
    debug,
    resolveTerrainSpriteUrl,
    resolveFeatureSpriteUrl,
    resolveUnitSpriteUrl,
    resolveUnitFrame,
    getImage,
    gridWidth,
    gridHeight,
    baseOffsetX,
    scaledTileWidth,
    scaledTileHeight,
    scaledFloorHeight,
    scaledDiamondTopY,
    validMoveSet,
    attackTargetSet,
    hoveredTile,
    viewportSize,
    drawMinimap,
    onDrawEffects,
    backgroundImage,
    cameraRef,
    unitScale
  ]);
  useEffect(() => {
    if (!selectedUnitId) return;
    const unit = units.find((u) => u.id === selectedUnitId);
    if (!unit?.position) return;
    const pos = isoToScreen(unit.position.x, unit.position.y, scale, baseOffsetX);
    const centerX = pos.x + scaledTileWidth / 2;
    const centerY = pos.y + scaledDiamondTopY + scaledFloorHeight / 2;
    targetCameraRef.current = {
      x: centerX - viewportSize.width / 2,
      y: centerY - viewportSize.height / 2
    };
  }, [selectedUnitId, units, scale, baseOffsetX, scaledTileWidth, scaledDiamondTopY, scaledFloorHeight, viewportSize, targetCameraRef]);
  useEffect(() => {
    const hasAnimations = units.length > 0 || validMoves.length > 0 || attackTargets.length > 0 || selectedUnitId != null || targetCameraRef.current != null || hasActiveEffects2;
    draw(animTimeRef.current);
    if (!hasAnimations) return;
    let running = true;
    const animate = (timestamp) => {
      if (!running) return;
      animTimeRef.current = timestamp;
      lerpToTarget();
      draw(timestamp);
      rafIdRef.current = requestAnimationFrame(animate);
    };
    rafIdRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [draw, units.length, validMoves.length, attackTargets.length, selectedUnitId, hasActiveEffects2, lerpToTarget, targetCameraRef]);
  const handleMouseMoveWithCamera = useCallback((e) => {
    if (enableCamera) {
      const wasPanning = handleMouseMove(e, () => draw(animTimeRef.current));
      if (wasPanning) return;
    }
    if (!onTileHover && !tileHoverEvent || !canvasRef.current) return;
    const world = screenToWorld(e.clientX, e.clientY, canvasRef.current, viewportSize);
    const adjustedX = world.x - scaledTileWidth / 2;
    const adjustedY = world.y - scaledDiamondTopY - scaledFloorHeight / 2;
    const isoPos = screenToIso(adjustedX, adjustedY, scale, baseOffsetX);
    const tileExists = tilesProp.some((t) => t.x === isoPos.x && t.y === isoPos.y);
    if (tileExists) {
      if (tileHoverEvent) eventBus.emit(`UI:${tileHoverEvent}`, { x: isoPos.x, y: isoPos.y });
      onTileHover?.(isoPos.x, isoPos.y);
    }
  }, [enableCamera, handleMouseMove, draw, onTileHover, screenToWorld, viewportSize, scaledTileWidth, scaledDiamondTopY, scaledFloorHeight, scale, baseOffsetX, tilesProp, tileHoverEvent, eventBus]);
  const handleMouseLeaveWithCamera = useCallback(() => {
    handleMouseLeave();
    if (tileLeaveEvent) eventBus.emit(`UI:${tileLeaveEvent}`, {});
    onTileLeave?.();
  }, [handleMouseLeave, onTileLeave, tileLeaveEvent, eventBus]);
  const handleWheelWithCamera = useCallback((e) => {
    if (enableCamera) {
      handleWheel(e, () => draw(animTimeRef.current));
    }
  }, [enableCamera, handleWheel, draw]);
  const handleClick = useCallback((e) => {
    if (dragDistance() > 5) return;
    if (!canvasRef.current) return;
    const world = screenToWorld(e.clientX, e.clientY, canvasRef.current, viewportSize);
    const adjustedX = world.x - scaledTileWidth / 2;
    const adjustedY = world.y - scaledDiamondTopY - scaledFloorHeight / 2;
    const isoPos = screenToIso(adjustedX, adjustedY, scale, baseOffsetX);
    const clickedUnit = units.find((u) => u.position?.x === isoPos.x && u.position?.y === isoPos.y);
    if (clickedUnit && (onUnitClick || unitClickEvent)) {
      if (unitClickEvent) eventBus.emit(`UI:${unitClickEvent}`, { unitId: clickedUnit.id });
      onUnitClick?.(clickedUnit.id);
    } else if (onTileClick || tileClickEvent) {
      const tileExists = tilesProp.some((t) => t.x === isoPos.x && t.y === isoPos.y);
      if (tileExists) {
        if (tileClickEvent) eventBus.emit(`UI:${tileClickEvent}`, { x: isoPos.x, y: isoPos.y });
        onTileClick?.(isoPos.x, isoPos.y);
      }
    }
  }, [dragDistance, screenToWorld, viewportSize, scaledTileWidth, scaledDiamondTopY, scaledFloorHeight, scale, baseOffsetX, units, tilesProp, onUnitClick, onTileClick, unitClickEvent, tileClickEvent, eventBus]);
  if (error) {
    return /* @__PURE__ */ jsx(ErrorState, { title: "Canvas Error", message: error.message, className });
  }
  if (isLoading) {
    return /* @__PURE__ */ jsx(LoadingState, { className });
  }
  return /* @__PURE__ */ jsxs(
    Box,
    {
      ref: containerRef,
      className: cn("relative overflow-hidden w-full h-full", className),
      children: [
        /* @__PURE__ */ jsx(
          "canvas",
          {
            ref: canvasRef,
            onClick: handleClick,
            onMouseDown: enableCamera ? handleMouseDown : void 0,
            onMouseMove: handleMouseMoveWithCamera,
            onMouseUp: enableCamera ? handleMouseUp : void 0,
            onMouseLeave: handleMouseLeaveWithCamera,
            onWheel: handleWheelWithCamera,
            onContextMenu: (e) => e.preventDefault(),
            className: "cursor-pointer",
            style: {
              width: viewportSize.width,
              height: viewportSize.height
            }
          }
        ),
        showMinimap && /* @__PURE__ */ jsx(
          "canvas",
          {
            ref: minimapRef,
            className: "absolute bottom-2 right-2 border border-border rounded bg-background/80 pointer-events-none",
            style: { width: 150, height: 100, zIndex: 10 }
          }
        )
      ]
    }
  );
}
IsometricCanvas.displayName = "IsometricCanvas";
var IsometricCanvas_default = IsometricCanvas;

// components/organisms/game/types/effects.ts
var EMPTY_EFFECT_STATE = {
  particles: [],
  sequences: [],
  overlays: []
};

// components/organisms/game/utils/canvasEffects.ts
var _offscreen = null;
var _offCtx = null;
function getOffscreenCtx(w, h) {
  if (!_offscreen) {
    if (typeof OffscreenCanvas !== "undefined") {
      _offscreen = new OffscreenCanvas(w, h);
    } else {
      _offscreen = document.createElement("canvas");
    }
  }
  if (_offscreen.width < w) _offscreen.width = w;
  if (_offscreen.height < h) _offscreen.height = h;
  if (!_offCtx) {
    _offCtx = _offscreen.getContext("2d");
  }
  return _offCtx;
}
function drawTintedImage(ctx, img, x, y, w, h, tint, alpha, blendMode = "source-over") {
  if (w <= 0 || h <= 0) return;
  const oc = getOffscreenCtx(w, h);
  oc.clearRect(0, 0, w, h);
  oc.globalCompositeOperation = "source-over";
  oc.drawImage(img, 0, 0, w, h);
  oc.globalCompositeOperation = "source-atop";
  oc.fillStyle = `rgb(${tint.r}, ${tint.g}, ${tint.b})`;
  oc.fillRect(0, 0, w, h);
  const prevAlpha = ctx.globalAlpha;
  const prevBlend = ctx.globalCompositeOperation;
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = blendMode;
  ctx.drawImage(_offscreen, 0, 0, w, h, x, y, w, h);
  ctx.globalAlpha = prevAlpha;
  ctx.globalCompositeOperation = prevBlend;
}
function randRange(min, max) {
  return min + Math.random() * (max - min);
}
function spawnParticles(config, animTime) {
  const particles = [];
  for (let i = 0; i < config.count; i++) {
    const angle = randRange(config.angleMin, config.angleMax);
    const speed = randRange(config.velocityMin, config.velocityMax);
    const spriteUrl = config.spriteUrls[Math.floor(Math.random() * config.spriteUrls.length)];
    particles.push({
      spriteUrl,
      x: config.originX + randRange(-config.spread, config.spread),
      y: config.originY + randRange(-config.spread, config.spread),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: config.gravity,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: randRange(config.rotationSpeedMin ?? -2, config.rotationSpeedMax ?? 2),
      scale: randRange(config.scaleMin, config.scaleMax),
      scaleSpeed: config.scaleSpeed ?? 0,
      alpha: config.alpha ?? 1,
      fadeRate: config.fadeRate ?? -1.5,
      tint: { ...config.tint },
      blendMode: config.blendMode ?? "source-over",
      spawnTime: animTime,
      lifetime: randRange(config.lifetimeMin, config.lifetimeMax)
    });
  }
  return particles;
}
function spawnSequence(config, animTime) {
  return {
    frameUrls: config.frameUrls,
    x: config.originX,
    y: config.originY,
    frameDuration: config.frameDuration,
    startTime: animTime,
    loop: config.loop ?? false,
    scale: config.scale ?? 1,
    tint: config.tint ?? null,
    alpha: config.alpha ?? 1,
    blendMode: config.blendMode ?? "source-over"
  };
}
function spawnOverlay(config, animTime) {
  return {
    spriteUrl: config.spriteUrl,
    x: config.originX,
    y: config.originY,
    alpha: config.alpha ?? 0.8,
    fadeRate: config.fadeRate ?? -0.5,
    pulseAmplitude: config.pulseAmplitude ?? 0,
    pulseFrequency: config.pulseFrequency ?? 2,
    scale: config.scale ?? 1,
    blendMode: config.blendMode ?? "source-over",
    spawnTime: animTime,
    lifetime: config.lifetime ?? 2e3
  };
}
function updateEffectState(state, animTime, deltaMs) {
  const dt = deltaMs / 1e3;
  const particles = state.particles.map((p2) => ({
    ...p2,
    x: p2.x + p2.vx * dt,
    y: p2.y + p2.vy * dt,
    vy: p2.vy + p2.gravity * dt,
    rotation: p2.rotation + p2.rotationSpeed * dt,
    scale: Math.max(0, p2.scale + p2.scaleSpeed * dt),
    alpha: Math.max(0, p2.alpha + p2.fadeRate * dt)
  })).filter((p2) => p2.alpha > 0.01 && animTime - p2.spawnTime < p2.lifetime);
  const sequences = state.sequences.filter((s) => {
    const elapsed = animTime - s.startTime;
    const totalDuration = s.frameUrls.length * s.frameDuration;
    return s.loop || elapsed < totalDuration;
  });
  const overlays = state.overlays.map((o) => ({
    ...o,
    alpha: Math.max(0, o.alpha + o.fadeRate * dt)
  })).filter((o) => o.alpha > 0.01 && animTime - o.spawnTime < o.lifetime);
  return { particles, sequences, overlays };
}
function drawEffectState(ctx, state, animTime, getImage) {
  for (const o of state.overlays) {
    const img = getImage(o.spriteUrl);
    if (!img) continue;
    let alpha = o.alpha;
    if (o.pulseAmplitude > 0) {
      const elapsed = (animTime - o.spawnTime) / 1e3;
      alpha += Math.sin(elapsed * o.pulseFrequency * Math.PI * 2) * o.pulseAmplitude;
      alpha = Math.max(0, Math.min(1, alpha));
    }
    const w = img.naturalWidth * o.scale;
    const h = img.naturalHeight * o.scale;
    const prevAlpha = ctx.globalAlpha;
    const prevBlend = ctx.globalCompositeOperation;
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = o.blendMode;
    ctx.drawImage(img, o.x - w / 2, o.y - h / 2, w, h);
    ctx.globalAlpha = prevAlpha;
    ctx.globalCompositeOperation = prevBlend;
  }
  for (const s of state.sequences) {
    const elapsed = animTime - s.startTime;
    let frameIndex = Math.floor(elapsed / s.frameDuration);
    if (s.loop) {
      frameIndex = frameIndex % s.frameUrls.length;
    } else if (frameIndex >= s.frameUrls.length) {
      continue;
    }
    const img = getImage(s.frameUrls[frameIndex]);
    if (!img) continue;
    const w = img.naturalWidth * s.scale;
    const h = img.naturalHeight * s.scale;
    if (s.tint) {
      drawTintedImage(ctx, img, s.x - w / 2, s.y - h / 2, w, h, s.tint, s.alpha, s.blendMode);
    } else {
      const prevAlpha = ctx.globalAlpha;
      const prevBlend = ctx.globalCompositeOperation;
      ctx.globalAlpha = s.alpha;
      ctx.globalCompositeOperation = s.blendMode;
      ctx.drawImage(img, s.x - w / 2, s.y - h / 2, w, h);
      ctx.globalAlpha = prevAlpha;
      ctx.globalCompositeOperation = prevBlend;
    }
  }
  for (const p2 of state.particles) {
    const img = getImage(p2.spriteUrl);
    if (!img) continue;
    const w = img.naturalWidth * p2.scale;
    const h = img.naturalHeight * p2.scale;
    ctx.save();
    ctx.translate(p2.x, p2.y);
    ctx.rotate(p2.rotation);
    drawTintedImage(ctx, img, -w / 2, -h / 2, w, h, p2.tint, p2.alpha, p2.blendMode);
    ctx.restore();
  }
}
function hasActiveEffects(state) {
  return state.particles.length > 0 || state.sequences.length > 0 || state.overlays.length > 0;
}
function getAllEffectSpriteUrls(manifest) {
  const urls = [];
  const base = manifest.baseUrl;
  if (manifest.particles) {
    for (const value of Object.values(manifest.particles)) {
      if (Array.isArray(value)) {
        value.forEach((v) => urls.push(`${base}/${v}`));
      } else if (typeof value === "string") {
        urls.push(`${base}/${value}`);
      }
    }
  }
  if (manifest.animations) {
    for (const frames of Object.values(manifest.animations)) {
      if (Array.isArray(frames)) {
        frames.forEach((f) => urls.push(`${base}/${f}`));
      }
    }
  }
  return urls;
}

// components/organisms/game/utils/combatPresets.ts
var PI = Math.PI;
function p(manifest, key) {
  const particles = manifest.particles;
  if (!particles) return [];
  const val = particles[key];
  if (Array.isArray(val)) return val.map((v) => `${manifest.baseUrl}/${v}`);
  if (typeof val === "string") return [`${manifest.baseUrl}/${val}`];
  return [];
}
function anim(manifest, key) {
  const animations = manifest.animations;
  if (!animations) return [];
  const val = animations[key];
  if (Array.isArray(val)) return val.map((v) => `${manifest.baseUrl}/${v}`);
  return [];
}
function createCombatPresets(manifest) {
  return {
    // =====================================================================
    // MELEE — slash (red) + dirt + scratch + flash sequence
    // =====================================================================
    melee: (originX, originY) => {
      const particles = [
        {
          spriteUrls: p(manifest, "slash"),
          count: 6,
          originX,
          originY,
          spread: 8,
          velocityMin: 40,
          velocityMax: 120,
          angleMin: -PI * 0.8,
          angleMax: -PI * 0.2,
          gravity: 0,
          tint: { r: 255, g: 60, b: 40 },
          scaleMin: 0.3,
          scaleMax: 0.6,
          lifetimeMin: 300,
          lifetimeMax: 500,
          fadeRate: -2.5
        },
        {
          spriteUrls: p(manifest, "dirt"),
          count: 4,
          originX,
          originY: originY + 10,
          spread: 12,
          velocityMin: 20,
          velocityMax: 60,
          angleMin: -PI * 0.9,
          angleMax: -PI * 0.1,
          gravity: 120,
          tint: { r: 180, g: 140, b: 90 },
          scaleMin: 0.15,
          scaleMax: 0.3,
          lifetimeMin: 400,
          lifetimeMax: 700,
          fadeRate: -1.8
        },
        {
          spriteUrls: p(manifest, "scratch"),
          count: 2,
          originX,
          originY,
          spread: 5,
          velocityMin: 10,
          velocityMax: 30,
          angleMin: -PI * 0.7,
          angleMax: -PI * 0.3,
          gravity: 0,
          tint: { r: 255, g: 200, b: 150 },
          scaleMin: 0.25,
          scaleMax: 0.4,
          lifetimeMin: 200,
          lifetimeMax: 400,
          fadeRate: -3
        }
      ];
      const sequences = [];
      const flashFrames = anim(manifest, "flash");
      if (flashFrames.length > 0) {
        sequences.push({
          frameUrls: flashFrames,
          originX,
          originY,
          frameDuration: 35,
          scale: 0.4
        });
      }
      return {
        particles: particles.filter((pc) => pc.spriteUrls.length > 0),
        sequences,
        overlays: [],
        screenShake: 4,
        screenFlash: null
      };
    },
    // =====================================================================
    // RANGED — muzzle + trace + smoke + explosion sequence
    // =====================================================================
    ranged: (originX, originY) => {
      const particles = [
        {
          spriteUrls: p(manifest, "muzzle"),
          count: 3,
          originX,
          originY,
          spread: 4,
          velocityMin: 60,
          velocityMax: 150,
          angleMin: -PI * 0.6,
          angleMax: -PI * 0.4,
          gravity: 0,
          tint: { r: 255, g: 220, b: 100 },
          scaleMin: 0.2,
          scaleMax: 0.4,
          lifetimeMin: 200,
          lifetimeMax: 400,
          fadeRate: -3
        },
        {
          spriteUrls: p(manifest, "trace"),
          count: 5,
          originX,
          originY,
          spread: 3,
          velocityMin: 100,
          velocityMax: 200,
          angleMin: -PI * 0.55,
          angleMax: -PI * 0.45,
          gravity: 0,
          tint: { r: 255, g: 200, b: 80 },
          scaleMin: 0.15,
          scaleMax: 0.3,
          lifetimeMin: 150,
          lifetimeMax: 300,
          fadeRate: -4
        },
        {
          spriteUrls: p(manifest, "smoke").slice(0, 3),
          count: 3,
          originX,
          originY: originY + 5,
          spread: 6,
          velocityMin: 10,
          velocityMax: 30,
          angleMin: -PI * 0.8,
          angleMax: -PI * 0.2,
          gravity: -20,
          tint: { r: 200, g: 200, b: 200 },
          scaleMin: 0.2,
          scaleMax: 0.35,
          lifetimeMin: 500,
          lifetimeMax: 800,
          fadeRate: -1.5
        }
      ];
      const sequences = [];
      const explosionFrames = anim(manifest, "smokeExplosion");
      if (explosionFrames.length > 0) {
        sequences.push({
          frameUrls: explosionFrames,
          originX,
          originY,
          frameDuration: 50,
          scale: 0.35
        });
      }
      return {
        particles: particles.filter((pc) => pc.spriteUrls.length > 0),
        sequences,
        overlays: [],
        screenShake: 2,
        screenFlash: null
      };
    },
    // =====================================================================
    // MAGIC — twirl (purple) + spark (purple) + star
    // =====================================================================
    magic: (originX, originY) => {
      const particles = [
        {
          spriteUrls: p(manifest, "twirl"),
          count: 5,
          originX,
          originY,
          spread: 15,
          velocityMin: 20,
          velocityMax: 80,
          angleMin: 0,
          angleMax: PI * 2,
          gravity: -30,
          tint: { r: 180, g: 80, b: 255 },
          scaleMin: 0.2,
          scaleMax: 0.5,
          lifetimeMin: 500,
          lifetimeMax: 900,
          fadeRate: -1.2,
          blendMode: "lighter",
          rotationSpeedMin: -4,
          rotationSpeedMax: 4
        },
        {
          spriteUrls: p(manifest, "spark"),
          count: 8,
          originX,
          originY,
          spread: 20,
          velocityMin: 30,
          velocityMax: 100,
          angleMin: 0,
          angleMax: PI * 2,
          gravity: -15,
          tint: { r: 200, g: 120, b: 255 },
          scaleMin: 0.1,
          scaleMax: 0.25,
          lifetimeMin: 300,
          lifetimeMax: 600,
          fadeRate: -2,
          blendMode: "lighter"
        },
        {
          spriteUrls: p(manifest, "star"),
          count: 4,
          originX,
          originY,
          spread: 10,
          velocityMin: 15,
          velocityMax: 50,
          angleMin: -PI,
          angleMax: 0,
          gravity: -40,
          tint: { r: 220, g: 180, b: 255 },
          scaleMin: 0.15,
          scaleMax: 0.3,
          lifetimeMin: 600,
          lifetimeMax: 1e3,
          fadeRate: -1,
          blendMode: "lighter"
        }
      ];
      const overlays = [];
      const circleUrls = p(manifest, "circle");
      if (circleUrls.length > 0) {
        overlays.push({
          spriteUrl: circleUrls[0],
          originX,
          originY,
          alpha: 0.5,
          fadeRate: -0.6,
          pulseAmplitude: 0.2,
          pulseFrequency: 3,
          scale: 0.5,
          blendMode: "lighter",
          lifetime: 1200
        });
      }
      return {
        particles: particles.filter((pc) => pc.spriteUrls.length > 0),
        sequences: [],
        overlays,
        screenShake: 0,
        screenFlash: null
      };
    },
    // =====================================================================
    // HEAL — circle (green) + star (green) + light (green, pulse)
    // =====================================================================
    heal: (originX, originY) => {
      const particles = [
        {
          spriteUrls: p(manifest, "circle"),
          count: 6,
          originX,
          originY,
          spread: 15,
          velocityMin: 10,
          velocityMax: 40,
          angleMin: -PI,
          angleMax: -PI * 0.3,
          gravity: -50,
          tint: { r: 80, g: 255, b: 120 },
          scaleMin: 0.15,
          scaleMax: 0.35,
          lifetimeMin: 600,
          lifetimeMax: 1e3,
          fadeRate: -0.8,
          blendMode: "lighter"
        },
        {
          spriteUrls: p(manifest, "star"),
          count: 5,
          originX,
          originY,
          spread: 12,
          velocityMin: 15,
          velocityMax: 50,
          angleMin: -PI * 0.9,
          angleMax: -PI * 0.1,
          gravity: -60,
          tint: { r: 100, g: 255, b: 140 },
          scaleMin: 0.1,
          scaleMax: 0.2,
          lifetimeMin: 500,
          lifetimeMax: 800,
          fadeRate: -1.2,
          blendMode: "lighter"
        }
      ];
      const overlays = [];
      const lightUrls = p(manifest, "light");
      if (lightUrls.length > 0) {
        overlays.push({
          spriteUrl: lightUrls[0],
          originX,
          originY,
          alpha: 0.6,
          fadeRate: -0.4,
          pulseAmplitude: 0.25,
          pulseFrequency: 2.5,
          scale: 0.6,
          blendMode: "lighter",
          lifetime: 1500
        });
      }
      return {
        particles: particles.filter((pc) => pc.spriteUrls.length > 0),
        sequences: [],
        overlays,
        screenShake: 0,
        screenFlash: null
      };
    },
    // =====================================================================
    // DEFEND / SHIELD — star (blue) + circle (blue, pulse)
    // =====================================================================
    defend: (originX, originY) => {
      const particles = [
        {
          spriteUrls: p(manifest, "star"),
          count: 8,
          originX,
          originY,
          spread: 18,
          velocityMin: 10,
          velocityMax: 35,
          angleMin: 0,
          angleMax: PI * 2,
          gravity: 0,
          tint: { r: 80, g: 160, b: 255 },
          scaleMin: 0.12,
          scaleMax: 0.25,
          lifetimeMin: 600,
          lifetimeMax: 1e3,
          fadeRate: -0.8,
          blendMode: "lighter",
          rotationSpeedMin: -1,
          rotationSpeedMax: 1
        }
      ];
      const overlays = [];
      const circleUrls = p(manifest, "circle");
      if (circleUrls.length > 0) {
        overlays.push({
          spriteUrl: circleUrls[0],
          originX,
          originY,
          alpha: 0.6,
          fadeRate: -0.3,
          pulseAmplitude: 0.2,
          pulseFrequency: 2,
          scale: 0.6,
          blendMode: "lighter",
          lifetime: 1500
        });
      }
      return {
        particles: particles.filter((pc) => pc.spriteUrls.length > 0),
        sequences: [],
        overlays,
        screenShake: 0,
        screenFlash: null
      };
    },
    // shield aliases to defend
    shield: (originX, originY) => {
      const particles = [
        {
          spriteUrls: p(manifest, "star"),
          count: 10,
          originX,
          originY,
          spread: 20,
          velocityMin: 8,
          velocityMax: 30,
          angleMin: 0,
          angleMax: PI * 2,
          gravity: 0,
          tint: { r: 60, g: 180, b: 255 },
          scaleMin: 0.1,
          scaleMax: 0.22,
          lifetimeMin: 700,
          lifetimeMax: 1200,
          fadeRate: -0.7,
          blendMode: "lighter",
          rotationSpeedMin: -0.8,
          rotationSpeedMax: 0.8
        }
      ];
      const overlays = [];
      const circleUrls = p(manifest, "circle");
      if (circleUrls.length > 0) {
        overlays.push({
          spriteUrl: circleUrls[0],
          originX,
          originY,
          alpha: 0.7,
          fadeRate: -0.25,
          pulseAmplitude: 0.25,
          pulseFrequency: 1.8,
          scale: 0.7,
          blendMode: "lighter",
          lifetime: 1800
        });
      }
      return {
        particles: particles.filter((pc) => pc.spriteUrls.length > 0),
        sequences: [],
        overlays,
        screenShake: 0,
        screenFlash: null
      };
    },
    // =====================================================================
    // HIT — spark (orange) + flash (5 frames) + screen shake/flash
    // =====================================================================
    hit: (originX, originY) => {
      const particles = [
        {
          spriteUrls: p(manifest, "spark"),
          count: 10,
          originX,
          originY,
          spread: 8,
          velocityMin: 50,
          velocityMax: 150,
          angleMin: 0,
          angleMax: PI * 2,
          gravity: 80,
          tint: { r: 255, g: 180, b: 50 },
          scaleMin: 0.08,
          scaleMax: 0.2,
          lifetimeMin: 200,
          lifetimeMax: 500,
          fadeRate: -2.5
        }
      ];
      const sequences = [];
      const flashFrames = anim(manifest, "flash");
      if (flashFrames.length > 0) {
        sequences.push({
          frameUrls: flashFrames.slice(0, 5),
          originX,
          originY,
          frameDuration: 40,
          scale: 0.3
        });
      }
      return {
        particles: particles.filter((pc) => pc.spriteUrls.length > 0),
        sequences,
        overlays: [],
        screenShake: 3,
        screenFlash: { r: 255, g: 50, b: 50, duration: 150 }
      };
    },
    // critical aliases to hit with bigger shake
    critical: (originX, originY) => {
      const particles = [
        {
          spriteUrls: p(manifest, "flame"),
          count: 8,
          originX,
          originY,
          spread: 12,
          velocityMin: 60,
          velocityMax: 180,
          angleMin: 0,
          angleMax: PI * 2,
          gravity: 60,
          tint: { r: 255, g: 120, b: 30 },
          scaleMin: 0.15,
          scaleMax: 0.4,
          lifetimeMin: 300,
          lifetimeMax: 600,
          fadeRate: -2
        },
        {
          spriteUrls: p(manifest, "spark"),
          count: 12,
          originX,
          originY,
          spread: 10,
          velocityMin: 80,
          velocityMax: 200,
          angleMin: 0,
          angleMax: PI * 2,
          gravity: 100,
          tint: { r: 255, g: 200, b: 60 },
          scaleMin: 0.06,
          scaleMax: 0.18,
          lifetimeMin: 200,
          lifetimeMax: 400,
          fadeRate: -3
        }
      ];
      const sequences = [];
      const flashFrames = anim(manifest, "flash");
      if (flashFrames.length > 0) {
        sequences.push({
          frameUrls: flashFrames,
          originX,
          originY,
          frameDuration: 30,
          scale: 0.5
        });
      }
      return {
        particles: particles.filter((pc) => pc.spriteUrls.length > 0),
        sequences,
        overlays: [],
        screenShake: 6,
        screenFlash: { r: 255, g: 80, b: 0, duration: 200 }
      };
    },
    // =====================================================================
    // DEATH — dirt (gray) + explosion + black smoke + scorch (ground)
    // =====================================================================
    death: (originX, originY) => {
      const particles = [
        {
          spriteUrls: p(manifest, "dirt"),
          count: 8,
          originX,
          originY,
          spread: 10,
          velocityMin: 30,
          velocityMax: 100,
          angleMin: 0,
          angleMax: PI * 2,
          gravity: 100,
          tint: { r: 140, g: 140, b: 140 },
          scaleMin: 0.15,
          scaleMax: 0.35,
          lifetimeMin: 500,
          lifetimeMax: 900,
          fadeRate: -1.2
        }
      ];
      const sequences = [];
      const explosionFrames = anim(manifest, "explosion");
      if (explosionFrames.length > 0) {
        sequences.push({
          frameUrls: explosionFrames,
          originX,
          originY,
          frameDuration: 60,
          scale: 0.5
        });
      }
      const blackSmokeFrames = anim(manifest, "blackSmoke");
      if (blackSmokeFrames.length > 0) {
        sequences.push({
          frameUrls: blackSmokeFrames,
          originX,
          originY: originY - 10,
          frameDuration: 50,
          scale: 0.4,
          alpha: 0.7
        });
      }
      const overlays = [];
      const scorchUrls = p(manifest, "scorch");
      if (scorchUrls.length > 0) {
        overlays.push({
          spriteUrl: scorchUrls[0],
          originX,
          originY: originY + 10,
          alpha: 0.6,
          fadeRate: -0.15,
          scale: 0.4,
          lifetime: 4e3
        });
      }
      return {
        particles: particles.filter((pc) => pc.spriteUrls.length > 0),
        sequences,
        overlays,
        screenShake: 0,
        screenFlash: null
      };
    },
    // =====================================================================
    // BUFF — star (gold) + symbol + flare (gold, pulse)
    // =====================================================================
    buff: (originX, originY) => {
      const particles = [
        {
          spriteUrls: p(manifest, "star"),
          count: 6,
          originX,
          originY,
          spread: 15,
          velocityMin: 15,
          velocityMax: 50,
          angleMin: -PI,
          angleMax: 0,
          gravity: -30,
          tint: { r: 255, g: 215, b: 50 },
          scaleMin: 0.12,
          scaleMax: 0.25,
          lifetimeMin: 600,
          lifetimeMax: 1e3,
          fadeRate: -0.8,
          blendMode: "lighter"
        },
        {
          spriteUrls: p(manifest, "symbol"),
          count: 2,
          originX,
          originY: originY - 10,
          spread: 8,
          velocityMin: 5,
          velocityMax: 20,
          angleMin: -PI * 0.7,
          angleMax: -PI * 0.3,
          gravity: -20,
          tint: { r: 255, g: 230, b: 100 },
          scaleMin: 0.2,
          scaleMax: 0.35,
          lifetimeMin: 800,
          lifetimeMax: 1200,
          fadeRate: -0.6,
          blendMode: "lighter"
        }
      ];
      const overlays = [];
      const flareUrls = p(manifest, "flare");
      if (flareUrls.length > 0) {
        overlays.push({
          spriteUrl: flareUrls[0],
          originX,
          originY,
          alpha: 0.5,
          fadeRate: -0.3,
          pulseAmplitude: 0.3,
          pulseFrequency: 2,
          scale: 0.5,
          blendMode: "lighter",
          lifetime: 1500
        });
      }
      return {
        particles: particles.filter((pc) => pc.spriteUrls.length > 0),
        sequences: [],
        overlays,
        screenShake: 0,
        screenFlash: null
      };
    },
    // =====================================================================
    // DEBUFF — scorch (dark) + smoke (purple tint)
    // =====================================================================
    debuff: (originX, originY) => {
      const particles = [
        {
          spriteUrls: p(manifest, "scorch"),
          count: 4,
          originX,
          originY,
          spread: 12,
          velocityMin: 15,
          velocityMax: 40,
          angleMin: -PI,
          angleMax: 0,
          gravity: -20,
          tint: { r: 120, g: 40, b: 160 },
          scaleMin: 0.15,
          scaleMax: 0.3,
          lifetimeMin: 500,
          lifetimeMax: 800,
          fadeRate: -1
        },
        {
          spriteUrls: p(manifest, "smoke").slice(0, 3),
          count: 3,
          originX,
          originY,
          spread: 10,
          velocityMin: 8,
          velocityMax: 25,
          angleMin: -PI * 0.8,
          angleMax: -PI * 0.2,
          gravity: -15,
          tint: { r: 100, g: 50, b: 140 },
          scaleMin: 0.2,
          scaleMax: 0.35,
          lifetimeMin: 600,
          lifetimeMax: 1e3,
          fadeRate: -0.8
        }
      ];
      const overlays = [];
      const circleUrls = p(manifest, "circle");
      if (circleUrls.length > 0) {
        overlays.push({
          spriteUrl: circleUrls[0],
          originX,
          originY,
          alpha: 0.4,
          fadeRate: -0.4,
          pulseAmplitude: 0.15,
          pulseFrequency: 2,
          scale: 0.45,
          lifetime: 1200
        });
      }
      return {
        particles: particles.filter((pc) => pc.spriteUrls.length > 0),
        sequences: [],
        overlays,
        screenShake: 0,
        screenFlash: null
      };
    },
    // =====================================================================
    // AOE — explosion (large) + flame + spark (radial) + screen shake
    // =====================================================================
    aoe: (originX, originY) => {
      const particles = [
        {
          spriteUrls: p(manifest, "flame"),
          count: 10,
          originX,
          originY,
          spread: 20,
          velocityMin: 40,
          velocityMax: 140,
          angleMin: 0,
          angleMax: PI * 2,
          gravity: 40,
          tint: { r: 255, g: 140, b: 30 },
          scaleMin: 0.2,
          scaleMax: 0.5,
          lifetimeMin: 400,
          lifetimeMax: 800,
          fadeRate: -1.5
        },
        {
          spriteUrls: p(manifest, "spark"),
          count: 15,
          originX,
          originY,
          spread: 15,
          velocityMin: 60,
          velocityMax: 200,
          angleMin: 0,
          angleMax: PI * 2,
          gravity: 60,
          tint: { r: 255, g: 180, b: 60 },
          scaleMin: 0.06,
          scaleMax: 0.15,
          lifetimeMin: 200,
          lifetimeMax: 500,
          fadeRate: -2.5
        }
      ];
      const sequences = [];
      const explosionFrames = anim(manifest, "explosion");
      if (explosionFrames.length > 0) {
        sequences.push({
          frameUrls: explosionFrames,
          originX,
          originY,
          frameDuration: 50,
          scale: 0.6
        });
      }
      return {
        particles: particles.filter((pc) => pc.spriteUrls.length > 0),
        sequences,
        overlays: [],
        screenShake: 5,
        screenFlash: { r: 255, g: 160, b: 0, duration: 180 }
      };
    }
  };
}
var ACTION_EMOJI = {
  melee: { emoji: "\u2694\uFE0F", color: "var(--color-error)", label: "Slash" },
  ranged: { emoji: "\u{1F3F9}", color: "var(--color-warning)", label: "Arrow" },
  magic: { emoji: "\u2728", color: "var(--color-primary)", label: "Spell" },
  heal: { emoji: "\u{1F49A}", color: "var(--color-success)", label: "Heal" },
  buff: { emoji: "\u2B06\uFE0F", color: "var(--color-info)", label: "Buff" },
  debuff: { emoji: "\u2B07\uFE0F", color: "var(--color-warning)", label: "Debuff" },
  shield: { emoji: "\u{1F6E1}\uFE0F", color: "var(--color-info)", label: "Shield" },
  aoe: { emoji: "\u{1F4A5}", color: "var(--color-error)", label: "Explosion" },
  critical: { emoji: "\u{1F525}", color: "var(--color-error)", label: "Critical" },
  defend: { emoji: "\u{1F6E1}\uFE0F", color: "var(--color-info)", label: "Defend" },
  hit: { emoji: "\u{1F4A5}", color: "var(--color-error)", label: "Hit" },
  death: { emoji: "\u{1F480}", color: "var(--color-error)", label: "Death" }
};
function CanvasEffectEngine({
  actionType,
  x,
  y,
  duration = 2e3,
  intensity = 1,
  onComplete,
  className,
  assetManifest,
  width = 400,
  height = 300
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ ...EMPTY_EFFECT_STATE });
  const lastTimeRef = useRef(0);
  const rafRef = useRef(0);
  const imageCacheRef = useRef(/* @__PURE__ */ new Map());
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
  const [flash, setFlash] = useState(null);
  const shakeRef = useRef({ x: 0, y: 0, intensity: 0 });
  const presets = useMemo(() => createCombatPresets(assetManifest), [assetManifest]);
  const spriteUrls = useMemo(() => getAllEffectSpriteUrls(assetManifest), [assetManifest]);
  useEffect(() => {
    const cache = imageCacheRef.current;
    for (const url of spriteUrls) {
      if (!cache.has(url)) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        cache.set(url, img);
      }
    }
  }, [spriteUrls]);
  const getImage = useCallback((url) => {
    const img = imageCacheRef.current.get(url);
    return img?.complete ? img : void 0;
  }, []);
  useEffect(() => {
    const now = performance.now();
    const effectX = x || width / 2;
    const effectY = y || height / 2;
    const preset = presets[actionType](effectX, effectY);
    const state = stateRef.current;
    for (const emitter of preset.particles) {
      const scaledEmitter = { ...emitter, count: Math.round(emitter.count * intensity) };
      state.particles.push(...spawnParticles(scaledEmitter, now));
    }
    for (const seqConfig of preset.sequences) {
      state.sequences.push(spawnSequence(seqConfig, now));
    }
    for (const ovConfig of preset.overlays) {
      state.overlays.push(spawnOverlay(ovConfig, now));
    }
    if (preset.screenShake > 0) {
      shakeRef.current.intensity = preset.screenShake * intensity;
    }
    if (preset.screenFlash) {
      const { r, g, b, duration: flashDur } = preset.screenFlash;
      setFlash({ color: `rgb(${r}, ${g}, ${b})`, alpha: 0.3 });
      setTimeout(() => setFlash(null), flashDur);
    }
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    function loop(animTime) {
      const delta = lastTimeRef.current > 0 ? animTime - lastTimeRef.current : 16;
      lastTimeRef.current = animTime;
      stateRef.current = updateEffectState(stateRef.current, animTime, delta);
      if (shakeRef.current.intensity > 0.2) {
        const i = shakeRef.current.intensity;
        shakeRef.current.x = (Math.random() - 0.5) * i * 2;
        shakeRef.current.y = (Math.random() - 0.5) * i * 2;
        shakeRef.current.intensity *= 0.85;
        setShakeOffset({ x: shakeRef.current.x, y: shakeRef.current.y });
      } else if (shakeRef.current.intensity > 0) {
        shakeRef.current = { x: 0, y: 0, intensity: 0 };
        setShakeOffset({ x: 0, y: 0 });
      }
      ctx.clearRect(0, 0, width, height);
      drawEffectState(ctx, stateRef.current, animTime, getImage);
      if (hasActiveEffects(stateRef.current)) {
        rafRef.current = requestAnimationFrame(loop);
      }
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height, getImage]);
  const shakeStyle = shakeOffset.x !== 0 || shakeOffset.y !== 0 ? { transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)` } : {};
  return /* @__PURE__ */ jsxs(
    Box,
    {
      className: cn("absolute inset-0 pointer-events-none z-10", className),
      style: shakeStyle,
      children: [
        flash && /* @__PURE__ */ jsx(
          Box,
          {
            className: "absolute inset-0 z-20 pointer-events-none rounded-lg",
            style: { backgroundColor: flash.color, opacity: flash.alpha }
          }
        ),
        /* @__PURE__ */ jsx(
          "canvas",
          {
            ref: canvasRef,
            width,
            height,
            className: "absolute inset-0 w-full h-full",
            style: { imageRendering: "pixelated" }
          }
        )
      ]
    }
  );
}
function EmojiEffect({
  actionType,
  x,
  y,
  duration = 800,
  intensity = 1,
  onComplete,
  className,
  effectSpriteUrl,
  assetBaseUrl
}) {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState("enter");
  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("active"), 100);
    const exitTimer = setTimeout(() => setPhase("exit"), duration * 0.7);
    const doneTimer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, duration);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [duration, onComplete]);
  if (!visible) return null;
  const config = ACTION_EMOJI[actionType] ?? ACTION_EMOJI.melee;
  const scaleVal = phase === "enter" ? 0.3 : phase === "active" ? intensity : 0.5;
  const opacity = phase === "exit" ? 0 : 1;
  const resolvedSpriteUrl = effectSpriteUrl ? effectSpriteUrl.startsWith("http") || effectSpriteUrl.startsWith("/") ? effectSpriteUrl : assetBaseUrl ? `${assetBaseUrl.replace(/\/$/, "")}/${effectSpriteUrl}` : effectSpriteUrl : void 0;
  return /* @__PURE__ */ jsxs(
    Box,
    {
      className: cn(
        "fixed pointer-events-none z-50 flex items-center justify-center",
        "transition-all ease-out",
        className
      ),
      style: {
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scaleVal})`,
        opacity,
        transitionDuration: phase === "enter" ? "100ms" : "300ms"
      },
      children: [
        /* @__PURE__ */ jsx(
          Box,
          {
            className: "absolute rounded-full animate-ping",
            style: {
              width: 48 * intensity,
              height: 48 * intensity,
              backgroundColor: config.color,
              opacity: 0.25
            }
          }
        ),
        resolvedSpriteUrl ? /* @__PURE__ */ jsx(
          "img",
          {
            src: resolvedSpriteUrl,
            alt: config.label,
            className: "relative drop-shadow-lg",
            style: {
              width: `${3 * intensity}rem`,
              height: `${3 * intensity}rem`,
              objectFit: "contain",
              imageRendering: "pixelated"
            }
          }
        ) : /* @__PURE__ */ jsx(
          "span",
          {
            className: "relative text-3xl drop-shadow-lg",
            style: { fontSize: `${2 * intensity}rem` },
            role: "img",
            "aria-label": config.label,
            children: config.emoji
          }
        )
      ]
    }
  );
}
function CanvasEffect(props) {
  const eventBus = useEventBus();
  const { completeEvent, onComplete, ...rest } = props;
  const handleComplete = useCallback(() => {
    if (completeEvent) eventBus.emit(`UI:${completeEvent}`, {});
    onComplete?.();
  }, [completeEvent, eventBus, onComplete]);
  const enhancedProps = { ...rest, onComplete: handleComplete };
  if (props.assetManifest) {
    return /* @__PURE__ */ jsx(CanvasEffectEngine, { ...enhancedProps, assetManifest: props.assetManifest });
  }
  return /* @__PURE__ */ jsx(EmojiEffect, { ...enhancedProps });
}
CanvasEffect.displayName = "CanvasEffect";
function pickPath(entry) {
  if (Array.isArray(entry.path)) {
    return entry.path[Math.floor(Math.random() * entry.path.length)];
  }
  return entry.path;
}
function useGameAudio({
  manifest,
  baseUrl = "",
  initialMuted = false,
  initialVolume = 1
}) {
  const [muted, setMutedState] = useState(initialMuted);
  const [masterVolume, setMasterVolumeState] = useState(initialVolume);
  const mutedRef = useRef(muted);
  const volumeRef = useRef(masterVolume);
  const manifestRef = useRef(manifest);
  mutedRef.current = muted;
  volumeRef.current = masterVolume;
  manifestRef.current = manifest;
  const poolsRef = useRef(/* @__PURE__ */ new Map());
  const getOrCreateElement = useCallback((key) => {
    const entry = manifestRef.current[key];
    if (!entry) return null;
    let pool = poolsRef.current.get(key);
    if (!pool) {
      pool = [];
      poolsRef.current.set(key, pool);
    }
    const maxSize = entry.poolSize ?? 1;
    for (const audio of pool) {
      if (audio.paused && (audio.ended || audio.currentTime === 0)) {
        return audio;
      }
    }
    if (pool.length < maxSize) {
      const src = baseUrl + pickPath(entry);
      const audio = new Audio(src);
      audio.loop = entry.loop ?? false;
      pool.push(audio);
      return audio;
    }
    if (!entry.loop) {
      let oldest = pool[0];
      for (const audio of pool) {
        if (audio.currentTime > oldest.currentTime) {
          oldest = audio;
        }
      }
      oldest.pause();
      oldest.currentTime = 0;
      return oldest;
    }
    return null;
  }, [baseUrl]);
  const play = useCallback((key) => {
    if (mutedRef.current) return;
    const entry = manifestRef.current[key];
    if (!entry) return;
    const audio = getOrCreateElement(key);
    if (!audio) return;
    audio.volume = Math.min(1, (entry.volume ?? 1) * volumeRef.current);
    if (!entry.loop) {
      audio.currentTime = 0;
    }
    const promise = audio.play();
    if (promise) {
      promise.catch(() => {
      });
    }
  }, [getOrCreateElement]);
  const stop = useCallback((key) => {
    const pool = poolsRef.current.get(key);
    if (!pool) return;
    for (const audio of pool) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);
  const currentMusicKeyRef = useRef(null);
  const currentMusicElRef = useRef(null);
  const musicFadeRef = useRef(null);
  const pendingMusicKeyRef = useRef(null);
  const clearMusicFade = useCallback(() => {
    if (musicFadeRef.current) {
      clearInterval(musicFadeRef.current);
      musicFadeRef.current = null;
    }
  }, []);
  const playMusic = useCallback((key) => {
    if (key === currentMusicKeyRef.current) return;
    pendingMusicKeyRef.current = key;
    const entry = manifestRef.current[key];
    if (!entry) return;
    const fadeDurationMs = entry.crossfadeDurationMs ?? 1500;
    const stepMs = 50;
    const totalSteps = Math.max(1, fadeDurationMs / stepMs);
    const targetVolume = Math.min(1, (entry.volume ?? 1) * volumeRef.current);
    clearMusicFade();
    const src = baseUrl + (Array.isArray(entry.path) ? entry.path[0] : entry.path);
    const incoming = new Audio(src);
    incoming.loop = true;
    incoming.volume = 0;
    const outgoing = currentMusicElRef.current;
    const outgoingStartVol = outgoing?.volume ?? 0;
    currentMusicKeyRef.current = key;
    currentMusicElRef.current = incoming;
    if (!mutedRef.current) {
      incoming.play().catch(() => {
        currentMusicKeyRef.current = null;
        currentMusicElRef.current = outgoing;
      });
    }
    let step = 0;
    musicFadeRef.current = setInterval(() => {
      step++;
      const progress = Math.min(step / totalSteps, 1);
      incoming.volume = Math.min(1, targetVolume * progress);
      if (outgoing) {
        outgoing.volume = Math.max(0, outgoingStartVol * (1 - progress));
      }
      if (progress >= 1) {
        clearMusicFade();
        if (outgoing) {
          outgoing.pause();
          outgoing.src = "";
        }
      }
    }, stepMs);
  }, [baseUrl, clearMusicFade]);
  const stopMusic = useCallback((fadeDurationMs = 1e3) => {
    const outgoing = currentMusicElRef.current;
    if (!outgoing) return;
    currentMusicKeyRef.current = null;
    currentMusicElRef.current = null;
    pendingMusicKeyRef.current = null;
    clearMusicFade();
    const startVolume = outgoing.volume;
    const stepMs = 50;
    const totalSteps = Math.max(1, fadeDurationMs / stepMs);
    let step = 0;
    musicFadeRef.current = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      outgoing.volume = Math.max(0, startVolume * (1 - progress));
      if (progress >= 1) {
        clearMusicFade();
        outgoing.pause();
        outgoing.src = "";
      }
    }, stepMs);
  }, [clearMusicFade]);
  const stopAll = useCallback(() => {
    for (const pool of poolsRef.current.values()) {
      for (const audio of pool) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
    stopMusic(0);
  }, [stopMusic]);
  const setMuted = useCallback((value) => {
    setMutedState(value);
    if (value) {
      for (const [key, pool] of poolsRef.current.entries()) {
        if (manifestRef.current[key]?.loop) {
          for (const audio of pool) {
            if (!audio.paused) audio.pause();
          }
        }
      }
      currentMusicElRef.current?.pause();
    } else {
      for (const [key, pool] of poolsRef.current.entries()) {
        const entry = manifestRef.current[key];
        if (entry?.loop && entry?.autostart) {
          for (const audio of pool) {
            if (audio.paused) audio.play().catch(() => {
            });
          }
        }
      }
      const musicEl = currentMusicElRef.current;
      if (musicEl) {
        musicEl.play().catch(() => {
        });
      }
    }
  }, []);
  const setMasterVolume = useCallback((volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    setMasterVolumeState(clamped);
    for (const [key, pool] of poolsRef.current.entries()) {
      const entryVol = manifestRef.current[key]?.volume ?? 1;
      for (const audio of pool) {
        audio.volume = Math.min(1, entryVol * clamped);
      }
    }
    if (!musicFadeRef.current && currentMusicElRef.current) {
      const key = currentMusicKeyRef.current;
      const entryVol = key ? manifestRef.current[key]?.volume ?? 1 : 1;
      currentMusicElRef.current.volume = Math.min(1, entryVol * clamped);
    }
  }, []);
  const unlockedRef = useRef(false);
  useEffect(() => {
    const autoKeys = Object.keys(manifest).filter((k) => manifest[k].autostart);
    const hasPendingMusic = () => pendingMusicKeyRef.current !== null;
    const hasAutoStart = autoKeys.length > 0;
    if (!hasAutoStart && !hasPendingMusic()) return;
    const unlock = () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      if (!mutedRef.current) {
        for (const key of autoKeys) {
          play(key);
        }
        const pending = pendingMusicKeyRef.current;
        if (pending && pending !== currentMusicKeyRef.current) {
          playMusic(pending);
        }
      }
    };
    document.addEventListener("click", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });
    document.addEventListener("touchstart", unlock, { once: true });
    return () => {
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("touchstart", unlock);
    };
  }, [manifest, play, playMusic]);
  useEffect(() => {
    return () => {
      clearMusicFade();
      for (const pool of poolsRef.current.values()) {
        for (const audio of pool) {
          audio.pause();
          audio.src = "";
        }
      }
      poolsRef.current.clear();
      if (currentMusicElRef.current) {
        currentMusicElRef.current.pause();
        currentMusicElRef.current.src = "";
        currentMusicElRef.current = null;
      }
    };
  }, [clearMusicFade]);
  return {
    play,
    stop,
    stopAll,
    playMusic,
    stopMusic,
    muted,
    setMuted,
    masterVolume,
    setMasterVolume
  };
}
useGameAudio.displayName = "useGameAudio";
var GameAudioContext = createContext(null);
GameAudioContext.displayName = "GameAudioContext";
function useGameAudioContext() {
  const ctx = useContext(GameAudioContext);
  if (!ctx) {
    throw new Error("useGameAudioContext must be used inside <GameAudioProvider>");
  }
  return ctx;
}
function GameAudioProvider({
  manifest,
  baseUrl = "",
  children,
  initialMuted = false
}) {
  const eventBus = useEventBus();
  const { play, stop, stopAll, playMusic, stopMusic, muted, setMuted, masterVolume, setMasterVolume } = useGameAudio({ manifest, baseUrl, initialMuted });
  useEffect(() => {
    const unsubPlay = eventBus.on("UI:PLAY_SOUND", (event) => {
      const key = event.payload?.key;
      if (key) play(key);
    });
    const unsubStop = eventBus.on("UI:STOP_SOUND", (event) => {
      const key = event.payload?.key;
      if (key) {
        stop(key);
      } else {
        stopAll();
      }
    });
    const unsubChangeMusic = eventBus.on("UI:CHANGE_MUSIC", (event) => {
      const key = event.payload?.key;
      if (key) {
        playMusic(key);
      } else {
        stopMusic();
      }
    });
    const unsubStopMusic = eventBus.on("UI:STOP_MUSIC", () => {
      stopMusic();
    });
    return () => {
      unsubPlay();
      unsubStop();
      unsubChangeMusic();
      unsubStopMusic();
    };
  }, [eventBus, play, stop, stopAll, playMusic, stopMusic]);
  const value = { muted, setMuted, masterVolume, setMasterVolume, play, playMusic, stopMusic };
  return /* @__PURE__ */ jsx(GameAudioContext.Provider, { value, children });
}
GameAudioProvider.displayName = "GameAudioProvider";
function GameAudioToggle({
  size = "sm",
  className
}) {
  const { muted, setMuted } = useGameAudioContext();
  const handleToggle = useCallback(() => {
    setMuted(!muted);
  }, [muted, setMuted]);
  return /* @__PURE__ */ jsx(
    Button,
    {
      variant: "ghost",
      size,
      onClick: handleToggle,
      className: cn("text-lg leading-none px-2", className),
      "aria-pressed": muted,
      children: muted ? "\u{1F507}" : "\u{1F50A}"
    }
  );
}
GameAudioToggle.displayName = "GameAudioToggle";

// components/organisms/game/utils/spriteSheetConstants.ts
var SHEET_COLUMNS = 8;
var SPRITE_SHEET_LAYOUT = {
  idle: { row: 0, frames: 4, frameRate: 6, loop: true },
  walk: { row: 1, frames: 8, frameRate: 10, loop: true },
  attack: { row: 2, frames: 6, frameRate: 12, loop: false },
  hit: { row: 3, frames: 3, frameRate: 8, loop: false },
  death: { row: 4, frames: 6, frameRate: 8, loop: false }
};

// components/organisms/game/utils/spriteAnimation.ts
function inferDirection(dx, dy) {
  if (dx === 0 && dy === 0) return "se";
  if (dx >= 0 && dy >= 0) return "se";
  if (dx <= 0 && dy >= 0) return "sw";
  if (dx >= 0 && dy <= 0) return "ne";
  return "nw";
}
function resolveSheetDirection(facing) {
  switch (facing) {
    case "se":
      return { sheetDir: "se", flipX: false };
    case "sw":
      return { sheetDir: "sw", flipX: false };
    case "ne":
      return { sheetDir: "sw", flipX: true };
    case "nw":
      return { sheetDir: "se", flipX: true };
  }
}
function getCurrentFrame(animName, elapsed) {
  const def = SPRITE_SHEET_LAYOUT[animName];
  const frameDuration = 1e3 / def.frameRate;
  const totalDuration = def.frames * frameDuration;
  if (def.loop) {
    const frame2 = Math.floor(elapsed % totalDuration / frameDuration);
    return { frame: frame2, finished: false };
  }
  if (elapsed >= totalDuration) {
    return { frame: def.frames - 1, finished: true };
  }
  const frame = Math.floor(elapsed / frameDuration);
  return { frame, finished: false };
}
function resolveFrame(sheetUrls, frameDims, animState) {
  if (!sheetUrls) return null;
  const { sheetDir, flipX } = resolveSheetDirection(animState.direction);
  const sheetUrl = sheetUrls[sheetDir];
  if (!sheetUrl) return null;
  const def = SPRITE_SHEET_LAYOUT[animState.animation];
  const { frame } = getCurrentFrame(animState.animation, animState.elapsed);
  return {
    sheetUrl,
    sx: frame * frameDims.width,
    sy: def.row * frameDims.height,
    sw: frameDims.width,
    sh: frameDims.height,
    flipX
  };
}
function createUnitAnimationState(unitId) {
  return {
    unitId,
    animation: "idle",
    direction: "se",
    frame: 0,
    elapsed: 0,
    queuedAnimation: null,
    finished: false
  };
}
function transitionAnimation(state, newAnim, direction) {
  if (state.animation === "death" && state.finished) return state;
  if (state.animation === newAnim && SPRITE_SHEET_LAYOUT[newAnim].loop) {
    return direction ? { ...state, direction } : state;
  }
  return {
    ...state,
    animation: newAnim,
    direction: direction ?? state.direction,
    frame: 0,
    elapsed: 0,
    queuedAnimation: null,
    finished: false
  };
}
function tickAnimationState(state, deltaMs) {
  const newElapsed = state.elapsed + deltaMs;
  const { frame, finished } = getCurrentFrame(state.animation, newElapsed);
  const def = SPRITE_SHEET_LAYOUT[state.animation];
  if (finished && !def.loop && !state.finished) {
    if (state.animation === "death") {
      return { ...state, elapsed: newElapsed, frame, finished: true };
    }
    const nextAnim = state.queuedAnimation ?? "idle";
    return {
      ...state,
      animation: nextAnim,
      elapsed: 0,
      frame: 0,
      queuedAnimation: null,
      finished: false
    };
  }
  return { ...state, elapsed: newElapsed, frame, finished };
}

// components/organisms/game/hooks/useSpriteAnimations.ts
function useSpriteAnimations(getSheetUrls, getFrameDims, options = {}) {
  const speed = options.speed ?? 1;
  const animStatesRef = useRef(/* @__PURE__ */ new Map());
  const prevPositionsRef = useRef(/* @__PURE__ */ new Map());
  const unitDataRef = useRef(/* @__PURE__ */ new Map());
  const walkHoldRef = useRef(/* @__PURE__ */ new Map());
  const WALK_HOLD_MS = 600;
  const syncUnits = useCallback((units, deltaMs) => {
    const scaledDelta = deltaMs * speed;
    const states = animStatesRef.current;
    const prevPos = prevPositionsRef.current;
    const unitData = unitDataRef.current;
    const walkHold = walkHoldRef.current;
    const currentIds = /* @__PURE__ */ new Set();
    for (const unit of units) {
      currentIds.add(unit.id);
      unitData.set(unit.id, unit);
      let state = states.get(unit.id);
      if (!state) {
        state = createUnitAnimationState(unit.id);
        states.set(unit.id, state);
      }
      const sheetUrls = getSheetUrls(unit);
      if (!sheetUrls) continue;
      const prev = prevPos.get(unit.id);
      if (prev && unit.position) {
        const dx = unit.position.x - prev.x;
        const dy = unit.position.y - prev.y;
        if (dx !== 0 || dy !== 0) {
          const dir = inferDirection(dx, dy);
          if (state.animation !== "attack" && state.animation !== "hit" && state.animation !== "death") {
            state = transitionAnimation(state, "walk", dir);
            walkHold.set(unit.id, WALK_HOLD_MS);
          }
        } else if (state.animation === "walk") {
          const remaining = (walkHold.get(unit.id) ?? 0) - scaledDelta;
          if (remaining <= 0) {
            walkHold.delete(unit.id);
            state = transitionAnimation(state, "idle");
          } else {
            walkHold.set(unit.id, remaining);
          }
        }
      }
      if (unit.position) {
        prevPos.set(unit.id, { x: unit.position.x, y: unit.position.y });
      }
      state = tickAnimationState(state, scaledDelta);
      states.set(unit.id, state);
    }
    for (const id of states.keys()) {
      if (!currentIds.has(id)) {
        states.delete(id);
        prevPos.delete(id);
        unitData.delete(id);
        walkHold.delete(id);
      }
    }
  }, [getSheetUrls, speed]);
  const setUnitAnimation = useCallback((unitId, animation, direction) => {
    const states = animStatesRef.current;
    let state = states.get(unitId);
    if (!state) {
      state = createUnitAnimationState(unitId);
    }
    state = transitionAnimation(state, animation, direction);
    states.set(unitId, state);
  }, []);
  const resolveUnitFrame = useCallback((unitId) => {
    const state = animStatesRef.current.get(unitId);
    if (!state) return null;
    const unit = unitDataRef.current.get(unitId);
    if (!unit) return null;
    const sheetUrls = getSheetUrls(unit);
    const frameDims = getFrameDims(unit);
    if (!sheetUrls || !frameDims) return null;
    if (state.animation === "idle") {
      const idleState = { ...state, elapsed: 0};
      const frame = resolveFrame(sheetUrls, frameDims, idleState);
      return frame ? { ...frame, applyBreathing: true } : null;
    }
    return resolveFrame(sheetUrls, frameDims, state);
  }, [getSheetUrls, getFrameDims]);
  return { syncUnits, setUnitAnimation, resolveUnitFrame };
}

// components/organisms/game/managers/PhysicsManager.ts
var PhysicsManager = class {
  constructor(config = {}) {
    __publicField(this, "entities", /* @__PURE__ */ new Map());
    __publicField(this, "config");
    this.config = {
      gravity: 0.5,
      friction: 0.8,
      airResistance: 0.99,
      maxVelocityY: 20,
      groundY: 500,
      // Default ground position in pixels
      ...config
    };
  }
  /**
   * Register an entity for physics simulation
   */
  registerEntity(entityId, initialState = {}) {
    const state = {
      id: entityId,
      x: initialState.x ?? 0,
      y: initialState.y ?? 0,
      vx: initialState.vx ?? 0,
      vy: initialState.vy ?? 0,
      isGrounded: initialState.isGrounded ?? false,
      gravity: initialState.gravity ?? this.config.gravity,
      friction: initialState.friction ?? this.config.friction,
      airResistance: initialState.airResistance ?? this.config.airResistance,
      maxVelocityY: initialState.maxVelocityY ?? this.config.maxVelocityY,
      mass: initialState.mass ?? 1,
      restitution: initialState.restitution ?? 0.8,
      state: initialState.state ?? "Active"
    };
    this.entities.set(entityId, state);
    return state;
  }
  /**
   * Unregister an entity from physics simulation
   */
  unregisterEntity(entityId) {
    this.entities.delete(entityId);
  }
  /**
   * Get physics state for an entity
   */
  getState(entityId) {
    return this.entities.get(entityId);
  }
  /**
   * Get all registered entities
   */
  getAllEntities() {
    return Array.from(this.entities.values());
  }
  /**
   * Apply a force to an entity (impulse)
   */
  applyForce(entityId, fx, fy) {
    const state = this.entities.get(entityId);
    if (!state || state.state !== "Active") return;
    state.vx += fx;
    state.vy += fy;
  }
  /**
   * Set velocity directly
   */
  setVelocity(entityId, vx, vy) {
    const state = this.entities.get(entityId);
    if (!state) return;
    state.vx = vx;
    state.vy = vy;
  }
  /**
   * Set position directly
   */
  setPosition(entityId, x, y) {
    const state = this.entities.get(entityId);
    if (!state) return;
    state.x = x;
    state.y = y;
  }
  /**
   * Freeze/unfreeze an entity
   */
  setFrozen(entityId, frozen) {
    const state = this.entities.get(entityId);
    if (!state) return;
    state.state = frozen ? "Frozen" : "Active";
  }
  /**
   * Main tick function - call this every frame
   * Implements the logic from std-physics2d ticks
   */
  tick(deltaTime = 16) {
    for (const state of this.entities.values()) {
      if (state.state !== "Active") continue;
      this.applyGravity(state, deltaTime);
      this.applyVelocity(state, deltaTime);
      this.checkGroundCollision(state);
    }
  }
  /**
   * ApplyGravity tick implementation
   */
  applyGravity(state, deltaTime) {
    if (state.isGrounded) return;
    const gravityForce = state.gravity * (deltaTime / 16);
    state.vy = Math.min(state.maxVelocityY, state.vy + gravityForce);
  }
  /**
   * ApplyVelocity tick implementation
   */
  applyVelocity(state, deltaTime) {
    const dt = deltaTime / 16;
    state.vx *= Math.pow(state.airResistance, dt);
    state.x += state.vx * dt;
    state.y += state.vy * dt;
  }
  /**
   * Check and handle ground collision
   */
  checkGroundCollision(state) {
    const groundY = this.config.groundY;
    if (state.y >= groundY) {
      state.y = groundY;
      state.isGrounded = true;
      state.vy = 0;
      state.vx *= state.friction;
      if (Math.abs(state.vx) < 0.01) {
        state.vx = 0;
      }
    } else {
      state.isGrounded = false;
    }
  }
  /**
   * Check AABB collision between two entities
   */
  checkCollision(entityIdA, entityIdB, boundsA, boundsB) {
    const stateA = this.entities.get(entityIdA);
    const stateB = this.entities.get(entityIdB);
    if (!stateA || !stateB) return false;
    const absBoundsA = {
      x: stateA.x + boundsA.x,
      y: stateA.y + boundsA.y,
      width: boundsA.width,
      height: boundsA.height
    };
    const absBoundsB = {
      x: stateB.x + boundsB.x,
      y: stateB.y + boundsB.y,
      width: boundsB.width,
      height: boundsB.height
    };
    return absBoundsA.x < absBoundsB.x + absBoundsB.width && absBoundsA.x + absBoundsA.width > absBoundsB.x && absBoundsA.y < absBoundsB.y + absBoundsB.height && absBoundsA.y + absBoundsA.height > absBoundsB.y;
  }
  /**
   * Resolve collision with bounce
   */
  resolveCollision(entityIdA, entityIdB) {
    const stateA = this.entities.get(entityIdA);
    const stateB = this.entities.get(entityIdB);
    if (!stateA || !stateB) return;
    const restitution = Math.min(stateA.restitution ?? 0.8, stateB.restitution ?? 0.8);
    const tempVx = stateA.vx;
    const tempVy = stateA.vy;
    stateA.vx = stateB.vx * restitution;
    stateA.vy = stateB.vy * restitution;
    stateB.vx = tempVx * restitution;
    stateB.vy = tempVy * restitution;
    const dx = stateB.x - stateA.x;
    const dy = stateB.y - stateA.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0) {
      const overlap = 1;
      const nx = dx / distance;
      const ny = dy / distance;
      stateA.x -= nx * overlap * 0.5;
      stateA.y -= ny * overlap * 0.5;
      stateB.x += nx * overlap * 0.5;
      stateB.y += ny * overlap * 0.5;
    }
  }
  /**
   * Reset all physics state
   */
  reset() {
    this.entities.clear();
  }
};

// components/organisms/game/hooks/usePhysics2D.ts
function usePhysics2D(options = {}) {
  const physicsManagerRef = useRef(null);
  const collisionCallbacksRef = useRef(/* @__PURE__ */ new Set());
  if (!physicsManagerRef.current) {
    physicsManagerRef.current = new PhysicsManager({
      gravity: options.gravity,
      friction: options.friction,
      airResistance: options.airResistance,
      maxVelocityY: options.maxVelocityY,
      groundY: options.groundY
    });
  }
  const manager = physicsManagerRef.current;
  useEffect(() => {
    if (options.onCollision) {
      collisionCallbacksRef.current.add(options.onCollision);
    }
    return () => {
      if (options.onCollision) {
        collisionCallbacksRef.current.delete(options.onCollision);
      }
    };
  }, [options.onCollision]);
  const registerUnit = useCallback((unitId, initialState = {}) => {
    manager.registerEntity(unitId, initialState);
  }, [manager]);
  const unregisterUnit = useCallback((unitId) => {
    manager.unregisterEntity(unitId);
  }, [manager]);
  const getPosition = useCallback((unitId) => {
    const state = manager.getState(unitId);
    if (!state) return null;
    return { x: state.x, y: state.y };
  }, [manager]);
  const getState = useCallback((unitId) => {
    return manager.getState(unitId);
  }, [manager]);
  const applyForce = useCallback((unitId, fx, fy) => {
    manager.applyForce(unitId, fx, fy);
  }, [manager]);
  const setVelocity = useCallback((unitId, vx, vy) => {
    manager.setVelocity(unitId, vx, vy);
  }, [manager]);
  const setPosition = useCallback((unitId, x, y) => {
    manager.setPosition(unitId, x, y);
  }, [manager]);
  const tick = useCallback((deltaTime = 16) => {
    manager.tick(deltaTime);
  }, [manager]);
  const checkCollision = useCallback((unitIdA, unitIdB, boundsA, boundsB) => {
    return manager.checkCollision(unitIdA, unitIdB, boundsA, boundsB);
  }, [manager]);
  const resolveCollision = useCallback((unitIdA, unitIdB) => {
    manager.resolveCollision(unitIdA, unitIdB);
    collisionCallbacksRef.current.forEach((callback) => {
      callback(unitIdA, unitIdB);
    });
  }, [manager]);
  const setFrozen = useCallback((unitId, frozen) => {
    manager.setFrozen(unitId, frozen);
  }, [manager]);
  const getAllUnits = useCallback(() => {
    return manager.getAllEntities();
  }, [manager]);
  const reset = useCallback(() => {
    manager.reset();
  }, [manager]);
  return {
    registerUnit,
    unregisterUnit,
    getPosition,
    getState,
    applyForce,
    setVelocity,
    setPosition,
    tick,
    checkCollision,
    resolveCollision,
    setFrozen,
    getAllUnits,
    reset
  };
}
var sizeMap = {
  sm: "text-xs px-2 py-1",
  md: "text-sm px-3 py-1.5",
  lg: "text-base px-4 py-2"
};
var variantMap = {
  default: "bg-gray-800/80 border-gray-700",
  primary: "bg-blue-900/80 border-blue-700",
  success: "bg-green-900/80 border-green-700",
  warning: "bg-yellow-900/80 border-yellow-700",
  danger: "bg-red-900/80 border-red-700"
};
function StatBadge({
  label,
  value = 0,
  max,
  format = "number",
  icon,
  size = "md",
  variant = "default",
  className,
  // Ignored config props (used for schema binding)
  source: _source,
  field: _field
}) {
  const numValue = typeof value === "number" ? value : parseInt(String(value), 10) || 0;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "inline-flex items-center gap-2 rounded-lg border backdrop-blur-sm",
        sizeMap[size] ?? sizeMap.md,
        variantMap[variant] ?? variantMap.default,
        className
      ),
      children: [
        icon && /* @__PURE__ */ jsx("span", { className: "flex-shrink-0 text-lg", children: icon }),
        /* @__PURE__ */ jsx("span", { className: "text-gray-400 font-medium", children: label }),
        format === "hearts" && max && /* @__PURE__ */ jsx(
          HealthBar,
          {
            current: numValue,
            max,
            format: "hearts",
            size: size === "lg" ? "md" : "sm"
          }
        ),
        format === "bar" && max && /* @__PURE__ */ jsx(
          HealthBar,
          {
            current: numValue,
            max,
            format: "bar",
            size: size === "lg" ? "md" : "sm"
          }
        ),
        format === "number" && /* @__PURE__ */ jsx(
          ScoreDisplay,
          {
            value: numValue,
            size: size === "lg" ? "md" : "sm",
            animated: true
          }
        ),
        format === "text" && /* @__PURE__ */ jsx("span", { className: "font-bold text-white", children: value })
      ]
    }
  );
}
StatBadge.displayName = "StatBadge";
var positionMap = {
  top: "top-0 left-0 right-0 flex justify-between items-start p-4",
  bottom: "bottom-0 left-0 right-0 flex justify-between items-end p-4",
  corners: "inset-0 pointer-events-none"
};
function convertElementsToStats(elements) {
  return elements.map((el) => {
    const [source, field] = el.bind?.split(".") ?? [];
    const labelMap = {
      "health-bar": "Health",
      "score-display": "Score",
      lives: "Lives",
      timer: "Time"
    };
    return {
      label: el.label || labelMap[el.type] || el.type,
      source,
      field
    };
  });
}
function GameHud({
  position: propPosition,
  stats: propStats,
  items,
  elements,
  size = "md",
  className,
  transparent = true
}) {
  const stats = propStats ?? items ?? (elements ? convertElementsToStats(elements) : []);
  const position = propPosition ?? "corners";
  if (position === "corners") {
    const leftStats = stats.slice(0, Math.ceil(stats.length / 2));
    const rightStats = stats.slice(Math.ceil(stats.length / 2));
    return /* @__PURE__ */ jsxs("div", { className: cn("absolute", positionMap[position], className), children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-4 left-4 flex flex-col gap-2 pointer-events-auto", children: leftStats.map((stat, i) => /* @__PURE__ */ jsx(StatBadge, { ...stat, size }, i)) }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 flex flex-col gap-2 items-end pointer-events-auto", children: rightStats.map((stat, i) => /* @__PURE__ */ jsx(StatBadge, { ...stat, size }, i)) })
    ] });
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "absolute z-10",
        positionMap[position],
        transparent && "bg-gradient-to-b from-black/50 to-transparent",
        position === "bottom" && "bg-gradient-to-t from-black/50 to-transparent",
        className
      ),
      children: /* @__PURE__ */ jsx("div", { className: "flex gap-4", children: stats.map((stat, i) => /* @__PURE__ */ jsx(StatBadge, { ...stat, size }, i)) })
    }
  );
}
GameHud.displayName = "GameHud";
var variantMap2 = {
  primary: "bg-blue-600 hover:bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/25",
  secondary: "bg-gray-700 hover:bg-gray-600 text-white border-gray-500",
  ghost: "bg-transparent hover:bg-white/10 text-white border-white/20"
};
function GameMenu({
  title,
  subtitle,
  options,
  menuItems,
  onSelect,
  eventBus: eventBusProp,
  background,
  logo,
  className
}) {
  const resolvedOptions = options ?? menuItems ?? [];
  let eventBusFromHook = null;
  try {
    eventBusFromHook = useEventBus();
  } catch {
  }
  const eventBus = eventBusProp || eventBusFromHook;
  const handleOptionClick = React42.useCallback(
    (option) => {
      if (option.event && eventBus) {
        eventBus.emit(`UI:${option.event}`, { option });
      }
      if (onSelect) {
        onSelect(option);
      }
      if (option.navigatesTo && eventBus) {
        eventBus.emit("UI:NAVIGATE", { url: option.navigatesTo, option });
      }
    },
    [eventBus, onSelect]
  );
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "min-h-screen w-full flex flex-col items-center justify-center p-8",
        className
      ),
      style: {
        background: background ?? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0e17 100%)"
      },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center mb-12 animate-fade-in", children: [
          logo && /* @__PURE__ */ jsx(
            "img",
            {
              src: logo,
              alt: title,
              className: "h-24 w-auto mx-auto mb-6 drop-shadow-2xl"
            }
          ),
          /* @__PURE__ */ jsx(
            "h1",
            {
              className: "text-5xl md:text-7xl font-bold text-white tracking-tight",
              style: {
                textShadow: "0 4px 12px rgba(0,0,0,0.5)"
              },
              children: title
            }
          ),
          subtitle && /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg text-gray-400 tracking-widest uppercase", children: subtitle })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4 w-full max-w-md", children: resolvedOptions.map((option, index) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleOptionClick(option),
            disabled: option.disabled,
            className: cn(
              "w-full py-4 px-8 rounded-xl border-2 font-bold text-lg",
              "transition-all duration-200 transform",
              "hover:scale-105 active:scale-95",
              "focus:outline-none focus:ring-4 focus:ring-white/25",
              variantMap2[option.variant ?? "secondary"] ?? variantMap2.secondary,
              option.disabled && "opacity-50 cursor-not-allowed hover:scale-100"
            ),
            style: {
              animationDelay: `${index * 100}ms`
            },
            children: option.label
          },
          index
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 pointer-events-none overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" })
        ] })
      ]
    }
  );
}
GameMenu.displayName = "GameMenu";
var variantColors = {
  victory: {
    bg: "from-green-900/90 to-emerald-950/90",
    title: "text-green-400",
    accent: "border-green-500"
  },
  defeat: {
    bg: "from-red-900/90 to-gray-950/90",
    title: "text-red-400",
    accent: "border-red-500"
  },
  neutral: {
    bg: "from-gray-900/90 to-gray-950/90",
    title: "text-white",
    accent: "border-gray-500"
  }
};
var buttonVariants = {
  primary: "bg-blue-600 hover:bg-blue-500 text-white border-blue-400",
  secondary: "bg-gray-700 hover:bg-gray-600 text-white border-gray-500",
  ghost: "bg-transparent hover:bg-white/10 text-white border-white/20"
};
function formatTime(ms) {
  const seconds = Math.floor(ms / 1e3);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
function GameOverScreen({
  title,
  message,
  stats = [],
  actions,
  menuItems,
  onAction,
  eventBus: eventBusProp,
  variant = "neutral",
  highScore,
  currentScore,
  className
}) {
  const resolvedActions = actions ?? menuItems ?? [];
  let eventBusFromHook = null;
  try {
    eventBusFromHook = useEventBus();
  } catch {
  }
  const eventBus = eventBusProp || eventBusFromHook;
  const handleActionClick = React42.useCallback(
    (action) => {
      if (action.event && eventBus) {
        eventBus.emit(`UI:${action.event}`, { action });
      }
      if (onAction) {
        onAction(action);
      }
    },
    [eventBus, onAction]
  );
  const colors = variantColors[variant];
  const numericCurrentScore = typeof currentScore === "string" ? parseFloat(currentScore) : currentScore;
  const numericHighScore = typeof highScore === "string" ? parseFloat(highScore) : highScore;
  const isNewHighScore = numericHighScore !== void 0 && numericCurrentScore !== void 0 && !isNaN(numericCurrentScore) && !isNaN(numericHighScore) && numericCurrentScore > numericHighScore;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "min-h-screen w-full flex flex-col items-center justify-center p-8",
        "bg-gradient-to-b",
        colors.bg,
        className
      ),
      children: [
        variant === "victory" && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 pointer-events-none overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.2),transparent_70%)]" }) }),
        /* @__PURE__ */ jsx(
          "h1",
          {
            className: cn(
              "text-6xl md:text-8xl font-bold mb-4 tracking-tight animate-bounce-once",
              colors.title
            ),
            style: { textShadow: "0 4px 20px rgba(0,0,0,0.5)" },
            children: title
          }
        ),
        message && /* @__PURE__ */ jsx("p", { className: "text-xl text-gray-300 mb-8 text-center max-w-md", children: message }),
        isNewHighScore && /* @__PURE__ */ jsx("div", { className: "mb-6 px-6 py-2 bg-yellow-500/20 border-2 border-yellow-500 rounded-full animate-pulse", children: /* @__PURE__ */ jsx("span", { className: "text-yellow-400 font-bold text-lg tracking-wide", children: "\u{1F3C6} NEW HIGH SCORE! \u{1F3C6}" }) }),
        stats.length > 0 && /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "mb-8 p-6 rounded-xl border-2 bg-black/30",
              colors.accent
            ),
            children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: stats.map((stat, index) => {
              let displayValue = stat.value ?? 0;
              if (stat.format === "time" && typeof displayValue === "number") {
                displayValue = formatTime(displayValue);
              }
              return /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-sm mb-1", children: stat.label }),
                /* @__PURE__ */ jsxs("div", { className: "text-white text-2xl font-bold flex items-center justify-center gap-2", children: [
                  stat.icon && /* @__PURE__ */ jsx("span", { children: stat.icon }),
                  /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: displayValue })
                ] })
              ] }, index);
            }) })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row gap-4", children: resolvedActions.map((action, index) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleActionClick(action),
            className: cn(
              "px-8 py-4 rounded-xl border-2 font-bold text-lg",
              "transition-all duration-200",
              "hover:scale-105 active:scale-95",
              "focus:outline-none focus:ring-4 focus:ring-white/25",
              buttonVariants[action.variant ?? "secondary"]
            ),
            children: action.label
          },
          index
        )) })
      ]
    }
  );
}
GameOverScreen.displayName = "GameOverScreen";
function InventoryPanel({
  items,
  slots,
  columns,
  selectedSlot,
  onSelectSlot,
  onUseItem,
  onDropItem,
  selectSlotEvent,
  useItemEvent,
  dropItemEvent,
  showTooltips = true,
  className,
  slotSize = 48
}) {
  const eventBus = useEventBus();
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const slotArray = Array.from({ length: slots }, (_, index) => {
    return items[index] ?? null;
  });
  const rows = Math.ceil(slots / columns);
  const handleSlotClick = useCallback((index) => {
    if (selectSlotEvent) eventBus.emit(`UI:${selectSlotEvent}`, { index });
    onSelectSlot?.(index);
  }, [onSelectSlot, selectSlotEvent, eventBus]);
  const handleSlotDoubleClick = useCallback((index) => {
    const item = slotArray[index];
    if (item) {
      if (useItemEvent) eventBus.emit(`UI:${useItemEvent}`, { item });
      onUseItem?.(item);
    }
  }, [slotArray, onUseItem, useItemEvent, eventBus]);
  const handleKeyDown = useCallback((e, index) => {
    const item = slotArray[index];
    switch (e.key) {
      case "Enter":
      case " ":
        if (item) {
          e.preventDefault();
          if (useItemEvent) eventBus.emit(`UI:${useItemEvent}`, { item });
          onUseItem?.(item);
        }
        break;
      case "Delete":
      case "Backspace":
        if (item) {
          e.preventDefault();
          if (dropItemEvent) eventBus.emit(`UI:${dropItemEvent}`, { item });
          onDropItem?.(item);
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        onSelectSlot?.(Math.min(index + 1, slots - 1));
        break;
      case "ArrowLeft":
        e.preventDefault();
        onSelectSlot?.(Math.max(index - 1, 0));
        break;
      case "ArrowDown":
        e.preventDefault();
        onSelectSlot?.(Math.min(index + columns, slots - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        onSelectSlot?.(Math.max(index - columns, 0));
        break;
    }
  }, [slotArray, onUseItem, onDropItem, onSelectSlot, columns, slots, useItemEvent, dropItemEvent, eventBus]);
  const handleMouseEnter = useCallback((e, index) => {
    if (showTooltips && slotArray[index]) {
      setHoveredSlot(index);
      setTooltipPosition({
        x: e.clientX + 10,
        y: e.clientY + 10
      });
    }
  }, [showTooltips, slotArray]);
  const handleMouseLeave = useCallback(() => {
    setHoveredSlot(null);
  }, []);
  const hoveredItem = hoveredSlot !== null ? slotArray[hoveredSlot] : null;
  return /* @__PURE__ */ jsxs("div", { className: cn("relative", className), children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "grid gap-1 bg-gray-900 p-2 rounded-lg border border-gray-700",
        style: {
          gridTemplateColumns: `repeat(${columns}, ${slotSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${slotSize}px)`
        },
        children: slotArray.map((item, index) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: cn(
              "relative flex items-center justify-center",
              "bg-gray-800 border rounded transition-colors",
              "hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500",
              selectedSlot === index ? "border-yellow-400 bg-gray-700" : "border-gray-600"
            ),
            style: { width: slotSize, height: slotSize },
            onClick: () => handleSlotClick(index),
            onDoubleClick: () => handleSlotDoubleClick(index),
            onKeyDown: (e) => handleKeyDown(e, index),
            onMouseEnter: (e) => handleMouseEnter(e, index),
            onMouseLeave: handleMouseLeave,
            tabIndex: 0,
            "aria-label": item ? `${item.name || item.type}, quantity: ${item.quantity}` : `Empty slot ${index + 1}`,
            children: item && /* @__PURE__ */ jsxs(Fragment, { children: [
              item.sprite ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: item.sprite,
                  alt: item.name || item.type,
                  className: "w-8 h-8 object-contain",
                  style: { imageRendering: "pixelated" }
                }
              ) : /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-xs text-gray-300", children: item.type.charAt(0).toUpperCase() }),
              item.quantity > 1 && /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 rounded-tl", children: item.quantity })
            ] })
          },
          index
        ))
      }
    ),
    showTooltips && hoveredItem && /* @__PURE__ */ jsxs(
      "div",
      {
        className: "fixed z-50 bg-gray-900 border border-gray-600 rounded-lg p-2 shadow-lg pointer-events-none",
        style: {
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          maxWidth: 200
        },
        children: [
          /* @__PURE__ */ jsx("div", { className: "font-semibold text-white", children: hoveredItem.name || hoveredItem.type }),
          hoveredItem.description && /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-400 mt-1", children: hoveredItem.description }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [
            "Quantity: ",
            hoveredItem.quantity
          ] })
        ]
      }
    )
  ] });
}
function DialogueBox({
  dialogue,
  typewriterSpeed = 30,
  position = "bottom",
  onComplete,
  onChoice,
  onAdvance,
  completeEvent,
  choiceEvent,
  advanceEvent,
  className
}) {
  const eventBus = useEventBus();
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(0);
  const textRef = useRef(dialogue.text);
  const charIndexRef = useRef(0);
  const autoAdvanceTimerRef = useRef(null);
  useEffect(() => {
    textRef.current = dialogue.text;
    charIndexRef.current = 0;
    setDisplayedText("");
    setSelectedChoice(0);
    if (typewriterSpeed === 0) {
      setDisplayedText(dialogue.text);
      setIsTyping(false);
      if (completeEvent) eventBus.emit(`UI:${completeEvent}`, {});
      onComplete?.();
    } else {
      setIsTyping(true);
    }
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, [dialogue, typewriterSpeed, onComplete]);
  useEffect(() => {
    if (!isTyping || typewriterSpeed === 0) return;
    const interval = setInterval(() => {
      if (charIndexRef.current < textRef.current.length) {
        charIndexRef.current++;
        setDisplayedText(textRef.current.slice(0, charIndexRef.current));
      } else {
        setIsTyping(false);
        clearInterval(interval);
        if (completeEvent) eventBus.emit(`UI:${completeEvent}`, {});
        onComplete?.();
        if (dialogue.autoAdvance && !dialogue.choices?.length) {
          autoAdvanceTimerRef.current = setTimeout(() => {
            if (advanceEvent) eventBus.emit(`UI:${advanceEvent}`, {});
            onAdvance?.();
          }, dialogue.autoAdvance);
        }
      }
    }, typewriterSpeed);
    return () => clearInterval(interval);
  }, [isTyping, typewriterSpeed, dialogue.autoAdvance, dialogue.choices, onComplete, onAdvance]);
  const skipTypewriter = useCallback(() => {
    if (isTyping) {
      charIndexRef.current = textRef.current.length;
      setDisplayedText(textRef.current);
      setIsTyping(false);
      if (completeEvent) eventBus.emit(`UI:${completeEvent}`, {});
      onComplete?.();
    }
  }, [isTyping, onComplete, completeEvent, eventBus]);
  const handleClick = useCallback(() => {
    if (isTyping) {
      skipTypewriter();
    } else if (!dialogue.choices?.length) {
      if (advanceEvent) eventBus.emit(`UI:${advanceEvent}`, {});
      onAdvance?.();
    }
  }, [isTyping, skipTypewriter, dialogue.choices, onAdvance, advanceEvent, eventBus]);
  const handleKeyDown = useCallback((e) => {
    if (isTyping) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        skipTypewriter();
      }
      return;
    }
    if (dialogue.choices?.length) {
      const enabledChoices2 = dialogue.choices.filter((c) => !c.disabled);
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setSelectedChoice((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedChoice((prev) => Math.min(enabledChoices2.length - 1, prev + 1));
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          const choice = enabledChoices2[selectedChoice];
          if (choice) {
            if (choiceEvent) eventBus.emit(`UI:${choiceEvent}`, { choice });
            onChoice?.(choice);
          }
          break;
        case "1":
        case "2":
        case "3":
        case "4":
          const choiceIndex = parseInt(e.key) - 1;
          if (choiceIndex < enabledChoices2.length) {
            e.preventDefault();
            if (choiceEvent) eventBus.emit(`UI:${choiceEvent}`, { choice: enabledChoices2[choiceIndex] });
            onChoice?.(enabledChoices2[choiceIndex]);
          }
          break;
      }
    } else {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (advanceEvent) eventBus.emit(`UI:${advanceEvent}`, {});
        onAdvance?.();
      }
    }
  }, [isTyping, skipTypewriter, dialogue.choices, selectedChoice, onChoice, onAdvance, choiceEvent, advanceEvent, eventBus]);
  const enabledChoices = dialogue.choices?.filter((c) => !c.disabled) ?? [];
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "fixed left-0 right-0 z-40",
        position === "top" ? "top-0" : "bottom-0",
        className
      ),
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      tabIndex: 0,
      role: "dialog",
      "aria-label": "Dialogue",
      children: /* @__PURE__ */ jsx("div", { className: "mx-4 my-4 bg-gray-900 bg-opacity-95 border-2 border-gray-600 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "flex", children: [
        dialogue.portrait && /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 p-4 border-r border-gray-700", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: dialogue.portrait,
            alt: dialogue.speaker,
            className: "w-24 h-24 object-contain",
            style: { imageRendering: "pixelated" }
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-yellow-400 font-bold mb-2", children: dialogue.speaker }),
          /* @__PURE__ */ jsxs("div", { className: "text-white text-lg leading-relaxed min-h-[60px]", children: [
            displayedText,
            isTyping && /* @__PURE__ */ jsx("span", { className: "animate-pulse", children: "\u258C" })
          ] }),
          !isTyping && enabledChoices.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-2", children: enabledChoices.map((choice, index) => /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: cn(
                "block w-full text-left px-4 py-2 rounded transition-colors",
                "hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400",
                selectedChoice === index ? "bg-gray-700 text-yellow-400" : "bg-gray-800 text-white"
              ),
              onClick: (e) => {
                e.stopPropagation();
                if (choiceEvent) eventBus.emit(`UI:${choiceEvent}`, { choice });
                onChoice?.(choice);
              },
              children: [
                /* @__PURE__ */ jsxs("span", { className: "text-gray-500 mr-2", children: [
                  index + 1,
                  "."
                ] }),
                choice.text
              ]
            },
            index
          )) }),
          !isTyping && !dialogue.choices?.length && /* @__PURE__ */ jsx("div", { className: "mt-4 text-gray-500 text-sm animate-pulse", children: "Press SPACE or click to continue..." })
        ] })
      ] }) })
    }
  );
}
function BattleBoard({
  entity,
  scale = 0.45,
  unitScale = 1,
  header,
  sidebar,
  actions,
  overlay,
  gameOverOverlay,
  onAttack,
  onGameEnd,
  onUnitMove,
  calculateDamage: calculateDamage2,
  onDrawEffects,
  hasActiveEffects: hasActiveEffects2 = false,
  effectSpriteUrls = [],
  resolveUnitFrame,
  tileClickEvent,
  unitClickEvent,
  endTurnEvent,
  cancelEvent,
  gameEndEvent,
  playAgainEvent,
  attackEvent,
  className
}) {
  const tiles = entity.tiles;
  const features = entity.features ?? [];
  const boardWidth = entity.boardWidth ?? 8;
  const boardHeight = entity.boardHeight ?? 6;
  const assetManifest = entity.assetManifest;
  const backgroundImage = entity.backgroundImage;
  const units = entity.units;
  const selectedUnitId = entity.selectedUnitId;
  const currentPhase = entity.phase;
  const currentTurn = entity.turn;
  const gameResult = entity.gameResult;
  const eventBus = useEventBus();
  const [hoveredTile, setHoveredTile] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const selectedUnit = useMemo(
    () => units.find((u) => u.id === selectedUnitId) ?? null,
    [units, selectedUnitId]
  );
  const hoveredUnit = useMemo(() => {
    if (!hoveredTile) return null;
    return units.find(
      (u) => u.position.x === hoveredTile.x && u.position.y === hoveredTile.y && u.health > 0
    ) ?? null;
  }, [hoveredTile, units]);
  const playerUnits = useMemo(() => units.filter((u) => u.team === "player" && u.health > 0), [units]);
  const enemyUnits = useMemo(() => units.filter((u) => u.team === "enemy" && u.health > 0), [units]);
  const validMoves = useMemo(() => {
    if (!selectedUnit || currentPhase !== "movement") return [];
    const moves = [];
    const range = selectedUnit.movement;
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const nx = selectedUnit.position.x + dx;
        const ny = selectedUnit.position.y + dy;
        const dist = Math.abs(dx) + Math.abs(dy);
        if (dist > 0 && dist <= range && nx >= 0 && nx < boardWidth && ny >= 0 && ny < boardHeight && !units.some((u) => u.position.x === nx && u.position.y === ny && u.health > 0)) {
          moves.push({ x: nx, y: ny });
        }
      }
    }
    return moves;
  }, [selectedUnit, currentPhase, units, boardWidth, boardHeight]);
  const attackTargets = useMemo(() => {
    if (!selectedUnit || currentPhase !== "action") return [];
    return units.filter((u) => u.team !== selectedUnit.team && u.health > 0).filter((u) => {
      const dx = Math.abs(u.position.x - selectedUnit.position.x);
      const dy = Math.abs(u.position.y - selectedUnit.position.y);
      return dx <= 1 && dy <= 1 && dx + dy > 0;
    }).map((u) => u.position);
  }, [selectedUnit, currentPhase, units]);
  const MOVE_SPEED_MS_PER_TILE = 300;
  const movementAnimRef = useRef(null);
  const [movingPositions, setMovingPositions] = useState(/* @__PURE__ */ new Map());
  const startMoveAnimation = useCallback((unitId, from, to, onComplete) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.max(Math.abs(dx), Math.abs(dy));
    const duration = dist * MOVE_SPEED_MS_PER_TILE;
    movementAnimRef.current = { unitId, from, to, elapsed: 0, duration, onComplete };
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      const anim2 = movementAnimRef.current;
      if (!anim2) return;
      anim2.elapsed += 16;
      const t = Math.min(anim2.elapsed / anim2.duration, 1);
      const eased = 1 - (1 - t) * (1 - t);
      const cx = anim2.from.x + (anim2.to.x - anim2.from.x) * eased;
      const cy = anim2.from.y + (anim2.to.y - anim2.from.y) * eased;
      if (t >= 1) {
        movementAnimRef.current = null;
        setMovingPositions((prev) => {
          const next = new Map(prev);
          next.delete(anim2.unitId);
          return next;
        });
        anim2.onComplete();
      } else {
        setMovingPositions((prev) => {
          const next = new Map(prev);
          next.set(anim2.unitId, { x: cx, y: cy });
          return next;
        });
      }
    }, 16);
    return () => clearInterval(interval);
  }, []);
  const isoUnits = useMemo(() => {
    return units.filter((u) => u.health > 0).map((unit) => {
      const pos = movingPositions.get(unit.id) ?? unit.position;
      return {
        id: unit.id,
        position: pos,
        name: unit.name,
        team: unit.team,
        health: unit.health,
        maxHealth: unit.maxHealth,
        unitType: unit.unitType,
        heroId: unit.heroId,
        sprite: unit.sprite,
        traits: unit.traits?.map((t) => ({
          name: t.name,
          currentState: t.currentState,
          states: t.states,
          cooldown: t.cooldown ?? 0
        }))
      };
    });
  }, [units, movingPositions]);
  const maxY = Math.max(...tiles.map((t) => t.y), 0);
  const baseOffsetX = (maxY + 1) * (TILE_WIDTH * scale / 2);
  const tileToScreen = useCallback(
    (tx, ty) => isoToScreen(tx, ty, scale, baseOffsetX),
    [scale, baseOffsetX]
  );
  const checkGameEnd = useCallback(() => {
    const pa = units.filter((u) => u.team === "player" && u.health > 0);
    const ea = units.filter((u) => u.team === "enemy" && u.health > 0);
    if (pa.length === 0) {
      onGameEnd?.("defeat");
      if (gameEndEvent) {
        eventBus.emit(`UI:${gameEndEvent}`, { result: "defeat" });
      }
    } else if (ea.length === 0) {
      onGameEnd?.("victory");
      if (gameEndEvent) {
        eventBus.emit(`UI:${gameEndEvent}`, { result: "victory" });
      }
    }
  }, [units, onGameEnd, gameEndEvent, eventBus]);
  const handleUnitClick = useCallback((unitId) => {
    const unit = units.find((u) => u.id === unitId);
    if (!unit) return;
    if (unitClickEvent) {
      eventBus.emit(`UI:${unitClickEvent}`, { unitId });
    }
    if (currentPhase === "action" && selectedUnit) {
      if (unit.team === "enemy" && attackTargets.some((t) => t.x === unit.position.x && t.y === unit.position.y)) {
        const damage = calculateDamage2 ? calculateDamage2(selectedUnit, unit) : Math.max(1, selectedUnit.attack - unit.defense);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
        onAttack?.(selectedUnit, unit, damage);
        if (attackEvent) {
          eventBus.emit(`UI:${attackEvent}`, {
            attackerId: selectedUnit.id,
            targetId: unit.id,
            damage
          });
        }
        setTimeout(checkGameEnd, 100);
      }
    }
  }, [currentPhase, selectedUnit, attackTargets, units, checkGameEnd, onAttack, calculateDamage2, unitClickEvent, attackEvent, eventBus]);
  const handleTileClick = useCallback((x, y) => {
    if (tileClickEvent) {
      eventBus.emit(`UI:${tileClickEvent}`, { x, y });
    }
    if (currentPhase === "movement" && selectedUnit) {
      if (movementAnimRef.current) return;
      if (validMoves.some((m) => m.x === x && m.y === y)) {
        const from = { ...selectedUnit.position };
        const to = { x, y };
        startMoveAnimation(selectedUnit.id, from, to, () => {
          onUnitMove?.(selectedUnit, to);
        });
      }
    }
  }, [currentPhase, selectedUnit, validMoves, startMoveAnimation, onUnitMove, tileClickEvent, eventBus]);
  const handleEndTurn = useCallback(() => {
    if (endTurnEvent) {
      eventBus.emit(`UI:${endTurnEvent}`, {});
    }
  }, [endTurnEvent, eventBus]);
  const handleCancel = useCallback(() => {
    if (cancelEvent) {
      eventBus.emit(`UI:${cancelEvent}`, {});
    }
  }, [cancelEvent, eventBus]);
  const handleReset = useCallback(() => {
    if (playAgainEvent) {
      eventBus.emit(`UI:${playAgainEvent}`, {});
    }
  }, [playAgainEvent, eventBus]);
  const ctx = useMemo(
    () => ({
      phase: currentPhase,
      turn: currentTurn,
      selectedUnit,
      hoveredUnit,
      playerUnits,
      enemyUnits,
      gameResult,
      onEndTurn: handleEndTurn,
      onCancel: handleCancel,
      onReset: handleReset,
      attackTargets,
      tileToScreen
    }),
    [
      currentPhase,
      currentTurn,
      selectedUnit,
      hoveredUnit,
      playerUnits,
      enemyUnits,
      gameResult,
      handleEndTurn,
      handleCancel,
      handleReset,
      attackTargets,
      tileToScreen
    ]
  );
  const shakeStyle = isShaking ? { animation: "battle-shake 0.3s ease-in-out" } : {};
  return /* @__PURE__ */ jsxs("div", { className: cn("battle-board relative flex flex-col min-h-[600px] bg-[var(--color-background)]", className), children: [
    /* @__PURE__ */ jsx("style", { children: `
                @keyframes battle-shake {
                    0%, 100% { transform: translate(0, 0); }
                    10% { transform: translate(-3px, -2px); }
                    20% { transform: translate(3px, 1px); }
                    30% { transform: translate(-2px, 3px); }
                    40% { transform: translate(2px, -1px); }
                    50% { transform: translate(-3px, 2px); }
                    60% { transform: translate(3px, -2px); }
                    70% { transform: translate(-1px, 3px); }
                    80% { transform: translate(2px, -3px); }
                    90% { transform: translate(-2px, 1px); }
                }
            ` }),
    header && /* @__PURE__ */ jsx("div", { className: "p-4", children: header(ctx) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 gap-4 p-4 pt-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1", style: shakeStyle, children: [
        /* @__PURE__ */ jsx(
          IsometricCanvas_default,
          {
            tiles,
            units: isoUnits,
            features,
            selectedUnitId,
            validMoves,
            attackTargets,
            hoveredTile,
            onTileClick: handleTileClick,
            onUnitClick: handleUnitClick,
            onTileHover: (x, y) => setHoveredTile({ x, y }),
            onTileLeave: () => setHoveredTile(null),
            scale,
            assetBaseUrl: assetManifest?.baseUrl,
            assetManifest,
            backgroundImage,
            onDrawEffects,
            hasActiveEffects: hasActiveEffects2,
            effectSpriteUrls,
            resolveUnitFrame,
            unitScale
          }
        ),
        overlay && overlay(ctx)
      ] }),
      sidebar && /* @__PURE__ */ jsx("div", { className: "w-80 shrink-0", children: sidebar(ctx) })
    ] }),
    actions ? actions(ctx) : currentPhase !== "game_over" && /* @__PURE__ */ jsxs("div", { className: "fixed bottom-6 right-6 z-50 flex gap-2", children: [
      (currentPhase === "movement" || currentPhase === "action") && /* @__PURE__ */ jsx(
        "button",
        {
          className: "px-4 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] border border-[var(--color-border)] shadow-xl hover:opacity-90",
          onClick: handleCancel,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white shadow-xl hover:opacity-90",
          onClick: handleEndTurn,
          children: "End Turn"
        }
      )
    ] }),
    gameResult && (gameOverOverlay ? gameOverOverlay(ctx) : /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-6 p-8", children: [
      /* @__PURE__ */ jsx(
        "h2",
        {
          className: cn(
            "text-4xl font-black tracking-widest uppercase",
            gameResult === "victory" ? "text-yellow-400" : "text-red-500"
          ),
          children: gameResult === "victory" ? "Victory!" : "Defeat"
        }
      ),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-300", children: [
        "Turns played: ",
        currentTurn
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "px-8 py-3 rounded-lg bg-[var(--color-primary)] text-white font-semibold hover:opacity-90",
          onClick: handleReset,
          children: "Play Again"
        }
      )
    ] }) }))
  ] });
}
BattleBoard.displayName = "BattleBoard";
function useBattleState(initialUnits, eventConfig = {}, callbacks = {}) {
  const eventBus = useEventBus();
  const {
    tileClickEvent,
    unitClickEvent,
    endTurnEvent,
    gameEndEvent,
    playAgainEvent,
    attackEvent,
    cancelEvent
  } = eventConfig;
  const { onAttack, onGameEnd, onUnitMove, calculateDamage: calculateDamage2 } = callbacks;
  const [units, setUnits] = useState(initialUnits);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [phase, setPhase] = useState("observation");
  const [turn, setTurn] = useState(1);
  const [gameResult, setGameResult] = useState(null);
  const checkGameEnd = useCallback((currentUnits) => {
    const pa = currentUnits.filter((u) => u.team === "player" && u.health > 0);
    const ea = currentUnits.filter((u) => u.team === "enemy" && u.health > 0);
    if (pa.length === 0) {
      setGameResult("defeat");
      setPhase("game_over");
      onGameEnd?.("defeat");
      if (gameEndEvent) {
        eventBus.emit(`UI:${gameEndEvent}`, { result: "defeat" });
      }
    } else if (ea.length === 0) {
      setGameResult("victory");
      setPhase("game_over");
      onGameEnd?.("victory");
      if (gameEndEvent) {
        eventBus.emit(`UI:${gameEndEvent}`, { result: "victory" });
      }
    }
  }, [onGameEnd, gameEndEvent, eventBus]);
  const handleUnitClick = useCallback((unitId) => {
    const unit = units.find((u) => u.id === unitId);
    if (!unit) return;
    if (unitClickEvent) {
      eventBus.emit(`UI:${unitClickEvent}`, { unitId });
    }
    if (phase === "observation" || phase === "selection") {
      if (unit.team === "player") {
        setSelectedUnitId(unitId);
        setPhase("movement");
      }
    } else if (phase === "action") {
      const selectedUnit = units.find((u) => u.id === selectedUnitId);
      if (!selectedUnit) return;
      if (unit.team === "enemy") {
        const dx = Math.abs(unit.position.x - selectedUnit.position.x);
        const dy = Math.abs(unit.position.y - selectedUnit.position.y);
        if (dx <= 1 && dy <= 1 && dx + dy > 0) {
          const damage = calculateDamage2 ? calculateDamage2(selectedUnit, unit) : Math.max(1, selectedUnit.attack - unit.defense);
          const newHealth = Math.max(0, unit.health - damage);
          const updatedUnits = units.map(
            (u) => u.id === unit.id ? { ...u, health: newHealth } : u
          );
          setUnits(updatedUnits);
          onAttack?.(selectedUnit, unit, damage);
          if (attackEvent) {
            eventBus.emit(`UI:${attackEvent}`, {
              attackerId: selectedUnit.id,
              targetId: unit.id,
              damage
            });
          }
          setSelectedUnitId(null);
          setPhase("observation");
          setTurn((t) => t + 1);
          setTimeout(() => checkGameEnd(updatedUnits), 100);
        }
      }
    }
  }, [units, selectedUnitId, phase, checkGameEnd, onAttack, calculateDamage2, unitClickEvent, attackEvent, eventBus]);
  const handleTileClick = useCallback((x, y) => {
    if (tileClickEvent) {
      eventBus.emit(`UI:${tileClickEvent}`, { x, y });
    }
    if (phase === "movement" && selectedUnitId) {
      const selectedUnit = units.find((u) => u.id === selectedUnitId);
      if (!selectedUnit) return;
      const dx = Math.abs(x - selectedUnit.position.x);
      const dy = Math.abs(y - selectedUnit.position.y);
      const dist = dx + dy;
      if (dist > 0 && dist <= selectedUnit.movement) {
        if (!units.some((u) => u.position.x === x && u.position.y === y && u.health > 0)) {
          setUnits(
            (prev) => prev.map(
              (u) => u.id === selectedUnitId ? { ...u, position: { x, y } } : u
            )
          );
          setPhase("action");
          onUnitMove?.(selectedUnit, { x, y });
        }
      }
    }
  }, [phase, selectedUnitId, units, tileClickEvent, eventBus, onUnitMove]);
  const handleEndTurn = useCallback(() => {
    setSelectedUnitId(null);
    setPhase("observation");
    setTurn((t) => t + 1);
    if (endTurnEvent) {
      eventBus.emit(`UI:${endTurnEvent}`, {});
    }
  }, [endTurnEvent, eventBus]);
  const handleRestart = useCallback(() => {
    setUnits(initialUnits);
    setSelectedUnitId(null);
    setPhase("observation");
    setTurn(1);
    setGameResult(null);
    if (playAgainEvent) {
      eventBus.emit(`UI:${playAgainEvent}`, {});
    }
  }, [initialUnits, playAgainEvent, eventBus]);
  return {
    units,
    selectedUnitId,
    phase,
    turn,
    gameResult,
    handleTileClick,
    handleUnitClick,
    handleEndTurn,
    handleRestart
  };
}
function UncontrolledBattleBoard({ entity, ...rest }) {
  const battleState = useBattleState(
    entity.initialUnits,
    {
      tileClickEvent: rest.tileClickEvent,
      unitClickEvent: rest.unitClickEvent,
      endTurnEvent: rest.endTurnEvent,
      cancelEvent: rest.cancelEvent,
      attackEvent: rest.attackEvent,
      gameEndEvent: rest.gameEndEvent,
      playAgainEvent: rest.playAgainEvent
    },
    {
      onAttack: rest.onAttack,
      onGameEnd: rest.onGameEnd,
      onUnitMove: rest.onUnitMove,
      calculateDamage: rest.calculateDamage
    }
  );
  return /* @__PURE__ */ jsx(
    BattleBoard,
    {
      ...rest,
      entity: {
        ...entity,
        units: battleState.units,
        phase: battleState.phase,
        turn: battleState.turn,
        gameResult: battleState.gameResult,
        selectedUnitId: battleState.selectedUnitId
      }
    }
  );
}
UncontrolledBattleBoard.displayName = "UncontrolledBattleBoard";
function defaultIsInRange(from, to, range) {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y) <= range;
}
function WorldMapBoard({
  entity,
  scale = 0.4,
  unitScale = 2.5,
  allowMoveAllHeroes = false,
  isInRange = defaultIsInRange,
  heroSelectEvent,
  heroMoveEvent,
  battleEncounterEvent,
  featureEnterEvent,
  tileClickEvent,
  header,
  sidePanel,
  overlay,
  footer,
  onHeroSelect,
  onHeroMove,
  onBattleEncounter,
  onFeatureEnter,
  diamondTopY,
  enableCamera,
  effectSpriteUrls = [],
  resolveUnitFrame,
  className
}) {
  const eventBus = useEventBus();
  const hexes = entity.hexes;
  const heroes = entity.heroes;
  const features = entity.features ?? [];
  const selectedHeroId = entity.selectedHeroId;
  const assetManifest = entity.assetManifest;
  const backgroundImage = entity.backgroundImage;
  const [hoveredTile, setHoveredTile] = useState(null);
  const selectedHero = useMemo(
    () => heroes.find((h) => h.id === selectedHeroId) ?? null,
    [heroes, selectedHeroId]
  );
  const tiles = useMemo(
    () => hexes.map((hex) => ({
      x: hex.x,
      y: hex.y,
      terrain: hex.terrain,
      terrainSprite: hex.terrainSprite
    })),
    [hexes]
  );
  const baseUnits = useMemo(
    () => heroes.map((hero) => ({
      id: hero.id,
      position: hero.position,
      name: hero.name,
      team: hero.owner === "enemy" ? "enemy" : "player",
      health: 100,
      maxHealth: 100,
      sprite: hero.sprite
    })),
    [heroes]
  );
  const MOVE_SPEED_MS_PER_TILE = 300;
  const movementAnimRef = useRef(null);
  const [movingPositions, setMovingPositions] = useState(/* @__PURE__ */ new Map());
  const startMoveAnimation = useCallback((heroId, from, to, onComplete) => {
    const dist = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y));
    movementAnimRef.current = { heroId, from, to, elapsed: 0, duration: dist * MOVE_SPEED_MS_PER_TILE, onComplete };
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      const anim2 = movementAnimRef.current;
      if (!anim2) return;
      anim2.elapsed += 16;
      const t = Math.min(anim2.elapsed / anim2.duration, 1);
      const eased = 1 - (1 - t) * (1 - t);
      const cx = anim2.from.x + (anim2.to.x - anim2.from.x) * eased;
      const cy = anim2.from.y + (anim2.to.y - anim2.from.y) * eased;
      if (t >= 1) {
        movementAnimRef.current = null;
        setMovingPositions((prev) => {
          const n = new Map(prev);
          n.delete(anim2.heroId);
          return n;
        });
        anim2.onComplete();
      } else {
        setMovingPositions((prev) => {
          const n = new Map(prev);
          n.set(anim2.heroId, { x: cx, y: cy });
          return n;
        });
      }
    }, 16);
    return () => clearInterval(interval);
  }, []);
  const isoUnits = useMemo(() => {
    if (movingPositions.size === 0) return baseUnits;
    return baseUnits.map((u) => {
      const pos = movingPositions.get(u.id);
      return pos ? { ...u, position: pos } : u;
    });
  }, [baseUnits, movingPositions]);
  const validMoves = useMemo(() => {
    if (!selectedHero || selectedHero.movement <= 0) return [];
    const moves = [];
    hexes.forEach((hex) => {
      if (hex.passable === false) return;
      if (hex.x === selectedHero.position.x && hex.y === selectedHero.position.y) return;
      if (!isInRange(selectedHero.position, { x: hex.x, y: hex.y }, selectedHero.movement)) return;
      if (heroes.some((h) => h.position.x === hex.x && h.position.y === hex.y && h.owner === selectedHero.owner)) return;
      moves.push({ x: hex.x, y: hex.y });
    });
    return moves;
  }, [selectedHero, hexes, heroes, isInRange]);
  const attackTargets = useMemo(() => {
    if (!selectedHero || selectedHero.movement <= 0) return [];
    return heroes.filter((h) => h.owner !== selectedHero.owner).filter((h) => isInRange(selectedHero.position, h.position, selectedHero.movement)).map((h) => h.position);
  }, [selectedHero, heroes, isInRange]);
  const maxY = Math.max(...hexes.map((h) => h.y), 0);
  const baseOffsetX = (maxY + 1) * (TILE_WIDTH * scale / 2);
  const tileToScreen = useCallback(
    (tx, ty) => isoToScreen(tx, ty, scale, baseOffsetX),
    [scale, baseOffsetX]
  );
  const hoveredHex = useMemo(
    () => hoveredTile ? hexes.find((h) => h.x === hoveredTile.x && h.y === hoveredTile.y) ?? null : null,
    [hoveredTile, hexes]
  );
  const hoveredHero = useMemo(
    () => hoveredTile ? heroes.find((h) => h.position.x === hoveredTile.x && h.position.y === hoveredTile.y) ?? null : null,
    [hoveredTile, heroes]
  );
  const handleTileClick = useCallback((x, y) => {
    if (movementAnimRef.current) return;
    const hex = hexes.find((h) => h.x === x && h.y === y);
    if (!hex) return;
    if (tileClickEvent) {
      eventBus.emit(`UI:${tileClickEvent}`, { x, y });
    }
    if (selectedHero && validMoves.some((m) => m.x === x && m.y === y)) {
      startMoveAnimation(selectedHero.id, { ...selectedHero.position }, { x, y }, () => {
        onHeroMove?.(selectedHero.id, x, y);
        if (heroMoveEvent) {
          eventBus.emit(`UI:${heroMoveEvent}`, { heroId: selectedHero.id, toX: x, toY: y });
        }
        if (hex.feature && hex.feature !== "none") {
          onFeatureEnter?.(selectedHero.id, hex);
          if (featureEnterEvent) {
            eventBus.emit(`UI:${featureEnterEvent}`, { heroId: selectedHero.id, feature: hex.feature, hex });
          }
        }
      });
      return;
    }
    const enemy = heroes.find((h) => h.position.x === x && h.position.y === y && h.owner === "enemy");
    if (selectedHero && enemy && attackTargets.some((t) => t.x === x && t.y === y)) {
      onBattleEncounter?.(selectedHero.id, enemy.id);
      if (battleEncounterEvent) {
        eventBus.emit(`UI:${battleEncounterEvent}`, { attackerId: selectedHero.id, defenderId: enemy.id });
      }
    }
  }, [hexes, heroes, selectedHero, validMoves, attackTargets, startMoveAnimation, onHeroMove, onFeatureEnter, onBattleEncounter, eventBus, tileClickEvent, heroMoveEvent, featureEnterEvent, battleEncounterEvent]);
  const handleUnitClick = useCallback((unitId) => {
    const hero = heroes.find((h) => h.id === unitId);
    if (hero && (hero.owner === "player" || allowMoveAllHeroes)) {
      onHeroSelect?.(unitId);
      if (heroSelectEvent) {
        eventBus.emit(`UI:${heroSelectEvent}`, { heroId: unitId });
      }
    }
  }, [heroes, onHeroSelect, allowMoveAllHeroes, eventBus, heroSelectEvent]);
  const selectHero = useCallback((id) => {
    onHeroSelect?.(id);
    if (heroSelectEvent) {
      eventBus.emit(`UI:${heroSelectEvent}`, { heroId: id });
    }
  }, [onHeroSelect, eventBus, heroSelectEvent]);
  const ctx = useMemo(
    () => ({
      hoveredTile,
      hoveredHex,
      hoveredHero,
      selectedHero,
      validMoves,
      selectHero,
      tileToScreen,
      scale
    }),
    [hoveredTile, hoveredHex, hoveredHero, selectedHero, validMoves, selectHero, tileToScreen, scale]
  );
  return /* @__PURE__ */ jsxs(VStack, { className: cn("world-map-board min-h-screen bg-[var(--color-background)]", className), gap: "none", children: [
    header && header(ctx),
    /* @__PURE__ */ jsxs(HStack, { className: "flex-1 overflow-hidden", gap: "none", children: [
      /* @__PURE__ */ jsxs(Stack, { className: "flex-1 overflow-auto p-4 relative", children: [
        /* @__PURE__ */ jsx(
          IsometricCanvas_default,
          {
            tiles,
            units: isoUnits,
            features,
            selectedUnitId: selectedHeroId,
            validMoves,
            attackTargets,
            hoveredTile,
            onTileClick: handleTileClick,
            onUnitClick: handleUnitClick,
            onTileHover: (x, y) => setHoveredTile({ x, y }),
            onTileLeave: () => setHoveredTile(null),
            scale,
            assetBaseUrl: assetManifest?.baseUrl,
            assetManifest,
            backgroundImage,
            effectSpriteUrls,
            resolveUnitFrame,
            unitScale,
            diamondTopY,
            enableCamera
          }
        ),
        overlay && overlay(ctx)
      ] }),
      sidePanel && /* @__PURE__ */ jsx(Stack, { className: "w-80 shrink-0 border-l border-[var(--color-border)] bg-[var(--color-surface)] overflow-y-auto p-4", children: sidePanel(ctx) })
    ] }),
    footer && footer(ctx)
  ] });
}
WorldMapBoard.displayName = "WorldMapBoard";
function CastleBoard({
  entity,
  scale = 0.45,
  header,
  sidePanel,
  overlay,
  footer,
  onFeatureClick,
  onUnitClick,
  onTileClick,
  featureClickEvent,
  unitClickEvent,
  tileClickEvent,
  className
}) {
  const eventBus = useEventBus();
  const tiles = entity.tiles;
  const features = entity.features ?? [];
  const units = entity.units ?? [];
  const assetManifest = entity.assetManifest;
  const backgroundImage = entity.backgroundImage;
  const [hoveredTile, setHoveredTile] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const hoveredFeature = useMemo(() => {
    if (!hoveredTile) return null;
    return features.find((f) => f.x === hoveredTile.x && f.y === hoveredTile.y) ?? null;
  }, [hoveredTile, features]);
  const hoveredUnit = useMemo(() => {
    if (!hoveredTile) return null;
    return units.find(
      (u) => u.position?.x === hoveredTile.x && u.position?.y === hoveredTile.y
    ) ?? null;
  }, [hoveredTile, units]);
  const maxY = Math.max(...tiles.map((t) => t.y), 0);
  const baseOffsetX = (maxY + 1) * (TILE_WIDTH * scale / 2);
  const tileToScreen = useCallback(
    (tx, ty) => isoToScreen(tx, ty, scale, baseOffsetX),
    [scale, baseOffsetX]
  );
  const handleTileClick = useCallback((x, y) => {
    const feature = features.find((f) => f.x === x && f.y === y);
    if (feature) {
      setSelectedFeature(feature);
      onFeatureClick?.(feature);
      if (featureClickEvent) {
        eventBus.emit(`UI:${featureClickEvent}`, {
          featureId: feature.id,
          featureType: feature.type,
          x: feature.x,
          y: feature.y
        });
      }
    }
    onTileClick?.(x, y);
    if (tileClickEvent) {
      eventBus.emit(`UI:${tileClickEvent}`, { x, y });
    }
  }, [features, onFeatureClick, onTileClick, featureClickEvent, tileClickEvent, eventBus]);
  const handleUnitClick = useCallback((unitId) => {
    const unit = units.find((u) => u.id === unitId);
    if (unit) {
      onUnitClick?.(unit);
      if (unitClickEvent) {
        eventBus.emit(`UI:${unitClickEvent}`, { unitId: unit.id });
      }
    }
  }, [units, onUnitClick, unitClickEvent, eventBus]);
  const clearSelection = useCallback(() => setSelectedFeature(null), []);
  const ctx = useMemo(
    () => ({
      hoveredTile,
      hoveredFeature,
      hoveredUnit,
      selectedFeature,
      clearSelection,
      tileToScreen,
      scale
    }),
    [hoveredTile, hoveredFeature, hoveredUnit, selectedFeature, clearSelection, tileToScreen, scale]
  );
  return /* @__PURE__ */ jsxs("div", { className: cn("castle-board min-h-screen flex flex-col bg-[var(--color-background)]", className), children: [
    header && header(ctx),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-auto p-4 relative", children: [
        /* @__PURE__ */ jsx(
          IsometricCanvas_default,
          {
            tiles,
            units,
            features,
            hoveredTile,
            onTileClick: handleTileClick,
            onUnitClick: handleUnitClick,
            onTileHover: (x, y) => setHoveredTile({ x, y }),
            onTileLeave: () => setHoveredTile(null),
            scale,
            assetBaseUrl: assetManifest?.baseUrl,
            assetManifest,
            backgroundImage
          }
        ),
        overlay && overlay(ctx)
      ] }),
      sidePanel && /* @__PURE__ */ jsx("div", { className: "w-96 shrink-0 border-l border-[var(--color-border)] bg-[var(--color-surface)] overflow-y-auto", children: sidePanel(ctx) })
    ] }),
    footer && footer(ctx)
  ] });
}
CastleBoard.displayName = "CastleBoard";
var SIZE_CONFIG = {
  sm: { nodeSize: "min-w-12 h-8", fontSize: "text-xs", gap: "gap-2" },
  md: { nodeSize: "min-w-16 h-10", fontSize: "text-sm", gap: "gap-4" },
  lg: { nodeSize: "min-w-20 h-12", fontSize: "text-base", gap: "gap-6" }
};
function LinearView({
  trait,
  size = "md",
  className
}) {
  const currentIdx = trait.states.indexOf(trait.currentState);
  return /* @__PURE__ */ jsxs(VStack, { className: cn("p-3 rounded-lg bg-card border border-border", className), gap: "sm", children: [
    trait.description && /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground", children: trait.description }),
    /* @__PURE__ */ jsx(HStack, { className: "flex-wrap items-center", gap: "xs", children: trait.states.map((state, i) => {
      const isDone = i < currentIdx;
      const isCurrent = i === currentIdx;
      return /* @__PURE__ */ jsxs(React42__default.Fragment, { children: [
        i > 0 && /* @__PURE__ */ jsx(
          Typography,
          {
            variant: "caption",
            className: cn(
              "text-lg",
              isDone || isCurrent ? "text-primary" : "text-muted-foreground"
            ),
            children: "\u2192"
          }
        ),
        /* @__PURE__ */ jsxs(
          Box,
          {
            display: "inline-flex",
            className: cn(
              "items-center justify-center rounded-full px-3 py-1 border-2 transition-all",
              SIZE_CONFIG[size || "md"].fontSize,
              isDone && "bg-success/20 border-success text-success",
              isCurrent && "bg-primary/20 border-primary text-primary font-bold shadow-md shadow-primary/20",
              !isDone && !isCurrent && "bg-muted border-border text-muted-foreground"
            ),
            children: [
              /* @__PURE__ */ jsx(Box, { as: "span", className: "mr-1", children: isDone ? "\u2714" : isCurrent ? "\u25CF" : "\u25CB" }),
              /* @__PURE__ */ jsx(Box, { as: "span", children: state })
            ]
          }
        )
      ] }, state);
    }) })
  ] });
}
function CompactView({
  trait,
  size = "md",
  stateStyles,
  className
}) {
  const { t } = useTranslate();
  const config = SIZE_CONFIG[size || "md"];
  const currentTransitions = trait.transitions.filter((t2) => t2.from === trait.currentState);
  return /* @__PURE__ */ jsxs(VStack, { className: cn("p-3 rounded-lg bg-card border border-border", className), gap: "sm", children: [
    /* @__PURE__ */ jsxs(HStack, { className: "items-center justify-between", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-foreground font-bold", children: trait.name }),
      /* @__PURE__ */ jsx(StateIndicator, { state: trait.currentState, size: "sm", stateStyles })
    ] }),
    trait.description && /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground", overflow: "wrap", children: trait.description }),
    currentTransitions.length > 0 && /* @__PURE__ */ jsxs(VStack, { className: "pt-2 border-t border-border", gap: "xs", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground", children: t("trait.availableActions") + ":" }),
      /* @__PURE__ */ jsx(HStack, { className: "flex-wrap", gap: "xs", children: currentTransitions.map((transition, i) => /* @__PURE__ */ jsxs(
        Box,
        {
          display: "inline-flex",
          className: cn("items-center gap-1 px-2 py-1 rounded bg-muted", config.fontSize),
          children: [
            /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-accent", children: transition.event }),
            /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground", children: "\u2192" }),
            /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-success", children: transition.to }),
            transition.guardHint && /* @__PURE__ */ jsx(Box, { as: "span", className: "text-warning ml-1 cursor-help", title: transition.guardHint, children: /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-warning", children: "\u26A0" }) })
          ]
        },
        i
      )) })
    ] })
  ] });
}
function FullView({
  trait,
  size = "md",
  showTransitions = true,
  onStateClick,
  stateStyles,
  className
}) {
  const { t } = useTranslate();
  const config = SIZE_CONFIG[size || "md"];
  const currentTransitions = trait.transitions.filter((t2) => t2.from === trait.currentState);
  return /* @__PURE__ */ jsxs(VStack, { className: cn("p-3 rounded-lg bg-card border border-border", className), gap: "sm", children: [
    /* @__PURE__ */ jsxs(HStack, { className: "items-center justify-between", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-foreground font-bold", children: trait.name }),
      /* @__PURE__ */ jsx(StateIndicator, { state: trait.currentState, size: "sm", stateStyles })
    ] }),
    trait.description && /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground", overflow: "wrap", children: trait.description }),
    /* @__PURE__ */ jsx(HStack, { className: cn("flex-wrap", config.gap), children: trait.states.map((state) => {
      const isCurrent = state === trait.currentState;
      const hasOutgoing = trait.transitions.some((t2) => t2.from === state);
      return /* @__PURE__ */ jsx(
        Box,
        {
          display: "flex",
          className: cn(
            "items-center justify-center rounded-md border-2 transition-all px-2",
            config.nodeSize,
            isCurrent && "bg-primary/20 border-primary shadow-md shadow-primary/20",
            !isCurrent && hasOutgoing && "bg-muted border-border hover:border-muted-foreground",
            !isCurrent && !hasOutgoing && "bg-background border-border opacity-60",
            onStateClick && "cursor-pointer"
          ),
          onClick: () => onStateClick?.(state),
          children: /* @__PURE__ */ jsx(
            Typography,
            {
              variant: "caption",
              className: cn(
                config.fontSize,
                "whitespace-nowrap",
                isCurrent ? "text-primary font-bold" : "text-foreground/80"
              ),
              children: state
            }
          )
        },
        state
      );
    }) }),
    showTransitions && /* @__PURE__ */ jsxs(VStack, { className: "pt-2 border-t border-border", gap: "xs", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground", children: t("trait.transitions") + ":" }),
      /* @__PURE__ */ jsx(VStack, { gap: "xs", children: trait.transitions.map((transition, i) => {
        const isActive = transition.from === trait.currentState;
        return /* @__PURE__ */ jsxs(
          HStack,
          {
            className: cn(
              "items-center px-2 py-1 rounded text-xs",
              isActive ? "bg-primary/10" : "bg-muted/50"
            ),
            gap: "xs",
            children: [
              /* @__PURE__ */ jsx(Typography, { variant: "caption", className: isActive ? "text-primary font-medium" : "text-muted-foreground", children: transition.from }),
              /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground", children: "\u2014[" }),
              /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-accent font-medium", children: transition.event }),
              /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground", children: "]\u2192" }),
              /* @__PURE__ */ jsx(Typography, { variant: "caption", className: isActive ? "text-success font-medium" : "text-foreground/70", children: transition.to }),
              transition.guardHint && /* @__PURE__ */ jsx(Box, { as: "span", className: "text-warning ml-1 cursor-help", title: transition.guardHint, children: /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-warning", children: "\u26A0 " + transition.guardHint }) })
            ]
          },
          i
        );
      }) })
    ] }),
    showTransitions && currentTransitions.length > 0 && /* @__PURE__ */ jsxs(VStack, { className: "pt-2 border-t border-border", gap: "xs", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-primary font-medium", children: t("trait.availableNow") + ":" }),
      /* @__PURE__ */ jsx(HStack, { className: "flex-wrap", gap: "xs", children: currentTransitions.map((t2, i) => /* @__PURE__ */ jsxs(
        Box,
        {
          display: "inline-flex",
          className: "items-center gap-1 px-2 py-1 rounded bg-primary/10 border border-primary/30 text-xs",
          children: [
            /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-accent font-medium", children: t2.event }),
            /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground", children: "\u2192" }),
            /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-success", children: t2.to })
          ]
        },
        i
      )) })
    ] })
  ] });
}
function TraitStateViewer({
  trait,
  variant = "compact",
  size = "md",
  showTransitions = true,
  onStateClick,
  stateStyles,
  className
}) {
  switch (variant) {
    case "linear":
      return /* @__PURE__ */ jsx(LinearView, { trait, size, className });
    case "compact":
      return /* @__PURE__ */ jsx(
        CompactView,
        {
          trait,
          size,
          stateStyles,
          className
        }
      );
    case "full":
      return /* @__PURE__ */ jsx(
        FullView,
        {
          trait,
          size,
          showTransitions,
          onStateClick,
          stateStyles,
          className
        }
      );
  }
}
TraitStateViewer.displayName = "TraitStateViewer";
var SIZE_CONFIG2 = {
  sm: { box: 40, icon: 20, font: "text-xs" },
  md: { box: 56, icon: 28, font: "text-sm" },
  lg: { box: 72, icon: 40, font: "text-base" }
};
var DRAG_MIME = "application/x-almadar-slot-item";
function TraitSlot({
  slotNumber,
  equippedItem,
  locked = false,
  lockLabel,
  selected = false,
  size = "md",
  showTooltip = true,
  categoryColors,
  tooltipFrameUrl,
  className,
  feedback,
  onItemDrop,
  draggable = false,
  onDragStart,
  onClick,
  onRemove,
  clickEvent,
  removeEvent
}) {
  const { emit } = useEventBus();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const slotRef = useRef(null);
  const config = SIZE_CONFIG2[size];
  const isEmpty = !equippedItem;
  const catColor = equippedItem && categoryColors ? categoryColors[equippedItem.category] : null;
  const handleClick = useCallback(() => {
    if (locked) return;
    if (clickEvent) {
      emit(`UI:${clickEvent}`, { slotNumber });
    } else {
      onClick?.();
    }
  }, [locked, clickEvent, slotNumber, emit, onClick]);
  const handleRemove = useCallback((e) => {
    e.stopPropagation();
    if (removeEvent) {
      emit(`UI:${removeEvent}`, { slotNumber });
    } else {
      onRemove?.();
    }
  }, [removeEvent, slotNumber, emit, onRemove]);
  const handleDragStart = useCallback((e) => {
    if (!equippedItem || !draggable) return;
    e.dataTransfer.setData(DRAG_MIME, JSON.stringify(equippedItem));
    e.dataTransfer.effectAllowed = "move";
    onDragStart?.(equippedItem);
  }, [equippedItem, draggable, onDragStart]);
  const handleDragOver = useCallback((e) => {
    if (locked || !onItemDrop) return;
    if (e.dataTransfer.types.includes(DRAG_MIME)) {
      e.preventDefault();
      const allowed = e.dataTransfer.effectAllowed;
      e.dataTransfer.dropEffect = allowed === "copy" ? "copy" : "move";
      setIsDragOver(true);
    }
  }, [locked, onItemDrop]);
  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (locked || !onItemDrop) return;
    const raw = e.dataTransfer.getData(DRAG_MIME);
    if (!raw) return;
    try {
      const item = JSON.parse(raw);
      onItemDrop(item);
    } catch {
    }
  }, [locked, onItemDrop]);
  const getTooltipStyle = () => {
    if (!slotRef.current) return {};
    const rect = slotRef.current.getBoundingClientRect();
    return {
      position: "fixed",
      left: rect.left + rect.width / 2,
      top: rect.top - 8,
      transform: "translate(-50%, -100%)",
      zIndex: 9999
    };
  };
  const itemMachine = equippedItem?.stateMachine || (equippedItem ? {
    name: equippedItem.name,
    states: ["idle", "active", "done"],
    currentState: "idle",
    transitions: [
      { from: "idle", to: "active", event: "ACTIVATE" },
      { from: "active", to: "done", event: "COMPLETE" }
    ],
    description: equippedItem.description
  } : null);
  return /* @__PURE__ */ jsxs(
    Box,
    {
      ref: slotRef,
      display: "flex",
      position: "relative",
      className: cn(
        "items-center justify-center rounded-lg transition-all duration-200",
        !locked && "cursor-pointer",
        locked && "cursor-not-allowed opacity-50",
        isEmpty && !locked && "border-2 border-dashed border-border hover:border-muted-foreground",
        isEmpty && locked && "border-2 border-dashed border-border",
        !isEmpty && "border-2",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isDragOver && "ring-2 ring-accent ring-offset-1 scale-110 border-accent",
        !isDragOver && feedback === "correct" && "ring-2 ring-success ring-offset-1 ring-offset-background",
        !isDragOver && feedback === "wrong" && "ring-2 ring-error ring-offset-1 ring-offset-background",
        !locked && !isDragOver && "hover:scale-105",
        className
      ),
      style: {
        width: config.box,
        height: config.box,
        backgroundColor: catColor?.bg || "rgba(30,41,59,0.5)",
        borderColor: isDragOver ? void 0 : feedback === "correct" ? "var(--color-success)" : feedback === "wrong" ? "var(--color-error)" : catColor?.border || void 0
      },
      onClick: handleClick,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      draggable: draggable && !isEmpty,
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      children: [
        locked ? /* @__PURE__ */ jsxs(Box, { className: "text-center", children: [
          /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground", children: "\u{1F512}" }),
          lockLabel && /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground block text-xs", children: lockLabel })
        ] }) : isEmpty ? /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground text-lg", children: "+" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          equippedItem.iconUrl ? /* @__PURE__ */ jsx(
            Box,
            {
              as: "img",
              className: "object-contain",
              style: { width: config.icon, height: config.icon },
              ...{ src: equippedItem.iconUrl, alt: equippedItem.name }
            }
          ) : /* @__PURE__ */ jsx(Typography, { variant: "body1", className: "text-center leading-none", style: { fontSize: config.icon }, children: equippedItem.iconEmoji || "\u2726" }),
          (onRemove || removeEvent) && /* @__PURE__ */ jsx(
            Box,
            {
              position: "absolute",
              className: "-top-1.5 -right-1.5 w-4 h-4 bg-error rounded-full flex items-center justify-center cursor-pointer hover:bg-error/80 transition-colors",
              onClick: handleRemove,
              children: /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-foreground text-xs leading-none", children: "\xD7" })
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          Box,
          {
            position: "absolute",
            className: "-bottom-1 -left-1 w-4 h-4 bg-card rounded-full flex items-center justify-center border border-border",
            children: /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground text-xs", children: slotNumber })
          }
        ),
        showTooltip && isHovered && itemMachine && !isEmpty && equippedItem && /* @__PURE__ */ jsxs(
          Box,
          {
            className: "p-3 bg-background border border-border rounded-lg shadow-xl",
            style: {
              ...getTooltipStyle(),
              minWidth: 200,
              ...tooltipFrameUrl ? {
                borderImage: `url(${tooltipFrameUrl}) 60 fill / 15px / 0 stretch`,
                border: "none"
              } : {}
            },
            children: [
              /* @__PURE__ */ jsx(Typography, { variant: "h6", className: "text-foreground mb-2 text-center", children: equippedItem.name }),
              equippedItem.description && /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground block mb-2 text-center", children: equippedItem.description }),
              /* @__PURE__ */ jsx(TraitStateViewer, { trait: itemMachine, variant: "compact", size: "sm" }),
              /* @__PURE__ */ jsx(
                Box,
                {
                  position: "absolute",
                  className: "-bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-border"
                }
              )
            ]
          }
        )
      ]
    }
  );
}
TraitSlot.displayName = "TraitSlot";
var TERRAIN_COLORS = {
  grass: "#4a7c3f",
  dirt: "#8b6c42",
  stone: "#7a7a7a",
  sand: "#c4a84d",
  water: "#3a6ea5",
  forest: "#2d5a1e",
  mountain: "#5a4a3a",
  lava: "#c44b2b",
  ice: "#a0d2e8",
  plains: "#6b8e4e",
  fortress: "#4a4a5a",
  castle: "#5a5a6a"
};
var FEATURE_TYPES = [
  "goldMine",
  "resonanceCrystal",
  "traitCache",
  "salvageYard",
  "portal",
  "battleMarker",
  "treasure",
  "castle"
];
function CollapsibleSection({ title, expanded, onToggle, children, className }) {
  const Icon3 = expanded ? ChevronDown : ChevronRight;
  return /* @__PURE__ */ jsxs(VStack, { gap: "xs", className, children: [
    /* @__PURE__ */ jsx(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: onToggle,
        className: "w-full justify-start text-left",
        children: /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
          /* @__PURE__ */ jsx(Icon3, { size: 14 }),
          /* @__PURE__ */ jsx(Typography, { variant: "label", weight: "semibold", children: title })
        ] })
      }
    ),
    expanded && /* @__PURE__ */ jsx(Box, { padding: "xs", paddingX: "sm", children })
  ] });
}
CollapsibleSection.displayName = "CollapsibleSection";
function EditorSlider({ label, value, min, max, step = 0.1, onChange, className }) {
  return /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", className, children: [
    /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "min-w-[80px] text-gray-300", children: label }),
    /* @__PURE__ */ jsx(Box, { className: "flex-1", children: /* @__PURE__ */ jsx(
      "input",
      {
        type: "range",
        min,
        max,
        step,
        value,
        onChange: (e) => onChange(parseFloat(e.target.value)),
        className: "w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
      }
    ) }),
    /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "min-w-[40px] text-right text-gray-400", children: typeof step === "number" && step < 1 ? value.toFixed(1) : value })
  ] });
}
EditorSlider.displayName = "EditorSlider";
function EditorSelect({ label, value, options, onChange, className }) {
  return /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", className, children: [
    /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "min-w-[80px] text-gray-300", children: label }),
    /* @__PURE__ */ jsx(Box, { className: "flex-1", children: /* @__PURE__ */ jsx(
      "select",
      {
        value,
        onChange: (e) => onChange(e.target.value),
        className: "w-full px-2 py-1 text-xs bg-gray-700 text-gray-200 border border-gray-600 rounded cursor-pointer",
        children: options.map((opt) => /* @__PURE__ */ jsx("option", { value: opt.value, children: opt.label }, opt.value))
      }
    ) })
  ] });
}
EditorSelect.displayName = "EditorSelect";
function EditorCheckbox({ label, checked, onChange, className }) {
  return /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", className, children: [
    /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "min-w-[80px] text-gray-300", children: label }),
    /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(
      "input",
      {
        type: "checkbox",
        checked,
        onChange: (e) => onChange(e.target.checked),
        className: "w-4 h-4 accent-blue-500 cursor-pointer"
      }
    ) })
  ] });
}
EditorCheckbox.displayName = "EditorCheckbox";
function EditorTextInput({ label, value, onChange, placeholder, className }) {
  return /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", className, children: [
    /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "min-w-[80px] text-gray-300", children: label }),
    /* @__PURE__ */ jsx(Box, { className: "flex-1", children: /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        value,
        onChange: (e) => onChange(e.target.value),
        placeholder,
        className: "w-full px-2 py-1 text-xs bg-gray-700 text-gray-200 border border-gray-600 rounded"
      }
    ) })
  ] });
}
EditorTextInput.displayName = "EditorTextInput";
function StatusBar({ hoveredTile, mode, gridSize, unitCount, featureCount, className }) {
  return /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", className: `px-3 py-1.5 bg-gray-800 border-t border-gray-700 ${className ?? ""}`, children: [
    /* @__PURE__ */ jsx(Badge, { variant: "info", size: "sm", children: mode }),
    /* @__PURE__ */ jsxs(Typography, { variant: "caption", className: "text-gray-400", children: [
      "Tile: ",
      hoveredTile ? `(${hoveredTile.x}, ${hoveredTile.y})` : "\u2014"
    ] }),
    gridSize && /* @__PURE__ */ jsxs(Typography, { variant: "caption", className: "text-gray-500", children: [
      "Grid: ",
      gridSize.width,
      "x",
      gridSize.height
    ] }),
    unitCount !== void 0 && /* @__PURE__ */ jsxs(Typography, { variant: "caption", className: "text-gray-500", children: [
      "Units: ",
      unitCount
    ] }),
    featureCount !== void 0 && /* @__PURE__ */ jsxs(Typography, { variant: "caption", className: "text-gray-500", children: [
      "Features: ",
      featureCount
    ] })
  ] });
}
StatusBar.displayName = "StatusBar";
function TerrainPalette({ terrains, selectedTerrain, onSelect, className }) {
  return /* @__PURE__ */ jsx(HStack, { gap: "xs", wrap: true, className, children: terrains.map((terrain) => /* @__PURE__ */ jsx(
    Box,
    {
      onClick: () => onSelect(terrain),
      className: `w-8 h-8 rounded cursor-pointer border-2 transition-all ${selectedTerrain === terrain ? "border-white scale-110 shadow-lg" : "border-gray-600 hover:border-gray-400"}`,
      style: { backgroundColor: TERRAIN_COLORS[terrain] || "#555" },
      title: terrain
    },
    terrain
  )) });
}
TerrainPalette.displayName = "TerrainPalette";
var MODE_LABELS = {
  select: "Select",
  paint: "Paint",
  unit: "Unit",
  feature: "Feature",
  erase: "Erase"
};
function EditorToolbar({ mode, onModeChange, className }) {
  const modes = ["select", "paint", "unit", "feature", "erase"];
  return /* @__PURE__ */ jsx(HStack, { gap: "xs", wrap: true, className, children: modes.map((m) => /* @__PURE__ */ jsx(
    Button,
    {
      variant: mode === m ? "primary" : "ghost",
      size: "sm",
      onClick: () => onModeChange(m),
      children: MODE_LABELS[m]
    },
    m
  )) });
}
EditorToolbar.displayName = "EditorToolbar";
var DRAG_MIME2 = "application/x-almadar-slot-item";
var SIZE_CONFIG3 = {
  sm: { px: "px-2 py-1", icon: "text-lg", text: "text-xs" },
  md: { px: "px-3 py-2", icon: "text-2xl", text: "text-sm" },
  lg: { px: "px-4 py-3", icon: "text-3xl", text: "text-base" }
};
function ActionTile({
  action,
  size = "md",
  disabled = false,
  categoryColors,
  className
}) {
  const config = SIZE_CONFIG3[size];
  const catColor = categoryColors?.[action.category];
  const handleDragStart = useCallback((e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData(DRAG_MIME2, JSON.stringify(action));
    e.dataTransfer.effectAllowed = "copy";
  }, [action, disabled]);
  return /* @__PURE__ */ jsxs(
    Box,
    {
      display: "flex",
      className: cn(
        "flex-col items-center gap-1 rounded-lg border-2 transition-all select-none",
        config.px,
        disabled ? "opacity-40 cursor-not-allowed border-border bg-muted" : "cursor-grab active:cursor-grabbing hover:scale-105 hover:shadow-md border-border bg-card",
        className
      ),
      style: {
        backgroundColor: !disabled && catColor ? catColor.bg : void 0,
        borderColor: !disabled && catColor ? catColor.border : void 0
      },
      draggable: !disabled,
      onDragStart: handleDragStart,
      children: [
        /* @__PURE__ */ jsx(Typography, { variant: "body1", className: cn(config.icon, "leading-none"), children: action.iconEmoji || "\u2726" }),
        /* @__PURE__ */ jsx(Typography, { variant: "caption", className: cn(config.text, "text-foreground font-medium whitespace-nowrap"), children: action.name })
      ]
    }
  );
}
ActionTile.displayName = "ActionTile";
function ActionPalette({
  actions,
  usedActionIds = [],
  allowDuplicates = true,
  categoryColors,
  size = "md",
  label,
  className
}) {
  const { t } = useTranslate();
  return /* @__PURE__ */ jsxs(VStack, { className: cn("p-3 rounded-lg bg-card border border-border", className), gap: "sm", children: [
    /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-muted-foreground font-medium", children: label ?? t("sequencer.actions") }),
    /* @__PURE__ */ jsx(HStack, { className: "flex-wrap", gap: "sm", children: actions.map((action) => /* @__PURE__ */ jsx(
      ActionTile,
      {
        action,
        size,
        categoryColors,
        disabled: !allowDuplicates && usedActionIds.includes(action.id)
      },
      action.id
    )) })
  ] });
}
ActionPalette.displayName = "ActionPalette";
function SequenceBar({
  slots,
  maxSlots,
  onSlotDrop,
  onSlotRemove,
  playing = false,
  currentStep = -1,
  categoryColors,
  slotFeedback,
  size = "lg",
  className
}) {
  const handleDrop = useCallback((index) => (item) => {
    if (playing) return;
    onSlotDrop(index, item);
  }, [onSlotDrop, playing]);
  const handleRemove = useCallback((index) => () => {
    if (playing) return;
    onSlotRemove(index);
  }, [onSlotRemove, playing]);
  const paddedSlots = Array.from({ length: maxSlots }, (_, i) => slots[i]);
  return /* @__PURE__ */ jsx(HStack, { className: cn("items-center", className), gap: "sm", children: paddedSlots.map((slot, i) => /* @__PURE__ */ jsxs(React42__default.Fragment, { children: [
    i > 0 && /* @__PURE__ */ jsx(
      Typography,
      {
        variant: "body1",
        className: cn(
          "text-lg",
          currentStep >= 0 && i <= currentStep ? "text-primary" : "text-muted-foreground"
        ),
        children: "\u2192"
      }
    ),
    /* @__PURE__ */ jsx(
      TraitSlot,
      {
        slotNumber: i + 1,
        equippedItem: slot,
        size,
        categoryColors,
        onItemDrop: handleDrop(i),
        onRemove: slot ? handleRemove(i) : void 0,
        draggable: !playing && !!slot,
        selected: currentStep === i,
        locked: playing,
        feedback: slotFeedback?.[i]
      }
    )
  ] }, i)) });
}
SequenceBar.displayName = "SequenceBar";
var ENCOURAGEMENT_KEYS = [
  "puzzle.tryAgain1",
  "puzzle.tryAgain2",
  "puzzle.tryAgain3"
];
var stepLabel = (slot, i) => slot ? `${i + 1}. ${slot.name}` : `Step ${i + 1}`;
function computeSlotFeedback(playerSeq, solutions) {
  let bestSolution = solutions[0];
  let bestMatches = -1;
  for (const sol of solutions) {
    const matches = sol.filter((id, i) => id === playerSeq[i]).length;
    if (matches > bestMatches) {
      bestMatches = matches;
      bestSolution = sol;
    }
  }
  return playerSeq.map(
    (id, i) => id !== void 0 && id === bestSolution[i] ? "correct" : "wrong"
  );
}
function SequencerBoard({
  entity,
  categoryColors,
  stepDurationMs = 1e3,
  playEvent,
  completeEvent,
  className
}) {
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const [slots, setSlots] = useState(
    () => Array.from({ length: entity.maxSlots }, () => void 0)
  );
  const [playState, setPlayState] = useState("idle");
  const [currentStep, setCurrentStep] = useState(-1);
  const [attempts, setAttempts] = useState(0);
  const [slotFeedback, setSlotFeedback] = useState(
    () => Array.from({ length: entity.maxSlots }, () => null)
  );
  const timerRef = useRef(null);
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);
  const handleSlotDrop = useCallback((index, item) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = item;
      return next;
    });
    setSlotFeedback((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    emit("UI:PLAY_SOUND", { key: "drop_slot" });
  }, [emit]);
  const handleSlotRemove = useCallback((index) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = void 0;
      return next;
    });
    setSlotFeedback((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    emit("UI:PLAY_SOUND", { key: "back" });
  }, [emit]);
  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSlots(Array.from({ length: entity.maxSlots }, () => void 0));
    setPlayState("idle");
    setCurrentStep(-1);
    setAttempts(0);
    setSlotFeedback(Array.from({ length: entity.maxSlots }, () => null));
  }, [entity.maxSlots]);
  const filledSlots = slots.filter((s) => !!s);
  const canPlay = filledSlots.length > 0 && playState === "idle";
  const handlePlay = useCallback(() => {
    if (!canPlay) return;
    setSlotFeedback(Array.from({ length: entity.maxSlots }, () => null));
    emit("UI:PLAY_SOUND", { key: "confirm" });
    const sequence = slots.map((s) => s?.id || "");
    if (playEvent) {
      emit(`UI:${playEvent}`, { sequence });
    }
    setPlayState("playing");
    setCurrentStep(0);
    let step = 0;
    const advance = () => {
      step++;
      if (step >= entity.maxSlots) {
        const playerSeq = slots.map((s) => s?.id);
        const playerIds = slots.filter(Boolean).map((s) => s?.id || "");
        const success = entity.solutions.some(
          (sol) => sol.length === playerIds.length && sol.every((id, i) => id === playerIds[i])
        );
        if (success) {
          setPlayState("success");
          setCurrentStep(-1);
          emit("UI:PLAY_SOUND", { key: "levelComplete" });
          if (completeEvent) {
            emit(`UI:${completeEvent}`, { success: true, sequence: playerIds });
          }
        } else {
          setAttempts((prev) => prev + 1);
          const feedback = computeSlotFeedback(playerSeq, entity.solutions);
          setSlotFeedback(feedback);
          setPlayState("idle");
          setCurrentStep(-1);
          emit("UI:PLAY_SOUND", { key: "fail" });
          const correctCount2 = feedback.filter((f) => f === "correct").length;
          for (let ci = 0; ci < correctCount2; ci++) {
            setTimeout(() => {
              emit("UI:PLAY_SOUND", { key: "correctSlot" });
            }, 300 + ci * 150);
          }
        }
      } else {
        setCurrentStep(step);
        timerRef.current = setTimeout(advance, stepDurationMs);
      }
    };
    timerRef.current = setTimeout(advance, stepDurationMs);
  }, [canPlay, slots, entity.maxSlots, entity.solutions, stepDurationMs, playEvent, completeEvent, emit]);
  const machine = {
    name: entity.title,
    description: entity.description,
    states: slots.map((s, i) => stepLabel(s, i)),
    currentState: currentStep >= 0 ? stepLabel(slots[currentStep], currentStep) : "__idle__",
    transitions: slots.slice(0, -1).map((s, i) => ({
      from: stepLabel(s, i),
      to: stepLabel(slots[i + 1], i + 1),
      event: "NEXT"
    }))
  };
  const usedIds = entity.allowDuplicates === false ? slots.filter(Boolean).map((s) => s?.id || "") : [];
  const showHint = attempts >= 3 && !!entity.hint;
  const hasFeedback = slotFeedback.some((f) => f !== null);
  const correctCount = slotFeedback.filter((f) => f === "correct").length;
  const encourageKey = ENCOURAGEMENT_KEYS[Math.min(attempts - 1, ENCOURAGEMENT_KEYS.length - 1)] ?? ENCOURAGEMENT_KEYS[0];
  return /* @__PURE__ */ jsxs(VStack, { className: cn("p-4 gap-6", className), children: [
    /* @__PURE__ */ jsxs(VStack, { gap: "xs", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "h4", className: "text-foreground", children: entity.title }),
      /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-muted-foreground", children: entity.description })
    ] }),
    showHint && /* @__PURE__ */ jsx(Box, { className: "p-3 rounded-lg bg-accent/10 border border-accent/30", children: /* @__PURE__ */ jsxs(HStack, { className: "items-start", gap: "xs", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-accent font-bold shrink-0", children: "\u{1F4A1} " + t("game.hint") + ":" }),
      /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-foreground", children: entity.hint })
    ] }) }),
    filledSlots.length > 0 && /* @__PURE__ */ jsx(TraitStateViewer, { trait: machine, variant: "linear", size: "md" }),
    /* @__PURE__ */ jsxs(VStack, { gap: "xs", children: [
      /* @__PURE__ */ jsxs(HStack, { className: "items-center justify-between", children: [
        /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-muted-foreground font-medium", children: t("sequencer.yourSequence") + ":" }),
        hasFeedback && playState === "idle" && /* @__PURE__ */ jsxs(Typography, { variant: "caption", className: "text-muted-foreground", children: [
          `${correctCount}/${entity.maxSlots} `,
          "\u2705"
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        SequenceBar,
        {
          slots,
          maxSlots: entity.maxSlots,
          onSlotDrop: handleSlotDrop,
          onSlotRemove: handleSlotRemove,
          playing: playState === "playing",
          currentStep,
          categoryColors,
          slotFeedback,
          size: "lg"
        }
      )
    ] }),
    playState !== "playing" && /* @__PURE__ */ jsx(
      ActionPalette,
      {
        actions: entity.availableActions,
        usedActionIds: usedIds,
        allowDuplicates: entity.allowDuplicates !== false,
        categoryColors,
        label: t("sequencer.dragActions")
      }
    ),
    hasFeedback && playState === "idle" && attempts > 0 && /* @__PURE__ */ jsx(Box, { className: "p-3 rounded-lg bg-warning/10 border border-warning/30 text-center", children: /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-foreground", children: t(encourageKey) }) }),
    playState === "success" && /* @__PURE__ */ jsx(Box, { className: "p-4 rounded-lg bg-success/20 border border-success text-center", children: /* @__PURE__ */ jsx(Typography, { variant: "h5", className: "text-success", children: entity.successMessage || t("sequencer.levelComplete") }) }),
    /* @__PURE__ */ jsxs(HStack, { gap: "sm", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "primary",
          onClick: handlePlay,
          disabled: !canPlay,
          children: "\u25B6 " + t("game.play")
        }
      ),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: handleReset, children: "\u21BA " + t("game.reset") })
    ] })
  ] });
}
SequencerBoard.displayName = "SequencerBoard";
function RuleEditor({
  rule,
  availableEvents,
  availableActions,
  onChange,
  onRemove,
  disabled = false,
  className
}) {
  const { t } = useTranslate();
  const handleWhenChange = useCallback((e) => {
    onChange({ ...rule, whenEvent: e.target.value });
  }, [rule, onChange]);
  const handleThenChange = useCallback((e) => {
    onChange({ ...rule, thenAction: e.target.value });
  }, [rule, onChange]);
  return /* @__PURE__ */ jsxs(HStack, { className: cn("items-center p-2 rounded-lg bg-muted/50 border border-border", className), gap: "sm", children: [
    /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-primary font-bold whitespace-nowrap", children: t("eventHandler.when") }),
    /* @__PURE__ */ jsx(
      Select,
      {
        value: rule.whenEvent,
        onChange: handleWhenChange,
        options: availableEvents,
        disabled,
        className: "flex-1 min-w-0"
      }
    ),
    /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-accent font-bold whitespace-nowrap", children: "\u2192 " + t("eventHandler.then") }),
    /* @__PURE__ */ jsx(
      Select,
      {
        value: rule.thenAction,
        onChange: handleThenChange,
        options: availableActions,
        disabled,
        className: "flex-1 min-w-0"
      }
    ),
    onRemove && /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: onRemove, disabled, className: "shrink-0", children: "\xD7" })
  ] });
}
RuleEditor.displayName = "RuleEditor";
var STATUS_STYLES2 = {
  pending: "text-muted-foreground",
  active: "text-primary animate-pulse",
  done: "text-success",
  error: "text-error"
};
var STATUS_DOTS = {
  pending: "\u25CB",
  active: "\u25CF",
  done: "\u2714",
  error: "\u2717"
};
function EventLog({
  entries,
  maxHeight = 200,
  label,
  className
}) {
  const { t } = useTranslate();
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);
  return /* @__PURE__ */ jsxs(VStack, { className: cn("p-3 rounded-lg bg-card border border-border", className), gap: "sm", children: [
    /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-muted-foreground font-medium", children: label ?? t("eventHandler.eventLog") }),
    /* @__PURE__ */ jsx(
      Box,
      {
        ref: scrollRef,
        className: "overflow-y-auto",
        style: { maxHeight },
        children: /* @__PURE__ */ jsxs(VStack, { gap: "xs", children: [
          entries.length === 0 && /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground italic", children: t("eventHandler.noEvents") }),
          entries.map((entry) => /* @__PURE__ */ jsxs(HStack, { className: "items-start", gap: "xs", children: [
            /* @__PURE__ */ jsx(Typography, { variant: "caption", className: STATUS_STYLES2[entry.status], children: STATUS_DOTS[entry.status] }),
            /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-foreground", children: entry.icon }),
            /* @__PURE__ */ jsx(Typography, { variant: "caption", className: cn("flex-1", STATUS_STYLES2[entry.status]), children: entry.message })
          ] }, entry.id))
        ] })
      }
    )
  ] });
}
EventLog.displayName = "EventLog";
var nextRuleId = 1;
function ObjectRulePanel({
  object,
  onRulesChange,
  disabled = false,
  className
}) {
  const { t } = useTranslate();
  const maxRules = object.maxRules || 3;
  const canAdd = object.rules.length < maxRules;
  const handleRuleChange = useCallback((index, updatedRule) => {
    const newRules = [...object.rules];
    newRules[index] = updatedRule;
    onRulesChange(object.id, newRules);
  }, [object.id, object.rules, onRulesChange]);
  const handleRuleRemove = useCallback((index) => {
    const newRules = object.rules.filter((_, i) => i !== index);
    onRulesChange(object.id, newRules);
  }, [object.id, object.rules, onRulesChange]);
  const handleAddRule = useCallback(() => {
    if (!canAdd || disabled) return;
    const firstEvent = object.availableEvents[0]?.value || "";
    const firstAction = object.availableActions[0]?.value || "";
    const newRule = {
      id: `rule-${nextRuleId++}`,
      whenEvent: firstEvent,
      thenAction: firstAction
    };
    onRulesChange(object.id, [...object.rules, newRule]);
  }, [canAdd, disabled, object, onRulesChange]);
  const machine = {
    name: object.name,
    states: object.states,
    currentState: object.currentState,
    transitions: object.rules.map((r) => ({
      from: object.currentState,
      to: object.states.find((s) => s !== object.currentState) || object.currentState,
      event: r.whenEvent
    }))
  };
  return /* @__PURE__ */ jsxs(VStack, { className: cn("p-4 rounded-lg bg-card border border-border", className), gap: "sm", children: [
    /* @__PURE__ */ jsxs(HStack, { className: "items-center", gap: "sm", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "h5", children: object.icon }),
      /* @__PURE__ */ jsxs(VStack, { gap: "none", children: [
        /* @__PURE__ */ jsx(Typography, { variant: "body1", className: "text-foreground font-bold", children: object.name }),
        /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground", children: t("eventHandler.state") + ": " + object.currentState })
      ] })
    ] }),
    /* @__PURE__ */ jsx(TraitStateViewer, { trait: machine, variant: "compact", size: "sm" }),
    /* @__PURE__ */ jsxs(VStack, { gap: "xs", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-muted-foreground font-medium", children: t("eventHandler.rules", { count: object.rules.length, max: maxRules }) + ":" }),
      object.rules.map((rule, i) => /* @__PURE__ */ jsx(
        RuleEditor,
        {
          rule,
          availableEvents: object.availableEvents,
          availableActions: object.availableActions,
          onChange: (r) => handleRuleChange(i, r),
          onRemove: () => handleRuleRemove(i),
          disabled
        },
        rule.id
      )),
      canAdd && !disabled && /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: handleAddRule, className: "self-start", children: t("eventHandler.addRule") })
    ] })
  ] });
}
ObjectRulePanel.displayName = "ObjectRulePanel";
var ENCOURAGEMENT_KEYS2 = [
  "puzzle.tryAgain1",
  "puzzle.tryAgain2",
  "puzzle.tryAgain3"
];
function EventHandlerBoard({
  entity,
  stepDurationMs = 800,
  playEvent,
  completeEvent,
  className
}) {
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const [objects, setObjects] = useState(entity.objects);
  const [selectedObjectId, setSelectedObjectId] = useState(
    entity.objects[0]?.id || null
  );
  const [playState, setPlayState] = useState("editing");
  const [eventLog, setEventLog] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const timerRef = useRef(null);
  const logIdCounter = useRef(0);
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);
  const selectedObject = objects.find((o) => o.id === selectedObjectId) || null;
  const handleRulesChange = useCallback((objectId, rules) => {
    setObjects((prev) => prev.map(
      (o) => o.id === objectId ? { ...o, rules } : o
    ));
  }, []);
  const addLogEntry = useCallback((icon, message, status = "done") => {
    const id = `log-${logIdCounter.current++}`;
    setEventLog((prev) => [...prev, { id, timestamp: Date.now(), icon, message, status }]);
  }, []);
  const handlePlay = useCallback(() => {
    if (playState !== "editing") return;
    if (playEvent) emit(`UI:${playEvent}`, {});
    setPlayState("playing");
    setEventLog([]);
    const allRules = [];
    objects.forEach((obj) => {
      obj.rules.forEach((rule) => {
        allRules.push({ object: obj, rule });
      });
    });
    const triggers = entity.triggerEvents || [];
    const eventQueue = [...triggers];
    const firedEvents = /* @__PURE__ */ new Set();
    let stepIdx = 0;
    let goalReached = false;
    const processNext = () => {
      if (eventQueue.length === 0 || stepIdx > 20) {
        if (goalReached) {
          setPlayState("success");
          if (completeEvent) {
            emit(`UI:${completeEvent}`, { success: true });
          }
        } else {
          setAttempts((prev) => prev + 1);
          setPlayState("fail");
        }
        return;
      }
      const currentEvent = eventQueue.shift();
      if (firedEvents.has(currentEvent)) {
        timerRef.current = setTimeout(processNext, 100);
        return;
      }
      firedEvents.add(currentEvent);
      const matching = allRules.filter((r) => r.rule.whenEvent === currentEvent);
      if (matching.length === 0) {
        addLogEntry("\u26A1", t("eventHandler.noListeners", { event: currentEvent }), "done");
      } else {
        matching.forEach(({ object, rule }) => {
          addLogEntry(object.icon, t("eventHandler.heardEvent", { object: object.name, event: currentEvent, action: rule.thenAction }), "done");
          eventQueue.push(rule.thenAction);
          if (rule.thenAction === entity.goalEvent) {
            goalReached = true;
          }
        });
      }
      if (currentEvent === entity.goalEvent) {
        goalReached = true;
      }
      stepIdx++;
      timerRef.current = setTimeout(processNext, stepDurationMs);
    };
    if (triggers.length > 0) {
      addLogEntry("\u{1F3AC}", t("eventHandler.simulationStarted", { events: triggers.join(", ") }), "active");
    }
    timerRef.current = setTimeout(processNext, stepDurationMs);
  }, [playState, objects, entity, stepDurationMs, playEvent, completeEvent, emit, addLogEntry, t]);
  const handleTryAgain = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlayState("editing");
    setEventLog([]);
  }, []);
  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setObjects(entity.objects);
    setPlayState("editing");
    setEventLog([]);
    setSelectedObjectId(entity.objects[0]?.id || null);
    setAttempts(0);
  }, [entity.objects]);
  const objectViewers = objects.map((obj) => {
    const machine = {
      name: obj.name,
      states: obj.states,
      currentState: obj.currentState,
      transitions: obj.rules.map((r) => ({
        from: obj.currentState,
        to: obj.states.find((s) => s !== obj.currentState) || obj.currentState,
        event: r.whenEvent
      }))
    };
    return { obj, machine };
  });
  const showHint = attempts >= 3 && entity.hint;
  const encourageKey = ENCOURAGEMENT_KEYS2[Math.min(attempts - 1, ENCOURAGEMENT_KEYS2.length - 1)] ?? ENCOURAGEMENT_KEYS2[0];
  return /* @__PURE__ */ jsxs(VStack, { className: cn("p-4 gap-6", className), children: [
    /* @__PURE__ */ jsxs(VStack, { gap: "xs", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "h4", className: "text-foreground", children: entity.title }),
      /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-muted-foreground", children: entity.description }),
      /* @__PURE__ */ jsxs(HStack, { className: "items-center p-2 rounded bg-primary/10 border border-primary/30", gap: "xs", children: [
        /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-primary font-bold", children: t("game.goal") + ":" }),
        /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-foreground", children: entity.goalCondition })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-muted-foreground font-medium", children: t("eventHandler.clickObject") + ":" }),
      /* @__PURE__ */ jsx(HStack, { className: "flex-wrap", gap: "sm", children: objectViewers.map(({ obj, machine }) => /* @__PURE__ */ jsx(
        Box,
        {
          className: cn(
            "p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105",
            selectedObjectId === obj.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-muted-foreground"
          ),
          onClick: () => setSelectedObjectId(obj.id),
          children: /* @__PURE__ */ jsxs(VStack, { gap: "xs", className: "items-center min-w-[120px]", children: [
            /* @__PURE__ */ jsx(Typography, { variant: "h5", children: obj.icon }),
            /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-foreground font-medium", children: obj.name }),
            /* @__PURE__ */ jsx(TraitStateViewer, { trait: machine, variant: "compact", size: "sm" })
          ] })
        },
        obj.id
      )) })
    ] }),
    selectedObject && /* @__PURE__ */ jsx(
      ObjectRulePanel,
      {
        object: selectedObject,
        onRulesChange: handleRulesChange,
        disabled: playState !== "editing"
      }
    ),
    eventLog.length > 0 && /* @__PURE__ */ jsx(EventLog, { entries: eventLog }),
    playState === "success" && /* @__PURE__ */ jsx(Box, { className: "p-4 rounded-lg bg-success/20 border border-success text-center", children: /* @__PURE__ */ jsx(Typography, { variant: "h5", className: "text-success", children: entity.successMessage || t("eventHandler.chainComplete") }) }),
    playState === "fail" && /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
      /* @__PURE__ */ jsx(Box, { className: "p-4 rounded-lg bg-warning/10 border border-warning/30 text-center", children: /* @__PURE__ */ jsx(Typography, { variant: "body1", className: "text-foreground font-medium", children: t(encourageKey) }) }),
      showHint && /* @__PURE__ */ jsx(Box, { className: "p-3 rounded-lg bg-accent/10 border border-accent/30", children: /* @__PURE__ */ jsxs(HStack, { className: "items-start", gap: "xs", children: [
        /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-accent font-bold shrink-0", children: "\u{1F4A1} " + t("game.hint") + ":" }),
        /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-foreground", children: entity.hint })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(HStack, { gap: "sm", children: [
      playState === "fail" ? /* @__PURE__ */ jsx(Button, { variant: "primary", onClick: handleTryAgain, children: "\u{1F504} " + t("puzzle.tryAgainButton") }) : /* @__PURE__ */ jsx(
        Button,
        {
          variant: "primary",
          onClick: handlePlay,
          disabled: playState !== "editing",
          children: "\u25B6 " + t("game.play")
        }
      ),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: handleReset, children: "\u21BA " + t("game.reset") })
    ] })
  ] });
}
EventHandlerBoard.displayName = "EventHandlerBoard";
function StateNode2({
  name,
  isCurrent = false,
  isSelected = false,
  isInitial = false,
  position,
  onClick,
  className
}) {
  return /* @__PURE__ */ jsx(
    Box,
    {
      position: "absolute",
      display: "flex",
      className: cn(
        "items-center justify-center rounded-full border-3 transition-all cursor-pointer select-none",
        "min-w-[80px] h-[80px] px-3",
        isCurrent && "bg-primary/20 border-primary shadow-lg shadow-primary/30 scale-110",
        isSelected && !isCurrent && "bg-accent/20 border-accent ring-2 ring-accent/50",
        !isCurrent && !isSelected && "bg-card border-border hover:border-muted-foreground hover:scale-105",
        className
      ),
      style: {
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)"
      },
      onClick,
      children: /* @__PURE__ */ jsxs(Box, { className: "text-center", children: [
        isInitial && /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground text-xs block", children: "\u25B6 start" }),
        /* @__PURE__ */ jsx(
          Typography,
          {
            variant: "body2",
            className: cn(
              "font-bold whitespace-nowrap",
              isCurrent ? "text-primary" : "text-foreground"
            ),
            children: name
          }
        )
      ] })
    }
  );
}
StateNode2.displayName = "StateNode";
var NODE_RADIUS = 40;
function TransitionArrow({
  from,
  to,
  eventLabel,
  guardHint,
  isActive = false,
  onClick,
  className
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return /* @__PURE__ */ jsx(Fragment, {});
  const nx = dx / dist;
  const ny = dy / dist;
  const startX = from.x + nx * NODE_RADIUS;
  const startY = from.y + ny * NODE_RADIUS;
  const endX = to.x - nx * NODE_RADIUS;
  const endY = to.y - ny * NODE_RADIUS;
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const perpX = -ny * 20;
  const perpY = nx * 20;
  const ctrlX = midX + perpX;
  const ctrlY = midY + perpY;
  const path = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
  return /* @__PURE__ */ jsxs("g", { className: cn("cursor-pointer", className), onClick, children: [
    /* @__PURE__ */ jsx(
      "path",
      {
        d: path,
        fill: "none",
        stroke: isActive ? "var(--color-primary)" : "var(--color-border)",
        strokeWidth: isActive ? 3 : 2,
        markerEnd: isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"
      }
    ),
    /* @__PURE__ */ jsx(
      "text",
      {
        x: ctrlX,
        y: ctrlY - 8,
        textAnchor: "middle",
        fill: isActive ? "var(--color-primary)" : "var(--color-foreground)",
        fontSize: 12,
        fontWeight: isActive ? "bold" : "normal",
        className: "select-none",
        children: eventLabel
      }
    ),
    guardHint && /* @__PURE__ */ jsx(
      "text",
      {
        x: ctrlX,
        y: ctrlY + 6,
        textAnchor: "middle",
        fill: "var(--color-warning)",
        fontSize: 10,
        className: "select-none",
        children: "\u26A0 " + guardHint
      }
    )
  ] });
}
TransitionArrow.displayName = "TransitionArrow";
function VariablePanel({
  entityName,
  variables,
  className
}) {
  const { t } = useTranslate();
  return /* @__PURE__ */ jsxs(VStack, { className: cn("p-3 rounded-lg bg-card border border-border", className), gap: "sm", children: [
    /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-muted-foreground font-medium", children: t("stateArchitect.variables", { name: entityName }) }),
    variables.map((v) => {
      const max = v.max ?? 100;
      const min = v.min ?? 0;
      const pct = Math.round((v.value - min) / (max - min) * 100);
      const isHigh = pct > 80;
      const isLow = pct < 20;
      return /* @__PURE__ */ jsxs(VStack, { gap: "none", children: [
        /* @__PURE__ */ jsxs(HStack, { className: "items-center justify-between", children: [
          /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-foreground font-medium", children: v.name }),
          /* @__PURE__ */ jsxs(Typography, { variant: "caption", className: cn(
            isHigh ? "text-error" : isLow ? "text-warning" : "text-foreground"
          ), children: [
            v.value,
            v.unit || "",
            " / ",
            max,
            v.unit || ""
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          ProgressBar,
          {
            value: pct,
            color: isHigh ? "danger" : isLow ? "warning" : "primary",
            size: "sm"
          }
        )
      ] }, v.name);
    })
  ] });
}
VariablePanel.displayName = "VariablePanel";
function CodeView({
  data,
  label,
  defaultExpanded = false,
  className
}) {
  const { t } = useTranslate();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const jsonString = JSON.stringify(data, null, 2);
  return /* @__PURE__ */ jsxs(VStack, { className: cn("rounded-lg border border-border overflow-hidden", className), gap: "none", children: [
    /* @__PURE__ */ jsxs(HStack, { className: "items-center justify-between p-2 bg-muted", gap: "sm", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground font-medium", children: label ?? t("stateArchitect.viewCode") }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: () => setExpanded(!expanded), className: "text-xs", children: expanded ? t("stateArchitect.hideJson") : t("stateArchitect.showJson") })
    ] }),
    expanded && /* @__PURE__ */ jsx(Box, { className: "p-3 bg-background overflow-x-auto", children: /* @__PURE__ */ jsx(
      Typography,
      {
        variant: "caption",
        className: "text-foreground font-mono whitespace-pre text-xs leading-relaxed block",
        children: jsonString
      }
    ) })
  ] });
}
CodeView.displayName = "CodeView";
var ENCOURAGEMENT_KEYS3 = [
  "puzzle.tryAgain1",
  "puzzle.tryAgain2",
  "puzzle.tryAgain3"
];
function layoutStates(states, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy) - 60;
  const positions = {};
  states.forEach((state, i) => {
    const angle = 2 * Math.PI * i / states.length - Math.PI / 2;
    positions[state] = {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  });
  return positions;
}
var nextTransId = 100;
function StateArchitectBoard({
  entity,
  stepDurationMs = 600,
  testEvent,
  completeEvent,
  className
}) {
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const [transitions, setTransitions] = useState(entity.transitions);
  const [playState, setPlayState] = useState("editing");
  const [currentState, setCurrentState] = useState(entity.initialState);
  const [selectedState, setSelectedState] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [variables, setVariables] = useState(entity.variables);
  const [attempts, setAttempts] = useState(0);
  const timerRef = useRef(null);
  const [addingFrom, setAddingFrom] = useState(null);
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);
  const GRAPH_W = 500;
  const GRAPH_H = 400;
  const positions = useMemo(() => layoutStates(entity.states, GRAPH_W, GRAPH_H), [entity.states]);
  const handleStateClick = useCallback((state) => {
    if (playState !== "editing") return;
    if (addingFrom) {
      if (addingFrom !== state) {
        const event = entity.availableEvents[0] || "EVENT";
        const newTrans = {
          id: `t-${nextTransId++}`,
          from: addingFrom,
          to: state,
          event
        };
        setTransitions((prev) => [...prev, newTrans]);
      }
      setAddingFrom(null);
    } else {
      setSelectedState(state);
    }
  }, [playState, addingFrom, entity.availableEvents]);
  const handleStartAddTransition = useCallback(() => {
    if (!selectedState) return;
    setAddingFrom(selectedState);
  }, [selectedState]);
  const handleRemoveTransition = useCallback((transId) => {
    setTransitions((prev) => prev.filter((t2) => t2.id !== transId));
  }, []);
  const machine = useMemo(() => ({
    name: entity.entityName,
    description: entity.description,
    states: entity.states,
    currentState,
    transitions: transitions.map((t2) => ({
      from: t2.from,
      to: t2.to,
      event: t2.event,
      guardHint: t2.guardHint
    }))
  }), [entity, currentState, transitions]);
  const handleTest = useCallback(() => {
    if (playState !== "editing") return;
    if (testEvent) emit(`UI:${testEvent}`, {});
    setPlayState("testing");
    setTestResults([]);
    const results = [];
    let testIdx = 0;
    const runNextTest = () => {
      if (testIdx >= entity.testCases.length) {
        const allPassed = results.every((r) => r.passed);
        setPlayState(allPassed ? "success" : "fail");
        setTestResults(results);
        if (allPassed && completeEvent) {
          emit(`UI:${completeEvent}`, {
            success: true,
            passedTests: results.filter((r) => r.passed).length
          });
        }
        if (!allPassed) {
          setAttempts((prev) => prev + 1);
        }
        return;
      }
      const testCase = entity.testCases[testIdx];
      let state = entity.initialState;
      for (const event of testCase.events) {
        const trans = transitions.find((t2) => t2.from === state && t2.event === event);
        if (trans) {
          state = trans.to;
        }
      }
      setCurrentState(state);
      results.push({
        label: testCase.label,
        passed: state === testCase.expectedState,
        actualState: state,
        expectedState: testCase.expectedState
      });
      testIdx++;
      timerRef.current = setTimeout(runNextTest, stepDurationMs);
    };
    timerRef.current = setTimeout(runNextTest, stepDurationMs);
  }, [playState, transitions, entity, stepDurationMs, testEvent, completeEvent, emit]);
  const handleTryAgain = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlayState("editing");
    setCurrentState(entity.initialState);
    setTestResults([]);
  }, [entity.initialState]);
  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTransitions(entity.transitions);
    setPlayState("editing");
    setCurrentState(entity.initialState);
    setTestResults([]);
    setVariables(entity.variables);
    setSelectedState(null);
    setAddingFrom(null);
    setAttempts(0);
  }, [entity]);
  const codeData = useMemo(() => ({
    name: entity.entityName,
    states: entity.states,
    initialState: entity.initialState,
    transitions: transitions.map((t2) => ({
      from: t2.from,
      to: t2.to,
      event: t2.event,
      ...t2.guardHint ? { guard: t2.guardHint } : {}
    }))
  }), [entity, transitions]);
  return /* @__PURE__ */ jsxs(VStack, { className: cn("p-4 gap-6", className), children: [
    /* @__PURE__ */ jsxs(VStack, { gap: "xs", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "h4", className: "text-foreground", children: entity.title }),
      /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-muted-foreground", children: entity.description }),
      /* @__PURE__ */ jsxs(HStack, { className: "items-center p-2 rounded bg-warning/10 border border-warning/30", gap: "xs", children: [
        /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-warning font-bold", children: t("game.hint") + ":" }),
        /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-foreground", children: entity.hint })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(HStack, { className: "flex-wrap items-start", gap: "lg", children: [
      /* @__PURE__ */ jsxs(VStack, { gap: "sm", className: "flex-1 min-w-[300px]", children: [
        /* @__PURE__ */ jsxs(HStack, { className: "items-center justify-between", children: [
          /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-muted-foreground font-medium", children: t("stateArchitect.graph") }),
          addingFrom && /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-accent animate-pulse", children: t("stateArchitect.clickTarget", { state: addingFrom || "" }) })
        ] }),
        /* @__PURE__ */ jsxs(
          Box,
          {
            position: "relative",
            className: "rounded-lg border border-border bg-background overflow-hidden",
            style: { width: GRAPH_W, height: GRAPH_H },
            children: [
              /* @__PURE__ */ jsxs(
                "svg",
                {
                  width: GRAPH_W,
                  height: GRAPH_H,
                  className: "absolute inset-0",
                  style: { pointerEvents: "none" },
                  children: [
                    /* @__PURE__ */ jsxs("defs", { children: [
                      /* @__PURE__ */ jsx("marker", { id: "arrowhead", markerWidth: "10", markerHeight: "7", refX: "10", refY: "3.5", orient: "auto", children: /* @__PURE__ */ jsx("polygon", { points: "0 0, 10 3.5, 0 7", fill: "var(--color-border)" }) }),
                      /* @__PURE__ */ jsx("marker", { id: "arrowhead-active", markerWidth: "10", markerHeight: "7", refX: "10", refY: "3.5", orient: "auto", children: /* @__PURE__ */ jsx("polygon", { points: "0 0, 10 3.5, 0 7", fill: "var(--color-primary)" }) })
                    ] }),
                    transitions.map((t2) => {
                      const fromPos = positions[t2.from];
                      const toPos = positions[t2.to];
                      if (!fromPos || !toPos) return null;
                      const isActive = t2.from === currentState;
                      return /* @__PURE__ */ jsx(
                        TransitionArrow,
                        {
                          from: fromPos,
                          to: toPos,
                          eventLabel: t2.event,
                          guardHint: t2.guardHint,
                          isActive
                        },
                        t2.id
                      );
                    })
                  ]
                }
              ),
              entity.states.map((state) => /* @__PURE__ */ jsx(
                StateNode2,
                {
                  name: state,
                  position: positions[state],
                  isCurrent: state === currentState,
                  isSelected: state === selectedState,
                  isInitial: state === entity.initialState,
                  onClick: () => handleStateClick(state)
                },
                state
              ))
            ]
          }
        ),
        playState === "editing" && /* @__PURE__ */ jsx(HStack, { gap: "sm", children: /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            onClick: handleStartAddTransition,
            disabled: !selectedState,
            children: selectedState ? t("stateArchitect.addTransition", { state: selectedState }) : t("stateArchitect.addTransitionPrompt")
          }
        ) }),
        transitions.length > 0 && /* @__PURE__ */ jsxs(VStack, { gap: "xs", className: "p-3 rounded-lg bg-muted/50 border border-border", children: [
          /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground font-medium", children: t("stateArchitect.transitions", { count: transitions.length }) + ":" }),
          transitions.map((t2) => /* @__PURE__ */ jsxs(HStack, { className: "items-center text-xs", gap: "xs", children: [
            /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-foreground", children: t2.from }),
            /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground", children: "\u2014[" }),
            /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-accent font-medium", children: t2.event }),
            /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-muted-foreground", children: "]\u2192" }),
            /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-success", children: t2.to }),
            t2.guardHint && /* @__PURE__ */ jsxs(Typography, { variant: "caption", className: "text-warning", children: [
              "(",
              t2.guardHint,
              ")"
            ] }),
            playState === "editing" && /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                onClick: () => handleRemoveTransition(t2.id),
                className: "text-xs ml-auto",
                children: "\xD7"
              }
            )
          ] }, t2.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs(VStack, { gap: "sm", className: "w-[280px] shrink-0", children: [
        /* @__PURE__ */ jsx(TraitStateViewer, { trait: machine, variant: "full", size: "sm" }),
        /* @__PURE__ */ jsx(
          VariablePanel,
          {
            entityName: entity.entityName,
            variables
          }
        ),
        testResults.length > 0 && /* @__PURE__ */ jsxs(VStack, { className: "p-3 rounded-lg bg-card border border-border", gap: "xs", children: [
          /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-muted-foreground font-medium", children: t("stateArchitect.testResults") + ":" }),
          testResults.map((r, i) => /* @__PURE__ */ jsxs(HStack, { className: "items-center text-xs", gap: "xs", children: [
            /* @__PURE__ */ jsx(Typography, { variant: "caption", className: r.passed ? "text-success" : "text-error", children: r.passed ? "\u2714" : "\u2717" }),
            /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-foreground flex-1", children: r.label }),
            !r.passed && /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-error", children: t("stateArchitect.gotState", { state: r.actualState }) })
          ] }, i))
        ] }),
        entity.showCodeView !== false && /* @__PURE__ */ jsx(CodeView, { data: codeData, label: "View Code" })
      ] })
    ] }),
    playState === "success" && /* @__PURE__ */ jsx(Box, { className: "p-4 rounded-lg bg-success/20 border border-success text-center", children: /* @__PURE__ */ jsx(Typography, { variant: "h5", className: "text-success", children: entity.successMessage || t("stateArchitect.allPassed") }) }),
    playState === "fail" && /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
      /* @__PURE__ */ jsx(Box, { className: "p-4 rounded-lg bg-warning/10 border border-warning/30 text-center", children: /* @__PURE__ */ jsx(Typography, { variant: "body1", className: "text-foreground font-medium", children: t(ENCOURAGEMENT_KEYS3[Math.min(attempts - 1, ENCOURAGEMENT_KEYS3.length - 1)] ?? ENCOURAGEMENT_KEYS3[0]) }) }),
      attempts >= 3 && entity.hint && /* @__PURE__ */ jsx(Box, { className: "p-3 rounded-lg bg-accent/10 border border-accent/30", children: /* @__PURE__ */ jsxs(HStack, { className: "items-start", gap: "xs", children: [
        /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-accent font-bold shrink-0", children: "\u{1F4A1} " + t("game.hint") + ":" }),
        /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "text-foreground", children: entity.hint })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(HStack, { gap: "sm", children: [
      playState === "fail" ? /* @__PURE__ */ jsx(Button, { variant: "primary", onClick: handleTryAgain, children: "\u{1F504} " + t("puzzle.tryAgainButton") }) : /* @__PURE__ */ jsx(
        Button,
        {
          variant: "primary",
          onClick: handleTest,
          disabled: playState !== "editing",
          children: "\u25B6 " + t("game.runTests")
        }
      ),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: handleReset, children: "\u21BA " + t("game.reset") })
    ] })
  ] });
}
StateArchitectBoard.displayName = "StateArchitectBoard";
function SimulatorBoard({
  entity,
  completeEvent = "PUZZLE_COMPLETE",
  className
}) {
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const [values, setValues] = useState(() => {
    const init = {};
    for (const p2 of entity.parameters) {
      init[p2.id] = p2.initial;
    }
    return init;
  });
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const computeOutput = useCallback((params) => {
    try {
      const fn = new Function("params", `return (${entity.computeExpression})`);
      return fn(params);
    } catch {
      return 0;
    }
  }, [entity.computeExpression]);
  const output = useMemo(() => computeOutput(values), [computeOutput, values]);
  const isCorrect = Math.abs(output - entity.targetValue) <= entity.targetTolerance;
  const handleParameterChange = (id, value) => {
    if (submitted) return;
    setValues((prev) => ({ ...prev, [id]: value }));
  };
  const handleSubmit = () => {
    setSubmitted(true);
    setAttempts((a) => a + 1);
    if (isCorrect) {
      emit(`UI:${completeEvent}`, { success: true, attempts: attempts + 1 });
    }
  };
  const handleReset = () => {
    setSubmitted(false);
    if (attempts >= 2 && entity.hint) {
      setShowHint(true);
    }
  };
  const handleFullReset = () => {
    const init = {};
    for (const p2 of entity.parameters) {
      init[p2.id] = p2.initial;
    }
    setValues(init);
    setSubmitted(false);
    setAttempts(0);
    setShowHint(false);
  };
  return /* @__PURE__ */ jsx(Box, { className, children: /* @__PURE__ */ jsxs(VStack, { gap: "lg", className: "p-4", children: [
    /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "h4", weight: "bold", children: entity.title }),
      /* @__PURE__ */ jsx(Typography, { variant: "body", children: entity.description })
    ] }) }),
    /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "md", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "small", weight: "bold", className: "uppercase tracking-wider text-[var(--color-muted-foreground)]", children: t("simulator.parameters") }),
      entity.parameters.map((param) => /* @__PURE__ */ jsxs(VStack, { gap: "xs", children: [
        /* @__PURE__ */ jsxs(HStack, { justify: "between", align: "center", children: [
          /* @__PURE__ */ jsx(Typography, { variant: "body", weight: "medium", children: param.label }),
          /* @__PURE__ */ jsxs(Badge, { size: "sm", children: [
            values[param.id],
            " ",
            param.unit
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: param.min,
            max: param.max,
            step: param.step,
            value: values[param.id],
            onChange: (e) => handleParameterChange(param.id, Number(e.target.value)),
            disabled: submitted,
            className: "w-full accent-[var(--color-foreground)]"
          }
        ),
        /* @__PURE__ */ jsxs(HStack, { justify: "between", children: [
          /* @__PURE__ */ jsxs(Typography, { variant: "caption", className: "text-[var(--color-muted-foreground)]", children: [
            param.min,
            " ",
            param.unit
          ] }),
          /* @__PURE__ */ jsxs(Typography, { variant: "caption", className: "text-[var(--color-muted-foreground)]", children: [
            param.max,
            " ",
            param.unit
          ] })
        ] })
      ] }, param.id))
    ] }) }),
    /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", align: "center", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "small", weight: "bold", className: "uppercase tracking-wider text-[var(--color-muted-foreground)]", children: entity.outputLabel }),
      /* @__PURE__ */ jsxs(Typography, { variant: "h3", weight: "bold", children: [
        output.toFixed(2),
        " ",
        entity.outputUnit
      ] }),
      submitted && /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
        /* @__PURE__ */ jsx(Icon, { icon: isCorrect ? CheckCircle : XCircle, size: "sm", className: isCorrect ? "text-green-600" : "text-red-600" }),
        /* @__PURE__ */ jsx(Typography, { variant: "body", className: isCorrect ? "text-green-600" : "text-red-600", children: isCorrect ? entity.successMessage ?? t("simulator.correct") : entity.failMessage ?? t("simulator.incorrect") })
      ] }),
      /* @__PURE__ */ jsxs(Typography, { variant: "caption", className: "text-[var(--color-muted-foreground)]", children: [
        t("simulator.target"),
        ": ",
        entity.targetValue,
        " ",
        entity.outputUnit,
        " (\xB1",
        entity.targetTolerance,
        ")"
      ] })
    ] }) }),
    showHint && entity.hint && /* @__PURE__ */ jsx(Card, { className: "p-4 border-l-4 border-l-yellow-500", children: /* @__PURE__ */ jsx(Typography, { variant: "body", children: entity.hint }) }),
    /* @__PURE__ */ jsxs(HStack, { gap: "sm", justify: "center", children: [
      !submitted ? /* @__PURE__ */ jsxs(Button, { variant: "primary", onClick: handleSubmit, children: [
        /* @__PURE__ */ jsx(Icon, { icon: Play, size: "sm" }),
        t("simulator.simulate")
      ] }) : !isCorrect ? /* @__PURE__ */ jsx(Button, { variant: "primary", onClick: handleReset, children: t("simulator.tryAgain") }) : null,
      /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: handleFullReset, children: [
        /* @__PURE__ */ jsx(Icon, { icon: RotateCcw, size: "sm" }),
        t("simulator.reset")
      ] })
    ] })
  ] }) });
}
SimulatorBoard.displayName = "SimulatorBoard";
function ClassifierBoard({
  entity,
  completeEvent = "PUZZLE_COMPLETE",
  className
}) {
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const [assignments, setAssignments] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const unassignedItems = entity.items.filter((item) => !assignments[item.id]);
  const allAssigned = Object.keys(assignments).length === entity.items.length;
  const results = submitted ? entity.items.map((item) => ({
    item,
    assigned: assignments[item.id],
    correct: assignments[item.id] === item.correctCategory
  })) : [];
  const allCorrect = results.length > 0 && results.every((r) => r.correct);
  const correctCount = results.filter((r) => r.correct).length;
  const handleAssign = (itemId, categoryId) => {
    if (submitted) return;
    setAssignments((prev) => ({ ...prev, [itemId]: categoryId }));
  };
  const handleUnassign = (itemId) => {
    if (submitted) return;
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };
  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setAttempts((a) => a + 1);
    const correct = entity.items.every((item) => assignments[item.id] === item.correctCategory);
    if (correct) {
      emit(`UI:${completeEvent}`, { success: true, attempts: attempts + 1 });
    }
  }, [entity.items, assignments, attempts, completeEvent, emit]);
  const handleReset = () => {
    setSubmitted(false);
    if (attempts >= 2 && entity.hint) {
      setShowHint(true);
    }
  };
  const handleFullReset = () => {
    setAssignments({});
    setSubmitted(false);
    setAttempts(0);
    setShowHint(false);
  };
  return /* @__PURE__ */ jsx(Box, { className, children: /* @__PURE__ */ jsxs(VStack, { gap: "lg", className: "p-4", children: [
    /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "h4", weight: "bold", children: entity.title }),
      /* @__PURE__ */ jsx(Typography, { variant: "body", children: entity.description })
    ] }) }),
    unassignedItems.length > 0 && /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "small", weight: "bold", className: "uppercase tracking-wider text-[var(--color-muted-foreground)]", children: t("classifier.itemsToSort") }),
      /* @__PURE__ */ jsx(HStack, { gap: "sm", className: "flex-wrap", children: unassignedItems.map((item) => /* @__PURE__ */ jsx(Badge, { size: "md", className: "cursor-pointer", children: item.label }, item.id)) })
    ] }) }),
    /* @__PURE__ */ jsx(VStack, { gap: "md", children: entity.categories.map((cat) => {
      const catItems = entity.items.filter((item) => assignments[item.id] === cat.id);
      return /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
        /* @__PURE__ */ jsxs(HStack, { justify: "between", align: "center", children: [
          /* @__PURE__ */ jsx(Typography, { variant: "body", weight: "bold", children: cat.label }),
          /* @__PURE__ */ jsx(Badge, { size: "sm", children: catItems.length })
        ] }),
        /* @__PURE__ */ jsx(HStack, { gap: "xs", className: "flex-wrap min-h-[2rem]", children: catItems.map((item) => {
          const result = results.find((r) => r.item.id === item.id);
          return /* @__PURE__ */ jsxs(
            Badge,
            {
              size: "sm",
              className: `cursor-pointer ${result ? result.correct ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950" : ""}`,
              onClick: () => handleUnassign(item.id),
              children: [
                item.label,
                result && /* @__PURE__ */ jsx(Icon, { icon: result.correct ? CheckCircle : XCircle, size: "xs", className: result.correct ? "text-green-600" : "text-red-600" })
              ]
            },
            item.id
          );
        }) }),
        !submitted && unassignedItems.length > 0 && /* @__PURE__ */ jsx(HStack, { gap: "xs", className: "flex-wrap", children: unassignedItems.map((item) => /* @__PURE__ */ jsxs(
          Button,
          {
            size: "sm",
            variant: "ghost",
            onClick: () => handleAssign(item.id, cat.id),
            className: "text-xs opacity-50 hover:opacity-100",
            children: [
              "+ ",
              item.label
            ]
          },
          item.id
        )) })
      ] }) }, cat.id);
    }) }),
    submitted && /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", align: "center", children: [
      /* @__PURE__ */ jsx(Icon, { icon: allCorrect ? CheckCircle : XCircle, size: "lg", className: allCorrect ? "text-green-600" : "text-red-600" }),
      /* @__PURE__ */ jsx(Typography, { variant: "body", weight: "bold", children: allCorrect ? entity.successMessage ?? t("classifier.allCorrect") : `${correctCount}/${entity.items.length} ${t("classifier.correct")}` }),
      !allCorrect && entity.failMessage && /* @__PURE__ */ jsx(Typography, { variant: "body", className: "text-[var(--color-muted-foreground)]", children: entity.failMessage })
    ] }) }),
    showHint && entity.hint && /* @__PURE__ */ jsx(Card, { className: "p-4 border-l-4 border-l-yellow-500", children: /* @__PURE__ */ jsx(Typography, { variant: "body", children: entity.hint }) }),
    /* @__PURE__ */ jsxs(HStack, { gap: "sm", justify: "center", children: [
      !submitted ? /* @__PURE__ */ jsxs(Button, { variant: "primary", onClick: handleSubmit, disabled: !allAssigned, children: [
        /* @__PURE__ */ jsx(Icon, { icon: Send, size: "sm" }),
        t("classifier.check")
      ] }) : !allCorrect ? /* @__PURE__ */ jsx(Button, { variant: "primary", onClick: handleReset, children: t("classifier.tryAgain") }) : null,
      /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: handleFullReset, children: [
        /* @__PURE__ */ jsx(Icon, { icon: RotateCcw, size: "sm" }),
        t("classifier.reset")
      ] })
    ] })
  ] }) });
}
ClassifierBoard.displayName = "ClassifierBoard";
function BuilderBoard({
  entity,
  completeEvent = "PUZZLE_COMPLETE",
  className
}) {
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const [placements, setPlacements] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const usedComponentIds = new Set(Object.values(placements));
  const availableComponents = entity.components.filter((c) => !usedComponentIds.has(c.id));
  const [selectedComponent, setSelectedComponent] = useState(null);
  const allPlaced = Object.keys(placements).length === entity.slots.length;
  const results = submitted ? entity.slots.map((slot) => ({
    slot,
    placed: placements[slot.id],
    correct: placements[slot.id] === slot.acceptsComponentId
  })) : [];
  const allCorrect = results.length > 0 && results.every((r) => r.correct);
  const handlePlaceComponent = (slotId) => {
    if (submitted || !selectedComponent) return;
    setPlacements((prev) => ({ ...prev, [slotId]: selectedComponent }));
    setSelectedComponent(null);
  };
  const handleRemoveFromSlot = (slotId) => {
    if (submitted) return;
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  };
  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setAttempts((a) => a + 1);
    const correct = entity.slots.every((slot) => placements[slot.id] === slot.acceptsComponentId);
    if (correct) {
      emit(`UI:${completeEvent}`, { success: true, attempts: attempts + 1 });
    }
  }, [entity.slots, placements, attempts, completeEvent, emit]);
  const handleReset = () => {
    setSubmitted(false);
    if (attempts >= 2 && entity.hint) {
      setShowHint(true);
    }
  };
  const handleFullReset = () => {
    setPlacements({});
    setSubmitted(false);
    setSelectedComponent(null);
    setAttempts(0);
    setShowHint(false);
  };
  const getComponentById = (id) => entity.components.find((c) => c.id === id);
  return /* @__PURE__ */ jsx(Box, { className, children: /* @__PURE__ */ jsxs(VStack, { gap: "lg", className: "p-4", children: [
    /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "h4", weight: "bold", children: entity.title }),
      /* @__PURE__ */ jsx(Typography, { variant: "body", children: entity.description })
    ] }) }),
    /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "small", weight: "bold", className: "uppercase tracking-wider text-[var(--color-muted-foreground)]", children: t("builder.components") }),
      /* @__PURE__ */ jsxs(HStack, { gap: "sm", className: "flex-wrap", children: [
        availableComponents.map((comp) => /* @__PURE__ */ jsxs(
          Button,
          {
            size: "sm",
            variant: selectedComponent === comp.id ? "primary" : "secondary",
            onClick: () => setSelectedComponent(selectedComponent === comp.id ? null : comp.id),
            disabled: submitted,
            children: [
              comp.iconEmoji && `${comp.iconEmoji} `,
              comp.label
            ]
          },
          comp.id
        )),
        availableComponents.length === 0 && !submitted && /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-[var(--color-muted-foreground)]", children: t("builder.allPlaced") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "small", weight: "bold", className: "uppercase tracking-wider text-[var(--color-muted-foreground)]", children: t("builder.blueprint") }),
      /* @__PURE__ */ jsx(VStack, { gap: "sm", children: entity.slots.map((slot) => {
        const placedComp = placements[slot.id] ? getComponentById(placements[slot.id]) : null;
        const result = results.find((r) => r.slot.id === slot.id);
        return /* @__PURE__ */ jsxs(
          HStack,
          {
            gap: "sm",
            align: "center",
            className: `p-3 border-2 rounded ${result ? result.correct ? "border-green-500" : "border-red-500" : selectedComponent ? "border-dashed border-[var(--color-foreground)] cursor-pointer" : "border-[var(--color-border)]"}`,
            onClick: () => handlePlaceComponent(slot.id),
            children: [
              /* @__PURE__ */ jsxs(VStack, { gap: "none", className: "flex-1", children: [
                /* @__PURE__ */ jsx(Typography, { variant: "body", weight: "medium", children: slot.label }),
                slot.description && /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-[var(--color-muted-foreground)]", children: slot.description })
              ] }),
              placedComp ? /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
                /* @__PURE__ */ jsxs(Badge, { size: "sm", onClick: () => handleRemoveFromSlot(slot.id), children: [
                  placedComp.iconEmoji && `${placedComp.iconEmoji} `,
                  placedComp.label
                ] }),
                result && /* @__PURE__ */ jsx(Icon, { icon: result.correct ? CheckCircle : XCircle, size: "sm", className: result.correct ? "text-green-600" : "text-red-600" })
              ] }) : /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-[var(--color-muted-foreground)]", children: t("builder.empty") })
            ]
          },
          slot.id
        );
      }) })
    ] }) }),
    submitted && /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", align: "center", children: [
      /* @__PURE__ */ jsx(Icon, { icon: allCorrect ? CheckCircle : XCircle, size: "lg", className: allCorrect ? "text-green-600" : "text-red-600" }),
      /* @__PURE__ */ jsx(Typography, { variant: "body", weight: "bold", children: allCorrect ? entity.successMessage ?? t("builder.success") : entity.failMessage ?? t("builder.incorrect") })
    ] }) }),
    showHint && entity.hint && /* @__PURE__ */ jsx(Card, { className: "p-4 border-l-4 border-l-yellow-500", children: /* @__PURE__ */ jsx(Typography, { variant: "body", children: entity.hint }) }),
    /* @__PURE__ */ jsxs(HStack, { gap: "sm", justify: "center", children: [
      !submitted ? /* @__PURE__ */ jsxs(Button, { variant: "primary", onClick: handleSubmit, disabled: !allPlaced, children: [
        /* @__PURE__ */ jsx(Icon, { icon: Wrench, size: "sm" }),
        t("builder.build")
      ] }) : !allCorrect ? /* @__PURE__ */ jsx(Button, { variant: "primary", onClick: handleReset, children: t("builder.tryAgain") }) : null,
      /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: handleFullReset, children: [
        /* @__PURE__ */ jsx(Icon, { icon: RotateCcw, size: "sm" }),
        t("builder.reset")
      ] })
    ] })
  ] }) });
}
BuilderBoard.displayName = "BuilderBoard";
function DebuggerBoard({
  entity,
  completeEvent = "PUZZLE_COMPLETE",
  className
}) {
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const [flaggedLines, setFlaggedLines] = useState(/* @__PURE__ */ new Set());
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const toggleLine = (lineId) => {
    if (submitted) return;
    setFlaggedLines((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) {
        next.delete(lineId);
      } else {
        next.add(lineId);
      }
      return next;
    });
  };
  const bugLines = entity.lines.filter((l) => l.isBug);
  const correctFlags = entity.lines.filter((l) => l.isBug && flaggedLines.has(l.id));
  const falseFlags = entity.lines.filter((l) => !l.isBug && flaggedLines.has(l.id));
  const allCorrect = submitted && correctFlags.length === bugLines.length && falseFlags.length === 0;
  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setAttempts((a) => a + 1);
    const correct = correctFlags.length === bugLines.length && falseFlags.length === 0;
    if (correct) {
      emit(`UI:${completeEvent}`, { success: true, attempts: attempts + 1 });
    }
  }, [correctFlags.length, bugLines.length, falseFlags.length, attempts, completeEvent, emit]);
  const handleReset = () => {
    setSubmitted(false);
    if (attempts >= 2 && entity.hint) {
      setShowHint(true);
    }
  };
  const handleFullReset = () => {
    setFlaggedLines(/* @__PURE__ */ new Set());
    setSubmitted(false);
    setAttempts(0);
    setShowHint(false);
  };
  return /* @__PURE__ */ jsx(Box, { className, children: /* @__PURE__ */ jsxs(VStack, { gap: "lg", className: "p-4", children: [
    /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
      /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
        /* @__PURE__ */ jsx(Icon, { icon: Bug, size: "sm" }),
        /* @__PURE__ */ jsx(Typography, { variant: "h4", weight: "bold", children: entity.title })
      ] }),
      /* @__PURE__ */ jsx(Typography, { variant: "body", children: entity.description }),
      /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-[var(--color-muted-foreground)]", children: t("debugger.findBugs", { count: String(entity.bugCount) }) })
    ] }) }),
    /* @__PURE__ */ jsx(Card, { className: "p-0 overflow-hidden", children: /* @__PURE__ */ jsx(VStack, { gap: "none", children: entity.lines.map((line, i) => {
      const isFlagged = flaggedLines.has(line.id);
      let lineStyle = "";
      if (submitted) {
        if (line.isBug && isFlagged) lineStyle = "bg-green-50 dark:bg-green-950";
        else if (line.isBug && !isFlagged) lineStyle = "bg-yellow-50 dark:bg-yellow-950";
        else if (!line.isBug && isFlagged) lineStyle = "bg-red-50 dark:bg-red-950";
      } else if (isFlagged) {
        lineStyle = "bg-red-50 dark:bg-red-950";
      }
      return /* @__PURE__ */ jsxs(
        HStack,
        {
          gap: "none",
          align: "stretch",
          className: `border-b border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-muted)] ${lineStyle}`,
          onClick: () => toggleLine(line.id),
          children: [
            /* @__PURE__ */ jsx(Box, { className: "w-10 flex-shrink-0 flex items-center justify-center border-r border-[var(--color-border)] text-[var(--color-muted-foreground)]", children: /* @__PURE__ */ jsx(Typography, { variant: "caption", children: i + 1 }) }),
            /* @__PURE__ */ jsx(Box, { className: "flex-1 px-3 py-1.5 font-mono text-sm whitespace-pre", children: /* @__PURE__ */ jsx(Typography, { variant: "body", className: "font-mono text-sm", children: line.content }) }),
            /* @__PURE__ */ jsxs(Box, { className: "w-8 flex-shrink-0 flex items-center justify-center", children: [
              isFlagged && /* @__PURE__ */ jsx(Icon, { icon: Bug, size: "xs", className: "text-red-600" }),
              submitted && line.isBug && !isFlagged && /* @__PURE__ */ jsx(Icon, { icon: Bug, size: "xs", className: "text-yellow-600" })
            ] })
          ]
        },
        line.id
      );
    }) }) }),
    submitted && /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "body", weight: "bold", children: allCorrect ? entity.successMessage ?? t("debugger.allFound") : `${correctFlags.length}/${bugLines.length} ${t("debugger.bugsFound")}` }),
      bugLines.map((line) => /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "start", children: [
        /* @__PURE__ */ jsx(
          Icon,
          {
            icon: flaggedLines.has(line.id) ? CheckCircle : XCircle,
            size: "xs",
            className: flaggedLines.has(line.id) ? "text-green-600 mt-0.5" : "text-yellow-600 mt-0.5"
          }
        ),
        /* @__PURE__ */ jsxs(VStack, { gap: "none", children: [
          /* @__PURE__ */ jsx(Typography, { variant: "caption", weight: "bold", className: "font-mono", children: line.content.trim() }),
          line.explanation && /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-[var(--color-muted-foreground)]", children: line.explanation })
        ] })
      ] }, line.id))
    ] }) }),
    showHint && entity.hint && /* @__PURE__ */ jsx(Card, { className: "p-4 border-l-4 border-l-yellow-500", children: /* @__PURE__ */ jsx(Typography, { variant: "body", children: entity.hint }) }),
    /* @__PURE__ */ jsxs(HStack, { gap: "sm", justify: "center", children: [
      !submitted ? /* @__PURE__ */ jsxs(Button, { variant: "primary", onClick: handleSubmit, disabled: flaggedLines.size === 0, children: [
        /* @__PURE__ */ jsx(Icon, { icon: Send, size: "sm" }),
        t("debugger.submit")
      ] }) : !allCorrect ? /* @__PURE__ */ jsx(Button, { variant: "primary", onClick: handleReset, children: t("debugger.tryAgain") }) : null,
      /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: handleFullReset, children: [
        /* @__PURE__ */ jsx(Icon, { icon: RotateCcw, size: "sm" }),
        t("debugger.reset")
      ] })
    ] })
  ] }) });
}
DebuggerBoard.displayName = "DebuggerBoard";
function getOpponentAction(strategy, actions, history) {
  const actionIds = actions.map((a) => a.id);
  switch (strategy) {
    case "always-cooperate":
      return actionIds[0];
    case "always-defect":
      return actionIds[actionIds.length - 1];
    case "tit-for-tat":
      if (history.length === 0) return actionIds[0];
      return history[history.length - 1].playerAction;
    case "random":
    default:
      return actionIds[Math.floor(Math.random() * actionIds.length)];
  }
}
function NegotiatorBoard({
  entity,
  completeEvent = "PUZZLE_COMPLETE",
  className
}) {
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const [history, setHistory] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const currentRound = history.length;
  const isComplete = currentRound >= entity.totalRounds;
  const playerTotal = history.reduce((s, r) => s + r.playerPayoff, 0);
  const opponentTotal = history.reduce((s, r) => s + r.opponentPayoff, 0);
  const won = isComplete && playerTotal >= entity.targetScore;
  const handleAction = useCallback((actionId) => {
    if (isComplete) return;
    const opponentAction = getOpponentAction(entity.opponentStrategy, entity.actions, history);
    const payoff = entity.payoffMatrix.find(
      (p2) => p2.playerAction === actionId && p2.opponentAction === opponentAction
    );
    const result = {
      round: currentRound + 1,
      playerAction: actionId,
      opponentAction,
      playerPayoff: payoff?.playerPayoff ?? 0,
      opponentPayoff: payoff?.opponentPayoff ?? 0
    };
    const newHistory = [...history, result];
    setHistory(newHistory);
    if (newHistory.length >= entity.totalRounds) {
      const total = newHistory.reduce((s, r) => s + r.playerPayoff, 0);
      if (total >= entity.targetScore) {
        emit(`UI:${completeEvent}`, { success: true, score: total });
      }
      if (newHistory.length >= 3 && entity.hint) {
        setShowHint(true);
      }
    }
  }, [isComplete, entity, history, currentRound, completeEvent, emit]);
  const handleReset = () => {
    setHistory([]);
    setShowHint(false);
  };
  const getActionLabel = (id) => entity.actions.find((a) => a.id === id)?.label ?? id;
  return /* @__PURE__ */ jsx(Box, { className, children: /* @__PURE__ */ jsxs(VStack, { gap: "lg", className: "p-4", children: [
    /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "h4", weight: "bold", children: entity.title }),
      /* @__PURE__ */ jsx(Typography, { variant: "body", children: entity.description }),
      /* @__PURE__ */ jsxs(HStack, { gap: "md", children: [
        /* @__PURE__ */ jsx(Badge, { size: "sm", children: t("negotiator.round", { current: String(currentRound), total: String(entity.totalRounds) }) }),
        /* @__PURE__ */ jsxs(Badge, { size: "sm", children: [
          t("negotiator.target"),
          ": ",
          entity.targetScore
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(HStack, { gap: "md", justify: "center", children: [
      /* @__PURE__ */ jsx(Card, { className: "p-4 flex-1 text-center", children: /* @__PURE__ */ jsxs(VStack, { gap: "xs", align: "center", children: [
        /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-[var(--color-muted-foreground)]", children: t("negotiator.you") }),
        /* @__PURE__ */ jsx(Typography, { variant: "h3", weight: "bold", children: playerTotal })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "p-4 flex-1 text-center", children: /* @__PURE__ */ jsxs(VStack, { gap: "xs", align: "center", children: [
        /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-[var(--color-muted-foreground)]", children: t("negotiator.opponent") }),
        /* @__PURE__ */ jsx(Typography, { variant: "h3", weight: "bold", children: opponentTotal })
      ] }) })
    ] }),
    !isComplete && /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "small", weight: "bold", className: "uppercase tracking-wider text-[var(--color-muted-foreground)]", children: t("negotiator.chooseAction") }),
      /* @__PURE__ */ jsx(HStack, { gap: "sm", justify: "center", className: "flex-wrap", children: entity.actions.map((action) => /* @__PURE__ */ jsx(
        Button,
        {
          variant: "primary",
          onClick: () => handleAction(action.id),
          children: action.label
        },
        action.id
      )) })
    ] }) }),
    history.length > 0 && /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "small", weight: "bold", className: "uppercase tracking-wider text-[var(--color-muted-foreground)]", children: t("negotiator.history") }),
      history.map((round) => /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", className: "text-sm", children: [
        /* @__PURE__ */ jsxs(Badge, { size: "sm", children: [
          "R",
          round.round
        ] }),
        /* @__PURE__ */ jsx(Typography, { variant: "caption", children: getActionLabel(round.playerAction) }),
        /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-[var(--color-muted-foreground)]", children: "vs" }),
        /* @__PURE__ */ jsx(Typography, { variant: "caption", children: getActionLabel(round.opponentAction) }),
        /* @__PURE__ */ jsx(Icon, { icon: ArrowRight, size: "xs" }),
        /* @__PURE__ */ jsxs(Typography, { variant: "caption", weight: "bold", className: "text-green-600", children: [
          "+",
          round.playerPayoff
        ] }),
        /* @__PURE__ */ jsxs(Typography, { variant: "caption", className: "text-[var(--color-muted-foreground)]", children: [
          "/ +",
          round.opponentPayoff
        ] })
      ] }, round.round))
    ] }) }),
    isComplete && /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", align: "center", children: [
      /* @__PURE__ */ jsx(Icon, { icon: CheckCircle, size: "lg", className: won ? "text-green-600" : "text-red-600" }),
      /* @__PURE__ */ jsx(Typography, { variant: "body", weight: "bold", children: won ? entity.successMessage ?? t("negotiator.success") : entity.failMessage ?? t("negotiator.failed") }),
      /* @__PURE__ */ jsxs(Typography, { variant: "caption", className: "text-[var(--color-muted-foreground)]", children: [
        t("negotiator.finalScore"),
        ": ",
        playerTotal,
        "/",
        entity.targetScore
      ] })
    ] }) }),
    showHint && entity.hint && !won && /* @__PURE__ */ jsx(Card, { className: "p-4 border-l-4 border-l-yellow-500", children: /* @__PURE__ */ jsx(Typography, { variant: "body", children: entity.hint }) }),
    isComplete && !won && /* @__PURE__ */ jsx(HStack, { justify: "center", children: /* @__PURE__ */ jsx(Button, { variant: "primary", onClick: handleReset, children: t("negotiator.playAgain") }) })
  ] }) });
}
NegotiatorBoard.displayName = "NegotiatorBoard";
function SimulationCanvas({
  preset,
  width = 600,
  height = 400,
  running,
  speed = 1,
  className
}) {
  const canvasRef = useRef(null);
  const bodiesRef = useRef(structuredClone(preset.bodies));
  useEffect(() => {
    bodiesRef.current = structuredClone(preset.bodies);
  }, [preset]);
  const step = useCallback(() => {
    const dt = 1 / 60 * speed;
    const gx = preset.gravity?.x ?? 0;
    const gy = preset.gravity?.y ?? 9.81;
    const bodies = bodiesRef.current;
    for (const body of bodies) {
      if (body.fixed) continue;
      body.vx += gx * dt;
      body.vy += gy * dt;
      body.x += body.vx * dt;
      body.y += body.vy * dt;
      if (body.y + body.radius > height) {
        body.y = height - body.radius;
        body.vy = -body.vy * 0.8;
      }
      if (body.x + body.radius > width) {
        body.x = width - body.radius;
        body.vx = -body.vx * 0.8;
      }
      if (body.x - body.radius < 0) {
        body.x = body.radius;
        body.vx = -body.vx * 0.8;
      }
    }
    if (preset.constraints) {
      for (const c of preset.constraints) {
        const a = bodies[c.bodyA];
        const b = bodies[c.bodyB];
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1e-3;
        const diff = (dist - c.length) / dist;
        const fx = dx * diff * c.stiffness;
        const fy = dy * diff * c.stiffness;
        if (!a.fixed) {
          a.vx += fx * dt;
          a.vy += fy * dt;
        }
        if (!b.fixed) {
          b.vx -= fx * dt;
          b.vy -= fy * dt;
        }
      }
    }
  }, [preset, width, height, speed]);
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bodies = bodiesRef.current;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = preset.backgroundColor ?? "#1a1a2e";
    ctx.fillRect(0, 0, width, height);
    if (preset.constraints) {
      for (const c of preset.constraints) {
        const a = bodies[c.bodyA];
        const b = bodies[c.bodyB];
        if (a && b) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = "#533483";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }
    for (const body of bodies) {
      ctx.beginPath();
      ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
      ctx.fillStyle = body.color ?? "#e94560";
      ctx.fill();
      if (preset.showVelocity) {
        ctx.beginPath();
        ctx.moveTo(body.x, body.y);
        ctx.lineTo(body.x + body.vx * 0.1, body.y + body.vy * 0.1);
        ctx.strokeStyle = "#16213e";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }, [width, height, preset]);
  useEffect(() => {
    if (!running) return;
    let raf;
    const loop = () => {
      step();
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, step, draw]);
  useEffect(() => {
    draw();
  }, [draw]);
  return /* @__PURE__ */ jsx(Box, { className, children: /* @__PURE__ */ jsx("canvas", { ref: canvasRef, width, height, className: "rounded-md" }) });
}
SimulationCanvas.displayName = "SimulationCanvas";
function SimulationControls({
  running,
  speed,
  parameters,
  onPlay,
  onPause,
  onStep,
  onReset,
  onSpeedChange,
  onParameterChange,
  className
}) {
  return /* @__PURE__ */ jsxs(VStack, { gap: "md", className, children: [
    /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", children: [
      running ? /* @__PURE__ */ jsx(Button, { size: "sm", variant: "secondary", onClick: onPause, icon: Pause, children: "Pause" }) : /* @__PURE__ */ jsx(Button, { size: "sm", variant: "primary", onClick: onPlay, icon: Play, children: "Play" }),
      /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: onStep, icon: SkipForward, disabled: running, children: "Step" }),
      /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: onReset, icon: RotateCcw, children: "Reset" })
    ] }),
    /* @__PURE__ */ jsxs(VStack, { gap: "xs", children: [
      /* @__PURE__ */ jsxs(Typography, { variant: "caption", color: "muted", children: [
        "Speed: ",
        speed.toFixed(1),
        "x"
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "range",
          min: 0.1,
          max: 5,
          step: 0.1,
          value: speed,
          onChange: (e) => onSpeedChange(parseFloat(e.target.value)),
          className: "w-full"
        }
      )
    ] }),
    Object.entries(parameters).map(([name, param]) => /* @__PURE__ */ jsxs(VStack, { gap: "xs", children: [
      /* @__PURE__ */ jsxs(Typography, { variant: "caption", color: "muted", children: [
        param.label,
        ": ",
        param.value.toFixed(2)
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "range",
          min: param.min,
          max: param.max,
          step: param.step,
          value: param.value,
          onChange: (e) => onParameterChange(name, parseFloat(e.target.value)),
          className: "w-full"
        }
      )
    ] }, name))
  ] });
}
SimulationControls.displayName = "SimulationControls";
function SimulationGraph({
  label,
  unit,
  data,
  maxPoints = 200,
  width = 300,
  height = 120,
  color = "#e94560",
  className
}) {
  const canvasRef = useRef(null);
  const visibleData = data.slice(-maxPoints);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || visibleData.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0f0f23";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#1a1a3e";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 5; i++) {
      const y = height / 5 * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (const pt of visibleData) {
      if (pt.value < minVal) minVal = pt.value;
      if (pt.value > maxVal) maxVal = pt.value;
    }
    const range = maxVal - minVal || 1;
    const pad = height * 0.1;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let i = 0; i < visibleData.length; i++) {
      const x = i / (maxPoints - 1) * width;
      const y = pad + (maxVal - visibleData[i].value) / range * (height - 2 * pad);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    const last = visibleData[visibleData.length - 1];
    ctx.fillStyle = color;
    ctx.font = "12px monospace";
    ctx.fillText(`${last.value.toFixed(2)} ${unit}`, width - 80, 16);
  }, [visibleData, width, height, color, unit, maxPoints]);
  return /* @__PURE__ */ jsx(Card, { padding: "sm", className, children: /* @__PURE__ */ jsxs(VStack, { gap: "xs", children: [
    /* @__PURE__ */ jsx(Typography, { variant: "caption", weight: "bold", children: label }),
    /* @__PURE__ */ jsx("canvas", { ref: canvasRef, width, height, className: "rounded" })
  ] }) });
}
SimulationGraph.displayName = "SimulationGraph";

// components/organisms/game/physics-sim/presets/mechanics.ts
var projectileMotion = {
  id: "mechanics-projectile",
  name: "Projectile Motion",
  description: "Launch a ball and observe parabolic trajectory under gravity.",
  domain: "natural",
  gravity: { x: 0, y: 9.81 },
  bodies: [
    { id: "ball", x: 50, y: 350, vx: 80, vy: -120, mass: 1, radius: 10, color: "#e94560", fixed: false },
    { id: "ground", x: 300, y: 390, vx: 0, vy: 0, mass: 1e3, radius: 400, color: "#333", fixed: true }
  ],
  showVelocity: true,
  parameters: {
    angle: { value: 45, min: 0, max: 90, step: 1, label: "Launch angle (deg)" },
    velocity: { value: 100, min: 10, max: 200, step: 5, label: "Initial velocity (m/s)" },
    gravity: { value: 9.81, min: 0, max: 20, step: 0.1, label: "Gravity (m/s\xB2)" }
  }
};
var pendulum = {
  id: "mechanics-pendulum",
  name: "Simple Pendulum",
  description: "A mass on a string swinging under gravity.",
  domain: "natural",
  gravity: { x: 0, y: 9.81 },
  bodies: [
    { id: "pivot", x: 300, y: 50, vx: 0, vy: 0, mass: 1e3, radius: 5, color: "#888", fixed: true },
    { id: "bob", x: 400, y: 200, vx: 0, vy: 0, mass: 5, radius: 15, color: "#e94560", fixed: false }
  ],
  constraints: [{ bodyA: 0, bodyB: 1, length: 180, stiffness: 1 }],
  parameters: {
    length: { value: 180, min: 50, max: 300, step: 10, label: "String length (px)" },
    mass: { value: 5, min: 1, max: 20, step: 0.5, label: "Mass (kg)" },
    gravity: { value: 9.81, min: 0, max: 20, step: 0.1, label: "Gravity (m/s\xB2)" }
  }
};
var springOscillator = {
  id: "mechanics-spring",
  name: "Spring Oscillator",
  description: "A mass bouncing on a spring \u2014 simple harmonic motion.",
  domain: "natural",
  gravity: { x: 0, y: 0 },
  bodies: [
    { id: "anchor", x: 300, y: 50, vx: 0, vy: 0, mass: 1e3, radius: 8, color: "#888", fixed: true },
    { id: "mass", x: 300, y: 250, vx: 0, vy: 0, mass: 2, radius: 20, color: "#0f3460", fixed: false }
  ],
  constraints: [{ bodyA: 0, bodyB: 1, length: 150, stiffness: 0.5 }],
  parameters: {
    stiffness: { value: 0.5, min: 0.1, max: 2, step: 0.05, label: "Spring stiffness (k)" },
    mass: { value: 2, min: 0.5, max: 10, step: 0.5, label: "Mass (kg)" },
    damping: { value: 0, min: 0, max: 0.5, step: 0.01, label: "Damping" }
  }
};

// components/organisms/game/physics-sim/presets/index.ts
var ALL_PRESETS = [
  projectileMotion,
  pendulum,
  springOscillator
];
var eventIcons = {
  attack: Sword,
  defend: Shield,
  heal: Heart,
  move: Move,
  special: Zap,
  death: Sword,
  spawn: Zap
};
var eventColors = {
  attack: "text-error",
  defend: "text-info",
  heal: "text-success",
  move: "text-primary",
  special: "text-warning",
  death: "text-muted-foreground",
  spawn: "text-accent"
};
var eventBadgeVariants = {
  attack: "danger",
  defend: "primary",
  heal: "success",
  move: "warning",
  special: "secondary",
  death: "secondary",
  spawn: "secondary"
};
function CombatLog({
  events,
  maxVisible = 50,
  autoScroll = true,
  showTimestamps = false,
  className,
  title = "Combat Log"
}) {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, autoScroll]);
  const visibleEvents = events.slice(-maxVisible);
  return /* @__PURE__ */ jsxs(Card, { variant: "default", className: cn("flex flex-col", className), children: [
    /* @__PURE__ */ jsx(Box, { padding: "sm", border: true, className: "border-b-2 border-x-0 border-t-0 border-[var(--color-border)]", children: /* @__PURE__ */ jsxs(Box, { display: "flex", className: "items-center justify-between", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "body2", className: "font-bold", children: title }),
      /* @__PURE__ */ jsxs(Badge, { variant: "neutral", size: "sm", children: [
        events.length,
        " events"
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Box, { ref: scrollRef, overflow: "auto", className: "flex-1 max-h-64", children: visibleEvents.length === 0 ? /* @__PURE__ */ jsx(Box, { padding: "md", className: "text-center opacity-50", children: /* @__PURE__ */ jsx(Typography, { variant: "body2", children: "No events yet" }) }) : /* @__PURE__ */ jsx(Box, { padding: "xs", className: "space-y-1", children: visibleEvents.map((event) => {
      const EventIcon = eventIcons[event.type];
      const colorClass = eventColors[event.type];
      return /* @__PURE__ */ jsxs(
        Box,
        {
          display: "flex",
          padding: "xs",
          rounded: "sm",
          className: cn("items-start gap-2 hover:bg-[var(--color-muted)] transition-colors", event.type === "death" && "opacity-60"),
          children: [
            /* @__PURE__ */ jsx(Box, { className: cn("flex-shrink-0 mt-0.5", colorClass), children: /* @__PURE__ */ jsx(EventIcon, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxs(Box, { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "block", children: event.message }),
              event.value !== void 0 && /* @__PURE__ */ jsxs(Badge, { variant: eventBadgeVariants[event.type], size: "sm", className: "mt-1", children: [
                event.type === "heal" ? "+" : event.type === "attack" ? "-" : "",
                event.value
              ] })
            ] }),
            (event.turn || showTimestamps) && /* @__PURE__ */ jsx(Box, { className: "flex-shrink-0", children: /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "opacity-40", children: event.turn ? `T${event.turn}` : "" }) })
          ]
        },
        event.id
      );
    }) }) })
  ] });
}
CombatLog.displayName = "CombatLog";

// components/organisms/game/types/game.ts
function createInitialGameState(width, height, units, defaultTerrain = "floorStone") {
  const board = Array.from(
    { length: height },
    () => Array.from({ length: width }, () => ({
      terrain: defaultTerrain
    }))
  );
  const unitsMap = {};
  for (const unit of units) {
    unitsMap[unit.id] = unit;
    if (unit.position.y < height && unit.position.x < width) {
      board[unit.position.y][unit.position.x].unitId = unit.id;
    }
  }
  return {
    board,
    units: unitsMap,
    currentPhase: "observation",
    currentTurn: 1,
    activeTeam: "player",
    validMoves: [],
    attackTargets: []
  };
}
function calculateValidMoves(state, unitId) {
  const unit = state.units[unitId];
  if (!unit) return [];
  const moves = [];
  const { x, y } = unit.position;
  const range = unit.movement;
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      const distance = Math.abs(dx) + Math.abs(dy);
      if (distance > 0 && distance <= range && ny >= 0 && ny < state.board.length && nx >= 0 && nx < state.board[0].length && !state.board[ny][nx].unitId && !state.board[ny][nx].isBlocked) {
        moves.push({ x: nx, y: ny });
      }
    }
  }
  return moves;
}
function calculateAttackTargets(state, unitId) {
  const unit = state.units[unitId];
  if (!unit) return [];
  const targets = [];
  const { x, y } = unit.position;
  const directions = [
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 }
  ];
  for (const { dx, dy } of directions) {
    const nx = x + dx;
    const ny = y + dy;
    if (ny >= 0 && ny < state.board.length && nx >= 0 && nx < state.board[0].length) {
      const targetTile = state.board[ny][nx];
      if (targetTile.unitId) {
        const targetUnit = state.units[targetTile.unitId];
        if (targetUnit && targetUnit.team !== unit.team) {
          targets.push({ x: nx, y: ny });
        }
      }
    }
  }
  return targets;
}

// components/organisms/game/utils/combatEffects.ts
var combatAnimations = {
  shake: `
    @keyframes combat-shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
  `,
  flash: `
    @keyframes combat-flash {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; filter: brightness(2); }
    }
  `,
  pulseRed: `
    @keyframes combat-pulse-red {
      0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
      50% { box-shadow: 0 0 20px 5px rgba(239, 68, 68, 0.6); }
    }
  `,
  healGlow: `
    @keyframes combat-heal-glow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
      50% { box-shadow: 0 0 30px 10px rgba(34, 197, 94, 0.5); }
    }
  `
};
var combatClasses = {
  shake: "animate-[combat-shake_0.3s_ease-in-out]",
  flash: "animate-[combat-flash_0.2s_ease-in-out_2]",
  pulseRed: "animate-[combat-pulse-red_0.5s_ease-in-out]",
  healGlow: "animate-[combat-heal-glow_0.8s_ease-in-out]",
  hit: "animate-pulse brightness-150",
  defend: "animate-bounce",
  critical: "animate-ping"
};
var combatEffects = {
  attack: { className: "animate-pulse brightness-125", duration: 300 },
  hit: { className: "animate-[shake_0.3s_ease-in-out] brightness-150", duration: 300 },
  critical: { className: "animate-ping scale-110", duration: 500 },
  defend: { className: "animate-bounce ring-4 ring-blue-400", duration: 400 },
  heal: { className: "brightness-125 ring-4 ring-green-400", duration: 600 },
  defeat: { className: "grayscale opacity-50 scale-75", duration: 800 },
  levelUp: { className: "animate-bounce ring-4 ring-yellow-400 brightness-150", duration: 1e3 }
};
function applyTemporaryEffect(element, effect, onComplete) {
  const originalClass = element.className;
  element.className = `${originalClass} ${effect.className}`;
  setTimeout(() => {
    element.className = originalClass;
    onComplete?.();
  }, effect.duration);
}
function calculateDamage(attack, defense, isDefending = false, criticalChance = 0.1) {
  const isCritical = Math.random() < criticalChance;
  const baseDamage = attack;
  const defenseMultiplier = isDefending ? 2 : 1;
  const effectiveDefense = defense * defenseMultiplier;
  let finalDamage = Math.max(1, baseDamage - effectiveDefense);
  if (isCritical) finalDamage = Math.floor(finalDamage * 2);
  const isBlocked = finalDamage <= 1 && effectiveDefense > baseDamage;
  const damageReduction = baseDamage - finalDamage;
  return { baseDamage, finalDamage, isCritical, isBlocked, damageReduction };
}
function generateCombatMessage(event) {
  return event.message;
}
function extractTitle(children) {
  if (!React42__default.isValidElement(children)) return void 0;
  const props = children.props;
  if (typeof props.title === "string") {
    return props.title;
  }
  return void 0;
}
var ModalSlot = ({
  children,
  title: overrideTitle,
  size = "md",
  className
}) => {
  const eventBus = useEventBus();
  const isOpen = Boolean(children);
  const title = overrideTitle || extractTitle(children);
  const handleClose = () => {
    eventBus.emit("UI:CLOSE");
    eventBus.emit("UI:CANCEL");
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx(
    Modal,
    {
      isOpen,
      onClose: handleClose,
      title,
      size,
      className,
      children
    }
  );
};
ModalSlot.displayName = "ModalSlot";
function extractTitle2(children) {
  if (!React42__default.isValidElement(children)) return void 0;
  const props = children.props;
  if (typeof props.title === "string") {
    return props.title;
  }
  return void 0;
}
var DrawerSlot = ({
  children,
  title: overrideTitle,
  position = "right",
  size = "md",
  className
}) => {
  const eventBus = useEventBus();
  const isOpen = Boolean(children);
  const title = overrideTitle || extractTitle2(children);
  const handleClose = () => {
    eventBus.emit("UI:CLOSE");
    eventBus.emit("UI:CANCEL");
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx(
    Drawer,
    {
      isOpen,
      onClose: handleClose,
      title,
      position,
      width: size,
      className,
      children
    }
  );
};
DrawerSlot.displayName = "DrawerSlot";
function extractToastProps(children) {
  if (!React42__default.isValidElement(children)) {
    if (typeof children === "string") {
      return { message: children };
    }
    return {};
  }
  const props = children.props;
  return {
    message: typeof props.message === "string" ? props.message : void 0,
    variant: props.variant,
    title: typeof props.title === "string" ? props.title : void 0
  };
}
var ToastSlot = ({
  children,
  variant: overrideVariant,
  title: overrideTitle,
  duration = 5e3,
  className
}) => {
  const eventBus = useEventBus();
  const isVisible = Boolean(children);
  const extracted = extractToastProps(children);
  const variant = overrideVariant || extracted.variant || "info";
  const title = overrideTitle || extracted.title;
  const message = extracted.message || (typeof children === "string" ? children : "");
  const handleDismiss = () => {
    eventBus.emit("UI:DISMISS");
    eventBus.emit("UI:CLOSE");
  };
  if (!isVisible) return null;
  const isCustomContent = React42__default.isValidElement(children) && !message;
  return /* @__PURE__ */ jsx(Box, { className: "fixed bottom-4 right-4 z-50", children: isCustomContent ? children : /* @__PURE__ */ jsx(
    Toast,
    {
      variant,
      title,
      message: message || "Notification",
      duration,
      onDismiss: handleDismiss,
      className
    }
  ) });
};
ToastSlot.displayName = "ToastSlot";
var CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-error)",
  "var(--color-info)",
  "var(--color-accent)"
];
var BarChart = ({ data, height, showValues }) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  return /* @__PURE__ */ jsx(HStack, { gap: "xs", align: "end", className: "w-full", style: { height }, children: data.map((point, idx) => {
    const barHeight = point.value / maxValue * 100;
    const color = point.color || CHART_COLORS[idx % CHART_COLORS.length];
    return /* @__PURE__ */ jsxs(VStack, { gap: "xs", align: "center", flex: true, className: "min-w-0", children: [
      showValues && /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "secondary", className: "tabular-nums", children: point.value }),
      /* @__PURE__ */ jsx(
        Box,
        {
          className: cn(
            "w-full rounded-t-[var(--radius-sm)] transition-all duration-500 ease-out min-h-[4px]"
          ),
          style: {
            height: `${barHeight}%`,
            backgroundColor: color
          }
        }
      ),
      /* @__PURE__ */ jsx(
        Typography,
        {
          variant: "caption",
          color: "secondary",
          className: "truncate w-full text-center",
          children: point.label
        }
      )
    ] }, point.label);
  }) });
};
var PieChart = ({ data, height, showValues, donut = false }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const size = Math.min(height, 200);
  const radius = size / 2 - 8;
  const innerRadius = donut ? radius * 0.6 : 0;
  const center = size / 2;
  const segments = useMemo(() => {
    let currentAngle = -Math.PI / 2;
    return data.map((point, idx) => {
      const angle = point.value / total * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;
      const largeArc = angle > Math.PI ? 1 : 0;
      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);
      let d;
      if (innerRadius > 0) {
        const ix1 = center + innerRadius * Math.cos(startAngle);
        const iy1 = center + innerRadius * Math.sin(startAngle);
        const ix2 = center + innerRadius * Math.cos(endAngle);
        const iy2 = center + innerRadius * Math.sin(endAngle);
        d = `M ${ix1} ${iy1} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
      } else {
        d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      }
      return {
        d,
        color: point.color || CHART_COLORS[idx % CHART_COLORS.length],
        label: point.label,
        value: point.value,
        percentage: (point.value / total * 100).toFixed(1)
      };
    });
  }, [data, total, radius, innerRadius, center]);
  return /* @__PURE__ */ jsxs(HStack, { gap: "md", align: "center", justify: "center", className: "w-full", children: [
    /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, children: [
      segments.map((seg, idx) => /* @__PURE__ */ jsx(
        "path",
        {
          d: seg.d,
          fill: seg.color,
          stroke: "var(--color-card)",
          strokeWidth: "2",
          className: "transition-opacity duration-200 hover:opacity-80"
        },
        idx
      )),
      donut && /* @__PURE__ */ jsx(
        "text",
        {
          x: center,
          y: center,
          textAnchor: "middle",
          dominantBaseline: "middle",
          fill: "var(--color-foreground)",
          fontSize: "14",
          fontWeight: "bold",
          children: total
        }
      )
    ] }),
    showValues && /* @__PURE__ */ jsx(VStack, { gap: "xs", children: segments.map((seg, idx) => /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
      /* @__PURE__ */ jsx(
        Box,
        {
          className: "w-3 h-3 rounded-[var(--radius-sm)] flex-shrink-0",
          style: { backgroundColor: seg.color }
        }
      ),
      /* @__PURE__ */ jsxs(Typography, { variant: "caption", color: "secondary", className: "truncate", children: [
        seg.label,
        ": ",
        seg.percentage,
        "%"
      ] })
    ] }, idx)) })
  ] });
};
var LineChart = ({ data, height, showValues, fill = false }) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const width = 400;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const points = useMemo(() => {
    return data.map((point, idx) => ({
      x: padding.left + idx / Math.max(data.length - 1, 1) * chartWidth,
      y: padding.top + chartHeight - point.value / maxValue * chartHeight,
      ...point
    }));
  }, [data, maxValue, chartWidth, chartHeight, padding]);
  const linePath = points.map((p2, i) => `${i === 0 ? "M" : "L"} ${p2.x} ${p2.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;
  return /* @__PURE__ */ jsxs("svg", { width: "100%", height, viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: "xMidYMid meet", children: [
    [0, 0.25, 0.5, 0.75, 1].map((frac) => {
      const y = padding.top + chartHeight * (1 - frac);
      return /* @__PURE__ */ jsx(
        "line",
        {
          x1: padding.left,
          y1: y,
          x2: width - padding.right,
          y2: y,
          stroke: "var(--color-border)",
          strokeDasharray: "4 4",
          opacity: 0.5
        },
        frac
      );
    }),
    fill && /* @__PURE__ */ jsx("path", { d: areaPath, fill: "var(--color-primary)", opacity: 0.1 }),
    /* @__PURE__ */ jsx("path", { d: linePath, fill: "none", stroke: "var(--color-primary)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
    points.map((p2, idx) => /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx("circle", { cx: p2.x, cy: p2.y, r: "4", fill: "var(--color-card)", stroke: "var(--color-primary)", strokeWidth: "2" }),
      showValues && /* @__PURE__ */ jsx("text", { x: p2.x, y: p2.y - 10, textAnchor: "middle", fill: "var(--color-foreground)", fontSize: "10", fontWeight: "500", children: p2.value }),
      /* @__PURE__ */ jsx(
        "text",
        {
          x: p2.x,
          y: height - 8,
          textAnchor: "middle",
          fill: "var(--color-muted-foreground)",
          fontSize: "9",
          children: p2.label
        }
      )
    ] }, idx))
  ] });
};
var Chart = ({
  title,
  subtitle,
  chartType = "bar",
  series,
  data: simpleData,
  height = 200,
  showLegend = true,
  showValues = false,
  actions,
  entity,
  isLoading = false,
  error,
  className
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const handleAction = useCallback(
    (action) => {
      if (action.event) {
        eventBus.emit(`UI:${action.event}`, { entity });
      }
    },
    [eventBus, entity]
  );
  const normalizedData = useMemo(() => {
    if (simpleData) return simpleData;
    if (series && series.length > 0) return series[0].data;
    return [];
  }, [simpleData, series]);
  if (isLoading) {
    return /* @__PURE__ */ jsx(LoadingState, { message: "Loading chart...", className });
  }
  if (error) {
    return /* @__PURE__ */ jsx(
      ErrorState,
      {
        title: "Chart error",
        message: error.message,
        className
      }
    );
  }
  if (normalizedData.length === 0) {
    return /* @__PURE__ */ jsx(EmptyState, { title: t("empty.noData"), description: t("empty.noData"), className });
  }
  return /* @__PURE__ */ jsx(Card, { className: cn("p-6", className), children: /* @__PURE__ */ jsxs(VStack, { gap: "md", children: [
    (title || subtitle || actions && actions.length > 0) && /* @__PURE__ */ jsxs(HStack, { justify: "between", align: "start", children: [
      /* @__PURE__ */ jsxs(VStack, { gap: "xs", children: [
        title && /* @__PURE__ */ jsx(Typography, { variant: "h5", weight: "semibold", children: title }),
        subtitle && /* @__PURE__ */ jsx(Typography, { variant: "small", color: "secondary", children: subtitle })
      ] }),
      actions && actions.length > 0 && /* @__PURE__ */ jsx(HStack, { gap: "xs", children: actions.map((action, idx) => /* @__PURE__ */ jsx(
        Badge,
        {
          variant: "default",
          className: "cursor-pointer hover:opacity-80 transition-opacity",
          onClick: () => handleAction(action),
          children: action.label
        },
        idx
      )) })
    ] }),
    /* @__PURE__ */ jsxs(Box, { className: "w-full", children: [
      chartType === "bar" && /* @__PURE__ */ jsx(BarChart, { data: normalizedData, height, showValues }),
      chartType === "line" && /* @__PURE__ */ jsx(LineChart, { data: normalizedData, height, showValues }),
      chartType === "area" && /* @__PURE__ */ jsx(LineChart, { data: normalizedData, height, showValues, fill: true }),
      chartType === "pie" && /* @__PURE__ */ jsx(PieChart, { data: normalizedData, height, showValues: showLegend }),
      chartType === "donut" && /* @__PURE__ */ jsx(PieChart, { data: normalizedData, height, showValues: showLegend, donut: true })
    ] }),
    showLegend && series && series.length > 1 && /* @__PURE__ */ jsx(HStack, { gap: "md", justify: "center", wrap: true, children: series.map((s, idx) => /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
      /* @__PURE__ */ jsx(
        Box,
        {
          className: "w-3 h-3 rounded-[var(--radius-full)] flex-shrink-0",
          style: { backgroundColor: s.color || CHART_COLORS[idx % CHART_COLORS.length] }
        }
      ),
      /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "secondary", children: s.name })
    ] }, idx)) })
  ] }) });
};
Chart.displayName = "Chart";
var DEFAULT_THRESHOLDS = [
  { value: 30, color: "var(--color-error)" },
  { value: 70, color: "var(--color-warning)" },
  { value: 100, color: "var(--color-success)" }
];
function getColorForValue(value, max, thresholds) {
  const percentage = value / max * 100;
  for (const threshold of thresholds) {
    if (percentage <= threshold.value) {
      return threshold.color;
    }
  }
  return thresholds[thresholds.length - 1]?.color ?? "var(--color-primary)";
}
var radialSizes = {
  sm: { size: 80, stroke: 6, fontSize: "12px" },
  md: { size: 120, stroke: 8, fontSize: "16px" },
  lg: { size: 160, stroke: 10, fontSize: "20px" }
};
var Meter = ({
  value,
  min = 0,
  max = 100,
  label,
  unit,
  variant = "linear",
  thresholds = DEFAULT_THRESHOLDS,
  segments = 5,
  showValue = true,
  size = "md",
  actions,
  entity,
  isLoading = false,
  error,
  className
}) => {
  const eventBus = useEventBus();
  const handleAction = useCallback(
    (action) => {
      if (action.event) {
        eventBus.emit(`UI:${action.event}`, { entity, value });
      }
    },
    [eventBus, entity, value]
  );
  const percentage = useMemo(() => {
    const range = max - min;
    if (range <= 0) return 0;
    return Math.min(Math.max((value - min) / range * 100, 0), 100);
  }, [value, min, max]);
  const activeColor = useMemo(
    () => getColorForValue(value, max, thresholds),
    [value, max, thresholds]
  );
  const displayValue = useMemo(() => {
    const formatted = Number.isInteger(value) ? value : value.toFixed(1);
    return unit ? `${formatted}${unit}` : `${formatted}`;
  }, [value, unit]);
  if (isLoading) {
    return /* @__PURE__ */ jsx(LoadingState, { message: "Loading meter...", className });
  }
  if (error) {
    return /* @__PURE__ */ jsx(
      ErrorState,
      {
        title: "Meter error",
        message: error.message,
        className
      }
    );
  }
  if (variant === "radial") {
    const dims = radialSizes[size];
    const radius = (dims.size - dims.stroke * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - percentage / 100 * circumference;
    const center = dims.size / 2;
    return /* @__PURE__ */ jsx(Card, { className: cn("p-4", className), children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", align: "center", children: [
      label && /* @__PURE__ */ jsx(Typography, { variant: "small", color: "secondary", weight: "medium", children: label }),
      /* @__PURE__ */ jsxs(Box, { className: "relative inline-flex items-center justify-center", children: [
        /* @__PURE__ */ jsxs(
          "svg",
          {
            width: dims.size,
            height: dims.size,
            viewBox: `0 0 ${dims.size} ${dims.size}`,
            className: "transform -rotate-90",
            children: [
              /* @__PURE__ */ jsx(
                "circle",
                {
                  cx: center,
                  cy: center,
                  r: radius,
                  fill: "none",
                  stroke: "var(--color-muted)",
                  strokeWidth: dims.stroke
                }
              ),
              /* @__PURE__ */ jsx(
                "circle",
                {
                  cx: center,
                  cy: center,
                  r: radius,
                  fill: "none",
                  stroke: activeColor,
                  strokeWidth: dims.stroke,
                  strokeDasharray: circumference,
                  strokeDashoffset: offset,
                  strokeLinecap: "round",
                  className: "transition-all duration-500 ease-out"
                }
              )
            ]
          }
        ),
        showValue && /* @__PURE__ */ jsx(Box, { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx(
          Typography,
          {
            variant: "h5",
            weight: "bold",
            className: "tabular-nums",
            style: { fontSize: dims.fontSize },
            children: displayValue
          }
        ) })
      ] }),
      actions && actions.length > 0 && /* @__PURE__ */ jsx(HStack, { gap: "xs", children: actions.map((action, idx) => /* @__PURE__ */ jsx(
        Badge,
        {
          variant: "default",
          className: "cursor-pointer hover:opacity-80 transition-opacity",
          onClick: () => handleAction(action),
          children: action.label
        },
        idx
      )) })
    ] }) });
  }
  if (variant === "segmented") {
    const activeSegments = Math.round(percentage / 100 * segments);
    return /* @__PURE__ */ jsx(Card, { className: cn("p-4", className), children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
      (label || showValue) && /* @__PURE__ */ jsxs(HStack, { justify: "between", align: "center", children: [
        label && /* @__PURE__ */ jsx(Typography, { variant: "small", color: "secondary", weight: "medium", children: label }),
        showValue && /* @__PURE__ */ jsx(Typography, { variant: "small", weight: "bold", className: "tabular-nums", children: displayValue })
      ] }),
      /* @__PURE__ */ jsx(HStack, { gap: "xs", className: "w-full", children: Array.from({ length: segments }).map((_, idx) => {
        const isActive = idx < activeSegments;
        const segColor = isActive ? getColorForValue((idx + 1) / segments * max, max, thresholds) : void 0;
        return /* @__PURE__ */ jsx(
          Box,
          {
            className: cn(
              "h-2 flex-1 rounded-[var(--radius-sm)] transition-all duration-300",
              !isActive && "bg-[var(--color-muted)]"
            ),
            style: isActive ? { backgroundColor: segColor } : void 0
          },
          idx
        );
      }) }),
      thresholds.some((t) => t.label) && /* @__PURE__ */ jsx(HStack, { justify: "between", className: "w-full", children: thresholds.map((t, idx) => /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "secondary", children: t.label || "" }, idx)) })
    ] }) });
  }
  return /* @__PURE__ */ jsx(Card, { className: cn("p-4", className), children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
    (label || showValue) && /* @__PURE__ */ jsxs(HStack, { justify: "between", align: "center", children: [
      label && /* @__PURE__ */ jsx(Typography, { variant: "small", color: "secondary", weight: "medium", children: label }),
      showValue && /* @__PURE__ */ jsx(Typography, { variant: "small", weight: "bold", className: "tabular-nums", children: displayValue })
    ] }),
    /* @__PURE__ */ jsx(Box, { className: "w-full h-3 bg-[var(--color-muted)] rounded-[var(--radius-full)] overflow-hidden", children: /* @__PURE__ */ jsx(
      Box,
      {
        className: "h-full rounded-[var(--radius-full)] transition-all duration-500 ease-out",
        style: {
          width: `${percentage}%`,
          backgroundColor: activeColor
        }
      }
    ) }),
    /* @__PURE__ */ jsxs(HStack, { justify: "between", className: "w-full", children: [
      /* @__PURE__ */ jsxs(Typography, { variant: "caption", color: "secondary", children: [
        min,
        unit ? ` ${unit}` : ""
      ] }),
      /* @__PURE__ */ jsxs(Typography, { variant: "caption", color: "secondary", children: [
        max,
        unit ? ` ${unit}` : ""
      ] })
    ] }),
    actions && actions.length > 0 && /* @__PURE__ */ jsx(HStack, { gap: "xs", children: actions.map((action, idx) => /* @__PURE__ */ jsx(
      Badge,
      {
        variant: "default",
        className: "cursor-pointer hover:opacity-80 transition-opacity",
        onClick: () => handleAction(action),
        children: action.label
      },
      idx
    )) })
  ] }) });
};
Meter.displayName = "Meter";
var STATUS_STYLES3 = {
  complete: {
    dotColor: "text-[var(--color-success)]",
    lineColor: "bg-[var(--color-success)]",
    icon: CheckCircle2
  },
  active: {
    dotColor: "text-[var(--color-primary)]",
    lineColor: "bg-[var(--color-primary)]",
    icon: Clock
  },
  pending: {
    dotColor: "text-[var(--color-muted-foreground)]",
    lineColor: "bg-[var(--color-border)]",
    icon: Circle
  },
  error: {
    dotColor: "text-[var(--color-error)]",
    lineColor: "bg-[var(--color-error)]",
    icon: AlertCircle
  }
};
var Timeline = ({
  title,
  items: propItems,
  data,
  fields,
  itemActions,
  entity,
  isLoading = false,
  error,
  className
}) => {
  const eventBus = useEventBus();
  const handleAction = useCallback(
    (action, item) => {
      if (action.event) {
        eventBus.emit(`UI:${action.event}`, { entity, row: item });
      }
    },
    [eventBus, entity]
  );
  const items = React42__default.useMemo(() => {
    if (propItems) return propItems;
    if (!data) return [];
    return data.map((record, idx) => {
      const titleField = fields?.[0] || "title";
      const descField = fields?.[1] || "description";
      const dateField = fields?.find(
        (f) => f.toLowerCase().includes("date")
      ) || "date";
      const statusField = fields?.find(
        (f) => f.toLowerCase().includes("status")
      ) || "status";
      return {
        id: String(record.id ?? idx),
        title: String(record[titleField] ?? ""),
        description: record[descField] ? String(record[descField]) : void 0,
        date: record[dateField] ? String(record[dateField]) : void 0,
        status: record[statusField] || "pending"
      };
    });
  }, [propItems, data, fields]);
  if (isLoading) {
    return /* @__PURE__ */ jsx(LoadingState, { message: "Loading timeline...", className });
  }
  if (error) {
    return /* @__PURE__ */ jsx(
      ErrorState,
      {
        title: "Timeline error",
        message: error.message,
        className
      }
    );
  }
  if (items.length === 0) {
    return /* @__PURE__ */ jsx(
      EmptyState,
      {
        title: "No events",
        description: "No timeline events to display.",
        className
      }
    );
  }
  return /* @__PURE__ */ jsx(Card, { className: cn("p-6", className), children: /* @__PURE__ */ jsxs(VStack, { gap: "md", children: [
    title && /* @__PURE__ */ jsx(Typography, { variant: "h5", weight: "semibold", children: title }),
    /* @__PURE__ */ jsx(VStack, { gap: "none", className: "relative", children: items.map((item, idx) => {
      const status = item.status || "pending";
      const style = STATUS_STYLES3[status];
      const ItemIcon = item.icon || style.icon;
      const isLast = idx === items.length - 1;
      return /* @__PURE__ */ jsxs(HStack, { gap: "md", align: "start", className: "relative", children: [
        /* @__PURE__ */ jsxs(VStack, { align: "center", className: "flex-shrink-0 relative", style: { width: "24px" }, children: [
          /* @__PURE__ */ jsx(
            Icon,
            {
              icon: ItemIcon,
              size: "sm",
              className: cn(style.dotColor, "z-10 bg-[var(--color-card)]")
            }
          ),
          !isLast && /* @__PURE__ */ jsx(
            Box,
            {
              className: cn(
                "w-0.5 flex-1 min-h-[24px]",
                style.lineColor,
                "opacity-40"
              )
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(VStack, { gap: "xs", className: cn("flex-1 min-w-0", !isLast && "pb-6"), children: [
          /* @__PURE__ */ jsxs(HStack, { justify: "between", align: "start", wrap: true, children: [
            /* @__PURE__ */ jsx(Typography, { variant: "body", weight: "semibold", children: item.title }),
            item.date && /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "secondary", className: "flex-shrink-0", children: item.date })
          ] }),
          item.description && /* @__PURE__ */ jsx(Typography, { variant: "small", color: "secondary", children: item.description }),
          item.tags && item.tags.length > 0 && /* @__PURE__ */ jsx(HStack, { gap: "xs", wrap: true, children: item.tags.map((tag, tagIdx) => /* @__PURE__ */ jsx(Badge, { variant: "default", children: tag }, tagIdx)) }),
          itemActions && itemActions.length > 0 && /* @__PURE__ */ jsx(HStack, { gap: "xs", className: "mt-1", children: itemActions.map((action, actionIdx) => /* @__PURE__ */ jsx(
            Badge,
            {
              variant: "default",
              className: "cursor-pointer hover:opacity-80 transition-opacity",
              onClick: () => handleAction(action, item),
              children: action.label
            },
            actionIdx
          )) })
        ] })
      ] }, item.id);
    }) })
  ] }) });
};
Timeline.displayName = "Timeline";
var COLUMN_CLASSES = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6"
};
var ASPECT_CLASSES = {
  square: "aspect-square",
  landscape: "aspect-video",
  portrait: "aspect-[3/4]"
};
var MediaGallery = ({
  title,
  items: propItems,
  data,
  columns = 3,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  showUpload = false,
  actions,
  aspectRatio = "square",
  entity,
  isLoading = false,
  error,
  className
}) => {
  const eventBus = useEventBus();
  const [lightboxItem, setLightboxItem] = useState(null);
  const handleAction = useCallback(
    (action) => {
      if (action.event) {
        eventBus.emit(`UI:${action.event}`, { entity });
      }
    },
    [eventBus, entity]
  );
  const handleItemClick = useCallback(
    (item) => {
      if (selectable) {
        const isSelected = selectedItems.includes(item.id);
        const newSelection = isSelected ? selectedItems.filter((id) => id !== item.id) : [...selectedItems, item.id];
        onSelectionChange?.(newSelection);
      } else {
        setLightboxItem(item);
      }
      eventBus.emit("UI:MEDIA_SELECT", { entity, row: item });
    },
    [selectable, selectedItems, onSelectionChange, eventBus, entity]
  );
  const handleUpload = useCallback(() => {
    eventBus.emit("UI:MEDIA_UPLOAD", { entity });
  }, [eventBus, entity]);
  const items = React42__default.useMemo(() => {
    if (propItems) return propItems;
    if (!data) return [];
    return data.map((record, idx) => ({
      id: String(record.id ?? idx),
      src: String(record.src ?? record.url ?? record.image ?? ""),
      alt: record.alt ? String(record.alt) : void 0,
      thumbnail: record.thumbnail ? String(record.thumbnail) : void 0,
      caption: record.caption ? String(record.caption) : record.title ? String(record.title) : void 0
    }));
  }, [propItems, data]);
  if (isLoading) {
    return /* @__PURE__ */ jsx(LoadingState, { message: "Loading media...", className });
  }
  if (error) {
    return /* @__PURE__ */ jsx(
      ErrorState,
      {
        title: "Gallery error",
        message: error.message,
        className
      }
    );
  }
  if (items.length === 0 && !showUpload) {
    return /* @__PURE__ */ jsx(
      EmptyState,
      {
        icon: Image$1,
        title: "No media",
        description: "No media items to display.",
        className
      }
    );
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Card, { className: cn("p-6", className), children: /* @__PURE__ */ jsxs(VStack, { gap: "md", children: [
      (title || showUpload || actions && actions.length > 0) && /* @__PURE__ */ jsxs(HStack, { justify: "between", align: "center", children: [
        title && /* @__PURE__ */ jsx(Typography, { variant: "h5", weight: "semibold", children: title }),
        /* @__PURE__ */ jsxs(HStack, { gap: "sm", children: [
          showUpload && /* @__PURE__ */ jsx(
            Button,
            {
              variant: "secondary",
              size: "sm",
              icon: Upload,
              onClick: handleUpload,
              children: "Upload"
            }
          ),
          actions?.map((action, idx) => /* @__PURE__ */ jsx(
            Badge,
            {
              variant: "default",
              className: "cursor-pointer hover:opacity-80 transition-opacity",
              onClick: () => handleAction(action),
              children: action.label
            },
            idx
          ))
        ] })
      ] }),
      selectable && selectedItems.length > 0 && /* @__PURE__ */ jsx(HStack, { gap: "sm", align: "center", children: /* @__PURE__ */ jsxs(Badge, { variant: "info", children: [
        selectedItems.length,
        " selected"
      ] }) }),
      /* @__PURE__ */ jsx(
        Box,
        {
          className: cn(
            "grid gap-3",
            COLUMN_CLASSES[columns]
          ),
          children: items.map((item) => {
            const isSelected = selectedItems.includes(item.id);
            return /* @__PURE__ */ jsxs(
              Box,
              {
                className: cn(
                  "group relative overflow-hidden rounded-[var(--radius-md)] cursor-pointer",
                  "border-2 transition-all duration-200",
                  isSelected ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30" : "border-transparent hover:border-[var(--color-border)]",
                  ASPECT_CLASSES[aspectRatio]
                ),
                onClick: () => handleItemClick(item),
                children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: item.thumbnail || item.src,
                      alt: item.alt || item.caption || "",
                      className: "w-full h-full object-cover",
                      loading: "lazy"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Box,
                    {
                      className: cn(
                        "absolute inset-0 bg-[var(--color-foreground)]/0 group-hover:bg-[var(--color-foreground)]/20",
                        "transition-colors duration-200 flex items-center justify-center"
                      ),
                      children: /* @__PURE__ */ jsx(
                        Icon,
                        {
                          icon: ZoomIn,
                          size: "md",
                          className: "text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        }
                      )
                    }
                  ),
                  item.caption && /* @__PURE__ */ jsx(Box, { className: "absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent", children: /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-white truncate", children: item.caption }) }),
                  selectable && isSelected && /* @__PURE__ */ jsx(Box, { className: "absolute top-2 right-2 w-5 h-5 rounded-[var(--radius-full)] bg-[var(--color-primary)] flex items-center justify-center", children: /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-white text-[10px]", children: "\u2713" }) })
                ]
              },
              item.id
            );
          })
        }
      )
    ] }) }),
    lightboxItem && /* @__PURE__ */ jsx(
      Box,
      {
        className: "fixed inset-0 z-50 bg-[var(--color-background)]/80 backdrop-blur-sm flex items-center justify-center",
        onClick: () => setLightboxItem(null),
        children: /* @__PURE__ */ jsxs(
          VStack,
          {
            align: "center",
            justify: "center",
            className: "w-full h-full p-8",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsx(HStack, { justify: "end", className: "w-full max-w-4xl mb-2", children: /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  icon: X,
                  onClick: () => setLightboxItem(null),
                  className: "text-white hover:bg-white/20"
                }
              ) }),
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: lightboxItem.src,
                  alt: lightboxItem.alt || lightboxItem.caption || "",
                  className: "max-w-full max-h-[80vh] object-contain rounded-[var(--radius-md)]"
                }
              ),
              lightboxItem.caption && /* @__PURE__ */ jsx(Typography, { variant: "body", className: "text-white mt-3 text-center", children: lightboxItem.caption })
            ]
          }
        )
      }
    )
  ] });
};
MediaGallery.displayName = "MediaGallery";
var SignaturePad = ({
  label = "Signature",
  helperText = "Draw your signature above",
  strokeColor,
  strokeWidth = 2,
  height = 200,
  readOnly = false,
  value,
  onChange,
  signEvent,
  clearEvent,
  entity,
  isLoading = false,
  error,
  className
}) => {
  const eventBus = useEventBus();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!value);
  useEffect(() => {
    if (value && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = value;
    }
  }, [value]);
  const getCoords = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      if ("touches" in e) {
        const touch = e.touches[0];
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        };
      }
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    },
    []
  );
  const startDrawing = useCallback(
    (e) => {
      if (readOnly) return;
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      const { x, y } = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    },
    [readOnly, getCoords]
  );
  const draw = useCallback(
    (e) => {
      if (!isDrawing || readOnly) return;
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      const { x, y } = getCoords(e);
      const resolvedColor = strokeColor || "var(--color-foreground)";
      ctx.strokeStyle = resolvedColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(x, y);
      ctx.stroke();
    },
    [isDrawing, readOnly, strokeColor, strokeWidth, getCoords]
  );
  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setHasSignature(true);
      const dataUrl = canvasRef.current?.toDataURL("image/png") ?? null;
      onChange?.(dataUrl);
    }
  }, [isDrawing, onChange]);
  const clearSignature = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setHasSignature(false);
    onChange?.(null);
    if (clearEvent) {
      eventBus.emit(`UI:${clearEvent}`, { entity });
    }
  }, [onChange, clearEvent, eventBus, entity]);
  const confirmSignature = useCallback(() => {
    const dataUrl = canvasRef.current?.toDataURL("image/png") ?? null;
    if (signEvent) {
      eventBus.emit(`UI:${signEvent}`, { entity, signature: dataUrl });
    }
  }, [signEvent, eventBus, entity]);
  if (isLoading) {
    return /* @__PURE__ */ jsx(LoadingState, { message: "Loading signature pad...", className });
  }
  if (error) {
    return /* @__PURE__ */ jsx(
      ErrorState,
      {
        title: "Signature pad error",
        message: error.message,
        className
      }
    );
  }
  return /* @__PURE__ */ jsx(Card, { className: cn("p-4", className), children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
    label && /* @__PURE__ */ jsx(Typography, { variant: "label", weight: "medium", children: label }),
    /* @__PURE__ */ jsx(
      Box,
      {
        className: cn(
          "w-full rounded-[var(--radius-md)] border border-[var(--color-border)]",
          "bg-[var(--color-background)]",
          readOnly && "opacity-60 cursor-not-allowed",
          !readOnly && "cursor-crosshair"
        ),
        children: /* @__PURE__ */ jsx(
          "canvas",
          {
            ref: canvasRef,
            width: 600,
            height,
            className: "w-full touch-none",
            style: { height },
            onMouseDown: startDrawing,
            onMouseMove: draw,
            onMouseUp: stopDrawing,
            onMouseLeave: stopDrawing,
            onTouchStart: startDrawing,
            onTouchMove: draw,
            onTouchEnd: stopDrawing
          }
        )
      }
    ),
    helperText && /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "secondary", children: helperText }),
    !readOnly && /* @__PURE__ */ jsxs(HStack, { gap: "sm", justify: "end", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "sm",
          icon: Eraser,
          onClick: clearSignature,
          disabled: !hasSignature,
          children: "Clear"
        }
      ),
      signEvent && /* @__PURE__ */ jsx(
        Button,
        {
          variant: "primary",
          size: "sm",
          icon: Check,
          onClick: confirmSignature,
          disabled: !hasSignature,
          children: "Confirm"
        }
      )
    ] })
  ] }) });
};
SignaturePad.displayName = "SignaturePad";
var DocumentViewer = ({
  title,
  src,
  content,
  documentType = "pdf",
  currentPage: propPage,
  totalPages,
  height = 600,
  showToolbar = true,
  showDownload = false,
  showPrint = false,
  actions,
  documents,
  entity,
  isLoading = false,
  error,
  className
}) => {
  const eventBus = useEventBus();
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(propPage ?? 1);
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const handleAction = useCallback(
    (action) => {
      if (action.event) {
        eventBus.emit(`UI:${action.event}`, { entity, page: currentPage });
      }
    },
    [eventBus, entity, currentPage]
  );
  const handleDownload = useCallback(() => {
    const downloadSrc = documents?.[activeDocIndex]?.src ?? src;
    if (downloadSrc) {
      eventBus.emit("UI:DOCUMENT_DOWNLOAD", { entity, src: downloadSrc });
      window.open(downloadSrc, "_blank");
    }
  }, [documents, activeDocIndex, src, eventBus, entity]);
  const handlePrint = useCallback(() => {
    eventBus.emit("UI:DOCUMENT_PRINT", { entity });
    window.print();
  }, [eventBus, entity]);
  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z + 25, 200)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z - 25, 50)), []);
  const handlePagePrev = useCallback(() => {
    setCurrentPage((p2) => Math.max(p2 - 1, 1));
    eventBus.emit("UI:DOCUMENT_PAGE_CHANGE", { entity, page: currentPage - 1 });
  }, [eventBus, entity, currentPage]);
  const handlePageNext = useCallback(() => {
    if (totalPages) {
      setCurrentPage((p2) => Math.min(p2 + 1, totalPages));
      eventBus.emit("UI:DOCUMENT_PAGE_CHANGE", { entity, page: currentPage + 1 });
    }
  }, [totalPages, eventBus, entity, currentPage]);
  if (isLoading) {
    return /* @__PURE__ */ jsx(LoadingState, { message: "Loading document...", className });
  }
  if (error) {
    return /* @__PURE__ */ jsx(
      ErrorState,
      {
        title: "Document error",
        message: error.message,
        className
      }
    );
  }
  const activeDoc = documents?.[activeDocIndex];
  const activeSrc = activeDoc?.src ?? src;
  const activeContent = activeDoc?.content ?? content;
  const activeDocType = activeDoc?.documentType ?? documentType;
  if (!activeSrc && !activeContent) {
    return /* @__PURE__ */ jsx(
      EmptyState,
      {
        icon: FileText,
        title: "No document",
        description: "No document to display.",
        className
      }
    );
  }
  const tabItems = documents?.map((doc, idx) => ({
    id: `doc-${idx}`,
    label: doc.label,
    content: null
    // We handle content rendering separately
  }));
  const renderContent = () => {
    if (activeDocType === "pdf" && activeSrc) {
      return /* @__PURE__ */ jsx(
        "iframe",
        {
          src: activeSrc,
          title: title || "Document",
          className: "w-full border-0",
          style: {
            height: typeof height === "number" ? height : height,
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top left",
            width: `${1e4 / zoom}%`
          }
        }
      );
    }
    if (activeDocType === "html" && activeContent) {
      return /* @__PURE__ */ jsx(
        Box,
        {
          className: "w-full overflow-auto p-4",
          style: { height, fontSize: `${zoom}%` },
          dangerouslySetInnerHTML: { __html: activeContent }
        }
      );
    }
    return /* @__PURE__ */ jsx(
      Box,
      {
        className: "w-full overflow-auto p-4 font-mono text-sm",
        style: { height, fontSize: `${zoom}%` },
        children: /* @__PURE__ */ jsx(Typography, { variant: "body", className: "whitespace-pre-wrap break-words", children: activeContent })
      }
    );
  };
  return /* @__PURE__ */ jsx(Card, { className: cn("overflow-hidden", className), children: /* @__PURE__ */ jsxs(VStack, { gap: "none", children: [
    tabItems && tabItems.length > 1 && /* @__PURE__ */ jsx(Box, { className: "border-b border-[var(--color-border)]", children: /* @__PURE__ */ jsx(
      Tabs,
      {
        tabs: tabItems,
        activeTab: `doc-${activeDocIndex}`,
        onTabChange: (id) => {
          const idx = parseInt(id.replace("doc-", ""), 10);
          setActiveDocIndex(idx);
        }
      }
    ) }),
    showToolbar && /* @__PURE__ */ jsxs(
      HStack,
      {
        gap: "sm",
        align: "center",
        justify: "between",
        className: "px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-muted)]/30",
        children: [
          /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", children: [
            /* @__PURE__ */ jsx(Icon, { icon: FileText, size: "sm", className: "text-[var(--color-muted-foreground)]" }),
            title && /* @__PURE__ */ jsx(Typography, { variant: "small", weight: "medium", className: "truncate max-w-[200px]", children: title })
          ] }),
          /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", icon: ZoomOut, onClick: handleZoomOut }),
            /* @__PURE__ */ jsxs(Typography, { variant: "caption", color: "secondary", className: "tabular-nums w-10 text-center", children: [
              zoom,
              "%"
            ] }),
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", icon: ZoomIn, onClick: handleZoomIn }),
            totalPages && totalPages > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Box, { className: "w-px h-4 bg-[var(--color-border)] mx-1" }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", icon: ChevronLeft, onClick: handlePagePrev, disabled: currentPage <= 1 }),
              /* @__PURE__ */ jsxs(Typography, { variant: "caption", color: "secondary", className: "tabular-nums", children: [
                currentPage,
                " / ",
                totalPages
              ] }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", icon: ChevronRight, onClick: handlePageNext, disabled: currentPage >= totalPages })
            ] }),
            /* @__PURE__ */ jsx(Box, { className: "w-px h-4 bg-[var(--color-border)] mx-1" }),
            showDownload && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", icon: Download, onClick: handleDownload }),
            showPrint && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", icon: Printer, onClick: handlePrint }),
            actions?.map((action, idx) => /* @__PURE__ */ jsx(
              Badge,
              {
                variant: "default",
                className: "cursor-pointer hover:opacity-80 transition-opacity",
                onClick: () => handleAction(action),
                children: action.label
              },
              idx
            ))
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(Box, { className: "w-full overflow-hidden bg-[var(--color-muted)]/20", children: renderContent() })
  ] }) });
};
DocumentViewer.displayName = "DocumentViewer";
var GROUP_COLORS = [
  "var(--color-primary)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-error)",
  "var(--color-info)",
  "var(--color-accent)"
];
function getGroupColor(group, groups) {
  if (!group) return GROUP_COLORS[0];
  const idx = groups.indexOf(group);
  return GROUP_COLORS[idx % GROUP_COLORS.length];
}
var GraphCanvas = ({
  title,
  nodes: propNodes = [],
  edges: propEdges = [],
  height = 400,
  showLabels = true,
  interactive = true,
  draggable = true,
  actions,
  onNodeClick,
  nodeClickEvent,
  layout = "force",
  entity,
  isLoading = false,
  error,
  className
}) => {
  const eventBus = useEventBus();
  const canvasRef = useRef(null);
  const animRef = useRef(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const nodesRef = useRef([]);
  const [, forceUpdate] = useState(0);
  const handleAction = useCallback(
    (action) => {
      if (action.event) {
        eventBus.emit(`UI:${action.event}`, { entity });
      }
    },
    [eventBus, entity]
  );
  const handleNodeClick = useCallback(
    (node) => {
      if (nodeClickEvent) {
        eventBus.emit(`UI:${nodeClickEvent}`, { entity, row: node });
      }
      onNodeClick?.(node);
    },
    [nodeClickEvent, eventBus, entity, onNodeClick]
  );
  const groups = useMemo(
    () => [...new Set(propNodes.map((n) => n.group).filter(Boolean))],
    [propNodes]
  );
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || propNodes.length === 0) return;
    const w = canvas.width;
    const h = canvas.height;
    const simNodes = propNodes.map((n, idx) => {
      let x = n.x ?? 0;
      let y = n.y ?? 0;
      if (!n.x || !n.y) {
        if (layout === "circular") {
          const angle = idx / propNodes.length * 2 * Math.PI;
          const radius = Math.min(w, h) * 0.35;
          x = w / 2 + radius * Math.cos(angle);
          y = h / 2 + radius * Math.sin(angle);
        } else if (layout === "grid") {
          const cols = Math.ceil(Math.sqrt(propNodes.length));
          const gapX = w / (cols + 1);
          const gapY = h / (Math.ceil(propNodes.length / cols) + 1);
          x = gapX * (idx % cols + 1);
          y = gapY * (Math.floor(idx / cols) + 1);
        } else {
          x = w * 0.2 + Math.random() * w * 0.6;
          y = h * 0.2 + Math.random() * h * 0.6;
        }
      }
      return { ...n, x, y, vx: 0, vy: 0, fx: 0, fy: 0 };
    });
    nodesRef.current = simNodes;
    if (layout === "force") {
      let iterations = 0;
      const maxIterations = 100;
      const tick = () => {
        const nodes = nodesRef.current;
        const centerX = w / 2;
        const centerY = h / 2;
        for (const node of nodes) {
          node.fx = 0;
          node.fy = 0;
        }
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 800 / (dist * dist);
            const fx = dx / dist * force;
            const fy = dy / dist * force;
            nodes[i].fx -= fx;
            nodes[i].fy -= fy;
            nodes[j].fx += fx;
            nodes[j].fy += fy;
          }
        }
        for (const edge of propEdges) {
          const source = nodes.find((n) => n.id === edge.source);
          const target = nodes.find((n) => n.id === edge.target);
          if (!source || !target) continue;
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 100) * 0.05;
          const fx = dx / dist * force;
          const fy = dy / dist * force;
          source.fx += fx;
          source.fy += fy;
          target.fx -= fx;
          target.fy -= fy;
        }
        for (const node of nodes) {
          node.fx += (centerX - node.x) * 0.01;
          node.fy += (centerY - node.y) * 0.01;
        }
        const damping = 0.9;
        for (const node of nodes) {
          node.vx = (node.vx + node.fx) * damping;
          node.vy = (node.vy + node.fy) * damping;
          node.x += node.vx;
          node.y += node.vy;
          node.x = Math.max(30, Math.min(w - 30, node.x));
          node.y = Math.max(30, Math.min(h - 30, node.y));
        }
        iterations++;
        forceUpdate((n) => n + 1);
        if (iterations < maxIterations) {
          animRef.current = requestAnimationFrame(tick);
        }
      };
      animRef.current = requestAnimationFrame(tick);
    } else {
      forceUpdate((n) => n + 1);
    }
    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [propNodes, propEdges, layout]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const nodes = nodesRef.current;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);
    for (const edge of propEdges) {
      const source = nodes.find((n) => n.id === edge.source);
      const target = nodes.find((n) => n.id === edge.target);
      if (!source || !target) continue;
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = edge.color || "#88888866";
      ctx.lineWidth = edge.weight ? Math.max(1, edge.weight) : 1;
      ctx.stroke();
      if (edge.label && showLabels) {
        const mx = (source.x + target.x) / 2;
        const my = (source.y + target.y) / 2;
        ctx.fillStyle = "#888888";
        ctx.font = "9px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(edge.label, mx, my - 4);
      }
    }
    for (const node of nodes) {
      const size = node.size || 8;
      const color = node.color || getGroupColor(node.group, groups);
      const isHovered = hoveredNode === node.id;
      ctx.beginPath();
      ctx.arc(node.x, node.y, isHovered ? size + 2 : size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = isHovered ? "#ffffff" : "#00000020";
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();
      if (showLabels && node.label) {
        ctx.fillStyle = "#666666";
        ctx.font = `${isHovered ? "bold " : ""}10px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y + size + 12);
      }
    }
    ctx.restore();
  });
  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z * 1.2, 3)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z / 1.2, 0.3)), []);
  const handleReset = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);
  if (isLoading) {
    return /* @__PURE__ */ jsx(LoadingState, { message: "Loading graph...", className });
  }
  if (error) {
    return /* @__PURE__ */ jsx(
      ErrorState,
      {
        title: "Graph error",
        message: error.message,
        className
      }
    );
  }
  if (propNodes.length === 0) {
    return /* @__PURE__ */ jsx(
      EmptyState,
      {
        title: "No graph data",
        description: "No nodes to display.",
        className
      }
    );
  }
  return /* @__PURE__ */ jsx(Card, { className: cn("overflow-hidden", className), children: /* @__PURE__ */ jsxs(VStack, { gap: "none", children: [
    (title || actions && actions.length > 0 || interactive) && /* @__PURE__ */ jsxs(
      HStack,
      {
        gap: "sm",
        align: "center",
        justify: "between",
        className: "px-4 py-2 border-b border-[var(--color-border)]",
        children: [
          title && /* @__PURE__ */ jsx(Typography, { variant: "h6", weight: "semibold", children: title }),
          /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
            interactive && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", icon: ZoomOut, onClick: handleZoomOut }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", icon: ZoomIn, onClick: handleZoomIn }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", icon: RotateCcw, onClick: handleReset })
            ] }),
            actions?.map((action, idx) => /* @__PURE__ */ jsx(
              Badge,
              {
                variant: "default",
                className: "cursor-pointer hover:opacity-80 transition-opacity",
                onClick: () => handleAction(action),
                children: action.label
              },
              idx
            ))
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(Box, { className: "w-full bg-[var(--color-background)]", children: /* @__PURE__ */ jsx(
      "canvas",
      {
        ref: canvasRef,
        width: 800,
        height,
        className: "w-full cursor-grab active:cursor-grabbing",
        style: { height },
        onClick: (e) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left - offset.x) / zoom;
          const y = (e.clientY - rect.top - offset.y) / zoom;
          const clickedNode = nodesRef.current.find((n) => {
            const dist = Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2);
            return dist < (n.size || 8) + 4;
          });
          if (clickedNode) {
            handleNodeClick(clickedNode);
          }
        }
      }
    ) }),
    groups.length > 1 && /* @__PURE__ */ jsx(HStack, { gap: "md", className: "px-4 py-2 border-t border-[var(--color-border)]", wrap: true, children: groups.map((group, idx) => /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
      /* @__PURE__ */ jsx(
        Box,
        {
          className: "w-3 h-3 rounded-[var(--radius-full)] flex-shrink-0",
          style: { backgroundColor: GROUP_COLORS[idx % GROUP_COLORS.length] }
        }
      ),
      /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "secondary", children: group })
    ] }, group)) })
  ] }) });
};
GraphCanvas.displayName = "GraphCanvas";
function generateDiff(oldVal, newVal) {
  const oldLines = oldVal.split("\n");
  const newLines = newVal.split("\n");
  const diff = [];
  const maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];
    if (oldLine === newLine) {
      diff.push({ type: "context", content: oldLine ?? "", lineNumber: i + 1 });
    } else {
      if (oldLine !== void 0) {
        diff.push({ type: "remove", content: oldLine, lineNumber: i + 1 });
      }
      if (newLine !== void 0) {
        diff.push({ type: "add", content: newLine, lineNumber: i + 1 });
      }
    }
  }
  return diff;
}
var DIFF_STYLES = {
  add: {
    bg: "bg-[var(--color-success)]/10",
    prefix: "+",
    text: "text-[var(--color-success)]"
  },
  remove: {
    bg: "bg-[var(--color-error)]/10",
    prefix: "-",
    text: "text-[var(--color-error)]"
  },
  context: {
    bg: "",
    prefix: " ",
    text: "text-[var(--color-foreground)]"
  }
};
var CodeViewer = ({
  title,
  code,
  language,
  diff: propDiff,
  oldValue,
  newValue,
  mode = "code",
  showLineNumbers = true,
  showCopy = true,
  wordWrap = false,
  maxHeight = 500,
  files,
  actions,
  entity,
  isLoading = false,
  error,
  className
}) => {
  const eventBus = useEventBus();
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(wordWrap);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const handleAction = useCallback(
    (action) => {
      if (action.event) {
        eventBus.emit(`UI:${action.event}`, { entity });
      }
    },
    [eventBus, entity]
  );
  const activeFile = files?.[activeFileIndex];
  const activeCode = activeFile?.code ?? code ?? "";
  const activeLanguage = activeFile?.language ?? language ?? "text";
  const lines = useMemo(() => activeCode.split("\n"), [activeCode]);
  const diffLines = useMemo(() => {
    if (propDiff) return propDiff;
    if (mode === "diff" && oldValue !== void 0 && newValue !== void 0) {
      return generateDiff(oldValue, newValue);
    }
    return null;
  }, [propDiff, mode, oldValue, newValue]);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      eventBus.emit("UI:CODE_COPY", { entity, language: activeLanguage });
      setTimeout(() => setCopied(false), 2e3);
    } catch {
    }
  }, [activeCode, eventBus, entity, activeLanguage]);
  const tabItems = files?.map((file, idx) => ({
    id: `file-${idx}`,
    label: file.label,
    content: null
  }));
  if (isLoading) {
    return /* @__PURE__ */ jsx(LoadingState, { message: "Loading code...", className });
  }
  if (error) {
    return /* @__PURE__ */ jsx(
      ErrorState,
      {
        title: "Code viewer error",
        message: error.message,
        className
      }
    );
  }
  if (!activeCode && !diffLines) {
    return /* @__PURE__ */ jsx(
      EmptyState,
      {
        icon: Code,
        title: "No code",
        description: "No code to display.",
        className
      }
    );
  }
  return /* @__PURE__ */ jsx(Card, { className: cn("overflow-hidden", className), children: /* @__PURE__ */ jsxs(VStack, { gap: "none", children: [
    tabItems && tabItems.length > 1 && /* @__PURE__ */ jsx(Box, { className: "border-b border-[var(--color-border)]", children: /* @__PURE__ */ jsx(
      Tabs,
      {
        tabs: tabItems,
        activeTab: `file-${activeFileIndex}`,
        onTabChange: (id) => {
          const idx = parseInt(id.replace("file-", ""), 10);
          setActiveFileIndex(idx);
        }
      }
    ) }),
    /* @__PURE__ */ jsxs(
      HStack,
      {
        gap: "sm",
        align: "center",
        justify: "between",
        className: "px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-muted)]/30",
        children: [
          /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", children: [
            /* @__PURE__ */ jsx(Icon, { icon: mode === "diff" ? FileText : Code, size: "sm", className: "text-[var(--color-muted-foreground)]" }),
            title && /* @__PURE__ */ jsx(Typography, { variant: "small", weight: "medium", className: "truncate", children: title }),
            activeLanguage && activeLanguage !== "text" && /* @__PURE__ */ jsx(Badge, { variant: "default", children: activeLanguage })
          ] }),
          /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                icon: WrapText,
                onClick: () => setWrap(!wrap),
                className: cn(wrap && "text-[var(--color-primary)]")
              }
            ),
            showCopy && /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                icon: copied ? Check : Copy,
                onClick: handleCopy,
                className: cn(copied && "text-[var(--color-success)]")
              }
            ),
            actions?.map((action, idx) => /* @__PURE__ */ jsx(
              Badge,
              {
                variant: "default",
                className: "cursor-pointer hover:opacity-80 transition-opacity",
                onClick: () => handleAction(action),
                children: action.label
              },
              idx
            ))
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      Box,
      {
        className: "overflow-auto bg-[var(--color-muted)]/20",
        style: { maxHeight },
        children: diffLines ? (
          /* Diff mode */
          /* @__PURE__ */ jsx(VStack, { gap: "none", className: "font-mono text-xs", children: diffLines.map((line, idx) => {
            const style = DIFF_STYLES[line.type];
            return /* @__PURE__ */ jsxs(HStack, { gap: "none", align: "start", className: cn(style.bg, "px-4 py-0.5"), children: [
              showLineNumbers && /* @__PURE__ */ jsx(
                Typography,
                {
                  variant: "caption",
                  color: "secondary",
                  className: "w-8 text-right mr-3 select-none tabular-nums flex-shrink-0",
                  children: line.lineNumber ?? ""
                }
              ),
              /* @__PURE__ */ jsxs(
                Typography,
                {
                  variant: "caption",
                  className: cn(
                    "font-mono flex-1 min-w-0",
                    style.text,
                    wrap ? "whitespace-pre-wrap break-all" : "whitespace-pre"
                  ),
                  children: [
                    /* @__PURE__ */ jsx(Box, { as: "span", className: "select-none opacity-50 mr-2", children: style.prefix }),
                    line.content
                  ]
                }
              )
            ] }, idx);
          }) })
        ) : (
          /* Code mode */
          /* @__PURE__ */ jsx(VStack, { gap: "none", className: "font-mono text-xs", children: lines.map((line, idx) => /* @__PURE__ */ jsxs(HStack, { gap: "none", align: "start", className: "px-4 py-0.5 hover:bg-[var(--color-muted)]/50", children: [
            showLineNumbers && /* @__PURE__ */ jsx(
              Typography,
              {
                variant: "caption",
                color: "secondary",
                className: "w-8 text-right mr-4 select-none tabular-nums flex-shrink-0",
                children: idx + 1
              }
            ),
            /* @__PURE__ */ jsx(
              Typography,
              {
                variant: "caption",
                className: cn(
                  "font-mono flex-1 min-w-0",
                  wrap ? "whitespace-pre-wrap break-all" : "whitespace-pre"
                ),
                children: line || " "
              }
            )
          ] }, idx)) })
        )
      }
    )
  ] }) });
};
CodeViewer.displayName = "CodeViewer";
var DashboardLayout = ({
  appName = "{{APP_TITLE}}",
  logo,
  navItems = [],
  user: userProp,
  headerActions,
  showSearch = true,
  sidebarFooter,
  onSignOut: onSignOutProp
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user: authUser, signOut: authSignOut } = useAuthContext();
  const user = userProp || (authUser ? {
    name: authUser.displayName || authUser.email?.split("@")[0] || "User",
    email: authUser.email || "",
    avatar: authUser.photoURL || void 0
  } : null);
  const { t } = useTranslate();
  const handleSignOut = onSignOutProp || authSignOut;
  return /* @__PURE__ */ jsxs(Box, { className: "min-h-screen bg-[var(--color-background)] dark:bg-[var(--color-background)]", children: [
    sidebarOpen && /* @__PURE__ */ jsx(
      Box,
      {
        className: "fixed inset-0 bg-[var(--color-foreground)]/50 dark:bg-[var(--color-foreground)]/70 z-40 lg:hidden",
        onClick: () => setSidebarOpen(false)
      }
    ),
    /* @__PURE__ */ jsxs(
      Box,
      {
        as: "aside",
        className: cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-card)] dark:bg-[var(--color-card)] border-r border-[var(--color-border)] dark:border-[var(--color-border)]",
          "transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        ),
        children: [
          /* @__PURE__ */ jsxs(
            HStack,
            {
              align: "center",
              justify: "between",
              className: "h-16 px-4 border-b border-[var(--color-border)] dark:border-[var(--color-border)]",
              children: [
                /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
                  logo || /* @__PURE__ */ jsx(Box, { className: "w-8 h-8 bg-primary-600 rounded-[var(--radius-lg)] flex items-center justify-center", children: /* @__PURE__ */ jsx(
                    Typography,
                    {
                      variant: "small",
                      className: "text-white font-bold text-sm",
                      as: "span",
                      children: appName.charAt(0).toUpperCase()
                    }
                  ) }),
                  /* @__PURE__ */ jsx(
                    Typography,
                    {
                      variant: "label",
                      className: "font-semibold text-[var(--color-foreground)] dark:text-[var(--color-foreground)]",
                      as: "span",
                      children: appName
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "ghost",
                    className: "lg:hidden p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-muted)] dark:hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground)]",
                    onClick: () => setSidebarOpen(false),
                    children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            VStack,
            {
              as: "nav",
              gap: "none",
              className: "flex-1 px-3 py-4 space-y-1 overflow-y-auto",
              children: navItems.map((item) => /* @__PURE__ */ jsx(
                NavLink,
                {
                  item,
                  currentPath: location.pathname
                },
                item.href
              ))
            }
          ),
          sidebarFooter || /* @__PURE__ */ jsx(Box, { className: "p-4 border-t border-[var(--color-border)] dark:border-[var(--color-border)]", children: /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/settings",
              className: "flex items-center gap-3 px-3 py-2 text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground)] rounded-[var(--radius-lg)] hover:bg-[var(--color-muted)] dark:hover:bg-[var(--color-muted)]",
              children: [
                /* @__PURE__ */ jsx(Settings, { className: "h-5 w-5" }),
                t("common.settings")
              ]
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(Box, { className: "lg:pl-64", children: [
      /* @__PURE__ */ jsx(
        Box,
        {
          as: "header",
          className: "sticky top-0 z-30 h-16 bg-[var(--color-card)] dark:bg-[var(--color-card)] border-b border-[var(--color-border)] dark:border-[var(--color-border)]",
          children: /* @__PURE__ */ jsxs(
            HStack,
            {
              align: "center",
              justify: "between",
              className: "h-full px-4 gap-4",
              children: [
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "ghost",
                    className: "lg:hidden p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-muted)] dark:hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground)] touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center",
                    onClick: () => setSidebarOpen(true),
                    "aria-label": "Open sidebar",
                    children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
                  }
                ),
                showSearch && /* @__PURE__ */ jsx(Box, { className: "hidden sm:block flex-1 max-w-md", children: /* @__PURE__ */ jsxs(Box, { className: "relative", children: [
                  /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground)]" }),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      type: "search",
                      placeholder: t("common.search"),
                      className: "pl-10 w-full"
                    }
                  )
                ] }) }),
                /* @__PURE__ */ jsxs(HStack, { align: "center", gap: "xs", children: [
                  headerActions,
                  /* @__PURE__ */ jsx(ThemeToggle, {}),
                  /* @__PURE__ */ jsxs(
                    Button,
                    {
                      variant: "ghost",
                      className: "relative p-2 rounded-[var(--radius-full)] hover:bg-[var(--color-muted)] dark:hover:bg-[var(--color-muted)]",
                      children: [
                        /* @__PURE__ */ jsx(Bell, { className: "h-5 w-5 text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground)]" }),
                        /* @__PURE__ */ jsx(
                          Box,
                          {
                            as: "span",
                            className: "absolute top-1 right-1 w-2 h-2 bg-[var(--color-error)] rounded-[var(--radius-full)]"
                          }
                        )
                      ]
                    }
                  ),
                  user && /* @__PURE__ */ jsxs(Box, { className: "relative", children: [
                    /* @__PURE__ */ jsxs(
                      Button,
                      {
                        variant: "ghost",
                        className: "flex items-center gap-2 p-2 rounded-[var(--radius-lg)] hover:bg-[var(--color-muted)] dark:hover:bg-[var(--color-muted)]",
                        onClick: () => setUserMenuOpen(!userMenuOpen),
                        children: [
                          /* @__PURE__ */ jsx(
                            Avatar,
                            {
                              src: user.avatar,
                              alt: user.name,
                              initials: user.name.split(" ").map((n) => n[0]).join("").substring(0, 2),
                              size: "sm"
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            Typography,
                            {
                              variant: "small",
                              className: "hidden sm:block text-sm font-medium text-[var(--color-foreground)] dark:text-[var(--color-foreground)]",
                              as: "span",
                              children: user.name
                            }
                          ),
                          /* @__PURE__ */ jsx(ChevronDown, { className: "hidden sm:block h-4 w-4 text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground)]" })
                        ]
                      }
                    ),
                    userMenuOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(
                        Box,
                        {
                          className: "fixed inset-0 z-40",
                          onClick: () => setUserMenuOpen(false)
                        }
                      ),
                      /* @__PURE__ */ jsxs(Box, { className: "absolute right-0 mt-2 w-48 bg-[var(--color-card)] dark:bg-[var(--color-card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--color-border)] dark:border-[var(--color-border)] py-1 z-50", children: [
                        /* @__PURE__ */ jsxs(Box, { className: "px-4 py-2 border-b border-[var(--color-border)] dark:border-[var(--color-border)]", children: [
                          /* @__PURE__ */ jsx(
                            Typography,
                            {
                              variant: "small",
                              className: "text-sm font-medium text-[var(--color-foreground)] dark:text-[var(--color-foreground)]",
                              as: "p",
                              children: user.name
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            Typography,
                            {
                              variant: "caption",
                              className: "text-xs text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground)]",
                              as: "p",
                              children: user.email
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxs(
                          Link,
                          {
                            to: "/settings",
                            className: "flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-foreground)] dark:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] dark:hover:bg-[var(--color-muted)]",
                            children: [
                              /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4" }),
                              t("common.settings")
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxs(
                          Button,
                          {
                            variant: "ghost",
                            onClick: () => {
                              setUserMenuOpen(false);
                              handleSignOut?.();
                            },
                            className: "w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-error)] dark:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 dark:hover:bg-[var(--color-error)]/20",
                            children: [
                              /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
                              t("auth.signOut")
                            ]
                          }
                        )
                      ] })
                    ] })
                  ] })
                ] })
              ]
            }
          )
        }
      ),
      /* @__PURE__ */ jsx(Box, { as: "main", className: "p-4 sm:p-6 pb-20 sm:pb-6", children: /* @__PURE__ */ jsx(Outlet, {}) })
    ] })
  ] });
};
DashboardLayout.displayName = "DashboardLayout";
var NavLink = ({
  item,
  currentPath
}) => {
  const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");
  const Icon3 = item.icon;
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to: item.href,
      className: cn(
        "flex items-center gap-3 px-3 py-2 rounded-[var(--radius-lg)] text-sm font-medium transition-colors",
        isActive ? "bg-[var(--color-foreground)] text-[var(--color-background)] shadow-[var(--shadow-sm)]" : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
      ),
      children: [
        /* @__PURE__ */ jsx(
          Icon3,
          {
            className: cn(
              "h-5 w-5",
              isActive ? "text-[var(--color-background)]" : "text-[var(--color-muted-foreground)]"
            )
          }
        ),
        /* @__PURE__ */ jsx(
          Typography,
          {
            variant: "small",
            className: "flex-1",
            as: "span",
            children: item.label
          }
        ),
        item.badge && /* @__PURE__ */ jsx(Badge, { variant: isActive ? "primary" : "default", size: "sm", children: item.badge })
      ]
    }
  );
};
NavLink.displayName = "NavLink";
var AuthLayout = ({
  appName = "{{APP_TITLE}}",
  logo,
  backgroundImage,
  showBranding = true,
  brandingContent
}) => {
  const { t } = useTranslate();
  return /* @__PURE__ */ jsxs(Box, { className: "min-h-screen flex", children: [
    showBranding && /* @__PURE__ */ jsxs(
      VStack,
      {
        className: cn(
          "hidden lg:flex lg:w-1/2 bg-primary-600 relative overflow-hidden",
          "justify-between p-12"
        ),
        style: backgroundImage ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover"
        } : void 0,
        gap: "none",
        children: [
          /* @__PURE__ */ jsx(Box, { className: "absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-800/90" }),
          /* @__PURE__ */ jsx(Box, { className: "relative z-10", children: /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-3", children: [
            logo || /* @__PURE__ */ jsx(Box, { className: "w-10 h-10 bg-white/20 rounded-[var(--radius-xl)] flex items-center justify-center backdrop-blur", children: /* @__PURE__ */ jsx(
              Typography,
              {
                variant: "body1",
                className: "text-white font-bold text-lg",
                children: appName.charAt(0).toUpperCase()
              }
            ) }),
            /* @__PURE__ */ jsx(
              Typography,
              {
                variant: "body1",
                className: "text-2xl font-bold text-white",
                children: appName
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx(Box, { className: "relative z-10", children: brandingContent || /* @__PURE__ */ jsxs(VStack, { gap: "lg", children: [
            /* @__PURE__ */ jsxs(
              Typography,
              {
                variant: "h1",
                className: "text-4xl font-bold text-white leading-tight",
                children: [
                  "Welcome to ",
                  appName
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Typography,
              {
                variant: "body1",
                className: "text-lg text-white/80 max-w-md",
                children: "Sign in to access your dashboard and manage your account."
              }
            ),
            /* @__PURE__ */ jsxs(Box, { className: "mt-12 p-6 bg-white/10 rounded-[var(--radius-xl)] backdrop-blur", children: [
              /* @__PURE__ */ jsx(
                Typography,
                {
                  variant: "body1",
                  className: "text-white/90 italic",
                  children: '"This platform has transformed how we work. Highly recommended!"'
                }
              ),
              /* @__PURE__ */ jsxs(HStack, { className: "mt-4", gap: "sm", align: "center", children: [
                /* @__PURE__ */ jsx(Box, { className: "w-10 h-10 bg-white/20 rounded-[var(--radius-full)]" }),
                /* @__PURE__ */ jsxs(VStack, { gap: "none", children: [
                  /* @__PURE__ */ jsx(
                    Typography,
                    {
                      variant: "body1",
                      className: "text-white font-medium",
                      children: "Jane Doe"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Typography,
                    {
                      variant: "body1",
                      className: "text-white/60 text-sm",
                      children: "CEO, Example Co."
                    }
                  )
                ] })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Box, { className: "absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 rounded-[var(--radius-full)]" }),
          /* @__PURE__ */ jsx(Box, { className: "absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-[var(--radius-full)]" })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      Box,
      {
        className: cn(
          "flex-1 flex items-center justify-center p-6 sm:p-12",
          "bg-[var(--color-background)]"
        ),
        children: /* @__PURE__ */ jsxs(Box, { className: "w-full max-w-md", children: [
          /* @__PURE__ */ jsx(Box, { className: "lg:hidden mb-8 text-center", children: /* @__PURE__ */ jsxs(Link, { to: "/", className: "inline-flex items-center gap-3", children: [
            logo || /* @__PURE__ */ jsx(Box, { className: "w-12 h-12 bg-primary-600 rounded-[var(--radius-xl)] flex items-center justify-center", children: /* @__PURE__ */ jsx(
              Typography,
              {
                variant: "body1",
                className: "text-white font-bold text-xl",
                children: appName.charAt(0).toUpperCase()
              }
            ) }),
            /* @__PURE__ */ jsx(
              Typography,
              {
                variant: "body1",
                className: "text-2xl font-bold text-[var(--color-foreground)]",
                children: appName
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx(Outlet, {})
        ] })
      }
    )
  ] });
};
AuthLayout.displayName = "AuthLayout";
var sizeStyles = {
  sm: { display: "text-4xl", button: "sm" },
  md: { display: "text-6xl", button: "md" },
  lg: { display: "text-8xl", button: "lg" }
};
function CounterMinimal({
  entity,
  size = "md",
  onDecrement,
  onIncrement,
  className
}) {
  return /* @__PURE__ */ jsxs(HStack, { gap: "lg", align: "center", justify: "center", className, children: [
    /* @__PURE__ */ jsx(
      Button,
      {
        variant: "secondary",
        size: sizeStyles[size].button,
        onClick: onDecrement,
        disabled: entity.decrementDisabled,
        icon: Minus,
        children: entity.decrementLabel
      }
    ),
    /* @__PURE__ */ jsx(
      Typography,
      {
        variant: "h1",
        className: cn(
          sizeStyles[size].display,
          "font-bold tabular-nums min-w-[3ch] text-center"
        ),
        children: entity.count
      }
    ),
    /* @__PURE__ */ jsx(
      Button,
      {
        variant: "secondary",
        size: sizeStyles[size].button,
        onClick: onIncrement,
        disabled: entity.incrementDisabled,
        icon: Plus,
        children: entity.incrementLabel
      }
    )
  ] });
}
CounterMinimal.displayName = "CounterMinimal";
function CounterStandard({
  entity,
  size = "md",
  title = "Counter",
  showReset = true,
  onDecrement,
  onIncrement,
  onReset,
  className
}) {
  return /* @__PURE__ */ jsx(Container, { size: "sm", padding: "lg", className, children: /* @__PURE__ */ jsxs(VStack, { gap: "lg", align: "center", children: [
    /* @__PURE__ */ jsx(
      Typography,
      {
        variant: "h2",
        className: "text-[var(--color-muted-foreground)]",
        children: title
      }
    ),
    /* @__PURE__ */ jsx(
      Typography,
      {
        variant: "h1",
        className: cn(
          sizeStyles[size].display,
          "font-bold tabular-nums text-primary-600"
        ),
        children: entity.count
      }
    ),
    /* @__PURE__ */ jsxs(HStack, { gap: "md", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "secondary",
          size: sizeStyles[size].button,
          onClick: onDecrement,
          disabled: entity.decrementDisabled,
          icon: Minus
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "primary",
          size: sizeStyles[size].button,
          onClick: onIncrement,
          disabled: entity.incrementDisabled,
          icon: Plus
        }
      )
    ] }),
    showReset && /* @__PURE__ */ jsx(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: onReset,
        icon: RotateCcw,
        children: "Reset"
      }
    )
  ] }) });
}
CounterStandard.displayName = "CounterStandard";
function CounterFull({
  entity,
  size = "md",
  title = "Counter",
  showReset = true,
  onDecrement,
  onIncrement,
  onReset,
  className
}) {
  return /* @__PURE__ */ jsx(Container, { size: "sm", padding: "lg", className, children: /* @__PURE__ */ jsxs(VStack, { gap: "xl", align: "center", children: [
    /* @__PURE__ */ jsx(
      Typography,
      {
        variant: "h2",
        className: "text-[var(--color-muted-foreground)]",
        children: title
      }
    ),
    /* @__PURE__ */ jsxs(VStack, { gap: "sm", align: "center", children: [
      /* @__PURE__ */ jsx(
        Typography,
        {
          variant: "h1",
          className: cn(
            sizeStyles[size].display,
            "font-bold tabular-nums text-primary-600"
          ),
          children: entity.count
        }
      ),
      entity.rangeText && /* @__PURE__ */ jsx(Typography, { variant: "small", color: "muted", children: entity.rangeText })
    ] }),
    /* @__PURE__ */ jsxs(HStack, { gap: "md", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "secondary",
          size: sizeStyles[size].button,
          onClick: onDecrement,
          disabled: entity.decrementDisabled,
          icon: Minus,
          children: entity.decrementLabel
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "primary",
          size: sizeStyles[size].button,
          onClick: onIncrement,
          disabled: entity.incrementDisabled,
          icon: Plus,
          children: entity.incrementLabel
        }
      )
    ] }),
    showReset && /* @__PURE__ */ jsx(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: onReset,
        icon: RotateCcw,
        children: "Reset to 0"
      }
    )
  ] }) });
}
CounterFull.displayName = "CounterFull";
var CounterTemplate = (props) => {
  switch (props.variant) {
    case "minimal":
      return /* @__PURE__ */ jsx(CounterMinimal, { ...props });
    case "full":
      return /* @__PURE__ */ jsx(CounterFull, { ...props });
    default:
      return /* @__PURE__ */ jsx(CounterStandard, { ...props });
  }
};
CounterTemplate.displayName = "CounterTemplate";
var GameTemplate = ({
  entity,
  title = "Game",
  children,
  hud,
  debugPanel,
  showDebugPanel = false,
  controls,
  className
}) => {
  return /* @__PURE__ */ jsxs(
    Box,
    {
      display: "flex",
      fullHeight: true,
      className: cn("flex-col lg:flex-row", className),
      children: [
        /* @__PURE__ */ jsxs(Box, { display: "flex", className: "flex-1 flex-col", children: [
          /* @__PURE__ */ jsxs(
            Box,
            {
              padding: "md",
              border: true,
              className: "border-b-2 border-x-0 border-t-0 border-[var(--color-border)] flex items-center justify-between",
              children: [
                /* @__PURE__ */ jsx(Typography, { variant: "h4", children: title }),
                controls && /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", children: [
                  controls.isPlaying ? /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "secondary",
                      size: "sm",
                      icon: Pause,
                      onClick: controls.onPause,
                      children: "Pause"
                    }
                  ) : /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "primary",
                      size: "sm",
                      icon: Play,
                      onClick: controls.onPlay,
                      children: "Play"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "sm",
                      icon: RotateCcw,
                      onClick: controls.onReset,
                      children: "Reset"
                    }
                  )
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Box,
            {
              position: "relative",
              fullWidth: true,
              className: "flex-1 bg-[var(--color-muted)]",
              children: [
                children,
                hud && /* @__PURE__ */ jsx(
                  Box,
                  {
                    position: "absolute",
                    className: "top-0 left-0 right-0 pointer-events-none",
                    children: /* @__PURE__ */ jsx(Box, { padding: "md", className: "pointer-events-auto w-fit", children: hud })
                  }
                )
              ]
            }
          )
        ] }),
        showDebugPanel && debugPanel && /* @__PURE__ */ jsxs(
          Box,
          {
            bg: "surface",
            border: true,
            shadow: "sm",
            overflow: "auto",
            className: "w-full lg:w-80 lg:border-l-2 lg:border-t-0 border-t-2 border-[var(--color-border)]",
            children: [
              /* @__PURE__ */ jsx(
                Box,
                {
                  padding: "md",
                  border: true,
                  className: "border-b-2 border-x-0 border-t-0 border-[var(--color-border)]",
                  children: /* @__PURE__ */ jsx(Typography, { variant: "h6", children: "Debug Panel" })
                }
              ),
              /* @__PURE__ */ jsx(Box, { padding: "md", children: debugPanel })
            ]
          }
        )
      ]
    }
  );
};
GameTemplate.displayName = "GameTemplate";
var GenericAppTemplate = ({
  entity,
  title,
  subtitle,
  children,
  headerActions,
  footer,
  className
}) => {
  return /* @__PURE__ */ jsxs(Box, { display: "flex", fullHeight: true, className: cn("flex-col", className), children: [
    /* @__PURE__ */ jsxs(
      Box,
      {
        padding: "md",
        border: true,
        className: "border-b-2 border-x-0 border-t-0 border-[var(--color-border)] flex items-center justify-between flex-shrink-0",
        children: [
          /* @__PURE__ */ jsxs(Box, { children: [
            /* @__PURE__ */ jsx(Typography, { variant: "h3", children: title }),
            subtitle && /* @__PURE__ */ jsx(Typography, { variant: "body2", color: "secondary", className: "mt-1", children: subtitle })
          ] }),
          headerActions && /* @__PURE__ */ jsx(HStack, { gap: "sm", align: "center", children: headerActions })
        ]
      }
    ),
    /* @__PURE__ */ jsx(Box, { fullWidth: true, overflow: "auto", className: "flex-1", children: /* @__PURE__ */ jsx(Box, { padding: "lg", children }) }),
    footer && /* @__PURE__ */ jsx(
      Box,
      {
        padding: "md",
        border: true,
        bg: "muted",
        className: "border-t-2 border-x-0 border-b-0 border-[var(--color-border)] flex-shrink-0",
        children: footer
      }
    )
  ] });
};
GenericAppTemplate.displayName = "GenericAppTemplate";
var GameShell = ({
  appName = "Game",
  hud,
  className,
  showTopBar = true
}) => {
  return /* @__PURE__ */ jsxs(
    Box,
    {
      display: "flex",
      className: cn(
        "game-shell",
        "flex-col w-full h-screen overflow-hidden",
        className
      ),
      style: {
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "var(--color-background, #0a0a0f)",
        color: "var(--color-text, #e0e0e0)"
      },
      children: [
        showTopBar && /* @__PURE__ */ jsxs(
          HStack,
          {
            align: "center",
            justify: "between",
            className: "game-shell__header",
            style: {
              padding: "0.5rem 1rem",
              borderBottom: "1px solid var(--color-border, #2a2a3a)",
              background: "var(--color-surface, #12121f)",
              flexShrink: 0
            },
            children: [
              /* @__PURE__ */ jsx(
                Typography,
                {
                  variant: "h6",
                  style: {
                    fontWeight: 700,
                    letterSpacing: "0.02em"
                  },
                  children: appName
                }
              ),
              hud && /* @__PURE__ */ jsx(Box, { className: "game-shell__hud", children: hud })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          Box,
          {
            className: "game-shell__content",
            style: {
              flex: 1,
              overflow: "hidden",
              position: "relative"
            },
            children: /* @__PURE__ */ jsx(Outlet, {})
          }
        )
      ]
    }
  );
};
GameShell.displayName = "GameShell";
function BattleTemplate({
  entity,
  scale = 0.45,
  unitScale = 1,
  className
}) {
  return /* @__PURE__ */ jsx(
    BattleBoard,
    {
      entity,
      scale,
      unitScale,
      tileClickEvent: "TILE_CLICK",
      unitClickEvent: "UNIT_CLICK",
      endTurnEvent: "END_TURN",
      cancelEvent: "CANCEL",
      gameEndEvent: "GAME_END",
      playAgainEvent: "PLAY_AGAIN",
      attackEvent: "ATTACK",
      className
    }
  );
}
BattleTemplate.displayName = "BattleTemplate";
function CastleTemplate({
  entity,
  scale = 0.45,
  className
}) {
  return /* @__PURE__ */ jsx(
    CastleBoard,
    {
      entity,
      scale,
      featureClickEvent: "FEATURE_CLICK",
      unitClickEvent: "UNIT_CLICK",
      tileClickEvent: "TILE_CLICK",
      className
    }
  );
}
CastleTemplate.displayName = "CastleTemplate";
function WorldMapTemplate({
  entity,
  scale = 0.4,
  unitScale = 2.5,
  diamondTopY,
  allowMoveAllHeroes = false,
  className
}) {
  return /* @__PURE__ */ jsx(
    WorldMapBoard,
    {
      entity,
      scale,
      unitScale,
      diamondTopY,
      allowMoveAllHeroes,
      heroSelectEvent: "HERO_SELECT",
      heroMoveEvent: "HERO_MOVE",
      battleEncounterEvent: "BATTLE_ENCOUNTER",
      featureEnterEvent: "FEATURE_ENTER",
      className
    }
  );
}
WorldMapTemplate.displayName = "WorldMapTemplate";

export { ALL_PRESETS, AR_BOOK_FIELDS, ActionPalette, ActionTile, AuthLayout, BattleBoard, BattleTemplate, BookChapterView, BookCoverPage, BookNavBar, BookTableOfContents, BookViewer, BuilderBoard, CanvasEffect, CastleBoard, CastleTemplate, Chart, ClassifierBoard, CodeView, CodeViewer, CollapsibleSection, CombatLog, ConfirmDialog, ContentRenderer, CounterTemplate, DIAMOND_TOP_Y, DashboardGrid, DashboardLayout, DebuggerBoard, DialogueBox, DocumentViewer, StateMachineView as DomStateMachineVisualizer, DrawerSlot, EditorCheckbox, EditorSelect, EditorSlider, EditorTextInput, EditorToolbar, EventHandlerBoard, EventLog, FEATURE_COLORS, FEATURE_TYPES, FLOOR_HEIGHT, FormActions, FormLayout, FormSection, GameAudioContext, GameAudioProvider, GameAudioToggle, GameHud, GameMenu, GameOverScreen, GameShell, GameTemplate, GenericAppTemplate, GraphCanvas, Header, IDENTITY_BOOK_FIELDS, InventoryPanel, IsometricCanvas, JazariStateMachine, List, MediaGallery, Meter, ModalSlot, Navigation, NegotiatorBoard, ObjectRulePanel, StateMachineView as OrbitalStateMachineView, OrbitalVisualization, PhysicsManager, RuleEditor, SHEET_COLUMNS, SPRITE_SHEET_LAYOUT, Section, SequenceBar, SequencerBoard, Sidebar, SignaturePad, SimulationCanvas, SimulationControls, SimulationGraph, SimulatorBoard, Split, SplitPane, StateArchitectBoard, StateMachineView, StateNode2 as StateNode, StatusBar, TERRAIN_COLORS, TILE_HEIGHT, TILE_WIDTH, TabbedContainer, Table, TerrainPalette, Timeline, ToastSlot, TraitSlot, TraitStateViewer, TransitionArrow, UncontrolledBattleBoard, VariablePanel, WizardContainer, WorldMapBoard, WorldMapTemplate, applyTemporaryEffect, calculateAttackTargets, calculateDamage, calculateValidMoves, combatAnimations, combatClasses, combatEffects, createInitialGameState, createUnitAnimationState, generateCombatMessage, getCurrentFrame, inferDirection, isoToScreen, mapBookData, pendulum, projectileMotion, resolveFieldMap, resolveFrame, resolveSheetDirection, screenToIso, springOscillator, tickAnimationState, transitionAnimation, useBattleState, useCamera, useGameAudio, useGameAudioContext, useImageCache, usePhysics2D, useSpriteAnimations };
