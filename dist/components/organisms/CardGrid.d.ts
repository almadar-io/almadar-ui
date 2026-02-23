/**
 * CardGrid Component
 *
 * A dumb, responsive grid specifically designed for card layouts.
 * Uses CSS Grid auto-fit for automatic responsive columns.
 *
 * Data comes exclusively from the `data` prop (provided by the trait via render-ui).
 * All user interactions emit events via useEventBus — never manages internal state
 * for pagination, filtering, or search. All state is owned by the trait state machine.
 */
import React from 'react';
import type { EntityDisplayProps } from './types';
export type CardGridGap = 'none' | 'sm' | 'md' | 'lg' | 'xl';
/**
 * Action configuration for card items (schema-driven)
 */
export interface CardItemAction {
    /** Action button label */
    label: string;
    /** Event to dispatch on click (schema metadata) */
    event?: string;
    /** Navigation URL - supports template interpolation like "/products/{{row.id}}" */
    navigatesTo?: string;
    /** Callback on click */
    onClick?: (item: unknown) => void;
    /** Action used by generated code - alternative to event */
    action?: string;
    /** Action placement - accepts string for compatibility with generated code */
    placement?: 'card' | 'footer' | 'row' | string;
    /** Button variant - accepts string for compatibility with generated code */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | string;
}
/**
 * Field definition - can be a simple string or object with key/header
 */
export type FieldDef = string | {
    key: string;
    header?: string;
};
export interface CardGridProps extends EntityDisplayProps {
    /** Minimum width of each card (default: 280px) */
    minCardWidth?: number;
    /** Maximum number of columns */
    maxCols?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Gap between cards */
    gap?: CardGridGap;
    /** Align cards vertically in their cells */
    alignItems?: 'start' | 'center' | 'end' | 'stretch';
    /** Children elements (cards) - optional when using entity/data props */
    children?: React.ReactNode;
    /** Fields to display - accepts string[] or {key, header}[] for unified interface */
    fields?: readonly FieldDef[];
    /** Alias for fields - backwards compatibility */
    fieldNames?: readonly string[];
    /** Alias for fields - backwards compatibility */
    columns?: readonly FieldDef[];
    /** Actions for each card item (schema-driven) */
    itemActions?: readonly CardItemAction[];
    /** Show total count in pagination */
    showTotal?: boolean;
}
/**
 * CardGrid - Responsive card collection layout
 *
 * Can be used in two ways:
 * 1. With children: <CardGrid><Card>...</Card></CardGrid>
 * 2. With data: <CardGrid entity="Task" fieldNames={['title']} data={tasks} />
 *
 * All data comes from the `data` prop. Pagination display hints come from
 * `page`, `pageSize`, and `totalCount` props (set by the trait via render-ui).
 */
export declare const CardGrid: React.FC<CardGridProps>;
