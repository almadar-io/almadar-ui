'use client';

import React, { useCallback, useRef, useState } from "react";
import { Upload, FileWarning } from "lucide-react";
import { cn } from "../../lib/cn";
import { Icon } from "../atoms/Icon";
import { Typography } from "../atoms/Typography";
import { useEventBus } from "../../hooks/useEventBus";

function useSafeEventBus() {
  try {
    return useEventBus();
  } catch {
    return { emit: () => {}, on: () => () => {}, once: () => {} };
  }
}

export interface UploadDropZoneProps {
  /** Accepted MIME types (e.g., "image/*", "application/pdf") */
  accept?: string;
  /** Max file size in bytes */
  maxSize?: number;
  /** Max number of files */
  maxFiles?: number;
  /** Label text */
  label?: string;
  /** Description text below label */
  description?: string;
  /** Icon name (Lucide string) */
  icon?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Declarative event name for file selection */
  action?: string;
  /** Payload to include with the action event */
  actionPayload?: Record<string, unknown>;
  /** Direct onFiles callback */
  onFiles?: (files: File[]) => void;
  /** Additional CSS classes */
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

export const UploadDropZone: React.FC<UploadDropZoneProps> = ({
  accept,
  maxSize,
  maxFiles = 1,
  label = "Drop files here or click to browse",
  description,
  disabled = false,
  action,
  actionPayload,
  onFiles,
  className,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const eventBus = useSafeEventBus();

  const defaultDescription = [
    accept ? `Accepted: ${accept}` : null,
    maxSize ? `Max size: ${formatFileSize(maxSize)}` : null,
    maxFiles > 1 ? `Up to ${maxFiles} files` : null,
  ]
    .filter(Boolean)
    .join(". ");

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; error: string | null } => {
      if (files.length > maxFiles) {
        return { valid: [], error: `Maximum ${maxFiles} file${maxFiles > 1 ? "s" : ""} allowed` };
      }

      if (accept) {
        const acceptedTypes = accept.split(",").map((t) => t.trim());
        const invalid = files.filter((file) => {
          return !acceptedTypes.some((type) => {
            if (type.endsWith("/*")) {
              return file.type.startsWith(type.replace("/*", "/"));
            }
            return file.type === type || file.name.endsWith(type);
          });
        });
        if (invalid.length > 0) {
          return { valid: [], error: `Invalid file type: ${invalid[0].name}` };
        }
      }

      if (maxSize) {
        const tooLarge = files.filter((file) => file.size > maxSize);
        if (tooLarge.length > 0) {
          return {
            valid: [],
            error: `File too large: ${tooLarge[0].name} (max ${formatFileSize(maxSize)})`,
          };
        }
      }

      return { valid: files, error: null };
    },
    [accept, maxSize, maxFiles],
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      const { valid, error: validationError } = validateFiles(files);
      setError(validationError);

      if (valid.length > 0) {
        onFiles?.(valid);
        if (action) {
          eventBus.emit(`UI:${action}`, {
            ...actionPayload,
            files: valid.map((f) => ({ name: f.name, size: f.size, type: f.type })),
          });
        }
      }
    },
    [validateFiles, onFiles, action, actionPayload, eventBus],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) handleFiles(files);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center",
        "p-8 rounded-[var(--radius-sm)]",
        "border-2 border-dashed",
        "transition-colors duration-150",
        "cursor-pointer",
        isDragOver
          ? "border-[var(--color-primary)] bg-[var(--color-primary)] bg-opacity-5"
          : "border-[var(--color-border)] bg-[var(--color-surface)]",
        error && "border-[var(--color-error)]",
        disabled && "opacity-50 cursor-not-allowed",
        "hover:border-[var(--color-primary)] hover:bg-[var(--color-muted)]",
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={label}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
        aria-hidden="true"
      />

      {error ? (
        <Icon icon={FileWarning} size="lg" className="text-[var(--color-error)] mb-2" />
      ) : (
        <Icon icon={Upload} size="lg" className="text-[var(--color-muted-foreground)] mb-2" />
      )}

      <Typography variant="body1" className="text-center font-medium mb-1">
        {isDragOver ? "Drop files here" : label}
      </Typography>

      {error ? (
        <Typography variant="caption" color="error" className="text-center">
          {error}
        </Typography>
      ) : (
        <Typography variant="caption" color="muted" className="text-center">
          {description ?? defaultDescription}
        </Typography>
      )}
    </div>
  );
};

UploadDropZone.displayName = "UploadDropZone";
