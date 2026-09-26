'use client';
/**
 * TopNavItem — one item of a horizontal top navigation bar, shared by Header
 * and DashboardLayout's `topnav` mode.
 *
 * A plain item follows its `href` (in-app path through the nav stack, `#anchor`,
 * or absolute URL — see `followHref`). An item with `children` renders a
 * dropdown of its children instead; the parent reads as active when it or one
 * of its children is the active page.
 */
import React, { useState } from 'react';
import { cn } from '../../../lib/cn';
import { followHref } from '../../../lib/followHref';
import { useNavStack } from '../../../providers/NavStackContext';
import type { IconInput } from '../atoms/Icon';
import { Icon } from '../atoms/Icon';
import { Box } from '../atoms/Box';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Typography } from '../atoms/Typography';

export interface TopNavItemData {
  label: string;
  href?: string;
  icon?: IconInput;
  badge?: string | number;
  /** Marks this item active regardless of `activeHref`. */
  active?: boolean;
  /** Own click handler; takes precedence over following `href`. */
  onClick?: () => void;
  /** Child items shown in a dropdown. */
  children?: TopNavItemData[];
}

export interface TopNavItemProps {
  item: TopNavItemData;
  /** The href of the active page, used to mark the item (or its parent) active. */
  activeHref?: string;
  /** Active styling: `solid` fills with the primary colour (dashboard top bar); `soft` tints it (site header). */
  tone?: 'solid' | 'soft';
  className?: string;
}

function ItemIcon({ icon }: { icon: IconInput }): React.ReactElement {
  return typeof icon === 'string' ? <Icon name={icon} className="h-4 w-4" /> : <Icon icon={icon} className="h-4 w-4" />;
}

export function TopNavItem({ item, activeHref, tone = 'solid', className }: TopNavItemProps): React.ReactElement {
  const navStack = useNavStack();
  const [open, setOpen] = useState(false);
  const children = item.children ?? [];
  const hasChildren = children.length > 0;
  const isActive =
    item.active === true ||
    (item.href !== undefined && item.href === activeHref) ||
    children.some((child) => child.active === true || (child.href !== undefined && child.href === activeHref));

  const follow = (target: TopNavItemData): void => {
    if (target.onClick) target.onClick();
    else if (target.href !== undefined) followHref(target.href, navStack);
  };

  const triggerClass = cn(
    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
    isActive
      ? tone === 'solid' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-primary/10 text-primary'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    className,
  );

  const content = (
    <>
      {item.icon && <ItemIcon icon={item.icon} />}
      <Typography variant="small" color="inherit" className="flex-1" as="span">
        {item.label}
      </Typography>
      {item.badge !== undefined && (
        <Badge variant={isActive ? 'primary' : 'default'} size="sm">
          {item.badge}
        </Badge>
      )}
    </>
  );

  if (!hasChildren) {
    return (
      <Button variant="ghost" data-active={isActive ? 'true' : 'false'} className={triggerClass} onClick={() => follow(item)}>
        {content}
      </Button>
    );
  }

  return (
    <Box className="relative">
      <Button
        variant="ghost"
        aria-expanded={open}
        aria-haspopup="menu"
        data-active={isActive ? 'true' : 'false'}
        className={triggerClass}
        onClick={() => setOpen(!open)}
      >
        {content}
        <Icon name="chevron-down" className={cn('h-3.5 w-3.5 shrink-0 transition-transform', open && 'rotate-180')} />
      </Button>
      {open && (
        <>
          <Box className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <Box
            role="menu"
            className="absolute start-0 top-full mt-1 min-w-48 bg-card rounded-lg shadow-lg border border-border py-1 z-30"
          >
            {children.map((child) => {
              const childActive = child.active === true || (child.href !== undefined && child.href === activeHref);
              return (
                <Button
                  key={child.href ?? child.label}
                  role="menuitem"
                  variant="ghost"
                  data-active={childActive ? 'true' : 'false'}
                  onClick={() => {
                    setOpen(false);
                    follow(child);
                  }}
                  className={cn(
                    'flex w-full items-center justify-start gap-2 rounded-none px-3 py-2 text-sm transition-colors',
                    childActive ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {child.icon && <ItemIcon icon={child.icon} />}
                  <Typography variant="small" className="flex-1 text-start" as="span">
                    {child.label}
                  </Typography>
                  {child.badge !== undefined && (
                    <Badge variant={childActive ? 'primary' : 'default'} size="sm">
                      {child.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
}

TopNavItem.displayName = 'TopNavItem';
