import React from "react";
import { cn } from "../../lib/cn";

export type CardShadow = "none" | "sm" | "md" | "lg";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
  /** Card title - renders in header if provided */
  title?: string;
  /** Card subtitle - renders below title */
  subtitle?: string;
  /** Shadow size override */
  shadow?: CardShadow;
  /** Card content */
  children?: React.ReactNode;
}

// Using CSS variables for theme-aware styling
const variantStyles = {
  default: [
    "bg-card",
    "border-[length:var(--border-width)] border-border",
    "shadow-elevation-card",
    "transition-all duration-[var(--transition-normal)]",
    "hover:shadow-elevation-dialog hover:translate-y-[var(--hover-translate-y)]",
  ].join(" "),
  bordered: [
    "bg-card",
    "border-[length:var(--border-width)] border-border",
    "shadow-elevation-card",
    "transition-all duration-[var(--transition-normal)]",
    "hover:shadow-elevation-dialog hover:translate-y-[var(--hover-translate-y)]",
  ].join(" "),
  elevated: [
    "bg-card",
    "border-[length:var(--border-width)] border-border",
    "shadow",
    "transition-all duration-[var(--transition-normal)]",
    "hover:shadow-elevation-dialog hover:translate-y-[var(--hover-translate-y)]",
  ].join(" "),
  // Interactive variant with theme-specific hover effects
  interactive: [
    "bg-card",
    "border-[length:var(--border-width)] border-border",
    "shadow",
    "cursor-pointer",
    "transition-all duration-[var(--transition-normal)]",
    "hover:shadow-elevation-dialog",
  ].join(" "),
};

const paddingStyles = {
  none: "",
  sm: "p-card-sm",
  md: "p-card-md",
  lg: "p-card-lg",
};

const shadowStyles: Record<CardShadow, string> = {
  none: "shadow-none",
  sm: "shadow-elevation-card",
  md: "shadow",
  lg: "shadow-elevation-dialog",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "bordered",
      padding = "md",
      title,
      subtitle,
      shadow,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-container",
          "transition-all duration-[var(--transition-normal)]",
          variantStyles[variant],
          paddingStyles[padding],
          shadow && shadowStyles[shadow],
          className,
        )}
        {...props}
      >
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-lg text-card-foreground font-bold">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

// Card subcomponents
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mb-4", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg text-card-foreground",
      "font-bold",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
CardContent.displayName = "CardContent";

// Alias for CardBody (used by shared component-types)
export const CardBody = CardContent;
CardBody.displayName = "CardBody";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-4 flex items-center", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
