'use client';

import React, { useCallback } from "react";
import { cn } from "../../lib/cn";
import { Typography } from "../atoms/Typography";

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
    radio: "h-3.5 w-3.5",
    label: "text-xs",
  },
  md: {
    cell: "px-3 py-2 text-sm",
    radio: "h-4 w-4",
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
    <div className={cn("w-full", className)}>
      {title && (
        <Typography variant="h4" className="mb-3">
          {title}
        </Typography>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className={cn("text-left font-medium text-muted-foreground", styles.cell)} />
              {columns.map((col) => (
                <th
                  key={String(col.value)}
                  scope="col"
                  className={cn(
                    "text-center font-medium text-muted-foreground",
                    styles.cell,
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safeRows.map((row, idx) => {
              const groupName = `matrix-${row.id}`;
              const selected = safeValues[row.id];
              return (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border",
                    idx % 2 === 1 && "bg-muted/30",
                  )}
                >
                  <th
                    scope="row"
                    className={cn(
                      "text-left font-normal text-foreground",
                      styles.cell,
                      styles.label,
                    )}
                  >
                    {row.label}
                  </th>
                  {columns.map((col) => {
                    const isChecked = selected !== undefined && selected === col.value;
                    const inputId = `${groupName}-${String(col.value)}`;
                    return (
                      <td key={String(col.value)} className={cn("text-center", styles.cell)}>
                        <label
                          htmlFor={inputId}
                          className={cn(
                            "inline-flex items-center justify-center cursor-pointer",
                            disabled && "cursor-not-allowed opacity-60",
                          )}
                        >
                          <input
                            id={inputId}
                            type="radio"
                            name={groupName}
                            value={String(col.value)}
                            checked={isChecked}
                            disabled={disabled}
                            onChange={() => handleChange(row.id, col.value)}
                            className={cn(
                              "accent-primary border-border",
                              styles.radio,
                            )}
                            aria-label={`${row.label}: ${col.label}`}
                          />
                        </label>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

MatrixQuestion.displayName = "MatrixQuestion";
