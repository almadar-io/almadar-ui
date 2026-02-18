import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardGrid } from './CardGrid';

const meta: Meta<typeof CardGrid> = {
    title: 'Organisms/CardGrid',
    component: CardGrid,
    parameters: {
        layout: 'padded',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
    { id: '1', title: 'Project Alpha', status: 'active', owner: 'Alice' },
    { id: '2', title: 'Project Beta', status: 'pending', owner: 'Bob' },
    { id: '3', title: 'Project Gamma', status: 'complete', owner: 'Carol' },
    { id: '4', title: 'Project Delta', status: 'active', owner: 'Dave' },
    { id: '5', title: 'Project Epsilon', status: 'pending', owner: 'Eve' },
    { id: '6', title: 'Project Zeta', status: 'complete', owner: 'Frank' },
];

export const Default: Story = {
    args: {
        data: sampleData,
        fields: ['title', 'status', 'owner'],
        entity: 'Project',
    },
};

export const WithActions: Story = {
    args: {
        data: sampleData,
        fields: ['title', 'status'],
        entity: 'Project',
        itemActions: [
            { label: 'View', event: 'VIEW', variant: 'primary' },
            { label: 'Edit', event: 'EDIT', variant: 'secondary' },
        ],
    },
};

export const CustomColumnWidth: Story = {
    args: {
        data: sampleData,
        fields: ['title', 'status', 'owner'],
        entity: 'Project',
        minCardWidth: 200,
        maxCols: 3,
        gap: 'lg',
    },
};

export const Loading: Story = {
    args: {
        entity: 'Project',
        fields: ['title', 'status'],
        isLoading: true,
    },
};

export const Empty: Story = {
    args: {
        data: [],
        entity: 'Project',
        fields: ['title', 'status'],
    },
};
