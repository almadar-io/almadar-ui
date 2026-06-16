'use client';
/**
 * Tooltip Molecule Component
 * 
 * A tooltip component with position variants and delay options.
 * Uses theme-aware CSS variables for styling.
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Typography } from '../atoms/Typography';
import { cn } from '../../../lib/cn';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Tooltip trigger element (ReactElement or ReactNode that will be wrapped in span) */
  children: React.ReactNode;
  /** Tooltip position */
  position?: TooltipPosition;
  /** Show delay in milliseconds */
  delay?: number;
  /** Hide delay in milliseconds */
  hideDelay?: number;
  /** Show arrow */
  showArrow?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const TRIGGER_GAP = 8;

// Arrow colors use CSS variables
const arrowClasses: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-primary border-l-transparent border-r-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-primary border-l-transparent border-r-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-primary border-t-transparent border-b-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-primary border-t-transparent border-b-transparent border-l-transparent',
};

// Resolve the portaled `fixed` tooltip to absolute viewport pixel coordinates.
// The gap and centering are baked into `left`/`top`/`transform` here so the
// panel needs no positioning utility classes — those resolve against the
// viewport on a `fixed` element and yank the tooltip off its trigger.
function computeTooltipStyle(
  position: TooltipPosition,
  triggerRect: DOMRect,
): React.CSSProperties {
  switch (position) {
    case 'bottom':
      return {
        left: triggerRect.left + triggerRect.width / 2,
        top: triggerRect.bottom + TRIGGER_GAP,
        transform: 'translateX(-50%)',
      };
    case 'left':
      return {
        left: triggerRect.left - TRIGGER_GAP,
        top: triggerRect.top + triggerRect.height / 2,
        transform: 'translate(-100%, -50%)',
      };
    case 'right':
      return {
        left: triggerRect.right + TRIGGER_GAP,
        top: triggerRect.top + triggerRect.height / 2,
        transform: 'translateY(-50%)',
      };
    case 'top':
    default:
      return {
        left: triggerRect.left + triggerRect.width / 2,
        top: triggerRect.top - TRIGGER_GAP,
        transform: 'translate(-50%, -100%)',
      };
  }
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  hideDelay = 0,
  showArrow = true,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Wrap non-element children in a span
  const triggerElement = React.isValidElement(children) ? children : <span>{children}</span>;

  const trigger = React.cloneElement(triggerElement as React.ReactElement<any>, {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleMouseEnter,
    onBlur: handleMouseLeave,
  });

  const tooltipContent = isVisible && triggerRect ? (
    <div
      ref={tooltipRef}
      className={cn(
        'fixed z-50 px-3 py-2 max-w-xs',
        'bg-primary text-primary-foreground',
        'shadow-elevation-popover rounded-sm',
        'text-sm pointer-events-none',
        'break-words whitespace-normal',
        'h-auto min-h-fit',
        className
      )}
      style={computeTooltipStyle(position, triggerRect)}
      role="tooltip"
    >
      <div className="w-full break-words whitespace-normal h-auto">
        {typeof content === 'string' ? (
          <Typography variant="small" className="text-primary-foreground break-words whitespace-normal">
            {content}
          </Typography>
        ) : (
          <div className="break-words whitespace-normal">
            {content}
          </div>
        )}
      </div>
      {showArrow && (
        <div
          className={cn(
            'absolute w-0 h-0 border-4',
            arrowClasses[position]
          )}
        />
      )}
    </div>
  ) : null;

  return (
    <>
      {trigger}
      {typeof window !== 'undefined' && tooltipContent
        ? createPortal(tooltipContent, document.body)
        : tooltipContent}
    </>
  );
};

Tooltip.displayName = 'Tooltip';
