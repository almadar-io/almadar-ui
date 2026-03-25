import React from "react";
import { cn } from "../../lib/cn";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Label text content */
  text?: string;
  /** Associated input element ID */
  htmlFor?: string;
  /** Show required indicator */
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "block text-sm font-bold text-foreground",
          className,
        )}
        {...props}
      >
        {children}
        {required && <span className="text-error ml-1">*</span>}
      </label>
    );
  },
);

Label.displayName = "Label";
