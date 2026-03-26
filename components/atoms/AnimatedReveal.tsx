'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '../../lib/cn';

export type RevealTrigger = 'scroll' | 'hover' | 'manual';
export type RevealAnimation =
  | 'fade-up'
  | 'fade-down'
  | 'fade-in'
  | 'fade-left'
  | 'fade-right'
  | 'scale'
  | 'scale-up'
  | 'none';

export interface AnimatedRevealProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** What triggers the animation */
  trigger?: RevealTrigger;
  /** Built-in animation preset */
  animation?: RevealAnimation;
  /** Animation duration in ms (default: 600) */
  duration?: number;
  /** Delay before animation starts in ms (default: 0) */
  delay?: number;
  /** How much of the element must be visible before triggering, 0-1 (default: 0.15) */
  threshold?: number;
  /** Animate only the first time the element enters the viewport (default: true) */
  once?: boolean;
  /** Manual control: when trigger='manual', set this to true to animate */
  animate?: boolean;
  /** Easing function (default: cubic-bezier(0.16, 1, 0.3, 1)) */
  easing?: string;
  /** Children: ReactNode or render function receiving animated state */
  children: React.ReactNode | ((animated: boolean) => React.ReactNode);
}

const initialStyles: Record<RevealAnimation, React.CSSProperties> = {
  'fade-up': { opacity: 0, transform: 'translateY(24px)' },
  'fade-down': { opacity: 0, transform: 'translateY(-24px)' },
  'fade-in': { opacity: 0 },
  'fade-left': { opacity: 0, transform: 'translateX(24px)' },
  'fade-right': { opacity: 0, transform: 'translateX(-24px)' },
  'scale': { opacity: 0, transform: 'scale(0.92)' },
  'scale-up': { opacity: 0, transform: 'scale(0.92) translateY(16px)' },
  'none': {},
};

const animatedStyles: Record<RevealAnimation, React.CSSProperties> = {
  'fade-up': { opacity: 1, transform: 'translateY(0)' },
  'fade-down': { opacity: 1, transform: 'translateY(0)' },
  'fade-in': { opacity: 1 },
  'fade-left': { opacity: 1, transform: 'translateX(0)' },
  'fade-right': { opacity: 1, transform: 'translateX(0)' },
  'scale': { opacity: 1, transform: 'scale(1)' },
  'scale-up': { opacity: 1, transform: 'scale(1) translateY(0)' },
  'none': {},
};

export const AnimatedReveal = React.forwardRef<HTMLDivElement, AnimatedRevealProps>(
  (
    {
      trigger = 'scroll',
      animation = 'fade-up',
      duration = 600,
      delay = 0,
      threshold = 0.15,
      once = true,
      animate: manualAnimate,
      easing = 'cubic-bezier(0.16, 1, 0.3, 1)',
      children,
      className,
      style,
      ...props
    },
    forwardedRef,
  ) => {
    const [isAnimated, setIsAnimated] = useState(false);
    const internalRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    // Merge forwarded ref with internal ref
    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [forwardedRef],
    );

    // Scroll trigger via IntersectionObserver
    useEffect(() => {
      if (trigger !== 'scroll') return;
      const el = internalRef.current;
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (once && hasAnimated.current) return;
            hasAnimated.current = true;
            setIsAnimated(true);
          } else if (!once) {
            setIsAnimated(false);
          }
        },
        { threshold },
      );

      observer.observe(el);
      return () => observer.disconnect();
    }, [trigger, threshold, once]);

    // Hover trigger
    const handleMouseEnter = trigger === 'hover' ? () => setIsAnimated(true) : undefined;
    const handleMouseLeave = trigger === 'hover' ? () => { if (!once || !hasAnimated.current) { hasAnimated.current = true; setIsAnimated(false); } } : undefined;

    // Manual trigger
    useEffect(() => {
      if (trigger === 'manual' && manualAnimate !== undefined) {
        setIsAnimated(manualAnimate);
      }
    }, [trigger, manualAnimate]);

    const active = isAnimated;
    const currentStyle = active ? animatedStyles[animation] : initialStyles[animation];

    return (
      <div
        ref={setRef}
        className={cn('will-change-[opacity,transform]', className)}
        style={{
          ...currentStyle,
          transitionProperty: 'opacity, transform',
          transitionDuration: `${duration}ms`,
          transitionDelay: `${delay}ms`,
          transitionTimingFunction: easing,
          ...style,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {typeof children === 'function' ? children(active) : children}
      </div>
    );
  },
);

AnimatedReveal.displayName = 'AnimatedReveal';
