'use client';

import React, { useCallback, useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";

function useSafeEventBus() {
  try {
    return useEventBus();
  } catch {
    return { emit: () => {}, on: () => () => {}, once: () => {} };
  }
}

export interface LightboxImage {
  src: string;
  alt?: string;
  caption?: string;
}

export interface LightboxProps {
  /** Array of images to display */
  images: LightboxImage[];
  /** Current image index */
  currentIndex?: number;
  /** Whether the lightbox is open */
  isOpen?: boolean;
  /** Show image counter (e.g., "3 of 12") */
  showCounter?: boolean;
  /** Declarative close event name */
  closeAction?: string;
  /** Direct onClose callback */
  onClose?: () => void;
  /** Direct onIndexChange callback */
  onIndexChange?: (index: number) => void;
  /** Additional CSS classes */
  className?: string;
}

export const Lightbox: React.FC<LightboxProps> = ({
  images = [],
  currentIndex = 0,
  isOpen = false,
  showCounter = true,
  closeAction,
  onClose,
  onIndexChange,
  className,
}) => {
  const safeImages = Array.isArray(images) ? images : [];
  const [index, setIndex] = useState(currentIndex);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const eventBus = useSafeEventBus();

  // Sync external index changes
  useEffect(() => {
    setIndex(currentIndex);
  }, [currentIndex]);

  const handleClose = useCallback(() => {
    if (closeAction) {
      eventBus.emit(`UI:${closeAction}`, {});
    }
    onClose?.();
  }, [closeAction, eventBus, onClose]);

  const goTo = useCallback(
    (newIndex: number) => {
      if (safeImages.length === 0) return;
      const clamped = Math.max(0, Math.min(safeImages.length - 1, newIndex));
      setIndex(clamped);
      onIndexChange?.(clamped);
    },
    [safeImages.length, onIndexChange],
  );

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          handleClose();
          break;
        case "ArrowLeft":
          goPrev();
          break;
        case "ArrowRight":
          goNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose, goPrev, goNext]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen || safeImages.length === 0) return null;

  const currentImage = safeImages[index];
  const hasPrev = index > 0;
  const hasNext = index < safeImages.length - 1;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    const threshold = 50;
    if (diff > threshold && hasPrev) goPrev();
    if (diff < -threshold && hasNext) goNext();
    setTouchStartX(null);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-black bg-opacity-90",
        className,
      )}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={currentImage?.alt ?? "Image viewer"}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className={cn(
          "absolute top-4 right-4 z-10",
          "p-2 rounded-full",
          "text-white bg-black bg-opacity-50",
          "hover:bg-opacity-70 transition-opacity",
          "focus:outline-none focus:ring-2 focus:ring-white",
        )}
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Previous button */}
      {hasPrev && safeImages.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className={cn(
            "absolute left-4 z-10",
            "p-2 rounded-full",
            "text-white bg-black bg-opacity-50",
            "hover:bg-opacity-70 transition-opacity",
            "focus:outline-none focus:ring-2 focus:ring-white",
          )}
          aria-label="Previous image"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Image */}
      <div
        className="flex items-center justify-center w-full h-full p-12"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {currentImage && (
          <img
            src={currentImage.src}
            alt={currentImage.alt ?? ""}
            className="max-w-full max-h-full object-contain select-none"
            draggable={false}
          />
        )}
      </div>

      {/* Next button */}
      {hasNext && safeImages.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className={cn(
            "absolute right-4 z-10",
            "p-2 rounded-full",
            "text-white bg-black bg-opacity-50",
            "hover:bg-opacity-70 transition-opacity",
            "focus:outline-none focus:ring-2 focus:ring-white",
          )}
          aria-label="Next image"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Counter + caption */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        {showCounter && safeImages.length > 1 && (
          <div className="text-white text-sm mb-1">
            {index + 1} of {safeImages.length}
          </div>
        )}
        {currentImage?.caption && (
          <div className="text-white text-sm opacity-80 px-8">{currentImage.caption}</div>
        )}
      </div>
    </div>
  );
};

Lightbox.displayName = "Lightbox";
