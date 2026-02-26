import { useTheme, useUISlots } from './chunk-BTXQJGFB.js';
import { cn, debugGroup, debug, debugGroupEnd, getNestedValue, isDebugEnabled } from './chunk-KKCVDUK7.js';
import { useTranslate, useQuerySingleton, useEntityList } from './chunk-PE2H3NAW.js';
import { useEventBus } from './chunk-YXZM3WCF.js';
import { __publicField } from './chunk-PKBMQBKP.js';
import * as React41 from 'react';
import React41__default, { useCallback, useRef, useState, useLayoutEffect, useEffect, createContext, useMemo, useContext, Suspense } from 'react';
import * as LucideIcons from 'lucide-react';
import { Loader2, ChevronDown, X, Check, Copy, AlertCircle, User, Sun, Moon, FileQuestion, Inbox, Search, Info, XCircle, CheckCircle, AlertTriangle, ChevronRight, Filter, Plus, ChevronLeft, HelpCircle, ChevronUp, MoreHorizontal, TrendingUp, TrendingDown, Minus, ArrowLeft, Calendar, Tag, Clock, CheckCircle2, DollarSign, FileText, Package } from 'lucide-react';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { evaluate, createMinimalContext } from '@almadar/evaluator';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

var variantStyles = {
  primary: [
    "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
    "border-[length:var(--border-width)] border-[var(--color-border)]",
    "shadow-[var(--shadow-sm)]",
    "hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-hover)]",
    "active:scale-[var(--active-scale)] active:shadow-[var(--shadow-active)]"
  ].join(" "),
  secondary: [
    "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
    "border-[length:var(--border-width-thin)] border-[var(--color-border)]",
    "hover:bg-[var(--color-secondary-hover)]",
    "active:scale-[var(--active-scale)]"
  ].join(" "),
  ghost: [
    "bg-transparent text-[var(--color-muted-foreground)]",
    "hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)]",
    "active:scale-[var(--active-scale)]"
  ].join(" "),
  danger: [
    "bg-[var(--color-surface)] text-[var(--color-error)]",
    "border-[length:var(--border-width)] border-[var(--color-error)]",
    "shadow-[var(--shadow-sm)]",
    "hover:bg-[var(--color-error)] hover:text-[var(--color-error-foreground)] hover:shadow-[var(--shadow-hover)]",
    "active:scale-[var(--active-scale)] active:shadow-[var(--shadow-active)]"
  ].join(" "),
  success: [
    "bg-[var(--color-surface)] text-[var(--color-success)]",
    "border-[length:var(--border-width)] border-[var(--color-success)]",
    "shadow-[var(--shadow-sm)]",
    "hover:bg-[var(--color-success)] hover:text-[var(--color-success-foreground)] hover:shadow-[var(--shadow-hover)]",
    "active:scale-[var(--active-scale)] active:shadow-[var(--shadow-active)]"
  ].join(" "),
  warning: [
    "bg-[var(--color-surface)] text-[var(--color-warning)]",
    "border-[length:var(--border-width)] border-[var(--color-warning)]",
    "shadow-[var(--shadow-sm)]",
    "hover:bg-[var(--color-warning)] hover:text-[var(--color-warning-foreground)] hover:shadow-[var(--shadow-hover)]",
    "active:scale-[var(--active-scale)] active:shadow-[var(--shadow-active)]"
  ].join(" "),
  // "default" is an alias for secondary
  default: [
    "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
    "border-[length:var(--border-width-thin)] border-[var(--color-border)]",
    "hover:bg-[var(--color-secondary-hover)]",
    "active:scale-[var(--active-scale)]"
  ].join(" ")
};
var sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base"
};
var iconSizeStyles = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5"
};
var Button = React41__default.forwardRef(
  ({
    className,
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled,
    leftIcon,
    rightIcon,
    icon: IconComponent,
    iconRight: IconRightComponent,
    action,
    actionPayload,
    label,
    children,
    onClick,
    ...props
  }, ref) => {
    const eventBus = useEventBus();
    const resolvedLeftIcon = leftIcon || IconComponent && /* @__PURE__ */ jsx(IconComponent, { className: iconSizeStyles[size] });
    const resolvedRightIcon = rightIcon || IconRightComponent && /* @__PURE__ */ jsx(IconRightComponent, { className: iconSizeStyles[size] });
    const handleClick = (e) => {
      if (action) {
        eventBus.emit(`UI:${action}`, actionPayload ?? {});
      }
      onClick?.(e);
    };
    return /* @__PURE__ */ jsxs(
      "button",
      {
        ref,
        disabled: disabled || isLoading,
        className: cn(
          "inline-flex items-center justify-center gap-2",
          "font-[var(--font-weight-medium)]",
          "rounded-[var(--radius-sm)]",
          "transition-all duration-[var(--transition-normal)]",
          "focus:outline-none focus:ring-[length:var(--focus-ring-width)] focus:ring-[var(--color-ring)] focus:ring-offset-[length:var(--focus-ring-offset)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        ),
        onClick: handleClick,
        ...props,
        children: [
          isLoading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : resolvedLeftIcon && /* @__PURE__ */ jsx("span", { className: "flex-shrink-0", children: resolvedLeftIcon }),
          children || label,
          resolvedRightIcon && !isLoading && /* @__PURE__ */ jsx("span", { className: "flex-shrink-0", children: resolvedRightIcon })
        ]
      }
    );
  }
);
Button.displayName = "Button";
var Input = React41__default.forwardRef(
  ({
    className,
    inputType,
    type: htmlType,
    error,
    leftIcon,
    rightIcon,
    icon: IconComponent,
    clearable,
    onClear,
    value,
    options,
    rows = 3,
    onChange,
    ...props
  }, ref) => {
    const type = inputType || htmlType || "text";
    const resolvedLeftIcon = leftIcon || IconComponent && /* @__PURE__ */ jsx(IconComponent, { className: "h-4 w-4" });
    const showClearButton = clearable && value && String(value).length > 0;
    const baseClassName = cn(
      "block w-full rounded-[var(--radius-sm)] transition-all duration-[var(--transition-fast)]",
      "border-[length:var(--border-width-thin)] border-[var(--color-border)]",
      "px-3 py-2 text-sm",
      "bg-[var(--color-card)] hover:bg-[var(--color-muted)] focus:bg-[var(--color-card)]",
      "text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]",
      "focus:outline-none focus:ring-1 focus:ring-[var(--color-ring)] focus:border-[var(--color-ring)]",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--color-muted)]",
      error ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]" : "",
      resolvedLeftIcon && "pl-10",
      (rightIcon || showClearButton) && "pr-10",
      className
    );
    if (type === "select") {
      return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        resolvedLeftIcon && /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-muted-foreground)]", children: resolvedLeftIcon }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            ref,
            value,
            onChange,
            className: cn(baseClassName, "appearance-none pr-10", className),
            ...props,
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Select..." }),
              options?.map((opt) => /* @__PURE__ */ jsx("option", { value: opt.value, children: opt.label }, opt.value))
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--color-muted-foreground)]", children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" }) })
      ] });
    }
    if (type === "textarea") {
      return /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx(
        "textarea",
        {
          ref,
          value,
          onChange,
          rows,
          className: baseClassName,
          ...props
        }
      ) });
    }
    if (type === "checkbox") {
      return /* @__PURE__ */ jsx(
        "input",
        {
          ref,
          type: "checkbox",
          checked: props.checked,
          onChange,
          className: cn(
            "h-4 w-4 rounded-[var(--radius-sm)]",
            "border-[var(--color-border)]",
            "text-[var(--color-primary)] focus:ring-[var(--color-ring)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          ),
          ...props
        }
      );
    }
    return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      resolvedLeftIcon && /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-muted-foreground)]", children: resolvedLeftIcon }),
      /* @__PURE__ */ jsx(
        "input",
        {
          ref,
          type,
          value,
          onChange,
          className: baseClassName,
          ...props
        }
      ),
      showClearButton && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onClear,
          className: "absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
          children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
        }
      ),
      rightIcon && !showClearButton && /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-muted-foreground)]", children: rightIcon })
    ] });
  }
);
Input.displayName = "Input";
var Label = React41__default.forwardRef(
  ({ className, required, children, ...props }, ref) => {
    return /* @__PURE__ */ jsxs(
      "label",
      {
        ref,
        className: cn(
          "block text-sm font-bold text-[var(--color-foreground)]",
          className
        ),
        ...props,
        children: [
          children,
          required && /* @__PURE__ */ jsx("span", { className: "text-[var(--color-error)] ml-1", children: "*" })
        ]
      }
    );
  }
);
Label.displayName = "Label";
var Textarea = React41__default.forwardRef(
  ({ className, error, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        ref,
        className: cn(
          "block w-full border-[length:var(--border-width)] shadow-[var(--shadow-sm)]",
          "px-3 py-2 text-sm text-[var(--color-foreground)]",
          "bg-[var(--color-card)]",
          "placeholder:text-[var(--color-placeholder)]",
          "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--color-ring)]",
          "disabled:bg-[var(--color-muted)] disabled:text-[var(--color-muted-foreground)] disabled:cursor-not-allowed",
          "resize-y min-h-[80px]",
          error ? "border-[var(--color-error)] focus:border-[var(--color-error)]" : "border-[var(--color-border)] focus:border-[var(--color-primary)]",
          className
        ),
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
var Select = React41__default.forwardRef(
  ({ className, options, placeholder, error, ...props }, ref) => {
    return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxs(
        "select",
        {
          ref,
          className: cn(
            "block w-full border-[length:var(--border-width)] shadow-[var(--shadow-sm)] appearance-none",
            "px-3 py-2 pr-10 text-sm text-[var(--color-foreground)] font-medium",
            "bg-[var(--color-card)]",
            "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--color-ring)]",
            "disabled:bg-[var(--color-muted)] disabled:text-[var(--color-muted-foreground)] disabled:cursor-not-allowed",
            error ? "border-[var(--color-error)] focus:border-[var(--color-error)]" : "border-[var(--color-border)] focus:border-[var(--color-primary)]",
            className
          ),
          ...props,
          children: [
            placeholder && /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: placeholder }),
            options.map((option) => /* @__PURE__ */ jsx(
              "option",
              {
                value: option.value,
                disabled: option.disabled,
                children: option.label
              },
              option.value
            ))
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 text-[var(--color-foreground)]" }) })
    ] });
  }
);
Select.displayName = "Select";
var Checkbox = React41__default.forwardRef(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsx("div", { className: "relative flex items-center", children: /* @__PURE__ */ jsx(
        "input",
        {
          ref,
          type: "checkbox",
          id: inputId,
          className: cn(
            "peer h-4 w-4 border-[length:var(--border-width)] border-[var(--color-border)]",
            "accent-[var(--color-primary)] focus:ring-[var(--color-ring)] focus:ring-offset-0",
            "bg-[var(--color-card)] checked:bg-[var(--color-primary)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          ),
          ...props
        }
      ) }),
      label && /* @__PURE__ */ jsx(
        "label",
        {
          htmlFor: inputId,
          className: "ml-2 text-sm text-[var(--color-foreground)] font-medium cursor-pointer select-none",
          children: label
        }
      )
    ] });
  }
);
Checkbox.displayName = "Checkbox";
var variantStyles2 = {
  default: "bg-[var(--color-card)] border-none",
  bordered: [
    "bg-[var(--color-card)]",
    "border-[length:var(--border-width)] border-[var(--color-border)]",
    "shadow-none"
  ].join(" "),
  elevated: [
    "bg-[var(--color-card)]",
    "border-[length:var(--border-width)] border-[var(--color-border)]",
    "shadow-[var(--shadow-main)]"
  ].join(" "),
  // Interactive variant with theme-specific hover effects
  interactive: [
    "bg-[var(--color-card)]",
    "border-[length:var(--border-width)] border-[var(--color-border)]",
    "shadow-[var(--shadow-main)]",
    "cursor-pointer",
    "transition-all duration-[var(--transition-normal)]",
    "hover:shadow-[var(--shadow-hover)]"
  ].join(" ")
};
var paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6"
};
var shadowStyles = {
  none: "shadow-none",
  sm: "shadow-[var(--shadow-sm)]",
  md: "shadow-[var(--shadow-main)]",
  lg: "shadow-[var(--shadow-lg)]"
};
var Card = React41__default.forwardRef(
  ({
    className,
    variant = "bordered",
    padding = "md",
    title,
    subtitle,
    shadow,
    children,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ref,
        className: cn(
          "rounded-[var(--radius-md)]",
          "transition-all duration-[var(--transition-normal)]",
          variantStyles2[variant],
          paddingStyles[padding],
          shadow && shadowStyles[shadow],
          className
        ),
        ...props,
        children: [
          (title || subtitle) && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
            title && /* @__PURE__ */ jsx("h3", { className: "text-lg text-[var(--color-card-foreground)] font-[var(--font-weight-bold)]", children: title }),
            subtitle && /* @__PURE__ */ jsx("p", { className: "text-sm text-[var(--color-muted-foreground)] mt-1", children: subtitle })
          ] }),
          children
        ]
      }
    );
  }
);
Card.displayName = "Card";
var CardHeader = React41__default.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("mb-4", className), ...props }));
CardHeader.displayName = "CardHeader";
var CardTitle = React41__default.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "h3",
  {
    ref,
    className: cn(
      "text-lg text-[var(--color-card-foreground)]",
      "font-[var(--font-weight-bold)]",
      className
    ),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
var CardContent = React41__default.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("", className), ...props }));
CardContent.displayName = "CardContent";
var CardBody = CardContent;
CardBody.displayName = "CardBody";
var CardFooter = React41__default.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("mt-4 flex items-center", className),
    ...props
  }
));
CardFooter.displayName = "CardFooter";
var variantStyles3 = {
  default: [
    "bg-[var(--color-muted)] text-[var(--color-foreground)]",
    "border-[length:var(--border-width-thin)] border-[var(--color-border)]"
  ].join(" "),
  primary: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
  secondary: "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
  success: [
    "bg-[var(--color-surface)] text-[var(--color-success)]",
    "border-[length:var(--border-width)] border-[var(--color-success)]"
  ].join(" "),
  warning: [
    "bg-[var(--color-surface)] text-[var(--color-warning)]",
    "border-[length:var(--border-width)] border-[var(--color-warning)]"
  ].join(" "),
  danger: [
    "bg-[var(--color-surface)] text-[var(--color-error)]",
    "border-[length:var(--border-width)] border-[var(--color-error)]"
  ].join(" "),
  error: [
    "bg-[var(--color-surface)] text-[var(--color-error)]",
    "border-[length:var(--border-width)] border-[var(--color-error)]"
  ].join(" "),
  info: [
    "bg-[var(--color-surface)] text-[var(--color-info)]",
    "border-[length:var(--border-width)] border-[var(--color-info)]"
  ].join(" "),
  neutral: [
    "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
    "border-[length:var(--border-width-thin)] border-[var(--color-border)]"
  ].join(" ")
};
var sizeStyles2 = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base"
};
var Badge = React41__default.forwardRef(
  ({ className, variant = "default", size = "sm", ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "span",
      {
        ref,
        className: cn(
          "inline-flex items-center font-bold rounded-[var(--radius-sm)]",
          variantStyles3[variant],
          sizeStyles2[size],
          className
        ),
        ...props
      }
    );
  }
);
Badge.displayName = "Badge";
var sizeStyles3 = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8"
};
var Spinner = React41__default.forwardRef(
  ({ className, size = "md", ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        className: cn("text-[var(--color-foreground)]", className),
        ...props,
        children: /* @__PURE__ */ jsx(Loader2, { className: cn("animate-spin", sizeStyles3[size]) })
      }
    );
  }
);
Spinner.displayName = "Spinner";
var sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl"
};
var iconSizeClasses = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8"
};
var statusSizeClasses = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
  xl: "w-4 h-4"
};
var statusClasses = {
  online: "bg-[var(--color-success)]",
  offline: "bg-[var(--color-muted-foreground)]",
  away: "bg-[var(--color-warning)]",
  busy: "bg-[var(--color-error)]"
};
var badgeSizeClasses = {
  xs: "w-3 h-3 text-[8px]",
  sm: "w-4 h-4 text-[10px]",
  md: "w-5 h-5 text-xs",
  lg: "w-6 h-6 text-sm",
  xl: "w-7 h-7 text-base"
};
function generateInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
var Avatar = ({
  src,
  alt,
  name,
  initials: providedInitials,
  icon: Icon2,
  size = "md",
  status,
  badge,
  className,
  onClick,
  action,
  actionPayload
}) => {
  const eventBus = useEventBus();
  const initials = providedInitials ?? (name ? generateInitials(name) : void 0);
  const hasImage = !!src;
  const hasInitials = !!initials;
  const hasIcon = !!Icon2;
  const getInitialsBackground = () => "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]";
  const isClickable = action || onClick;
  const handleClick = () => {
    if (action) {
      eventBus.emit(`UI:${action}`, actionPayload ?? {});
    }
    onClick?.();
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative inline-block", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(
          "relative inline-flex items-center justify-center",
          "bg-[var(--color-muted)] border-[length:var(--border-width)] border-[var(--color-border)]",
          "overflow-hidden",
          sizeClasses[size],
          isClickable && "cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors",
          className
        ),
        onClick: isClickable ? handleClick : void 0,
        role: isClickable ? "button" : void 0,
        tabIndex: isClickable ? 0 : void 0,
        children: hasImage ? /* @__PURE__ */ jsx(
          "img",
          {
            src,
            alt: alt || "Avatar",
            className: "w-full h-full object-cover",
            onError: (e) => {
              const target = e.target;
              target.style.display = "none";
            }
          }
        ) : hasInitials ? /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "w-full h-full flex items-center justify-center font-bold",
              getInitialsBackground()
            ),
            children: initials.substring(0, 2).toUpperCase()
          }
        ) : hasIcon ? /* @__PURE__ */ jsx(
          Icon2,
          {
            className: cn(
              "text-[var(--color-foreground)]",
              iconSizeClasses[size]
            )
          }
        ) : /* @__PURE__ */ jsx(
          User,
          {
            className: cn(
              "text-[var(--color-foreground)]",
              iconSizeClasses[size]
            )
          }
        )
      }
    ),
    status && /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(
          "absolute bottom-0 right-0 border-2 border-[var(--color-card)]",
          statusClasses[status],
          statusSizeClasses[size]
        ),
        "aria-label": `Status: ${status}`
      }
    ),
    badge !== void 0 && /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(
          "absolute -top-1 -right-1 flex items-center justify-center",
          "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-bold",
          "border-2 border-[var(--color-card)]",
          badgeSizeClasses[size]
        ),
        "aria-label": `Badge: ${badge}`,
        children: typeof badge === "number" && badge > 99 ? "99+" : badge
      }
    )
  ] });
};
Avatar.displayName = "Avatar";
var paddingStyles2 = {
  none: "p-0",
  xs: "p-1",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
  "2xl": "p-12"
};
var paddingXStyles = {
  none: "px-0",
  xs: "px-1",
  sm: "px-2",
  md: "px-4",
  lg: "px-6",
  xl: "px-8",
  "2xl": "px-12"
};
var paddingYStyles = {
  none: "py-0",
  xs: "py-1",
  sm: "py-2",
  md: "py-4",
  lg: "py-6",
  xl: "py-8",
  "2xl": "py-12"
};
var marginStyles = {
  none: "m-0",
  xs: "m-1",
  sm: "m-2",
  md: "m-4",
  lg: "m-6",
  xl: "m-8",
  "2xl": "m-12",
  auto: "m-auto"
};
var marginXStyles = {
  none: "mx-0",
  xs: "mx-1",
  sm: "mx-2",
  md: "mx-4",
  lg: "mx-6",
  xl: "mx-8",
  "2xl": "mx-12",
  auto: "mx-auto"
};
var marginYStyles = {
  none: "my-0",
  xs: "my-1",
  sm: "my-2",
  md: "my-4",
  lg: "my-6",
  xl: "my-8",
  "2xl": "my-12",
  auto: "my-auto"
};
var bgStyles = {
  transparent: "bg-transparent",
  primary: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
  secondary: "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
  muted: "bg-[var(--color-muted)] text-[var(--color-foreground)]",
  accent: "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]",
  surface: "bg-[var(--color-card)]",
  overlay: "bg-[var(--color-card)]/80 backdrop-blur-sm"
};
var roundedStyles = {
  none: "rounded-none",
  sm: "rounded-[var(--radius-sm)]",
  md: "rounded-[var(--radius-md)]",
  lg: "rounded-[var(--radius-lg)]",
  xl: "rounded-[var(--radius-xl)]",
  "2xl": "rounded-[var(--radius-xl)]",
  full: "rounded-[var(--radius-full)]"
};
var shadowStyles2 = {
  none: "shadow-none",
  sm: "shadow-[var(--shadow-sm)]",
  md: "shadow-[var(--shadow-main)]",
  lg: "shadow-[var(--shadow-lg)]",
  xl: "shadow-[var(--shadow-lg)]"
};
var displayStyles = {
  block: "block",
  inline: "inline",
  "inline-block": "inline-block",
  flex: "flex",
  "inline-flex": "inline-flex",
  grid: "grid"
};
var overflowStyles = {
  auto: "overflow-auto",
  hidden: "overflow-hidden",
  visible: "overflow-visible",
  scroll: "overflow-scroll"
};
var positionStyles = {
  relative: "relative",
  absolute: "absolute",
  fixed: "fixed",
  sticky: "sticky"
};
var Box = React41__default.forwardRef(
  ({
    padding,
    paddingX,
    paddingY,
    margin,
    marginX,
    marginY,
    bg = "transparent",
    border = false,
    rounded = "none",
    shadow = "none",
    display,
    fullWidth = false,
    fullHeight = false,
    overflow,
    position,
    className,
    children,
    as: Component = "div",
    action,
    actionPayload,
    hoverEvent,
    onClick,
    onMouseEnter,
    onMouseLeave,
    ...rest
  }, ref) => {
    const eventBus = useEventBus();
    const handleClick = useCallback((e) => {
      if (action) {
        eventBus.emit(`UI:${action}`, actionPayload ?? {});
      }
      onClick?.(e);
    }, [action, actionPayload, eventBus, onClick]);
    const handleMouseEnter = useCallback((e) => {
      if (hoverEvent) {
        eventBus.emit(`UI:${hoverEvent}`, { hovered: true });
      }
      onMouseEnter?.(e);
    }, [hoverEvent, eventBus, onMouseEnter]);
    const handleMouseLeave = useCallback((e) => {
      if (hoverEvent) {
        eventBus.emit(`UI:${hoverEvent}`, { hovered: false });
      }
      onMouseLeave?.(e);
    }, [hoverEvent, eventBus, onMouseLeave]);
    const isClickable = action || onClick;
    return /* @__PURE__ */ jsx(
      Component,
      {
        ref,
        className: cn(
          // Padding
          padding && paddingStyles2[padding],
          paddingX && paddingXStyles[paddingX],
          paddingY && paddingYStyles[paddingY],
          // Margin
          margin && marginStyles[margin],
          marginX && marginXStyles[marginX],
          marginY && marginYStyles[marginY],
          // Background
          bgStyles[bg],
          // Border - uses theme variables
          border && "border-[length:var(--border-width)] border-[var(--color-border)]",
          // Rounded
          roundedStyles[rounded],
          // Shadow
          shadowStyles2[shadow],
          // Display
          display && displayStyles[display],
          // Dimensions
          fullWidth && "w-full",
          fullHeight && "h-full",
          // Overflow
          overflow && overflowStyles[overflow],
          // Position
          position && positionStyles[position],
          // Cursor for clickable
          isClickable && "cursor-pointer",
          className
        ),
        onClick: isClickable ? handleClick : void 0,
        onMouseEnter: hoverEvent || onMouseEnter ? handleMouseEnter : void 0,
        onMouseLeave: hoverEvent || onMouseLeave ? handleMouseLeave : void 0,
        ...rest,
        children
      }
    );
  }
);
Box.displayName = "Box";
var Center = ({
  inline = false,
  horizontal = true,
  vertical = true,
  minHeight,
  fullHeight = false,
  fullWidth = false,
  className,
  style,
  children,
  as: Component = "div"
}) => {
  const mergedStyle = minHeight ? { minHeight, ...style } : style;
  return /* @__PURE__ */ jsx(
    Component,
    {
      className: cn(
        inline ? "inline-flex" : "flex",
        horizontal && "justify-center",
        vertical && "items-center",
        fullHeight && "h-full",
        fullWidth && "w-full",
        className
      ),
      style: mergedStyle,
      children
    }
  );
};
var variantStyles4 = {
  solid: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted"
};
var Divider = ({
  orientation = "horizontal",
  label,
  variant = "solid",
  className
}) => {
  if (orientation === "vertical") {
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(
          "w-0 h-full border-l border-[var(--color-border)]",
          variantStyles4[variant],
          className
        ),
        role: "separator",
        "aria-orientation": "vertical"
      }
    );
  }
  if (label) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn("flex items-center gap-3 my-4", className),
        role: "separator",
        "aria-label": label,
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: cn(
                "flex-1 h-0 border-t border-[var(--color-border)]",
                variantStyles4[variant]
              )
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-[var(--color-foreground)] font-bold uppercase tracking-wide", children: label }),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: cn(
                "flex-1 h-0 border-t border-[var(--color-border)]",
                variantStyles4[variant]
              )
            }
          )
        ]
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "w-full h-0 border-t border-[var(--color-border)] my-4",
        variantStyles4[variant],
        className
      ),
      role: "separator",
      "aria-orientation": "horizontal"
    }
  );
};
Divider.displayName = "Divider";
var iconMap = {
  // Navigation & Actions
  "chevron-right": LucideIcons.ChevronRight,
  "chevron-left": LucideIcons.ChevronLeft,
  "chevron-down": LucideIcons.ChevronDown,
  "chevron-up": LucideIcons.ChevronUp,
  "arrow-right": LucideIcons.ArrowRight,
  "arrow-left": LucideIcons.ArrowLeft,
  "arrow-up": LucideIcons.ArrowUp,
  "arrow-down": LucideIcons.ArrowDown,
  "x": LucideIcons.X,
  "close": LucideIcons.X,
  "menu": LucideIcons.Menu,
  "more-vertical": LucideIcons.MoreVertical,
  "more-horizontal": LucideIcons.MoreHorizontal,
  // Status & Feedback
  "check": LucideIcons.Check,
  "check-circle": LucideIcons.CheckCircle,
  "alert-circle": LucideIcons.AlertCircle,
  "alert-triangle": LucideIcons.AlertTriangle,
  "info": LucideIcons.Info,
  "help-circle": LucideIcons.HelpCircle,
  "loader": LucideIcons.Loader2,
  // CRUD Operations
  "plus": LucideIcons.Plus,
  "minus": LucideIcons.Minus,
  "edit": LucideIcons.Edit,
  "pencil": LucideIcons.Pencil,
  "trash": LucideIcons.Trash2,
  "trash-2": LucideIcons.Trash2,
  "save": LucideIcons.Save,
  "copy": LucideIcons.Copy,
  "clipboard": LucideIcons.Clipboard,
  // Files & Documents
  "file": LucideIcons.File,
  "file-text": LucideIcons.FileText,
  "folder": LucideIcons.Folder,
  "folder-open": LucideIcons.FolderOpen,
  "download": LucideIcons.Download,
  "upload": LucideIcons.Upload,
  "image": LucideIcons.Image,
  // Communication
  "mail": LucideIcons.Mail,
  "message-circle": LucideIcons.MessageCircle,
  "send": LucideIcons.Send,
  "phone": LucideIcons.Phone,
  // User & Profile
  "user": LucideIcons.User,
  "users": LucideIcons.Users,
  "user-plus": LucideIcons.UserPlus,
  "settings": LucideIcons.Settings,
  "log-out": LucideIcons.LogOut,
  "log-in": LucideIcons.LogIn,
  // Search & Filter
  "search": LucideIcons.Search,
  "filter": LucideIcons.Filter,
  "sort-asc": LucideIcons.ArrowUpNarrowWide,
  "sort-desc": LucideIcons.ArrowDownNarrowWide,
  // Layout & View
  "grid": LucideIcons.Grid,
  "list": LucideIcons.List,
  "layout": LucideIcons.Layout,
  "maximize": LucideIcons.Maximize,
  "minimize": LucideIcons.Minimize,
  "eye": LucideIcons.Eye,
  "eye-off": LucideIcons.EyeOff,
  // Media & Playback
  "play": LucideIcons.Play,
  "pause": LucideIcons.Pause,
  "stop": LucideIcons.Square,
  "volume": LucideIcons.Volume2,
  "volume-off": LucideIcons.VolumeX,
  // Time & Calendar
  "calendar": LucideIcons.Calendar,
  "clock": LucideIcons.Clock,
  // Misc
  "star": LucideIcons.Star,
  "heart": LucideIcons.Heart,
  "home": LucideIcons.Home,
  "link": LucideIcons.Link,
  "external-link": LucideIcons.ExternalLink,
  "refresh": LucideIcons.RefreshCw,
  "refresh-cw": LucideIcons.RefreshCw,
  "zap": LucideIcons.Zap,
  "bell": LucideIcons.Bell,
  "bookmark": LucideIcons.Bookmark,
  "share": LucideIcons.Share2,
  "lock": LucideIcons.Lock,
  "unlock": LucideIcons.Unlock,
  "globe": LucideIcons.Globe,
  "database": LucideIcons.Database,
  "code": LucideIcons.Code,
  "terminal": LucideIcons.Terminal
};
function resolveIcon(name) {
  if (iconMap[name]) {
    return iconMap[name];
  }
  const lowerName = name.toLowerCase();
  if (iconMap[lowerName]) {
    return iconMap[lowerName];
  }
  const kebabName = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  if (iconMap[kebabName]) {
    return iconMap[kebabName];
  }
  return LucideIcons.HelpCircle;
}
var sizeClasses2 = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8"
};
var animationClasses = {
  none: "",
  spin: "animate-spin",
  pulse: "animate-pulse"
};
var Icon = ({
  icon,
  name,
  size = "md",
  color,
  animation = "none",
  className,
  strokeWidth,
  style
}) => {
  const IconComponent = icon ?? (name ? resolveIcon(name) : LucideIcons.HelpCircle);
  const effectiveStrokeWidth = strokeWidth ?? void 0;
  return /* @__PURE__ */ jsx(
    IconComponent,
    {
      className: cn(
        sizeClasses2[size],
        animationClasses[animation],
        // Use theme's icon color or provided color
        color ? color : "text-[var(--icon-color,currentColor)]",
        className
      ),
      strokeWidth: effectiveStrokeWidth,
      style: {
        ...effectiveStrokeWidth === void 0 ? { strokeWidth: "var(--icon-stroke-width, 2)" } : {},
        ...style
      }
    }
  );
};
Icon.displayName = "Icon";
var colorClasses = {
  default: "bg-[var(--color-primary)]",
  primary: "bg-[var(--color-primary)]",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  danger: "bg-[var(--color-error)]"
};
var circularSizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32"
};
var ProgressBar = ({
  value,
  max = 100,
  progressType = "linear",
  variant = "primary",
  color,
  showPercentage = false,
  showLabel = false,
  label,
  size = "md",
  steps = 5,
  className
}) => {
  const percentage = Math.min(Math.max(value / max * 100, 0), 100);
  const effectiveColor = color ?? variant;
  const effectiveShowPercentage = showPercentage || showLabel;
  if (progressType === "linear") {
    return /* @__PURE__ */ jsxs("div", { className: cn("w-full", className), children: [
      label && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-[var(--color-foreground)]", children: label }),
        effectiveShowPercentage && /* @__PURE__ */ jsxs("span", { className: "text-sm text-[var(--color-foreground)] font-medium", children: [
          Math.round(percentage),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full h-2 bg-[var(--color-muted)] border border-[var(--color-border)] overflow-hidden", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(
            "h-full transition-all duration-300 ease-out",
            colorClasses[effectiveColor]
          ),
          style: { width: `${percentage}%` },
          role: "progressbar",
          "aria-valuenow": value,
          "aria-valuemin": 0,
          "aria-valuemax": max,
          "aria-label": label || `Progress: ${Math.round(percentage)}%`
        }
      ) })
    ] });
  }
  if (progressType === "circular") {
    const radius = size === "sm" ? 28 : size === "md" ? 40 : 56;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - percentage / 100 * circumference;
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "relative inline-flex items-center justify-center",
          className
        ),
        children: [
          /* @__PURE__ */ jsxs(
            "svg",
            {
              className: cn("transform -rotate-90", circularSizeClasses[size]),
              viewBox: "0 0 100 100",
              children: [
                /* @__PURE__ */ jsx(
                  "circle",
                  {
                    cx: "50",
                    cy: "50",
                    r: radius,
                    stroke: "currentColor",
                    strokeWidth: "8",
                    fill: "none",
                    className: "text-[var(--color-muted)]"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "circle",
                  {
                    cx: "50",
                    cy: "50",
                    r: radius,
                    stroke: "currentColor",
                    strokeWidth: "8",
                    fill: "none",
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                    strokeLinecap: "round",
                    className: cn(
                      "transition-all duration-300 ease-out",
                      colorClasses[effectiveColor]
                    )
                  }
                )
              ]
            }
          ),
          effectiveShowPercentage && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-[var(--color-foreground)]", children: [
            Math.round(percentage),
            "%"
          ] }) })
        ]
      }
    );
  }
  if (progressType === "stepped") {
    const stepValue = max / steps;
    const activeSteps = Math.floor(value / stepValue);
    const partialStep = value % stepValue / stepValue;
    return /* @__PURE__ */ jsxs("div", { className: cn("w-full", className), children: [
      label && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-[var(--color-foreground)]", children: label }),
        effectiveShowPercentage && /* @__PURE__ */ jsxs("span", { className: "text-sm text-[var(--color-muted-foreground)]", children: [
          Math.round(percentage),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: Array.from({ length: steps }).map((_, index) => {
        const isActive = index < activeSteps;
        const isPartial = index === activeSteps && partialStep > 0;
        return /* @__PURE__ */ jsx(
          "div",
          {
            className: "flex-1 h-2 bg-[var(--color-muted)] border border-[var(--color-border)] overflow-hidden",
            children: /* @__PURE__ */ jsx(
              "div",
              {
                className: cn(
                  "h-full transition-all duration-300 ease-out",
                  (isActive || isPartial) && colorClasses[effectiveColor]
                ),
                style: {
                  width: isPartial ? `${partialStep * 100}%` : isActive ? "100%" : "0%"
                }
              }
            )
          },
          index
        );
      }) })
    ] });
  }
  return null;
};
ProgressBar.displayName = "ProgressBar";
var Radio = React41__default.forwardRef(
  ({
    label,
    helperText,
    error,
    size = "md",
    className,
    id,
    checked,
    disabled,
    ...props
  }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const sizeClasses5 = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6"
    };
    const dotSizeClasses = {
      sm: "w-2 h-2",
      md: "w-2.5 h-2.5",
      lg: "w-3 h-3"
    };
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-shrink-0 mt-0.5", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              ref,
              type: "radio",
              id: radioId,
              checked,
              disabled,
              className: cn("sr-only peer", className),
              "aria-invalid": hasError,
              "aria-describedby": error ? `${radioId}-error` : helperText ? `${radioId}-helper` : void 0,
              ...props
            }
          ),
          /* @__PURE__ */ jsx(
            "label",
            {
              htmlFor: radioId,
              className: cn(
                "flex items-center justify-center",
                "border-[length:var(--border-width)] transition-all cursor-pointer",
                sizeClasses5[size],
                hasError ? "border-[var(--color-error)] peer-focus:ring-[var(--color-error)]/20" : "border-[var(--color-border)] peer-focus:ring-[var(--color-ring)]/20",
                checked ? hasError ? "border-[var(--color-error)]" : "border-[var(--color-primary)] bg-[var(--color-primary)]" : "",
                "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2",
                disabled && "opacity-50 cursor-not-allowed",
                !disabled && "hover:border-[var(--color-border-hover)]"
              ),
              children: checked && /* @__PURE__ */ jsx(
                "div",
                {
                  className: cn(
                    "transition-all",
                    dotSizeClasses[size],
                    hasError ? "bg-[var(--color-error)]" : "bg-[var(--color-primary-foreground)]"
                  )
                }
              )
            }
          )
        ] }),
        label && /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: radioId,
            className: cn(
              "block text-sm font-medium cursor-pointer select-none",
              hasError ? "text-[var(--color-error)]" : "text-[var(--color-foreground)]",
              disabled && "opacity-50 cursor-not-allowed"
            ),
            children: label
          }
        ) })
      ] }),
      (helperText || error) && /* @__PURE__ */ jsxs("div", { className: "mt-1.5 ml-8", children: [
        error && /* @__PURE__ */ jsx(
          "p",
          {
            id: `${radioId}-error`,
            className: "text-sm text-[var(--color-error)] font-medium",
            role: "alert",
            children: error
          }
        ),
        !error && helperText && /* @__PURE__ */ jsx(
          "p",
          {
            id: `${radioId}-helper`,
            className: "text-sm text-[var(--color-muted-foreground)]",
            children: helperText
          }
        )
      ] })
    ] });
  }
);
Radio.displayName = "Radio";
var Switch = React41.forwardRef(
  ({
    checked,
    defaultChecked = false,
    onChange,
    disabled = false,
    label,
    id,
    name,
    className
  }, ref) => {
    const [isChecked, setIsChecked] = React41.useState(
      checked !== void 0 ? checked : defaultChecked
    );
    React41.useEffect(() => {
      if (checked !== void 0) {
        setIsChecked(checked);
      }
    }, [checked]);
    const handleClick = () => {
      if (disabled) return;
      const newValue = !isChecked;
      if (checked === void 0) {
        setIsChecked(newValue);
      }
      onChange?.(newValue);
    };
    return /* @__PURE__ */ jsxs("div", { className: cn("inline-flex items-center gap-2", className), children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          ref,
          type: "button",
          role: "switch",
          "aria-checked": isChecked,
          "aria-label": label,
          id,
          name,
          disabled,
          onClick: handleClick,
          className: cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            isChecked ? "bg-primary" : "bg-muted",
            disabled && "cursor-not-allowed opacity-50"
          ),
          children: /* @__PURE__ */ jsx(
            "span",
            {
              className: cn(
                "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
                isChecked ? "translate-x-5" : "translate-x-0"
              )
            }
          )
        }
      ),
      label && /* @__PURE__ */ jsx(
        "label",
        {
          htmlFor: id,
          className: cn(
            "text-sm font-medium leading-none cursor-pointer",
            disabled && "cursor-not-allowed opacity-70"
          ),
          onClick: handleClick,
          children: label
        }
      )
    ] });
  }
);
Switch.displayName = "Switch";
var horizontalSizes = {
  xs: "w-1",
  sm: "w-2",
  md: "w-4",
  lg: "w-6",
  xl: "w-8",
  "2xl": "w-12"
};
var verticalSizes = {
  xs: "h-1",
  sm: "h-2",
  md: "h-4",
  lg: "h-6",
  xl: "h-8",
  "2xl": "h-12"
};
var Spacer = ({
  size = "auto",
  axis = "horizontal",
  className
}) => {
  if (size === "auto") {
    return /* @__PURE__ */ jsx("div", { className: cn("flex-1", className), "aria-hidden": "true" });
  }
  const sizeClass = axis === "horizontal" ? horizontalSizes[size] : verticalSizes[size];
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn("flex-shrink-0", sizeClass, className),
      "aria-hidden": "true"
    }
  );
};
var gapStyles = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
  "2xl": "gap-12"
};
var alignStyles = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline"
};
var justifyStyles = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly"
};
var Stack = ({
  direction = "vertical",
  gap = "md",
  align = "stretch",
  justify = "start",
  wrap = false,
  reverse = false,
  flex = false,
  className,
  style,
  children,
  as: Component = "div",
  onClick,
  onKeyDown,
  role,
  tabIndex,
  action,
  actionPayload
}) => {
  const eventBus = useEventBus();
  const handleClick = (e) => {
    if (action) {
      eventBus.emit(`UI:${action}`, actionPayload ?? {});
    }
    onClick?.(e);
  };
  const directionClass = direction === "horizontal" ? reverse ? "flex-row-reverse" : "flex-row" : reverse ? "flex-col-reverse" : "flex-col";
  return /* @__PURE__ */ jsx(
    Component,
    {
      className: cn(
        "flex",
        directionClass,
        gapStyles[gap],
        alignStyles[align],
        justifyStyles[justify],
        wrap && "flex-wrap",
        flex && "flex-1",
        className
      ),
      style,
      onClick: action || onClick ? handleClick : void 0,
      onKeyDown,
      role,
      tabIndex,
      children
    }
  );
};
var VStack = (props) => /* @__PURE__ */ jsx(Stack, { direction: "vertical", ...props });
var HStack = (props) => /* @__PURE__ */ jsx(Stack, { direction: "horizontal", ...props });
var TextHighlight = ({
  highlightType,
  isActive = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  annotationId,
  className,
  children,
  action,
  hoverEvent
}) => {
  const eventBus = useEventBus();
  const baseStyles = "cursor-pointer transition-all duration-150";
  const typeStyles = {
    question: cn(
      // Blue border for questions
      "bg-[var(--color-card)] border-b-2 border-primary-600",
      "hover:bg-[var(--color-muted)]",
      isActive && "bg-primary-100 ring-2 ring-primary-600"
    ),
    note: cn(
      // Yellow border for notes
      "bg-[var(--color-card)] border-b-2 border-amber-500",
      "hover:bg-[var(--color-muted)]",
      isActive && "bg-amber-100 ring-2 ring-amber-500"
    )
  };
  return /* @__PURE__ */ jsx(
    "span",
    {
      "data-highlight": "true",
      "data-highlight-type": highlightType,
      "data-annotation-id": annotationId,
      className: cn(baseStyles, typeStyles[highlightType], className),
      onClick: () => {
        if (action) eventBus.emit(`UI:${action}`, { annotationId });
        onClick?.();
      },
      onMouseEnter: () => {
        if (hoverEvent) eventBus.emit(`UI:${hoverEvent}`, { hovered: true, annotationId });
        onMouseEnter?.();
      },
      onMouseLeave: () => {
        if (hoverEvent) eventBus.emit(`UI:${hoverEvent}`, { hovered: false, annotationId });
        onMouseLeave?.();
      },
      role: "button",
      tabIndex: 0,
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (action) eventBus.emit(`UI:${action}`, { annotationId });
          onClick?.();
        }
      },
      children
    }
  );
};
TextHighlight.displayName = "TextHighlight";
var variantStyles5 = {
  h1: "text-4xl font-bold tracking-tight text-[var(--color-foreground)]",
  h2: "text-3xl font-bold tracking-tight text-[var(--color-foreground)]",
  h3: "text-2xl font-bold text-[var(--color-foreground)]",
  h4: "text-xl font-bold text-[var(--color-foreground)]",
  h5: "text-lg font-bold text-[var(--color-foreground)]",
  h6: "text-base font-bold text-[var(--color-foreground)]",
  body1: "text-base font-normal text-[var(--color-foreground)]",
  body2: "text-sm font-normal text-[var(--color-foreground)]",
  body: "text-base font-normal text-[var(--color-foreground)]",
  caption: "text-xs font-normal text-[var(--color-muted-foreground)]",
  overline: "text-xs uppercase tracking-wide font-bold text-[var(--color-muted-foreground)]",
  small: "text-sm font-normal text-[var(--color-foreground)]",
  large: "text-lg font-medium text-[var(--color-foreground)]",
  label: "text-sm font-medium text-[var(--color-foreground)]"
};
var colorStyles = {
  primary: "text-[var(--color-foreground)]",
  secondary: "text-[var(--color-muted-foreground)]",
  muted: "text-[var(--color-muted-foreground)]",
  error: "text-[var(--color-error)]",
  success: "text-[var(--color-success)]",
  warning: "text-[var(--color-warning)]",
  inherit: "text-inherit"
};
var weightStyles = {
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold"
};
var defaultElements = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  body1: "p",
  body2: "p",
  body: "p",
  caption: "span",
  overline: "span",
  small: "span",
  large: "p",
  label: "span"
};
var typographySizeStyles = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl"
};
var overflowStyles2 = {
  visible: "overflow-visible",
  hidden: "overflow-hidden",
  wrap: "break-words overflow-hidden",
  "clamp-2": "overflow-hidden line-clamp-2",
  "clamp-3": "overflow-hidden line-clamp-3"
};
var Typography = ({
  variant: variantProp,
  level,
  color = "primary",
  align,
  weight,
  size,
  truncate = false,
  overflow,
  as,
  id,
  className,
  style,
  content,
  children
}) => {
  const variant = variantProp ?? (level ? `h${level}` : "body1");
  const Component = as || defaultElements[variant];
  return /* @__PURE__ */ jsx(
    Component,
    {
      id,
      className: cn(
        variantStyles5[variant],
        colorStyles[color],
        weight && weightStyles[weight],
        size && typographySizeStyles[size],
        align && `text-${align}`,
        truncate && "truncate overflow-hidden text-ellipsis",
        overflow && overflowStyles2[overflow],
        className
      ),
      style,
      children: children ?? content
    }
  );
};
Typography.displayName = "Typography";
var sizeStyles4 = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl"
};
var Heading = ({
  level = 2,
  size,
  className,
  ...props
}) => {
  const variant = `h${level}`;
  const sizeClass = size ? sizeStyles4[size] : void 0;
  return /* @__PURE__ */ jsx(
    Typography,
    {
      variant,
      className: cn(sizeClass, className),
      ...props
    }
  );
};
Heading.displayName = "Heading";
var Text = ({
  variant = "body",
  ...props
}) => {
  return /* @__PURE__ */ jsx(
    Typography,
    {
      variant,
      ...props
    }
  );
};
Text.displayName = "Text";
var sizeClasses3 = {
  sm: "p-1.5",
  md: "p-2",
  lg: "p-2.5"
};
var iconSizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6"
};
var ThemeToggle = ({
  className,
  size = "md",
  showLabel = false
}) => {
  const { resolvedMode, toggleMode } = useTheme();
  const isDark = resolvedMode === "dark";
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: toggleMode,
      className: cn(
        "inline-flex items-center justify-center gap-2",
        "text-[var(--color-foreground)]",
        "hover:bg-[var(--color-muted)] border-[length:var(--border-width)] border-transparent hover:border-[var(--color-border)]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2",
        "transition-colors duration-200",
        sizeClasses3[size],
        className
      ),
      "aria-label": isDark ? "Switch to light mode" : "Switch to dark mode",
      title: isDark ? "Switch to light mode" : "Switch to dark mode",
      children: [
        isDark ? /* @__PURE__ */ jsx(
          Sun,
          {
            className: cn(iconSizes[size], "text-[var(--color-foreground)]")
          }
        ) : /* @__PURE__ */ jsx(
          Moon,
          {
            className: cn(iconSizes[size], "text-[var(--color-foreground)]")
          }
        ),
        showLabel && /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: isDark ? "Light" : "Dark" })
      ]
    }
  );
};
ThemeToggle.displayName = "ThemeToggle";
var THEME_LABELS = {
  wireframe: {
    label: "Wireframe",
    description: "Sharp corners, thick borders, brutalist"
  },
  minimalist: {
    label: "Minimalist",
    description: "Clean, subtle, refined"
  },
  almadar: {
    label: "Almadar",
    description: "Teal gradients, glowing accents"
  },
  "trait-wars": {
    label: "Trait Wars",
    description: "Gold parchment, game manuscript"
  },
  ocean: {
    label: "Ocean",
    description: "Deep sea calm, ocean blues"
  },
  forest: {
    label: "Forest",
    description: "Woodland serenity, earthy greens"
  },
  sunset: {
    label: "Sunset",
    description: "Golden hour, warm coral and amber"
  },
  lavender: {
    label: "Lavender",
    description: "Creative studio, soft violet"
  },
  rose: {
    label: "Rose",
    description: "Elegant bloom, warm pink"
  },
  slate: {
    label: "Slate",
    description: "Corporate edge, cool gray"
  },
  ember: {
    label: "Ember",
    description: "Fire and energy, bold red"
  },
  midnight: {
    label: "Midnight",
    description: "Noir elegance, deep indigo"
  },
  sand: {
    label: "Sand",
    description: "Desert minimal, warm earth"
  },
  neon: {
    label: "Neon",
    description: "Cyberpunk, glowing cyan and pink"
  },
  arctic: {
    label: "Arctic",
    description: "Ice crystal, cool blue"
  },
  copper: {
    label: "Copper",
    description: "Warm industrial, metallic bronze"
  }
};
function getThemeLabel(name) {
  return THEME_LABELS[name] || { label: name, description: name };
}
var ThemeSelector = ({
  className = "",
  variant = "dropdown",
  showLabels = true
}) => {
  const { theme, setTheme, availableThemes } = useTheme();
  if (variant === "buttons") {
    return /* @__PURE__ */ jsx("div", { className: `flex gap-2 flex-wrap ${className}`, children: availableThemes.map((t) => {
      const { label } = getThemeLabel(t.name);
      const isActive = theme === t.name;
      return /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setTheme(t.name),
          className: `
                px-3 py-2 text-sm font-medium transition-all
                border-[length:var(--border-width)] rounded-[var(--radius-sm)]
                ${isActive ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]" : "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] border-[var(--color-border)] hover:bg-[var(--color-secondary-hover)]"}
              `,
          title: getThemeLabel(t.name).description,
          children: showLabels && label
        },
        t.name
      );
    }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: `relative ${className}`, children: [
    /* @__PURE__ */ jsx(
      "select",
      {
        value: theme,
        onChange: (e) => setTheme(e.target.value),
        className: `
          px-3 py-2 pr-8 text-sm font-medium
          bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]
          border-[length:var(--border-width)] border-[var(--color-border)]
          rounded-[var(--radius-sm)]
          cursor-pointer appearance-none
          focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]
        `,
        children: availableThemes.map((t) => {
          const { label } = getThemeLabel(t.name);
          return /* @__PURE__ */ jsx("option", { value: t.name, children: label }, t.name);
        })
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none", children: /* @__PURE__ */ jsx(
      "svg",
      {
        className: "w-4 h-4",
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        children: /* @__PURE__ */ jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M19 9l-7 7-7-7"
          }
        )
      }
    ) })
  ] });
};
var Overlay = ({
  isVisible = true,
  onClick,
  className,
  blur = true,
  action
}) => {
  const eventBus = useEventBus();
  if (!isVisible) return null;
  const handleClick = (e) => {
    if (action) {
      eventBus.emit(`UI:${action}`, {});
    }
    onClick?.(e);
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "fixed inset-0 z-40 bg-[var(--color-background)]/80",
        blur && "backdrop-blur-sm",
        className
      ),
      onClick: action || onClick ? handleClick : void 0,
      "aria-hidden": "true"
    }
  );
};
function toSharedContext(ctx) {
  return createMinimalContext(
    {
      formValues: ctx.formValues,
      globalVariables: ctx.globalVariables,
      localVariables: ctx.localVariables ?? {},
      ...ctx.entity
    },
    {},
    "active"
  );
}
var ConditionalWrapper = ({
  condition,
  context,
  children,
  fallback = null,
  animate = false
}) => {
  if (!condition) {
    return /* @__PURE__ */ jsx(Fragment, { children });
  }
  const sharedContext = toSharedContext(context);
  const result = evaluate(condition, sharedContext);
  const isVisible = Boolean(result);
  if (animate) {
    return /* @__PURE__ */ jsx(
      Box,
      {
        overflow: "hidden",
        className: `transition-all duration-200 ${isVisible ? "opacity-100 max-h-[1000px]" : "opacity-0 max-h-0"}`,
        children: isVisible ? children : fallback
      }
    );
  }
  return isVisible ? /* @__PURE__ */ jsx(Fragment, { children }) : /* @__PURE__ */ jsx(Fragment, { children: fallback });
};
ConditionalWrapper.displayName = "ConditionalWrapper";
var positionStyles2 = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2"
};
var arrowStyles = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-[var(--color-foreground)] border-l-transparent border-r-transparent border-b-transparent",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-[var(--color-foreground)] border-l-transparent border-r-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-[var(--color-foreground)] border-t-transparent border-b-transparent border-r-transparent",
  right: "right-full top-1/2 -translate-y-1/2 border-r-[var(--color-foreground)] border-t-transparent border-b-transparent border-l-transparent"
};
var LawReferenceTooltip = ({
  reference,
  children,
  position = "top",
  className
}) => {
  const [isVisible, setIsVisible] = React41__default.useState(false);
  const timeoutRef = React41__default.useRef(null);
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(true), 200);
  };
  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };
  React41__default.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  return /* @__PURE__ */ jsxs(
    Box,
    {
      as: "span",
      position: "relative",
      display: "inline-block",
      className,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleMouseEnter,
      onBlur: handleMouseLeave,
      children: [
        children,
        isVisible && /* @__PURE__ */ jsxs(
          Box,
          {
            padding: "sm",
            rounded: "lg",
            shadow: "lg",
            position: "absolute",
            className: cn(
              "z-50 w-64 bg-[var(--color-foreground)] text-[var(--color-background)]",
              positionStyles2[position]
            ),
            role: "tooltip",
            children: [
              /* @__PURE__ */ jsxs(VStack, { gap: "xs", children: [
                /* @__PURE__ */ jsxs(
                  Typography,
                  {
                    variant: "label",
                    weight: "semibold",
                    className: "text-amber-400",
                    children: [
                      reference.law,
                      " ",
                      reference.article
                    ]
                  }
                ),
                reference.lawName && /* @__PURE__ */ jsx(
                  Typography,
                  {
                    variant: "caption",
                    className: "text-[var(--color-muted-foreground)]",
                    children: reference.lawName
                  }
                ),
                reference.clause && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Divider, { className: "border-[var(--color-border)]" }),
                  /* @__PURE__ */ jsx(
                    Typography,
                    {
                      variant: "caption",
                      className: "text-[var(--color-background)] leading-relaxed",
                      children: reference.clause
                    }
                  )
                ] }),
                reference.link && /* @__PURE__ */ jsx(
                  Typography,
                  {
                    as: "a",
                    variant: "caption",
                    className: "text-blue-400 hover:text-blue-300 underline cursor-pointer",
                    href: reference.link,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    onClick: (e) => e.stopPropagation(),
                    children: "View full law text"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                Box,
                {
                  as: "span",
                  position: "absolute",
                  className: cn("w-0 h-0 border-4", arrowStyles[position])
                }
              )
            ]
          }
        )
      ]
    }
  );
};
LawReferenceTooltip.displayName = "LawReferenceTooltip";
var heartIcon = (filled, size) => /* @__PURE__ */ jsx(
  "svg",
  {
    className: cn("transition-all duration-200", size, filled ? "text-red-500" : "text-gray-400"),
    viewBox: "0 0 24 24",
    fill: filled ? "currentColor" : "none",
    stroke: "currentColor",
    strokeWidth: filled ? 0 : 2,
    children: /* @__PURE__ */ jsx("path", { d: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" })
  }
);
var sizeMap = {
  sm: { heart: "w-4 h-4", bar: "h-2", text: "text-sm" },
  md: { heart: "w-6 h-6", bar: "h-3", text: "text-base" },
  lg: { heart: "w-8 h-8", bar: "h-4", text: "text-lg" }
};
function HealthBar({
  current,
  max,
  format = "hearts",
  size = "md",
  className,
  animated = true
}) {
  const sizes = sizeMap[size];
  const percentage = Math.max(0, Math.min(100, current / max * 100));
  if (format === "hearts") {
    return /* @__PURE__ */ jsx("div", { className: cn("flex items-center gap-1", className), children: Array.from({ length: max }).map((_, i) => /* @__PURE__ */ jsx(
      "span",
      {
        className: cn(animated && "transition-transform hover:scale-110"),
        children: heartIcon(i < current, sizes.heart)
      },
      i
    )) });
  }
  if (format === "bar") {
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(
          "relative overflow-hidden rounded-full bg-gray-700",
          sizes.bar,
          "w-24",
          className
        ),
        children: /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "absolute inset-y-0 left-0 rounded-full",
              percentage > 66 ? "bg-green-500" : percentage > 33 ? "bg-yellow-500" : "bg-red-500",
              animated && "transition-all duration-300"
            ),
            style: { width: `${percentage}%` }
          }
        )
      }
    );
  }
  return /* @__PURE__ */ jsxs("span", { className: cn("font-mono font-bold", sizes.text, className), children: [
    current,
    "/",
    max
  ] });
}
HealthBar.displayName = "HealthBar";
var sizeMap2 = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
  xl: "text-4xl"
};
function ScoreDisplay({
  value,
  label,
  icon,
  size = "md",
  className,
  animated = true,
  locale = "en-US"
}) {
  const [displayValue, setDisplayValue] = React41.useState(value);
  const [isAnimating, setIsAnimating] = React41.useState(false);
  React41.useEffect(() => {
    if (!animated || displayValue === value) {
      setDisplayValue(value);
      return;
    }
    setIsAnimating(true);
    const diff = value - displayValue;
    const steps = Math.min(Math.abs(diff), 20);
    const increment = diff / steps;
    let current = displayValue;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current += increment;
      setDisplayValue(Math.round(current));
      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
        setIsAnimating(false);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [value, animated]);
  const formattedValue = new Intl.NumberFormat(locale).format(displayValue);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex items-center gap-2 font-bold",
        sizeMap2[size],
        isAnimating && "animate-pulse",
        className
      ),
      children: [
        icon && /* @__PURE__ */ jsx("span", { className: "flex-shrink-0", children: icon }),
        label && /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: label }),
        /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: formattedValue })
      ]
    }
  );
}
ScoreDisplay.displayName = "ScoreDisplay";
var sizeMap3 = {
  sm: "w-10 h-10 text-sm",
  md: "w-14 h-14 text-base",
  lg: "w-18 h-18 text-lg",
  xl: "w-24 h-24 text-xl"
};
var shapeMap = {
  circle: "rounded-full",
  rounded: "rounded-xl",
  square: "rounded-md"
};
var variantMap = {
  primary: "bg-blue-600 text-white border-blue-400 hover:bg-blue-500",
  secondary: "bg-gray-700 text-white border-gray-500 hover:bg-gray-600",
  ghost: "bg-transparent text-white border-white/30 hover:bg-white/10"
};
function ControlButton({
  label,
  icon,
  size = "md",
  shape = "circle",
  variant = "secondary",
  onPress,
  onRelease,
  pressEvent,
  releaseEvent,
  pressed,
  disabled,
  className
}) {
  const eventBus = useEventBus();
  const [isPressed, setIsPressed] = React41.useState(false);
  const actualPressed = pressed ?? isPressed;
  const handlePointerDown = React41.useCallback(
    (e) => {
      e.preventDefault();
      if (disabled) return;
      setIsPressed(true);
      if (pressEvent) eventBus.emit(`UI:${pressEvent}`, {});
      onPress?.();
    },
    [disabled, pressEvent, eventBus, onPress]
  );
  const handlePointerUp = React41.useCallback(
    (e) => {
      e.preventDefault();
      if (disabled) return;
      setIsPressed(false);
      if (releaseEvent) eventBus.emit(`UI:${releaseEvent}`, {});
      onRelease?.();
    },
    [disabled, releaseEvent, eventBus, onRelease]
  );
  const handlePointerLeave = React41.useCallback(
    (e) => {
      if (isPressed) {
        setIsPressed(false);
        if (releaseEvent) eventBus.emit(`UI:${releaseEvent}`, {});
        onRelease?.();
      }
    },
    [isPressed, releaseEvent, eventBus, onRelease]
  );
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      disabled,
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
      onContextMenu: (e) => e.preventDefault(),
      className: cn(
        "flex items-center justify-center border-2 font-bold",
        "select-none touch-none",
        "transition-all duration-100",
        "active:scale-95",
        sizeMap3[size] ?? sizeMap3.md,
        shapeMap[shape] ?? shapeMap.circle,
        variantMap[variant] ?? variantMap.secondary,
        actualPressed && "scale-95 brightness-110 border-white",
        disabled && "opacity-50 cursor-not-allowed",
        className
      ),
      children: [
        icon && /* @__PURE__ */ jsx("span", { className: "text-2xl", children: icon }),
        label && !icon && /* @__PURE__ */ jsx("span", { children: label })
      ]
    }
  );
}
ControlButton.displayName = "ControlButton";
function Sprite({
  spritesheet,
  frameWidth,
  frameHeight,
  frame,
  x,
  y,
  scale = 1,
  flipX = false,
  flipY = false,
  rotation = 0,
  opacity = 1,
  zIndex = 0,
  columns = 16,
  className,
  onClick,
  action
}) {
  const eventBus = useEventBus();
  const sourcePosition = useMemo(() => {
    const frameX = frame % columns;
    const frameY = Math.floor(frame / columns);
    return {
      x: frameX * frameWidth,
      y: frameY * frameHeight
    };
  }, [frame, columns, frameWidth, frameHeight]);
  const transform = useMemo(() => {
    const transforms = [
      `translate(${x}px, ${y}px)`
    ];
    if (scale !== 1) {
      transforms.push(`scale(${scale})`);
    }
    if (flipX || flipY) {
      transforms.push(`scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`);
    }
    if (rotation !== 0) {
      transforms.push(`rotate(${rotation}deg)`);
    }
    return transforms.join(" ");
  }, [x, y, scale, flipX, flipY, rotation]);
  const backgroundPosition = `-${sourcePosition.x}px -${sourcePosition.y}px`;
  const handleClick = () => {
    if (action) eventBus.emit(`UI:${action}`, {});
    onClick?.();
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className,
      onClick: action || onClick ? handleClick : void 0,
      style: {
        position: "absolute",
        width: frameWidth,
        height: frameHeight,
        backgroundImage: `url(${spritesheet})`,
        backgroundPosition,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
        transform,
        transformOrigin: "center center",
        opacity,
        zIndex,
        pointerEvents: action || onClick ? "auto" : "none"
      }
    }
  );
}
function drawSprite(ctx, image, props) {
  const {
    frameWidth,
    frameHeight,
    frame,
    x,
    y,
    scale = 1,
    flipX = false,
    flipY = false,
    rotation = 0,
    opacity = 1,
    columns = 16
  } = props;
  const sourceX = frame % columns * frameWidth;
  const sourceY = Math.floor(frame / columns) * frameHeight;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x + frameWidth / 2, y + frameHeight / 2);
  if (rotation !== 0) {
    ctx.rotate(rotation * Math.PI / 180);
  }
  ctx.scale(scale * (flipX ? -1 : 1), scale * (flipY ? -1 : 1));
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    frameWidth,
    frameHeight,
    -frameWidth / 2,
    -frameHeight / 2,
    frameWidth,
    frameHeight
  );
  ctx.restore();
}
var DEFAULT_STATE_STYLES = {
  idle: { icon: "\u23F8", bgClass: "bg-muted" },
  active: { icon: "\u25B6", bgClass: "bg-success" },
  sleeping: { icon: "\u{1F4A4}", bgClass: "bg-muted" },
  moving: { icon: "\u{1F6B6}", bgClass: "bg-info" },
  eating: { icon: "\u{1F37D}\uFE0F", bgClass: "bg-success" },
  waiting: { icon: "\u23F3", bgClass: "bg-warning" },
  happy: { icon: "\u{1F60A}", bgClass: "bg-success" },
  scared: { icon: "\u{1F628}", bgClass: "bg-error" },
  done: { icon: "\u2713", bgClass: "bg-success" },
  error: { icon: "\u2717", bgClass: "bg-error" },
  ready: { icon: "\u2713", bgClass: "bg-success" },
  cooldown: { icon: "\u{1F504}", bgClass: "bg-warning" }
};
var DEFAULT_STYLE = { icon: "?", bgClass: "bg-muted" };
var SIZE_CLASSES = {
  sm: "text-xs px-1.5 py-0.5",
  md: "text-sm px-2 py-1",
  lg: "text-base px-3 py-1.5"
};
function StateIndicator({
  state,
  label,
  size = "md",
  animated = true,
  stateStyles,
  className
}) {
  const mergedStyles = stateStyles ? { ...DEFAULT_STATE_STYLES, ...stateStyles } : DEFAULT_STATE_STYLES;
  const config = mergedStyles[state.toLowerCase()] || DEFAULT_STYLE;
  const displayLabel = label || state.charAt(0).toUpperCase() + state.slice(1);
  return /* @__PURE__ */ jsxs(
    Box,
    {
      display: "inline-flex",
      className: cn(
        "items-center gap-1 rounded-full text-foreground font-medium",
        config.bgClass,
        SIZE_CLASSES[size],
        animated && state.toLowerCase() !== "idle" && state.toLowerCase() !== "done" && "animate-pulse",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(Box, { as: "span", children: config.icon }),
        /* @__PURE__ */ jsx(Box, { as: "span", children: displayLabel })
      ]
    }
  );
}
StateIndicator.displayName = "StateIndicator";
var ErrorState = ({
  title,
  message,
  description,
  onRetry,
  className,
  retryEvent
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const handleRetry = () => {
    if (retryEvent) eventBus.emit(`UI:${retryEvent}`, {});
    onRetry?.();
  };
  const resolvedTitle = title ?? t("error.generic");
  const resolvedMessage = message ?? description ?? t("error.occurred");
  return /* @__PURE__ */ jsxs(
    VStack,
    {
      align: "center",
      className: cn(
        "justify-center py-12 text-center",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(Box, { className: "mb-4 rounded-[var(--radius-full)] bg-[var(--color-error)]/10 p-3", children: /* @__PURE__ */ jsx(AlertCircle, { className: "h-8 w-8 text-[var(--color-error)]" }) }),
        /* @__PURE__ */ jsx(Typography, { variant: "h3", className: "text-lg font-medium text-[var(--color-foreground)]", children: resolvedTitle }),
        /* @__PURE__ */ jsx(Typography, { variant: "small", className: "mt-1 text-[var(--color-muted-foreground)] max-w-sm", children: resolvedMessage }),
        (onRetry || retryEvent) && /* @__PURE__ */ jsx(Button, { variant: "secondary", className: "mt-4", onClick: handleRetry, children: t("error.retry") })
      ]
    }
  );
};
ErrorState.displayName = "ErrorState";
var ErrorBoundary = class extends React41__default.Component {
  constructor(props) {
    super(props);
    __publicField(this, "reset", () => {
      this.setState({ error: null });
    });
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, errorInfo) {
    this.props.onError?.(error, errorInfo);
  }
  render() {
    const { error } = this.state;
    const { children, fallback, className } = this.props;
    if (error) {
      const wrapper = className ? /* @__PURE__ */ jsx("div", { className: cn(className), children: this.renderFallback(error, fallback) }) : this.renderFallback(error, fallback);
      return wrapper;
    }
    return children;
  }
  renderFallback(error, fallback) {
    if (typeof fallback === "function") {
      return fallback(error, this.reset);
    }
    if (fallback) {
      return fallback;
    }
    return /* @__PURE__ */ jsx(
      ErrorState,
      {
        title: "Something went wrong",
        message: error.message,
        onRetry: this.reset
      }
    );
  }
};
__publicField(ErrorBoundary, "displayName", "ErrorBoundary");
var FormField = ({
  label,
  required,
  error,
  hint,
  className,
  children
}) => {
  return /* @__PURE__ */ jsxs("div", { className: cn("space-y-1.5", className), children: [
    /* @__PURE__ */ jsx(Label, { required, children: label }),
    children,
    error && /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "error", children: error }),
    hint && !error && /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "muted", children: hint })
  ] });
};
FormField.displayName = "FormField";
var ICON_MAP = {
  "check-circle": CheckCircle,
  check: CheckCircle,
  "x-circle": XCircle,
  error: XCircle,
  "alert-circle": AlertCircle,
  warning: AlertCircle,
  info: Info,
  search: Search,
  inbox: Inbox,
  "file-question": FileQuestion
};
var EmptyState = ({
  icon,
  title,
  message,
  description,
  actionLabel,
  onAction,
  className,
  destructive,
  variant,
  actionEvent
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const handleAction = () => {
    if (actionEvent) eventBus.emit(`UI:${actionEvent}`, {});
    onAction?.();
  };
  const Icon2 = typeof icon === "string" ? ICON_MAP[icon] : icon;
  const isDestructive = destructive || variant === "error";
  const isSuccess = variant === "success";
  const displayText = title || message || t("empty.noItems");
  return /* @__PURE__ */ jsxs(
    VStack,
    {
      align: "center",
      className: cn(
        "justify-center py-12 text-center",
        className
      ),
      children: [
        Icon2 && /* @__PURE__ */ jsx(
          Box,
          {
            className: cn(
              "mb-4 rounded-[var(--radius-full)] p-3",
              isDestructive ? "bg-[var(--color-error)]/10" : isSuccess ? "bg-[var(--color-success)]/10" : "bg-[var(--color-muted)]"
            ),
            children: /* @__PURE__ */ jsx(
              Icon2,
              {
                className: cn(
                  "h-8 w-8",
                  isDestructive ? "text-[var(--color-error)]" : isSuccess ? "text-[var(--color-success)]" : "text-[var(--color-muted-foreground)]"
                )
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(
          Typography,
          {
            variant: "h3",
            className: cn(
              "text-lg font-medium",
              isDestructive ? "text-[var(--color-error)]" : isSuccess ? "text-[var(--color-success)]" : "text-[var(--color-foreground)]"
            ),
            children: displayText
          }
        ),
        description && /* @__PURE__ */ jsx(Typography, { variant: "small", className: "mt-1 text-[var(--color-muted-foreground)] max-w-sm", children: description }),
        actionLabel && (onAction || actionEvent) && /* @__PURE__ */ jsx(
          Button,
          {
            className: "mt-4",
            variant: isDestructive ? "danger" : "primary",
            onClick: handleAction,
            children: actionLabel
          }
        )
      ]
    }
  );
};
EmptyState.displayName = "EmptyState";
var LoadingState = ({
  title,
  message,
  className
}) => {
  const { t } = useTranslate();
  const displayMessage = message ?? t("common.loading");
  return /* @__PURE__ */ jsxs(
    VStack,
    {
      align: "center",
      className: cn(
        "justify-center py-12",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(Spinner, { size: "lg" }),
        title && /* @__PURE__ */ jsx(Typography, { variant: "h3", className: "mt-4 text-lg font-semibold text-[var(--color-foreground)]", children: title }),
        /* @__PURE__ */ jsx(
          Typography,
          {
            variant: "small",
            className: cn(
              "text-[var(--color-muted-foreground)]",
              title ? "mt-2" : "mt-4"
            ),
            children: displayMessage
          }
        )
      ]
    }
  );
};
LoadingState.displayName = "LoadingState";
var pulseClass = "animate-pulse bg-[var(--color-muted)]/60 rounded";
function SkeletonLine({ className }) {
  return /* @__PURE__ */ jsx(Box, { className: cn(pulseClass, "h-4", className) });
}
function SkeletonBlock({ className }) {
  return /* @__PURE__ */ jsx(Box, { className: cn(pulseClass, className) });
}
function HeaderSkeleton({ className }) {
  return /* @__PURE__ */ jsxs(HStack, { className: cn("items-center justify-between px-6 py-5", className), children: [
    /* @__PURE__ */ jsxs(VStack, { gap: "sm", className: "flex-1", children: [
      /* @__PURE__ */ jsx(SkeletonBlock, { className: "h-7 w-48" }),
      /* @__PURE__ */ jsx(SkeletonLine, { className: "w-64" })
    ] }),
    /* @__PURE__ */ jsxs(HStack, { gap: "sm", children: [
      /* @__PURE__ */ jsx(SkeletonBlock, { className: "h-9 w-24 rounded-[var(--radius-md)]" }),
      /* @__PURE__ */ jsx(SkeletonBlock, { className: "h-9 w-32 rounded-[var(--radius-md)]" })
    ] })
  ] });
}
function TableSkeleton({ rows = 5, columns = 4, className }) {
  return /* @__PURE__ */ jsxs(VStack, { gap: "none", className: cn("border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden", className), children: [
    /* @__PURE__ */ jsx(HStack, { className: "px-4 py-3 bg-[var(--color-muted)]/30 border-b border-[var(--color-border)]", children: Array.from({ length: columns }).map((_, i) => /* @__PURE__ */ jsx(SkeletonBlock, { className: "h-4 flex-1 mx-2" }, i)) }),
    Array.from({ length: rows }).map((_, rowIdx) => /* @__PURE__ */ jsx(
      HStack,
      {
        className: cn(
          "px-4 py-3",
          rowIdx < rows - 1 && "border-b border-[var(--color-border)]"
        ),
        children: Array.from({ length: columns }).map((_2, colIdx) => /* @__PURE__ */ jsx(SkeletonLine, { className: "flex-1 mx-2" }, colIdx))
      },
      rowIdx
    ))
  ] });
}
function FormSkeleton({ fields = 4, className }) {
  return /* @__PURE__ */ jsxs(VStack, { gap: "lg", className: cn("p-6", className), children: [
    /* @__PURE__ */ jsx(SkeletonBlock, { className: "h-6 w-40" }),
    Array.from({ length: fields }).map((_, i) => /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
      /* @__PURE__ */ jsx(SkeletonBlock, { className: "h-4 w-24" }),
      /* @__PURE__ */ jsx(SkeletonBlock, { className: "h-10 w-full rounded-[var(--radius-md)]" })
    ] }, i)),
    /* @__PURE__ */ jsxs(HStack, { gap: "md", className: "justify-end pt-2", children: [
      /* @__PURE__ */ jsx(SkeletonBlock, { className: "h-10 w-20 rounded-[var(--radius-md)]" }),
      /* @__PURE__ */ jsx(SkeletonBlock, { className: "h-10 w-24 rounded-[var(--radius-md)]" })
    ] })
  ] });
}
function CardSkeleton({ className }) {
  return /* @__PURE__ */ jsxs(
    VStack,
    {
      gap: "md",
      className: cn(
        "p-5 border border-[var(--color-border)] rounded-[var(--radius-lg)]",
        className
      ),
      children: [
        /* @__PURE__ */ jsxs(HStack, { className: "items-center", gap: "md", children: [
          /* @__PURE__ */ jsx(SkeletonBlock, { className: "h-10 w-10 rounded-full" }),
          /* @__PURE__ */ jsxs(VStack, { gap: "xs", className: "flex-1", children: [
            /* @__PURE__ */ jsx(SkeletonBlock, { className: "h-5 w-32" }),
            /* @__PURE__ */ jsx(SkeletonLine, { className: "w-48" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(SkeletonLine, { className: "w-full" }),
        /* @__PURE__ */ jsx(SkeletonLine, { className: "w-3/4" }),
        /* @__PURE__ */ jsxs(HStack, { gap: "sm", className: "pt-2", children: [
          /* @__PURE__ */ jsx(SkeletonBlock, { className: "h-6 w-16 rounded-full" }),
          /* @__PURE__ */ jsx(SkeletonBlock, { className: "h-6 w-20 rounded-full" })
        ] })
      ]
    }
  );
}
function TextSkeleton({ rows = 3, className }) {
  return /* @__PURE__ */ jsx(VStack, { gap: "sm", className, children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ jsx(
    SkeletonLine,
    {
      className: i === rows - 1 ? "w-2/3" : "w-full"
    },
    i
  )) });
}
function Skeleton({
  variant = "text",
  rows,
  columns,
  fields,
  className
}) {
  const { t: _t } = useTranslate();
  switch (variant) {
    case "header":
      return /* @__PURE__ */ jsx(HeaderSkeleton, { className });
    case "table":
      return /* @__PURE__ */ jsx(TableSkeleton, { rows, columns, className });
    case "form":
      return /* @__PURE__ */ jsx(FormSkeleton, { fields, className });
    case "card":
      return /* @__PURE__ */ jsx(CardSkeleton, { className });
    case "text":
      return /* @__PURE__ */ jsx(TextSkeleton, { rows, className });
    default:
      return /* @__PURE__ */ jsx(TextSkeleton, { rows, className });
  }
}
Skeleton.displayName = "Skeleton";
function generateItemId(item, index) {
  if (item.id) return item.id;
  const headerText = item.header ?? item.title;
  if (typeof headerText === "string") {
    return `accordion-${headerText.toLowerCase().replace(/\s+/g, "-")}-${index}`;
  }
  return `accordion-item-${index}`;
}
function normalizeItem(item, index) {
  return {
    ...item,
    id: generateItemId(item, index),
    header: item.header ?? item.title ?? ""
  };
}
var Accordion = ({
  items,
  multiple = false,
  defaultOpenItems,
  defaultOpen,
  openItems: controlledOpenItems,
  onItemToggle,
  className,
  toggleEvent
}) => {
  const eventBus = useEventBus();
  const normalizedItems = items.map(
    (item, index) => normalizeItem(item, index)
  );
  const resolveDefaultOpen = () => {
    if (defaultOpenItems) return defaultOpenItems;
    if (defaultOpen) {
      return defaultOpen.filter((index) => index >= 0 && index < normalizedItems.length).map((index) => normalizedItems[index].id);
    }
    return normalizedItems.filter((item) => item.defaultOpen).map((item) => item.id);
  };
  const [internalOpenItems, setInternalOpenItems] = useState(
    new Set(resolveDefaultOpen())
  );
  const openItemsSet = controlledOpenItems ? new Set(controlledOpenItems) : internalOpenItems;
  const handleToggle = (itemId) => {
    const isOpen = openItemsSet.has(itemId);
    const newOpenItems = new Set(openItemsSet);
    if (isOpen) {
      newOpenItems.delete(itemId);
    } else {
      if (!multiple) {
        newOpenItems.clear();
      }
      newOpenItems.add(itemId);
    }
    if (controlledOpenItems === void 0) {
      setInternalOpenItems(newOpenItems);
    }
    onItemToggle?.(itemId, !isOpen);
    if (toggleEvent) eventBus.emit(`UI:${toggleEvent}`, { itemId, isOpen: !isOpen });
  };
  return /* @__PURE__ */ jsx("div", { className: cn("w-full", className), children: normalizedItems.map((item, index) => {
    const isOpen = openItemsSet.has(item.id);
    const isDisabled = item.disabled;
    return /* @__PURE__ */ jsx("div", { className: index > 0 ? "mt-2" : "", children: /* @__PURE__ */ jsxs("div", { className: "border-2 border-[var(--color-border)] overflow-hidden", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => !isDisabled && handleToggle(item.id),
          disabled: isDisabled,
          className: cn(
            "w-full flex items-center justify-between px-4 py-3",
            "bg-[var(--color-card)]",
            "hover:bg-[var(--color-muted)]",
            "transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-inset",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isOpen && "bg-[var(--color-muted)] font-bold"
          ),
          "aria-expanded": isOpen,
          "aria-controls": `accordion-content-${item.id}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: "flex-1 text-left", children: typeof item.header === "string" ? /* @__PURE__ */ jsx(Typography, { variant: "body", weight: "medium", children: item.header }) : item.header }),
            /* @__PURE__ */ jsx(
              Icon,
              {
                icon: ChevronDown,
                size: "sm",
                className: cn(
                  "transition-transform duration-200",
                  isOpen && "transform rotate-180"
                )
              }
            )
          ]
        }
      ),
      isOpen && /* @__PURE__ */ jsx(
        "div",
        {
          id: `accordion-content-${item.id}`,
          className: "px-4 py-3 bg-[var(--color-card)] border-t-2 border-[var(--color-border)]",
          children: item.content
        }
      )
    ] }) }, item.id);
  }) });
};
Accordion.displayName = "Accordion";
var variantBorderClasses = {
  info: "border-[var(--color-info)]",
  success: "border-[var(--color-success)]",
  warning: "border-[var(--color-warning)]",
  error: "border-[var(--color-error)]"
};
var variantIconColors = {
  info: "text-[var(--color-info)]",
  success: "text-[var(--color-success)]",
  warning: "text-[var(--color-warning)]",
  error: "text-[var(--color-error)]"
};
var iconMap2 = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle
};
var Alert = ({
  children,
  message,
  variant = "info",
  title,
  dismissible = false,
  onDismiss,
  onClose,
  actions,
  className,
  dismissEvent
}) => {
  const eventBus = useEventBus();
  const handleDismissCallback = onDismiss || onClose;
  const handleDismiss = () => {
    if (dismissEvent) eventBus.emit(`UI:${dismissEvent}`, {});
    handleDismissCallback?.();
  };
  const content = children ?? message;
  return /* @__PURE__ */ jsx(
    Box,
    {
      bg: "surface",
      border: true,
      shadow: "sm",
      padding: "md",
      rounded: "sm",
      className: cn(variantBorderClasses[variant], className),
      role: "alert",
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 mt-0.5", children: /* @__PURE__ */ jsx(
          Icon,
          {
            icon: iconMap2[variant],
            size: "md",
            className: variantIconColors[variant]
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          title && /* @__PURE__ */ jsx(Typography, { variant: "h6", className: "mb-1", children: title }),
          /* @__PURE__ */ jsx(Typography, { variant: "body2", children: content }),
          actions && /* @__PURE__ */ jsx("div", { className: "mt-3 flex gap-2", children: actions })
        ] }),
        (dismissible || dismissEvent || handleDismissCallback) && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleDismiss,
            className: cn(
              "flex-shrink-0 p-1 transition-colors rounded-[var(--radius-sm)]",
              "hover:bg-[var(--color-muted)]"
            ),
            "aria-label": "Dismiss alert",
            children: /* @__PURE__ */ jsx(Icon, { icon: X, size: "sm" })
          }
        )
      ] })
    }
  );
};
Alert.displayName = "Alert";
var Breadcrumb = ({
  items,
  separator = ChevronRight,
  maxItems,
  className
}) => {
  const eventBus = useEventBus();
  const displayItems = maxItems && items.length > maxItems ? [
    ...items.slice(0, 1),
    { label: "...", isCurrent: false },
    ...items.slice(-maxItems + 1)
  ] : items;
  return /* @__PURE__ */ jsx(
    "nav",
    {
      "aria-label": "Breadcrumb",
      className: cn("flex items-center gap-2", className),
      children: /* @__PURE__ */ jsx("ol", { className: "flex items-center gap-2", children: displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1;
        const isEllipsis = item.label === "...";
        return /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2", children: [
          isEllipsis ? /* @__PURE__ */ jsx(Typography, { variant: "small", color: "muted", children: item.label }) : item.href || item.path ? /* @__PURE__ */ jsxs(
            "a",
            {
              href: item.href || item.path,
              className: cn(
                "flex items-center gap-1.5 transition-colors",
                isLast ? "text-[var(--color-foreground)] font-bold" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              ),
              "aria-current": isLast ? "page" : void 0,
              children: [
                item.icon && /* @__PURE__ */ jsx(Icon, { icon: item.icon, size: "sm" }),
                /* @__PURE__ */ jsx(
                  Typography,
                  {
                    variant: "small",
                    weight: isLast ? "medium" : "normal",
                    children: item.label
                  }
                )
              ]
            }
          ) : /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => {
                if (item.event) eventBus.emit(`UI:${item.event}`, { label: item.label });
                item.onClick?.();
              },
              className: cn(
                "flex items-center gap-1.5 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2",
                isLast ? "text-[var(--color-foreground)] font-bold cursor-default" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              ),
              "aria-current": isLast ? "page" : void 0,
              disabled: isLast,
              children: [
                item.icon && /* @__PURE__ */ jsx(Icon, { icon: item.icon, size: "sm" }),
                /* @__PURE__ */ jsx(
                  Typography,
                  {
                    variant: "small",
                    weight: isLast ? "medium" : "normal",
                    children: item.label
                  }
                )
              ]
            }
          ),
          !isLast && /* @__PURE__ */ jsx(
            Icon,
            {
              icon: separator,
              size: "sm",
              className: "text-[var(--color-muted-foreground)]"
            }
          )
        ] }, index);
      }) })
    }
  );
};
Breadcrumb.displayName = "Breadcrumb";
function useSafeEventBus() {
  try {
    return useEventBus();
  } catch {
    return { emit: () => {
    }, on: () => () => {
    }, once: () => {
    } };
  }
}
var ButtonGroup = ({
  children,
  primary,
  secondary,
  variant = "default",
  orientation = "horizontal",
  className,
  // Filter-group pattern props (entity and filters are used for schema-driven filtering)
  entity: _entity,
  filters
}) => {
  const eventBus = useSafeEventBus();
  const variantClasses2 = {
    default: "gap-0",
    segmented: "gap-0 [&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg [&>button:not(:first-child)]:border-l-0",
    toggle: "gap-0 [&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg [&>button:not(:first-child)]:border-l-0"
  };
  const orientationClasses = {
    horizontal: "flex-row",
    vertical: "flex-col [&>button:first-child]:rounded-t-lg [&>button:last-child]:rounded-b-lg [&>button:not(:first-child)]:border-t-0 [&>button:not(:first-child)]:border-l"
  };
  const handleActionClick = (action) => {
    if (action.event) {
      eventBus.emit("UI:DISPATCH", { event: action.event });
    }
    if (action.navigatesTo) {
      eventBus.emit("UI:NAVIGATE", { url: action.navigatesTo });
    }
  };
  const renderFormActions = () => {
    const buttons = [];
    if (secondary) {
      secondary.forEach((action, index) => {
        buttons.push(
          /* @__PURE__ */ jsx(
            Button,
            {
              type: action.actionType === "submit" ? "submit" : "button",
              variant: action.variant || "ghost",
              onClick: () => handleActionClick(action),
              children: action.label
            },
            `secondary-${index}`
          )
        );
      });
    }
    if (primary) {
      const isSubmit = primary.actionType === "submit";
      buttons.push(
        /* @__PURE__ */ jsx(
          Button,
          {
            type: isSubmit ? "submit" : "button",
            variant: primary.variant || "primary",
            onClick: () => handleActionClick(primary),
            "data-testid": isSubmit ? "form-submit" : void 0,
            children: primary.label
          },
          "primary"
        )
      );
    }
    return buttons;
  };
  const renderFilters = () => {
    if (!filters || filters.length === 0) return null;
    return filters.map((filter, index) => /* @__PURE__ */ jsx(
      Button,
      {
        variant: "ghost",
        onClick: () => {
          console.log(`Filter clicked: ${filter.field}`);
        },
        children: filter.label
      },
      `filter-${filter.field}-${index}`
    ));
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "inline-flex gap-2",
        variantClasses2[variant],
        orientationClasses[orientation],
        className
      ),
      role: "group",
      children: children || renderFilters() || renderFormActions()
    }
  );
};
ButtonGroup.displayName = "ButtonGroup";
var resolveFilterType = (filter) => filter.filterType ?? filter.type;
var FilterGroup = ({
  entity,
  filters,
  onFilterChange,
  onClearAll,
  className,
  variant = "default",
  showIcon = true,
  query,
  isLoading
}) => {
  const eventBus = useEventBus();
  const queryState = useQuerySingleton(query);
  const [selectedValues, setSelectedValues] = useState(
    () => {
      if (queryState?.filters) {
        return Object.fromEntries(
          Object.entries(queryState.filters).filter(([_, v]) => v !== null && v !== void 0).map(([k, v]) => [k, String(v)])
        );
      }
      return {};
    }
  );
  useEffect(() => {
    if (queryState?.filters) {
      const newValues = Object.fromEntries(
        Object.entries(queryState.filters).filter(([_, v]) => v !== null && v !== void 0).map(([k, v]) => [k, String(v)])
      );
      setSelectedValues(newValues);
    }
  }, [queryState?.filters]);
  const handleFilterSelect = useCallback(
    (field, value) => {
      setSelectedValues((prev) => {
        if (value === null || value === "" || value === "all") {
          const next = { ...prev };
          delete next[field];
          return next;
        }
        return { ...prev, [field]: value };
      });
      if (queryState) {
        queryState.setFilter(field, value === "all" ? null : value);
      }
      onFilterChange?.(field, value === "all" ? null : value);
      eventBus.emit("UI:FILTER", {
        entity,
        field,
        value: value === "all" ? null : value,
        query
      });
    },
    [onFilterChange, queryState, eventBus, entity, query]
  );
  const handleClearAll = useCallback(() => {
    setSelectedValues({});
    if (queryState) {
      queryState.clearFilters();
    }
    onClearAll?.();
    eventBus.emit("UI:CLEAR_FILTERS", { entity, query });
  }, [onClearAll, queryState, eventBus, entity, query]);
  const activeFilterCount = Object.keys(selectedValues).length;
  if (variant === "pills") {
    return /* @__PURE__ */ jsxs(HStack, { gap: "md", align: "center", className: cn("flex-wrap", className), children: [
      showIcon && /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4 text-[var(--color-muted-foreground)]" }),
      filters.map((filter) => /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-sm font-[var(--font-weight-medium)] text-[var(--color-muted-foreground)]", children: [
          filter.label,
          ":"
        ] }),
        /* @__PURE__ */ jsxs(
          HStack,
          {
            gap: "none",
            className: "rounded-[var(--radius-sm)] overflow-hidden border-[length:var(--border-width)] border-[var(--color-border)]",
            children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => handleFilterSelect(filter.field, null),
                  className: cn(
                    "px-3 py-1.5 text-sm font-[var(--font-weight-medium)] transition-all duration-[var(--transition-fast)]",
                    !selectedValues[filter.field] ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]" : "bg-[var(--color-card)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
                  ),
                  children: "All"
                }
              ),
              filter.options?.map((option) => /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => handleFilterSelect(filter.field, option),
                  className: cn(
                    "px-3 py-1.5 text-sm font-[var(--font-weight-medium)] transition-all duration-[var(--transition-fast)]",
                    "border-l-[length:var(--border-width)] border-[var(--color-border)]",
                    selectedValues[filter.field] === option ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]" : "bg-[var(--color-card)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
                  ),
                  children: option
                },
                option
              ))
            ]
          }
        )
      ] }, filter.field)),
      activeFilterCount > 0 && /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: handleClearAll,
          leftIcon: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }),
          children: "Clear"
        }
      )
    ] });
  }
  if (variant === "vertical") {
    return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col gap-4", className), children: [
      showIcon && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[var(--color-muted-foreground)]", children: [
        /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-[var(--font-weight-bold)] uppercase tracking-wide", children: "Filters" })
      ] }),
      filters.map((filter) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs font-[var(--font-weight-bold)] text-[var(--color-muted-foreground)] uppercase tracking-wide", children: filter.label }),
        resolveFilterType(filter) === "date" ? /* @__PURE__ */ jsx(
          Input,
          {
            type: "date",
            value: selectedValues[filter.field] || "",
            onChange: (e) => handleFilterSelect(filter.field, e.target.value || null),
            clearable: true,
            onClear: () => handleFilterSelect(filter.field, null)
          }
        ) : resolveFilterType(filter) === "daterange" || resolveFilterType(filter) === "date-range" ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "date",
              value: selectedValues[`${filter.field}_from`] || "",
              onChange: (e) => handleFilterSelect(
                `${filter.field}_from`,
                e.target.value || null
              ),
              placeholder: "From",
              clearable: true,
              onClear: () => handleFilterSelect(`${filter.field}_from`, null)
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "date",
              value: selectedValues[`${filter.field}_to`] || "",
              onChange: (e) => handleFilterSelect(
                `${filter.field}_to`,
                e.target.value || null
              ),
              placeholder: "To",
              clearable: true,
              onClear: () => handleFilterSelect(`${filter.field}_to`, null)
            }
          )
        ] }) : /* @__PURE__ */ jsx(
          Select,
          {
            value: selectedValues[filter.field] || "all",
            onChange: (e) => handleFilterSelect(filter.field, e.target.value),
            options: [
              { value: "all", label: "All" },
              ...filter.options?.map((opt) => ({
                value: opt,
                label: opt
              })) || []
            ]
          }
        )
      ] }, filter.field)),
      activeFilterCount > 0 && /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: handleClearAll,
          leftIcon: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }),
          className: "self-start",
          children: "Clear all"
        }
      )
    ] });
  }
  if (variant === "compact") {
    return /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", className: cn("flex-wrap", className), children: [
      showIcon && /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4 text-[var(--color-muted-foreground)]" }),
      filters.map((filter) => /* @__PURE__ */ jsx("div", { className: "min-w-[120px]", children: resolveFilterType(filter) === "date" ? /* @__PURE__ */ jsx(
        Input,
        {
          type: "date",
          value: selectedValues[filter.field] || "",
          onChange: (e) => handleFilterSelect(filter.field, e.target.value || null),
          clearable: true,
          onClear: () => handleFilterSelect(filter.field, null),
          className: "text-sm"
        }
      ) : resolveFilterType(filter) === "daterange" || resolveFilterType(filter) === "date-range" ? /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            type: "date",
            value: selectedValues[`${filter.field}_from`] || "",
            onChange: (e) => handleFilterSelect(
              `${filter.field}_from`,
              e.target.value || null
            ),
            className: "text-sm min-w-[100px]"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-[var(--color-muted-foreground)]", children: "-" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            type: "date",
            value: selectedValues[`${filter.field}_to`] || "",
            onChange: (e) => handleFilterSelect(
              `${filter.field}_to`,
              e.target.value || null
            ),
            className: "text-sm min-w-[100px]"
          }
        )
      ] }) : /* @__PURE__ */ jsx(
        Select,
        {
          value: selectedValues[filter.field] || "all",
          onChange: (e) => handleFilterSelect(filter.field, e.target.value),
          options: [
            { value: "all", label: `All ${filter.label}` },
            ...filter.options?.map((opt) => ({
              value: opt,
              label: opt
            })) || []
          ],
          className: "text-sm"
        }
      ) }, filter.field)),
      activeFilterCount > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        Object.entries(selectedValues).map(([field, value]) => {
          const filterDef = filters.find((f) => f.field === field);
          return /* @__PURE__ */ jsxs(
            Badge,
            {
              variant: "primary",
              size: "md",
              className: "cursor-pointer",
              onClick: () => handleFilterSelect(field, null),
              children: [
                filterDef?.label,
                ": ",
                value,
                /* @__PURE__ */ jsx(X, { className: "ml-1 h-3 w-3" })
              ]
            },
            field
          );
        }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: handleClearAll, children: "Clear all" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "p-4 rounded-[var(--radius-md)]",
        "bg-[var(--color-card)]",
        "border-[length:var(--border-width)] border-[var(--color-border)]",
        className
      ),
      children: /* @__PURE__ */ jsxs(HStack, { gap: "md", align: "center", className: "flex-wrap", children: [
        showIcon && /* @__PURE__ */ jsxs(
          HStack,
          {
            gap: "xs",
            align: "center",
            className: "text-[var(--color-muted-foreground)]",
            children: [
              /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-[var(--font-weight-bold)] uppercase tracking-wide", children: "Filters" })
            ]
          }
        ),
        filters.map((filter) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-[var(--font-weight-bold)] text-[var(--color-muted-foreground)] uppercase tracking-wide", children: filter.label }),
          resolveFilterType(filter) === "date" ? /* @__PURE__ */ jsx(
            Input,
            {
              type: "date",
              value: selectedValues[filter.field] || "",
              onChange: (e) => handleFilterSelect(filter.field, e.target.value || null),
              clearable: true,
              onClear: () => handleFilterSelect(filter.field, null),
              className: "min-w-[160px]"
            }
          ) : resolveFilterType(filter) === "daterange" || resolveFilterType(filter) === "date-range" ? /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "date",
                value: selectedValues[`${filter.field}_from`] || "",
                onChange: (e) => handleFilterSelect(
                  `${filter.field}_from`,
                  e.target.value || null
                ),
                placeholder: "From",
                clearable: true,
                onClear: () => handleFilterSelect(`${filter.field}_from`, null),
                className: "min-w-[130px]"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-[var(--color-muted-foreground)]", children: "-" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "date",
                value: selectedValues[`${filter.field}_to`] || "",
                onChange: (e) => handleFilterSelect(
                  `${filter.field}_to`,
                  e.target.value || null
                ),
                placeholder: "To",
                clearable: true,
                onClear: () => handleFilterSelect(`${filter.field}_to`, null),
                className: "min-w-[130px]"
              }
            )
          ] }) : /* @__PURE__ */ jsx(
            Select,
            {
              value: selectedValues[filter.field] || "all",
              onChange: (e) => handleFilterSelect(filter.field, e.target.value),
              options: [
                { value: "all", label: "All" },
                ...filter.options?.map((opt) => ({
                  value: opt,
                  label: opt
                })) || []
              ],
              className: "min-w-[140px]"
            }
          )
        ] }, filter.field)),
        activeFilterCount > 0 && /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", className: "ml-auto", children: [
          /* @__PURE__ */ jsxs(Badge, { variant: "primary", size: "md", children: [
            activeFilterCount,
            " active"
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: handleClearAll,
              leftIcon: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }),
              children: "Clear all"
            }
          )
        ] })
      ] })
    }
  );
};
FilterGroup.displayName = "FilterGroup";
function Card2({
  title,
  subtitle,
  image,
  actions,
  children,
  onClick,
  className = "",
  action
}) {
  const eventBus = useEventBus();
  const isClickable = !!onClick || !!action;
  const handleClick = () => {
    if (action) eventBus.emit(`UI:${action}`, {});
    onClick?.();
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `
        bg-[var(--color-card)]
        border border-[var(--color-border)]
        rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]
        ${isClickable ? "cursor-pointer hover:shadow-[var(--shadow-hover)] transition-shadow" : ""}
        ${className}
      `,
      onClick: isClickable ? handleClick : void 0,
      role: isClickable ? "button" : void 0,
      tabIndex: isClickable ? 0 : void 0,
      onKeyDown: isClickable ? (e) => e.key === "Enter" && handleClick() : void 0,
      children: [
        image && /* @__PURE__ */ jsx("div", { className: "aspect-video w-full overflow-hidden rounded-t-lg", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: image,
            alt: title || "Card image",
            className: "w-full h-full object-cover"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
          (title || subtitle) && /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
            title && /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-[var(--color-card-foreground)]", children: title }),
            subtitle && /* @__PURE__ */ jsx("p", { className: "text-sm text-[var(--color-muted-foreground)] mt-1", children: subtitle })
          ] }),
          children && /* @__PURE__ */ jsx("div", { className: "text-[var(--color-card-foreground)]", children }),
          actions && actions.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--color-border)]", children: actions.map((action2, index) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                if (action2.event) eventBus.emit(`UI:${action2.event}`, { label: action2.label });
                action2.onClick?.();
              },
              disabled: action2.disabled,
              className: `
                  px-3 py-1.5 text-sm font-medium rounded-[var(--radius-sm)]
                  transition-colors
                  ${action2.variant === "primary" ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50" : action2.variant === "danger" ? "bg-[var(--color-error)] text-[var(--color-error-foreground)] hover:opacity-90 disabled:opacity-50" : "bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]"}
                  disabled:cursor-not-allowed
                `,
              children: action2.label
            },
            index
          )) })
        ] })
      ]
    }
  );
}
Card2.displayName = "Card";
var sizeStyles5 = {
  xs: "max-w-xs",
  // 320px
  sm: "max-w-screen-sm",
  // 640px
  md: "max-w-screen-md",
  // 768px
  lg: "max-w-screen-lg",
  // 1024px
  xl: "max-w-screen-xl",
  // 1280px
  "2xl": "max-w-screen-2xl",
  // 1536px
  full: "max-w-full"
};
var paddingStyles3 = {
  none: "px-0",
  sm: "px-4",
  md: "px-6",
  lg: "px-8",
  xl: "px-12"
};
var Container = ({
  size,
  maxWidth,
  padding = "md",
  center = true,
  className,
  children,
  as: Component = "div"
}) => {
  const resolvedSize = maxWidth ?? size ?? "lg";
  return /* @__PURE__ */ jsx(
    Component,
    {
      className: cn(
        "w-full",
        sizeStyles5[resolvedSize],
        paddingStyles3[padding],
        center && "mx-auto",
        className
      ),
      children
    }
  );
};
Container.displayName = "Container";
var directionStyles = {
  row: "flex-row",
  "row-reverse": "flex-row-reverse",
  col: "flex-col",
  "col-reverse": "flex-col-reverse"
};
var wrapStyles = {
  nowrap: "flex-nowrap",
  wrap: "flex-wrap",
  "wrap-reverse": "flex-wrap-reverse"
};
var alignStyles2 = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline"
};
var justifyStyles2 = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly"
};
var gapStyles2 = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
  "2xl": "gap-12"
};
var Flex = ({
  direction = "row",
  wrap = "nowrap",
  align = "stretch",
  justify = "start",
  gap = "none",
  inline = false,
  grow,
  shrink,
  basis,
  className,
  children,
  as: Component = "div"
}) => {
  const flexStyle = {};
  if (grow !== void 0 || shrink !== void 0 || basis !== void 0) {
    const growValue = grow === true ? 1 : grow === false ? 0 : grow;
    const shrinkValue = shrink === true ? 1 : shrink === false ? 0 : shrink;
    flexStyle.flexGrow = growValue;
    flexStyle.flexShrink = shrinkValue;
    if (basis !== void 0) {
      flexStyle.flexBasis = typeof basis === "number" ? `${basis}px` : basis;
    }
  }
  return /* @__PURE__ */ jsx(
    Component,
    {
      className: cn(
        inline ? "inline-flex" : "flex",
        directionStyles[direction],
        wrapStyles[wrap],
        alignStyles2[align],
        justifyStyles2[justify],
        gapStyles2[gap],
        className
      ),
      style: Object.keys(flexStyle).length > 0 ? flexStyle : void 0,
      children
    }
  );
};
Flex.displayName = "Flex";
function resolveIcon2(name) {
  const pascalName = name.split(/[-_]/).map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join("");
  const icons = LucideIcons;
  const icon = icons[pascalName];
  if (icon) {
    return icon;
  }
  return Plus;
}
var FloatingActionButton = ({
  action,
  actions,
  icon,
  onClick,
  variant,
  position = "bottom-right",
  className
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const resolvedAction = action ?? (icon ? {
    icon: resolveIcon2(icon),
    onClick: onClick ?? (() => {
    }),
    variant
  } : void 0);
  const [isExpanded, setIsExpanded] = useState(false);
  const fabRef = useRef(null);
  useEffect(() => {
    if (!isExpanded || !actions || actions.length <= 1) return;
    const handleClickOutside = (event) => {
      if (fabRef.current && !fabRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, actions]);
  const positionClasses3 = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
    "top-center": "top-6 left-1/2 -translate-x-1/2"
  };
  if (resolvedAction && (!actions || actions.length === 0)) {
    return /* @__PURE__ */ jsx(Box, { className: cn("fixed z-50", positionClasses3[position], className), children: /* @__PURE__ */ jsx(
      Button,
      {
        variant: resolvedAction.variant || "primary",
        size: "lg",
        icon: resolvedAction.icon,
        onClick: resolvedAction.onClick,
        className: "rounded-[var(--radius-full)] shadow-[var(--shadow-lg)]",
        "aria-label": resolvedAction.label || "Action",
        children: resolvedAction.label && /* @__PURE__ */ jsx(Typography, { as: "span", className: "sr-only", children: resolvedAction.label })
      }
    ) });
  }
  if (actions && actions.length > 0) {
    const handleMainClick = () => {
      if (actions.length === 1) {
        if (actions[0].event) eventBus.emit(`UI:${actions[0].event}`, { actionId: actions[0].id });
        actions[0].onClick?.();
      } else {
        setIsExpanded(!isExpanded);
      }
    };
    return /* @__PURE__ */ jsxs(
      Box,
      {
        ref: fabRef,
        className: cn(
          "fixed z-50 flex flex-col items-end gap-3",
          positionClasses3[position],
          position.includes("left") && "items-start",
          className
        ),
        children: [
          isExpanded && actions.length > 1 && /* @__PURE__ */ jsx(
            VStack,
            {
              className: cn(
                "gap-3",
                position.includes("left") ? "items-start" : "items-end"
              ),
              children: actions.map((actionItem, index) => /* @__PURE__ */ jsxs(
                HStack,
                {
                  align: "center",
                  gap: "sm",
                  className: "transition-all duration-200",
                  style: {
                    opacity: isExpanded ? 1 : 0,
                    transform: isExpanded ? "translateY(0)" : "translateY(10px)",
                    transitionDelay: `${index * 50}ms`
                  },
                  children: [
                    position.includes("right") && /* @__PURE__ */ jsx(Typography, { variant: "small", className: "text-[var(--color-foreground)] dark:text-[var(--color-foreground)] bg-[var(--color-card)] dark:bg-[var(--color-card)] px-2 py-1 rounded shadow-[var(--shadow-sm)] whitespace-nowrap", children: actionItem.label }),
                    /* @__PURE__ */ jsx(
                      Button,
                      {
                        variant: actionItem.variant || "primary",
                        size: "lg",
                        icon: actionItem.icon,
                        onClick: () => {
                          setIsExpanded(false);
                          if (actionItem.event) eventBus.emit(`UI:${actionItem.event}`, { actionId: actionItem.id });
                          actionItem.onClick?.();
                        },
                        className: "rounded-[var(--radius-full)] shadow-[var(--shadow-lg)]",
                        "aria-label": actionItem.label,
                        children: /* @__PURE__ */ jsx(Typography, { as: "span", className: "sr-only", children: actionItem.label })
                      }
                    ),
                    position.includes("left") && /* @__PURE__ */ jsx(Typography, { variant: "small", className: "text-[var(--color-foreground)] dark:text-[var(--color-foreground)] bg-[var(--color-card)] dark:bg-[var(--color-card)] px-2 py-1 rounded shadow-[var(--shadow-sm)] whitespace-nowrap", children: actionItem.label })
                  ]
                },
                actionItem.id
              ))
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: isExpanded ? "secondary" : "primary",
              size: "lg",
              icon: isExpanded ? X : Plus,
              onClick: handleMainClick,
              className: "rounded-[var(--radius-full)] shadow-[var(--shadow-lg)] transition-all duration-300",
              "aria-label": isExpanded ? "Close actions" : "Open actions",
              "aria-expanded": isExpanded,
              children: /* @__PURE__ */ jsx(Typography, { as: "span", className: "sr-only", children: isExpanded ? t("common.close") : t("common.open") })
            }
          )
        ]
      }
    );
  }
  return null;
};
FloatingActionButton.displayName = "FloatingActionButton";
var colStyles = {
  none: "grid-cols-none",
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
  9: "grid-cols-9",
  10: "grid-cols-10",
  11: "grid-cols-11",
  12: "grid-cols-12"
};
var gapStyles3 = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
  "2xl": "gap-12"
};
var rowGapStyles = {
  none: "gap-y-0",
  xs: "gap-y-1",
  sm: "gap-y-2",
  md: "gap-y-4",
  lg: "gap-y-6",
  xl: "gap-y-8",
  "2xl": "gap-y-12"
};
var colGapStyles = {
  none: "gap-x-0",
  xs: "gap-x-1",
  sm: "gap-x-2",
  md: "gap-x-4",
  lg: "gap-x-6",
  xl: "gap-x-8",
  "2xl": "gap-x-12"
};
var alignStyles3 = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline"
};
var justifyStyles3 = {
  start: "justify-items-start",
  center: "justify-items-center",
  end: "justify-items-end",
  stretch: "justify-items-stretch"
};
var flowStyles = {
  row: "grid-flow-row",
  col: "grid-flow-col",
  "row-dense": "grid-flow-row-dense",
  "col-dense": "grid-flow-col-dense"
};
function getColsClass(cols) {
  if (typeof cols === "number" || cols === "none") {
    return colStyles[cols];
  }
  const classes = [];
  if (cols.base !== void 0) {
    classes.push(colStyles[cols.base]);
  }
  if (cols.sm !== void 0) {
    classes.push(`sm:${colStyles[cols.sm]}`);
  }
  if (cols.md !== void 0) {
    classes.push(`md:${colStyles[cols.md]}`);
  }
  if (cols.lg !== void 0) {
    classes.push(`lg:${colStyles[cols.lg]}`);
  }
  if (cols.xl !== void 0) {
    classes.push(`xl:${colStyles[cols.xl]}`);
  }
  return classes.join(" ");
}
var Grid2 = ({
  cols = 1,
  rows,
  gap = "md",
  rowGap,
  colGap,
  alignItems,
  justifyItems,
  flow,
  className,
  style,
  children,
  as: Component = "div"
}) => {
  const mergedStyle = rows ? { gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`, ...style } : style;
  return /* @__PURE__ */ jsx(
    Component,
    {
      className: cn(
        "grid",
        getColsClass(cols),
        // Gap (rowGap/colGap override gap)
        rowGap ? rowGapStyles[rowGap] : colGap ? void 0 : gapStyles3[gap],
        colGap ? colGapStyles[colGap] : rowGap ? void 0 : void 0,
        rowGap && colGap ? `${rowGapStyles[rowGap]} ${colGapStyles[colGap]}` : void 0,
        // Alignment
        alignItems && alignStyles3[alignItems],
        justifyItems && justifyStyles3[justifyItems],
        // Flow
        flow && flowStyles[flow],
        className
      ),
      style: mergedStyle,
      children
    }
  );
};
Grid2.displayName = "Grid";
var InputGroup = ({
  leftAddon,
  rightAddon,
  className: groupClassName,
  ...inputProps
}) => {
  const { className: inputClassName, ...restInputProps } = inputProps;
  const renderAddon = (addon, position) => {
    if (!addon) return null;
    if (typeof addon === "function" || typeof addon === "object" && addon !== null && "render" in addon) {
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(
            "flex items-center justify-center px-3",
            "bg-[var(--color-muted)] dark:bg-[var(--color-muted)]",
            "border border-[var(--color-border)] dark:border-[var(--color-border)]",
            position === "left" ? "rounded-l-lg border-r-0" : "rounded-r-lg border-l-0"
          ),
          children: /* @__PURE__ */ jsx(Icon, { icon: addon, size: "sm" })
        }
      );
    }
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(
          "flex items-center justify-center px-3",
          "bg-[var(--color-muted)] dark:bg-[var(--color-muted)]",
          "border border-[var(--color-border)] dark:border-[var(--color-border)]",
          "text-[var(--color-foreground)] dark:text-[var(--color-foreground)]",
          position === "left" ? "rounded-l-lg border-r-0" : "rounded-r-lg border-l-0"
        ),
        children: typeof addon === "string" ? /* @__PURE__ */ jsx(Typography, { variant: "small", children: addon }) : addon
      }
    );
  };
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-stretch", groupClassName), children: [
    leftAddon && renderAddon(leftAddon, "left"),
    /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx(
      Input,
      {
        ...restInputProps,
        className: cn(
          leftAddon ? "rounded-l-none" : "",
          rightAddon ? "rounded-r-none" : "",
          inputClassName
        )
      }
    ) }),
    rightAddon && renderAddon(rightAddon, "right")
  ] });
};
InputGroup.displayName = "InputGroup";
var Menu2 = ({
  trigger,
  items,
  position = "bottom-left",
  className
}) => {
  const eventBus = useEventBus();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [triggerRect, setTriggerRect] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
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
  };
  const handleItemClick = (item) => {
    if (item.disabled) return;
    if (item.subMenu && item.subMenu.length > 0) {
      setActiveSubMenu(item.id ?? null);
    } else {
      if (item.event) eventBus.emit(`UI:${item.event}`, { itemId: item.id, label: item.label });
      item.onClick?.();
      setIsOpen(false);
    }
  };
  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveSubMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);
  const positionClasses3 = {
    "top-left": "bottom-full left-0 mb-2",
    "top-right": "bottom-full right-0 mb-2",
    "bottom-left": "top-full left-0 mt-2",
    "bottom-right": "top-full right-0 mt-2",
    // Aliases for pattern compatibility
    "top-start": "bottom-full left-0 mb-2",
    "top-end": "bottom-full right-0 mb-2",
    "bottom-start": "top-full left-0 mt-2",
    "bottom-end": "top-full right-0 mt-2"
  };
  const triggerChild = React41__default.isValidElement(trigger) ? trigger : /* @__PURE__ */ jsx("span", { children: trigger });
  const triggerElement = React41__default.cloneElement(
    triggerChild,
    {
      ref: triggerRef,
      onClick: handleToggle
    }
  );
  const menuContainerStyles = cn(
    "bg-[var(--color-card)]",
    "border-[length:var(--border-width)] border-[var(--color-border)]",
    "shadow-[var(--shadow-main)]",
    "rounded-[var(--radius-sm)]",
    "min-w-[200px] py-1"
  );
  const renderMenuItem = (item, hasSubMenu, index) => {
    const itemId = item.id ?? `item-${item.label.toLowerCase().replace(/\s+/g, "-")}-${index}`;
    const isDanger = item.variant === "danger";
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => handleItemClick({ ...item, id: itemId }),
        disabled: item.disabled,
        onMouseEnter: () => hasSubMenu && setActiveSubMenu(itemId),
        className: cn(
          "w-full flex items-center justify-between gap-3 px-4 py-2 text-left",
          "text-sm transition-colors",
          "hover:bg-[var(--color-muted)]",
          "focus:outline-none focus:bg-[var(--color-muted)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          item.disabled && "cursor-not-allowed",
          isDanger && "text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
        ),
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [
          item.icon && (typeof item.icon === "string" ? /* @__PURE__ */ jsx(Icon, { name: item.icon, size: "sm", className: "flex-shrink-0" }) : /* @__PURE__ */ jsx(Icon, { icon: item.icon, size: "sm", className: "flex-shrink-0" })),
          /* @__PURE__ */ jsx(
            Typography,
            {
              variant: "small",
              className: cn("flex-1", isDanger && "text-red-600"),
              children: item.label
            }
          ),
          item.badge !== void 0 && /* @__PURE__ */ jsx(Badge, { variant: "default", size: "sm", children: item.badge }),
          hasSubMenu && /* @__PURE__ */ jsx(Icon, { icon: ChevronRight, size: "sm", className: "flex-shrink-0" })
        ] })
      },
      itemId
    );
  };
  const renderMenuItems = (menuItems) => {
    return menuItems.map((item, index) => {
      const hasSubMenu = item.subMenu && item.subMenu.length > 0;
      const isDivider = item.id === "divider" || item.label === "divider";
      const itemId = item.id ?? `item-${item.label.toLowerCase().replace(/\s+/g, "-")}-${index}`;
      if (isDivider) {
        return /* @__PURE__ */ jsx(Divider, { className: "my-1" }, `divider-${index}`);
      }
      return /* @__PURE__ */ jsxs("div", { children: [
        renderMenuItem(item, !!hasSubMenu, index),
        hasSubMenu && activeSubMenu === itemId && item.subMenu && /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "absolute left-full top-0 ml-2 z-50",
              menuContainerStyles
            ),
            children: renderMenuItems(item.subMenu)
          }
        )
      ] }, itemId);
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    triggerElement,
    isOpen && triggerRect && /* @__PURE__ */ jsx(
      "div",
      {
        ref: menuRef,
        className: cn(
          "absolute z-50",
          menuContainerStyles,
          positionClasses3[position],
          className
        ),
        style: {
          left: position.includes("left") ? 0 : "auto",
          right: position.includes("right") ? 0 : "auto"
        },
        role: "menu",
        children: renderMenuItems(items)
      }
    )
  ] });
};
Menu2.displayName = "Menu";
var sizeClasses4 = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-full mx-4"
};
var Modal = ({
  isOpen = true,
  onClose = () => {
  },
  title,
  children = null,
  footer,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  closeEvent
}) => {
  const eventBus = useEventBus();
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0];
      firstElement?.focus();
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (closeEvent) eventBus.emit(`UI:${closeEvent}`, {});
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose, closeEvent, eventBus]);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  if (!isOpen) return null;
  const handleClose = () => {
    if (closeEvent) eventBus.emit(`UI:${closeEvent}`, {});
    onClose();
  };
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose();
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Overlay,
      {
        isVisible: isOpen,
        onClick: handleOverlayClick,
        className: "z-40"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none", children: /* @__PURE__ */ jsxs(
      Box,
      {
        ref: modalRef,
        bg: "surface",
        border: true,
        shadow: "lg",
        rounded: "md",
        className: cn(
          "pointer-events-auto w-full flex flex-col max-h-[90vh]",
          sizeClasses4[size],
          className
        ),
        role: "dialog",
        "aria-modal": "true",
        ...title && { "aria-labelledby": "modal-title" },
        children: [
          (title || showCloseButton) && /* @__PURE__ */ jsxs(
            "div",
            {
              className: cn(
                "px-6 py-4 flex items-center justify-between",
                "border-b-[length:var(--border-width)] border-[var(--color-border)]"
              ),
              children: [
                title && /* @__PURE__ */ jsx(Typography, { variant: "h4", as: "h2", id: "modal-title", children: title }),
                showCloseButton && /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: handleClose,
                    className: cn(
                      "p-1 transition-colors rounded-[var(--radius-sm)]",
                      "hover:bg-[var(--color-muted)]"
                    ),
                    "aria-label": "Close modal",
                    children: /* @__PURE__ */ jsx(Icon, { icon: X, size: "md" })
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-6", children }),
          footer && /* @__PURE__ */ jsx(
            "div",
            {
              className: cn(
                "px-6 py-4 bg-[var(--color-muted)]",
                "border-t-[length:var(--border-width)] border-[var(--color-border)]"
              ),
              children: footer
            }
          )
        ]
      }
    ) })
  ] });
};
Modal.displayName = "Modal";
var Pagination = ({
  currentPage,
  totalPages,
  onPageChange = () => {
  },
  showPageSize = false,
  pageSizeOptions = [10, 20, 50, 100],
  pageSize,
  onPageSizeChange,
  showJumpToPage = false,
  showTotal = false,
  totalItems,
  maxVisiblePages = 7,
  className,
  pageChangeEvent,
  pageSizeChangeEvent
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const [jumpToPage, setJumpToPage] = useState("");
  const handlePageChange = (page) => {
    if (pageChangeEvent) eventBus.emit(`UI:${pageChangeEvent}`, { page });
    onPageChange(page);
  };
  const handlePageSizeChange = (size) => {
    if (pageSizeChangeEvent) eventBus.emit(`UI:${pageSizeChangeEvent}`, { pageSize: size });
    onPageSizeChange?.(size);
  };
  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage, 10);
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page);
      setJumpToPage("");
    }
  };
  const getPageNumbers = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= halfVisible + 1) {
        for (let i = 1; i <= maxVisiblePages - 2; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - halfVisible) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - maxVisiblePages + 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - halfVisible + 2; i <= currentPage + halfVisible - 2; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }
    return pages;
  };
  const pageNumbers = getPageNumbers();
  return /* @__PURE__ */ jsxs(HStack, { align: "center", className: cn("justify-between gap-4", className), children: [
    /* @__PURE__ */ jsxs(HStack, { align: "center", gap: "sm", children: [
      showTotal && totalItems !== void 0 && /* @__PURE__ */ jsxs(Typography, { variant: "small", color: "secondary", children: [
        t("pagination.total"),
        " ",
        totalItems
      ] }),
      showPageSize && pageSize && onPageSizeChange && /* @__PURE__ */ jsxs(HStack, { align: "center", gap: "sm", children: [
        /* @__PURE__ */ jsx(Typography, { variant: "small", color: "secondary", children: t("pagination.show") }),
        /* @__PURE__ */ jsx(
          Select,
          {
            value: String(pageSize),
            onChange: (e) => handlePageSizeChange(Number(e.target.value)),
            options: pageSizeOptions.map((size) => ({
              value: String(size),
              label: String(size)
            })),
            className: "px-2 py-1 text-sm"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs(HStack, { align: "center", gap: "xs", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "secondary",
          size: "sm",
          onClick: () => handlePageChange(currentPage - 1),
          disabled: currentPage === 1,
          icon: ChevronLeft,
          children: t("pagination.previous")
        }
      ),
      /* @__PURE__ */ jsx(HStack, { align: "center", gap: "xs", children: pageNumbers.map((page, index) => {
        if (page === "ellipsis") {
          return /* @__PURE__ */ jsx(
            Typography,
            {
              variant: "small",
              color: "muted",
              className: "px-2",
              children: "..."
            },
            `ellipsis-${index}`
          );
        }
        const isActive = page === currentPage;
        return /* @__PURE__ */ jsx(
          Button,
          {
            variant: isActive ? "primary" : "ghost",
            size: "sm",
            onClick: () => handlePageChange(page),
            className: "min-w-[2.5rem]",
            children: page
          },
          page
        );
      }) }),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "secondary",
          size: "sm",
          onClick: () => handlePageChange(currentPage + 1),
          disabled: currentPage === totalPages,
          iconRight: ChevronRight,
          children: t("pagination.next")
        }
      )
    ] }),
    showJumpToPage && /* @__PURE__ */ jsxs(HStack, { align: "center", gap: "sm", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "small", color: "secondary", children: t("pagination.goTo") }),
      /* @__PURE__ */ jsx(
        Input,
        {
          type: "number",
          value: jumpToPage,
          onChange: (e) => setJumpToPage(e.target.value),
          placeholder: "Page",
          className: "w-20",
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              handleJumpToPage();
            }
          }
        }
      ),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: handleJumpToPage, children: t("pagination.go") })
    ] })
  ] });
};
Pagination.displayName = "Pagination";
var positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2"
};
var arrowClasses = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-white border-l-transparent border-r-transparent border-b-transparent",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-white border-l-transparent border-r-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-white border-t-transparent border-b-transparent border-r-transparent",
  right: "right-full top-1/2 -translate-y-1/2 border-r-white border-t-transparent border-b-transparent border-l-transparent"
};
var Popover = ({
  content,
  children,
  position = "bottom",
  trigger = "click",
  showArrow = true,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const updatePosition = () => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
  };
  const handleOpen = () => {
    updatePosition();
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
  };
  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  };
  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);
  useEffect(() => {
    if (trigger !== "click") {
      return;
    }
    const handleClickOutside = (e) => {
      if (isOpen && popoverRef.current && !popoverRef.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, trigger]);
  const triggerProps = trigger === "click" ? {
    onClick: handleToggle
  } : {
    onMouseEnter: handleOpen,
    onMouseLeave: handleClose
  };
  const childElement = React41__default.isValidElement(children) ? children : /* @__PURE__ */ jsx("span", { children });
  const triggerElement = React41__default.cloneElement(
    childElement,
    {
      ref: triggerRef,
      ...triggerProps
    }
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    triggerElement,
    isOpen && triggerRect && /* @__PURE__ */ jsxs(
      "div",
      {
        ref: popoverRef,
        className: cn(
          "fixed z-50 p-4",
          "bg-[var(--color-card)] border-2 border-[var(--color-border)] shadow-[var(--shadow-lg)]",
          positionClasses[position],
          className
        ),
        style: {
          left: position === "left" || position === "right" ? triggerRect.left + (position === "left" ? 0 : triggerRect.width) : triggerRect.left + triggerRect.width / 2,
          top: position === "top" || position === "bottom" ? triggerRect.top + (position === "top" ? 0 : triggerRect.height) : triggerRect.top + triggerRect.height / 2
        },
        role: "dialog",
        onMouseEnter: trigger === "hover" ? handleOpen : void 0,
        onMouseLeave: trigger === "hover" ? handleClose : void 0,
        children: [
          typeof content === "string" ? /* @__PURE__ */ jsx(Typography, { variant: "body", children: content }) : content,
          showArrow && /* @__PURE__ */ jsx(
            "div",
            {
              className: cn(
                "absolute w-0 h-0 border-4",
                arrowClasses[position]
              )
            }
          )
        ]
      }
    )
  ] });
};
Popover.displayName = "Popover";
var isRelationsDebugEnabled = () => isDebugEnabled();
var RelationSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  required = false,
  disabled = false,
  isLoading = false,
  error,
  clearable = true,
  name,
  className,
  searchPlaceholder,
  emptyMessage
}) => {
  const { t } = useTranslate();
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("common.search");
  const resolvedEmptyMessage = emptyMessage ?? t("empty.noOptionsFound");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  useEffect(() => {
    if (isRelationsDebugEnabled()) {
      debugGroup(`RelationSelect: ${name || "unnamed"}`);
      debug(`Options count: ${options.length}`);
      debug(`Current value: ${value || "none"}`);
      debug(`Is loading: ${isLoading}`);
      if (options.length > 0) {
        debug("Sample options:", options.slice(0, 3));
      } else {
        debug("\u26A0\uFE0F No options available!");
      }
      debugGroupEnd();
    }
  }, [name, options.length, value, isLoading]);
  const selectedOption = useMemo(() => {
    const found = options.find((opt) => opt.value === value);
    if (isRelationsDebugEnabled() && value && !found) {
      debug(`\u26A0\uFE0F Value "${value}" not found in options for ${name}`);
    }
    return found;
  }, [options, value, name]);
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(
      (opt) => opt.label.toLowerCase().includes(query) || opt.description?.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);
  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
      if (!isOpen) {
        setSearchQuery("");
      }
    }
  }, [disabled, isOpen]);
  const handleSelect = useCallback(
    (option) => {
      if (option.disabled) return;
      onChange?.(option.value);
      setIsOpen(false);
      setSearchQuery("");
    },
    [onChange]
  );
  const handleClear = useCallback(
    (e) => {
      e.stopPropagation();
      onChange?.(void 0);
    },
    [onChange]
  );
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
      } else if (e.key === "Enter" && filteredOptions.length === 1) {
        handleSelect(filteredOptions[0]);
      }
    },
    [filteredOptions, handleSelect]
  );
  return /* @__PURE__ */ jsxs(Box, { ref: containerRef, className: cn("relative", className), children: [
    /* @__PURE__ */ jsx(Input, { type: "hidden", name, value: value || "" }),
    /* @__PURE__ */ jsxs(
      Button,
      {
        type: "button",
        variant: "secondary",
        onClick: handleToggle,
        disabled,
        className: cn(
          "w-full justify-between font-normal",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500",
          isOpen && "ring-2 ring-primary-500 border-primary-500"
        ),
        children: [
          /* @__PURE__ */ jsx(
            Typography,
            {
              variant: "body",
              className: cn(
                !selectedOption && "text-[var(--color-muted-foreground)]"
              ),
              children: isLoading ? /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
                /* @__PURE__ */ jsx(Spinner, { size: "sm" }),
                /* @__PURE__ */ jsx(Typography, { as: "span", children: t("common.loading") })
              ] }) : selectedOption ? selectedOption.label : placeholder
            }
          ),
          /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
            clearable && selectedOption && !disabled && /* @__PURE__ */ jsx(
              Box,
              {
                as: "button",
                className: "p-0.5 hover:bg-[var(--color-muted)] rounded cursor-pointer",
                onClick: handleClear,
                children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4 text-[var(--color-muted-foreground)]" })
              }
            ),
            /* @__PURE__ */ jsx(
              ChevronDown,
              {
                className: cn(
                  "h-4 w-4 text-[var(--color-muted-foreground)] transition-transform",
                  isOpen && "transform rotate-180"
                )
              }
            )
          ] })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsxs(
      Box,
      {
        position: "absolute",
        bg: "surface",
        border: true,
        rounded: "md",
        shadow: "lg",
        className: "z-50 w-full mt-1",
        children: [
          /* @__PURE__ */ jsx(Box, { padding: "sm", className: "border-b border-[var(--color-border)]", children: /* @__PURE__ */ jsx(
            Input,
            {
              ref: searchInputRef,
              type: "text",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              onKeyDown: handleKeyDown,
              placeholder: resolvedSearchPlaceholder,
              icon: Search,
              className: "text-sm"
            }
          ) }),
          /* @__PURE__ */ jsx(Box, { overflow: "auto", className: "max-h-60", children: isLoading ? /* @__PURE__ */ jsx(Box, { padding: "md", display: "flex", className: "justify-center", children: /* @__PURE__ */ jsx(Spinner, { size: "md", color: "primary" }) }) : filteredOptions.length === 0 ? /* @__PURE__ */ jsx(Box, { padding: "md", children: /* @__PURE__ */ jsx(
            Typography,
            {
              variant: "body",
              color: "muted",
              className: "text-center",
              children: resolvedEmptyMessage
            }
          ) }) : /* @__PURE__ */ jsx(VStack, { gap: "none", children: filteredOptions.map((option) => /* @__PURE__ */ jsxs(
            Box,
            {
              as: "button",
              fullWidth: true,
              paddingX: "sm",
              paddingY: "sm",
              className: cn(
                "text-left text-sm hover:bg-[var(--color-muted)] focus:outline-none focus:bg-[var(--color-muted)]",
                option.value === value && "bg-primary-50 text-primary-700",
                option.disabled && "opacity-50 cursor-not-allowed"
              ),
              onClick: () => handleSelect(option),
              children: [
                /* @__PURE__ */ jsx(Typography, { variant: "body", className: "font-medium", children: option.label }),
                option.description && /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "muted", children: option.description })
              ]
            },
            option.value
          )) }) })
        ]
      }
    ),
    error && /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "error", className: "mt-1", children: error })
  ] });
};
RelationSelect.displayName = "RelationSelect";
var SearchInput = ({
  value,
  onSearch,
  debounceMs = 300,
  isLoading = false,
  placeholder,
  clearable = true,
  className,
  event,
  entity,
  query,
  ...props
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const resolvedPlaceholder = placeholder ?? t("common.search");
  const queryState = useQuerySingleton(query);
  const initialValue = queryState?.search ?? value ?? "";
  const [searchValue, setSearchValue] = useState(initialValue);
  const [debounceTimer, setDebounceTimer] = useState(null);
  useEffect(() => {
    if (queryState && queryState.search !== searchValue) {
      setSearchValue(queryState.search);
    }
  }, [queryState?.search]);
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    const timer = setTimeout(() => {
      if (queryState) {
        queryState.setSearch(newValue);
      }
      onSearch?.(newValue);
      if (event) {
        eventBus.emit(`UI:${event}`, { searchTerm: newValue, entity });
      }
      if (event || entity || query) {
        eventBus.emit("UI:SEARCH", { searchTerm: newValue, entity, query });
      }
    }, debounceMs);
    setDebounceTimer(timer);
  }, [onSearch, debounceMs, debounceTimer, event, entity, query, eventBus, queryState]);
  const handleClear = useCallback(() => {
    setSearchValue("");
    if (queryState) {
      queryState.setSearch("");
    }
    onSearch?.("");
    if (event || query) {
      eventBus.emit("UI:CLEAR_SEARCH", { searchTerm: "", entity, query });
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  }, [onSearch, debounceTimer, event, query, entity, eventBus, queryState]);
  useEffect(() => {
    if (value !== void 0 && value !== searchValue && !query) {
      setSearchValue(value);
    }
  }, [value, query]);
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);
  return /* @__PURE__ */ jsxs(Box, { className: cn("relative", className), children: [
    /* @__PURE__ */ jsx(
      Input,
      {
        type: "search",
        value: searchValue,
        onChange: handleChange,
        placeholder: resolvedPlaceholder,
        icon: Search,
        clearable: clearable && !isLoading,
        onClear: handleClear,
        disabled: isLoading,
        className: "pr-10",
        ...props
      }
    ),
    isLoading && /* @__PURE__ */ jsx(Box, { className: "absolute right-3 top-1/2 -translate-y-1/2", children: /* @__PURE__ */ jsx(Spinner, { size: "sm", color: "primary" }) })
  ] });
};
SearchInput.displayName = "SearchInput";
var SidePanel = ({
  title,
  children,
  isOpen,
  onClose,
  width = "w-96",
  position = "right",
  showOverlay = true,
  className,
  closeEvent
}) => {
  const eventBus = useEventBus();
  const handleClose = () => {
    if (closeEvent) eventBus.emit(`UI:${closeEvent}`, {});
    onClose();
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    showOverlay && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-white/80 backdrop-blur-sm z-40 lg:hidden",
        onClick: handleClose
      }
    ),
    /* @__PURE__ */ jsxs(
      "aside",
      {
        className: cn(
          "fixed top-16 lg:top-0 bottom-0 z-[60]",
          "bg-[var(--color-card)]",
          "border-l-2 border-[var(--color-border)]",
          position === "left" && "border-l-0 border-r-2",
          "flex flex-col",
          "transition-transform duration-300 ease-in-out",
          width,
          position === "right" ? "right-0" : "left-0",
          className
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b-2 border-[var(--color-border)] sticky top-0 bg-[var(--color-card)] z-10", children: [
            /* @__PURE__ */ jsx(Typography, { variant: "h6", children: title }),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                icon: X,
                onClick: handleClose,
                "aria-label": "Close panel",
                children: /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-4 flex-1 overflow-y-auto", children })
        ]
      }
    )
  ] });
};
SidePanel.displayName = "SidePanel";
var gapStyles4 = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8"
};
var colStyles2 = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6"
};
var SimpleGrid = ({
  minChildWidth = 250,
  maxCols,
  cols,
  gap = "md",
  className,
  children
}) => {
  if (cols) {
    return /* @__PURE__ */ jsx("div", { className: cn("grid", colStyles2[cols], gapStyles4[gap], className), children });
  }
  const minWidth = typeof minChildWidth === "number" ? `${minChildWidth}px` : minChildWidth;
  const templateColumns = maxCols ? `repeat(auto-fit, minmax(min(${minWidth}, 100%), 1fr))` : `repeat(auto-fit, minmax(${minWidth}, 1fr))`;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn("grid", gapStyles4[gap], className),
      style: {
        gridTemplateColumns: templateColumns,
        // Limit max columns if specified
        ...maxCols && { maxWidth: `calc(${maxCols} * (${minWidth} + var(--gap, 1rem)))` }
      },
      children
    }
  );
};
SimpleGrid.displayName = "SimpleGrid";
var Tabs = ({
  items,
  tabs,
  defaultActiveTab,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = "default",
  orientation = "horizontal",
  className
}) => {
  const safeItems = items ?? tabs ?? [];
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const initialActive = safeItems.find((item) => item.active)?.id;
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultActiveTab || initialActive || safeItems[0]?.id || ""
  );
  const activeTab = controlledActiveTab !== void 0 ? controlledActiveTab : internalActiveTab;
  const tabRefs = useRef({});
  const handleTabChange = (tabId, tabEvent) => {
    if (controlledActiveTab === void 0) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
    if (tabEvent) {
      eventBus.emit(`UI:${tabEvent}`, { tabId });
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const direction = e.key === "ArrowLeft" ? -1 : 1;
      const nextIndex = (index + direction + safeItems.length) % safeItems.length;
      const nextTab = safeItems[nextIndex];
      if (nextTab && !nextTab.disabled) {
        handleTabChange(nextTab.id);
        tabRefs.current[nextTab.id]?.focus();
      }
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const targetIndex = e.key === "Home" ? 0 : safeItems.length - 1;
      const targetTab = safeItems[targetIndex];
      if (targetTab && !targetTab.disabled) {
        handleTabChange(targetTab.id);
        tabRefs.current[targetTab.id]?.focus();
      }
    }
  };
  const activeTabContent = safeItems.find((item) => item.id === activeTab)?.content;
  if (safeItems.length === 0) {
    return /* @__PURE__ */ jsx(Box, { className: cn("w-full", className), children: /* @__PURE__ */ jsx(Typography, { variant: "small", color: "muted", className: "py-4", children: t("empty.noItems") }) });
  }
  const variantClasses2 = {
    default: [
      "border-b-[length:var(--border-width)] border-transparent",
      "hover:border-[var(--color-muted-foreground)]",
      "data-[active=true]:border-[var(--color-primary)]"
    ].join(" "),
    pills: [
      "rounded-[var(--radius-sm)]",
      "data-[active=true]:bg-[var(--color-primary)]",
      "data-[active=true]:text-[var(--color-primary-foreground)]"
    ].join(" "),
    underline: [
      "border-b-[length:var(--border-width)] border-transparent",
      "data-[active=true]:border-[var(--color-primary)]"
    ].join(" ")
  };
  return /* @__PURE__ */ jsxs(Box, { className: cn("w-full", className), children: [
    /* @__PURE__ */ jsx(
      Box,
      {
        role: "tablist",
        className: cn(
          "flex",
          orientation === "horizontal" ? "flex-row border-b-[length:var(--border-width)] border-[var(--color-border)]" : "flex-col border-r-[length:var(--border-width)] border-[var(--color-border)]",
          variant === "pills" && "gap-1 p-1 bg-[var(--color-muted)] border-0 rounded-[var(--radius-md)]",
          variant === "underline" && orientation === "vertical" && "border-b-0"
        ),
        children: safeItems.map((item, index) => {
          const isActive = item.id === activeTab;
          const isDisabled = item.disabled;
          return /* @__PURE__ */ jsxs(
            Box,
            {
              as: "button",
              ref: (el) => {
                tabRefs.current[item.id] = el;
              },
              role: "tab",
              "aria-selected": isActive,
              "aria-controls": `tabpanel-${item.id}`,
              "aria-disabled": isDisabled,
              onClick: () => !isDisabled && handleTabChange(item.id, item.event),
              onKeyDown: (e) => handleKeyDown(e, index),
              "data-active": isActive,
              className: cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all",
                "focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2",
                isDisabled && "opacity-50 cursor-not-allowed",
                variantClasses2[variant],
                isActive ? "text-[var(--color-foreground)] font-bold" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              ),
              children: [
                item.icon && /* @__PURE__ */ jsx(Icon, { icon: item.icon, size: "sm" }),
                /* @__PURE__ */ jsx(Typography, { variant: "small", weight: isActive ? "semibold" : "normal", children: item.label }),
                item.badge !== void 0 && /* @__PURE__ */ jsx(Badge, { variant: "default", size: "sm", children: item.badge })
              ]
            },
            item.id
          );
        })
      }
    ),
    /* @__PURE__ */ jsx(
      Box,
      {
        role: "tabpanel",
        id: `tabpanel-${activeTab}`,
        "aria-labelledby": `tab-${activeTab}`,
        className: "mt-4",
        children: activeTabContent
      }
    )
  ] });
};
Tabs.displayName = "Tabs";
var variantClasses = {
  success: "bg-[var(--color-card)] border-[length:var(--border-width)] border-[var(--color-success)]",
  error: "bg-[var(--color-card)] border-[length:var(--border-width)] border-[var(--color-error)]",
  info: "bg-[var(--color-card)] border-[length:var(--border-width)] border-[var(--color-info)]",
  warning: "bg-[var(--color-card)] border-[length:var(--border-width)] border-[var(--color-warning)]"
};
var iconMap3 = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle
};
var iconColors = {
  success: "text-[var(--color-success)]",
  error: "text-[var(--color-error)]",
  info: "text-[var(--color-info)]",
  warning: "text-[var(--color-warning)]"
};
var Toast = ({
  variant = "info",
  message,
  title,
  duration = 5e3,
  dismissible = true,
  onDismiss,
  actionLabel,
  onAction,
  badge,
  className,
  dismissEvent,
  actionEvent
}) => {
  const eventBus = useEventBus();
  const handleDismiss = () => {
    if (dismissEvent) eventBus.emit(`UI:${dismissEvent}`, {});
    onDismiss?.();
  };
  const handleAction = () => {
    if (actionEvent) eventBus.emit(`UI:${actionEvent}`, {});
    onAction?.();
  };
  useEffect(() => {
    if (duration <= 0 || !onDismiss && !dismissEvent) {
      return;
    }
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss, dismissEvent]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "border-l-4 p-4 shadow-[var(--shadow-main)] min-w-[300px] max-w-md",
        "rounded-[var(--radius-sm)]",
        variantClasses[variant],
        className
      ),
      role: "alert",
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 mt-0.5", children: /* @__PURE__ */ jsx(
          Icon,
          {
            icon: iconMap3[variant],
            size: "md",
            className: iconColors[variant]
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          title && /* @__PURE__ */ jsx(Typography, { variant: "h6", className: "mb-1", children: title }),
          /* @__PURE__ */ jsx(Typography, { variant: "small", className: "text-sm", children: message }),
          actionLabel && (onAction || actionEvent) && /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: handleAction, children: actionLabel }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 flex-shrink-0", children: [
          badge !== void 0 && /* @__PURE__ */ jsx(Badge, { variant: "default", size: "sm", children: badge }),
          dismissible && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handleDismiss,
              className: cn(
                "flex-shrink-0 p-1 transition-colors rounded-[var(--radius-sm)]",
                "hover:bg-[var(--color-muted)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2"
              ),
              "aria-label": "Dismiss toast",
              children: /* @__PURE__ */ jsx(Icon, { icon: X, size: "sm" })
            }
          )
        ] })
      ] })
    }
  );
};
Toast.displayName = "Toast";
var positionClasses2 = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2"
};
var arrowClasses2 = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-[var(--color-primary)] border-l-transparent border-r-transparent border-b-transparent",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-[var(--color-primary)] border-l-transparent border-r-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-[var(--color-primary)] border-t-transparent border-b-transparent border-r-transparent",
  right: "right-full top-1/2 -translate-y-1/2 border-r-[var(--color-primary)] border-t-transparent border-b-transparent border-l-transparent"
};
var Tooltip = ({
  content,
  children,
  position = "top",
  delay = 200,
  hideDelay = 0,
  showArrow = true,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [triggerRect, setTriggerRect] = useState(null);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const showTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const updatePosition = () => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
  };
  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    updatePosition();
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };
  const handleMouseLeave = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  };
  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible]);
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);
  const triggerElement = React41__default.isValidElement(children) ? children : /* @__PURE__ */ jsx("span", { children });
  const trigger = React41__default.cloneElement(triggerElement, {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleMouseEnter,
    onBlur: handleMouseLeave
  });
  const tooltipContent = isVisible && triggerRect ? /* @__PURE__ */ jsxs(
    "div",
    {
      ref: tooltipRef,
      className: cn(
        "fixed z-50 px-3 py-2 max-w-xs",
        "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
        "shadow-[var(--shadow-sm)] rounded-[var(--radius-sm)]",
        "text-sm pointer-events-none",
        "break-words whitespace-normal",
        "h-auto min-h-fit",
        positionClasses2[position],
        className
      ),
      style: {
        left: position === "left" || position === "right" ? triggerRect.left + (position === "left" ? 0 : triggerRect.width) : triggerRect.left + triggerRect.width / 2,
        top: position === "top" || position === "bottom" ? triggerRect.top + (position === "top" ? 0 : triggerRect.height) : triggerRect.top + triggerRect.height / 2,
        transform: position === "top" || position === "bottom" ? "translateX(-50%)" : position === "left" || position === "right" ? "translateY(-50%)" : "none"
      },
      role: "tooltip",
      children: [
        /* @__PURE__ */ jsx("div", { className: "w-full break-words whitespace-normal h-auto", children: typeof content === "string" ? /* @__PURE__ */ jsx(Typography, { variant: "small", className: "text-[var(--color-primary-foreground)] break-words whitespace-normal", children: content }) : /* @__PURE__ */ jsx("div", { className: "break-words whitespace-normal", children: content }) }),
        showArrow && /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "absolute w-0 h-0 border-4",
              arrowClasses2[position]
            )
          }
        )
      ]
    }
  ) : null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    trigger,
    typeof window !== "undefined" && tooltipContent ? createPortal(tooltipContent, document.body) : tooltipContent
  ] });
};
Tooltip.displayName = "Tooltip";
var sizeWidths = {
  sm: "w-80",
  // 320px
  md: "w-96",
  // 384px
  lg: "w-[480px]",
  // 480px
  xl: "w-[640px]",
  // 640px
  full: "w-screen"
};
var Drawer = ({
  isOpen = true,
  onClose = () => {
  },
  title,
  children = null,
  footer,
  position = "right",
  width = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  closeEvent
}) => {
  const eventBus = useEventBus();
  const drawerRef = useRef(null);
  const previousActiveElement = useRef(null);
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      const focusableElements = drawerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0];
      firstElement?.focus();
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (closeEvent) eventBus.emit(`UI:${closeEvent}`, {});
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose, closeEvent, eventBus]);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  if (!isOpen) return null;
  const handleClose = () => {
    if (closeEvent) eventBus.emit(`UI:${closeEvent}`, {});
    onClose();
  };
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose();
    }
  };
  const widthClass = width in sizeWidths ? sizeWidths[width] : "";
  const widthStyle = width in sizeWidths ? void 0 : { width };
  const positionClasses3 = position === "right" ? "right-0 border-l" : "left-0 border-r";
  const animationClasses2 = position === "right" ? "animate-slide-in-right" : "animate-slide-in-left";
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Overlay,
      {
        isVisible: isOpen,
        onClick: handleOverlayClick,
        className: "z-40"
      }
    ),
    /* @__PURE__ */ jsxs(
      Box,
      {
        ref: drawerRef,
        bg: "surface",
        border: true,
        shadow: "xl",
        className: cn(
          "fixed top-0 bottom-0 z-50",
          "flex flex-col max-h-screen",
          positionClasses3,
          widthClass,
          animationClasses2,
          className
        ),
        style: widthStyle,
        role: "dialog",
        "aria-modal": "true",
        ...title && { "aria-labelledby": "drawer-title" },
        children: [
          (title || showCloseButton) && /* @__PURE__ */ jsxs(
            "div",
            {
              className: cn(
                "px-6 py-4 flex items-center justify-between shrink-0",
                "border-b-[length:var(--border-width)] border-[var(--color-border)]"
              ),
              children: [
                title && /* @__PURE__ */ jsx(Typography, { variant: "h4", as: "h2", id: "drawer-title", children: title }),
                showCloseButton && /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: handleClose,
                    className: cn(
                      "p-1 transition-colors rounded-[var(--radius-sm)]",
                      "hover:bg-[var(--color-muted)]",
                      !title && "ml-auto"
                    ),
                    "aria-label": "Close drawer",
                    children: /* @__PURE__ */ jsx(Icon, { icon: X, size: "md" })
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-6", children }),
          footer && /* @__PURE__ */ jsx(
            "div",
            {
              className: cn(
                "px-6 py-4 shrink-0 bg-[var(--color-muted)]",
                "border-t-[length:var(--border-width)] border-[var(--color-border)]"
              ),
              children: footer
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }
      ` })
  ] });
};
Drawer.displayName = "Drawer";
var WizardProgress = ({
  steps,
  currentStep,
  onStepClick,
  allowNavigation = true,
  compact = false,
  className,
  stepClickEvent
}) => {
  const eventBus = useEventBus();
  const totalSteps = steps.length;
  const handleStepClick = (index) => {
    const isCompleted = index < currentStep;
    if (isCompleted && allowNavigation) {
      if (stepClickEvent) eventBus.emit(`UI:${stepClickEvent}`, { stepIndex: index });
      onStepClick?.(index);
    }
  };
  return /* @__PURE__ */ jsx(
    Box,
    {
      border: true,
      className: cn(
        "border-b-2 border-x-0 border-t-0 border-[var(--color-border)]",
        compact ? "px-4 py-2" : "px-6 py-4",
        className
      ),
      children: /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        return /* @__PURE__ */ jsxs(React41__default.Fragment, { children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleStepClick(index),
              disabled: !isCompleted || !allowNavigation,
              className: cn(
                "flex items-center justify-center text-sm font-bold transition-colors",
                "border-2 border-[var(--color-border)]",
                compact ? "w-6 h-6" : "w-8 h-8",
                isActive && "bg-[var(--color-foreground)] text-[var(--color-background)]",
                isCompleted && "bg-[var(--color-foreground)] text-[var(--color-background)] cursor-pointer hover:bg-[var(--color-muted-foreground)]",
                !isActive && !isCompleted && "bg-[var(--color-card)] text-[var(--color-foreground)]"
              ),
              children: isCompleted ? /* @__PURE__ */ jsx(Icon, { icon: Check, size: "sm" }) : index + 1
            }
          ),
          !compact && /* @__PURE__ */ jsx(
            "div",
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
                  children: step.title
                }
              )
            }
          ),
          index < totalSteps - 1 && /* @__PURE__ */ jsx(
            "div",
            {
              className: cn(
                "flex-1 h-0.5",
                index < currentStep ? "bg-[var(--color-foreground)]" : "bg-[var(--color-muted)]"
              )
            }
          )
        ] }, step.id);
      }) })
    }
  );
};
WizardProgress.displayName = "WizardProgress";
function useSafeEventBus2() {
  try {
    return useEventBus();
  } catch {
    return { emit: () => {
    }, on: () => () => {
    }, once: () => {
    } };
  }
}
var WizardNavigation = ({
  currentStep,
  totalSteps,
  isValid = true,
  showBack = true,
  showNext = true,
  showComplete = true,
  backLabel,
  nextLabel,
  completeLabel,
  onBack = "WIZARD_BACK",
  onNext = "WIZARD_NEXT",
  onComplete = "WIZARD_COMPLETE",
  onBackClick,
  onNextClick,
  onCompleteClick,
  compact = false,
  className
}) => {
  const eventBus = useSafeEventBus2();
  const { t } = useTranslate();
  const resolvedBackLabel = backLabel ?? t("wizard.back");
  const resolvedNextLabel = nextLabel ?? t("wizard.next");
  const resolvedCompleteLabel = completeLabel ?? t("wizard.complete");
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      eventBus.emit(`UI:${onBack}`, { currentStep, totalSteps });
    }
  };
  const handleNext = () => {
    if (onNextClick) {
      onNextClick();
    } else {
      eventBus.emit(`UI:${onNext}`, { currentStep, totalSteps });
    }
  };
  const handleComplete = () => {
    if (onCompleteClick) {
      onCompleteClick();
    } else {
      eventBus.emit(`UI:${onComplete}`, { currentStep, totalSteps });
    }
  };
  return /* @__PURE__ */ jsxs(
    Box,
    {
      border: true,
      className: cn(
        "border-t-2 border-x-0 border-b-0 border-[var(--color-border)] flex justify-between items-center",
        compact ? "px-4 py-2" : "px-6 py-4",
        className
      ),
      children: [
        showBack ? /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: handleBack, disabled: isFirstStep, children: [
          /* @__PURE__ */ jsx(Icon, { icon: ChevronLeft, size: "sm" }),
          resolvedBackLabel
        ] }) : /* @__PURE__ */ jsx(Box, {}),
        /* @__PURE__ */ jsx(HStack, { align: "center", gap: "sm", children: /* @__PURE__ */ jsx(Typography, { variant: "caption", className: "text-neutral-500", children: t("wizard.stepOf", { current: String(currentStep + 1), total: String(totalSteps) }) }) }),
        isLastStep && showComplete ? /* @__PURE__ */ jsx(Button, { variant: "primary", onClick: handleComplete, disabled: !isValid, children: resolvedCompleteLabel }) : showNext ? /* @__PURE__ */ jsxs(Button, { variant: "primary", onClick: handleNext, disabled: !isValid, children: [
          resolvedNextLabel,
          /* @__PURE__ */ jsx(Icon, { icon: ChevronRight, size: "sm" })
        ] }) : /* @__PURE__ */ jsx(Box, {})
      ]
    }
  );
};
WizardNavigation.displayName = "WizardNavigation";
var MarkdownContent = React41__default.memo(
  ({ content, direction, className }) => {
    const { t: _t } = useTranslate();
    return /* @__PURE__ */ jsx(
      Box,
      {
        className: cn("prose prose-slate dark:prose-invert max-w-none", className),
        style: { direction },
        children: /* @__PURE__ */ jsx(
          ReactMarkdown,
          {
            remarkPlugins: [remarkMath, remarkGfm],
            rehypePlugins: [
              [rehypeKatex, { strict: false, throwOnError: false }]
            ],
            components: {
              // Handle inline code only — fenced code blocks are parsed out separately
              code({ className: codeClassName, children, ...props }) {
                return /* @__PURE__ */ jsx(
                  "code",
                  {
                    ...props,
                    className: codeClassName,
                    style: {
                      backgroundColor: "#1f2937",
                      color: "#e5e7eb",
                      padding: "0.125rem 0.375rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.875em",
                      fontFamily: "ui-monospace, monospace"
                    },
                    children
                  }
                );
              },
              // Style links
              a({ href, children, ...props }) {
                return /* @__PURE__ */ jsx(
                  "a",
                  {
                    href,
                    ...props,
                    className: "text-blue-600 dark:text-blue-400 hover:underline",
                    target: href?.startsWith("http") ? "_blank" : void 0,
                    rel: href?.startsWith("http") ? "noopener noreferrer" : void 0,
                    children
                  }
                );
              },
              // Style tables
              table({ children, ...props }) {
                return /* @__PURE__ */ jsx("div", { className: "overflow-x-auto my-4", children: /* @__PURE__ */ jsx(
                  "table",
                  {
                    ...props,
                    className: "min-w-full border-collapse border border-gray-300 dark:border-gray-600",
                    children
                  }
                ) });
              },
              th({ children, ...props }) {
                return /* @__PURE__ */ jsx(
                  "th",
                  {
                    ...props,
                    className: "border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold",
                    children
                  }
                );
              },
              td({ children, ...props }) {
                return /* @__PURE__ */ jsx(
                  "td",
                  {
                    ...props,
                    className: "border border-gray-300 dark:border-gray-600 px-4 py-2",
                    children
                  }
                );
              },
              // Style blockquotes
              blockquote({ children, ...props }) {
                return /* @__PURE__ */ jsx(
                  "blockquote",
                  {
                    ...props,
                    className: "border-l-4 border-blue-500 pl-4 italic text-[var(--color-foreground)] my-4",
                    children
                  }
                );
              }
            },
            children: content
          }
        )
      }
    );
  },
  (prev, next) => prev.content === next.content && prev.className === next.className && prev.direction === next.direction
);
MarkdownContent.displayName = "MarkdownContent";
var CodeBlock = React41__default.memo(
  ({
    code,
    language = "text",
    showCopyButton = true,
    showLanguageBadge = true,
    maxHeight = "60vh",
    className
  }) => {
    const eventBus = useEventBus();
    const { t: _t } = useTranslate();
    const scrollRef = useRef(null);
    const savedScrollLeftRef = useRef(0);
    const [copied, setCopied] = useState(false);
    useLayoutEffect(() => {
      const el = scrollRef.current;
      return () => {
        if (el) savedScrollLeftRef.current = el.scrollLeft;
      };
    }, [language, code]);
    useLayoutEffect(() => {
      const el = scrollRef.current;
      if (el) el.scrollLeft = savedScrollLeftRef.current;
    }, [language, code]);
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      const handle = () => {
        savedScrollLeftRef.current = el.scrollLeft;
      };
      el.addEventListener("scroll", handle, { passive: true });
      return () => el.removeEventListener("scroll", handle);
    }, [language, code]);
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        eventBus.emit("UI:COPY_CODE", { language, success: true });
        setTimeout(() => setCopied(false), 2e3);
      } catch (err) {
        console.error("Failed to copy code:", err);
        eventBus.emit("UI:COPY_CODE", { language, success: false });
      }
    };
    return /* @__PURE__ */ jsxs(Box, { className: `relative group ${className || ""}`, children: [
      (showLanguageBadge || showCopyButton) && /* @__PURE__ */ jsxs(
        HStack,
        {
          justify: "between",
          align: "center",
          className: "px-3 py-2 bg-gray-800 rounded-t-lg border-b border-gray-700",
          children: [
            showLanguageBadge && /* @__PURE__ */ jsx(Badge, { variant: "default", size: "sm", children: language }),
            showCopyButton && /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                onClick: handleCopy,
                className: "opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-[var(--color-muted-foreground)] hover:text-white",
                "aria-label": "Copy code",
                children: copied ? /* @__PURE__ */ jsx(Check, { size: 16, className: "text-green-400" }) : /* @__PURE__ */ jsx(Copy, { size: 16 })
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          ref: scrollRef,
          style: {
            overflowX: "auto",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            maxHeight,
            overscrollBehavior: "auto",
            touchAction: "pan-x pan-y",
            contain: "paint",
            backgroundColor: "#1e1e1e",
            borderRadius: showLanguageBadge || showCopyButton ? "0 0 0.5rem 0.5rem" : "0.5rem",
            padding: "1rem"
          },
          children: /* @__PURE__ */ jsx(
            Prism,
            {
              PreTag: "div",
              language,
              style: vscDarkPlus,
              customStyle: {
                backgroundColor: "transparent",
                borderRadius: 0,
                padding: 0,
                margin: 0,
                whiteSpace: "pre",
                minWidth: "100%"
              },
              children: code
            }
          )
        }
      )
    ] });
  },
  (prev, next) => prev.language === next.language && prev.code === next.code && prev.showCopyButton === next.showCopyButton && prev.maxHeight === next.maxHeight
);
CodeBlock.displayName = "CodeBlock";
var QuizBlock = ({
  question,
  answer,
  className
}) => {
  const { t } = useTranslate();
  const [revealed, setRevealed] = useState(false);
  return /* @__PURE__ */ jsx(Card2, { className: cn("my-4 border-blue-200 dark:border-blue-800", className), children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", className: "p-4", children: [
    /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "start", children: [
      /* @__PURE__ */ jsx(Icon, { icon: HelpCircle, size: "sm", className: "text-blue-500 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsx(Typography, { variant: "body", className: "font-medium", children: question })
    ] }),
    revealed ? /* @__PURE__ */ jsx(Box, { className: "pl-7 pt-2 border-t border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsx(Typography, { variant: "body", className: "text-[var(--color-muted-foreground)]", children: answer }) }) : null,
    /* @__PURE__ */ jsx(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: () => setRevealed((r) => !r),
        className: "self-start ml-7",
        children: /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
          /* @__PURE__ */ jsx(Typography, { variant: "caption", children: revealed ? t("quiz.hideAnswer") : t("quiz.showAnswer") }),
          revealed ? /* @__PURE__ */ jsx(ChevronUp, { size: 14 }) : /* @__PURE__ */ jsx(ChevronDown, { size: 14 })
        ] })
      }
    )
  ] }) });
};
QuizBlock.displayName = "QuizBlock";
var MIN_DIAGRAM_WIDTH = 200;
var ScaledDiagram = ({
  children,
  className
}) => {
  const { t: _t } = useTranslate();
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const [layout, setLayout] = useState(null);
  const measure = useCallback(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;
    const containerW = wrapper.clientWidth;
    if (containerW <= 0) return;
    let diagramW = 0;
    let diagramH = 0;
    const children2 = content.children;
    for (let i = 0; i < children2.length; i++) {
      const child = children2[i];
      const w = child.style?.width;
      const h = child.style?.height;
      if (w && /^\d+/.test(w) && h && /^\d+/.test(h)) {
        diagramW = parseFloat(w);
        diagramH = parseFloat(h);
        break;
      }
      if (child.offsetWidth > MIN_DIAGRAM_WIDTH) {
        diagramW = child.offsetWidth;
        diagramH = child.offsetHeight;
        break;
      }
    }
    if (diagramW < MIN_DIAGRAM_WIDTH || diagramH <= 0) {
      setLayout(null);
      return;
    }
    const s = Math.min(1, containerW / diagramW);
    setLayout({ scale: s, height: diagramH * s });
  }, []);
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    let raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => measure());
    });
    const mo = new MutationObserver(() => {
      requestAnimationFrame(() => measure());
    });
    mo.observe(content, { childList: true, subtree: true, attributes: true });
    return () => {
      cancelAnimationFrame(raf1);
      mo.disconnect();
    };
  }, [measure, children]);
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [measure]);
  const hasLayout = layout !== null;
  return /* @__PURE__ */ jsx(
    Box,
    {
      ref: wrapperRef,
      className: cn("w-full", className),
      style: {
        // Only clip overflow once we have a valid measurement
        overflow: hasLayout ? "hidden" : void 0,
        height: hasLayout ? layout.height : void 0
      },
      children: /* @__PURE__ */ jsx(
        Box,
        {
          ref: contentRef,
          style: {
            width: "max-content",
            transformOrigin: "top left",
            transform: hasLayout && layout.scale < 1 ? `scale(${layout.scale})` : void 0
          },
          children
        }
      )
    }
  );
};
ScaledDiagram.displayName = "ScaledDiagram";
var RepeatableFormSection = ({
  sectionType,
  title,
  items,
  renderItem,
  minItems = 0,
  maxItems = Infinity,
  allowReorder = false,
  addLabel,
  emptyMessage,
  readOnly = false,
  className,
  onAdd,
  onRemove,
  onReorder,
  trackAddedInState = false,
  currentState,
  showAuditInfo = false
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const resolvedAddLabel = addLabel ?? t("common.add");
  const resolvedEmptyMessage = emptyMessage ?? t("empty.noItemsAdded");
  const canAdd = !readOnly && items.length < maxItems;
  const canRemove = !readOnly && items.length > minItems;
  const handleAdd = useCallback(() => {
    onAdd?.();
    const eventPayload = {
      sectionType,
      index: items.length
    };
    if (trackAddedInState && currentState) {
      eventPayload.addedInState = currentState;
      eventPayload.addedAt = (/* @__PURE__ */ new Date()).toISOString();
    }
    eventBus.emit("UI:SECTION_ADDED", eventPayload);
  }, [
    sectionType,
    items.length,
    onAdd,
    eventBus,
    trackAddedInState,
    currentState
  ]);
  const handleRemove = useCallback(
    (itemId, index) => {
      onRemove?.(itemId, index);
      eventBus.emit("UI:SECTION_REMOVED", { sectionType, index, itemId });
    },
    [sectionType, onRemove, eventBus]
  );
  return /* @__PURE__ */ jsxs(VStack, { gap: "md", className: cn("w-full", className), children: [
    /* @__PURE__ */ jsxs(HStack, { justify: "between", align: "center", children: [
      /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", children: [
        /* @__PURE__ */ jsx(Typography, { variant: "h4", children: title }),
        /* @__PURE__ */ jsxs(Typography, { variant: "caption", color: "muted", children: [
          "(",
          items.length,
          maxItems !== Infinity ? `/${maxItems}` : "",
          ")"
        ] })
      ] }),
      canAdd && /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", onClick: handleAdd, children: [
        /* @__PURE__ */ jsx(Icon, { name: "plus", size: "sm", className: "mr-1" }),
        resolvedAddLabel
      ] })
    ] }),
    items.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "p-6", children: /* @__PURE__ */ jsxs(VStack, { align: "center", gap: "sm", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "body", color: "muted", children: resolvedEmptyMessage }),
      canAdd && /* @__PURE__ */ jsxs(Button, { variant: "primary", size: "sm", onClick: handleAdd, children: [
        /* @__PURE__ */ jsx(Icon, { name: "plus", size: "sm", className: "mr-1" }),
        resolvedAddLabel
      ] })
    ] }) }) : /* @__PURE__ */ jsx(VStack, { gap: "sm", children: items.map((item, index) => /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
      showAuditInfo && (item.addedInState || item.addedAt) && /* @__PURE__ */ jsxs(
        HStack,
        {
          justify: "between",
          align: "center",
          className: "pb-2 border-b border-[var(--color-border)]",
          children: [
            /* @__PURE__ */ jsx(HStack, { gap: "sm", align: "center", children: item.addedInState && /* @__PURE__ */ jsxs(Typography, { variant: "caption", color: "muted", children: [
              "Added in:",
              " ",
              /* @__PURE__ */ jsx(
                Typography,
                {
                  as: "span",
                  variant: "caption",
                  weight: "semibold",
                  children: item.addedInState
                }
              )
            ] }) }),
            item.addedAt && /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "muted", children: new Date(item.addedAt).toLocaleString() })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "start", children: [
        allowReorder && !readOnly && /* @__PURE__ */ jsx(Box, { className: "pt-2 cursor-move text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]", children: /* @__PURE__ */ jsx(Icon, { name: "grip-vertical", size: "md" }) }),
        /* @__PURE__ */ jsx(Box, { className: "flex-1", children: renderItem(item, index) }),
        canRemove && /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => handleRemove(item.id, index),
            className: "text-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10",
            children: /* @__PURE__ */ jsx(Icon, { name: "trash-2", size: "sm" })
          }
        )
      ] })
    ] }) }, item.id)) }),
    items.length < minItems && /* @__PURE__ */ jsxs(Typography, { variant: "caption", color: "warning", children: [
      "At least ",
      minItems,
      " item",
      minItems !== 1 ? "s" : "",
      " required"
    ] })
  ] });
};
RepeatableFormSection.displayName = "RepeatableFormSection";
var actionTypeLabels = {
  measure: "Corrective Measure",
  admin: "Administrative Action",
  penalty: "Penalty Proceedings"
};
var actionTypeIcons = {
  measure: "alert-triangle",
  admin: "alert-circle",
  penalty: "shield-alert"
};
var ViolationAlert = ({
  violation,
  severity,
  dismissible = false,
  onDismiss,
  onNavigateToField,
  compact = false,
  className
}) => {
  const effectiveSeverity = severity ?? (violation.actionType === "measure" ? "warning" : "error");
  const bgColor = effectiveSeverity === "warning" ? "bg-[var(--color-warning)]/10 border-[var(--color-warning)]/30" : "bg-[var(--color-error)]/10 border-[var(--color-error)]/30";
  const textColor = effectiveSeverity === "warning" ? "text-[var(--color-warning)]" : "text-[var(--color-error)]";
  const iconColor = effectiveSeverity === "warning" ? "text-[var(--color-warning)]" : "text-[var(--color-error)]";
  if (compact) {
    return /* @__PURE__ */ jsx(
      Box,
      {
        className: cn(
          "px-3 py-2 rounded-[var(--radius-md)] border",
          bgColor,
          className
        ),
        children: /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", justify: "between", children: [
          /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", children: [
            /* @__PURE__ */ jsx(
              Icon,
              {
                name: actionTypeIcons[violation.actionType],
                size: "sm",
                className: iconColor
              }
            ),
            /* @__PURE__ */ jsxs(
              Typography,
              {
                variant: "caption",
                className: textColor,
                weight: "semibold",
                children: [
                  violation.law,
                  " Art. ",
                  violation.article
                ]
              }
            ),
            /* @__PURE__ */ jsx(Typography, { variant: "caption", className: textColor, children: violation.message })
          ] }),
          dismissible && onDismiss && /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: onDismiss,
              className: "p-1",
              children: /* @__PURE__ */ jsx(Icon, { name: "x", size: "sm", className: iconColor })
            }
          )
        ] })
      }
    );
  }
  return /* @__PURE__ */ jsx(
    Box,
    {
      className: cn(
        "p-4 rounded-[var(--radius-lg)] border",
        bgColor,
        className
      ),
      children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", children: [
        /* @__PURE__ */ jsxs(HStack, { justify: "between", align: "start", children: [
          /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", children: [
            /* @__PURE__ */ jsx(
              Icon,
              {
                name: actionTypeIcons[violation.actionType],
                size: "md",
                className: iconColor
              }
            ),
            /* @__PURE__ */ jsxs(VStack, { gap: "xs", children: [
              /* @__PURE__ */ jsxs(Typography, { variant: "label", weight: "bold", className: textColor, children: [
                violation.law,
                " Art. ",
                violation.article
              ] }),
              /* @__PURE__ */ jsx(
                Typography,
                {
                  variant: "caption",
                  className: cn(textColor, "opacity-75"),
                  children: actionTypeLabels[violation.actionType]
                }
              )
            ] })
          ] }),
          dismissible && onDismiss && /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: onDismiss,
              className: "p-1",
              children: /* @__PURE__ */ jsx(Icon, { name: "x", size: "sm", className: iconColor })
            }
          )
        ] }),
        /* @__PURE__ */ jsx(Typography, { variant: "body2", className: textColor, children: violation.message }),
        (violation.adminAction || violation.penaltyAction) && /* @__PURE__ */ jsx(
          Box,
          {
            className: cn(
              "pt-2 border-t",
              effectiveSeverity === "warning" ? "border-[var(--color-warning)]/30" : "border-[var(--color-error)]/30"
            ),
            children: /* @__PURE__ */ jsxs(VStack, { gap: "xs", children: [
              violation.adminAction && /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
                /* @__PURE__ */ jsx(
                  Typography,
                  {
                    variant: "caption",
                    className: cn(textColor, "opacity-75"),
                    children: "Admin:"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Typography,
                  {
                    variant: "caption",
                    weight: "semibold",
                    className: textColor,
                    children: violation.adminAction
                  }
                )
              ] }),
              violation.penaltyAction && /* @__PURE__ */ jsxs(HStack, { gap: "xs", align: "center", children: [
                /* @__PURE__ */ jsx(
                  Typography,
                  {
                    variant: "caption",
                    className: cn(textColor, "opacity-75"),
                    children: "Penalty:"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Typography,
                  {
                    variant: "caption",
                    weight: "semibold",
                    className: textColor,
                    children: violation.penaltyAction
                  }
                )
              ] })
            ] })
          }
        ),
        violation.fieldId && onNavigateToField && /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => onNavigateToField(violation.fieldId),
            className: cn(textColor, "self-start"),
            children: [
              /* @__PURE__ */ jsx(Icon, { name: "arrow-right", size: "sm", className: "mr-1" }),
              "Go to field"
            ]
          }
        )
      ] })
    }
  );
};
ViolationAlert.displayName = "ViolationAlert";
var FormSectionHeader = ({
  title,
  subtitle,
  isCollapsed = false,
  onToggle,
  badge,
  badgeVariant = "default",
  icon,
  hasErrors = false,
  isComplete = false,
  className
}) => {
  const isClickable = !!onToggle;
  const effectiveBadgeVariant = hasErrors ? "danger" : isComplete ? "success" : badgeVariant;
  const statusIcon = hasErrors ? "alert-circle" : isComplete ? "check-circle" : null;
  return /* @__PURE__ */ jsx(
    Box,
    {
      className: cn(
        "px-4 py-3 bg-[var(--color-muted)] rounded-t-lg",
        isClickable && "cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors",
        className
      ),
      onClick: isClickable ? onToggle : void 0,
      children: /* @__PURE__ */ jsxs(HStack, { justify: "between", align: "center", children: [
        /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", children: [
          icon && /* @__PURE__ */ jsx(
            Icon,
            {
              name: icon,
              size: "md",
              className: "text-[var(--color-muted-foreground)]"
            }
          ),
          statusIcon && /* @__PURE__ */ jsx(
            Icon,
            {
              name: statusIcon,
              size: "md",
              className: hasErrors ? "text-[var(--color-error)]" : "text-[var(--color-success)]"
            }
          ),
          /* @__PURE__ */ jsxs(Box, { children: [
            /* @__PURE__ */ jsx(Typography, { variant: "label", weight: "semibold", children: title }),
            subtitle && /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "muted", children: subtitle })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "center", children: [
          badge && /* @__PURE__ */ jsx(Badge, { variant: effectiveBadgeVariant, size: "sm", children: badge }),
          isClickable && /* @__PURE__ */ jsx(
            Icon,
            {
              name: "chevron-down",
              size: "md",
              className: cn(
                "text-[var(--color-muted-foreground)] transition-transform",
                isCollapsed && "-rotate-90"
              )
            }
          )
        ] })
      ] })
    }
  );
};
FormSectionHeader.displayName = "FormSectionHeader";

// components/organisms/types.ts
var EntityDisplayEvents = {
  SORT: "SORT",
  PAGINATE: "PAGINATE",
  SEARCH: "SEARCH",
  FILTER: "FILTER",
  CLEAR_FILTERS: "CLEAR_FILTERS",
  SELECT: "SELECT",
  DESELECT: "DESELECT"
};
function normalizeColumns(columns) {
  return columns.map((col) => {
    if (typeof col === "string") {
      const header = col.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()).trim();
      return { key: col, header };
    }
    return col;
  });
}
function DataTable({
  fields,
  columns,
  data,
  entity,
  itemActions,
  isLoading = false,
  error,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  selectable = false,
  selectedIds = [],
  sortBy,
  sortDirection = "asc",
  searchable = false,
  searchValue = "",
  searchPlaceholder,
  page,
  pageSize,
  totalCount,
  rowActions: externalRowActions,
  bulkActions,
  headerActions,
  showTotal = true,
  className
}) {
  const [openActionMenu, setOpenActionMenu] = useState(
    null
  );
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const resolvedEmptyTitle = emptyTitle ?? t("table.empty.title");
  const resolvedEmptyDescription = emptyDescription ?? t("table.empty.description");
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("common.search");
  const items = useMemo(
    () => Array.isArray(data) ? data : [],
    [data]
  );
  const currentPage = page ?? 1;
  const currentPageSize = pageSize ?? 20;
  const total = totalCount ?? items.length;
  const totalPages = Math.ceil(total / currentPageSize);
  const rowActions = externalRowActions ?? itemActions?.filter((a) => a.placement !== "bulk").map((action) => ({
    label: action.label,
    icon: action.icon,
    variant: action.variant,
    event: action.event,
    onClick: (row) => {
      if (action.navigatesTo) {
        const url = action.navigatesTo.replace(/:id\b/g, String(row.id)).replace(
          /\{\{id\}\}/g,
          String(row.id)
        );
        eventBus.emit("UI:NAVIGATE", { url, row, entity });
        return;
      }
      if (action.event) {
        eventBus.emit(`UI:${action.event}`, {
          row,
          entity
        });
      }
    }
  }));
  const viewAction = itemActions?.find(
    (a) => a.event === "VIEW" || a.navigatesTo
  );
  const handleRowClick = useCallback(
    (row) => {
      if (viewAction) {
        if (viewAction.navigatesTo) {
          const url = viewAction.navigatesTo.replace(/:id\b/g, String(row.id)).replace(
            /\{\{id\}\}/g,
            String(row.id)
          );
          eventBus.emit("UI:NAVIGATE", { url, row, entity });
          return;
        }
        eventBus.emit("UI:VIEW", { row, entity });
      }
    },
    [viewAction, eventBus, entity]
  );
  const isRowClickable = !!viewAction;
  const effectiveColumns = fields ?? columns ?? [];
  const normalizedColumns = useMemo(
    () => normalizeColumns(effectiveColumns),
    [effectiveColumns]
  );
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && !allSelected;
  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      eventBus.emit(`UI:${EntityDisplayEvents.DESELECT}`, {
        ids: [],
        entity
      });
    } else {
      eventBus.emit(`UI:${EntityDisplayEvents.SELECT}`, {
        ids: items.map((row) => row.id),
        entity
      });
    }
  }, [allSelected, items, eventBus, entity]);
  const handleSelectRow = useCallback(
    (id) => {
      if (selectedIds.includes(id)) {
        eventBus.emit(`UI:${EntityDisplayEvents.DESELECT}`, {
          ids: selectedIds.filter((i) => i !== id),
          entity
        });
      } else {
        eventBus.emit(`UI:${EntityDisplayEvents.SELECT}`, {
          ids: [...selectedIds, id],
          entity
        });
      }
    },
    [selectedIds, eventBus, entity]
  );
  const handleSort = useCallback(
    (key) => {
      const newDirection = sortBy === key && sortDirection === "asc" ? "desc" : "asc";
      eventBus.emit(`UI:${EntityDisplayEvents.SORT}`, {
        field: key,
        direction: newDirection,
        entity
      });
    },
    [sortBy, sortDirection, eventBus, entity]
  );
  const handleSearch = useCallback(
    (value) => {
      eventBus.emit(`UI:${EntityDisplayEvents.SEARCH}`, {
        query: value,
        entity
      });
    },
    [eventBus, entity]
  );
  const handlePageChange = useCallback(
    (newPage) => {
      eventBus.emit(`UI:${EntityDisplayEvents.PAGINATE}`, {
        page: newPage,
        pageSize: currentPageSize,
        entity
      });
    },
    [eventBus, currentPageSize, entity]
  );
  const selectedRows = useMemo(
    () => items.filter((row) => selectedIds.includes(row.id)),
    [items, selectedIds]
  );
  return /* @__PURE__ */ jsxs(
    Box,
    {
      className: cn(
        "bg-[var(--color-card)] border-2 border-[var(--color-border)] rounded-none overflow-hidden",
        className
      ),
      children: [
        (searchable || bulkActions || headerActions) && /* @__PURE__ */ jsxs(HStack, { className: "px-4 py-3 border-b-2 border-[var(--color-border)] flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxs(HStack, { className: "flex-col sm:flex-row items-stretch sm:items-center gap-3", children: [
            searchable && /* @__PURE__ */ jsxs(Box, { className: "relative", children: [
              /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "search",
                  value: searchValue,
                  onChange: (e) => handleSearch(e.target.value),
                  placeholder: resolvedSearchPlaceholder,
                  className: "pl-9 w-full sm:w-64"
                }
              )
            ] }),
            bulkActions && selectedIds.length > 0 && /* @__PURE__ */ jsxs(HStack, { className: "items-center gap-2 pl-0 sm:pl-3 border-l-0 sm:border-l border-[var(--color-border)]", children: [
              /* @__PURE__ */ jsx(
                Typography,
                {
                  variant: "small",
                  className: "text-[var(--color-muted-foreground)] whitespace-nowrap",
                  children: t("table.bulk.selected", {
                    count: String(selectedIds.length)
                  })
                }
              ),
              /* @__PURE__ */ jsx(HStack, { className: "flex-wrap gap-2", children: bulkActions.map((action, idx) => /* @__PURE__ */ jsx(
                Button,
                {
                  variant: action.variant === "danger" ? "danger" : "secondary",
                  size: "sm",
                  leftIcon: action.icon && /* @__PURE__ */ jsx(action.icon, { className: "h-4 w-4" }),
                  onClick: () => action.onClick(selectedRows),
                  children: action.label
                },
                idx
              )) })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Box, { className: "flex sm:ml-auto", children: headerActions })
        ] }),
        /* @__PURE__ */ jsx(Box, { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-[var(--color-table-header)] border-b-2 border-[var(--color-border)]", children: /* @__PURE__ */ jsxs("tr", { children: [
            selectable && // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable
            /* @__PURE__ */ jsx("th", { className: "w-12 px-4 py-3", children: /* @__PURE__ */ jsx(
              Checkbox,
              {
                checked: allSelected,
                indeterminate: someSelected,
                onChange: handleSelectAll
              }
            ) }),
            normalizedColumns.map((col) => (
              // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable
              /* @__PURE__ */ jsx(
                "th",
                {
                  className: cn(
                    "px-4 py-3 text-left text-xs font-bold text-[var(--color-foreground)] uppercase tracking-wider whitespace-nowrap",
                    col.sortable && "cursor-pointer select-none hover:bg-[var(--color-table-row-hover)]"
                  ),
                  style: { width: col.width },
                  onClick: () => col.sortable && handleSort(String(col.key)),
                  children: /* @__PURE__ */ jsxs(HStack, { className: "items-center gap-1", children: [
                    col.header,
                    col.sortable && sortBy === col.key && (sortDirection === "asc" ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" }))
                  ] })
                },
                String(col.key)
              )
            )),
            rowActions && /* @__PURE__ */ jsx("th", { className: "w-12 px-4 py-3" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: isLoading ? (
            // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable
            /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(
              "td",
              {
                colSpan: normalizedColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0),
                className: "px-4 py-12 text-center",
                children: /* @__PURE__ */ jsxs(VStack, { className: "items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Spinner, { size: "lg" }),
                  /* @__PURE__ */ jsx(
                    Typography,
                    {
                      variant: "small",
                      className: "text-[var(--color-muted-foreground)]",
                      children: t("common.loading")
                    }
                  )
                ] })
              }
            ) })
          ) : error ? (
            // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable
            /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs(
              "td",
              {
                colSpan: normalizedColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0),
                className: "px-4 py-12 text-center text-[var(--color-error)]",
                children: [
                  t("error.generic") + ": ",
                  error.message
                ]
              }
            ) })
          ) : items.length === 0 ? (
            // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable
            /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(
              "td",
              {
                colSpan: normalizedColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0),
                className: "px-4 py-12",
                children: /* @__PURE__ */ jsx(
                  EmptyState,
                  {
                    icon: emptyIcon,
                    title: resolvedEmptyTitle,
                    description: resolvedEmptyDescription,
                    actionLabel: emptyAction?.label,
                    actionEvent: emptyAction?.event
                  }
                )
              }
            ) })
          ) : items.map((row, rowIndex) => (
            // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable
            /* @__PURE__ */ jsxs(
              "tr",
              {
                className: cn(
                  "border-b border-[var(--color-table-border)] last:border-0 hover:bg-[var(--color-table-row-hover)] transition-colors",
                  selectedIds.includes(row.id) && "bg-[var(--color-primary)]/10 font-medium",
                  isRowClickable && "cursor-pointer"
                ),
                onClick: () => isRowClickable && handleRowClick(row),
                children: [
                  selectable && // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(
                    Checkbox,
                    {
                      checked: selectedIds.includes(row.id),
                      onChange: () => handleSelectRow(row.id)
                    }
                  ) }),
                  normalizedColumns.map((col) => {
                    const cellValue = getNestedValue(
                      row,
                      String(col.key)
                    );
                    return (
                      // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable
                      /* @__PURE__ */ jsx(
                        "td",
                        {
                          className: "px-4 py-3 text-sm text-[var(--color-foreground)] whitespace-nowrap sm:whitespace-normal",
                          children: col.render ? col.render(cellValue, row, rowIndex) : String(cellValue ?? "")
                        },
                        String(col.key)
                      )
                    );
                  }),
                  rowActions && // eslint-disable-next-line almadar/no-raw-dom-elements -- native table elements in DataTable
                  /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 relative", children: [
                    /* @__PURE__ */ jsx(
                      Button,
                      {
                        variant: "ghost",
                        className: "p-1 rounded hover:bg-[var(--color-muted)]",
                        onClick: (e) => {
                          e.stopPropagation();
                          setOpenActionMenu(
                            openActionMenu === row.id ? null : row.id
                          );
                        },
                        children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4 text-[var(--color-muted-foreground)]" })
                      }
                    ),
                    openActionMenu === row.id && /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(
                        Box,
                        {
                          className: "fixed inset-0 z-40",
                          onClick: (e) => {
                            e.stopPropagation();
                            setOpenActionMenu(null);
                          }
                        }
                      ),
                      /* @__PURE__ */ jsx(VStack, { className: "absolute right-0 mt-1 w-48 bg-[var(--color-card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--color-border)] py-1 z-50", children: rowActions.filter(
                        (action) => !action.show || action.show(row)
                      ).map((action, idx) => /* @__PURE__ */ jsxs(
                        Button,
                        {
                          variant: "ghost",
                          "data-event": action.event,
                          "data-testid": action.event ? `action-${action.event}` : void 0,
                          className: cn(
                            "w-full flex items-center gap-2 px-4 py-2 text-sm",
                            action.variant === "danger" ? "text-[var(--color-error)] hover:bg-[var(--color-error)]/10" : "text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
                          ),
                          onClick: (e) => {
                            e.stopPropagation();
                            action.onClick(row);
                            setOpenActionMenu(null);
                          },
                          children: [
                            action.icon && /* @__PURE__ */ jsx(action.icon, { className: "h-4 w-4" }),
                            action.label
                          ]
                        },
                        idx
                      )) })
                    ] })
                  ] })
                ]
              },
              row.id
            )
          )) })
        ] }) }),
        totalCount !== void 0 && totalPages > 1 && /* @__PURE__ */ jsx(Box, { className: "px-4 py-3 border-t-2 border-[var(--color-border)]", children: /* @__PURE__ */ jsx(
          Pagination,
          {
            currentPage,
            totalPages,
            onPageChange: handlePageChange,
            showTotal,
            totalItems: total
          }
        ) })
      ]
    }
  );
}
DataTable.displayName = "DataTable";
var StatCard = ({
  label: propLabel,
  title: propTitle,
  value: propValue,
  previousValue,
  currentValue,
  trend: manualTrend,
  trendDirection: manualDirection,
  invertTrend = false,
  icon: Icon2,
  iconBg = "bg-[var(--color-muted)]",
  iconColor = "text-[var(--color-foreground)]",
  subtitle,
  action,
  className,
  // Schema-based props
  entity,
  metrics,
  data: externalData,
  isLoading: externalLoading,
  error: externalError
}) => {
  const labelToUse = propLabel ?? propTitle;
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const handleActionClick = React41__default.useCallback(() => {
    if (action?.event) {
      eventBus.emit(`UI:${action.event}`, { entity });
    }
    if (action?.onClick) {
      action.onClick();
    }
  }, [action, eventBus, entity]);
  const shouldAutoFetch = !!entity && !externalData && !!metrics;
  const { data: fetchedData, isLoading: fetchLoading } = useEntityList(
    shouldAutoFetch ? entity : void 0,
    { skip: !shouldAutoFetch }
  );
  const data = externalData ?? fetchedData ?? [];
  const isLoading = externalLoading ?? (shouldAutoFetch ? fetchLoading : false);
  const error = externalError;
  const computeMetricValue = React41__default.useCallback(
    (metric, items) => {
      if (metric.value !== void 0) {
        return metric.value;
      }
      const field = metric.field;
      if (!field) {
        return 0;
      }
      if (field === "count") {
        return items.length;
      }
      if (field.includes(":")) {
        const [fieldName, fieldValue] = field.split(":");
        return items.filter((item) => item[fieldName] === fieldValue).length;
      }
      const fieldExistsOnItems = items.some((item) => field in item);
      if (fieldExistsOnItems) {
        return items.reduce((acc, item) => {
          const val = item[field];
          return acc + (typeof val === "number" ? val : 0);
        }, 0);
      }
      const statusFields = ["status", "state", "phase"];
      for (const statusField of statusFields) {
        const hasStatusField = items.some((item) => statusField in item);
        if (hasStatusField) {
          const count = items.filter(
            (item) => item[statusField] === field
          ).length;
          if (count > 0 || items.length === 0) {
            return count;
          }
        }
      }
      return 0;
    },
    []
  );
  const schemaStats = React41__default.useMemo(() => {
    if (!metrics || metrics.length === 0) return null;
    return metrics.map((metric) => ({
      label: metric.label,
      value: computeMetricValue(metric, data),
      format: metric.format
    }));
  }, [metrics, data, computeMetricValue]);
  if (schemaStats && schemaStats.length > 1) {
    if (isLoading) {
      return /* @__PURE__ */ jsx(
        Box,
        {
          className: cn("grid gap-4", className),
          style: { gridTemplateColumns: `repeat(${schemaStats.length}, 1fr)` },
          children: schemaStats.map((_, idx) => /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs(VStack, { gap: "xs", className: "animate-pulse", children: [
            /* @__PURE__ */ jsx(Box, { className: "h-3 bg-[var(--color-muted)] rounded w-16" }),
            /* @__PURE__ */ jsx(Box, { className: "h-6 bg-[var(--color-muted)] rounded w-12" })
          ] }) }, idx))
        }
      );
    }
    return /* @__PURE__ */ jsx(
      Box,
      {
        className: cn("grid gap-4", className),
        style: { gridTemplateColumns: `repeat(${schemaStats.length}, 1fr)` },
        children: schemaStats.map((stat, idx) => /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
          /* @__PURE__ */ jsx(Typography, { variant: "overline", color: "secondary", children: stat.label }),
          /* @__PURE__ */ jsx(Typography, { variant: "h4", className: "text-xl", children: stat.value })
        ] }, idx))
      }
    );
  }
  const label = schemaStats?.[0]?.label || labelToUse || entity || "Stat";
  const normalizedPropValue = Array.isArray(propValue) ? propValue[0] ?? propValue.length : propValue;
  const value = schemaStats?.[0]?.value ?? normalizedPropValue ?? 0;
  const calculatedTrend = useMemo4(() => {
    if (manualTrend !== void 0) return manualTrend;
    if (previousValue === void 0 || currentValue === void 0)
      return void 0;
    if (previousValue === 0) return currentValue > 0 ? 100 : 0;
    return (currentValue - previousValue) / previousValue * 100;
  }, [manualTrend, previousValue, currentValue]);
  const trendDirection = manualDirection || (calculatedTrend === void 0 || calculatedTrend === 0 ? "neutral" : calculatedTrend > 0 ? "up" : "down");
  const isPositive = invertTrend ? trendDirection === "down" : trendDirection === "up";
  const TrendIcon = trendDirection === "up" ? TrendingUp : trendDirection === "down" ? TrendingDown : Minus;
  if (error) {
    return /* @__PURE__ */ jsx(Card, { className: cn("p-6", className), children: /* @__PURE__ */ jsxs(VStack, { gap: "none", className: "space-y-1", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "overline", color: "secondary", children: label }),
      /* @__PURE__ */ jsx(Typography, { variant: "small", color: "error", children: t("error.generic") + ": " + error.message })
    ] }) });
  }
  if (isLoading) {
    return /* @__PURE__ */ jsx(Card, { className: cn("p-6", className), children: /* @__PURE__ */ jsxs(VStack, { gap: "sm", className: "animate-pulse", children: [
      /* @__PURE__ */ jsx(Box, { className: "h-4 bg-[var(--color-muted)] rounded w-24" }),
      /* @__PURE__ */ jsx(Box, { className: "h-8 bg-[var(--color-muted)] rounded w-32" }),
      /* @__PURE__ */ jsx(Box, { className: "h-4 bg-[var(--color-muted)] rounded w-20" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs(Card, { className: cn("p-6", className), children: [
    /* @__PURE__ */ jsxs(HStack, { align: "start", justify: "between", children: [
      /* @__PURE__ */ jsxs(VStack, { gap: "none", className: "space-y-1", children: [
        /* @__PURE__ */ jsx(Typography, { variant: "overline", color: "secondary", children: label }),
        /* @__PURE__ */ jsx(Typography, { variant: "h4", className: "text-2xl", children: value }),
        calculatedTrend !== void 0 && /* @__PURE__ */ jsxs(HStack, { align: "center", gap: "xs", children: [
          /* @__PURE__ */ jsxs(
            HStack,
            {
              align: "center",
              gap: "none",
              className: cn(
                "gap-0.5 text-sm font-bold",
                isPositive ? "text-[var(--color-success)]" : trendDirection === "neutral" ? "text-[var(--color-muted-foreground)]" : "text-[var(--color-error)]"
              ),
              children: [
                /* @__PURE__ */ jsx(TrendIcon, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxs(Typography, { variant: "caption", as: "span", children: [
                  Math.abs(calculatedTrend).toFixed(1),
                  "%"
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsx(Typography, { variant: "small", color: "secondary", as: "span", children: "vs last period" })
        ] }),
        subtitle && !calculatedTrend && /* @__PURE__ */ jsx(Typography, { variant: "small", color: "secondary", children: subtitle })
      ] }),
      Icon2 && /* @__PURE__ */ jsx(Box, { className: cn("p-3", iconBg), children: /* @__PURE__ */ jsx(Icon2, { className: cn("h-6 w-6", iconColor) }) })
    ] }),
    action && /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "ghost",
        onClick: handleActionClick,
        className: "mt-4 text-sm font-bold text-[var(--color-foreground)] hover:underline",
        children: [
          action.label,
          " \u2192"
        ]
      }
    )
  ] });
};
StatCard.displayName = "StatCard";
function useMemo4(factory, deps) {
  return React41__default.useMemo(factory, deps);
}
var PageHeader = ({
  title,
  subtitle,
  showBack = false,
  backEvent = "BACK",
  breadcrumbs,
  status,
  actions,
  isLoading,
  tabs,
  activeTab,
  onTabChange,
  children,
  className
}) => {
  const eventBus = useEventBus();
  const handleBack = () => {
    eventBus.emit(`UI:${backEvent}`);
  };
  const createActionHandler = (action) => () => {
    if (action.event) {
      eventBus.emit(`UI:${action.event}`);
    }
    if (action.navigatesTo) {
      eventBus.emit("UI:NAVIGATE", { url: action.navigatesTo });
    }
    if (action.onClick) {
      action.onClick();
    }
  };
  const statusColors = {
    default: "bg-[var(--color-muted)] text-[var(--color-foreground)]",
    success: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    warning: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
    danger: "bg-[var(--color-error)]/10 text-[var(--color-error)]",
    info: "bg-[var(--color-info)]/10 text-[var(--color-info)]"
  };
  return /* @__PURE__ */ jsxs(Box, { className: cn("mb-6", className), children: [
    breadcrumbs && breadcrumbs.length > 0 && /* @__PURE__ */ jsx(Box, { as: "nav", className: "mb-4", children: /* @__PURE__ */ jsx(Box, { as: "ol", className: "flex items-center gap-2 text-sm", children: breadcrumbs.map((crumb, idx) => /* @__PURE__ */ jsxs(React41__default.Fragment, { children: [
      idx > 0 && /* @__PURE__ */ jsx(Typography, { variant: "small", color: "muted", children: "/" }),
      crumb.href ? (
        // eslint-disable-next-line almadar/no-raw-dom-elements -- semantic anchor with href
        /* @__PURE__ */ jsx(
          "a",
          {
            href: crumb.href,
            className: "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
            children: crumb.label
          }
        )
      ) : /* @__PURE__ */ jsx(Typography, { variant: "small", className: "text-[var(--color-foreground)] font-medium", children: crumb.label })
    ] }, idx)) }) }),
    /* @__PURE__ */ jsxs(Box, { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs(Box, { className: "flex items-start gap-4", children: [
        showBack && /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            onClick: handleBack,
            className: "mt-1 p-2 rounded-[var(--radius-lg)]",
            children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-5 w-5 text-[var(--color-muted-foreground)]" })
          }
        ),
        /* @__PURE__ */ jsxs(Box, { children: [
          /* @__PURE__ */ jsxs(Box, { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Typography, { variant: "h1", className: "text-2xl font-bold text-[var(--color-foreground)]", children: title != null ? String(title) : "" }),
            status && /* @__PURE__ */ jsx(
              Typography,
              {
                variant: "small",
                className: cn(
                  "px-2.5 py-1 rounded-[var(--radius-full)] text-xs font-medium",
                  statusColors[status.variant || "default"]
                ),
                children: status.label
              }
            )
          ] }),
          subtitle != null && subtitle !== "" && /* @__PURE__ */ jsx(Typography, { variant: "body", color: "muted", className: "mt-1 text-sm", children: String(subtitle) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Box, { className: "flex items-center gap-2 shrink-0", children: actions?.map((action, idx) => /* @__PURE__ */ jsx(
        Button,
        {
          "data-event": action.event,
          "data-testid": action.event ? `action-${action.event}` : void 0,
          variant: action.variant || (idx === 0 ? "primary" : "secondary"),
          leftIcon: action.icon && /* @__PURE__ */ jsx(action.icon, { className: "h-4 w-4" }),
          onClick: createActionHandler(action),
          isLoading: action.loading || isLoading,
          disabled: action.disabled || isLoading,
          children: action.label
        },
        `action-${idx}`
      )) })
    ] }),
    tabs && tabs.length > 0 && /* @__PURE__ */ jsx(Box, { className: "mt-6 border-b border-[var(--color-border)]", children: /* @__PURE__ */ jsx(Box, { as: "nav", className: "flex gap-6", children: tabs.map((tab) => /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "ghost",
        onClick: () => onTabChange?.(tab.value),
        className: cn(
          "pb-3 text-sm font-bold border-b-2 transition-colors rounded-none",
          activeTab === tab.value ? "border-[var(--color-primary)] text-[var(--color-foreground)]" : "border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--color-border)]"
        ),
        children: [
          tab.label,
          tab.count !== void 0 && /* @__PURE__ */ jsx(
            Typography,
            {
              variant: "small",
              className: cn(
                "ml-2 px-2 py-0.5 rounded-[var(--radius-full)] text-xs",
                activeTab === tab.value ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
              ),
              children: tab.count
            }
          )
        ]
      },
      tab.value
    )) }) }),
    children
  ] });
};
PageHeader.displayName = "PageHeader";
function getFieldIcon(fieldName) {
  const name = fieldName.toLowerCase();
  if (name.includes("date") || name.includes("time")) return Calendar;
  if (name.includes("status")) return Tag;
  if (name.includes("priority")) return AlertCircle;
  if (name.includes("progress") || name.includes("percent")) return TrendingUp;
  if (name.includes("assignee") || name.includes("owner") || name.includes("user") || name.includes("member"))
    return User;
  if (name.includes("due")) return Clock;
  if (name.includes("complete")) return CheckCircle2;
  if (name.includes("budget") || name.includes("cost") || name.includes("price"))
    return DollarSign;
  if (name.includes("description") || name.includes("note") || name.includes("comment"))
    return FileText;
  return Package;
}
function getBadgeVariant(fieldName, value) {
  const name = fieldName.toLowerCase();
  const val = String(value).toLowerCase();
  if (name.includes("status")) {
    if (val.includes("complete") || val.includes("done") || val.includes("active"))
      return "success";
    if (val.includes("progress") || val.includes("pending")) return "warning";
    if (val.includes("block") || val.includes("cancel")) return "danger";
    return "info";
  }
  if (name.includes("priority")) {
    if (val.includes("high") || val.includes("urgent")) return "danger";
    if (val.includes("medium") || val.includes("normal")) return "warning";
    if (val.includes("low")) return "info";
  }
  return "default";
}
function formatFieldLabel(fieldName) {
  return fieldName.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
}
function formatFieldValue(value, fieldName) {
  if (typeof value === "number") {
    if (fieldName.toLowerCase().includes("progress") || fieldName.toLowerCase().includes("percent")) {
      return `${value}%`;
    }
    if (fieldName.toLowerCase().includes("budget") || fieldName.toLowerCase().includes("cost")) {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  return String(value);
}
function normalizeFieldDefs(fields) {
  if (!fields) return [];
  return fields.map((f) => typeof f === "string" ? f : f.key);
}
var DetailPanel = ({
  title: propTitle,
  subtitle,
  status,
  avatar,
  sections: propSections,
  actions,
  footer,
  slideOver = false,
  className,
  entity,
  fields: propFields,
  fieldNames,
  data: externalData,
  initialData,
  isLoading = false,
  error
}) => {
  const eventBus = useEventBus();
  const isFieldDefArray = (arr) => {
    if (!arr || arr.length === 0) return false;
    const first = arr[0];
    return typeof first === "string" || typeof first === "object" && first !== null && "key" in first;
  };
  const effectiveFieldNames = isFieldDefArray(propFields) ? normalizeFieldDefs(propFields) : fieldNames;
  const handleActionClick = useCallback(
    (action, data2) => {
      if (action.navigatesTo) {
        const url = action.navigatesTo.replace(
          /\{\{(\w+)\}\}/g,
          (_, key) => String(data2?.[key] ?? "")
        );
        eventBus.emit("UI:NAVIGATE", { url, row: data2, entity });
        return;
      }
      if (action.event) {
        eventBus.emit(`UI:${action.event}`, { row: data2, entity });
      }
      if (action.onClick) {
        action.onClick();
      }
    },
    [eventBus, entity]
  );
  const handleClose = useCallback(() => {
    eventBus.emit("UI:CLOSE", {});
  }, [eventBus]);
  const data = externalData ?? initialData;
  let title = propTitle;
  let sections = propSections ? [...propSections] : void 0;
  const normalizedData = data && typeof data === "object" && !Array.isArray(data) ? data : void 0;
  if (sections && normalizedData) {
    sections = sections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => {
        if (typeof field === "string") {
          const value = getNestedValue(normalizedData, field);
          return {
            label: formatFieldLabel(field),
            value: formatFieldValue(value, field),
            icon: getFieldIcon(field)
          };
        }
        return field;
      })
    }));
  }
  if (normalizedData && effectiveFieldNames) {
    const primaryField = effectiveFieldNames[0];
    if (!title && primaryField && normalizedData[primaryField]) {
      title = String(normalizedData[primaryField]);
    }
    const statusFields = effectiveFieldNames.filter(
      (f) => f.toLowerCase().includes("status") || f.toLowerCase().includes("priority")
    );
    const progressFields = effectiveFieldNames.filter(
      (f) => f.toLowerCase().includes("progress") || f.toLowerCase().includes("percent")
    );
    const metricFields = effectiveFieldNames.filter(
      (f) => (f.toLowerCase().includes("budget") || f.toLowerCase().includes("cost") || f.toLowerCase().includes("count")) && !progressFields.includes(f)
    );
    const dateFields = effectiveFieldNames.filter(
      (f) => f.toLowerCase().includes("date") || f.toLowerCase().includes("time")
    );
    const descriptionFields = effectiveFieldNames.filter(
      (f) => f.toLowerCase().includes("description") || f.toLowerCase().includes("note")
    );
    const otherFields = effectiveFieldNames.filter(
      (f) => f !== primaryField && !statusFields.includes(f) && !progressFields.includes(f) && !metricFields.includes(f) && !dateFields.includes(f) && !descriptionFields.includes(f)
    );
    sections = [];
    if (statusFields.length > 0 || otherFields.length > 0) {
      const overviewFields = [];
      [...statusFields, ...otherFields.slice(0, 3)].forEach((field) => {
        const value = getNestedValue(normalizedData, field);
        if (value !== void 0 && value !== null) {
          overviewFields.push({
            label: formatFieldLabel(field),
            value: formatFieldValue(value, field),
            icon: getFieldIcon(field)
          });
        }
      });
      if (overviewFields.length > 0) {
        sections.push({ title: "Overview", fields: overviewFields });
      }
    }
    if (progressFields.length > 0 || metricFields.length > 0) {
      const metricsFields = [];
      [...progressFields, ...metricFields].forEach((field) => {
        const value = getNestedValue(normalizedData, field);
        if (value !== void 0 && value !== null) {
          metricsFields.push({
            label: formatFieldLabel(field),
            value: formatFieldValue(value, field),
            icon: getFieldIcon(field)
          });
        }
      });
      if (metricsFields.length > 0) {
        sections.push({ title: "Metrics", fields: metricsFields });
      }
    }
    if (dateFields.length > 0) {
      const timelineFields = [];
      dateFields.forEach((field) => {
        const value = getNestedValue(normalizedData, field);
        if (value !== void 0 && value !== null) {
          timelineFields.push({
            label: formatFieldLabel(field),
            value: formatFieldValue(value, field),
            icon: getFieldIcon(field)
          });
        }
      });
      if (timelineFields.length > 0) {
        sections.push({ title: "Timeline", fields: timelineFields });
      }
    }
    if (descriptionFields.length > 0) {
      const descFields = [];
      descriptionFields.forEach((field) => {
        const value = getNestedValue(normalizedData, field);
        if (value !== void 0 && value !== null) {
          descFields.push({
            label: formatFieldLabel(field),
            value: String(value),
            icon: getFieldIcon(field)
          });
        }
      });
      if (descFields.length > 0) {
        sections.push({ title: "Details", fields: descFields });
      }
    }
  }
  if (isLoading) {
    return /* @__PURE__ */ jsx(
      LoadingState,
      {
        message: `Loading ${entity || "details"}...`,
        className
      }
    );
  }
  if (error) {
    return /* @__PURE__ */ jsx(
      ErrorState,
      {
        title: "Error loading data",
        message: error.message || "An error occurred while loading the data.",
        onRetry: () => window.location.reload(),
        className
      }
    );
  }
  if (!normalizedData && !isLoading && effectiveFieldNames && effectiveFieldNames.length > 0) {
    return /* @__PURE__ */ jsx(
      EmptyState,
      {
        title: "Not Found",
        description: `The requested ${entity || "item"} could not be found.`,
        className
      }
    );
  }
  const content = /* @__PURE__ */ jsxs(VStack, { gap: "lg", children: [
    /* @__PURE__ */ jsx(Card, { variant: "elevated", children: /* @__PURE__ */ jsxs(VStack, { gap: "md", className: "p-6", children: [
      /* @__PURE__ */ jsxs(HStack, { justify: "between", align: "start", children: [
        /* @__PURE__ */ jsxs(VStack, { gap: "sm", flex: true, className: "min-w-0", children: [
          avatar,
          /* @__PURE__ */ jsx(Typography, { variant: "h2", weight: "bold", children: title || entity || "Details" }),
          subtitle && /* @__PURE__ */ jsx(Typography, { variant: "body", color: "secondary", children: subtitle }),
          normalizedData && effectiveFieldNames && /* @__PURE__ */ jsx(HStack, { gap: "xs", wrap: true, children: effectiveFieldNames.filter(
            (f) => f.toLowerCase().includes("status") || f.toLowerCase().includes("priority")
          ).map((field) => {
            const value = getNestedValue(normalizedData, field);
            if (!value) return null;
            return /* @__PURE__ */ jsx(
              Badge,
              {
                variant: getBadgeVariant(field, String(value)),
                children: String(value)
              },
              field
            );
          }) }),
          status && /* @__PURE__ */ jsx(Badge, { variant: status.variant ?? "default", children: status.label })
        ] }),
        slideOver && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: handleClose, icon: X })
      ] }),
      normalizedData && effectiveFieldNames && effectiveFieldNames.filter(
        (f) => f.toLowerCase().includes("progress") || f.toLowerCase().includes("percent")
      ).map((field) => {
        const value = getNestedValue(normalizedData, field);
        if (value === void 0 || value === null || typeof value !== "number")
          return null;
        return /* @__PURE__ */ jsxs(VStack, { gap: "xs", className: "w-full", children: [
          /* @__PURE__ */ jsxs(HStack, { justify: "between", children: [
            /* @__PURE__ */ jsx(Typography, { variant: "small", color: "secondary", children: formatFieldLabel(field) }),
            /* @__PURE__ */ jsxs(Typography, { variant: "small", weight: "medium", children: [
              value,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx(ProgressBar, { value })
        ] }, field);
      }),
      actions && actions.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsx(HStack, { gap: "sm", children: actions.map((action, idx) => /* @__PURE__ */ jsx(
          Button,
          {
            variant: action.variant || "secondary",
            onClick: () => handleActionClick(action, normalizedData),
            icon: action.icon,
            children: action.label
          },
          idx
        )) })
      ] })
    ] }) }),
    sections && sections.map((section, sectionIdx) => /* @__PURE__ */ jsx(Card, { variant: "bordered", children: /* @__PURE__ */ jsxs(VStack, { gap: "md", className: "p-6", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "h4", weight: "semibold", children: section.title }),
      /* @__PURE__ */ jsx(Divider, {}),
      /* @__PURE__ */ jsx(SimpleGrid, { minChildWidth: "250px", maxCols: 2, gap: "lg", children: section.fields.map((field, fieldIdx) => {
        const resolved = typeof field === "string" ? { label: formatFieldLabel(field), value: normalizedData ? formatFieldValue(getNestedValue(normalizedData, field), field) : "\u2014", icon: getFieldIcon(field) } : field;
        return /* @__PURE__ */ jsxs(HStack, { gap: "sm", align: "start", children: [
          resolved.icon && /* @__PURE__ */ jsx(
            Icon,
            {
              icon: resolved.icon,
              size: "md",
              className: "text-[var(--color-muted-foreground)] mt-1"
            }
          ),
          /* @__PURE__ */ jsxs(VStack, { gap: "xs", flex: true, className: "min-w-0", children: [
            /* @__PURE__ */ jsx(
              Typography,
              {
                variant: "small",
                color: "secondary",
                weight: "medium",
                children: resolved.label
              }
            ),
            /* @__PURE__ */ jsx(Typography, { variant: "body", className: "break-words", children: resolved.value || "\u2014" })
          ] })
        ] }, fieldIdx);
      }) })
    ] }) }, sectionIdx)),
    footer && /* @__PURE__ */ jsx(Card, { variant: "bordered", children: footer })
  ] });
  return /* @__PURE__ */ jsx(
    Box,
    {
      className: cn(
        slideOver && "fixed inset-y-0 right-0 w-full max-w-2xl bg-[var(--color-card)] shadow-[var(--shadow-lg)] z-50 overflow-y-auto p-6",
        className
      ),
      children: content
    }
  );
};
DetailPanel.displayName = "DetailPanel";
function toSharedContext2(formCtx) {
  return createMinimalContext(
    {
      formValues: formCtx.formValues,
      globalVariables: formCtx.globalVariables,
      localVariables: formCtx.localVariables ?? {},
      ...formCtx.entity
    },
    {},
    "active"
  );
}
function evaluateFormExpression(expr, formCtx) {
  const ctx = toSharedContext2(formCtx);
  return evaluate(expr, ctx);
}
var layoutStyles = {
  vertical: "flex flex-col",
  horizontal: "flex flex-row flex-wrap items-end",
  inline: "flex flex-row flex-wrap items-center"
};
var gapStyles5 = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6"
};
function getEnumOptions(field) {
  if (field.options && field.options.length > 0) {
    return [...field.options];
  }
  if (field.values && field.values.length > 0) {
    return field.values.map((v) => ({
      value: v,
      label: v.charAt(0).toUpperCase() + v.slice(1).replace(/_/g, " ")
    }));
  }
  const validation = field.validation;
  if (validation?.enum && Array.isArray(validation.enum)) {
    return validation.enum.map((v) => ({
      value: v,
      label: v.charAt(0).toUpperCase() + v.slice(1).replace(/_/g, " ")
    }));
  }
  return [];
}
function determineInputType(field) {
  if (field.inputType) {
    return field.inputType;
  }
  if (field.type === "relation" || field.relation) {
    return "relation";
  }
  if (field.type === "enum" || field.values || getEnumOptions(field).length > 0) {
    return "select";
  }
  switch (field.type?.toLowerCase()) {
    case "email":
      return "email";
    case "password":
      return "password";
    case "url":
      return "url";
    case "number":
    case "integer":
    case "float":
      return "number";
    case "date":
      return "date";
    case "datetime":
    case "timestamp":
      return "datetime-local";
    case "boolean":
      return "checkbox";
    case "textarea":
    case "text":
      return field.max && field.max > 200 ? "textarea" : "text";
    default:
      return "text";
  }
}
var Form = ({
  children,
  onSubmit,
  onCancel,
  layout = "vertical",
  gap = "md",
  className,
  // Schema-based props
  entity,
  fields,
  initialData = {},
  isLoading = false,
  error,
  submitLabel,
  cancelLabel,
  showCancel,
  title,
  submitEvent = "SAVE",
  cancelEvent = "CANCEL",
  relationsData = {},
  relationsLoading = {},
  // Inspection form extensions - may come as boolean true from generated code (meaning enabled but config loaded separately)
  conditionalFields: conditionalFieldsRaw = {},
  hiddenCalculations: hiddenCalculationsRaw = [],
  violationTriggers: violationTriggersRaw = [],
  evaluationContext: externalContext,
  sections = [],
  onFieldChange,
  ...props
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const resolvedSubmitLabel = submitLabel ?? t("common.save");
  const resolvedCancelLabel = cancelLabel ?? t("common.cancel");
  const normalizedInitialData = initialData ?? {};
  const conditionalFields = typeof conditionalFieldsRaw === "boolean" ? {} : conditionalFieldsRaw;
  const hiddenCalculations = typeof hiddenCalculationsRaw === "boolean" ? [] : hiddenCalculationsRaw;
  const violationTriggers = typeof violationTriggersRaw === "boolean" ? [] : violationTriggersRaw;
  const [formData, setFormData] = React41__default.useState(
    normalizedInitialData
  );
  const [collapsedSections, setCollapsedSections] = React41__default.useState(
    /* @__PURE__ */ new Set()
  );
  const shouldShowCancel = showCancel ?? (fields && fields.length > 0);
  const evalContext = React41__default.useMemo(
    () => ({
      formValues: formData,
      globalVariables: externalContext?.globalVariables ?? {},
      localVariables: externalContext?.localVariables ?? {},
      entity: externalContext?.entity ?? {}
    }),
    [formData, externalContext]
  );
  React41__default.useEffect(() => {
    const data = initialData;
    if (data && Object.keys(data).length > 0) {
      setFormData(data);
    }
  }, [initialData]);
  const processCalculations = React41__default.useCallback(
    (changedFieldId, newFormData) => {
      if (!hiddenCalculations.length) return;
      const context = {
        formValues: newFormData,
        globalVariables: externalContext?.globalVariables ?? {},
        localVariables: externalContext?.localVariables ?? {},
        entity: externalContext?.entity ?? {}
      };
      hiddenCalculations.forEach((calc) => {
        if (calc.triggerFields.includes(changedFieldId)) {
          const value = evaluateFormExpression(calc.expression, context);
          eventBus.emit("UI:GLOBAL_VARIABLE_SET", {
            variable: calc.variableName,
            value
          });
          debug(
            "forms",
            `Calculation triggered: ${calc.variableName} = ${value}`
          );
        }
      });
    },
    [hiddenCalculations, externalContext, eventBus]
  );
  const checkViolations = React41__default.useCallback(
    (changedFieldId, newFormData) => {
      if (!violationTriggers.length) return;
      const context = {
        formValues: newFormData,
        globalVariables: externalContext?.globalVariables ?? {},
        localVariables: externalContext?.localVariables ?? {},
        entity: externalContext?.entity ?? {}
      };
      violationTriggers.forEach((trigger) => {
        const conditionMet = evaluateFormExpression(trigger.condition, context);
        if (conditionMet) {
          eventBus.emit("UI:VIOLATION_DETECTED", {
            fieldId: trigger.fieldId ?? changedFieldId,
            ...trigger.violation
          });
          debug(
            "forms",
            `Violation detected: ${trigger.violation.law} ${trigger.violation.article}`
          );
        }
      });
    },
    [violationTriggers, externalContext, eventBus]
  );
  const handleChange = (name, value) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    eventBus.emit("UI:FIELD_CHANGED", {
      fieldId: name,
      value,
      formValues: newFormData
    });
    onFieldChange?.({ fieldId: name, value, formValues: newFormData });
    processCalculations(name, newFormData);
    checkViolations(name, newFormData);
  };
  const isFieldVisible = React41__default.useCallback(
    (fieldName) => {
      const condition = conditionalFields[fieldName];
      if (!condition) return true;
      return Boolean(evaluateFormExpression(condition, evalContext));
    },
    [conditionalFields, evalContext]
  );
  const isSectionVisible = React41__default.useCallback(
    (section) => {
      if (!section.condition) return true;
      return Boolean(evaluateFormExpression(section.condition, evalContext));
    },
    [evalContext]
  );
  const toggleSection = (sectionId) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    eventBus.emit(`UI:${submitEvent}`, { data: formData, entity });
    if (onSubmit) {
      eventBus.emit(`UI:${onSubmit}`, { data: formData, entity });
    }
  };
  const handleCancel = () => {
    eventBus.emit(`UI:${cancelEvent}`);
    eventBus.emit("UI:CLOSE");
    if (onCancel) {
      eventBus.emit(`UI:${onCancel}`);
    }
  };
  const renderField = React41__default.useCallback(
    (field) => {
      const fieldName = field.name || field.field;
      if (!fieldName) return null;
      if (!isFieldVisible(fieldName)) {
        return null;
      }
      const inputType = determineInputType(field);
      const label = field.label || fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, " $1");
      const currentValue = formData[fieldName] ?? field.defaultValue ?? "";
      return /* @__PURE__ */ jsxs(VStack, { gap: "xs", children: [
        inputType !== "checkbox" && /* @__PURE__ */ jsxs(Typography, { as: "label", variant: "label", weight: "bold", children: [
          label,
          field.required && /* @__PURE__ */ jsx(Typography, { as: "span", color: "error", className: "ml-1", children: "*" })
        ] }),
        renderFieldInput(field, fieldName, inputType, currentValue, label)
      ] }, fieldName);
    },
    [formData, isFieldVisible, relationsData, relationsLoading, isLoading]
  );
  const normalizedFields = React41__default.useMemo(() => {
    if (!fields || fields.length === 0) return [];
    return fields.map((field) => {
      if (typeof field === "string") {
        return { name: field, type: "string" };
      }
      return field;
    });
  }, [fields]);
  const schemaFields = React41__default.useMemo(() => {
    if (normalizedFields.length === 0) return null;
    if (isDebugEnabled()) {
      debugGroup(`Form: ${entity || "unknown"}`);
      debug(`Fields count: ${normalizedFields.length}`);
      debug("Conditional fields:", Object.keys(conditionalFields));
      debugGroupEnd();
    }
    return normalizedFields.map(renderField).filter(Boolean);
  }, [normalizedFields, renderField, entity, conditionalFields]);
  const sectionElements = React41__default.useMemo(() => {
    if (!sections || sections.length === 0) return null;
    return sections.map((section) => {
      if (!isSectionVisible(section)) {
        return null;
      }
      const isCollapsed = collapsedSections.has(section.id);
      return /* @__PURE__ */ jsxs(Box, { border: true, rounded: "lg", overflow: "hidden", children: [
        /* @__PURE__ */ jsxs(
          Box,
          {
            className: cn(
              "px-4 py-3 bg-[var(--color-muted)] flex items-center justify-between",
              section.collapsible && "cursor-pointer hover:bg-[var(--color-muted)]/80"
            ),
            onClick: section.collapsible ? () => toggleSection(section.id) : void 0,
            children: [
              /* @__PURE__ */ jsx(Typography, { variant: "label", weight: "semibold", children: section.title }),
              section.collapsible && /* @__PURE__ */ jsx(
                Icon,
                {
                  name: "chevron-down",
                  size: "md",
                  className: cn(
                    "text-[var(--color-muted-foreground)] transition-transform",
                    isCollapsed && "rotate-180"
                  )
                }
              )
            ]
          }
        ),
        !isCollapsed && /* @__PURE__ */ jsx(Box, { padding: "md", children: /* @__PURE__ */ jsx(VStack, { gap: gap === "sm" ? "sm" : gap === "lg" ? "lg" : "md", children: section.fields.map(renderField).filter(Boolean) }) })
      ] }, section.id);
    }).filter(Boolean);
  }, [sections, isSectionVisible, collapsedSections, renderField, gap]);
  function renderFieldInput(field, fieldName, inputType, currentValue, label) {
    const commonProps = {
      id: fieldName,
      name: fieldName,
      required: field.required,
      disabled: isLoading,
      placeholder: field.placeholder
    };
    switch (inputType) {
      case "checkbox":
        return /* @__PURE__ */ jsx(
          Checkbox,
          {
            ...commonProps,
            label: label + (field.required ? " *" : ""),
            checked: Boolean(currentValue),
            onChange: (e) => handleChange(fieldName, e.target.checked)
          }
        );
      case "textarea":
        return /* @__PURE__ */ jsx(
          Textarea,
          {
            ...commonProps,
            value: String(currentValue),
            onChange: (e) => handleChange(fieldName, e.target.value),
            minLength: field.min,
            maxLength: field.max
          }
        );
      case "select": {
        const options = getEnumOptions(field);
        return /* @__PURE__ */ jsx(
          Select,
          {
            ...commonProps,
            options,
            value: String(currentValue),
            onChange: (e) => handleChange(fieldName, e.target.value),
            placeholder: field.placeholder || `Select ${label}...`
          }
        );
      }
      case "relation": {
        const relationOptions = relationsData[fieldName] || [];
        const relationLoading = relationsLoading[fieldName] || false;
        return /* @__PURE__ */ jsx(
          RelationSelect,
          {
            ...commonProps,
            value: currentValue ? String(currentValue) : void 0,
            onChange: (value) => handleChange(fieldName, value),
            options: relationOptions,
            isLoading: relationLoading,
            placeholder: field.placeholder || `Select ${label}...`,
            searchPlaceholder: `Search ${field.relation?.entity || label}...`,
            clearable: !field.required
          }
        );
      }
      case "number":
        return /* @__PURE__ */ jsx(
          Input,
          {
            ...commonProps,
            type: "number",
            value: currentValue !== void 0 && currentValue !== "" ? String(currentValue) : "",
            onChange: (e) => handleChange(
              fieldName,
              e.target.value ? Number(e.target.value) : void 0
            ),
            min: field.min,
            max: field.max
          }
        );
      case "date":
        return /* @__PURE__ */ jsx(
          Input,
          {
            ...commonProps,
            type: "date",
            value: formatDateValue(currentValue),
            onChange: (e) => handleChange(fieldName, e.target.value)
          }
        );
      case "datetime-local":
        return /* @__PURE__ */ jsx(
          Input,
          {
            ...commonProps,
            type: "datetime-local",
            value: formatDateTimeValue(currentValue),
            onChange: (e) => handleChange(fieldName, e.target.value)
          }
        );
      case "email":
        return /* @__PURE__ */ jsx(
          Input,
          {
            ...commonProps,
            type: "email",
            value: String(currentValue),
            onChange: (e) => handleChange(fieldName, e.target.value)
          }
        );
      case "url":
        return /* @__PURE__ */ jsx(
          Input,
          {
            ...commonProps,
            type: "url",
            value: String(currentValue),
            onChange: (e) => handleChange(fieldName, e.target.value)
          }
        );
      case "password":
        return /* @__PURE__ */ jsx(
          Input,
          {
            ...commonProps,
            type: "password",
            value: String(currentValue),
            onChange: (e) => handleChange(fieldName, e.target.value)
          }
        );
      case "text":
      default:
        return /* @__PURE__ */ jsx(
          Input,
          {
            ...commonProps,
            type: "text",
            value: String(currentValue),
            onChange: (e) => handleChange(fieldName, e.target.value),
            minLength: field.min,
            maxLength: field.max,
            pattern: field.pattern
          }
        );
    }
  }
  return (
    // eslint-disable-next-line almadar/no-raw-dom-elements -- native <form> needed for onSubmit semantics
    /* @__PURE__ */ jsxs(
      "form",
      {
        className: cn(layoutStyles[layout], gapStyles5[gap], className),
        onSubmit: handleSubmit,
        ...props,
        children: [
          error && /* @__PURE__ */ jsx(Alert, { variant: "error", className: "mb-4", children: error.message || t("error.occurred") }),
          sectionElements && sectionElements.length > 0 && /* @__PURE__ */ jsx(VStack, { gap: gap === "sm" ? "sm" : gap === "lg" ? "lg" : "md", children: sectionElements }),
          schemaFields,
          children,
          (schemaFields && schemaFields.length > 0 || sectionElements && sectionElements.length > 0) && /* @__PURE__ */ jsxs(HStack, { gap: "sm", className: "pt-4", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "submit",
                variant: "primary",
                disabled: isLoading,
                "data-event": submitEvent,
                "data-testid": `action-${submitEvent}`,
                children: isLoading ? t("form.saving") : resolvedSubmitLabel
              }
            ),
            shouldShowCancel && /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                variant: "secondary",
                onClick: handleCancel,
                disabled: isLoading,
                "data-event": cancelEvent,
                "data-testid": `action-${cancelEvent}`,
                children: resolvedCancelLabel
              }
            )
          ] })
        ]
      }
    )
  );
};
function formatDateValue(value) {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }
  if (typeof value === "string") {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
    return value;
  }
  return "";
}
function formatDateTimeValue(value) {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 16);
  }
  if (typeof value === "string") {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().slice(0, 16);
    }
    return value;
  }
  return "";
}
Form.displayName = "Form";
function normalizeFields(fields) {
  if (!fields) return [];
  return fields.map((f) => typeof f === "string" ? f : f.key);
}
var gapStyles6 = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8"
};
var alignStyles4 = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch"
};
var CardGrid = ({
  minCardWidth = 280,
  maxCols,
  gap = "md",
  alignItems = "stretch",
  className,
  children,
  // EntityDisplayProps
  entity,
  data: externalData,
  isLoading = false,
  error = null,
  page,
  pageSize,
  totalCount,
  // CardGrid-specific
  fields,
  fieldNames,
  columns,
  itemActions,
  showTotal = true
}) => {
  const eventBus = useEventBus();
  const effectiveFieldNames = normalizeFields(fields).length > 0 ? normalizeFields(fields) : fieldNames ?? normalizeFields(columns);
  const gridTemplateColumns = `repeat(auto-fit, minmax(min(${minCardWidth}px, 100%), 1fr))`;
  const normalizedData = Array.isArray(externalData) ? externalData : externalData ? [externalData] : [];
  const resolvedPage = page ?? 1;
  const resolvedTotalPages = totalCount && pageSize ? Math.ceil(totalCount / pageSize) : 1;
  const handlePageChange = (newPage) => {
    eventBus.emit("UI:PAGINATE", { page: newPage, pageSize });
  };
  const handleCardClick = (itemData) => {
    eventBus.emit("UI:VIEW", { row: itemData, entity });
  };
  const renderContent = () => {
    if (children) {
      return children;
    }
    if (isLoading) {
      return /* @__PURE__ */ jsx(Box, { className: "col-span-full text-center py-8 text-[var(--color-muted-foreground)]", children: /* @__PURE__ */ jsxs(Typography, { variant: "body", color: "secondary", children: [
        "Loading ",
        entity || "items",
        "..."
      ] }) });
    }
    if (error) {
      return /* @__PURE__ */ jsx(Box, { className: "col-span-full text-center py-8 text-[var(--color-error)]", children: /* @__PURE__ */ jsxs(Typography, { variant: "body", color: "error", children: [
        "Error loading ",
        entity || "items",
        ": ",
        error.message
      ] }) });
    }
    if (normalizedData.length === 0) {
      return /* @__PURE__ */ jsx(Box, { className: "col-span-full text-center py-8 text-[var(--color-muted-foreground)]", children: /* @__PURE__ */ jsxs(Typography, { variant: "body", color: "secondary", children: [
        "No ",
        entity || "items",
        " found"
      ] }) });
    }
    return normalizedData.map((item, index) => {
      const itemData = item;
      const id = itemData.id || String(index);
      const cardFields = effectiveFieldNames || Object.keys(itemData).slice(0, 3);
      const handleActionClick = (action) => (e) => {
        e.stopPropagation();
        if (action.navigatesTo) {
          const url = action.navigatesTo.replace(/\{\{row\.(\w+(?:\.\w+)*)\}\}/g, (_, field) => {
            const value = getNestedValue(itemData, field);
            return value !== void 0 && value !== null ? String(value) : "";
          });
          eventBus.emit("UI:NAVIGATE", { url, row: itemData, entity });
          return;
        }
        if (action.event) {
          eventBus.emit(`UI:${action.event}`, { row: itemData, entity });
        }
        if (action.onClick) {
          action.onClick(itemData);
        }
      };
      return /* @__PURE__ */ jsxs(
        Box,
        {
          className: cn(
            "bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 shadow-[var(--shadow-sm)]",
            "cursor-pointer hover:border-[var(--color-primary)] transition-colors"
          ),
          onClick: () => handleCardClick(itemData),
          children: [
            cardFields.map((field) => {
              const value = getNestedValue(itemData, field);
              if (value === void 0 || value === null) return null;
              return /* @__PURE__ */ jsxs(Box, { className: "mb-2 last:mb-0", children: [
                /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "secondary", className: "uppercase", children: field }),
                /* @__PURE__ */ jsx(Typography, { variant: "small", children: String(value) })
              ] }, field);
            }),
            itemActions && itemActions.length > 0 && /* @__PURE__ */ jsx(HStack, { gap: "sm", className: "mt-3 pt-3 border-t border-[var(--color-border)]", children: itemActions.map((action, actionIdx) => {
              const buttonVariant = action.variant || "secondary";
              return /* @__PURE__ */ jsx(
                Button,
                {
                  variant: buttonVariant,
                  size: "sm",
                  onClick: handleActionClick(action),
                  children: action.label
                },
                actionIdx
              );
            }) })
          ]
        },
        id
      );
    });
  };
  return /* @__PURE__ */ jsxs(VStack, { gap: "md", children: [
    /* @__PURE__ */ jsx(
      Box,
      {
        className: cn(
          "grid",
          gapStyles6[gap],
          alignStyles4[alignItems],
          maxCols === 1 && "grid-cols-1",
          maxCols === 2 && "sm:grid-cols-2",
          maxCols === 3 && "sm:grid-cols-2 lg:grid-cols-3",
          maxCols === 4 && "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          maxCols === 5 && "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
          maxCols === 6 && "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
          className
        ),
        style: !maxCols ? { gridTemplateColumns } : void 0,
        children: renderContent()
      }
    ),
    totalCount !== void 0 && pageSize !== void 0 && resolvedTotalPages > 1 && /* @__PURE__ */ jsx(
      Pagination,
      {
        currentPage: resolvedPage,
        totalPages: resolvedTotalPages,
        onPageChange: handlePageChange,
        showTotal,
        totalItems: totalCount
      }
    )
  ] });
};
CardGrid.displayName = "CardGrid";
function MasterDetail({
  entity,
  masterFields = [],
  detailFields: _detailFields,
  // Captured but not used here - detail handled separately
  data: externalData,
  loading: externalLoading,
  isLoading: externalIsLoading,
  error: externalError,
  className,
  ...rest
}) {
  const shouldAutoFetch = !!entity && !externalData;
  const { data: fetchedData, isLoading: fetchLoading, error: fetchError } = useEntityList(
    shouldAutoFetch ? entity : void 0,
    { skip: !shouldAutoFetch }
  );
  const data = externalData ?? fetchedData;
  const loading = externalLoading ?? (shouldAutoFetch ? fetchLoading : false);
  const isLoading = externalIsLoading ?? (shouldAutoFetch ? fetchLoading : false);
  const error = externalError ?? (shouldAutoFetch ? fetchError : null);
  return /* @__PURE__ */ jsx(
    DataTable,
    {
      columns: masterFields,
      data,
      isLoading: loading || isLoading,
      error,
      className,
      emptyTitle: `No ${entity || "items"} found`,
      emptyDescription: `Create your first ${entity?.toLowerCase() || "item"} to get started.`,
      ...rest
    }
  );
}
MasterDetail.displayName = "MasterDetail";
function VStackPattern({
  gap = "md",
  align = "stretch",
  justify = "start",
  className,
  style,
  children
}) {
  return /* @__PURE__ */ jsx(VStack, { gap, align, justify, className, style, children });
}
VStackPattern.displayName = "VStackPattern";
function HStackPattern({
  gap = "md",
  align = "center",
  justify = "start",
  wrap = false,
  className,
  style,
  children
}) {
  return /* @__PURE__ */ jsx(HStack, { gap, align, justify, wrap, className, style, children });
}
HStackPattern.displayName = "HStackPattern";
function BoxPattern({
  p,
  m,
  bg = "transparent",
  border = false,
  radius = "none",
  shadow = "none",
  className,
  style,
  children
}) {
  return /* @__PURE__ */ jsx(
    Box,
    {
      padding: p,
      margin: m,
      bg,
      border,
      rounded: radius,
      shadow,
      className,
      style,
      children
    }
  );
}
BoxPattern.displayName = "BoxPattern";
function GridPattern({
  cols = 1,
  gap = "md",
  rowGap,
  colGap,
  className,
  style,
  children
}) {
  return /* @__PURE__ */ jsx(Grid2, { cols, gap, rowGap, colGap, className, style, children });
}
GridPattern.displayName = "GridPattern";
function CenterPattern({
  minHeight,
  className,
  style,
  children
}) {
  const mergedStyle = minHeight ? { minHeight, ...style } : style;
  return /* @__PURE__ */ jsx(Center, { className, style: mergedStyle, children });
}
CenterPattern.displayName = "CenterPattern";
function SpacerPattern({ size = "flex" }) {
  if (size === "flex") {
    return /* @__PURE__ */ jsx(Spacer, {});
  }
  const sizeMap4 = {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem"
  };
  return /* @__PURE__ */ jsx(Box, { style: { width: sizeMap4[size], height: sizeMap4[size], flexShrink: 0 } });
}
SpacerPattern.displayName = "SpacerPattern";
function DividerPattern({
  orientation = "horizontal",
  variant = "solid",
  spacing = "md"
}) {
  const spacingMap = {
    xs: "my-1",
    sm: "my-2",
    md: "my-4",
    lg: "my-6"
  };
  const verticalSpacingMap = {
    xs: "mx-1",
    sm: "mx-2",
    md: "mx-4",
    lg: "mx-6"
  };
  return /* @__PURE__ */ jsx(
    Divider,
    {
      orientation,
      variant,
      className: orientation === "horizontal" ? spacingMap[spacing] : verticalSpacingMap[spacing]
    }
  );
}
DividerPattern.displayName = "DividerPattern";
function ButtonPattern({
  label,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  icon,
  iconPosition = "left",
  className
}) {
  const { emit } = useEventBus();
  const handleClick = () => {
    if (onClick && !disabled) {
      emit(`UI:${onClick}`, {});
    }
  };
  return /* @__PURE__ */ jsxs(
    Button,
    {
      variant,
      size,
      disabled,
      onClick: handleClick,
      className,
      children: [
        icon && iconPosition === "left" && /* @__PURE__ */ jsx(Icon, { name: icon, size: "sm" }),
        label,
        icon && iconPosition === "right" && /* @__PURE__ */ jsx(Icon, { name: icon, size: "sm" })
      ]
    }
  );
}
ButtonPattern.displayName = "ButtonPattern";
function IconButtonPattern({
  icon,
  variant = "ghost",
  size = "md",
  onClick,
  ariaLabel,
  className
}) {
  const { emit } = useEventBus();
  const handleClick = () => {
    if (onClick) {
      emit(`UI:${onClick}`, {});
    }
  };
  return /* @__PURE__ */ jsx(
    Button,
    {
      variant,
      size,
      onClick: handleClick,
      "aria-label": ariaLabel,
      className,
      children: /* @__PURE__ */ jsx(Icon, { name: icon, size: size === "sm" ? "sm" : "md" })
    }
  );
}
IconButtonPattern.displayName = "IconButtonPattern";
function LinkPattern({
  label,
  href,
  external = false,
  onClick,
  className
}) {
  const { emit } = useEventBus();
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      emit(`UI:${onClick}`, { href });
    }
  };
  return (
    // eslint-disable-next-line almadar/no-raw-dom-elements -- semantic anchor with href
    /* @__PURE__ */ jsx(
      "a",
      {
        href: href ?? "#",
        target: external ? "_blank" : void 0,
        rel: external ? "noopener noreferrer" : void 0,
        onClick: onClick ? handleClick : void 0,
        className,
        children: label
      }
    )
  );
}
LinkPattern.displayName = "LinkPattern";
function TextPattern({
  content,
  variant = "body",
  size = "md",
  weight = "normal",
  color,
  align,
  className
}) {
  return /* @__PURE__ */ jsx(
    Typography,
    {
      variant,
      size,
      weight,
      className,
      style: { color, textAlign: align },
      children: content
    }
  );
}
TextPattern.displayName = "TextPattern";
function HeadingPattern({
  content,
  level = 2,
  size,
  className
}) {
  return /* @__PURE__ */ jsx(Heading, { level, size, className, children: content });
}
HeadingPattern.displayName = "HeadingPattern";
function BadgePattern({
  label,
  variant = "default",
  size = "md",
  className
}) {
  return /* @__PURE__ */ jsx(Badge, { variant, size, className, children: label });
}
BadgePattern.displayName = "BadgePattern";
function AvatarPattern({
  src,
  alt,
  name,
  size = "md",
  className
}) {
  return /* @__PURE__ */ jsx(Avatar, { src, alt: alt ?? name ?? "", name, size, className });
}
AvatarPattern.displayName = "AvatarPattern";
function IconPattern({
  name,
  size = "md",
  color,
  className
}) {
  return /* @__PURE__ */ jsx(Icon, { name, size, className, style: { color } });
}
IconPattern.displayName = "IconPattern";
function ImagePattern({
  src,
  alt,
  width,
  height,
  objectFit = "cover",
  className
}) {
  return (
    // eslint-disable-next-line almadar/no-raw-dom-elements -- semantic img with src/alt
    /* @__PURE__ */ jsx(
      "img",
      {
        src,
        alt,
        width,
        height,
        className,
        style: { objectFit }
      }
    )
  );
}
ImagePattern.displayName = "ImagePattern";
function CardPattern({
  title,
  subtitle,
  padding = "md",
  shadow = "md",
  onClick,
  className,
  children
}) {
  const { emit } = useEventBus();
  const handleClick = onClick ? () => emit(`UI:${onClick}`, {}) : void 0;
  return /* @__PURE__ */ jsx(
    Card,
    {
      title,
      subtitle,
      padding,
      shadow,
      onClick: handleClick,
      className,
      children
    }
  );
}
CardPattern.displayName = "CardPattern";
function ProgressBarPattern({
  value,
  max = 100,
  variant = "primary",
  size = "md",
  showLabel = false,
  className
}) {
  return /* @__PURE__ */ jsx(
    ProgressBar,
    {
      value,
      max,
      variant,
      size,
      showLabel,
      className
    }
  );
}
ProgressBarPattern.displayName = "ProgressBarPattern";
function SpinnerPattern({
  size = "md",
  className
}) {
  return /* @__PURE__ */ jsx(Spinner, { size, className });
}
SpinnerPattern.displayName = "SpinnerPattern";
function InputPattern({
  value = "",
  placeholder,
  inputType = "text",
  disabled = false,
  fieldError,
  onChange,
  onBlur,
  className
}) {
  const { emit } = useEventBus();
  const [localValue, setLocalValue] = React41__default.useState(value);
  const handleChange = (e) => {
    setLocalValue(e.target.value);
    if (onChange) {
      emit(`UI:${onChange}`, { value: e.target.value });
    }
  };
  const handleBlur = () => {
    if (onBlur) {
      emit(`UI:${onBlur}`, { value: localValue });
    }
  };
  return /* @__PURE__ */ jsx(
    Input,
    {
      value: localValue,
      placeholder,
      inputType,
      disabled,
      error: fieldError,
      onChange: handleChange,
      onBlur: handleBlur,
      className
    }
  );
}
InputPattern.displayName = "InputPattern";
function TextareaPattern({
  value = "",
  placeholder,
  rows = 4,
  disabled = false,
  fieldError,
  onChange,
  className
}) {
  const { emit } = useEventBus();
  const [localValue, setLocalValue] = React41__default.useState(value);
  const handleChange = (e) => {
    setLocalValue(e.target.value);
    if (onChange) {
      emit(`UI:${onChange}`, { value: e.target.value });
    }
  };
  return /* @__PURE__ */ jsx(
    Textarea,
    {
      value: localValue,
      placeholder,
      rows,
      disabled,
      error: fieldError,
      onChange: handleChange,
      className
    }
  );
}
TextareaPattern.displayName = "TextareaPattern";
function SelectPattern({
  value = "",
  options,
  placeholder,
  disabled = false,
  fieldError,
  onChange,
  className
}) {
  const { emit } = useEventBus();
  const [localValue, setLocalValue] = React41__default.useState(value);
  const handleChange = (e) => {
    setLocalValue(e.target.value);
    if (onChange) {
      emit(`UI:${onChange}`, { value: e.target.value });
    }
  };
  return /* @__PURE__ */ jsx(
    Select,
    {
      value: localValue,
      options,
      placeholder,
      disabled,
      error: fieldError,
      onChange: handleChange,
      className
    }
  );
}
SelectPattern.displayName = "SelectPattern";
function CheckboxPattern({
  checked = false,
  label,
  disabled = false,
  onChange,
  className
}) {
  const { emit } = useEventBus();
  const [localChecked, setLocalChecked] = React41__default.useState(checked);
  const handleChange = (e) => {
    setLocalChecked(e.target.checked);
    if (onChange) {
      emit(`UI:${onChange}`, { checked: e.target.checked });
    }
  };
  return /* @__PURE__ */ jsx(
    Checkbox,
    {
      checked: localChecked,
      label,
      disabled,
      onChange: handleChange,
      className
    }
  );
}
CheckboxPattern.displayName = "CheckboxPattern";
function RadioPattern({
  value,
  checked = false,
  name,
  label,
  disabled = false,
  onChange,
  className
}) {
  const { emit } = useEventBus();
  const handleChange = () => {
    if (onChange) {
      emit(`UI:${onChange}`, { value });
    }
  };
  return /* @__PURE__ */ jsx(
    Radio,
    {
      value,
      checked,
      name,
      label,
      disabled,
      onChange: handleChange,
      className
    }
  );
}
RadioPattern.displayName = "RadioPattern";
function LabelPattern({
  text,
  htmlFor,
  required = false,
  className
}) {
  return /* @__PURE__ */ jsx(Label, { htmlFor, required, className, children: text });
}
LabelPattern.displayName = "LabelPattern";
function AlertPattern({
  message,
  title,
  variant = "info",
  dismissible = false,
  onDismiss,
  className
}) {
  const { emit } = useEventBus();
  const handleDismiss = () => {
    if (onDismiss) {
      emit(`UI:${onDismiss}`, {});
    }
  };
  return /* @__PURE__ */ jsx(
    Alert,
    {
      message,
      title,
      variant,
      dismissible,
      onDismiss: dismissible ? handleDismiss : void 0,
      className
    }
  );
}
AlertPattern.displayName = "AlertPattern";
function TooltipPattern({
  content,
  position = "top",
  className,
  children
}) {
  return /* @__PURE__ */ jsx(Tooltip, { content, position, className, children });
}
TooltipPattern.displayName = "TooltipPattern";
function PopoverPattern({
  content,
  position = "bottom",
  trigger = "click",
  className,
  children
}) {
  return /* @__PURE__ */ jsx(Popover, { content, position, trigger, className, children });
}
PopoverPattern.displayName = "PopoverPattern";
function MenuPattern({
  items,
  trigger,
  position = "bottom-start",
  className
}) {
  const { emit } = useEventBus();
  const menuItems = items.map((item) => ({
    ...item,
    onClick: () => emit(`UI:${item.event}`, {})
  }));
  return /* @__PURE__ */ jsx(Menu2, { items: menuItems, trigger, position, className });
}
MenuPattern.displayName = "MenuPattern";
function AccordionPattern({
  items,
  multiple = false,
  defaultOpen = [],
  className
}) {
  return /* @__PURE__ */ jsx(
    Accordion,
    {
      items,
      multiple,
      defaultOpen,
      className
    }
  );
}
AccordionPattern.displayName = "AccordionPattern";
function ContainerPattern({
  maxWidth = "lg",
  padding = "md",
  className,
  children
}) {
  return /* @__PURE__ */ jsx(Container, { maxWidth, padding, className, children });
}
ContainerPattern.displayName = "ContainerPattern";
function SimpleGridPattern({
  minChildWidth = "250px",
  gap = "md",
  className,
  children
}) {
  return /* @__PURE__ */ jsx(SimpleGrid, { minChildWidth, gap, className, children });
}
SimpleGridPattern.displayName = "SimpleGridPattern";
function FloatButtonPattern({
  icon,
  onClick,
  position = "bottom-right",
  variant = "primary",
  className
}) {
  const { emit } = useEventBus();
  const handleClick = () => {
    if (onClick) {
      emit(`UI:${onClick}`, {});
    }
  };
  return /* @__PURE__ */ jsx(
    FloatingActionButton,
    {
      icon,
      onClick: handleClick,
      position,
      variant,
      className
    }
  );
}
FloatButtonPattern.displayName = "FloatButtonPattern";
var ALLOWED_CUSTOM_COMPONENTS = [
  "div",
  "span",
  "button",
  "a",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "footer",
  "section",
  "article",
  "nav",
  "main",
  "aside",
  "ul",
  "ol",
  "li",
  "img",
  "label",
  "input",
  "form"
];
function isAllowedComponent(component) {
  return ALLOWED_CUSTOM_COMPONENTS.includes(
    component
  );
}
var INTERACTIVE_ELEMENTS = /* @__PURE__ */ new Set(["button", "a"]);
function isInteractiveElement(component) {
  return INTERACTIVE_ELEMENTS.has(component);
}
var HEADING_VARIANT_MAP = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6"
};
function CustomPattern({
  component,
  className,
  content,
  action,
  payload,
  children,
  src,
  alt,
  href,
  external,
  disabled,
  htmlProps
}) {
  const { emit } = useEventBus();
  const classes = cn(className);
  if (!isAllowedComponent(component)) {
    console.warn(
      `CustomPattern: Unknown component "${component}", falling back to Box`
    );
    return /* @__PURE__ */ jsxs(
      Box,
      {
        className: cn(
          classes,
          "p-4 border border-dashed border-[var(--color-error)]/50 text-[var(--color-error)]"
        ),
        children: [
          "Unknown component: ",
          component
        ]
      }
    );
  }
  const handleClick = (e) => {
    if (disabled) return;
    if (component === "a" && href && !action) {
      return;
    }
    if (action) {
      e.preventDefault();
      emit(`UI:${action}`, payload ?? {});
    }
  };
  const renderContent = children ?? content;
  const commonProps = {
    className: classes || void 0,
    ...htmlProps
  };
  if (action || isInteractiveElement(component)) {
    commonProps.onClick = handleClick;
  }
  if (disabled) {
    commonProps["aria-disabled"] = true;
    if (component === "button") {
      commonProps.disabled = true;
    }
  }
  switch (component) {
    case "button":
      return /* @__PURE__ */ jsx(
        Button,
        {
          variant: "secondary",
          className: classes,
          disabled,
          onClick: handleClick,
          ...htmlProps,
          children: renderContent
        }
      );
    case "a":
      return (
        // eslint-disable-next-line almadar/no-raw-dom-elements -- semantic anchor with href
        /* @__PURE__ */ jsx(
          "a",
          {
            href: href ?? "#",
            target: external ? "_blank" : void 0,
            rel: external ? "noopener noreferrer" : void 0,
            ...commonProps,
            children: renderContent
          }
        )
      );
    case "img":
      return (
        // eslint-disable-next-line almadar/no-raw-dom-elements -- semantic img with src/alt
        /* @__PURE__ */ jsx(
          "img",
          {
            src,
            alt: alt ?? "",
            ...commonProps
          }
        )
      );
    case "input":
      return /* @__PURE__ */ jsx(
        Input,
        {
          className: classes,
          disabled,
          ...htmlProps
        }
      );
    case "label":
      return /* @__PURE__ */ jsx(
        Typography,
        {
          as: "label",
          className: classes,
          ...htmlProps,
          children: renderContent
        }
      );
    case "form":
      return /* @__PURE__ */ jsx(
        Box,
        {
          as: "form",
          onSubmit: (e) => {
            e.preventDefault();
            if (action) {
              emit(`UI:${action}`, payload ?? {});
            }
          },
          ...commonProps,
          children: renderContent
        }
      );
    // Heading elements — use Typography with appropriate variant
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return /* @__PURE__ */ jsx(
        Typography,
        {
          variant: HEADING_VARIANT_MAP[component],
          className: classes,
          ...htmlProps,
          children: renderContent
        }
      );
    // List elements — use Box with semantic `as`
    case "ul":
      return /* @__PURE__ */ jsx(Box, { as: "ul", ...commonProps, children: renderContent });
    case "ol":
      return /* @__PURE__ */ jsx(Box, { as: "ol", ...commonProps, children: renderContent });
    case "li":
      return /* @__PURE__ */ jsx(Box, { as: "li", ...commonProps, children: renderContent });
    // Semantic elements — use Box with semantic `as`
    case "header":
      return /* @__PURE__ */ jsx(Box, { as: "header", ...commonProps, children: renderContent });
    case "footer":
      return /* @__PURE__ */ jsx(Box, { as: "footer", ...commonProps, children: renderContent });
    case "section":
      return /* @__PURE__ */ jsx(Box, { as: "section", ...commonProps, children: renderContent });
    case "article":
      return /* @__PURE__ */ jsx(Box, { as: "article", ...commonProps, children: renderContent });
    case "nav":
      return /* @__PURE__ */ jsx(Box, { as: "nav", ...commonProps, children: renderContent });
    case "main":
      return /* @__PURE__ */ jsx(Box, { as: "main", ...commonProps, children: renderContent });
    case "aside":
      return /* @__PURE__ */ jsx(Box, { as: "aside", ...commonProps, children: renderContent });
    // Text elements
    case "span":
      return /* @__PURE__ */ jsx(Typography, { variant: "body", as: "span", className: classes, ...htmlProps, children: renderContent });
    case "p":
      return /* @__PURE__ */ jsx(Typography, { variant: "body", className: classes, ...htmlProps, children: renderContent });
    // Default — use Box
    case "div":
    default:
      return /* @__PURE__ */ jsx(Box, { ...commonProps, children: renderContent });
  }
}
CustomPattern.displayName = "CustomPattern";
var SuspenseConfigContext = createContext({ enabled: false });
function SuspenseConfigProvider({
  config,
  children
}) {
  return React41__default.createElement(
    SuspenseConfigContext.Provider,
    { value: config },
    children
  );
}
SuspenseConfigProvider.displayName = "SuspenseConfigProvider";
var SLOT_SKELETON_MAP = {
  main: "table",
  sidebar: "card",
  modal: "form",
  drawer: "form"
};
function getSlotFallback(slot, config) {
  if (config.slotFallbacks?.[slot]) return config.slotFallbacks[slot];
  const variant = SLOT_SKELETON_MAP[slot] ?? "text";
  return /* @__PURE__ */ jsx(Skeleton, { variant });
}
var COMPONENT_REGISTRY = {
  // Display patterns
  PageHeader,
  DataTable,
  CardGrid,
  DetailPanel,
  MasterDetail,
  List: DataTable,
  // List uses DataTable component
  StatCard,
  // Form patterns
  Form,
  ButtonGroup,
  SearchInput,
  // State patterns
  EmptyState,
  LoadingState,
  Breadcrumb,
  // Layout patterns
  VStackPattern,
  HStackPattern,
  BoxPattern,
  GridPattern,
  CenterPattern,
  SpacerPattern,
  DividerPattern,
  // Component patterns - Interactive
  ButtonPattern,
  IconButtonPattern,
  LinkPattern,
  // Component patterns - Display
  TextPattern,
  HeadingPattern,
  BadgePattern,
  AvatarPattern,
  IconPattern,
  ImagePattern,
  CardPattern,
  ProgressBarPattern,
  SpinnerPattern,
  // Component patterns - Form inputs
  InputPattern,
  TextareaPattern,
  SelectPattern,
  CheckboxPattern,
  RadioPattern,
  LabelPattern,
  // Component patterns - Feedback
  AlertPattern,
  TooltipPattern,
  PopoverPattern,
  // Component patterns - Navigation
  MenuPattern,
  AccordionPattern,
  // Component patterns - Layout
  ContainerPattern,
  SimpleGridPattern,
  FloatButtonPattern,
  // Custom pattern
  CustomPattern
};
var PATTERN_TO_COMPONENT = {
  "page-header": "PageHeader",
  "entity-table": "DataTable",
  "entity-cards": "CardGrid",
  "entity-detail": "DetailPanel",
  "detail-panel": "DetailPanel",
  "entity-list": "List",
  "master-detail": "MasterDetail",
  "search-bar": "SearchInput",
  "empty-state": "EmptyState",
  "loading-state": "LoadingState",
  breadcrumb: "Breadcrumb",
  stats: "StatCard",
  "form-section": "Form",
  form: "Form",
  "form-actions": "ButtonGroup",
  "filter-group": "ButtonGroup",
  "button-group": "ButtonGroup",
  // Layout patterns
  vstack: "VStackPattern",
  hstack: "HStackPattern",
  box: "BoxPattern",
  grid: "GridPattern",
  center: "CenterPattern",
  spacer: "SpacerPattern",
  divider: "DividerPattern",
  // Component patterns - Interactive
  button: "ButtonPattern",
  "icon-button": "IconButtonPattern",
  link: "LinkPattern",
  // Component patterns - Display
  text: "TextPattern",
  heading: "HeadingPattern",
  badge: "BadgePattern",
  avatar: "AvatarPattern",
  icon: "IconPattern",
  image: "ImagePattern",
  card: "CardPattern",
  "progress-bar": "ProgressBarPattern",
  spinner: "SpinnerPattern",
  // Component patterns - Form inputs
  input: "InputPattern",
  textarea: "TextareaPattern",
  select: "SelectPattern",
  checkbox: "CheckboxPattern",
  radio: "RadioPattern",
  label: "LabelPattern",
  // Component patterns - Feedback
  alert: "AlertPattern",
  tooltip: "TooltipPattern",
  popover: "PopoverPattern",
  // Component patterns - Navigation
  menu: "MenuPattern",
  accordion: "AccordionPattern",
  // Component patterns - Layout
  container: "ContainerPattern",
  "simple-grid": "SimpleGridPattern",
  "float-button": "FloatButtonPattern",
  // Custom pattern
  custom: "CustomPattern"
};
function getComponentForPattern(patternType) {
  const componentName = PATTERN_TO_COMPONENT[patternType];
  if (!componentName) {
    return null;
  }
  return COMPONENT_REGISTRY[componentName] ?? null;
}
var PATTERNS_WITH_CHILDREN = /* @__PURE__ */ new Set([
  "vstack",
  "hstack",
  "box",
  "grid",
  "center",
  "card",
  "tooltip",
  "popover",
  "container",
  "simple-grid",
  "custom"
  // Custom patterns support nested children
]);
function UISlotComponent({
  slot,
  portal = false,
  position,
  className
}) {
  const { slots, clear } = useUISlots();
  const suspenseConfig = useContext(SuspenseConfigContext);
  const content = slots[slot];
  if (!content) {
    if (!portal) {
      return /* @__PURE__ */ jsx(
        Box,
        {
          id: `slot-${slot}`,
          className: cn("ui-slot", `ui-slot-${slot}`, className)
        }
      );
    }
    return null;
  }
  const handleDismiss = () => {
    clear(slot);
  };
  if (portal) {
    return /* @__PURE__ */ jsx(
      SlotPortal,
      {
        slot,
        content,
        position,
        onDismiss: handleDismiss
      }
    );
  }
  const slotContent = /* @__PURE__ */ jsx(SlotContentRenderer, { content, onDismiss: handleDismiss });
  const wrappedContent = suspenseConfig.enabled ? /* @__PURE__ */ jsx(ErrorBoundary, { children: /* @__PURE__ */ jsx(Suspense, { fallback: getSlotFallback(slot, suspenseConfig), children: slotContent }) }) : slotContent;
  return /* @__PURE__ */ jsx(
    Box,
    {
      id: `slot-${slot}`,
      className: cn("ui-slot", `ui-slot-${slot}`, className),
      "data-pattern": content.pattern,
      "data-source-trait": content.sourceTrait,
      children: wrappedContent
    }
  );
}
function SlotPortal({
  slot,
  content,
  position,
  onDismiss
}) {
  const [portalRoot, setPortalRoot] = useState(null);
  useEffect(() => {
    let root = document.getElementById("ui-slot-portal-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "ui-slot-portal-root";
      document.body.appendChild(root);
    }
    setPortalRoot(root);
  }, []);
  if (!portalRoot) return null;
  let wrapper;
  switch (slot) {
    case "modal":
      wrapper = /* @__PURE__ */ jsx(
        Modal,
        {
          isOpen: true,
          onClose: onDismiss,
          title: content.props.title,
          size: content.props.size,
          children: /* @__PURE__ */ jsx(SlotContentRenderer, { content, onDismiss })
        }
      );
      break;
    case "drawer":
      wrapper = /* @__PURE__ */ jsx(
        Drawer,
        {
          isOpen: true,
          onClose: onDismiss,
          title: content.props.title,
          position: content.props.position ?? "right",
          width: content.props.width,
          children: /* @__PURE__ */ jsx(SlotContentRenderer, { content, onDismiss })
        }
      );
      break;
    case "toast":
      wrapper = /* @__PURE__ */ jsx(Box, { className: cn("fixed z-50", getToastPosition(position)), children: /* @__PURE__ */ jsx(
        Toast,
        {
          variant: content.props.variant ?? "info",
          title: content.props.title,
          message: content.props.message ?? "",
          onDismiss
        }
      ) });
      break;
    case "overlay":
      wrapper = /* @__PURE__ */ jsx(
        Box,
        {
          className: "fixed inset-0 z-50 bg-[var(--color-foreground)]/50 flex items-center justify-center",
          onClick: onDismiss,
          children: /* @__PURE__ */ jsx(Box, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(SlotContentRenderer, { content, onDismiss }) })
        }
      );
      break;
    case "center":
      wrapper = /* @__PURE__ */ jsx(Box, { className: "fixed inset-0 z-50 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsx(Box, { className: "pointer-events-auto", children: /* @__PURE__ */ jsx(SlotContentRenderer, { content, onDismiss }) }) });
      break;
    default:
      wrapper = /* @__PURE__ */ jsx(SlotContentRenderer, { content, onDismiss });
  }
  return createPortal(wrapper, portalRoot);
}
function getToastPosition(position) {
  switch (position) {
    case "top-left":
      return "top-4 left-4";
    case "top-right":
      return "top-4 right-4";
    case "bottom-left":
      return "bottom-4 left-4";
    case "bottom-right":
      return "bottom-4 right-4";
    default:
      return "top-4 right-4";
  }
}
function renderPatternChildren(children, onDismiss) {
  if (!children || !Array.isArray(children) || children.length === 0) {
    return null;
  }
  return children.map((child, index) => {
    if (!child || typeof child !== "object") return null;
    const childContent = {
      id: `child-${index}`,
      pattern: child.type,
      props: child.props ?? {},
      priority: 0
    };
    return /* @__PURE__ */ jsx(
      SlotContentRenderer,
      {
        content: childContent,
        onDismiss
      },
      `child-${index}-${child.type}`
    );
  });
}
function SlotContentRenderer({
  content,
  onDismiss
}) {
  const PatternComponent = getComponentForPattern(content.pattern);
  if (PatternComponent) {
    const supportsChildren = PATTERNS_WITH_CHILDREN.has(content.pattern);
    const childrenConfig = content.props.children;
    const renderedChildren = supportsChildren ? renderPatternChildren(childrenConfig, onDismiss) : void 0;
    const { children: _childrenConfig, ...restProps } = content.props;
    return /* @__PURE__ */ jsx(
      Box,
      {
        className: "slot-content",
        "data-pattern": content.pattern,
        "data-id": content.id,
        children: /* @__PURE__ */ jsx(PatternComponent, { ...restProps, onDismiss, children: renderedChildren })
      }
    );
  }
  return /* @__PURE__ */ jsx(
    Box,
    {
      className: "slot-content",
      "data-pattern": content.pattern,
      "data-id": content.id,
      children: content.props.children ?? /* @__PURE__ */ jsxs(Box, { className: "p-4 text-sm text-[var(--color-muted-foreground)] border border-dashed border-[var(--color-border)] rounded", children: [
        "Unknown pattern: ",
        content.pattern,
        content.sourceTrait && /* @__PURE__ */ jsxs(Typography, { variant: "small", className: "ml-2", children: [
          "(from ",
          content.sourceTrait,
          ")"
        ] })
      ] })
    }
  );
}
function UISlotRenderer({
  includeHud = false,
  includeFloating = false,
  className,
  suspense
}) {
  const suspenseConfig = suspense === true ? { enabled: true } : suspense && typeof suspense === "object" ? suspense : { enabled: false };
  const content = /* @__PURE__ */ jsxs(Box, { className: cn("ui-slot-renderer", className), children: [
    /* @__PURE__ */ jsx(UISlotComponent, { slot: "sidebar", className: "ui-slot-sidebar" }),
    /* @__PURE__ */ jsx(UISlotComponent, { slot: "main", className: "ui-slot-main flex-1" }),
    /* @__PURE__ */ jsx(UISlotComponent, { slot: "modal", portal: true }),
    /* @__PURE__ */ jsx(UISlotComponent, { slot: "drawer", portal: true }),
    /* @__PURE__ */ jsx(UISlotComponent, { slot: "overlay", portal: true }),
    /* @__PURE__ */ jsx(UISlotComponent, { slot: "center", portal: true }),
    /* @__PURE__ */ jsx(UISlotComponent, { slot: "toast", portal: true, position: "top-right" }),
    includeHud && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        UISlotComponent,
        {
          slot: "hud-top",
          className: "fixed top-0 inset-x-0 z-40"
        }
      ),
      /* @__PURE__ */ jsx(
        UISlotComponent,
        {
          slot: "hud-bottom",
          className: "fixed bottom-0 inset-x-0 z-40"
        }
      )
    ] }),
    includeFloating && /* @__PURE__ */ jsx(UISlotComponent, { slot: "floating", className: "fixed z-50", draggable: true })
  ] });
  if (suspenseConfig.enabled) {
    return /* @__PURE__ */ jsx(SuspenseConfigProvider, { config: suspenseConfig, children: content });
  }
  return content;
}
UISlotRenderer.displayName = "UISlotRenderer";

export { Accordion, Alert, Avatar, Badge, Box, Breadcrumb, Button, ButtonGroup, Card, Card2, CardBody, CardContent, CardFooter, CardGrid, CardHeader, CardTitle, Center, Checkbox, CodeBlock, ConditionalWrapper, Container, ControlButton, DataTable, DetailPanel, Divider, Drawer, EmptyState, EntityDisplayEvents, ErrorBoundary, ErrorState, FilterGroup, Flex, FloatingActionButton, Form, FormField, FormSectionHeader, Grid2 as Grid, HStack, Heading, HealthBar, Icon, Input, InputGroup, Label, LawReferenceTooltip, LoadingState, MarkdownContent, MasterDetail, Menu2 as Menu, Modal, Overlay, PageHeader, Pagination, Popover, ProgressBar, QuizBlock, Radio, RelationSelect, RepeatableFormSection, ScaledDiagram, ScoreDisplay, SearchInput, Select, SidePanel, SimpleGrid, Skeleton, SlotContentRenderer, Spacer, Spinner, Sprite, Stack, StatCard, StateIndicator, SuspenseConfigProvider, Switch, Tabs, Text, TextHighlight, Textarea, ThemeSelector, ThemeToggle, Toast, Tooltip, Typography, UISlotComponent, UISlotRenderer, VStack, ViolationAlert, WizardNavigation, WizardProgress, drawSprite };
