import React from "react";
import { cn } from "../../lib/cn";
import { Box } from "./Box";

export type ContentSectionBackground = "default" | "alt" | "dark" | "gradient";
export type ContentSectionPadding = "sm" | "md" | "lg";

export interface ContentSectionProps {
  /** Section content */
  children: React.ReactNode;
  /** Background style */
  background?: ContentSectionBackground;
  /** Vertical padding size */
  padding?: ContentSectionPadding;
  /** HTML id for anchor linking */
  id?: string;
  /** Additional class names */
  className?: string;
}

const backgroundClasses: Record<ContentSectionBackground, string> = {
  default: "",
  alt: "bg-surface",
  dark: "bg-foreground text-background",
  gradient: [
    "bg-gradient-to-b",
    "from-[var(--color-primary)]/5",
    "to-[var(--color-secondary)]/5",
  ].join(" "),
};

const paddingClasses: Record<ContentSectionPadding, string> = {
  sm: "py-12",
  md: "py-16",
  lg: "py-24",
};

export const ContentSection = React.forwardRef<HTMLDivElement, ContentSectionProps>(
  ({ children, background = "default", padding = "lg", id, className }, ref) => {
    return (
      <Box
        ref={ref as React.Ref<HTMLDivElement>}
        as="section"
        id={id}
        className={cn(
          backgroundClasses[background],
          paddingClasses[padding],
          className,
        )}
      >
        <Box className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </Box>
      </Box>
    );
  },
);

ContentSection.displayName = "ContentSection";
