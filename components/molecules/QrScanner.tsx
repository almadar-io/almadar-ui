'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, Pause, Play } from "lucide-react";
import { cn } from "../../lib/cn";
import { Box, Typography, Button } from "../atoms";

export interface QrScanResult {
  text: string;
  format: string;
  timestamp: number;
}

export interface QrScannerProps {
  onScan?: (result: QrScanResult) => void;
  onError?: (error: Error) => void;
  facingMode?: 'environment' | 'user';
  paused?: boolean;
  showOverlay?: boolean;
  showCameraControls?: boolean;
  fallback?: React.ReactNode;
  className?: string;
}

export const QrScanner: React.FC<QrScannerProps> = ({
  onScan,
  onError,
  facingMode = 'environment',
  paused = false,
  showOverlay = true,
  showCameraControls = true,
  fallback,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [currentFacing, setCurrentFacing] = useState<'environment' | 'user'>(facingMode);
  const [isPaused, setIsPaused] = useState(paused);
  const [cameraError, setCameraError] = useState<Error | null>(null);
  const [isReady, setIsReady] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsReady(false);
  }, []);

  const startStream = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      const err = new Error("Camera API not available in this environment");
      setCameraError(err);
      onError?.(err);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentFacing },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraError(null);
      setIsReady(true);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setCameraError(err);
      onError?.(err);
      setIsReady(false);
    }
  }, [currentFacing, onError]);

  useEffect(() => {
    if (isPaused) {
      stopStream();
      return;
    }
    void startStream();
    return () => {
      stopStream();
    };
  }, [currentFacing, isPaused, startStream, stopStream]);

  useEffect(() => {
    setIsPaused(paused);
  }, [paused]);

  useEffect(() => {
    setCurrentFacing(facingMode);
  }, [facingMode]);

  useEffect(() => {
    if (!isReady || isPaused) return;
    scanIntervalRef.current = setInterval(() => {
      // TODO(qr-decode): wire jsQR or zxing-wasm — outside Phase 10 scope
    }, 200);
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, [isReady, isPaused]);

  const toggleFacing = useCallback(() => {
    setCurrentFacing((f) => (f === 'environment' ? 'user' : 'environment'));
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  const handleMockScan = useCallback(() => {
    onScan?.({
      text: "https://example.com/mock-qr",
      format: "QR_CODE",
      timestamp: Date.now(),
    });
  }, [onScan]);

  const videoExtraProps: React.VideoHTMLAttributes<HTMLVideoElement> = {
    playsInline: true,
    muted: true,
  };

  if (cameraError && fallback) {
    return <Box position="relative" className={className}>{fallback}</Box>;
  }

  return (
    <Box
      position="relative"
      overflow="hidden"
      rounded="sm"
      className={cn(
        "bg-black",
        "aspect-square w-full max-w-md",
        className,
      )}
      data-pattern="qr-scanner"
      role="region"
      aria-label="QR scanner"
    >
      <Box
        as="video"
        ref={videoRef as React.Ref<HTMLDivElement>}
        position="absolute"
        fullWidth
        fullHeight
        className="inset-0 object-cover"
        aria-hidden="true"
        {...(videoExtraProps as React.HTMLAttributes<HTMLDivElement>)}
      />

      {showOverlay && isReady && !isPaused && (
        <Box position="absolute" className="pointer-events-none inset-0">
          <Box position="absolute" className="left-[15%] top-[15%] h-8 w-8 border-l-2 border-t-2 border-white" />
          <Box position="absolute" className="right-[15%] top-[15%] h-8 w-8 border-r-2 border-t-2 border-white" />
          <Box position="absolute" className="bottom-[15%] left-[15%] h-8 w-8 border-b-2 border-l-2 border-white" />
          <Box position="absolute" className="bottom-[15%] right-[15%] h-8 w-8 border-b-2 border-r-2 border-white" />
          <Box position="absolute" className="left-[15%] right-[15%] top-1/2 h-px bg-white opacity-60" />
        </Box>
      )}

      {cameraError && !fallback && (
        <Box
          position="absolute"
          display="flex"
          padding="lg"
          className="inset-0 flex-col items-center justify-center gap-2 bg-black bg-opacity-80 text-center"
        >
          <Camera className="h-8 w-8 text-white" aria-hidden="true" />
          <Typography variant="body2" className="text-white">Camera unavailable</Typography>
          <Typography variant="caption" className="text-white opacity-70">{cameraError.message}</Typography>
        </Box>
      )}

      {isPaused && !cameraError && (
        <Box
          position="absolute"
          display="flex"
          className="inset-0 items-center justify-center bg-black bg-opacity-60"
        >
          <Typography variant="body2" className="text-white">Paused</Typography>
        </Box>
      )}

      {showCameraControls && (
        <Box
          position="absolute"
          display="flex"
          className="bottom-3 left-1/2 -translate-x-1/2 gap-2"
        >
          <Button
            type="button"
            onClick={togglePause}
            className={cn(
              "rounded-full bg-black bg-opacity-60 p-2 text-white",
              "hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-white",
            )}
            aria-label={isPaused ? "Resume scanning" : "Pause scanning"}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            onClick={toggleFacing}
            className={cn(
              "rounded-full bg-black bg-opacity-60 p-2 text-white",
              "hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-white",
            )}
            aria-label={`Switch to ${currentFacing === 'environment' ? 'front' : 'rear'} camera`}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            onClick={handleMockScan}
            className={cn(
              "rounded-full bg-black bg-opacity-60 px-3 py-2 text-xs text-white",
              "hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-white",
            )}
            aria-label="Mock scan (dev)"
          >
            Mock Scan
          </Button>
        </Box>
      )}
    </Box>
  );
};

QrScanner.displayName = "QrScanner";
