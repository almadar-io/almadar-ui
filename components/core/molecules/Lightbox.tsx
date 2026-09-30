'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { AssetUrl } from "@almadar/core";
import { Box } from "../atoms/Box";
import { Button } from "../atoms/Button";
import { Typography } from "../atoms/Typography";
import { cn } from "../../../lib/cn";
import { useEventBus } from "../../../hooks/useEventBus";
import { useTranslate } from "../../../hooks/useTranslate";
import { useDialogBehavior } from "../../../hooks/useDialogBehavior";
import { ThemedPortal } from "../../../lib/ThemedPortal";

function useSafeEventBus() {
  try {
    return useEventBus();
  } catch {
    return { emit: () => {}, on: () => () => {}, once: () => {} };
  }
}

export interface LightboxImage {
  src?: AssetUrl;
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
  const { t, direction } = useTranslate();
  const dialogRef = useRef<HTMLDivElement>(null);

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

  useDialogBehavior({ open: isOpen && safeImages.length > 0, containerRef: dialogRef, onEscape: handleClose });

  // Paging keys follow reading direction: "next" is ArrowLeft in RTL.
  useEffect(() => {
    if (!isOpen) return;
    const nextKey = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
    const prevKey = direction === "rtl" ? "ArrowRight" : "ArrowLeft";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === nextKey) goNext();
      else if (e.key === prevKey) goPrev();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, direction, goPrev, goNext]);

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

  const overlayButton = "absolute z-10 rounded-full bg-card text-foreground hover:bg-muted";

  return (
    <ThemedPortal>
      <Box
        ref={dialogRef}
        className={cn(
          "fixed inset-0 z-[1000] flex items-center justify-center",
          // eslint-disable-next-line almadar/no-hardcoded-colors -- media overlay: lightbox scrim behind images
          "bg-black/90",
          className,
        )}
        onClick={handleClose}
        role="dialog"
        data-pattern="lightbox"
        aria-modal="true"
        aria-label={currentImage?.alt || t("aria.imageViewer")}
      >
        <Button
          variant="ghost"
          icon="x"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleClose();
          }}
          className={cn(overlayButton, "top-4 end-4")}
          aria-label={t("aria.closeModal")}
        />

        {hasPrev && (
          <Button
            variant="ghost"
            icon={direction === "rtl" ? "chevron-right" : "chevron-left"}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              goPrev();
            }}
            className={cn(overlayButton, "start-4")}
            aria-label={t("aria.previousImage")}
          />
        )}

        <Box
          className="flex items-center justify-center w-full h-full p-12"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
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
        </Box>

        {hasNext && (
          <Button
            variant="ghost"
            icon={direction === "rtl" ? "chevron-left" : "chevron-right"}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              goNext();
            }}
            className={cn(overlayButton, "end-4")}
            aria-label={t("aria.nextImage")}
          />
        )}

        <Box className="absolute bottom-4 inset-x-0 text-center">
          {showCounter && safeImages.length > 1 && (
            // eslint-disable-next-line almadar/no-hardcoded-colors -- media overlay: text over the dark scrim
            <Typography variant="small" className="text-white mb-1">
              {t("lightbox.counter", { current: index + 1, total: safeImages.length })}
            </Typography>
          )}
          {currentImage?.caption && (
            // eslint-disable-next-line almadar/no-hardcoded-colors -- media overlay: text over the dark scrim
            <Typography variant="small" className="text-white/80 px-8">
              {currentImage.caption}
            </Typography>
          )}
        </Box>
      </Box>
    </ThemedPortal>
  );
};

Lightbox.displayName = "Lightbox";