'use client';
/**
 * usePinchZoom Hook
 *
 * Tracks two-finger pinch gesture for zoom functionality.
 * Returns scale factor and origin point.
 * Components use this internally for visual zoom (no event bus needed).
 */
import { useCallback, useRef, useState } from 'react';
import type React from 'react';

export interface PinchZoomResult {
  /** Current zoom scale (1 = no zoom) */
  scale: number;
  /** Whether a pinch gesture is active */
  isPinching: boolean;
  /** Props to spread on the zoomable container */
  gestureProps: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
  /** Reset zoom to 1 */
  resetZoom: () => void;
}

export interface PinchZoomOptions {
  /** Minimum zoom scale (default: 0.5) */
  minScale?: number;
  /** Maximum zoom scale (default: 4) */
  maxScale?: number;
}

function getDistance(touches: React.TouchList): number {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

export function usePinchZoom(options: PinchZoomOptions = {}): PinchZoomResult {
  const { minScale = 0.5, maxScale = 4 } = options;

  const [scale, setScale] = useState(1);
  const [isPinching, setIsPinching] = useState(false);

  const initialDistance = useRef(0);
  const initialScale = useRef(1);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      initialDistance.current = getDistance(e.touches);
      initialScale.current = scale;
      setIsPinching(true);
    }
  }, [scale]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2 || !isPinching) return;
    e.preventDefault();

    const currentDistance = getDistance(e.touches);
    const ratio = currentDistance / initialDistance.current;
    const newScale = Math.min(maxScale, Math.max(minScale, initialScale.current * ratio));
    setScale(newScale);
  }, [isPinching, minScale, maxScale]);

  const onTouchEnd = useCallback(() => {
    setIsPinching(false);
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
  }, []);

  return {
    scale,
    isPinching,
    gestureProps: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    resetZoom,
  };
}
