'use client';
/**
 * Chart Organism Component
 *
 * Data visualization. Supports bar / line / pie / area / donut / scatter /
 * histogram chart types. Renders multi-series natively for bar / line / area
 * via the `series` prop. Pie / donut consume the first series only. Scatter
 * plots raw {x,y} points; histogram renders pre-binned data as gap-less bars.
 *
 * Bus integration:
 *  - top-level `actions[].event` → `UI:{event}` on click (existing behavior)
 *  - per-data-point `drillEvent` → `UI:{drillEvent}` with `{ label, value, seriesLabel? }`
 *
 * Time axis: when `timeAxis: true`, ISO date labels are formatted via Intl
 * (e.g. "Mar 2026"). Positioning remains evenly spaced (real time-scale
 * alignment is deliberately deferred).
 */

import React, { useMemo, useCallback } from "react";
import { cn } from "../../../lib/cn";
import { Card, Typography, Badge, Box } from "../atoms/index";
import { VStack, HStack } from "../atoms/Stack";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { useEventBus } from "../../../hooks/useEventBus";
import { useTranslate } from "../../../hooks/useTranslate";
import type { UiError } from '../atoms/types';

export type ChartType =
    | "bar"
    | "line"
    | "pie"
    | "area"
    | "donut"
    | "scatter"
    | "histogram";

/**
 * Layer 2 visual treatment for the chart pattern — drives the chart
 * sub-renderer (bar / line / pie / etc.). The chart "look" axis is the chart
 * KIND, not pure visual styling. `look` is the primary surface; the legacy
 * `chartType` prop remains as an alias.
 *
 * Mapping to `chartType`:
 *  - `bar-vertical`   ↔ `bar`        (default)
 *  - `bar-horizontal` ↔ (new)        renders bars laid out horizontally
 *  - `line`           ↔ `line`
 *  - `area`           ↔ `area`
 *  - `pie`            ↔ `pie`
 *  - `donut`          ↔ `donut`
 *  - `scatter`        ↔ `scatter`
 *  - `histogram`      ↔ `histogram`
 */
export type ChartLook =
    | "bar-vertical"
    | "bar-horizontal"
    | "line"
    | "area"
    | "pie"
    | "donut"
    | "scatter"
    | "histogram";

export type ChartStackMode = "none" | "stack" | "normalize";

export interface ChartSeriesPoint {
    label: string;
    value: number;
    color?: string;
}

export interface ChartScatterPoint {
    x: number;
    y: number;
    label?: string;
    size?: number;
    color?: string;
}

export interface ChartSeries {
    name: string;
    data: readonly ChartSeriesPoint[];
    color?: string;
    dashed?: boolean;
}

export interface ChartAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}

export interface ChartProps {
    /** Chart title */
    title?: string;
    /** Chart subtitle / description */
    subtitle?: string;
    /**
     * Chart type (legacy alias for `look`).
     * @synonyms chart style, graph type, bar chart, line chart, pie chart, area chart, donut chart, scatter plot, histogram
     * @tier domain
     */
    chartType?: ChartType;
    /**
     * Layer 2 visual treatment — drives the chart sub-renderer (bar / line / pie / etc.).
     * @synonyms chart style, render style, visual treatment
     * @tier presentation
     */
    look?: ChartLook;
    /** Multi-series data */
    series?: readonly ChartSeries[];
    /** Simple single-series shorthand (bar/line/pie/area/donut/histogram) */
    data?: readonly ChartSeriesPoint[];
    /** Raw {x,y} points for scatter */
    scatterData?: readonly ChartScatterPoint[];
    /** Chart height in px */
    height?: number;
    /** Show legend */
    showLegend?: boolean;
    /** Show values on chart */
    showValues?: boolean;
    /** Stack mode for bar / area */
    stack?: ChartStackMode;
    /** Format X-axis labels as time (ISO date in → "Mar 2026"-style label out) */
    timeAxis?: boolean;
    /** Event name emitted as `UI:{drillEvent}` with `{ label, value, seriesLabel? }` on data-point click */
    drillEvent?: string;
    /** Top-level chart actions (export, refresh, etc.) */
    actions?: readonly ChartAction[];
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: UiError | null;
    /** Additional CSS classes */
    className?: string;
}

const CHART_COLORS = [
    "var(--color-primary)",
    "var(--color-success)",
    "var(--color-warning)",
    "var(--color-error)",
    "var(--color-info)",
    "var(--color-accent)",
];

const seriesColor = (series: ChartSeries, idx: number): string =>
    series.color ?? CHART_COLORS[idx % CHART_COLORS.length];

const monthFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "2-digit",
});

const formatTimeLabel = (raw: string): string => {
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;
    return monthFormatter.format(parsed);
};

/** Bar chart renderer — multi-series + stack modes */
const BarChart: React.FC<{
    series: readonly ChartSeries[];
    height: number;
    showValues: boolean;
    stack: ChartStackMode;
    timeAxis: boolean;
    histogram?: boolean;
    horizontal?: boolean;
    onPointClick?: (point: ChartSeriesPoint, seriesName: string) => void;
}> = ({ series, height, showValues, stack, timeAxis, histogram = false, horizontal = false, onPointClick }) => {
    const categories = useMemo(() => {
        const set: string[] = [];
        const seen = new Set<string>();
        for (const s of series) {
            for (const p of s.data) {
                if (!seen.has(p.label)) {
                    seen.add(p.label);
                    set.push(p.label);
                }
            }
        }
        return set;
    }, [series]);

    const valueAt = useCallback(
        (s: ChartSeries, label: string): number => {
            const p = s.data.find((d) => d.label === label);
            return p ? p.value : 0;
        },
        [],
    );

    const columnTotals = useMemo(() => {
        if (stack === "none") return null;
        return categories.map((label) =>
            series.reduce((sum, s) => sum + valueAt(s, label), 0),
        );
    }, [categories, series, stack, valueAt]);

    const maxValue = useMemo(() => {
        if (stack === "normalize") return 100;
        if (stack === "stack" && columnTotals) {
            return Math.max(...columnTotals, 1);
        }
        let m = 1;
        for (const s of series) {
            for (const p of s.data) if (p.value > m) m = p.value;
        }
        return m;
    }, [series, stack, columnTotals]);

    if (horizontal) {
        return (
            <VStack gap="xs" align="stretch" className="w-full" style={{ minHeight: height }}>
                {categories.map((label, catIdx) => {
                    const displayLabel = timeAxis ? formatTimeLabel(label) : label;
                    const total = columnTotals?.[catIdx] ?? 1;
                    return (
                        <HStack key={label} gap="sm" align="center" className="w-full">
                            <Typography
                                variant="caption"
                                color="secondary"
                                className="truncate text-right"
                                style={{ width: 80, flexShrink: 0 }}
                            >
                                {displayLabel}
                            </Typography>
                            <HStack
                                gap={stack === "none" ? "xs" : "none"}
                                align="center"
                                className="flex-1 min-w-0"
                                style={{ height: 24 }}
                            >
                                {series.map((s, sIdx) => {
                                    const value = valueAt(s, label);
                                    const ratio =
                                        stack === "normalize"
                                            ? total === 0
                                                ? 0
                                                : (value / total) * 100
                                            : (value / maxValue) * 100;
                                    const color = seriesColor(s, sIdx);
                                    return (
                                        <Box
                                            key={s.name}
                                            className="h-full rounded-r-sm transition-all duration-500 ease-out min-w-[2px] cursor-pointer hover:opacity-80"
                                            style={{
                                                width: `${ratio}%`,
                                                backgroundColor: color,
                                            }}
                                            onClick={() =>
                                                onPointClick?.(
                                                    { label, value, color },
                                                    s.name,
                                                )
                                            }
                                            title={`${s.name}: ${value}`}
                                        />
                                    );
                                })}
                            </HStack>
                            {showValues && series.length === 1 && (
                                <Typography
                                    variant="caption"
                                    color="secondary"
                                    className="tabular-nums"
                                    style={{ width: 40, flexShrink: 0 }}
                                >
                                    {valueAt(series[0], label)}
                                </Typography>
                            )}
                        </HStack>
                    );
                })}
            </VStack>
        );
    }

    return (
        <HStack
            gap={histogram ? "none" : "xs"}
            align="end"
            className="w-full"
            style={{ height }}
        >
            {categories.map((label, catIdx) => {
                const displayLabel = timeAxis ? formatTimeLabel(label) : label;
                if (stack === "none") {
                    return (
                        <VStack
                            key={label}
                            gap="xs"
                            align="center"
                            flex
                            className="min-w-0"
                            style={{ height: "100%" }}
                        >
                            <HStack gap={histogram ? "none" : "xs"} align="end" justify={histogram ? undefined : "center"} className="w-full flex-1 min-h-0">
                                {series.map((s, sIdx) => {
                                    const value = valueAt(s, label);
                                    const barHeight = (value / maxValue) * 100;
                                    const color = seriesColor(s, sIdx);
                                    return (
                                        <Box
                                            key={s.name}
                                            className={cn(
                                                "rounded-t-sm transition-all duration-500 ease-out min-h-[4px] cursor-pointer hover:opacity-80",
                                                histogram ? "flex-1 mx-0" : "flex-1",
                                            )}
                                            style={{
                                                height: `${barHeight}%`,
                                                // Cap width so a lone category doesn't paint the whole plot as one solid block; narrow columns are unaffected (flex-1 binds first).
                                                ...(!histogram && { maxWidth: 72 }),
                                                backgroundColor: color,
                                            }}
                                            onClick={() =>
                                                onPointClick?.(
                                                    { label, value, color },
                                                    s.name,
                                                )
                                            }
                                            title={`${s.name}: ${value}`}
                                        />
                                    );
                                })}
                            </HStack>
                            {showValues && series.length === 1 && (
                                <Typography variant="caption" color="secondary" className="tabular-nums">
                                    {valueAt(series[0], label)}
                                </Typography>
                            )}
                            <Typography
                                variant="caption"
                                color="secondary"
                                className="truncate w-full text-center"
                            >
                                {displayLabel}
                            </Typography>
                        </VStack>
                    );
                }

                const total = columnTotals?.[catIdx] ?? 1;
                return (
                    <VStack
                        key={label}
                        gap="xs"
                        align="center"
                        flex
                        className="min-w-0"
                        style={{ height: "100%" }}
                    >
                        <VStack gap="none" className="w-full flex-1 min-h-0" justify="end">
                            {series.map((s, sIdx) => {
                                const value = valueAt(s, label);
                                const ratio =
                                    stack === "normalize"
                                        ? total === 0
                                            ? 0
                                            : (value / total) * 100
                                        : (value / maxValue) * 100;
                                const color = seriesColor(s, sIdx);
                                return (
                                    <Box
                                        key={s.name}
                                        className="w-full transition-all duration-500 ease-out cursor-pointer hover:opacity-80"
                                        style={{
                                            height: `${ratio}%`,
                                            backgroundColor: color,
                                        }}
                                        onClick={() =>
                                            onPointClick?.(
                                                { label, value, color },
                                                s.name,
                                            )
                                        }
                                        title={`${s.name}: ${value}`}
                                    />
                                );
                            })}
                        </VStack>
                        <Typography
                            variant="caption"
                            color="secondary"
                            className="truncate w-full text-center"
                        >
                            {displayLabel}
                        </Typography>
                    </VStack>
                );
            })}
        </HStack>
    );
};

/** Pie / Donut renderer (single-series). */
const PieChart: React.FC<{
    data: readonly ChartSeriesPoint[];
    height: number;
    showValues: boolean;
    donut?: boolean;
    onPointClick?: (point: ChartSeriesPoint, seriesName: string) => void;
}> = ({ data, height, showValues, donut = false, onPointClick }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const size = Math.min(height, 200);
    const radius = size / 2 - 8;
    const innerRadius = donut ? radius * 0.6 : 0;
    const center = size / 2;

    const segments = useMemo(() => {
        if (!Number.isFinite(total) || total <= 0) return [];
        let currentAngle = -Math.PI / 2;
        return data.map((point, idx) => {
            const angle = (point.value / total) * 2 * Math.PI;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;

            const largeArc = angle > Math.PI ? 1 : 0;
            const x1 = center + radius * Math.cos(startAngle);
            const y1 = center + radius * Math.sin(startAngle);
            const x2 = center + radius * Math.cos(endAngle);
            const y2 = center + radius * Math.sin(endAngle);

            // A 100% slice spans the full circle, so its arc endpoints
            // coincide and SVG drops the segment — split it into two half
            // arcs (each exactly π, so either largeArc value draws them).
            const fullCircle = angle >= 2 * Math.PI - 1e-9;
            const midAngle = startAngle + angle / 2;
            const xm = center + radius * Math.cos(midAngle);
            const ym = center + radius * Math.sin(midAngle);

            let d: string;
            if (innerRadius > 0) {
                const ix1 = center + innerRadius * Math.cos(startAngle);
                const iy1 = center + innerRadius * Math.sin(startAngle);
                const ix2 = center + innerRadius * Math.cos(endAngle);
                const iy2 = center + innerRadius * Math.sin(endAngle);
                if (fullCircle) {
                    const ixm = center + innerRadius * Math.cos(midAngle);
                    const iym = center + innerRadius * Math.sin(midAngle);
                    d = `M ${ix1} ${iy1} L ${x1} ${y1} A ${radius} ${radius} 0 1 1 ${xm} ${ym} A ${radius} ${radius} 0 1 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 1 0 ${ixm} ${iym} A ${innerRadius} ${innerRadius} 0 1 0 ${ix1} ${iy1} Z`;
                } else {
                    d = `M ${ix1} ${iy1} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
                }
            } else if (fullCircle) {
                d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 1 1 ${xm} ${ym} A ${radius} ${radius} 0 1 1 ${x2} ${y2} Z`;
            } else {
                d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            }

            return {
                d,
                color: point.color || CHART_COLORS[idx % CHART_COLORS.length],
                label: point.label,
                value: point.value,
                percentage: ((point.value / total) * 100).toFixed(1),
            };
        });
    }, [data, total, radius, innerRadius, center]);

    return (
        <HStack gap="md" align="center" justify="center" className="w-full">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {segments.map((seg, idx) => (
                    <path
                        key={idx}
                        d={seg.d}
                        fill={seg.color}
                        stroke="var(--color-card)"
                        strokeWidth="2"
                        className="transition-opacity duration-200 hover:opacity-80 cursor-pointer"
                        onClick={() =>
                            onPointClick?.(
                                { label: seg.label, value: seg.value, color: seg.color },
                                "default",
                            )
                        }
                    />
                ))}
                {donut && (
                    <text
                        x={center}
                        y={center}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="var(--color-foreground)"
                        fontSize="14"
                        fontWeight="bold"
                    >
                        {total}
                    </text>
                )}
            </svg>
            {showValues && (
                <VStack gap="xs">
                    {segments.map((seg, idx) => (
                        <HStack key={idx} gap="xs" align="center">
                            <Box
                                className="w-3 h-3 rounded-sm flex-shrink-0"
                                style={{ backgroundColor: seg.color }}
                            />
                            <Typography variant="caption" color="secondary" className="truncate">
                                {seg.label}: {seg.percentage}%
                            </Typography>
                        </HStack>
                    ))}
                </VStack>
            )}
        </HStack>
    );
};

/** Line / Area renderer — multi-series. Time-axis is positional. */
const LineChart: React.FC<{
    series: readonly ChartSeries[];
    height: number;
    showValues: boolean;
    fill?: boolean;
    timeAxis: boolean;
    onPointClick?: (point: ChartSeriesPoint, seriesName: string) => void;
}> = ({ series, height, showValues, fill = false, timeAxis, onPointClick }) => {
    const width = 400;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const labels = useMemo(() => {
        const seen = new Set<string>();
        const out: string[] = [];
        for (const s of series) {
            for (const p of s.data) {
                if (!seen.has(p.label)) {
                    seen.add(p.label);
                    out.push(p.label);
                }
            }
        }
        return out;
    }, [series]);

    const maxValue = useMemo(() => {
        let m = 1;
        for (const s of series) {
            for (const p of s.data) if (p.value > m) m = p.value;
        }
        return m;
    }, [series]);

    const xFor = useCallback(
        (idx: number) =>
            padding.left + (idx / Math.max(labels.length - 1, 1)) * chartWidth,
        [labels.length, chartWidth, padding.left],
    );

    const yFor = useCallback(
        (value: number) =>
            padding.top + chartHeight - (value / maxValue) * chartHeight,
        [maxValue, chartHeight, padding.top],
    );

    return (
        <svg
            width="100%"
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
        >
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                const y = padding.top + chartHeight * (1 - frac);
                return (
                    <line
                        key={frac}
                        x1={padding.left}
                        y1={y}
                        x2={width - padding.right}
                        y2={y}
                        stroke="var(--color-border)"
                        strokeDasharray="4 4"
                        opacity={0.5}
                    />
                );
            })}
            {series.map((s, sIdx) => {
                const color = seriesColor(s, sIdx);
                const points = labels.map((label, idx) => {
                    const point = s.data.find((d) => d.label === label);
                    return {
                        x: xFor(idx),
                        y: yFor(point ? point.value : 0),
                        value: point ? point.value : 0,
                        label,
                    };
                });
                const linePath = points
                    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                    .join(" ");
                const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;
                return (
                    <g key={s.name}>
                        {fill && (
                            <path
                                d={areaPath}
                                fill={color}
                                opacity={series.length > 1 ? 0.08 : 0.1}
                            />
                        )}
                        <path
                            d={linePath}
                            fill="none"
                            stroke={color}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray={s.dashed ? "6 4" : undefined}
                        />
                        {points.map((p, idx) => (
                            <g key={idx}>
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="4"
                                    fill="var(--color-card)"
                                    stroke={color}
                                    strokeWidth="2"
                                    className="cursor-pointer"
                                    onClick={() =>
                                        onPointClick?.(
                                            { label: p.label, value: p.value, color },
                                            s.name,
                                        )
                                    }
                                />
                                {showValues && series.length === 1 && (
                                    <text
                                        x={p.x}
                                        y={p.y - 10}
                                        textAnchor="middle"
                                        fill="var(--color-foreground)"
                                        fontSize="10"
                                        fontWeight="500"
                                    >
                                        {p.value}
                                    </text>
                                )}
                            </g>
                        ))}
                    </g>
                );
            })}
            {labels.map((label, idx) => (
                <text
                    key={label}
                    x={xFor(idx)}
                    y={height - 8}
                    textAnchor="middle"
                    fill="var(--color-muted-foreground)"
                    fontSize="9"
                >
                    {timeAxis ? formatTimeLabel(label) : label}
                </text>
            ))}
        </svg>
    );
};

/** Scatter renderer — raw X/Y points, optional size. */
const ScatterChart: React.FC<{
    data: readonly ChartScatterPoint[];
    height: number;
    onPointClick?: (point: ChartSeriesPoint, seriesName: string) => void;
}> = ({ data, height, onPointClick }) => {
    const width = 400;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const { minX, maxX, minY, maxY } = useMemo(() => {
        if (data.length === 0) {
            return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
        }
        let mnX = data[0].x;
        let mxX = data[0].x;
        let mnY = data[0].y;
        let mxY = data[0].y;
        for (const p of data) {
            if (p.x < mnX) mnX = p.x;
            if (p.x > mxX) mxX = p.x;
            if (p.y < mnY) mnY = p.y;
            if (p.y > mxY) mxY = p.y;
        }
        return { minX: mnX, maxX: mxX, minY: mnY, maxY: mxY };
    }, [data]);

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    return (
        <svg
            width="100%"
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
        >
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                const y = padding.top + chartHeight * (1 - frac);
                return (
                    <line
                        key={frac}
                        x1={padding.left}
                        y1={y}
                        x2={width - padding.right}
                        y2={y}
                        stroke="var(--color-border)"
                        strokeDasharray="4 4"
                        opacity={0.5}
                    />
                );
            })}
            {data.map((p, idx) => {
                const cx = padding.left + ((p.x - minX) / rangeX) * chartWidth;
                const cy =
                    padding.top + chartHeight - ((p.y - minY) / rangeY) * chartHeight;
                const r = p.size ?? 5;
                const color = p.color ?? CHART_COLORS[idx % CHART_COLORS.length];
                return (
                    <circle
                        key={idx}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill={color}
                        opacity={0.7}
                        className="cursor-pointer hover:opacity-100"
                        onClick={() =>
                            onPointClick?.(
                                {
                                    label: p.label ?? `(${p.x}, ${p.y})`,
                                    value: p.y,
                                    color,
                                },
                                "default",
                            )
                        }
                    >
                        <title>{p.label ?? `(${p.x}, ${p.y})`}</title>
                    </circle>
                );
            })}
            <text
                x={padding.left}
                y={height - 8}
                fill="var(--color-muted-foreground)"
                fontSize="9"
            >
                {minX.toFixed(1)}
            </text>
            <text
                x={width - padding.right}
                y={height - 8}
                textAnchor="end"
                fill="var(--color-muted-foreground)"
                fontSize="9"
            >
                {maxX.toFixed(1)}
            </text>
        </svg>
    );
};

const LOOK_FROM_CHART_TYPE: Record<ChartType, ChartLook> = {
    bar: "bar-vertical",
    line: "line",
    pie: "pie",
    area: "area",
    donut: "donut",
    scatter: "scatter",
    histogram: "histogram",
};

export const Chart: React.FC<ChartProps> = ({
    title,
    subtitle,
    chartType,
    look,
    series,
    data: simpleData,
    scatterData,
    height = 200,
    showLegend = true,
    showValues = false,
    stack = "none",
    timeAxis = false,
    drillEvent,
    actions,
    isLoading = false,
    error,
    className,
}) => {
    const resolvedLook: ChartLook =
        look ?? (chartType ? LOOK_FROM_CHART_TYPE[chartType] : "bar-vertical");
    const eventBus = useEventBus();
    const { t } = useTranslate();

    const handleAction = useCallback(
        (action: ChartAction) => {
            if (action.event) {
                eventBus.emit(`UI:${action.event}`, {});
            }
        },
        [eventBus],
    );

    const handlePointClick = useCallback(
        (point: ChartSeriesPoint, seriesName: string) => {
            if (drillEvent) {
                eventBus.emit(`UI:${drillEvent}`, {
                    label: point.label,
                    value: point.value,
                    seriesLabel: seriesName === "default" ? undefined : seriesName,
                });
            }
        },
        [drillEvent, eventBus],
    );

    const normalizedSeries = useMemo<readonly ChartSeries[]>(() => {
        if (series && series.length > 0) return series;
        if (simpleData) return [{ name: "default", data: simpleData }];
        return [];
    }, [simpleData, series]);

    const firstSeriesData = normalizedSeries[0]?.data ?? [];
    const hasContent =
        resolvedLook === "scatter"
            ? (scatterData?.length ?? 0) > 0
            : normalizedSeries.some((s) => s.data.length > 0);

    if (isLoading) {
        return <LoadingState message={t('common.loading')} className={className} />;
    }

    if (error) {
        return (
            <ErrorState
                title={t('display.chartError')}
                message={error.message}
                className={className}
            />
        );
    }

    if (!hasContent) {
        return <EmptyState title={t('empty.noData')} description={t('empty.noData')} className={className} />;
    }

    return (
        <Card className={cn("p-6", className)}>
            <VStack gap="md">
                {(title || subtitle || (actions && actions.length > 0)) && (
                    <HStack justify="between" align="start">
                        <VStack gap="xs">
                            {title && (
                                <Typography variant="h5" weight="semibold">
                                    {title}
                                </Typography>
                            )}
                            {subtitle && (
                                <Typography variant="small" color="secondary">
                                    {subtitle}
                                </Typography>
                            )}
                        </VStack>
                        {actions && actions.length > 0 && (
                            <HStack gap="xs">
                                {actions.map((action, idx) => (
                                    <Badge
                                        key={idx}
                                        variant="default"
                                        className="cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => handleAction(action)}
                                    >
                                        {action.label}
                                    </Badge>
                                ))}
                            </HStack>
                        )}
                    </HStack>
                )}

                <Box className="w-full">
                    {resolvedLook === "bar-vertical" && (
                        <BarChart
                            series={normalizedSeries}
                            height={height}
                            showValues={showValues}
                            stack={stack}
                            timeAxis={timeAxis}
                            onPointClick={handlePointClick}
                        />
                    )}
                    {resolvedLook === "bar-horizontal" && (
                        <BarChart
                            series={normalizedSeries}
                            height={height}
                            showValues={showValues}
                            stack={stack}
                            timeAxis={timeAxis}
                            horizontal
                            onPointClick={handlePointClick}
                        />
                    )}
                    {resolvedLook === "histogram" && (
                        <BarChart
                            series={normalizedSeries}
                            height={height}
                            showValues={showValues}
                            stack="none"
                            timeAxis={false}
                            histogram
                            onPointClick={handlePointClick}
                        />
                    )}
                    {resolvedLook === "line" && (
                        <LineChart
                            series={normalizedSeries}
                            height={height}
                            showValues={showValues}
                            timeAxis={timeAxis}
                            onPointClick={handlePointClick}
                        />
                    )}
                    {resolvedLook === "area" && (
                        <LineChart
                            series={normalizedSeries}
                            height={height}
                            showValues={showValues}
                            timeAxis={timeAxis}
                            fill
                            onPointClick={handlePointClick}
                        />
                    )}
                    {resolvedLook === "pie" && (
                        <PieChart
                            data={firstSeriesData}
                            height={height}
                            showValues={showLegend}
                            onPointClick={handlePointClick}
                        />
                    )}
                    {resolvedLook === "donut" && (
                        <PieChart
                            data={firstSeriesData}
                            height={height}
                            showValues={showLegend}
                            donut
                            onPointClick={handlePointClick}
                        />
                    )}
                    {resolvedLook === "scatter" && (
                        <ScatterChart
                            data={scatterData ?? []}
                            height={height}
                            onPointClick={handlePointClick}
                        />
                    )}
                </Box>

                {showLegend && normalizedSeries.length > 1 && (
                    <HStack gap="md" justify="center" wrap>
                        {normalizedSeries.map((s, idx) => (
                            <HStack key={idx} gap="xs" align="center">
                                <Box
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: seriesColor(s, idx) }}
                                />
                                <Typography variant="caption" color="secondary">
                                    {s.name}
                                </Typography>
                            </HStack>
                        ))}
                    </HStack>
                )}
            </VStack>
        </Card>
    );
};

Chart.displayName = "Chart";
