'use client';
/**
 * Header Organism Component
 *
 * A header component for mobile/responsive layouts with menu toggle, brand, and user avatar.
 * Styled to match the main Layout component's mobile header.
 */

import React from "react";
import type { AssetUrl } from "@almadar/core";
import { Menu, X } from "lucide-react";
import { SearchInput } from "./SearchInput";
import { Avatar } from "../atoms/Avatar";
import { Badge } from "../atoms/Badge";
import { Button } from "../atoms/Button";
import { Box } from "../atoms/Box";
import { Icon } from "../atoms/Icon";
import type { IconInput } from "../atoms";
import { HStack } from "../atoms/Stack";
import { Typography } from "../atoms/Typography";
import { cn } from "../../../lib/cn";
import { useTranslate } from "../../../hooks/useTranslate";
import type { UiError } from '../atoms/types';

export type HeaderLook =
  | "hero"
  | "compact-bar"
  | "breadcrumb"
  | "contextual"
  | "editorial-banner";

const lookStyles: Record<HeaderLook, string> = {
  "compact-bar": "",
  hero: "py-section min-h-[200px] [&_h1]:text-display-1",
  breadcrumb: "py-2 text-sm [&_h1]:text-base [&_h1]:font-medium",
  contextual: "py-3 [&_h1]:text-lg",
  "editorial-banner":
    "py-12 [&_h1]:text-display-2 [&_h1]:font-display-bold border-b border-border",
};

export interface HeaderNavigationItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: IconInput;
  badge?: string | number;
  active?: boolean;
}

export interface HeaderUserAvatar {
  src?: AssetUrl;
  alt?: string;
  initials?: string;
}

export interface HeaderProps {
  /**
   * Logo/Brand content
   */
  logo?: React.ReactNode;

  /**
   * Logo image source
   */
  logoSrc?: AssetUrl;

  /**
   * Brand/App name
   */
  brandName?: string;

  /**
   * Navigation items (for desktop header variant)
   */
  navigationItems?: HeaderNavigationItem[];

  /**
   * Show menu toggle button
   * @default true
   */
  showMenuToggle?: boolean;

  /**
   * Is menu open (for toggle icon)
   */
  isMenuOpen?: boolean;

  /**
   * Menu toggle callback
   */
  onMenuToggle?: () => void;

  /**
   * Show search input
   * @default false
   */
  showSearch?: boolean;

  /**
   * Search placeholder
   */
  searchPlaceholder?: string;

  /**
   * Search callback
   */
  onSearch?: (value: string) => void;

  /**
   * User avatar configuration
   */
  userAvatar?: HeaderUserAvatar;

  /**
   * User name (display name or email)
   */
  userName?: string;

  /**
   * Callback when user avatar is clicked
   */
  onUserClick?: () => void;

  /**
   * Action buttons (right side)
   */
  actions?: React.ReactNode;

  /**
   * Sticky header
   * @default true
   */
  sticky?: boolean;

  /**
   * Variant - mobile shows menu toggle, desktop shows full nav
   * @default 'mobile'
   */
  variant?: "mobile" | "desktop";

  /** Layer 2 visual treatment — orthogonal to the structural variant (which currently flips mobile vs desktop). */
  look?: HeaderLook;

  /**
   * Callback when logo/brand is clicked
   */
  onLogoClick?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Loading state indicator (closed circuit)
   */
  isLoading?: boolean;

  /**
   * Error state (closed circuit)
   */
  error?: UiError | null;

}

export const Header: React.FC<HeaderProps> = ({
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
  look = "compact-bar",
  onLogoClick,
  className,
}) => {
  const { t } = useTranslate();
  const resolvedSearchPlaceholder = searchPlaceholder ?? t('common.search');

  // Get user initials
  const userInitials =
    userAvatar?.initials || userName?.[0]?.toUpperCase() || "U";

  return (
    <Box
      as="header"
      className={cn(
        "h-16 border-b border-border",
        "flex items-center px-4 justify-between bg-card",
        sticky && "sticky top-0 z-50",
        variant === "mobile" && "lg:hidden",
        lookStyles[look],
        className,
      )}
    >
      {/* Left section: Menu toggle + Brand */}
      <HStack gap="none" align="center" className="gap-3">
        {/* Menu toggle button */}
        {showMenuToggle && (
          <Button
            variant="ghost"
            onClick={onMenuToggle}
            className="p-2 -ml-2 text-foreground hover:bg-muted transition-colors"
            aria-label={isMenuOpen ? t('aria.closeMenu') : t('aria.openMenu')}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        )}

        {/* Logo/Brand */}
        <HStack
          gap="none"
          align="center"
          className={cn(
            "gap-2",
            onLogoClick && "cursor-pointer",
          )}
          onClick={onLogoClick}
        >
          {logo ? (
            typeof logo === "string" ? (
              <Avatar src={logo} alt={brandName} size="sm" />
            ) : (
              logo
            )
          ) : logoSrc ? (
            <Avatar src={logoSrc} alt={brandName} size="sm" />
          ) : null}

          {brandName && (
            <Typography
              variant="h5"
              className="text-lg font-bold text-foreground"
            >
              {brandName}
            </Typography>
          )}
        </HStack>
      </HStack>

      {/* Center section: Navigation (desktop variant) or Search */}
      {variant === "desktop" &&
        navigationItems &&
        navigationItems.length > 0 && (
          <Box
            role="navigation"
            className="hidden md:flex items-center gap-1 flex-1 justify-center"
          >
            {navigationItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                onClick={item.onClick}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.icon && (
                  typeof item.icon === 'string'
                    ? <Icon name={item.icon} size="sm" />
                    : <Icon icon={item.icon} size="sm" />
                )}
                <Typography variant="label" className="font-medium">
                  {item.label}
                </Typography>
                {item.badge !== undefined && (
                  <Badge variant="danger" size="sm">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </Box>
        )}

      {/* Search (if enabled) */}
      {showSearch && (
        <Box className="hidden lg:block flex-1 max-w-md mx-4">
          <SearchInput placeholder={resolvedSearchPlaceholder} onSearch={onSearch} />
        </Box>
      )}

      {/* Right section: Actions + User */}
      <HStack gap="none" align="center" className="gap-3">
        {/* Custom actions */}
        {actions}

        {/* User avatar */}
        {(userAvatar || userName) && (
          <Button
            variant="ghost"
            onClick={onUserClick}
            className={cn(
              "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center",
              "text-primary font-bold text-xs",
              "hover:ring-2 hover:ring-ring transition-all",
              onUserClick && "cursor-pointer",
            )}
          >
            {userAvatar?.src ? (
              <Avatar
                src={userAvatar.src}
                alt={userAvatar.alt || userName}
                size="sm"
              />
            ) : (
              userInitials
            )}
          </Button>
        )}
      </HStack>
    </Box>
  );
};

Header.displayName = "Header";
