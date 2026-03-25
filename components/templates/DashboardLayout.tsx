'use client';
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/cn";
import {
  Menu,
  X,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  LucideIcon,
} from "lucide-react";
import { Button, Input, Badge, ThemeToggle, Avatar } from "../atoms";
import { Box } from "../atoms/Box";
import { HStack, VStack } from "../atoms/Stack";
import { Typography } from "../atoms/Typography";
import { Icon as AlmadarIcon } from "../atoms/Icon";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useTranslate } from "../../hooks/useTranslate";

export interface NavItem {
  label: string;
  href: string;
  /** Lucide icon component or string icon name (resolved by @almadar/ui Icon) */
  icon?: LucideIcon | string;
  badge?: string | number;
  children?: NavItem[];
}

export interface DashboardLayoutProps {
  /** App name shown in sidebar */
  appName?: string;
  /** Logo component or URL */
  logo?: React.ReactNode;
  /** Navigation items */
  navItems?: NavItem[];
  /** Current user info (optional - auto-populated from auth context if not provided) */
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  /** Header actions (notifications, etc.) */
  headerActions?: React.ReactNode;
  /** Show search in header */
  showSearch?: boolean;
  /** Custom sidebar footer */
  sidebarFooter?: React.ReactNode;
  /** Callback when user clicks sign out (optional - uses auth context signOut if not provided) */
  onSignOut?: () => void;
  /** Page content rendered inside the main area */
  children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  appName = "{{APP_TITLE}}",
  logo,
  navItems = [],
  user: userProp,
  headerActions,
  showSearch = true,
  sidebarFooter,
  onSignOut: onSignOutProp,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  // Get user and signOut from auth context (with prop overrides)
  const { user: authUser, signOut: authSignOut } = useAuthContext();

  // Use props if provided, otherwise use auth context
  const user =
    userProp ||
    (authUser
      ? {
          name: authUser.displayName || authUser.email?.split("@")[0] || "User",
          email: authUser.email || "",
          avatar: authUser.photoURL || undefined,
        }
      : null);

  const { t } = useTranslate();

  const handleSignOut = onSignOutProp || authSignOut;

  return (
    <Box className="min-h-screen bg-background dark:bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <Box
          className="fixed inset-0 bg-foreground/50 dark:bg-foreground/70 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Box
        as="aside"
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-card dark:bg-card border-r border-border dark:border-border",
          "transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Sidebar header */}
        <HStack
          align="center"
          justify="between"
          className="h-16 px-4 border-b border-border dark:border-border"
        >
          <Link to="/" className="flex items-center gap-2">
            {logo || (
              <Box className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Typography
                  variant="small"
                  className="text-white font-bold text-sm"
                  as="span"
                >
                  {appName.charAt(0).toUpperCase()}
                </Typography>
              </Box>
            )}
            <Typography
              variant="label"
              className="font-semibold text-foreground dark:text-foreground"
              as="span"
            >
              {appName}
            </Typography>
          </Link>
          <Button
            variant="ghost"
            className="lg:hidden p-2 rounded-md hover:bg-muted dark:hover:bg-muted text-muted-foreground dark:text-muted-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </HStack>

        {/* Navigation */}
        <VStack
          as="nav"
          gap="none"
          className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              currentPath={location.pathname}
            />
          ))}
        </VStack>

        {/* Sidebar footer */}
        {sidebarFooter || (
          <Box className="p-4 border-t border-border dark:border-border">
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground dark:text-muted-foreground rounded-lg hover:bg-muted dark:hover:bg-muted"
            >
              <Settings className="h-5 w-5" />
              {t('common.settings')}
            </Link>
          </Box>
        )}
      </Box>

      {/* Main content */}
      <Box className="lg:pl-64">
        {/* Header */}
        <Box
          as="header"
          className="sticky top-0 z-20 h-16 bg-card dark:bg-card border-b border-border dark:border-border"
        >
          <HStack
            align="center"
            justify="between"
            className="h-full px-4 gap-4"
          >
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              className="lg:hidden p-2 rounded-md hover:bg-muted dark:hover:bg-muted text-muted-foreground dark:text-muted-foreground touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Search */}
            {showSearch && (
              <Box className="hidden sm:block flex-1 max-w-md">
                <Box className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t('common.search')}
                    className="pl-10 w-full"
                  />
                </Box>
              </Box>
            )}

            {/* Right side */}
            <HStack align="center" gap="xs">
              {headerActions}

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <Button
                variant="ghost"
                className="relative p-2 rounded-full hover:bg-muted dark:hover:bg-muted"
              >
                <Bell className="h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
                <Box
                  as="span"
                  className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"
                />
              </Button>

              {/* User menu */}
              {user && (
                <Box className="relative">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted dark:hover:bg-muted"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <Avatar
                      src={user.avatar}
                      alt={user.name}
                      initials={user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                      size="sm"
                    />
                    <Typography
                      variant="small"
                      className="hidden sm:block text-sm font-medium text-foreground dark:text-foreground"
                      as="span"
                    >
                      {user.name}
                    </Typography>
                    <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                  </Button>

                  {userMenuOpen && (
                    <>
                      <Box
                        className="fixed inset-0 z-20"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <Box className="absolute right-0 mt-2 w-48 bg-card dark:bg-card rounded-lg shadow-lg border border-border dark:border-border py-1 z-30">
                        <Box className="px-4 py-2 border-b border-border dark:border-border">
                          <Typography
                            variant="small"
                            className="text-sm font-medium text-foreground dark:text-foreground"
                            as="p"
                          >
                            {user.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            className="text-xs text-muted-foreground dark:text-muted-foreground"
                            as="p"
                          >
                            {user.email}
                          </Typography>
                        </Box>
                        <Link
                          to="/settings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-foreground dark:text-foreground hover:bg-muted dark:hover:bg-muted"
                        >
                          <Settings className="h-4 w-4" />
                          {t('common.settings')}
                        </Link>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleSignOut?.();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error dark:text-error hover:bg-error/10 dark:hover:bg-error/20"
                        >
                          <LogOut className="h-4 w-4" />
                          {t('auth.signOut')}
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              )}
            </HStack>
          </HStack>
        </Box>

        {/* Page content */}
        <Box as="main" className="p-4 sm:p-6 pb-20 sm:pb-6">
          {children}
        </Box>
      </Box>
    </Box>
  );
};

DashboardLayout.displayName = "DashboardLayout";

// NavLink component
const NavLink: React.FC<{ item: NavItem; currentPath: string }> = ({
  item,
  currentPath,
}) => {
  const isActive =
    currentPath === item.href || currentPath.startsWith(item.href + "/");

  const iconClassName = cn(
    "h-5 w-5",
    isActive
      ? "text-primary-foreground"
      : "text-muted-foreground",
  );

  return (
    <Link
      to={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {item.icon && (
        typeof item.icon === 'string'
          ? <AlmadarIcon name={item.icon} className={iconClassName} />
          : <item.icon className={iconClassName} />
      )}
      <Typography
        variant="small"
        color={isActive ? 'inherit' : 'primary'}
        className="flex-1"
        as="span"
      >
        {item.label}
      </Typography>
      {item.badge && (
        <Badge variant={isActive ? "primary" : "default"} size="sm">
          {item.badge}
        </Badge>
      )}
    </Link>
  );
};

NavLink.displayName = "NavLink";
