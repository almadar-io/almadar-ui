'use client';
import * as React from "react";
import type { EventKey, EventPayload, Asset } from "@almadar/core";
import { cn } from "../../../lib/cn";
import { useEventBus } from "../../../hooks/useEventBus";
import { Box } from "../../core/atoms/Box";
import { Typography } from "../../core/atoms/Typography";
import { GameIcon } from "../atoms/GameIcon";
import { ChoiceButton } from "../atoms/ChoiceButton";

export type MenuOption = EventPayload & {
  /** Optional ID (generated from index if not provided) */
  id?: string;
  /** Display label */
  label: string;
  /** Event to emit on click */
  event?: string;
  /** Page to navigate to */
  navigatesTo?: string;
  /** Button variant */
  variant?: "primary" | "secondary" | "ghost" | string;
  /** Whether the option is disabled */
  disabled?: boolean;
  /** Sub-label or description */
  subLabel?: string;
  /** Action identifier (alternative to event) */
  action?: EventKey;
}

export interface GameMenuProps {
  /** Menu title */
  title: string;
  /** Optional subtitle or version */
  subtitle?: string;
  /** Menu options - accepts readonly for compatibility with generated const arrays */
  options?: readonly MenuOption[];
  /** Alias for options (schema compatibility) */
  menuItems?: readonly MenuOption[];
  /** Called when an option is selected (legacy callback, prefer event bus) */
  onSelect?: (option: MenuOption) => void;
  /** Background image or gradient */
  background?: string;
  /** Logo asset */
  logo?: Asset;
  /** Additional CSS classes */
  className?: string;
}

const DEFAULT_MENU_OPTIONS: MenuOption[] = [
  { label: 'New Game', event: 'NEW_GAME', variant: 'primary' },
  { label: 'Continue', event: 'CONTINUE', variant: 'secondary' },
  { label: 'Settings', event: 'SETTINGS', variant: 'ghost' },
];

export function GameMenu({
  title = 'Epic Quest',
  subtitle,
  options,
  menuItems,
  onSelect,
  background,
  logo,
  className,
}: GameMenuProps) {
  // Resolve alias: menuItems → options
  const resolvedOptions = options ?? menuItems ?? DEFAULT_MENU_OPTIONS;

  const eventBus = useEventBus();

  const handleOptionClick = React.useCallback(
    (option: MenuOption) => {
      // Emit event to event bus for closed circuit pattern
      if (option.event) {
        eventBus.emit(`UI:${option.event}`, { option });
      }

      // Call legacy callback if provided
      if (onSelect) {
        onSelect(option);
      }

      // Handle navigation if navigatesTo is specified
      if (option.navigatesTo) {
        eventBus.emit('UI:NAVIGATE', { url: option.navigatesTo, option });
      }
    },
    [eventBus, onSelect],
  );

  return (
    <Box
      className={cn(
        "min-h-screen w-full flex flex-col items-center justify-center p-8",
        className,
      )}
      style={{
        background:
          background ??
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0e17 100%)",
      }}
    >
      {/* Logo/Title Section */}
      <Box className="text-center mb-12 animate-fade-in">
        {logo && (
          <GameIcon assetUrl={logo} icon="image" size={96} alt={title} className="h-24 w-auto mx-auto mb-6 drop-shadow-2xl" />
        )}
        <Typography
          variant="h1"
          className="text-5xl md:text-7xl font-bold text-[var(--color-foreground)] tracking-tight"
          style={{
            textShadow: "0 4px 12px rgba(0,0,0,0.5)",
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body" className="mt-2 text-lg text-muted-foreground tracking-widest uppercase">
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Menu Options */}
      <Box className="flex flex-col gap-4 w-full max-w-md">
        {resolvedOptions.map((option, index) => (
          <ChoiceButton
            key={index}
            text={option.label}
            index={index + 1}
            disabled={option.disabled}
            onClick={() => handleOptionClick(option)}
            className="text-lg py-4 px-8"
          />
        ))}
      </Box>

      {/* Decorative Elements */}
      <Box position="absolute" className="inset-0 pointer-events-none overflow-hidden">
        <Box position="absolute" className="top-1/4 left-1/4 w-64 h-64 bg-info/10 rounded-container blur-3xl" />
        <Box position="absolute" className="bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-container blur-3xl" />
      </Box>
    </Box>
  );
}

GameMenu.displayName = "GameMenu";
