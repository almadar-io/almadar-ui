import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { PositionedCanvas, type CanvasItem } from './PositionedCanvas';

const meta: Meta<typeof PositionedCanvas> = {
    title: 'Core/Molecules/PositionedCanvas',
    component: PositionedCanvas,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mixedTables: CanvasItem[] = [
    { id: 't1', label: 'T1', x: 60, y: 60, shape: 'round', capacity: 4, status: 'empty' },
    { id: 't2', label: 'T2', x: 220, y: 60, shape: 'round', capacity: 2, status: 'seated', partySize: 2, serverName: 'Maya' },
    { id: 't3', label: 'T3', x: 380, y: 60, shape: 'square', capacity: 4, status: 'ordered', partySize: 3, serverName: 'Jon' },
    { id: 't4', label: 'T4', x: 540, y: 60, shape: 'square', capacity: 4, status: 'awaiting-bill', partySize: 4, serverName: 'Lin' },
    { id: 'b1', label: 'B-1', x: 60, y: 240, shape: 'rectangle', capacity: 6, status: 'seated', partySize: 5, serverName: 'Maya' },
    { id: 'b2', label: 'B-2', x: 280, y: 240, shape: 'rectangle', capacity: 6, status: 'cleaning' },
    { id: 'b3', label: 'B-3', x: 500, y: 240, shape: 'rectangle', capacity: 8, status: 'empty' },
    { id: 't5', label: 'T5', x: 60, y: 400, shape: 'round', capacity: 2, status: 'empty' },
    { id: 't6', label: 'T6', x: 220, y: 400, shape: 'round', capacity: 2, status: 'seated', partySize: 1, serverName: 'Jon' },
];

export const Default: Story = {
    args: {
        items: mixedTables,
        width: 800,
        height: 600,
    },
};

export const AllEmpty: Story = {
    args: {
        items: [
            { id: 't1', label: 'T1', x: 60, y: 60, shape: 'round', capacity: 4 },
            { id: 't2', label: 'T2', x: 220, y: 60, shape: 'round', capacity: 4 },
            { id: 't3', label: 'T3', x: 380, y: 60, shape: 'square', capacity: 4 },
            { id: 't4', label: 'T4', x: 540, y: 60, shape: 'square', capacity: 6 },
            { id: 'b1', label: 'B-1', x: 60, y: 240, shape: 'rectangle', capacity: 6 },
            { id: 'b2', label: 'B-2', x: 280, y: 240, shape: 'rectangle', capacity: 6 },
        ],
        width: 800,
        height: 600,
    },
};

export const BusyEvening: Story = {
    args: {
        items: [
            { id: 't1', label: 'T1', x: 60, y: 60, shape: 'round', capacity: 4, status: 'seated', partySize: 4, serverName: 'Maya' },
            { id: 't2', label: 'T2', x: 220, y: 60, shape: 'round', capacity: 2, status: 'ordered', partySize: 2, serverName: 'Jon' },
            { id: 't3', label: 'T3', x: 380, y: 60, shape: 'square', capacity: 4, status: 'ordered', partySize: 3, serverName: 'Jon' },
            { id: 't4', label: 'T4', x: 540, y: 60, shape: 'square', capacity: 4, status: 'awaiting-bill', partySize: 4, serverName: 'Lin' },
            { id: 'b1', label: 'B-1', x: 60, y: 240, shape: 'rectangle', capacity: 6, status: 'seated', partySize: 6, serverName: 'Maya' },
            { id: 'b2', label: 'B-2', x: 280, y: 240, shape: 'rectangle', capacity: 6, status: 'ordered', partySize: 5, serverName: 'Lin' },
            { id: 'b3', label: 'B-3', x: 500, y: 240, shape: 'rectangle', capacity: 8, status: 'seated', partySize: 7, serverName: 'Maya' },
            { id: 't5', label: 'T5', x: 60, y: 400, shape: 'round', capacity: 2, status: 'awaiting-bill', partySize: 2, serverName: 'Jon' },
            { id: 't6', label: 'T6', x: 220, y: 400, shape: 'round', capacity: 2, status: 'empty' },
            { id: 't7', label: 'T7', x: 380, y: 400, shape: 'square', capacity: 4, status: 'cleaning' },
        ],
        width: 800,
        height: 600,
    },
};

export const Editable: Story = {
    render: (args) => {
        const [items, setItems] = useState<CanvasItem[]>(mixedTables);
        return (
            <PositionedCanvas
                {...args}
                items={items}
                editable
                onMove={(id, x, y) => {
                    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, x, y } : t)));
                }}
            />
        );
    },
    args: {
        width: 800,
        height: 600,
    },
};

export const Selected: Story = {
    args: {
        items: mixedTables,
        selectedId: 't3',
        width: 800,
        height: 600,
    },
};

export const DenseLayout: Story = {
    args: {
        items: [
            { id: 't1', label: 'T1', x: 30, y: 30, shape: 'round', capacity: 2, status: 'seated', partySize: 2, serverName: 'Maya' },
            { id: 't2', label: 'T2', x: 170, y: 30, shape: 'round', capacity: 2, status: 'empty' },
            { id: 't3', label: 'T3', x: 310, y: 30, shape: 'round', capacity: 2, status: 'ordered', partySize: 2, serverName: 'Jon' },
            { id: 't4', label: 'T4', x: 450, y: 30, shape: 'round', capacity: 2, status: 'seated', partySize: 1, serverName: 'Lin' },
            { id: 't5', label: 'T5', x: 590, y: 30, shape: 'square', capacity: 4, status: 'awaiting-bill', partySize: 4, serverName: 'Maya' },
            { id: 't6', label: 'T6', x: 30, y: 170, shape: 'round', capacity: 4, status: 'cleaning' },
            { id: 't7', label: 'T7', x: 170, y: 170, shape: 'round', capacity: 4, status: 'seated', partySize: 3, serverName: 'Jon' },
            { id: 't8', label: 'T8', x: 310, y: 170, shape: 'square', capacity: 4, status: 'ordered', partySize: 4, serverName: 'Lin' },
            { id: 't9', label: 'T9', x: 450, y: 170, shape: 'square', capacity: 4, status: 'empty' },
            { id: 't10', label: 'T10', x: 590, y: 170, shape: 'square', capacity: 4, status: 'seated', partySize: 4, serverName: 'Maya' },
            { id: 'b1', label: 'B-1', x: 30, y: 320, shape: 'rectangle', capacity: 6, status: 'seated', partySize: 5, serverName: 'Lin' },
            { id: 'b2', label: 'B-2', x: 220, y: 320, shape: 'rectangle', capacity: 6, status: 'ordered', partySize: 6, serverName: 'Jon' },
            { id: 'b3', label: 'B-3', x: 410, y: 320, shape: 'rectangle', capacity: 8, status: 'awaiting-bill', partySize: 8, serverName: 'Maya' },
            { id: 'b4', label: 'B-4', x: 600, y: 320, shape: 'rectangle', capacity: 8, status: 'empty' },
            { id: 't11', label: 'T11', x: 30, y: 470, shape: 'round', capacity: 2, status: 'seated', partySize: 2, serverName: 'Lin' },
            { id: 't12', label: 'T12', x: 170, y: 470, shape: 'round', capacity: 2, status: 'cleaning' },
            { id: 't13', label: 'T13', x: 310, y: 470, shape: 'square', capacity: 4, status: 'empty' },
            { id: 't14', label: 'T14', x: 450, y: 470, shape: 'square', capacity: 4, status: 'ordered', partySize: 3, serverName: 'Jon' },
            { id: 't15', label: 'T15', x: 590, y: 470, shape: 'round', capacity: 2, status: 'seated', partySize: 2, serverName: 'Maya' },
        ],
        width: 800,
        height: 600,
    },
};
