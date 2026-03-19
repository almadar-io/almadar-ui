'use client';
/**
 * Carousel Molecule Component
 *
 * Horizontal scrolling container with snap points, swipe gestures,
 * prev/next arrow buttons, and dot indicators.
 * Pure UI molecule with no entity binding.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useEventBus } from '../../hooks/useEventBus';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import { Box } from '../atoms/Box';
import { HStack } from '../atoms/Stack';
import { Button } from '../atoms/Button';

/**
 * Safe event bus hook that works outside EventBusProvider context.
 * Returns a no-op emit function if not in EventBusProvider context.
 */
function useSafeEventBus() {
  try {
    return useEventBus();
  } catch {
    return { emit: () => {}, on: () => () => {}, once: () => {} };
  }
}

export interface CarouselProps<T = Record<string, unknown>> {
  /** Array of items to display as slides */
  items: T[];
  /** Render function for each slide */
  renderItem?: (item: T, index: number) => React.ReactNode;
  /** Children-as-function fallback for renderItem (compiler compatibility) */
  children?: (item: T, index: number) => React.ReactNode;
  /** Enable auto-play rotation */
  autoPlay?: boolean;
  /** Auto-play interval in milliseconds (default: 5000) */
  autoPlayInterval?: number;
  /** Show dot indicators */
  showDots?: boolean;
  /** Show prev/next arrow buttons */
  showArrows?: boolean;
  /** Enable infinite loop */
  loop?: boolean;
  /** Declarative event name for slide change */
  slideChangeEvent?: string;
  /** Payload to include with the slide change event */
  slideChangePayload?: Record<string, unknown>;
  /** Additional CSS classes */
  className?: string;
}

export const Carousel = <T = Record<string, unknown>,>({
  items,
  renderItem,
  children,
  autoPlay = false,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  loop = false,
  slideChangeEvent,
  slideChangePayload,
  className,
}: CarouselProps<T>): React.ReactElement | null => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eventBus = useSafeEventBus();

  const totalSlides = items.length;

  const emitSlideChange = useCallback(
    (newIndex: number) => {
      if (slideChangeEvent) {
        eventBus.emit(`UI:${slideChangeEvent}`, {
          index: newIndex,
          ...slideChangePayload,
        });
      }
    },
    [slideChangeEvent, slideChangePayload, eventBus],
  );

  const scrollToSlide = useCallback(
    (index: number) => {
      const container = scrollRef.current;
      if (!container) return;
      const slideWidth = container.offsetWidth;
      container.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth',
      });
    },
    [],
  );

  const goToSlide = useCallback(
    (index: number) => {
      let targetIndex = index;

      if (loop) {
        if (targetIndex < 0) targetIndex = totalSlides - 1;
        if (targetIndex >= totalSlides) targetIndex = 0;
      } else {
        targetIndex = Math.max(0, Math.min(totalSlides - 1, targetIndex));
      }

      setActiveIndex(targetIndex);
      scrollToSlide(targetIndex);
      emitSlideChange(targetIndex);
    },
    [loop, totalSlides, scrollToSlide, emitSlideChange],
  );

  const goNext = useCallback(() => {
    goToSlide(activeIndex + 1);
  }, [goToSlide, activeIndex]);

  const goPrev = useCallback(() => {
    goToSlide(activeIndex - 1);
  }, [goToSlide, activeIndex]);

  // Swipe gesture handlers
  const swipeHandlers = useSwipeGesture(
    {
      onSwipeLeft: goNext,
      onSwipeRight: goPrev,
    },
    { threshold: 40 },
  );

  // Auto-play
  useEffect(() => {
    if (!autoPlay || totalSlides <= 1) return;

    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = loop ? (prev + 1) % totalSlides : Math.min(prev + 1, totalSlides - 1);
        // Scroll and emit outside the state updater via setTimeout to avoid stale closure
        setTimeout(() => {
          scrollToSlide(next);
          emitSlideChange(next);
        }, 0);
        return next;
      });
    }, autoPlayInterval);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, [autoPlay, autoPlayInterval, loop, totalSlides, scrollToSlide, emitSlideChange]);

  // Sync activeIndex when the scroll container is scrolled manually (e.g. native snap)
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const slideWidth = container.offsetWidth;
    if (slideWidth === 0) return;
    const newIndex = Math.round(container.scrollLeft / slideWidth);
    setActiveIndex((prev) => {
      if (prev !== newIndex && newIndex >= 0 && newIndex < totalSlides) {
        return newIndex;
      }
      return prev;
    });
  }, [totalSlides]);

  const hasPrev = loop || activeIndex > 0;
  const hasNext = loop || activeIndex < totalSlides - 1;

  if (totalSlides === 0) return null;

  return (
    <Box position="relative" overflow="hidden" className={cn('w-full', className)}>
      {/* Slide track */}
      <Box
        ref={scrollRef}
        display="flex"
        overflow="auto"
        className={cn(
          'w-full',
          'scroll-smooth',
          'scrollbar-none',
          '[scroll-snap-type:x_mandatory]',
          '[&::-webkit-scrollbar]:hidden',
          '[-ms-overflow-style:none]',
        )}
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
        onScroll={handleScroll}
        onPointerDown={swipeHandlers.onPointerDown}
        onPointerMove={swipeHandlers.onPointerMove}
        onPointerUp={swipeHandlers.onPointerUp}
        onPointerCancel={swipeHandlers.onPointerCancel}
      >
        {items.map((item, index) => (
          <Box
            key={index}
            className={cn(
              'flex-shrink-0 w-full',
              '[scroll-snap-align:start]',
            )}
            style={{
              scrollSnapAlign: 'start',
            }}
          >
            {(renderItem ?? children)?.(item, index)}
          </Box>
        ))}
      </Box>

      {/* Previous arrow */}
      {showArrows && hasPrev && totalSlides > 1 && (
        <Box
          position="absolute"
          className="left-2 top-1/2 -translate-y-1/2 z-10"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={goPrev}
            aria-label="Previous slide"
            className={cn(
              'rounded-full',
              'bg-[var(--color-surface)]/80',
              'backdrop-blur-sm',
              'shadow-[var(--shadow-sm)]',
              'hover:bg-[var(--color-surface)]',
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Box>
      )}

      {/* Next arrow */}
      {showArrows && hasNext && totalSlides > 1 && (
        <Box
          position="absolute"
          className="right-2 top-1/2 -translate-y-1/2 z-10"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={goNext}
            aria-label="Next slide"
            className={cn(
              'rounded-full',
              'bg-[var(--color-surface)]/80',
              'backdrop-blur-sm',
              'shadow-[var(--shadow-sm)]',
              'hover:bg-[var(--color-surface)]',
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </Box>
      )}

      {/* Dot indicators */}
      {showDots && totalSlides > 1 && (
        <Box
          position="absolute"
          className="bottom-3 left-0 right-0 z-10"
        >
          <HStack gap="xs" align="center" justify="center">
            {items.map((_, index) => {
              const isActive = index === activeIndex;
              return (
                <Box
                  key={index}
                  className={cn(
                    'rounded-full cursor-pointer transition-all duration-200',
                  )}
                  style={{
                    width: isActive ? 10 : 8,
                    height: isActive ? 10 : 8,
                    backgroundColor: isActive
                      ? 'var(--color-primary)'
                      : 'var(--color-muted, #d4d4d8)',
                    opacity: isActive ? 1 : 0.6,
                  }}
                  onClick={() => goToSlide(index)}
                  role="button"
                  aria-label={`Go to slide ${index + 1}`}
                />
              );
            })}
          </HStack>
        </Box>
      )}
    </Box>
  );
};

(Carousel as React.FC).displayName = 'Carousel';
