import React from "react";
import { cn } from "../../lib/cn";
import { VStack } from "./Stack";
import { Typography } from "./Typography";
import type { TypographyVariant } from "./Typography";

export interface SectionHeaderProps {
  /** Section title text */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Text alignment */
  align?: "center" | "left" | "right";
  /** Heading level (1, 2, or 3) */
  level?: 1 | 2 | 3;
  /** Additional class names */
  className?: string;
}

const levelToVariant: Record<1 | 2 | 3, TypographyVariant> = {
  1: "h1",
  2: "h2",
  3: "h3",
};

const alignClasses: Record<string, string> = {
  center: "text-center",
  left: "text-left",
  right: "text-right",
};

const alignToStack: Record<string, "center" | "start" | "end"> = {
  center: "center",
  left: "start",
  right: "end",
};

export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ title, subtitle, align = "center", level = 2, className }, ref) => {
    const variant = levelToVariant[level];

    return (
      <VStack
        ref={ref}
        gap="sm"
        align={alignToStack[align]}
        className={cn(alignClasses[align], className)}
      >
        <Typography variant={variant} weight="bold">
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body" color="muted">
            {subtitle}
          </Typography>
        ) : null}
      </VStack>
    );
  },
);

SectionHeader.displayName = "SectionHeader";
