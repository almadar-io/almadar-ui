'use client';
/**
 * LineChart Molecule Component
 *
 * SVG-based line/area chart for time-series data.
 * Pure UI molecule with no entity binding.
 */

import React, { useMemo, useId } from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms';

export interface ChartDataPoint {
  date: string | Date;
  value: number;
  label?: string;
}

export interface LineChartProps {
  /** Data points to plot */
  data: ChartDataPoint[];
  /** SVG viewBox width */
  width?: number;
  /** SVG viewBox height */
  height?: number;
  /** Show horizontal grid lines at 25/50/75% */
  showGrid?: boolean;
  /** Show value labels near data points */
  showValues?: boolean;
  /** Fill area under line with gradient */
  showArea?: boolean;
  /** Line stroke color */
  lineColor?: string;
  /** Area fill color (used for gradient) */
  areaColor?: string;
  /** Additional CSS classes */
  className?: string;
}

interface NormalizedPoint {
  x: number;
  y: number;
  value: number;
  label?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 400,
  height = 200,
  showGrid = true,
  showValues = false,
  showArea = true,
  lineColor = 'var(--color-primary)',
  areaColor = 'var(--color-primary)',
  className,
}) => {
  const gradientId = useId();

  const sortedData = useMemo(() => {
    return [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data]);

  const points: NormalizedPoint[] = useMemo(() => {
    if (sortedData.length === 0) return [];

    const values = sortedData.map((d) => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    return sortedData.map((point, index) => ({
      x: padding + (index / (sortedData.length - 1 || 1)) * chartWidth,
      y: padding + chartHeight - ((point.value - minVal) / range) * chartHeight,
      value: point.value,
      label: point.label,
    }));
  }, [sortedData, width, height]);

  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0 || !showArea) return '';
    const bottom = height - 20;
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
  }, [linePath, points, height, showArea]);

  if (data.length === 0) {
    return (
      <Box className={cn('flex items-center justify-center text-[var(--color-muted-foreground)]', className)} style={{ width, height }}>
        No data
      </Box>
    );
  }

  return (
    <Box className={cn(className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={areaColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={areaColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {showGrid && (
          <>
            <line x1="20" y1={height * 0.25} x2={width - 20} y2={height * 0.25} stroke="var(--color-border, #e5e7eb)" strokeWidth="1" />
            <line x1="20" y1={height * 0.5} x2={width - 20} y2={height * 0.5} stroke="var(--color-border, #e5e7eb)" strokeWidth="1" />
            <line x1="20" y1={height * 0.75} x2={width - 20} y2={height * 0.75} stroke="var(--color-border, #e5e7eb)" strokeWidth="1" />
          </>
        )}

        {showArea && areaPath && (
          <path d={areaPath} fill={`url(#${gradientId})`} />
        )}

        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={lineColor}
            stroke="var(--color-background, white)"
            strokeWidth="2"
          />
        ))}

        {showValues &&
          points.map((point, index) => (
            <text
              key={`label-${index}`}
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              fontSize="11"
              fill="var(--color-foreground, currentColor)"
            >
              {point.label ?? point.value}
            </text>
          ))}
      </svg>
    </Box>
  );
};

LineChart.displayName = 'LineChart';
