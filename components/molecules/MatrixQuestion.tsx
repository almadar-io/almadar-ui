'use client';

import React, { useCallback } from "react";
import { cn } from "../../lib/cn";
import { Typography } from "../atoms/Typography";
import { Box } from "../atoms/Box";
import { Radio } from "../atoms/Radio";

export interface MatrixRow {
  id: string;
  label: string;
}

export interface MatrixColumn {
  value: number | string;
  label: string;
}

export interface MatrixQuestionProps {
  /** Optional title rendered above the matrix */
  title?: string;
  /** Question rows */
  rows: MatrixRow[];
  /** Column definitions; defaults to 5-point Likert */
  columns?: MatrixColumn[];
  /** Selected value per row, keyed by rowId */
  values?: Record<string, number | string>;
  /** Change handler invoked with rowId and selected column value */
  onChange?: (rowId: string, value: number | string) => void;
  /** Disable all inputs */
  disabled?: boolean;
  /** Visual size */
  size?: 'sm' | 'md';
  /** Additional CSS classes */
  className?: string;
}

export const DEFAULT_MATRIX_COLUMNS: MatrixColumn[] = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

const sizeStyles = {
  sm: {
    cell: "px-2 py-1.5 text-xs",
    radio: "sm" as const,
    label: "text-xs",
  },
  md: {
    cell: "px-3 py-2 text-sm",
    radio: "md" as const,
    label: "text-sm",
  },
} as const;

export const MatrixQuestion: React.FC<MatrixQuestionProps> = ({
  title,
  rows,
  columns = DEFAULT_MATRIX_COLUMNS,
  values,
  onChange,
  disabled = false,
  size = "md",
  className,
}) => {
  const styles = sizeStyles[size];
  const safeRows = rows ?? [];
  const safeValues = values ?? {};

  const handleChange = useCallback(
    (rowId: string, value: number | string) => {
      if (disabled) return;
      onChange?.(rowId, value);
    },
    [onChange, disabled],
  );

  return (
    <Box className={cn("w-full", className)}>
      {title && (
        <Typography variant="h4" className="mb-3">
          {title}
        </Typography>
      )}
      <Box overflow="auto" className="overflow-x-auto">
        <Box as="table" className="w-full border-collapse">
          <Box as="thead">
            <Box as="tr" className="border-b border-border">
              <Box
                as="th"
                role="columnheader"
                className={cn("text-left font-medium text-muted-foreground", styles.cell)}
              />
              {columns.map((col) => (
                <Box
                  as="th"
                  key={String(col.value)}
                  role="columnheader"
                  className={cn(
                    "text-center font-medium text-muted-foreground",
                    styles.cell,
                  )}
                >
                  {col.label}
                </Box>
              ))}
            </Box>
          </Box>
          <Box as="tbody">
            {safeRows.map((row, idx) => {
              const groupName = `matrix-${row.id}`;
              const selected = safeValues[row.id];
              return (
                <Box
                  as="tr"
                  key={row.id}
                  className={cn(
                    "border-b border-border",
                    idx % 2 === 1 && "bg-muted/30",
                  )}
                >
                  <Box
                    as="th"
                    role="rowheader"
                    className={cn(
                      "text-left font-normal text-foreground",
                      styles.cell,
                      styles.label,
                    )}
                  >
                    {row.label}
                  </Box>
                  {columns.map((col) => {
                    const isChecked = selected !== undefined && selected === col.value;
                    const inputId = `${groupName}-${String(col.value)}`;
                    return (
                      <Box
                        as="td"
                        key={String(col.value)}
                        className={cn("text-center", styles.cell)}
                      >
                        <Box
                          display="inline-flex"
                          className={cn(
                            "items-center justify-center",
                            disabled && "opacity-60",
                          )}
                        >
                          <Radio
                            id={inputId}
                            name={groupName}
                            value={String(col.value)}
                            checked={isChecked}
                            disabled={disabled}
                            size={styles.radio}
                            onChange={() => handleChange(row.id, col.value)}
                            aria-label={`${row.label}: ${col.label}`}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

MatrixQuestion.displayName = "MatrixQuestion";
